"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import type {
  RealtimeChannel,
  RealtimePostgresInsertPayload,
} from "@supabase/supabase-js";
import {
  getSupabase,
  isSupabaseConfigured,
  ROOM_CHANNEL,
  type RoomMessage,
} from "@/lib/supabase";
import { getVisitor, renameVisitor, type Visitor } from "@/lib/visitor";
import {
  CRISIS_LINES,
  MAX_MESSAGE_LENGTH,
  MESSAGE_COOLDOWN_MS,
  ROOM_RULES,
  cleanMessage,
  looksLikeCrisis,
} from "@/lib/roomRules";

/**
 * The room — a live-stream-style chat for whoever is up right now.
 *
 * One realtime channel lives for as long as this component is mounted, so the
 * collapsed card can show how many people are in. You only count as "here"
 * (presence `track`) while you have joined; leaving the room untracks you, and
 * unmounting removes the channel. Messages arrive over the same channel and
 * are kept in memory only — the database hides anything older than 24 hours.
 */

const OPEN_KEY = "crux:roomOpen";
const HIDDEN_KEY = "crux:roomHidden";

const MAX_KEPT = 150;
const HISTORY_LIMIT = 100;
/** Within this many pixels of the bottom counts as "reading the latest". */
const NEAR_BOTTOM_PX = 80;
/** The character counter only appears once a message gets long. */
const COUNTER_FROM = 200;

// Hashed from the name, so a person keeps the same colour for the whole visit
// and the same name reads the same on every screen. All five sit on the dark
// card backgrounds in every theme.
const NAME_COLOURS = [
  "#C97B5A",
  "#4BA8BD",
  "#4FA98C",
  "#8C9BAA",
  "var(--primary-light)",
] as const;

const LIVE_DOT = "#4FA98C";

const PRIMARY_BUTTON =
  "inline-flex items-center justify-center min-h-12 px-6 py-3 rounded-full text-[15px] font-bold text-white bg-[var(--primary-dark)] hover:bg-[var(--primary)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--primary-dark)]";
const SMALL_SECONDARY_BUTTON =
  "inline-flex items-center justify-center min-h-12 px-4 py-2 rounded-full text-[14px] font-semibold text-[var(--text-primary)] bg-[var(--background-card)] border border-[var(--border-color)] hover:border-[var(--primary)] transition-all cursor-pointer";
// Looks like a word, taps like a button: the hit area is 48px tall even though
// the text is tiny.
const TINY_BUTTON =
  "inline-flex items-center justify-center min-h-12 px-2.5 rounded-full text-[12px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer disabled:cursor-default disabled:hover:text-[var(--text-secondary)]";
const PILL_LINK =
  "inline-flex items-center min-h-12 px-4 rounded-full text-[14px] font-semibold text-[var(--text-primary)] bg-[var(--background-light)] border border-[var(--border-color)] hover:border-[var(--primary)] transition-all";

const NOTE_REDACTED = "Links, emails and numbers are removed to keep everyone safe.";
const NOTE_SLOW_DOWN = "Slow down a little.";
const NOTE_FAILED = "That didn't send. Try again.";

type Connection = "connecting" | "live" | "reconnecting";
type HistoryState = "idle" | "loading" | "ready" | "failed";
type ReportStatus = "sending" | "sent" | "failed";

// ── Small pure helpers ───────────────────────────────────────────────────────

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage blocked (private mode, cleared data): the choice lasts this visit only.
  }
}

function readHiddenNames(): string[] {
  const raw = readStorage(HIDDEN_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((n): n is string => typeof n === "string")
      : [];
  } catch {
    return [];
  }
}

function nameColour(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return NAME_COLOURS[hash % NAME_COLOURS.length];
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Accept a row only when it has the shape we render; anything else is dropped. */
function asMessage(raw: unknown): RoomMessage | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (
    typeof r.id !== "number" ||
    typeof r.visitor_id !== "string" ||
    typeof r.name !== "string" ||
    typeof r.body !== "string" ||
    typeof r.created_at !== "string"
  ) {
    return null;
  }
  return {
    id: r.id,
    visitor_id: r.visitor_id,
    name: r.name,
    body: r.body,
    created_at: r.created_at,
  };
}

/** Combine two lists, dedupe by id, oldest first, and keep only the newest. */
function mergeMessages(a: RoomMessage[], b: RoomMessage[]): RoomMessage[] {
  const byId = new Map<number, RoomMessage>();
  for (const m of a) byId.set(m.id, m);
  for (const m of b) byId.set(m.id, m);
  return [...byId.values()].sort((x, y) => x.id - y.id).slice(-MAX_KEPT);
}

/** How many different people are in: distinct visitor ids across every presence. */
function countPresent(channel: RealtimeChannel): number {
  const ids = new Set<string>();
  const state = channel.presenceState<{ id?: unknown }>();
  for (const key of Object.keys(state)) {
    for (const presence of state[key]) {
      if (typeof presence.id === "string") ids.add(presence.id);
    }
  }
  return ids.size;
}

function countLine(count: number | null, open: boolean): string {
  if (count === null) return "Checking who's here…";
  if (open) return count <= 1 ? "Just you so far" : `${count} here now`;
  if (count === 0) return "Quiet in here right now";
  return `${count} here now`;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// True on the client after hydration, false on the server and during the
// hydration render itself, so the first client render matches the server.
const subscribeToNothing = () => () => {};
function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

// ── Pieces ───────────────────────────────────────────────────────────────────

function CrisisLinks({ withDetail }: { withDetail: boolean }) {
  return (
    <>
      {CRISIS_LINES.map((line) => (
        <a key={line.tel} href={`tel:${line.tel}`} className={PILL_LINK}>
          {line.name}
          {line.number !== line.name && (
            <span className="ml-1.5 font-normal text-[var(--text-secondary)]">
              {line.number}
            </span>
          )}
          {withDetail ? (
            <span className="ml-1.5 font-normal text-[var(--text-secondary)]">
              ({line.detail})
            </span>
          ) : (
            <span className="sr-only">, {line.detail}</span>
          )}
        </a>
      ))}
    </>
  );
}

function MessageRow({
  message,
  own,
  reportStatus,
  onHide,
  onReport,
}: {
  message: RoomMessage;
  own: boolean;
  reportStatus: ReportStatus | undefined;
  onHide: () => void;
  onReport: () => void;
}) {
  const reportLabel =
    reportStatus === "sent"
      ? "Reported, thanks"
      : reportStatus === "sending"
        ? "Reporting…"
        : reportStatus === "failed"
          ? "Report (try again)"
          : "Report";

  return (
    <li className="min-w-0 border-b border-[var(--border-color)] last:border-b-0">
      <div className="flex flex-wrap items-center gap-x-2 min-w-0">
        <span
          className="text-[14px] font-bold"
          style={{ color: nameColour(message.name) }}
        >
          {message.name}
        </span>
        {own && (
          <span className="px-1.5 py-px rounded-md text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] border border-[var(--border-color)]">
            you
          </span>
        )}
        <time
          dateTime={message.created_at}
          className="text-[12px] text-[var(--text-secondary)]"
        >
          {formatTime(message.created_at)}
        </time>
        {!own && (
          <span className="ml-auto flex items-center">
            <button type="button" onClick={onHide} className={TINY_BUTTON}>
              Hide
            </button>
            <button
              type="button"
              onClick={onReport}
              disabled={reportStatus === "sent" || reportStatus === "sending"}
              className={TINY_BUTTON}
            >
              {reportLabel}
            </button>
          </span>
        )}
      </div>
      <p
        className={`text-[15px] leading-relaxed text-[var(--text-primary)] [overflow-wrap:anywhere] pb-2.5 ${own ? "pt-1" : ""}`}
      >
        {message.body}
      </p>
    </li>
  );
}

// ── The component ────────────────────────────────────────────────────────────

export default function LiveChat() {
  const isClient = useIsClient();
  // `getSupabase()` is null on the server but not in the browser, so the
  // render is gated on the build-time flag (same on both sides) and the client
  // itself only drives effects and handlers.
  const db = isClient ? getSupabase() : null;
  const unavailable = !isSupabaseConfigured || (isClient && !db);

  const [open, setOpen] = useState(false);
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);

  const [count, setCount] = useState<number | null>(null);
  const [connection, setConnection] = useState<Connection>("connecting");
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [history, setHistory] = useState<HistoryState>("idle");
  const [reports, setReports] = useState<Record<number, ReportStatus>>({});

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [coolingDown, setCoolingDown] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [showCrisis, setShowCrisis] = useState(false);
  const [hasNew, setHasNew] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const joinedRef = useRef(false);
  const trackedRef = useRef(false);
  const openRef = useRef(false);
  const visitorRef = useRef<Visitor | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const seenIdRef = useRef<number | null>(null);

  // Who you are, who you've hidden, and whether you were in the room last time.
  useEffect(() => {
    setVisitor(getVisitor());
    setHidden(readHiddenNames());
    if (readStorage(OPEN_KEY) === "1") setOpen(true);
  }, []);

  // Presence is best-effort: you're "here" while the room is open, and the
  // payload follows your name. Safe to call at any time.
  const syncPresence = useCallback(() => {
    const channel = channelRef.current;
    const who = visitorRef.current;
    if (!channel || !joinedRef.current) return;
    try {
      if (openRef.current && who) {
        trackedRef.current = true;
        void channel.track({ id: who.id, name: who.name }).catch(() => undefined);
      } else if (trackedRef.current) {
        trackedRef.current = false;
        void channel.untrack().catch(() => undefined);
      }
    } catch {
      // Presence failing never takes the room down.
    }
  }, []);

  useEffect(() => {
    openRef.current = open;
    visitorRef.current = visitor;
    syncPresence();
  }, [open, visitor, syncPresence]);

  // The channel: new messages and who's here, for as long as we're on the page.
  useEffect(() => {
    if (!db) return;
    let cancelled = false;
    let channel: RealtimeChannel | null = null;
    const topic = `realtime:${ROOM_CHANNEL}`;

    async function connect() {
      if (!db) return;
      // A channel from an earlier mount (React Strict Mode, or coming straight
      // back to this page) may still be saying goodbye. The client hands back
      // the same object for the same topic and subscribe() is a no-op on it,
      // so wait for it to clear before opening a fresh one.
      for (let i = 0; i < 150 && db.getChannels().some((c) => c.topic === topic); i++) {
        await sleep(100);
        if (cancelled) return;
      }
      if (cancelled) return;

      const ch = db.channel(ROOM_CHANNEL);
      channel = ch;
      channelRef.current = ch;

      const onSubscribed = () => {
        joinedRef.current = true;
        trackedRef.current = false;
        setConnection("live");
        setCount(countPresent(ch));
        syncPresence();
      };

      ch.on("presence", { event: "sync" }, () => {
        if (!cancelled) setCount(countPresent(ch));
      })
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          (payload: RealtimePostgresInsertPayload<RoomMessage>) => {
            if (cancelled) return;
            const incoming = asMessage(payload.new);
            if (!incoming) return;
            setMessages((prev) =>
              prev.some((m) => m.id === incoming.id)
                ? prev
                : [...prev, incoming].slice(-MAX_KEPT),
            );
          },
        )
        .subscribe((status) => {
          if (cancelled) return;
          if (status === "SUBSCRIBED") {
            onSubscribed();
            return;
          }
          // CHANNEL_ERROR, TIMED_OUT and CLOSED: the client retries on its own.
          joinedRef.current = false;
          trackedRef.current = false;
          setConnection("reconnecting");
        });

      // Already joined by something else on the page: no callback is coming.
      if (ch.state === "joined") onSubscribed();
    }

    void connect();

    return () => {
      cancelled = true;
      joinedRef.current = false;
      trackedRef.current = false;
      channelRef.current = null;
      if (channel) void db.removeChannel(channel).catch(() => undefined);
    };
  }, [db, syncPresence]);

  // Earlier messages, fetched each time the room is opened.
  useEffect(() => {
    if (!open || !db) return;
    let cancelled = false;
    setHistory("loading");

    async function load() {
      if (!db) return;
      try {
        const { data, error } = await db
          .from("messages")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(HISTORY_LIMIT);
        if (cancelled) return;
        if (error || !data) {
          setHistory("failed");
          return;
        }
        const rows = (data as unknown[])
          .map(asMessage)
          .filter((m): m is RoomMessage => m !== null)
          .reverse();
        setMessages((prev) => mergeMessages(prev, rows));
        setHistory("ready");
      } catch {
        if (!cancelled) setHistory("failed");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, db]);

  // The gap after a send. The server enforces its own limit as well.
  useEffect(() => {
    if (!coolingDown) return;
    const timer = setTimeout(() => setCoolingDown(false), MESSAGE_COOLDOWN_MS);
    return () => clearTimeout(timer);
  }, [coolingDown]);

  const visible = hidden.length
    ? messages.filter((m) => !hidden.includes(m.name))
    : messages;
  const last = visible.length ? visible[visible.length - 1] : null;
  const lastId = last ? last.id : null;
  const lastIsOwn = !!last && !!visitor && last.visitor_id === visitor.id;

  // Follow the conversation only when the person is already at the bottom (or
  // just spoke). Otherwise leave them where they are and offer a way down.
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el || !open || lastId === null) return;
    if (nearBottomRef.current || lastIsOwn) {
      el.scrollTop = el.scrollHeight;
      setHasNew(false);
    } else if (seenIdRef.current === null || lastId > seenIdRef.current) {
      setHasNew(true);
    }
    seenIdRef.current = lastId;
  }, [open, lastId, lastIsOwn]);

  function onListScroll() {
    const el = listRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    nearBottomRef.current = near;
    if (near) setHasNew(false);
  }

  function scrollToBottom() {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    nearBottomRef.current = true;
    setHasNew(false);
  }

  function join() {
    nearBottomRef.current = true;
    seenIdRef.current = null;
    setHasNew(false);
    setNote(null);
    setOpen(true);
    writeStorage(OPEN_KEY, "1");
  }

  function leave() {
    setOpen(false);
    setShowCrisis(false);
    setNote(null);
    writeStorage(OPEN_KEY, "0");
  }

  function newName() {
    const renamed = renameVisitor();
    if (renamed) setVisitor(renamed);
  }

  function hideName(name: string) {
    if (hidden.includes(name)) return;
    const next = [...hidden, name];
    setHidden(next);
    writeStorage(HIDDEN_KEY, JSON.stringify(next));
  }

  function unhideAll() {
    setHidden([]);
    writeStorage(HIDDEN_KEY, "[]");
  }

  async function report(messageId: number) {
    if (!db || !visitor) return;
    const current = reports[messageId];
    if (current === "sent" || current === "sending") return;
    setReports((prev) => ({ ...prev, [messageId]: "sending" }));
    try {
      const { error } = await db
        .from("reports")
        .insert({ message_id: messageId, reporter_id: visitor.id });
      // 23505 = already reported by this person; that still counts.
      const ok = !error || error.code === "23505";
      setReports((prev) => ({ ...prev, [messageId]: ok ? "sent" : "failed" }));
    } catch {
      setReports((prev) => ({ ...prev, [messageId]: "failed" }));
    }
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!db || !visitor || sending || coolingDown) return;

    const { body, empty, redacted } = cleanMessage(draft);
    if (empty) return;
    setNote(redacted ? NOTE_REDACTED : null);
    setSending(true);
    try {
      const { error } = await db
        .from("messages")
        .insert({ visitor_id: visitor.id, name: visitor.name, body });
      if (error) {
        setNote(/slow down/i.test(error.message) ? NOTE_SLOW_DOWN : NOTE_FAILED);
        return;
      }
      setDraft("");
      setCoolingDown(true);
      if (looksLikeCrisis(body)) setShowCrisis(true);
    } catch {
      setNote(NOTE_FAILED);
    } finally {
      setSending(false);
    }
  }

  const sendLabel = coolingDown ? "One moment…" : sending ? "Sending…" : "Send";
  const canSend = !sending && !coolingDown && draft.trim().length > 0;

  return (
    <section
      id="room"
      className="my-16 scroll-mt-24 rounded-3xl p-5 sm:p-8 border border-[var(--border-color)] bg-[var(--background-card)]"
      style={{ boxShadow: "var(--shadow-lg)" }}
    >
      <h2 className="text-[26px] md:text-[32px] font-bold mb-2 tracking-tight text-[var(--text-primary)] text-center">
        The room
      </h2>

      {unavailable ? (
        <p className="text-center text-[15px] text-[var(--text-secondary)]">
          The room opens soon.
        </p>
      ) : (
        <>
          <p className="flex items-center justify-center gap-2 text-[15px] font-semibold text-[var(--text-primary)]">
            {connection === "live" && (
              <span
                className="inline-block w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: LIVE_DOT }}
                aria-hidden="true"
              />
            )}
            {countLine(count, open)}
          </p>
          <p className="text-center text-[15px] text-[var(--text-secondary)] mt-1 mb-6 text-balance">
            Say hello to whoever&apos;s up. No accounts, nothing kept past 24 hours.
          </p>

          {open && visitor ? (
            <div className="flex flex-col gap-5">
              {/* Who you are */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[15px] text-[var(--text-primary)]">
                  You&apos;re in as{" "}
                  <strong style={{ color: nameColour(visitor.name) }}>
                    {visitor.name}
                  </strong>
                </p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={newName} className={SMALL_SECONDARY_BUTTON}>
                    New name
                  </button>
                  <button type="button" onClick={leave} className={SMALL_SECONDARY_BUTTON}>
                    Leave the room
                  </button>
                </div>
              </div>

              {/* House rules */}
              <ul className="list-disc pl-5 flex flex-col gap-0.5 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                {ROOM_RULES.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>

              {/* Always within reach while the room is open */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                  If things are bad right now:
                </span>
                <CrisisLinks withDetail={false} />
              </div>

              {/* The conversation */}
              <div className="relative">
                <div
                  ref={listRef}
                  role="log"
                  aria-live="polite"
                  aria-label="Messages"
                  tabIndex={0}
                  onScroll={onListScroll}
                  className="max-h-[60vh] min-h-[280px] overflow-y-auto overscroll-contain rounded-2xl px-4 py-2 border border-[var(--border-color)] bg-[var(--background-light)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                >
                  {visible.length === 0 ? (
                    <p className="py-6 text-center text-[15px] text-[var(--text-secondary)]">
                      {history === "loading"
                        ? "Loading…"
                        : history === "failed"
                          ? "Couldn't load earlier messages. New ones will still arrive."
                          : messages.length > 0
                            ? "Everything here is from people you've hidden."
                            : "Nothing yet today. Say hello."}
                    </p>
                  ) : (
                    <ul className="flex flex-col">
                      {history === "failed" && (
                        <li className="py-2 text-[13px] text-[var(--text-secondary)]">
                          Couldn&apos;t load earlier messages. New ones will still arrive.
                        </li>
                      )}
                      {visible.map((message) => (
                        <MessageRow
                          key={message.id}
                          message={message}
                          own={message.visitor_id === visitor.id}
                          reportStatus={reports[message.id]}
                          onHide={() => hideName(message.name)}
                          onReport={() => void report(message.id)}
                        />
                      ))}
                    </ul>
                  )}
                </div>

                {hasNew && (
                  <button
                    type="button"
                    onClick={scrollToBottom}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center justify-center min-h-12 px-5 rounded-full text-[14px] font-bold text-white bg-[var(--primary-dark)] hover:bg-[var(--primary)] transition-all cursor-pointer"
                    style={{ boxShadow: "var(--shadow-lg)" }}
                  >
                    New messages ↓
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[13px] text-[var(--text-secondary)] empty:hidden">
                {connection === "reconnecting" && <span role="status">Reconnecting…</span>}
                {hidden.length > 0 && (
                  <span>
                    {hidden.length === 1 ? "1 person hidden." : `${hidden.length} people hidden.`}{" "}
                    <button
                      type="button"
                      onClick={unhideAll}
                      className="inline-flex items-center min-h-12 underline underline-offset-2 font-semibold text-[var(--text-primary)] hover:text-[var(--primary-light)] transition-all cursor-pointer"
                    >
                      Unhide all
                    </button>
                  </span>
                )}
              </div>

              {/* Shown to the sender only, when their own message sounds like a crisis */}
              {showCrisis && (
                <div
                  role="status"
                  className="rounded-2xl p-4 sm:p-5 border-2 border-[var(--primary)] bg-[var(--background-light)]"
                >
                  <p className="text-[15px] leading-relaxed text-[var(--text-primary)]">
                    It sounds like a lot right now. You&apos;re not on your own
                    &mdash; these lines are open:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <CrisisLinks withDetail />
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setShowCrisis(false)}
                      className={SMALL_SECONDARY_BUTTON}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* Composer */}
              <form onSubmit={send} className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    maxLength={MAX_MESSAGE_LENGTH}
                    aria-label="Your message"
                    autoComplete="off"
                    placeholder="Say something"
                    enterKeyHint="send"
                    className="flex-1 min-w-0 min-h-12 px-4 rounded-full text-[15px] text-[var(--text-primary)] bg-[var(--background-light)] border border-[var(--border-color)] placeholder:text-[var(--text-secondary)] hover:border-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] transition-all"
                  />
                  <button type="submit" disabled={!canSend} className={PRIMARY_BUTTON}>
                    {sendLabel}
                  </button>
                </div>
                <div className="flex items-start justify-between gap-3 min-h-5 text-[13px] text-[var(--text-secondary)]">
                  <span role="status">{note}</span>
                  {draft.length > COUNTER_FROM && (
                    <span className="shrink-0 tabular-nums">
                      {draft.length}/{MAX_MESSAGE_LENGTH}
                    </span>
                  )}
                </div>
              </form>
            </div>
          ) : (
            <div className="flex justify-center">
              <button type="button" onClick={join} className={PRIMARY_BUTTON}>
                Join the room
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
