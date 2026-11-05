// Ambient background: a faint grid and three soft colour glows, coloured by the
// current theme's accents. Pure CSS, renders on the server, sits behind
// everything. Nothing moves: this is a calm app, and the global reduced-motion
// rule would stop it anyway. The blur radius is much smaller on phones because
// a huge blurred element is one of the most expensive things a weak mobile GPU
// can paint.
export default function BackgroundFX() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 grid-bg opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      {/* The glows sit in one layer so a theme can turn them down (--fx-opacity). */}
      <div className="absolute inset-0" style={{ opacity: "var(--fx-opacity, 1)" }}>
        <div
          className="absolute -left-40 -top-40 h-[42rem] w-[42rem] rounded-full blur-[44px] md:blur-[140px]"
          style={{ background: "color-mix(in srgb, var(--accent) 22%, transparent)" }}
        />
        <div
          className="absolute -right-40 top-20 h-[38rem] w-[38rem] rounded-full blur-[44px] md:blur-[140px]"
          style={{ background: "color-mix(in srgb, var(--accent-2) 14%, transparent)" }}
        />
        <div
          className="absolute bottom-0 left-1/3 h-[36rem] w-[36rem] rounded-full blur-[48px] md:blur-[150px]"
          style={{ background: "color-mix(in srgb, var(--accent-3) 14%, transparent)" }}
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, var(--background), transparent 30%, transparent 70%, var(--background))",
        }}
      />
    </div>
  );
}
