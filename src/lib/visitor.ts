/**
 * Who you are in the room — a random "adjective animal" name like "tired koala"
 * plus an anonymous id. Both live in this browser's localStorage and nowhere
 * else, so the name sticks between visits but never identifies anyone.
 */

const ID_KEY = "crux:visitorId";
const NAME_KEY = "crux:visitorName";

export const ADJECTIVES = [
  "tired", "calm", "sleepy", "steady", "quiet", "gentle", "brave", "patient",
  "warm", "cosy", "mellow", "drowsy", "hopeful", "sturdy", "easygoing", "kind",
  "thoughtful", "restless", "dusty", "salty", "sunny", "foggy", "mossy", "weary",
  "chilled", "soft", "stubborn", "curious", "wandering", "humble", "rusty",
  "misty", "sandy", "breezy", "slow", "early", "late", "lucky", "wise", "shy",
] as const;

export const ANIMALS = [
  "koala", "wombat", "kookaburra", "platypus", "echidna", "quokka", "dingo",
  "bilby", "numbat", "cassowary", "emu", "galah", "magpie", "wallaby", "kangaroo",
  "possum", "sugar glider", "goanna", "cockatoo", "lorikeet", "pelican", "penguin",
  "seal", "turtle", "frogmouth", "bandicoot", "bettong", "lyrebird", "brolga",
  "dugong", "wobbegong", "bluetongue", "currawong", "rosella", "quoll",
] as const;

export interface Visitor {
  id: string;
  name: string;
}

// Used when localStorage is blocked (private mode, cleared data) so the room
// still works for this page load.
let memoryVisitor: Visitor | null = null;

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function randomName(): string {
  return `${pick(ADJECTIVES)} ${pick(ANIMALS)}`;
}

/** Names are lower-case words only; anything else is rejected before it is sent. */
export function isValidName(name: string): boolean {
  return /^[a-z][a-z -]{2,39}$/.test(name);
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  // Very old browsers: good enough for an anonymous id.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage blocked; the in-memory copy carries this page load.
  }
}

/** The current visitor, created on first call. `null` during server rendering. */
export function getVisitor(): Visitor | null {
  if (typeof window === "undefined") return null;
  if (memoryVisitor) return memoryVisitor;

  let id = read(ID_KEY);
  if (!id) {
    id = randomId();
    write(ID_KEY, id);
  }
  let name = read(NAME_KEY);
  if (!name || !isValidName(name)) {
    name = randomName();
    write(NAME_KEY, name);
  }
  memoryVisitor = { id, name };
  return memoryVisitor;
}

/** Roll a new name, keeping the same anonymous id. */
export function renameVisitor(): Visitor | null {
  const current = getVisitor();
  if (!current) return null;
  let name = randomName();
  while (name === current.name) name = randomName();
  write(NAME_KEY, name);
  memoryVisitor = { id: current.id, name };
  return memoryVisitor;
}
