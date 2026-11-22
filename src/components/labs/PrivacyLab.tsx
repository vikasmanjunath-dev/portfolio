'use client';
import { useEffect, useRef, useState } from 'react';
import { publish, metersBetween, type Viewer } from '@/labs/misc';

/* Campus centre used by VYBES LYNK's seed config (marked unverified in DECISIONS.md). */
const LAT0 = 12.825089, LNG0 = 77.515091;
const M_LAT = 111320; const M_LNG = M_LAT * Math.cos((LAT0 * Math.PI) / 180);
const VIEW_M = 220; // metres across the canvas

export default function PrivacyLab() {
  const [viewer, setViewer] = useState<Viewer>('other');
  const [dx, setDx] = useState(37), [dy, setDy] = useState(-52);
  const cv = useRef<HTMLCanvasElement>(null);
  const lat = LAT0 + dy / M_LAT, lng = LNG0 + dx / M_LNG;
  const pub = publish(lat, lng, viewer);
  const err = pub ? metersBetween(lat, lng, pub.lat, pub.lng) : null;
  const cellM = pub ? Math.pow(10, -pub.dec) * M_LAT : 0;

  useEffect(() => {
    const c = cv.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return;
    const dpr = Math.min(devicePixelRatio || 1, 2); const w = c.clientWidth, h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(document.documentElement); const col = (n: string) => css.getPropertyValue(n).trim();
    const sc = w / VIEW_M; const X = (m: number) => w / 2 + m * sc, Y = (m: number) => h / 2 - m * sc;
    ctx.clearRect(0, 0, w, h);
    /* grid of the rounding cells for both tiers */
    const grid = (dec: number, stroke: string, lw: number) => {
      const step = Math.pow(10, -dec); ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.beginPath();
      const lat0 = Math.floor((LAT0 - (h / 2 / sc) / M_LAT) / step) * step, lat1 = LAT0 + (h / 2 / sc) / M_LAT;
      for (let a = lat0 - step / 2; a < lat1; a += step) { const y = Y((a - LAT0) * M_LAT); ctx.moveTo(0, y); ctx.lineTo(w, y); }
      const lng0 = Math.floor((LNG0 - (w / 2 / sc) / M_LNG) / step) * step, lng1 = LNG0 + (w / 2 / sc) / M_LNG;
      for (let b = lng0 - step / 2; b < lng1; b += step) { const x = X((b - LNG0) * M_LNG); ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      ctx.stroke();
    };
    grid(3, col('--line2'), 1);
    if (viewer === 'connection') grid(4, col('--line'), 0.5);
    /* published cell */
    if (pub) {
      const cell = Math.pow(10, -pub.dec); const px = (pub.lng - LNG0) * M_LNG, py = (pub.lat - LAT0) * M_LAT; const cm = cell * M_LAT;
      ctx.fillStyle = 'rgba(198,241,53,.14)'; ctx.strokeStyle = col('--acc'); ctx.lineWidth = 1.5; ctx.fillRect(X(px - cm / 2), Y(py + cm / 2), cm * sc, cm * sc); ctx.strokeRect(X(px - cm / 2), Y(py + cm / 2), cm * sc, cm * sc);
      ctx.fillStyle = col('--acc'); ctx.beginPath(); ctx.arc(X(px), Y(py), 6, 0, 7); ctx.fill();
      ctx.fillStyle = col('--head'); ctx.font = '11px ui-monospace, monospace'; ctx.fillText(viewer === 'connection' ? 'what a connection sees' : 'what everyone else sees', X(px) + 10, Y(py) - 10);
    }
    /* exact position: only the owner (and the database) knows it */
    ctx.setLineDash([3, 4]); ctx.strokeStyle = '#ff7a7a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(dx), Y(dy), 7, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#ff7a7a'; ctx.font = '11px ui-monospace, monospace'; { const t = 'exact (stored, never served)'; const tw = ctx.measureText(t).width; ctx.fillText(t, X(dx) + 12 + tw > w - 6 ? X(dx) - 12 - tw : X(dx) + 12, Y(dy) + 14); }
    if (!pub) { ctx.fillStyle = col('--head'); ctx.font = '600 14px ui-sans-serif, system-ui'; ctx.textAlign = 'center'; ctx.fillText('Ghost mode: nothing is returned', w / 2, 28); ctx.textAlign = 'start'; }
  }, [viewer, dx, dy, pub]);

  const drag = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.buttons !== 1 && e.type !== 'pointerdown') return; const r = e.currentTarget.getBoundingClientRect(); const sc = r.width / VIEW_M;
    setDx(Math.round(((e.clientX - r.left) - r.width / 2) / sc)); setDy(Math.round(-((e.clientY - r.top) - r.height / 2) / sc));
  };

  return (
    <div className="lab">
      <div className="lab-top"><div className="dots" aria-hidden="true"><i /><i /><i /></div><span className="mono">VYBES LYNK · per-viewer location rounding, as the database does it</span><span className="ev doc" style={{ cursor: 'default' }}>Rule from supabase migrations g2, g3</span></div>
      <div className="lab-body">
        <div className="lab-in">
          <fieldset style={{ border: 0, display: 'grid', gap: 8 }}>
            <legend className="mono" style={{ marginBottom: 8 }}>Who is looking at the map?</legend>
            {([['connection', 'An accepted connection', 'round(lat, 4) ≈ 11 m'], ['other', 'Another student on campus', 'round(lat, 3) ≈ 111 m grid cell'], ['ghost', 'Anyone, while I am in Ghost mode', 'nothing returned']] as [Viewer, string, string][]).map(([v, l, h]) => (
              <label className="toggle" key={v}><input type="radio" name="viewer" checked={viewer === v} onChange={() => setViewer(v)} /> <span>{l}<br /><span className="mono" style={{ fontSize: '.64rem' }}>{h}</span></span></label>
            ))}
          </fieldset>
          <label className="fld"><span>My real position, east-west offset: {dx} m</span><input type="range" min={-100} max={100} value={dx} onChange={(e) => setDx(Number(e.target.value))} /></label>
          <label className="fld"><span>North-south offset: {dy} m</span><input type="range" min={-100} max={100} value={dy} onChange={(e) => setDy(Number(e.target.value))} /></label>
          <p className="lab-note">Drag on the map too. Location is off by default; this view only exists after a student turns “Go live” on, and that consent is logged on the server. Only the latest position is stored. Campus centre is the seed value from the project’s config, marked unverified there.</p>
        </div>
        <div className="lab-out">
          <canvas ref={cv} className="canvas-lab" onPointerDown={drag} onPointerMove={drag} role="img" aria-label="Map showing the exact position and the rounded position a viewer receives" style={{ touchAction: 'none', cursor: 'crosshair' }} />
          <dl className="kv" aria-live="polite">
            <dt>Stored (exact)</dt><dd>{lat.toFixed(7)}, {lng.toFixed(7)}</dd>
            <dt>Served to viewer</dt><dd>{pub ? <b style={{ color: 'var(--head)' }}>{pub.lat.toFixed(pub.dec)}, {pub.lng.toFixed(pub.dec)}</b> : <b style={{ color: 'var(--head)' }}>null (hidden)</b>}</dd>
            <dt>Error introduced</dt><dd>{err === null ? 'n/a' : `${err.toFixed(1)} m (cell ≈ ${cellM.toFixed(0)} m wide)`}</dd>
            <dt>Enforced where</dt><dd>In a Postgres function, so a client bug cannot bypass it. 283 database assertions test the rule.</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
