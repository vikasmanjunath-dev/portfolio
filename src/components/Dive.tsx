'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { FLAGSHIP } from '@/content';
import { EMAIL } from '@/content/site';
import { Ev } from './bits';
import { useApp } from './Shell';
import { GATE_P, GATES, P_INTRO, P_PORTAL, type Cur } from './diveConsts';

const K = 1 - P_INTRO; // tunnel share of the timeline

const DiveScene = dynamic(() => import('./DiveScene'), { ssr: false });

const GATE_INFO = [
  { name: 'Verification layer', declines: 'figures it cannot verify' },
  { name: 'Per-viewer privacy', declines: 'precision a viewer has not earned' },
  { name: 'Rule engine', declines: 'verdicts no rule can explain' },
  { name: 'Clock engine', declines: 'dates no statute supports' },
];
const LAYERS = [{ at: 0, n: 'The desk' }, { at: P_PORTAL - 0.015, n: 'Into the screen' }, { at: P_INTRO, n: 'Surface' }, ...GATE_P.map((g, i) => ({ at: g - 0.06, n: `Gate 0${i + 1} · ${['Verification', 'Privacy', 'Rules', 'Clock'][i]}` })), { at: GATE_P[3] + 0.07, n: 'The core' }];
const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const hasGL = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } };

export default function Dive() {
  const { zen, setZen, toast, go, scrollToId, scrollToY } = useApp();
  const [typing, setTyping] = useState(false);
  const sec = useRef<HTMLElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const hud = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLElement | null)[]>([]);
  const cur = useRef<Cur>({ p: 0, vel: 0 });
  const [gl, setGl] = useState(false);
  const [flash, setFlash] = useState<{ i: number; k: number } | null>(null);
  const mouse = useRef({ x: 0, y: 0, sx: 0, sy: 0 });

  useEffect(() => {
    if (zen || new URLSearchParams(location.search).has('lite') || !hasGL()) { setGl(false); return; }
    /* start the 3D scene after first paint and an idle moment, so the page is readable and responsive first */
    const go = () => setGl(true); let id = 0;
    const kick = () => { id = window.setTimeout(go, 600); };
    if (document.readyState === 'complete') kick(); else addEventListener('load', kick, { once: true });
    return () => { clearTimeout(id); removeEventListener('load', kick); };
  }, [zen]);
  /* frame-rate guard: if the first ~2 s of the 3D dive average under ~24 fps, fall back to the static Zen page */
  useEffect(() => {
    if (!gl) return;
    let n = 0, sum = 0, last = performance.now(), raf = 0;
    const tick = (now: number) => {
      const d = Math.min(200, now - last); last = now; n++; if (n > 15 && !document.hidden) sum += d;
      if (n < 135) { raf = requestAnimationFrame(tick); return; }
      if (sum / 120 > 42) { setZen(true); toast('Slow graphics detected: switched to the static Zen page. Press Z for the 3D dive.'); }
    };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [gl, setZen, toast]);
  const onAction = useCallback((a: { type: string; href?: string; msg?: string }) => {
    if (a.type === 'nav' && a.href) { if (a.href.startsWith('#')) scrollToId(a.href.slice(1)); else go(a.href); }
    else if (a.type === 'toast' && a.msg) toast(a.msg);
    else if (a.type === 'dive') { const s = sec.current; if (s) scrollToY(s.offsetTop + 0.22 * (s.offsetHeight - innerHeight)); }
  }, [go, scrollToId, scrollToY, toast]);
  const onHover = useCallback((label: string | null) => { window.dispatchEvent(new CustomEvent('vm:hover', { detail: label })); }, []);
  const onGate = useCallback((i: number) => setFlash({ i, k: Date.now() }), []);
  const copy = () => { const d = () => toast('Email copied'); try { navigator.clipboard.writeText(EMAIL).then(d, d); } catch { d(); } };

  useEffect(() => {
    if (zen) return;
    const s = sec.current; if (!s) return;
    const pm = (e: PointerEvent) => { mouse.current.x = (e.clientX / innerWidth - 0.5) * 2; mouse.current.y = (e.clientY / innerHeight - 0.5) * 2; };
    addEventListener('pointermove', pm, { passive: true });
    let raf = 0, last = performance.now(), prev = 0, t = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      const r = s.getBoundingClientRect(); const total = Math.max(1, r.height - innerHeight);
      if (r.bottom < -innerHeight || r.top > innerHeight * 1.2) return; // off screen
      const target = Math.min(1, Math.max(0, -r.top / total));
      const c = cur.current; c.p += (target - c.p) * (1 - Math.exp(-dt * 3.6)); c.vel = dt > 0 ? (c.p - prev) / dt : 0; prev = c.p; const p = c.p;
      const m = mouse.current; m.sx += (m.x - m.sx) * 0.06; m.sy += (m.y - m.sy) * 0.06;
      /* intro: the hero rushes past the camera */
      if (intro.current) { const q = sm(0.0, 0.07, p); intro.current.style.opacity = String(1 - sm(0.012, 0.07, p)); intro.current.style.transform = `translate3d(${m.sx * -10}px,${q * 30 + m.sy * -8}px,0) scale(${1 + q * 0.5})`; intro.current.style.filter = q > 0.01 ? `blur(${q * 9}px)` : ''; intro.current.style.visibility = p > 0.075 ? 'hidden' : 'visible'; intro.current.style.pointerEvents = p > 0.03 ? 'none' : ''; }
      /* gate panels: approach from far, pass the camera, rush away */
      panels.current.forEach((el, i) => {
        if (!el) return; const d = (p - GATE_P[i]) / K;
        const op = sm(-0.115, -0.072, d) * (1 - sm(0.018, 0.052, d));
        const sc = 0.46 * Math.pow(6.6, (Math.min(0.056, Math.max(-0.115, d)) + 0.115) / 0.171);
        const side = i % 2 ? 1 : -1; const slide = (1 - sm(-0.115, -0.03, d)) * side * 5;
        const bl = (1 - sm(-0.115, -0.07, d)) * 9 + sm(0.02, 0.056, d) * 14;
        el.style.opacity = String(op); el.style.visibility = op < 0.01 ? 'hidden' : 'visible';
        el.style.transform = `translate3d(${side * 7 + slide + m.sx * 26 * sc}vw,${Math.sin(t * 0.9 + i) * 7 + m.sy * 18}px,0) scale(${sc})`;
        el.style.filter = bl > 0.2 ? `blur(${bl}px)` : '';
        el.style.pointerEvents = op > 0.7 && d < 0.012 ? 'auto' : 'none';
      });
      if (end.current) { const o = sm(0.925, 0.985, p); end.current.style.opacity = String(o); end.current.style.visibility = o < 0.01 ? 'hidden' : 'visible'; end.current.style.transform = `scale(${0.88 + o * 0.12})`; end.current.style.pointerEvents = o > 0.6 ? 'auto' : 'none'; }
      /* HUD */
      if (hud.current) {
        let gp = 0; GATE_P.forEach((g) => { gp += sm(g - 0.012, g + 0.012, p); });
        const L = [...LAYERS].reverse().find((l) => p >= l.at) || LAYERS[0];
        const gi = Math.min(3, Math.max(0, GATE_P.findIndex((g) => p < g + 0.02)));
        hud.current.style.setProperty('--fill', `${(p * 100).toFixed(2)}%`);
        hud.current.querySelector('[data-layer]')!.textContent = L.n;
        hud.current.querySelector('[data-surv]')!.textContent = `${Math.round(100 * Math.pow(0.76, gp))}%`;
        s.style.setProperty('--gw', GATES[p > 0.93 ? 3 : gi].hue);
        s.style.setProperty('--dp', p.toFixed(3));
      }
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener('pointermove', pm); };
  }, [zen]);

  return (
    <section className="dive" id="top" ref={sec} aria-label="Introduction: a dive through four gates" style={{ ['--gw' as string]: GATES[0].hue } as React.CSSProperties}>
      <div className="dive-stage">
        <div className="fallback" />
        {gl && <DiveScene cur={cur} onGate={onGate} onAction={onAction} onHover={onHover} onTyping={setTyping} />}
        {typing && <div className="dive-typing" role="status">Terminal focused · type <b>dive</b> then Enter · Esc to leave</div>}
        <div className="dive-tint" aria-hidden="true" />
        {flash && <div key={flash.k} className="dive-flash" style={{ ['--fh' as string]: flash.i < 0 ? '#bfe3ff' : GATES[flash.i].hue } as React.CSSProperties} aria-hidden="true" />}
        <div className="dive-vig" aria-hidden="true" />

        <div className="dive-intro" ref={intro}>
          <div className="wrap">
            <div className="hero-top rv" style={{ ['--i' as string]: 0 } as React.CSSProperties}>
              <span className="chip"><span className="dot" />Open to internships and entry-level roles</span>
              <span className="chip">CSE &apos;28 · DSATM · Bengaluru</span>
              <span className="chip">Product × AI/ML × Software</span>
            </div>
            <h1 id="h1" className="split" aria-label="I build products you can verify.">
              <span aria-hidden="true"><span className="ch" style={{ ['--c' as string]: 0 } as React.CSSProperties}><span>I</span></span> <span className="ch" style={{ ['--c' as string]: 1 } as React.CSSProperties}><span>build</span></span> <span className="ch" style={{ ['--c' as string]: 2 } as React.CSSProperties}><span>products</span></span></span><br />
              <span className="l2" aria-hidden="true"><span className="ch" style={{ ['--c' as string]: 4 } as React.CSSProperties}><span>you</span></span> <span className="ch" style={{ ['--c' as string]: 5 } as React.CSSProperties}><span>can</span></span> <span className="ch" style={{ ['--c' as string]: 6 } as React.CSSProperties}><span>verify.</span></span></span>
            </h1>
            <div className="hero-sub">
              <p className="rv" style={{ ['--i' as string]: 3 } as React.CSSProperties}>I am Vikas, a third-year computer-science student. I define products, write the requirements, make the architecture and privacy calls, and prove each claim with tests. <b>Scroll: over my shoulder, into the screen, and down.</b> Four gates, four products, every claim tagged with its evidence. Press <span className="kbd">V</span> to see the tags.</p>
              <div className="hero-cta rv" style={{ ['--i' as string]: 4 } as React.CSSProperties}>
                <a className="pill ghost arrow" href="#work" data-mag>Skip the dive</a>
                <a className="pill ghost arrow" href="/brief/" data-mag>30-second version</a>
                <a className="pill ghost arrow" href="#labs" data-mag>Run the engineering</a>
                <button className="pill ghost" type="button" onClick={copy}>Copy email</button>
              </div>
              <p className="mono dive-hint rv" style={{ ['--i' as string]: 5 } as React.CSSProperties}>Click things in the room: posters · lamp · window · coffee · monitors</p>
            </div>
            <div className="hero-meta rv" style={{ ['--i' as string]: 5 } as React.CSSProperties}>
              <div><b>4 + 5</b><span className="mono">core + secondary</span></div>
              <div><b>4,000+</b><span className="mono">automated tests, four core projects</span></div>
              <div><b>4</b><span className="mono">live labs</span></div>
              <div><b>0</b><span className="mono">accuracy claims without a test set</span></div>
            </div>
          </div>
        </div>

        {FLAGSHIP.map((p, i) => (
          <article className="dpanel" key={p.slug} ref={(el) => { panels.current[i] = el; }} style={{ ['--w' as string]: p.hue, opacity: 0, visibility: 'hidden' } as React.CSSProperties} aria-label={`Gate ${i + 1}: ${p.name}`}>
            <span className="mono dp-k">Gate 0{i + 1} · {GATE_INFO[i].name}</span>
            <h2>{p.name}</h2>
            <p className="dp-tag">{p.problem.headline}</p>
            <p className="dp-dec"><span className="mono">This gate declines</span> {GATE_INFO[i].declines}.</p>
            <div className="dp-stats">{p.proof.slice(0, 3).map((x) => <div key={x.label}><b>{x.n}</b><span>{x.label}</span><Ev k={x.ev} src={x.src} /></div>)}</div>
            <a className="pill" href={`/work/${p.slug}`} data-cursor="Enter">Enter {p.name} →</a>
          </article>
        ))}

        <div className="dive-end" ref={end} style={{ opacity: 0, visibility: 'hidden' }}>
          <p className="mono">The core</p>
          <h2>That was the surface.</h2>
          <p>Everything below is verifiable. Four core projects in depth, five secondary builds, four live engines to run, and every decision I turned down.</p>
          <p style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}><a className="pill" href="#work" data-mag>See the four core projects</a><a className="pill ghost" href="#labs" data-mag>Run a lab</a></p>
        </div>

        <div className="dive-hud" ref={hud} aria-hidden="true">
          <div className="hud-rail"><i /><b>{GATE_P.map((g, i) => <u key={i} style={{ top: `${g * 100}%`, ['--w' as string]: GATES[i].hue } as React.CSSProperties} />)}</b></div>
          <div className="hud-txt"><span className="mono">Depth</span><b data-layer>The desk</b><span className="mono" style={{ marginTop: 8 }}>Signals surviving</span><b data-surv>100%</b><span className="mono hud-note">illustration of the idea</span></div>
        </div>
        <span className="dive-cue" aria-hidden="true">↓ scroll to fall</span>
      </div>
    </section>
  );
}
