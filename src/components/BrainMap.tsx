"use client";

import { useState } from "react";

// A head in profile facing left, with four parts marked inside the brain.
// The head outline is the point: it tells you which way you're facing and puts
// the brain inside a person, so someone can hold it against their own head.
//
// The long path constants below were generated (profile traced through landmark
// points; brain surface scalloped with a sine to make the folds) and then
// flattened. Don't hand-edit them — nudging one handle pulls the whole shape out.
const PARTS = [
  {
    id: "alarm",
    nickname: "The smoke alarm",
    realName: "Amygdala",
    job: "Spots danger fast. Doesn't think — just goes off.",
    where:
      "Put two fingers on your temple, just in front of your ear. It's in about that deep — and it's roughly the size of an almond.",
    // Warm accent, used ONLY for the alarm so it reads as the loud one.
    color: "#C97B5A",
    shape: <ellipse cx="168" cy="108" rx="10" ry="8" />,
  },
  {
    id: "clerk",
    nickname: "The filing clerk",
    realName: "Hippocampus",
    job: "Stamps memories with a date and a place, so you know that was then.",
    where:
      "Just behind the alarm and a little lower, curled around it. Same depth — about level with your ear.",
    color: "#4BA8BD",
    shape: (
      <path d="M179 113 C186 116, 191 121, 193 127 C195 131, 192 135, 188 132 C184 129, 182 125, 178 121 C175 119, 175 114, 179 113 Z" />
    ),
  },
  {
    id: "supervisor",
    nickname: "The calm supervisor",
    realName: "Prefrontal cortex",
    job: "Plans, weighs things up, and turns the alarm down. Goes quiet under stress.",
    where:
      "Flat of your hand on your forehead. It's right there behind it — the front of the brain, closest to the world.",
    color: "#4FA98C",
    shape: (
      <path d="M146 66 C135 76, 128 90, 129 104 C130 113, 134 121, 142 126 C147 129, 153 127, 152 120 C151 110, 148 103, 149 92 C150 82, 152 74, 149 68 C147 64, 146 64, 146 66 Z" />
    ),
  },
  {
    id: "line",
    nickname: "The phone line",
    realName: "Cingulum",
    job: "The wiring that lets the other three talk to each other.",
    where:
      "Running over the top, front to back — roughly under where a cap's seam would sit. It joins the other three together.",
    color: "#8C9BAA",
    shape: (
      <path
        d="M148 99 C152 76, 174 65, 196 71 C210 75, 218 87, 220 99"
        fill="none"
        strokeWidth="7"
        strokeLinecap="round"
      />
    ),
  },
] as const;

type PartId = (typeof PARTS)[number]["id"];

const HEAD_PATH =
  "M180 18 C173.0 18.3,160.3 18.5,152 21 C143.7 23.5,136.3 27.8,130 33 C123.7 38.2,118.0 45.2,114 52 " +
  "C110.0 58.8,108.0 67.3,106 74 C104.0 80.7,103.0 86.3,102 92 C101.0 97.7,100.7 104.0,100 108 " +
  "C99.3 112.0,99.0 112.7,98 116 C97.0 119.3,95.7 124.0,94 128 C92.3 132.0,90.3 136.3,88 140 " +
  "C85.7 143.7,82.5 147.0,80 150 C77.5 153.0,73.0 156.0,73 158 C73.0 160.0,77.2 161.0,80 162 " +
  "C82.8 163.0,87.8 162.8,90 164 C92.2 165.2,93.3 167.5,93 169 C92.7 170.5,88.2 171.7,88 173 " +
  "C87.8 174.3,92.0 175.5,92 177 C92.0 178.5,88.2 180.0,88 182 C87.8 184.0,89.3 186.5,91 189 " +
  "C92.7 191.5,95.2 194.7,98 197 C100.8 199.3,103.7 201.5,108 203 C112.3 204.5,118.0 206.0,124 206 " +
  "C130.0 206.0,137.7 204.8,144 203 C150.3 201.2,156.0 198.3,162 195 C168.0 191.7,174.7 187.3,180 183 " +
  "C185.3 178.7,190.5 173.7,194 169 C197.5 164.3,197.0 158.5,201 155 C205.0 151.5,212.5 151.3,218 148 " +
  "C223.5 144.7,229.5 140.0,234 135 C238.5 130.0,242.0 124.2,245 118 C248.0 111.8,250.7 104.7,252 98 " +
  "C253.3 91.3,254.0 85.0,253 78 C252.0 71.0,249.8 63.2,246 56 C242.2 48.8,236.3 40.5,230 35 " +
  "C223.7 29.5,214.0 25.7,208 23 C202.0 20.3,198.7 19.8,194 19 C189.3 18.2,187.0 17.7,180 18 Z";

// Cerebrum — the folded surface is what makes it read as a brain.
const CEREBRUM_PATH =
  "M112.0 96.0 C111.4 95.6,110.4 94.3,110.2 93.5 C109.9 92.6,110.0 91.7,110.5 90.9 C110.9 90.1,112.1 89.4,113.0 88.8 " +
  "C113.9 88.1,115.1 87.6,115.8 86.9 C116.5 86.2,116.9 85.6,117.1 84.7 C117.2 83.9,116.8 82.9,116.7 81.9 " +
  "C116.6 80.9,116.1 79.8,116.3 78.8 C116.5 77.9,117.0 77.0,117.9 76.4 C118.7 75.8,120.2 75.5,121.5 75.1 " +
  "C122.7 74.7,124.3 74.7,125.5 74.3 C126.6 73.9,127.5 73.4,128.2 72.7 C128.9 71.9,129.1 70.9,129.5 69.8 " +
  "C129.9 68.8,130.1 67.5,130.8 66.6 C131.4 65.7,132.3 64.8,133.4 64.4 C134.6 64.0,136.2 64.0,137.6 64.0 " +
  "C139.1 64.0,140.8 64.4,142.2 64.3 C143.6 64.3,144.9 64.2,146.0 63.7 C147.1 63.2,147.9 62.2,148.8 61.3 " +
  "C149.7 60.4,150.5 59.0,151.5 58.2 C152.6 57.4,153.7 56.7,155.1 56.5 C156.4 56.2,158.0 56.6,159.5 56.9 " +
  "C161.0 57.2,162.6 58.1,164.0 58.4 C165.5 58.8,166.8 59.1,168.2 58.9 C169.5 58.7,170.7 58.0,171.9 57.4 " +
  "C173.2 56.7,174.5 55.5,175.8 54.9 C177.2 54.3,178.6 53.7,180.0 53.7 C181.4 53.7,182.8 54.3,184.2 54.9 " +
  "C185.5 55.5,186.8 56.7,188.1 57.4 C189.3 58.0,190.5 58.7,191.8 58.9 C193.2 59.1,194.5 58.8,196.0 58.4 " +
  "C197.4 58.1,199.0 57.2,200.5 56.9 C202.0 56.6,203.6 56.2,204.9 56.5 C206.3 56.7,207.4 57.4,208.5 58.2 " +
  "C209.5 59.0,210.3 60.4,211.2 61.3 C212.1 62.2,212.9 63.2,214.0 63.7 C215.1 64.2,216.4 64.3,217.8 64.3 " +
  "C219.2 64.4,220.9 64.0,222.4 64.0 C223.8 64.0,225.4 64.0,226.6 64.4 C227.7 64.8,228.6 65.7,229.2 66.6 " +
  "C229.9 67.5,230.1 68.8,230.5 69.8 C230.9 70.9,231.1 71.9,231.8 72.7 C232.5 73.4,233.4 73.9,234.5 74.3 " +
  "C235.7 74.7,237.3 74.7,238.5 75.1 C239.8 75.5,241.3 75.8,242.1 76.4 C243.0 77.0,243.5 77.9,243.7 78.8 " +
  "C243.9 79.8,243.4 80.9,243.3 81.9 C243.2 82.9,242.8 83.9,242.9 84.7 C243.1 85.6,243.5 86.2,244.2 86.9 " +
  "C244.9 87.6,246.1 88.1,247.0 88.8 C247.9 89.4,249.1 90.1,249.5 90.9 C250.0 91.7,250.1 92.6,249.8 93.5 " +
  "C249.6 94.3,248.5 95.6,248.0 96.0 C247.5 96.4,248.0 94.0,247.0 96.0 C246.0 98.0,244.5 104.7,242.0 108.0 " +
  "C239.5 111.3,235.7 114.0,232.0 116.0 C228.3 118.0,224.3 119.0,220.0 120.0 C215.7 121.0,210.7 121.3,206.0 122.0 " +
  "C201.3 122.7,196.7 123.3,192.0 124.0 C187.3 124.7,182.7 125.3,178.0 126.0 C173.3 126.7,168.3 127.3,164.0 128.0 " +
  "C159.7 128.7,155.7 130.0,152.0 130.0 C148.3 130.0,145.3 129.7,142.0 128.0 C138.7 126.3,135.0 123.3,132.0 120.0 " +
  "C129.0 116.7,127.0 112.0,124.0 108.0 C121.0 104.0,116.0 98.0,114.0 96.0 C112.0 94.0,112.6 96.4,112.0 96.0 Z";

// Cerebellum — the folded lump tucked under the back.
const CEREBELLUM_PATH =
  "M236.0 128.0 C236.2 128.3,237.3 129.3,237.2 129.9 C237.1 130.5,236.0 131.0,235.3 131.4 C234.6 131.8,233.5 131.9,233.1 132.4 " +
  "C232.7 132.9,233.2 133.8,233.1 134.5 C233.1 135.2,233.2 136.3,232.7 136.8 C232.1 137.2,230.7 137.0,229.8 137.1 " +
  "C228.8 137.1,227.7 136.6,227.0 136.9 C226.3 137.2,226.1 138.3,225.5 138.9 C224.9 139.6,224.3 140.7,223.5 140.9 " +
  "C222.6 141.0,221.5 140.3,220.6 139.9 C219.7 139.5,218.9 138.6,218.0 138.6 C217.1 138.6,216.3 139.5,215.4 139.9 " +
  "C214.5 140.3,213.4 141.0,212.5 140.9 C211.7 140.7,211.1 139.6,210.5 138.9 C209.9 138.3,209.7 137.2,209.0 136.9 " +
  "C208.3 136.6,207.2 137.1,206.2 137.1 C205.3 137.0,203.9 137.2,203.3 136.8 C202.8 136.3,202.9 135.2,202.9 134.5 " +
  "C202.8 133.8,203.3 132.9,202.9 132.4 C202.5 131.9,201.4 131.8,200.7 131.4 C200.0 131.0,198.9 130.5,198.8 129.9 " +
  "C198.7 129.3,199.5 128.6,200.0 128.0 C200.5 127.4,201.4 127.1,201.6 126.5 C201.7 125.9,200.9 125.3,200.7 124.6 " +
  "C200.5 123.9,200.0 123.0,200.4 122.4 C200.7 121.9,202.0 121.7,202.9 121.5 C203.7 121.3,204.9 121.5,205.5 121.1 " +
  "C206.0 120.6,205.9 119.7,206.2 118.9 C206.6 118.2,206.8 117.0,207.5 116.7 C208.2 116.4,209.6 116.9,210.5 117.1 " +
  "C211.5 117.3,212.5 118.0,213.3 117.8 C214.1 117.7,214.7 116.7,215.4 116.1 C216.2 115.6,217.1 114.6,218.0 114.6 " +
  "C218.9 114.6,219.8 115.6,220.6 116.1 C221.3 116.7,221.9 117.7,222.7 117.8 C223.5 118.0,224.5 117.3,225.5 117.1 " +
  "C226.4 116.9,227.8 116.4,228.5 116.7 C229.2 117.0,229.4 118.2,229.8 118.9 C230.1 119.7,230.0 120.6,230.5 121.1 " +
  "C231.1 121.5,232.3 121.3,233.1 121.5 C234.0 121.7,235.3 121.9,235.6 122.4 C236.0 123.0,235.5 123.9,235.3 124.6 " +
  "C235.1 125.3,234.3 125.9,234.4 126.5 C234.6 127.1,235.7 127.7,236.0 128.0 C236.3 128.3,235.8 127.7,236.0 128.0 Z";

export default function BrainMap() {
  const [active, setActive] = useState<PartId | null>(null);
  const activePart = PARTS.find((p) => p.id === active);

  return (
    <div className="my-6">
      <svg
        viewBox="0 0 300 252"
        className="w-full max-w-[400px] mx-auto block"
        role="img"
        aria-label="A head shown in profile facing left, with four parts of the brain marked: the smoke alarm, the filing clerk, the calm supervisor and the phone line"
      >
        {/* Head and neck */}
        <g
          fill="none"
          stroke="var(--text-secondary)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.5"
        >
          <path d={HEAD_PATH} />
          <path d="M150 201 C 152 214, 152 230, 151 248" />
          <path d="M201 155 C 209 176, 213 204, 213 248" />
        </g>

        {/* Brain and the four parts, nudged and scaled to sit inside the skull */}
        <g transform="translate(12.8,-4) scale(0.94)">
          <path
            d={CEREBRUM_PATH}
            fill="var(--background-light)"
            stroke="var(--text-secondary)"
            strokeWidth="1.9"
            opacity="0.75"
          />
          <path
            d={CEREBELLUM_PATH}
            fill="var(--background-light)"
            stroke="var(--text-secondary)"
            strokeWidth="1.6"
            opacity="0.75"
          />
          <path
            d="M206 122 C 210 142, 208 160, 204 176"
            fill="none"
            stroke="var(--text-secondary)"
            strokeWidth="7"
            strokeLinecap="round"
            opacity="0.55"
          />

          {PARTS.map((part) => {
            const isActive = active === part.id;
            const dimmed = active !== null && !isActive;
            return (
              <g
                key={part.id}
                onClick={() => setActive(isActive ? null : part.id)}
                style={{
                  cursor: "pointer",
                  opacity: dimmed ? 0.22 : isActive ? 1 : 0.85,
                  transition: "opacity 0.2s",
                }}
                fill={part.color}
                stroke={part.color}
              >
                {part.shape}
              </g>
            );
          })}
        </g>
      </svg>

      <p className="text-center text-[13px] text-[var(--text-secondary)] mt-1 mb-4">
        Tap a part below to find it on your own head
      </p>

      {/* Legend — the tap targets. One column on a phone. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PARTS.map((part) => {
          const isActive = active === part.id;
          return (
            <button
              key={part.id}
              onClick={() => setActive(isActive ? null : part.id)}
              aria-pressed={isActive}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left border-2 transition-all cursor-pointer ${
                isActive
                  ? "bg-[var(--background-card)]"
                  : "border-[var(--border-color)] bg-[var(--background-card)] hover:border-[var(--primary-light)]"
              }`}
              style={isActive ? { borderColor: part.color } : undefined}
            >
              <span
                className="w-4 h-4 rounded-full shrink-0"
                style={{ background: part.color }}
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block text-[15px] font-bold text-[var(--text-primary)] truncate">
                  {part.nickname}
                </span>
                <span className="block text-[11px] text-[var(--text-secondary)] truncate">
                  {part.realName}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Detail card — what it does, and where it is on your own head */}
      {activePart && (
        <div
          className="mt-4 rounded-2xl px-6 py-5 border-2 bg-[var(--background-light)]"
          style={{ borderColor: activePart.color }}
        >
          <div className="flex items-baseline justify-between gap-4 mb-3">
            <div className="text-[17px] font-bold text-[var(--text-primary)]">
              {activePart.nickname}
            </div>
            <button
              onClick={() => setActive(null)}
              className="shrink-0 text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--primary)] transition-all cursor-pointer"
              aria-label="Close"
            >
              Close
            </button>
          </div>

          <p className="text-[15px] leading-relaxed text-[var(--text-primary)] mb-4">
            {activePart.job}
          </p>

          <div className="pt-3 border-t border-[var(--border-color)]">
            <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1.5">
              Where it is on you
            </div>
            <p className="text-[15px] leading-relaxed text-[var(--text-primary)]">
              {activePart.where}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}