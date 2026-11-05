import { BRAIN_PART_COLOR } from "@/data/brainParts";

// The loop from part 06, drawn as the circle it is. One set of steps feeds two
// layouts: an SVG ring from `sm` up, and a numbered list below that (the list is
// also what screen readers get at every width, since the ring is aria-hidden).
const STEPS = [
  {
    text: "The alarm fires",
    lines: ["The alarm", "fires"],
    color: BRAIN_PART_COLOR.alarm,
  },
  {
    text: "The clerk can't stamp it “years ago”",
    lines: ["The clerk can't", "stamp it", "“years ago”"],
    color: BRAIN_PART_COLOR.clerk,
  },
  {
    text: "The supervisor is offline; the phone line is poor",
    lines: ["The supervisor is", "offline; the phone", "line is poor"],
    color: BRAIN_PART_COLOR.supervisor,
    accent: BRAIN_PART_COLOR.line,
  },
  {
    text: "The body floods with stress chemicals",
    lines: ["The body floods", "with stress", "chemicals"],
    color: "var(--text-secondary)",
  },
  {
    text: "The alarm reads that as proof it was right",
    lines: ["The alarm reads", "that as proof", "it was right"],
    color: BRAIN_PART_COLOR.alarm,
  },
];

// ─── Ring geometry (SVG viewBox units) ───────────────────────────────────────
// 16-unit text stays above 13px even at the narrowest width the ring shows at.

const VIEW_W = 560;
const VIEW_H = 456;
const CX = 280;
const CY = 250;
const RADIUS = 186;
const NODE_W = 168;
const NODE_H = 88;
const ARROW_GAP = 7;
const FONT_SIZE = 16;
const LINE_HEIGHT = 19;

const toRad = (deg: number) => (deg * Math.PI) / 180;
const pointAt = (deg: number) => ({
  x: CX + RADIUS * Math.cos(toRad(deg)),
  y: CY + RADIUS * Math.sin(toRad(deg)),
});
const round = (n: number) => Number(n.toFixed(1));

// Evenly spaced, clockwise, with step 1 at the top.
const NODES = STEPS.map((step, i) => {
  const angle = -90 + i * (360 / STEPS.length);
  return { ...step, angle, ...pointAt(angle) };
});

function isOverNode(node: (typeof NODES)[number], deg: number) {
  const { x, y } = pointAt(deg);
  return (
    Math.abs(x - node.x) <= NODE_W / 2 + ARROW_GAP &&
    Math.abs(y - node.y) <= NODE_H / 2 + ARROW_GAP
  );
}

// Each arrow follows the ring from the edge of one node to the edge of the next.
const ARROWS = NODES.map((from, i) => {
  const closesLoop = i === NODES.length - 1;
  const to = NODES[(i + 1) % NODES.length];
  const stroke = closesLoop ? 4 : 2.5;
  const headLength = closesLoop ? 15 : 11;
  const headHalfWidth = closesLoop ? 8 : 6;

  let start = from.angle;
  while (isOverNode(from, start)) start += 0.5;
  let end = to.angle + (closesLoop ? 360 : 0);
  while (isOverNode(to, end)) end -= 0.5;

  // Stop the line where the arrowhead begins, so it can't poke through the tip.
  const arcStart = pointAt(start);
  const arcEnd = pointAt(end - (headLength * 180) / (Math.PI * RADIUS));
  const tip = pointAt(end);
  const along = { x: -Math.sin(toRad(end)), y: Math.cos(toRad(end)) };
  const base = {
    x: tip.x - along.x * headLength,
    y: tip.y - along.y * headLength,
  };
  const head = [
    tip,
    { x: base.x - along.y * headHalfWidth, y: base.y + along.x * headHalfWidth },
    { x: base.x + along.y * headHalfWidth, y: base.y - along.x * headHalfWidth },
  ];

  return {
    d: `M ${round(arcStart.x)} ${round(arcStart.y)} A ${RADIUS} ${RADIUS} 0 0 1 ${round(arcEnd.x)} ${round(arcEnd.y)}`,
    head: head.map((p) => `${round(p.x)},${round(p.y)}`).join(" "),
    color: closesLoop ? BRAIN_PART_COLOR.alarm : "var(--text-secondary)",
    stroke,
  };
});

function LoopRing() {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="hidden sm:block w-full max-w-[560px] h-auto mx-auto"
      aria-hidden="true"
    >
      {ARROWS.map((arrow) => (
        <g key={arrow.d}>
          <path
            d={arrow.d}
            fill="none"
            stroke={arrow.color}
            strokeWidth={arrow.stroke}
            strokeLinecap="round"
          />
          <polygon points={arrow.head} fill={arrow.color} />
        </g>
      ))}

      {/* Sits on the outside of the heavy arrow from step 5 back to step 1 */}
      <text
        x={136}
        y={CY - 170}
        textAnchor="end"
        fontSize={FONT_SIZE}
        fontWeight={700}
        fill="var(--text-primary)"
      >
        <tspan x={136}>fires harder</tspan>
        <tspan x={136} dy={LINE_HEIGHT}>
          next time
        </tspan>
      </text>

      {NODES.map((node, i) => {
        const left = node.x - NODE_W / 2;
        const top = node.y - NODE_H / 2;
        // Centre the block of lines in the node (nudged up when it has an accent)
        const firstLine =
          node.y -
          ((node.lines.length - 1) * LINE_HEIGHT) / 2 +
          FONT_SIZE * 0.35 -
          (node.accent ? 4 : 0);

        return (
          <g key={node.text}>
            <rect
              x={round(left)}
              y={round(top)}
              width={NODE_W}
              height={NODE_H}
              rx={14}
              fill="var(--background-card)"
              stroke={node.color}
              strokeWidth={2.5}
            />
            {/* The phone line runs under the supervisor: broken, because it's poor */}
            {node.accent && (
              <line
                x1={round(left + 18)}
                x2={round(left + NODE_W - 18)}
                y1={round(top + NODE_H - 9)}
                y2={round(top + NODE_H - 9)}
                stroke={node.accent}
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray="7 7"
              />
            )}
            <text
              textAnchor="middle"
              fontSize={FONT_SIZE}
              fontWeight={600}
              fill="var(--text-primary)"
            >
              {node.lines.map((line, lineIndex) => (
                <tspan
                  key={line}
                  x={round(node.x)}
                  y={round(firstLine + lineIndex * LINE_HEIGHT)}
                >
                  {line}
                </tspan>
              ))}
            </text>
            <circle
              cx={round(left + 14)}
              cy={round(top)}
              r={13}
              fill="var(--surface-solid)"
              stroke={node.color}
              strokeWidth={2.5}
            />
            <text
              x={round(left + 14)}
              y={round(top + FONT_SIZE * 0.35)}
              textAnchor="middle"
              fontSize={FONT_SIZE}
              fontWeight={700}
              fill="var(--text-primary)"
            >
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DownArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--text-secondary)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 mx-auto my-1"
      aria-hidden="true"
    >
      <path d="M12 4v16M6 14l6 6 6-6" />
    </svg>
  );
}

function LoopList() {
  return (
    <div className="sm:sr-only">
      <ol>
        {STEPS.map((step, i) => (
          <li key={step.text}>
            <div
              className="flex items-center gap-3 rounded-xl border-2 px-3.5 py-3 bg-[var(--background-card)]"
              style={{ borderColor: step.color }}
            >
              <span
                className="w-7 h-7 shrink-0 rounded-full border-2 flex items-center justify-center text-[14px] font-bold text-[var(--text-primary)] bg-[var(--surface-solid)]"
                style={{ borderColor: step.color }}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-[var(--text-primary)]">
                {step.text}
                {step.accent && (
                  <span
                    className="block mt-2 border-b-[3px] border-dashed"
                    style={{ borderColor: step.accent }}
                    aria-hidden="true"
                  />
                )}
              </span>
            </div>
            {i < STEPS.length - 1 && <DownArrow />}
          </li>
        ))}
      </ol>

      <p
        className="mt-2 flex items-center gap-3 rounded-xl border-2 border-dashed px-3.5 py-3 text-[15px] font-bold leading-snug text-[var(--text-primary)]"
        style={{ borderColor: BRAIN_PART_COLOR.alarm }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={BRAIN_PART_COLOR.alarm}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-7 h-7 shrink-0"
          aria-hidden="true"
        >
          <path d="M9 13 4 8l5-5" />
          <path d="M4 8h10a6 6 0 0 1 0 12h-3" />
        </svg>
        Back to step 1 — fires harder next time
      </p>
    </div>
  );
}

export default function LoopDiagram() {
  return (
    <div className="my-2">
      <LoopRing />
      <LoopList />
    </div>
  );
}
