'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TECH, type Tech, type TechCat } from '@/content/site';
import { PROJECTS, isCore, tierLabel } from '@/content';
import { Ev, Split } from './bits';
import { useApp } from './Shell';

const CAT_COL: Record<TechCat, string> = { Language: '#c6f135', Frontend: '#7aa2ff', Backend: '#ff8a6b', Data: '#ffc247', 'AI / ML': '#d98cff', Security: '#4de3d0', Quality: '#8be28b', Infra: '#9db1e8', Graphics: '#fb923c', Product: '#f472b6' };
const CATS = Object.keys(CAT_COL) as TechCat[];

type N = { id: string; label: string; kind: 'tech' | 'proj'; cat?: TechCat; col: string; r: number; x: number; y: number; vx: number; vy: number; deg: number; fixed?: boolean };

export default function Constellation() {
  const { go, zen } = useApp();
  const wrap = useRef<HTMLDivElement>(null); const cv = useRef<HTMLCanvasElement>(null);
  const [sel, setSel] = useState<string | null>(null); const [cat, setCat] = useState<TechCat | 'All'>('All');
  const st = useRef({ hover: null as string | null, sel: null as string | null, cat: 'All' as TechCat | 'All', w: 800, h: 520, alpha: 1, drag: null as N | null, k: 1 });
  const { nodes, edges } = useMemo(() => {
    const ns: N[] = []; const idx = new Map<string, N>();
    PROJECTS.forEach((p) => { const n: N = { id: 'p:' + p.slug, label: p.name, kind: 'proj', col: p.hue, r: isCore(p) ? 12 : 6, x: 0, y: 0, vx: 0, vy: 0, deg: 0 }; ns.push(n); idx.set(n.id, n); });
    TECH.forEach((t) => { const n: N = { id: 't:' + t.id, label: t.name, kind: 'tech', cat: t.cat, col: CAT_COL[t.cat], r: 4 + Math.min(6, t.projects.length * 0.9), x: 0, y: 0, vx: 0, vy: 0, deg: 0 }; ns.push(n); idx.set(n.id, n); });
    const es: [N, N][] = [];
    TECH.forEach((t) => t.projects.forEach((s) => { const a = idx.get('t:' + t.id), b = idx.get('p:' + s); if (a && b) { es.push([a, b]); a.deg++; b.deg++; } }));
    ns.forEach((n, i) => { const a = (i / ns.length) * Math.PI * 2; const rr = n.kind === 'proj' ? 120 : 220; n.x = Math.cos(a) * rr; n.y = Math.sin(a) * rr; });
    return { nodes: ns, edges: es };
  }, []);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const nb = useMemo(() => { const m = new Map<string, Set<string>>(); nodes.forEach((n) => m.set(n.id, new Set())); edges.forEach(([a, b]) => { m.get(a.id)!.add(b.id); m.get(b.id)!.add(a.id); }); return m; }, [nodes, edges]);

  useEffect(() => { st.current.sel = sel; draw(); /* eslint-disable-next-line */ }, [sel]);
  useEffect(() => { st.current.cat = cat; draw(); /* eslint-disable-next-line */ }, [cat]);
  useEffect(() => {
    const on = (e: Event) => { const id = (e as CustomEvent).detail as string; setSel('t:' + id); try { sessionStorage.removeItem('vm.pending'); } catch { /* ignore */ } };
    window.addEventListener('vm:tech', on);
    try { const p = sessionStorage.getItem('vm.pending'); if (p) { sessionStorage.removeItem('vm.pending'); setSel(p); } } catch { /* ignore */ }
    return () => window.removeEventListener('vm:tech', on);
  }, []);

  function step() {
    const s = st.current; const k = s.alpha;
    for (let i = 0; i < nodes.length; i++) { const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) { const b = nodes[j]; let dx = a.x - b.x, dy = a.y - b.y; let d2 = dx * dx + dy * dy + 0.01; const d = Math.sqrt(d2); const f = (a.kind === 'proj' && b.kind === 'proj' ? 22000 : 3200) / d2 * k; dx /= d; dy /= d; if (!a.fixed) { a.vx += dx * f; a.vy += dy * f; } if (!b.fixed) { b.vx -= dx * f; b.vy -= dy * f; } } }
    edges.forEach(([a, b]) => { const dx = b.x - a.x, dy = b.y - a.y; const d = Math.sqrt(dx * dx + dy * dy) + 0.01; const f = (d - 120) * 0.02 * k; const fx = (dx / d) * f, fy = (dy / d) * f; if (!a.fixed) { a.vx += fx; a.vy += fy; } if (!b.fixed) { b.vx -= fx; b.vy -= fy; } });
    nodes.forEach((n) => { if (n.fixed) return; n.vx += -n.x * 0.004 * k; n.vy += -n.y * 0.008 * k; n.vx *= 0.82; n.vy *= 0.82; n.x += n.vx; n.y += n.vy; });
    s.alpha *= 0.985;
  }

  function draw() {
    const c = cv.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return;
    const s = st.current; const dpr = Math.min(devicePixelRatio || 1, 2);
    if (c.width !== Math.round(s.w * dpr) || c.height !== Math.round(s.h * dpr)) { c.width = Math.round(s.w * dpr); c.height = Math.round(s.h * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, s.w, s.h);
    const css = getComputedStyle(document.documentElement); const ink = css.getPropertyValue('--ink').trim() || '#eaf0ff'; const dim = css.getPropertyValue('--dim').trim() || '#8b98c8'; const line = css.getPropertyValue('--line2').trim() || '#445';
    let mx = 1, my = 1; nodes.forEach((n) => { mx = Math.max(mx, Math.abs(n.x) + 30); my = Math.max(my, Math.abs(n.y) + 26); });
    const target = Math.max(0.35, Math.min(2.4, Math.min((s.w / 2 - 30) / mx, (s.h / 2 - 22) / my))); s.k += (target - s.k) * (s.drag ? 0 : 0.15); const K = s.k;
    const bg = css.getPropertyValue('--bg').trim() || '#03060f';
    const cx = s.w / 2, cy = s.h / 2; const focus = s.sel || s.hover; const fset = focus ? new Set([focus, ...(nb.get(focus) || [])]) : null;
    const visible = (n: N) => n.kind === 'proj' || s.cat === 'All' || n.cat === s.cat;
    edges.forEach(([a, b]) => { if (!visible(a) || !visible(b)) return; const on = fset && fset.has(a.id) && fset.has(b.id) && (focus === a.id || focus === b.id); ctx.globalAlpha = fset ? (on ? 0.95 : 0.06) : 0.28; ctx.strokeStyle = on ? (a.kind === 'proj' ? a.col : b.col) : line; ctx.lineWidth = on ? 1.6 : 1; ctx.beginPath(); ctx.moveTo(cx + a.x * K, cy + a.y * K); ctx.lineTo(cx + b.x * K, cy + b.y * K); ctx.stroke(); });
    nodes.forEach((n) => {
      if (!visible(n)) return; const dimmed = fset && !fset.has(n.id); const x = cx + n.x * K, y = cy + n.y * K;
      ctx.globalAlpha = dimmed ? 0.14 : 1; ctx.fillStyle = n.col; ctx.beginPath(); ctx.arc(x, y, n.r, 0, 7); ctx.fill();
      if (n.kind === 'proj') { ctx.strokeStyle = n.col; ctx.globalAlpha = dimmed ? 0.1 : 0.5; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, n.r + 5, 0, 7); ctx.stroke(); }
      const showLabel = n.kind === 'proj' || (fset && fset.has(n.id) && !dimmed) || (s.cat !== 'All');
      if (showLabel) { ctx.globalAlpha = dimmed ? 0.2 : 1; ctx.fillStyle = n.kind === 'proj' ? ink : dim; ctx.font = n.kind === 'proj' ? '600 12px ui-sans-serif, system-ui' : '11px ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = bg; ctx.strokeText(n.label, x, y - n.r - 7); ctx.fillText(n.label, x, y - n.r - 7); }
    });
    ctx.globalAlpha = 1;
  }

  useEffect(() => {
    const el = wrap.current, c = cv.current; if (!el || !c) return; const s = st.current; let raf = 0; let on = true; let lastK = 0;
    const animate = !zen && !document.documentElement.classList.contains('reduce');
    const size = () => { s.w = el.clientWidth; s.h = c.clientHeight; draw(); };
    size(); const ro = new ResizeObserver(size); ro.observe(el);
    if (!animate) { s.alpha = 1; for (let i = 0; i < 420; i++) step(); s.k = 1; for (let i = 0; i < 40; i++) draw(); }
    else { const loop = () => { if (!on) return; if (s.alpha > 0.015 || s.drag) { step(); step(); draw(); } else if (Math.abs(s.k - lastK) > 0.001) { draw(); } lastK = s.k; raf = requestAnimationFrame(loop); }; loop(); }
    const pt = (e: PointerEvent) => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left - s.w / 2) / s.k, (e.clientY - r.top - s.h / 2) / s.k] as const; };
    const pick = (x: number, y: number) => { let best: N | null = null, bd = 1e9; nodes.forEach((n) => { if (n.kind === 'tech' && s.cat !== 'All' && n.cat !== s.cat) return; const d = Math.hypot(n.x - x, n.y - y); if (d < n.r + 10 && d < bd) { bd = d; best = n; } }); return best as N | null; };
    const move = (e: PointerEvent) => { const [x, y] = pt(e); if (s.drag) { s.drag.x = x; s.drag.y = y; s.alpha = Math.max(s.alpha, 0.3); if (!animate) draw(); return; } const n = pick(x, y); const id = n ? n.id : null; if (id !== s.hover) { s.hover = id; c.style.cursor = id ? 'pointer' : 'default'; draw(); } };
    let sx = 0, sy = 0;
    const down = (e: PointerEvent) => { const [x, y] = pt(e); const n = pick(x, y); sx = e.clientX; sy = e.clientY; if (n) { s.drag = n; n.fixed = true; c.setPointerCapture(e.pointerId); } };
    const up = (e: PointerEvent) => { const n = s.drag; s.drag = null; if (n) { n.fixed = false; if (Math.hypot(e.clientX - sx, e.clientY - sy) < 6) setSel((p) => (p === n.id ? null : n.id)); } else { const [x, y] = pt(e); if (!pick(x, y)) setSel(null); } };
    c.addEventListener('pointermove', move); c.addEventListener('pointerdown', down); c.addEventListener('pointerup', up);
    const leave = () => { s.hover = null; draw(); }; c.addEventListener('pointerleave', leave);
    const mo = new MutationObserver(draw); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => { on = false; cancelAnimationFrame(raf); ro.disconnect(); mo.disconnect(); c.removeEventListener('pointermove', move); c.removeEventListener('pointerdown', down); c.removeEventListener('pointerup', up); c.removeEventListener('pointerleave', leave); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zen]);

  const selN = sel ? byId.get(sel) : null;
  const selTech: Tech | undefined = selN?.kind === 'tech' ? TECH.find((t) => 't:' + t.id === sel) : undefined;
  const selProj = selN?.kind === 'proj' ? PROJECTS.find((p) => 'p:' + p.slug === sel) : undefined;
  const connected = selN ? [...(nb.get(selN.id) || [])].map((i) => byId.get(i)!) : [];

  return (
    <section className="sec" id="stack" aria-labelledby="sH">
      <div className="wrap">
        <div className="sec-head">
          <p className="mono kicker rv">Technology · {TECH.length} technologies · {PROJECTS.length} projects</p>
          <h2 className="h2" id="sH"><Split text="Every tool, tied to the project that proves it." /></h2>
          <p className="lead rv">Click a technology to see where I used it and why. Click a project to see its stack. Evidence tags mark what is checkable, documented or only my word: the résumé lists C and C++, and no project here uses them, so they are tagged self-reported.</p>
        </div>
        <div className="const rv" ref={wrap}>
          <canvas ref={cv} role="img" aria-label="Network of technologies and the projects that use them. The same information is listed in the table below." />
          <div className="const-legend" aria-hidden="true">{CATS.map((k) => <span key={k}><i style={{ background: CAT_COL[k] }} />{k}</span>)}</div>
          {selN && (
            <div className="const-panel" role="region" aria-label="Selection details">
              <span className="mono" style={{ color: selN.col }}>{selN.kind === 'tech' ? selTech!.cat : tierLabel(selProj!)}</span>
              <h4 aria-level={3}>{selN.label}{selTech?.ver ? <small style={{ fontFamily: 'var(--mono)', fontSize: '.7rem', color: 'var(--dim)', marginLeft: 8 }}>{selTech.ver}</small> : null}</h4>
              <p>{selTech ? selTech.note : selProj!.tagline}</p>
              {selTech && <Ev k={selTech.ev} always />}
              <div className="chips">{connected.map((n) => n.kind === 'proj'
                ? <button key={n.id} type="button" className="tchip" onClick={() => go('/work/' + n.id.slice(2))}>{n.label} →</button>
                : <button key={n.id} type="button" className="tchip" onClick={() => setSel(n.id)}>{n.label}</button>)}</div>
              {selTech && selTech.projects.length === 0 && <p>No project on this site uses it.</p>}
            </div>
          )}
        </div>
        <div className="filters" role="group" aria-label="Filter the technology list by category">
          <button className="fchip" type="button" aria-pressed={cat === 'All'} onClick={() => setCat('All')}>All</button>
          {CATS.map((k) => <button className="fchip" type="button" key={k} aria-pressed={cat === k} onClick={() => setCat(k)}>{k}</button>)}
        </div>
        <div className="scroll-x rv">
          <table className="tbl">
            <thead><tr><th>Technology</th><th>Category</th><th>Version</th><th>Where, and what for</th><th>Evidence</th></tr></thead>
            <tbody>
              {TECH.filter((t) => cat === 'All' || t.cat === cat).map((t) => (
                <tr key={t.id}><td><b style={{ color: 'var(--head)', fontWeight: 500 }}>{t.name}</b></td><td>{t.cat}</td><td>{t.ver || '–'}</td>
                  <td>{t.note}<div className="chips" style={{ marginTop: 6 }}>{t.projects.map((s) => <a key={s} className="tchip" href={`/work/${s}`}>{PROJECTS.find((p) => p.slug === s)?.name}</a>)}</div></td>
                  <td><Ev k={t.ev} always /></td></tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
