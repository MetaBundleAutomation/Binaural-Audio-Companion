// The four brain parts the "Your Brain" section is built around. Shared by the
// BrainMap, the loop diagram and the quiz so names and colours can't drift apart.
// `pos` is a % of the limbic-system image's width/height, so a marker lands in
// the right spot no matter what size the image is shown at.
export interface BrainPart {
  id: "alarm" | "clerk" | "supervisor" | "line";
  nickname: string;
  realName: string;
  job: string;
  where: string;
  color: string;
  pos: { x: number; y: number };
  partNumber: "02" | "03" | "04" | "05";
}

export type BrainPartId = BrainPart["id"];

export const BRAIN_PARTS: BrainPart[] = [
  {
    id: "alarm",
    nickname: "The smoke alarm",
    realName: "Amygdala",
    job: "Spots danger fast. Doesn't think — just goes off.",
    where:
      "Put two fingers on your temple, just in front of your ear. It's in about that deep — and it's roughly the size of an almond.",
    color: "#C97B5A",
    pos: { x: 38.9, y: 60.0 },
    partNumber: "02",
  },
  {
    id: "clerk",
    nickname: "The filing clerk",
    realName: "Hippocampus",
    job: "Stamps memories with a date and a place, so you know that was then.",
    where:
      "Just behind the alarm and a little lower, curled around it. Same depth — about level with your ear.",
    color: "#4BA8BD",
    pos: { x: 61.1, y: 52.1 },
    partNumber: "03",
  },
  {
    id: "supervisor",
    nickname: "The calm supervisor",
    realName: "Prefrontal cortex",
    job: "Plans, weighs things up, and turns the alarm down. Goes quiet under stress.",
    where:
      "Flat of your hand on your forehead. It's right there behind it — the front of the brain, closest to the world.",
    color: "#4FA98C",
    pos: { x: 12.9, y: 38.1 },
    partNumber: "04",
  },
  {
    id: "line",
    nickname: "The phone line",
    realName: "Cingulum",
    job: "The wiring that lets the other three talk to each other.",
    where:
      "Running over the top, front to back — roughly under where a cap's seam would sit. It joins the other three together.",
    color: "#8C9BAA",
    pos: { x: 42.9, y: 23.5 },
    partNumber: "05",
  },
];

/** Colour by part id, for places that only need the colour (loop diagram, etc.). */
export const BRAIN_PART_COLOR = Object.fromEntries(
  BRAIN_PARTS.map((part) => [part.id, part.color]),
) as Record<BrainPartId, string>;
