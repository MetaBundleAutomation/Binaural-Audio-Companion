/* eslint-disable */
// @ts-nocheck
'use client';

/*
 * CRUX — Pure Tone therapy player (all-night + lock-in build)
 *
 * Engine: the tone is generated LIVE by a Web Audio OscillatorNode and routed
 * THROUGH a real <audio> element via a MediaStream (createMediaStreamDestination).
 * That gives a perfectly CONTINUOUS, gapless sine (an oscillator never loops, so
 * there is no seam/pop) while the <audio> element + MediaSession still provide
 * lock-screen controls and background playback on Android / desktop. The audio is
 * NOT connected to ctx.destination — every sample flows through the element, which
 * is what the OS treats as media playback.
 *
 * (Note: an AudioContext can be suspended by iOS when the screen locks — see the
 * iOS hint in the UI — but that limitation already applied to web audio there.)
 *
 * Integrated into CRUX Noise Therapy:
 *   - When `getAudioEl` is provided it plays through that ONE shared <audio>
 *     element (so starting any sound stops the others) and reports play/stop via
 *     onActivate / onDeactivate; `isActive=false` means another sound took over.
 *     Our stream is released from the element (srcObject = null) whenever we stop,
 *     hand over, or unmount, so a noise's el.src can take the element next.
 *   - Falls back to its own <audio> element when used standalone.
 *   - Styling uses CRUX design tokens (var(--primary) etc.) to match the
 *     Noise Therapy cards; the canvas waveform is theme-aware.
 *
 * Lock-in stays on the built-in localStorage fallback (Supabase wired later).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

const F_MIN = 100;
const F_MAX = 12000;
const DEFAULT_FREQ = 4200;
const DEFAULT_VOL = 40;
// Hard safety ceiling for the oscillator gain. A pure sine is concentrated energy
// and is more fatiguing/harmful than broadband noise at the same level, so the tone
// can NEVER exceed this digital amplitude (~ -23 dBFS) no matter where the slider
// sits. A web page can't read the device's master volume, so this caps OUR output
// conservatively; the UI still tells users to keep system volume gentle.
const MAX_GAIN = 0.07;
// Perceptual square-law taper: low slider positions become genuinely quiet, giving
// fine control for setting the tone just below tinnitus instead of jumping loud.
const VOL_EXP = 2;
const STORAGE_KEY = 'crux.pureTone.lockedHz';

const TIMERS = [
  { label: 'Off', mins: 0 },
  { label: '1h', mins: 60 },
  { label: '4h', mins: 240 },
  { label: '8h', mins: 480 },
];

const ratio = Math.log(F_MAX / F_MIN);
const sliderToFreq = (t) => Math.round(F_MIN * Math.exp(ratio * t));
const freqToSlider = (f) => Math.log(f / F_MIN) / ratio;
const clampFreq = (f) => Math.min(F_MAX, Math.max(F_MIN, Math.round(f)));

// Fallback lock-screen artwork if no PNG is supplied by the host (Crux constellation).
const ARTWORK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">' +
  '<rect width="512" height="512" fill="#0a0e1a"/>' +
  '<g fill="#5ec8e8"><circle cx="256" cy="120" r="10"/><circle cx="256" cy="392" r="12"/>' +
  '<circle cx="360" cy="256" r="9"/><circle cx="170" cy="236" r="8"/><circle cx="210" cy="180" r="5"/></g>' +
  '<g stroke="#2dd4bf" stroke-width="2" opacity="0.5"><line x1="256" y1="120" x2="256" y2="392"/>' +
  '<line x1="360" y1="256" x2="170" y2="236"/></g></svg>'
);

export default function PureToneTherapy({
  initialFrequency, onLockFrequency, onClearLock,
  getAudioEl, isActive, onActivate, onDeactivate, artworkUrl,
} = {}) {
  const [freq, setFreq] = useState(DEFAULT_FREQ);
  const [vol, setVol] = useState(DEFAULT_VOL);
  const [playing, setPlaying] = useState(false);
  const [timerMins, setTimerMins] = useState(0);
  const [isIOS, setIsIOS] = useState(false);
  const [lockedHz, setLockedHz] = useState(null);

  const audioRef = useRef(null);
  const ctxRef = useRef(null);     // AudioContext (lazy, created on first play within a user gesture)
  const oscRef = useRef(null);     // continuous OscillatorNode (runs until unmount; gated by the gain)
  const gainRef = useRef(null);    // volume / fades — sample-accurate, click-free
  const streamRef = useRef(null);  // MediaStreamAudioDestinationNode -> el.srcObject
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const mountedRef = useRef(false);

  // When the host passes a shared <audio> element we route everything through it
  // (one element for the whole Noise Therapy section); otherwise we use our own.
  const useShared = typeof getAudioEl === 'function';
  const getEl = () => (useShared ? getAudioEl() : audioRef.current);

  const stateRef = useRef({ freq, vol, playing, phase: 0, amp: 0 });
  stateRef.current.freq = freq;
  stateRef.current.vol = vol;
  stateRef.current.playing = playing;

  // Gain target for the oscillator path: perceptual taper, then hard-clamped to the
  // safety ceiling so the tone can never reach a hearing-damaging digital level.
  const targetVol = useCallback(
    () => Math.min(MAX_GAIN, MAX_GAIN * Math.pow(Math.min(1, Math.max(0, vol / 100)), VOL_EXP)),
    [vol],
  );

  // mount: iOS detection + restore a locked tone (prop wins, else localStorage)
  useEffect(() => {
    mountedRef.current = true;
    const ua = navigator.userAgent || '';
    setIsIOS(/iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

    if (typeof initialFrequency === 'number') {
      const hz = clampFreq(initialFrequency);
      setLockedHz(hz); setFreq(hz);
    } else {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) { const hz = clampFreq(Number(stored)); setLockedHz(hz); setFreq(hz); }
      } catch (e) { /* artifact preview / SSR */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build the persistent audio graph once: Oscillator -> Gain -> MediaStream.
  // The oscillator runs continuously (gated by the gain) so the tone never breaks;
  // audibility is controlled purely by ramping the gain up and down.
  const ensureGraph = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    const gain = ctx.createGain(); gain.gain.value = 0;
    const dest = ctx.createMediaStreamDestination();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = stateRef.current.freq;
    osc.connect(gain); gain.connect(dest); // NOT to ctx.destination — audio must flow
    osc.start();                            // through <audio> so lock-screen/background works
    ctxRef.current = ctx; gainRef.current = gain; streamRef.current = dest; oscRef.current = osc;
    return ctx;
  }, []);

  // Smooth, click-free gain ramp on the Web Audio GainNode (sample-accurate).
  const rampGain = useCallback((to, ms) => {
    const g = gainRef.current, ctx = ctxRef.current;
    if (!g || !ctx) return;
    const now = ctx.currentTime;
    const dur = Math.max(0.005, ms / 1000);
    try {
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.linearRampToValueAtTime(Math.max(0, to), now + dur);
    } catch (e) { try { g.gain.value = Math.max(0, to); } catch (e2) { /* noop */ } }
  }, []);

  // Release our live stream from the shared element so a noise's el.src can play
  // next (srcObject overrides src, so it must be cleared on handoff).
  const releaseStream = useCallback(() => {
    const el = getEl();
    try {
      if (el && streamRef.current && el.srcObject === streamRef.current.stream) el.srcObject = null;
    } catch (e) { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useShared]);

  const updateMediaSession = useCallback((f, state) => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: 'Pure Tone · ' + f.toLocaleString() + ' Hz',
        artist: 'CRUX', album: 'Noise Therapy',
        artwork: [{ src: artworkUrl || ARTWORK, sizes: '512x512', type: artworkUrl ? 'image/png' : 'image/svg+xml' }],
      });
      navigator.mediaSession.playbackState = state;
    } catch (e) { /* noop */ }
  }, [artworkUrl]);

  const start = useCallback(async () => {
    const el = getEl();
    if (!el) return;
    const ctx = ensureGraph();
    if (ctx.state === 'suspended') { try { await ctx.resume(); } catch (e) { /* noop */ } }
    oscRef.current.frequency.setTargetAtTime(freq, ctx.currentTime, 0.01);
    // Route the live oscillator stream through the shared element (overrides any
    // noise src). The element plays live media, so MediaSession / lock-screen work.
    try { el.pause(); } catch (e) { /* noop */ }
    try { el.removeAttribute('src'); } catch (e) { /* noop */ }
    el.srcObject = streamRef.current.stream;
    el.loop = false; // a live stream is inherently continuous
    el.volume = 1;   // loudness is controlled by the gain node
    gainRef.current.gain.value = 0;
    try { await el.play(); } catch (e) { return; }
    rampGain(targetVol(), 280);
    setPlaying(true);
    updateMediaSession(freq, 'playing');
    if (typeof onActivate === 'function') onActivate();
  }, [freq, ensureGraph, rampGain, targetVol, updateMediaSession, onActivate]);

  const stop = useCallback((fadeMs = 220) => {
    const el = getEl();
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    rampGain(0, fadeMs);
    window.setTimeout(() => {
      try { el && el.pause(); } catch (e) { /* noop */ }
      releaseStream();
    }, fadeMs + 40);
    setPlaying(false);
    updateMediaSession(freq, 'paused');
    if (typeof onDeactivate === 'function') onDeactivate();
  }, [freq, rampGain, releaseStream, updateMediaSession, onDeactivate]);

  const toggle = useCallback(() => { playing ? stop() : start(); }, [playing, start, stop]);

  // If the host handed the shared element to another sound, drop our "playing" UI
  // state, silence our gain, and release our stream (without owning the element).
  useEffect(() => {
    if (useShared && isActive === false && playing) {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      try { if (gainRef.current) gainRef.current.gain.value = 0; } catch (e) { /* noop */ }
      releaseStream();
      setPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // lock-in / recall / clear
  const lockIn = useCallback(() => {
    setLockedHz(freq);
    try { window.localStorage.setItem(STORAGE_KEY, String(freq)); } catch (e) { /* noop */ }
    if (typeof onLockFrequency === 'function') onLockFrequency(freq);
  }, [freq, onLockFrequency]);

  const recall = useCallback(() => { if (lockedHz) setFreq(clampFreq(lockedHz)); }, [lockedHz]);

  const clearLock = useCallback(() => {
    setLockedHz(null);
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* noop */ }
    if (typeof onClearLock === 'function') onClearLock();
  }, [onClearLock]);

  // Frequency change: glide the oscillator smoothly — no regeneration, no gap, no
  // dip. setTargetAtTime ramps the pitch click-free even during a fast slider drag.
  useEffect(() => {
    if (!mountedRef.current) return;
    const ctx = ctxRef.current, osc = oscRef.current;
    if (osc && ctx) osc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.03);
    if (playing) updateMediaSession(freq, 'playing');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freq]);

  // Volume change while playing -> short, click-free gain ramp.
  useEffect(() => {
    if (playing) rampGain(targetVol(), 60);
  }, [vol, playing, targetVol, rampGain]);

  useEffect(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (playing && timerMins > 0) {
      timerRef.current = window.setTimeout(() => stop(2500), timerMins * 60 * 1000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timerMins, playing, stop]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    // release our stream so noises can use el.src, then tear the graph down
    releaseStream();
    if (!useShared) { try { audioRef.current && audioRef.current.pause(); } catch (e) { /* noop */ } }
    try { oscRef.current && oscRef.current.stop(); } catch (e) { /* noop */ }
    try { ctxRef.current && ctxRef.current.close(); } catch (e) { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // canvas waveform (theme-aware)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cs = getComputedStyle(canvas);
    const c1 = (cs.getPropertyValue('--primary') || '#2B6B7F').trim();
    const c2 = (cs.getPropertyValue('--primary-light') || '#3A8FA3').trim();
    let raf;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas);
    const stars = [
      { x: 0.5, y: 0.16, r: 2.4 }, { x: 0.5, y: 0.84, r: 2.8 },
      { x: 0.74, y: 0.5, r: 2.2 }, { x: 0.3, y: 0.46, r: 1.9 }, { x: 0.4, y: 0.34, r: 1.2 },
    ];
    const draw = () => {
      const s = stateRef.current;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.strokeStyle = 'rgba(120,140,180,0.10)'; ctx.lineWidth = 1; ctx.beginPath();
      ctx.moveTo(stars[0].x * w, stars[0].y * h); ctx.lineTo(stars[1].x * w, stars[1].y * h);
      ctx.moveTo(stars[2].x * w, stars[2].y * h); ctx.lineTo(stars[3].x * w, stars[3].y * h);
      ctx.stroke();
      stars.forEach((st) => { ctx.beginPath(); ctx.fillStyle = 'rgba(180,200,235,0.30)'; ctx.arc(st.x * w, st.y * h, st.r, 0, Math.PI * 2); ctx.fill(); });
      ctx.restore();
      const targetAmp = s.playing ? (0.20 + 0.62 * (s.vol / 100)) : 0.10;
      s.amp += (targetAmp - s.amp) * 0.08;
      const cycles = 2 + 12 * freqToSlider(s.freq);
      const mid = h / 2, ampPx = mid * 0.78 * s.amp;
      s.phase += s.playing ? 0.05 : 0.012;
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, c1); grad.addColorStop(0.55, c2); grad.addColorStop(1, c1);
      ctx.beginPath();
      for (let x = 0; x <= w; x++) {
        const y = mid + Math.sin((x / w) * cycles * Math.PI * 2 + s.phase) * ampPx;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = grad; ctx.lineWidth = 2.2;
      ctx.shadowColor = c2; ctx.shadowBlur = s.playing ? 14 : 5;
      ctx.lineCap = 'round'; ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  const nudge = (d) => setFreq((f) => clampFreq(f + d));

  // CRUX-token styling — blends into the Noise Therapy card; range inputs inherit
  // the app's global slider style. Tints use color-mix so they follow the theme.
  const styles = `
    .crux-tone *{box-sizing:border-box}
    .crux-tone{font-family:inherit;color:var(--text-primary);width:100%}
    .crux-tone .ct-sub{color:var(--text-secondary);font-size:13px;line-height:1.5;text-align:center;margin:0 auto 16px;max-width:420px}
    .crux-tone .ct-canvas-wrap{position:relative;height:124px;border-radius:14px;overflow:hidden;
      background:var(--background-light);border:1px solid var(--border-color);margin-bottom:18px}
    .crux-tone canvas{width:100%;height:100%;display:block}
    .crux-tone .ct-hz{position:absolute;left:0;right:0;bottom:8px;text-align:center;pointer-events:none}
    .crux-tone .ct-hz b{font-size:30px;font-weight:700;color:var(--text-primary)}
    .crux-tone .ct-hz span{font-size:13px;color:var(--text-secondary);margin-left:4px}
    .crux-tone .ct-row{display:flex;align-items:center;gap:16px;background:var(--background-light);border:1px solid var(--border-color);border-radius:12px;padding:10px 20px;margin:14px 0}
    .crux-tone .ct-label{font-size:12px;color:var(--text-secondary);min-width:52px}
    .crux-tone .ct-controls{display:flex;align-items:center;justify-content:center;gap:14px;margin:18px 0 6px}
    .crux-tone .ct-btn{background:var(--background-light);color:var(--text-secondary);border:1px solid var(--border-color);border-radius:11px;height:40px;min-width:48px;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s}
    .crux-tone .ct-btn:hover{border-color:var(--primary);color:var(--text-primary)}
    .crux-tone .ct-btn:active{transform:scale(.96)}
    .crux-tone .ct-play{width:70px;height:70px;border-radius:50%;border:0;background:var(--primary);color:#fff;box-shadow:0 8px 24px rgba(43,107,127,0.4);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.18s}
    .crux-tone .ct-play:active{transform:scale(.95)}
    .crux-tone .ct-lock{display:flex;align-items:center;justify-content:center;gap:8px;margin:16px 0 4px;min-height:36px}
    .crux-tone .ct-lockbtn{background:transparent;border:1px dashed var(--primary);color:var(--primary);border-radius:11px;padding:9px 18px;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;transition:.15s}
    .crux-tone .ct-lockbtn:hover{background:color-mix(in srgb,var(--primary) 12%,transparent)}
    .crux-tone .ct-lockpill{display:flex;align-items:center;gap:6px;background:color-mix(in srgb,var(--primary) 14%,transparent);border:1px solid var(--primary);color:var(--text-primary);border-radius:11px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer}
    .crux-tone .ct-lockpill svg{color:var(--primary)}
    .crux-tone .ct-lockx{background:var(--background-light);border:1px solid var(--border-color);color:var(--text-secondary);width:32px;height:32px;border-radius:9px;cursor:pointer;font-size:16px;line-height:1}
    .crux-tone .ct-lockx:hover{border-color:var(--primary);color:var(--text-primary)}
    .crux-tone .ct-timer{display:flex;gap:8px;justify-content:center;margin-top:14px}
    .crux-tone .ct-chip{flex:1;padding:8px 0;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer;text-align:center;background:var(--background-light);border:1px solid var(--border-color);color:var(--text-secondary);transition:.15s}
    .crux-tone .ct-chip:hover{color:var(--text-primary)}
    .crux-tone .ct-chip.on{background:color-mix(in srgb,var(--primary) 14%,transparent);border-color:var(--primary);color:var(--text-primary)}
    .crux-tone .ct-info{margin-top:16px;display:flex;gap:8px;align-items:flex-start;background:color-mix(in srgb,var(--primary) 7%,transparent);border:1px solid color-mix(in srgb,var(--primary) 18%,transparent);border-radius:11px;padding:10px 12px}
    .crux-tone .ct-info svg{flex:0 0 auto;margin-top:1px;color:var(--primary)}
    .crux-tone .ct-info p{margin:0;font-size:12px;line-height:1.5;color:var(--text-secondary)}
    .crux-tone .ct-note{margin-top:12px;font-size:11.5px;line-height:1.5;color:var(--text-secondary);opacity:.75;text-align:center}
  `;

  return (
    <div className="crux-tone">
      <style>{styles}</style>
      {!useShared && <audio ref={audioRef} preload="auto" playsInline />}

      <p className="ct-sub">Match your tone, keep it just below your tinnitus, and let it carry you through the night.</p>

      <div className="ct-canvas-wrap">
        <canvas ref={canvasRef} />
        <div className="ct-hz"><b>{freq.toLocaleString()}</b><span>Hz</span></div>
      </div>

      <div className="ct-row">
        <span className="ct-label">Pitch</span>
        <input type="range" min="0" max="1000" step="1"
          value={Math.round(freqToSlider(freq) * 1000)}
          onChange={(e) => setFreq(sliderToFreq(Number(e.target.value) / 1000))}
          style={{ '--fill': `${Math.round(freqToSlider(freq) * 100)}%` }}
          aria-label="Tone frequency" />
      </div>

      <div className="ct-controls">
        <button className="ct-btn" onClick={() => setFreq((f) => clampFreq(f / 2))} aria-label="Down one octave">½×</button>
        <button className="ct-btn" onClick={() => nudge(-10)} aria-label="Down 10 hertz">−10</button>
        <button className="ct-play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
          {playing
            ? <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.2" /><rect x="14" y="5" width="4" height="14" rx="1.2" /></svg>
            : <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5z" /></svg>}
        </button>
        <button className="ct-btn" onClick={() => nudge(10)} aria-label="Up 10 hertz">+10</button>
        <button className="ct-btn" onClick={() => setFreq((f) => clampFreq(f * 2))} aria-label="Up one octave">2×</button>
      </div>

      <div className="ct-lock">
        {lockedHz ? (
          <>
            <button className="ct-lockpill" onClick={recall} aria-label={'Recall locked tone, ' + lockedHz + ' hertz'}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.2 6.8.8-5 4.6 1.3 6.7L12 18.9 5.9 22.4l1.3-6.7-5-4.6 6.8-.8z" /></svg>
              Locked · {lockedHz.toLocaleString()} Hz
            </button>
            <button className="ct-lockx" onClick={clearLock} aria-label="Clear locked tone">×</button>
          </>
        ) : (
          <button className="ct-lockbtn" onClick={lockIn}>Lock in this tone</button>
        )}
      </div>

      <div className="ct-row">
        <span className="ct-label">Volume</span>
        <input type="range" min="0" max="100" step="1" value={vol}
          onChange={(e) => setVol(Number(e.target.value))}
          style={{ '--fill': `${vol}%` }}
          aria-label="Volume" />
      </div>

      <div className="ct-timer">
        {TIMERS.map((t) => (
          <button key={t.label} className={'ct-chip' + (timerMins === t.mins ? ' on' : '')}
            onClick={() => setTimerMins(t.mins)}>{t.label}</button>
        ))}
      </div>

      <div className="ct-info">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="11" x2="12" y2="16" /><circle cx="12" cy="8" r="0.6" fill="currentColor" />
        </svg>
        <p>{isIOS
          ? 'iPhone: for uninterrupted all-night play, keep your screen on (best while charging). iOS limits background audio for web apps, so playback may pause when locked.'
          : 'You can lock your screen — playback continues in the background with controls on your lock screen. No internet needed once it starts.'}</p>
      </div>

      <p className="ct-note">Keep the volume gentle — just enough to blend, never to overpower. A complement to professional care, not a replacement for it.</p>
    </div>
  );
}
