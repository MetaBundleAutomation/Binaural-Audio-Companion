"use client";

import { useState } from "react";
import { FIELD, LABEL, SECTION_TITLE, pill } from "./styles";

/**
 * Unit converter for everyday measures. Spoons, cups, gallons and miles per
 * gallon differ between Australia, the UK and the US, so those topics ask
 * which country's measures to use.
 */

type Country = "au" | "uk" | "us";

interface Unit {
  id: string;
  label: string;
  /** Into the topic's base unit, and back out of it. */
  toBase: (value: number, country: Country) => number;
  fromBase: (base: number, country: Country) => number;
}

interface Topic {
  id: string;
  label: string;
  blurb: string;
  usesCountry?: boolean;
  units: Unit[];
}

const linear = (id: string, label: string, factor: number | ((country: Country) => number)): Unit => {
  const f = (country: Country) => (typeof factor === "number" ? factor : factor(country));
  return { id, label, toBase: (v, c) => v * f(c), fromBase: (b, c) => b / f(c) };
};

// Litres in a gallon. Australia's gallon was the imperial one.
const GALLON = (country: Country) => (country === "us" ? 3.785411784 : 4.54609);
const KM_PER_MILE = 1.609344;

const TOPICS: Topic[] = [
  {
    id: "length",
    label: "Length",
    blurb: "Millimetres, inches, feet, metres, miles",
    units: [
      linear("mm", "Millimetres", 0.001),
      linear("cm", "Centimetres", 0.01),
      linear("m", "Metres", 1),
      linear("km", "Kilometres", 1000),
      linear("in", "Inches", 0.0254),
      linear("ft", "Feet", 0.3048),
      linear("yd", "Yards", 0.9144),
      linear("mi", "Miles", 1609.344),
    ],
  },
  {
    id: "weight",
    label: "Weight",
    blurb: "Grams, kilograms, ounces, pounds, stone",
    units: [
      linear("g", "Grams", 0.001),
      linear("kg", "Kilograms", 1),
      linear("oz", "Ounces", 0.028349523125),
      linear("lb", "Pounds", 0.45359237),
      linear("st", "Stone", 6.35029318),
      linear("t", "Tonnes", 1000),
    ],
  },
  {
    id: "temperature",
    label: "Temperature",
    blurb: "Celsius and Fahrenheit",
    units: [
      { id: "c", label: "Celsius", toBase: (v) => v, fromBase: (b) => b },
      { id: "f", label: "Fahrenheit", toBase: (v) => ((v - 32) * 5) / 9, fromBase: (b) => (b * 9) / 5 + 32 },
    ],
  },
  {
    id: "cooking",
    label: "Cooking",
    blurb: "Spoons, cups, millilitres",
    usesCountry: true,
    units: [
      linear("ml", "Millilitres", 1),
      linear("l", "Litres", 1000),
      linear("tsp", "Teaspoons", (c) => (c === "us" ? 4.92892 : 5)),
      linear("tbsp", "Tablespoons", (c) => (c === "au" ? 20 : c === "uk" ? 15 : 14.7868)),
      linear("cup", "Cups", (c) => (c === "us" ? 236.588 : 250)),
      linear("floz", "Fluid ounces", (c) => (c === "us" ? 29.5735 : 28.4131)),
    ],
  },
  {
    id: "speed",
    label: "Speed",
    blurb: "Kilometres and miles per hour",
    units: [
      linear("kmh", "Kilometres per hour", 1),
      linear("mph", "Miles per hour", KM_PER_MILE),
      linear("ms", "Metres per second", 3.6),
      linear("kn", "Knots", 1.852),
    ],
  },
  {
    id: "area",
    label: "Area",
    blurb: "Square metres, hectares, acres",
    units: [
      linear("m2", "Square metres", 1),
      linear("ha", "Hectares", 10000),
      linear("ac", "Acres", 4046.8564224),
      linear("km2", "Square kilometres", 1_000_000),
      linear("ft2", "Square feet", 0.09290304),
    ],
  },
  {
    id: "fuel",
    label: "Fuel",
    blurb: "Litres and gallons",
    usesCountry: true,
    units: [linear("l", "Litres", 1), linear("gal", "Gallons", GALLON)],
  },
  {
    id: "fuel-use",
    label: "Fuel use",
    blurb: "Litres per 100 km, miles per gallon",
    usesCountry: true,
    // Base unit: kilometres per litre.
    units: [
      { id: "l100", label: "Litres per 100 km", toBase: (v) => 100 / v, fromBase: (b) => 100 / b },
      {
        id: "mpg",
        label: "Miles per gallon",
        toBase: (v, c) => (v * KM_PER_MILE) / GALLON(c),
        fromBase: (b, c) => (b * GALLON(c)) / KM_PER_MILE,
      },
      { id: "kml", label: "Kilometres per litre", toBase: (v) => v, fromBase: (b) => b },
    ],
  },
];

const COUNTRIES: { id: Country; label: string }[] = [
  { id: "au", label: "Australia" },
  { id: "uk", label: "UK" },
  { id: "us", label: "US" },
];

function format(value: number): string {
  if (!Number.isFinite(value)) return "";
  const rounded = Number(value.toPrecision(6));
  return rounded.toLocaleString("en-AU", { maximumFractionDigits: 6 });
}

export default function UnitConverter() {
  const [topicId, setTopicId] = useState(TOPICS[0].id);
  const [country, setCountry] = useState<Country>("au");
  const [input, setInput] = useState("1");
  const [fromId, setFromId] = useState(TOPICS[0].units[0].id);
  const [toId, setToId] = useState(TOPICS[0].units[4].id);

  const topic = TOPICS.find((t) => t.id === topicId) ?? TOPICS[0];
  const from = topic.units.find((u) => u.id === fromId) ?? topic.units[0];
  const to = topic.units.find((u) => u.id === toId) ?? topic.units[1];

  const chooseTopic = (id: string) => {
    const next = TOPICS.find((t) => t.id === id) ?? TOPICS[0];
    setTopicId(next.id);
    setFromId(next.units[0].id);
    setToId(next.units[1].id);
  };

  const swap = () => {
    setFromId(to.id);
    setToId(from.id);
  };

  const value = Number(input.replace(/,/g, "").trim());
  const valid = input.trim() !== "" && Number.isFinite(value);
  const result = valid ? format(to.fromBase(from.toBase(value, country), country)) : "";

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="converter-topic">
        <h2 id="converter-topic" className={SECTION_TITLE}>
          What do you want to convert?
        </h2>
        <div role="group" aria-label="Topic" className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => chooseTopic(t.id)}
              aria-pressed={t.id === topic.id}
              className={`flex min-h-16 flex-col items-start justify-center rounded-2xl border px-4 py-2 text-left transition-colors cursor-pointer ${
                t.id === topic.id
                  ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]"
                  : "border-[var(--border-color)] hover:border-[var(--primary)]"
              }`}
            >
              <span className="text-[16px] font-semibold leading-snug text-[var(--text-primary)]">{t.label}</span>
              <span className="text-[13px] leading-snug text-[var(--text-secondary)]">{t.blurb}</span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="converter-form" className="card p-4 sm:p-6">
        <h2 id="converter-form" className={SECTION_TITLE}>
          {topic.label}
        </h2>

        {topic.usesCountry && (
          <div className="mt-4">
            <p className={LABEL}>Whose measures?</p>
            <div role="group" aria-label="Country" className="flex flex-wrap gap-2">
              {COUNTRIES.map((c) => (
                <button key={c.id} type="button" onClick={() => setCountry(c.id)} aria-pressed={country === c.id} className={pill(country === c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto_1fr] sm:items-end">
          <div>
            <label htmlFor="convert-value" className={LABEL}>
              Amount
            </label>
            <input
              id="convert-value"
              type="text"
              inputMode="decimal"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              autoComplete="off"
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="convert-from" className={LABEL}>
              From
            </label>
            <select id="convert-from" value={from.id} onChange={(event) => setFromId(event.target.value)} className={FIELD}>
              {topic.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
          <button type="button" onClick={swap} className="btn-ghost min-h-12 justify-center">
            Swap
          </button>
          <div>
            <label htmlFor="convert-to" className={LABEL}>
              To
            </label>
            <select id="convert-to" value={to.id} onChange={(event) => setToId(event.target.value)} className={FIELD}>
              {topic.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p
          role="status"
          aria-live="polite"
          className="mt-6 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-solid)] px-4 py-4 text-center text-[var(--text-primary)]"
        >
          {result ? (
            <>
              <span className="block text-[15px] text-[var(--text-secondary)]">
                {from.label} to {to.label}
              </span>
              <span className="block break-words text-[30px] font-bold leading-tight">
                {result} <span className="text-[18px] font-semibold">{to.label}</span>
              </span>
            </>
          ) : (
            <span className="text-[16px] text-[var(--text-secondary)]">Enter a number to convert.</span>
          )}
        </p>
      </section>
    </div>
  );
}
