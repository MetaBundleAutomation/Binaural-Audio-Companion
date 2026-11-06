import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { NextResponse } from "next/server";
import { z } from "zod";
import { GUIDE_LIMITS, guideFeatures, safetyAnswer, type GuideAnswer } from "@/lib/guide";
import { guideSystemPrompt } from "@/lib/guidePrompt";

/**
 * Ask CRUX, AI mode.
 *
 *   GET  → { ai: boolean }   whether an AI key is configured on this deploy
 *   POST → GuideAnswer       the guide's reply to a short conversation
 *
 * With no ANTHROPIC_API_KEY the guide still works: the page answers on the
 * device with the matcher in `src/lib/guide.ts` and never calls POST.
 *
 * What this route is careful about:
 *   - Nothing a person types is logged or stored here. The conversation is
 *     sent to the AI provider to get one answer, and that is all.
 *   - A message that suggests someone is in danger is answered with the crisis
 *     numbers before any AI call is made.
 *   - The AI can only point at library ids that exist; anything else is dropped.
 *   - Any failure (no key, rate limit, refusal, timeout, malformed output)
 *     returns an error status and the page falls back to the on-device answer.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
// Run close to the people using it.
export const preferredRegion = "syd1";

const MODEL = "claude-opus-5-5";

const aiEnabled = () => Boolean(process.env.ANTHROPIC_API_KEY);

const RequestSchema = z.object({
  turns: z
    .array(
      z.object({
        role: z.enum(["user", "guide"]),
        text: z.string().trim().min(1).max(GUIDE_LIMITS.replyChars + 100),
      }),
    )
    .min(1)
    .max(GUIDE_LIMITS.turns),
});

const ReplySchema = z.object({
  reply: z.string().describe("What to say to the person: two to four short plain sentences."),
  feature_ids: z.array(z.string()).describe("Ids of up to three library items, most useful first. Empty if nothing fits."),
  crisis: z.boolean().describe("True if the person may be in danger and the crisis phone numbers should be shown."),
});

// ── Rate limit ───────────────────────────────────────────────────────────────
// Best effort only: this memory is per server instance, so it slows down one
// noisy visitor but is not a spending cap. The real caps are the spend limit on
// the AI account and a firewall rule on this path (see docs/handover.md).
const WINDOW_MS = 60_000;
const PER_VISITOR = 8;
const PER_INSTANCE = 120;
const hits = new Map<string, number[]>();
let instanceHits: number[] = [];

function allow(visitor: string): boolean {
  const now = Date.now();
  const recent = (list: number[]) => list.filter((t) => now - t < WINDOW_MS);

  instanceHits = recent(instanceHits);
  if (instanceHits.length >= PER_INSTANCE) return false;

  const mine = recent(hits.get(visitor) ?? []);
  if (mine.length >= PER_VISITOR) {
    hits.set(visitor, mine);
    return false;
  }
  mine.push(now);
  hits.set(visitor, mine);
  instanceHits.push(now);

  // Keep the map from growing without bound.
  if (hits.size > 5000) {
    for (const [key, list] of hits) if (recent(list).length === 0) hits.delete(key);
  }
  return true;
}

function visitorKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

const fail = (status: number, error: string) =>
  NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

export function GET() {
  return NextResponse.json({ ai: aiEnabled() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!aiEnabled()) return fail(503, "ai_off");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "bad_request");
  }
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) return fail(400, "bad_request");

  const { turns } = parsed.data;
  const last = turns[turns.length - 1];
  if (last.role !== "user" || last.text.length > GUIDE_LIMITS.messageChars) return fail(400, "bad_request");

  // Danger first, and without sending the message anywhere.
  const safety = safetyAnswer(last.text, "ai");
  if (safety) return NextResponse.json(safety, { headers: { "Cache-Control": "no-store" } });

  if (!allow(visitorKey(request))) return fail(429, "busy");

  const features = guideFeatures();
  const known = new Set(features.map((f) => f.id));

  // The conversation must open with the person, so drop any leading guide turns.
  const firstUser = turns.findIndex((t) => t.role === "user");
  const messages: Anthropic.Beta.BetaMessageParam[] = turns.slice(firstUser).map((t) => ({
    role: t.role === "user" ? "user" : "assistant",
    content: t.text,
  }));

  // One attempt, bounded: if it is slow or fails, the page answers on the device.
  const client = new Anthropic({ timeout: 20_000, maxRetries: 0 });

  try {
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      // If a safety filter declines the request, retry it on the model Anthropic
      // recommends for that case instead of failing.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [{ type: "text", text: guideSystemPrompt(features), cache_control: { type: "ephemeral" } }],
      messages,
      // A short routing answer: low effort keeps it quick and cheap.
      output_config: { effort: "low", format: betaZodOutputFormat(ReplySchema) },
    });

    if (response.stop_reason !== "end_turn" || !response.parsed_output) return fail(502, "no_answer");

    const out = response.parsed_output;
    const reply = out.reply.trim().slice(0, GUIDE_LIMITS.replyChars);
    if (!reply) return fail(502, "no_answer");

    const featureIds = out.crisis
      ? []
      : [...new Set(out.feature_ids)].filter((id) => known.has(id)).slice(0, GUIDE_LIMITS.picks);

    const answer: GuideAnswer = { reply, featureIds, crisis: out.crisis, source: "ai" };
    return NextResponse.json(answer, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    // Statuses only: never the person's words.
    if (error instanceof Anthropic.RateLimitError) return fail(429, "busy");
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("[guide] the AI key was rejected");
      return fail(503, "ai_off");
    }
    if (error instanceof Anthropic.APIConnectionError) return fail(504, "timeout");
    if (error instanceof Anthropic.APIError) {
      console.error(`[guide] AI request failed with status ${error.status}`);
      return fail(502, "no_answer");
    }
    console.error("[guide] unexpected failure");
    return fail(500, "no_answer");
  }
}
