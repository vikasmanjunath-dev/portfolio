/* Optional ambient room sound, synthesised with the Web Audio API (no audio files). Off by default; starts only on a click. */
let ctx: AudioContext | null = null; let master: GainNode | null = null; let timer = 0; let on = false;
function noise(c: AudioContext, brown: boolean) {
  const b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = b.getChannelData(0); let last = 0;
  for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; }
  const s = c.createBufferSource(); s.buffer = b; s.loop = true; return s;
}
function start() {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext; if (!AC) return false;
  ctx = ctx || new AC(); const c = ctx; master = c.createGain(); master.gain.value = 0; master.connect(c.destination);
  const rain = noise(c, false), hp = c.createBiquadFilter(), lp = c.createBiquadFilter(), rg = c.createGain();
  hp.type = 'highpass'; hp.frequency.value = 1400; lp.type = 'lowpass'; lp.frequency.value = 7000; rg.gain.value = 0.05; rain.connect(hp).connect(lp).connect(rg).connect(master);
  const hum = noise(c, true), hl = c.createBiquadFilter(), hg = c.createGain(); hl.type = 'lowpass'; hl.frequency.value = 260; hg.gain.value = 0.18; hum.connect(hl).connect(hg).connect(master);
  rain.start(); hum.start();
  const click = () => { // a soft keyboard tick
    if (!ctx || !master) return; const t = ctx.currentTime, n = noise(ctx, false), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    bp.type = 'bandpass'; bp.frequency.value = 2200 + Math.random() * 1600; bp.Q.value = 2.5; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    n.connect(bp).connect(g).connect(master); n.start(t); n.stop(t + 0.06);
    timer = window.setTimeout(click, 120 + Math.random() * (Math.random() < 0.2 ? 1400 : 380));
  };
  click(); return true;
}
export function ambientOn() { return on; }
export function toggleAmbient(): boolean {
  if (!on) {
    if (!ctx && !start()) return false;
    if (ctx!.state === 'suspended') void ctx!.resume();
    master!.gain.cancelScheduledValues(0); master!.gain.linearRampToValueAtTime(0.9, ctx!.currentTime + 1.2); on = true;
    if (!timer) { /* click loop already running from start() */ }
  } else {
    master!.gain.cancelScheduledValues(0); master!.gain.linearRampToValueAtTime(0, ctx!.currentTime + 0.6); on = false;
  }
  return on;
}
