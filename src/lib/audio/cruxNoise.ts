/* eslint-disable */
// @ts-nocheck
/*
 * CRUX — background-capable noise engine for the Noise Therapy section.
 *
 * The existing White / Pink / Brown / Heavy Rain players almost certainly route
 * a Web Audio node to the speakers — which iOS suspends the moment the screen
 * locks. This module fixes that the same way the Pure Tone player does: it
 * renders each noise to a SEAMLESSLY LOOPABLE WAV blob, which you then play
 * through an <audio loop> element registered with MediaSession. That is the
 * combination the OS treats as media playback, so it survives a locked screen.
 *
 *   White / Pink / Brown  -> generate here (functions below)
 *   Heavy Rain            -> if you already ship a rain audio file, you do NOT
 *                            need a generator. Pass its URL straight to
 *                            playLoop(); screen-off behaviour is identical.
 *
 * Seamless looping for noise is done with an equal-power wrap-around crossfade:
 * the tail that "would have continued" past the end is blended into the head,
 * so looping from the last sample to the first is continuous (no click).
 *
 * Framework-agnostic — works in any client component. ESM exports.
 */

const SAMPLE_RATE = 44100;
const CROSSFADE_SEC = 0.08; // 80 ms equal-power wrap crossfade
const PEAK = 0.5;           // normalised target (leaves headroom; tune in UI volume)

function writeWav(samples) {
  const n = samples.length;
  const dataSize = n * 2;
  const buf = new ArrayBuffer(44 + dataSize);
  const v = new DataView(buf);
  const str = (off, s) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + dataSize, true); str(8, 'WAVE');
  str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, 1, true); v.setUint32(24, SAMPLE_RATE, true);
  v.setUint32(28, SAMPLE_RATE * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  str(36, 'data'); v.setUint32(40, dataSize, true);
  let off = 44;
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(off, s < 0 ? s * 32768 : s * 32767, true);
    off += 2;
  }
  return new Blob([buf], { type: 'audio/wav' });
}

function normalise(buf, peak) {
  let max = 1e-9;
  for (let i = 0; i < buf.length; i++) { const a = Math.abs(buf[i]); if (a > max) max = a; }
  const g = peak / max;
  for (let i = 0; i < buf.length; i++) buf[i] *= g;
  return buf;
}

// gen(length) must return a Float32Array of `length` samples (carrying its own
// filter state across the whole length so the crossfade region is coherent).
function seamlessLoop(gen, seconds) {
  const n = Math.round(SAMPLE_RATE * seconds);
  const f = Math.round(SAMPLE_RATE * CROSSFADE_SEC);
  const raw = gen(n + f);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = raw[i];
  for (let i = 0; i < f; i++) {
    const t = i / f;
    out[i] = raw[i] * Math.sin(t * Math.PI / 2) + raw[n + i] * Math.cos(t * Math.PI / 2);
  }
  return normalise(out, PEAK);
}

function whiteGen(len) {
  const a = new Float32Array(len);
  for (let i = 0; i < len; i++) a[i] = Math.random() * 2 - 1;
  return a;
}

// Paul Kellet's economical pink-noise filter (-3 dB/oct).
function pinkGen(len) {
  const a = new Float32Array(len);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.96900 * b2 + w * 0.1538520;
    b3 = 0.86650 * b3 + w * 0.3104856;
    b4 = 0.55000 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.0168980;
    a[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362;
    b6 = w * 0.115926;
  }
  return a;
}

// Leaky integrator -> brown/red noise (-6 dB/oct).
function brownGen(len) {
  const a = new Float32Array(len);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    a[i] = last * 3.5;
  }
  return a;
}

// Broad band-pass (~500 Hz) on white noise -> green / mid noise, the spectral
// centre of natural ambience. A state-variable band-pass, gently damped so the
// mid emphasis stays broad and natural rather than whistly. Calmer than white,
// fuller than brown.
function greenGen(len) {
  const a = new Float32Array(len);
  const fc = 500, damp = 1.4;
  const f = 2 * Math.sin(Math.PI * fc / SAMPLE_RATE);
  let low = 0, band = 0;
  for (let i = 0; i < len; i++) {
    const input = Math.random() * 2 - 1;
    low += f * band;
    const high = input - low - damp * band;
    band += f * high;
    a[i] = band;
  }
  return a;
}

// Each returns { blob, url }. Remember to URL.revokeObjectURL(url) when done.
export function makeWhiteNoise(seconds = 12) {
  const blob = writeWav(seamlessLoop(whiteGen, seconds));
  return { blob, url: URL.createObjectURL(blob) };
}
export function makePinkNoise(seconds = 12) {
  const blob = writeWav(seamlessLoop(pinkGen, seconds));
  return { blob, url: URL.createObjectURL(blob) };
}
export function makeBrownNoise(seconds = 12) {
  const blob = writeWav(seamlessLoop(brownGen, seconds));
  return { blob, url: URL.createObjectURL(blob) };
}
export function makeGreenNoise(seconds = 12) {
  const blob = writeWav(seamlessLoop(greenGen, seconds));
  return { blob, url: URL.createObjectURL(blob) };
}

// Generate by key. For 'rain', pass your existing rain file URL via fileUrl.
export function makeNoise(kind, { seconds = 12, fileUrl } = {}) {
  switch (kind) {
    case 'white': return makeWhiteNoise(seconds);
    case 'pink': return makePinkNoise(seconds);
    case 'brown': return makeBrownNoise(seconds);
    case 'green': return makeGreenNoise(seconds);
    case 'rain': return { blob: null, url: fileUrl }; // use the shipped asset
    default: throw new Error('Unknown noise kind: ' + kind);
  }
}

/*
 * Play a looping source through an <audio> element with MediaSession so it
 * survives a locked screen. `title` shows on the lock screen.
 * Wire MediaSession action handlers (play/pause) once, app-side, to your
 * shared playback state. `artworkUrl` should be the real CRUX icon (PNG).
 */
export function playLoop(audioEl, url, { title = 'Noise Therapy', artworkUrl } = {}) {
  audioEl.src = url;
  audioEl.loop = true;
  audioEl.load();
  if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title, artist: 'CRUX', album: 'Noise Therapy',
        artwork: artworkUrl ? [{ src: artworkUrl, sizes: '512x512', type: 'image/png' }] : [],
      });
      navigator.mediaSession.playbackState = 'playing';
    } catch (e) { /* noop */ }
  }
  return audioEl.play();
}
