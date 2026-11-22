import * as THREE from 'three';

/** Six original posters, drawn procedurally at high resolution. Aspect 1:√2 except the landscape one. */
const mono = 'ui-monospace, Menlo, Consolas, monospace';
const sans = 'ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';
const LIME = '#c6f135', BLUE = '#5ea1ff', CORAL = '#ff7a59', AMBER = '#ffc247';

type Draw = (x: CanvasRenderingContext2D, W: number, H: number) => void;
const txt = (x: CanvasRenderingContext2D, s: string, px: number, py: number, size: number, color: string, font = sans, weight = 700, align: CanvasTextAlign = 'left') => { x.font = `${weight} ${size}px ${font}`; x.fillStyle = color; x.textAlign = align; x.fillText(s, px, py); };

const metro: Draw = (x, W, H) => {
  x.fillStyle = '#0a0d18'; x.fillRect(0, 0, W, H); txt(x, 'THE STACK LINE', 70, 130, 84, '#f4f6ff', sans, 800); txt(x, 'MAP OF THE FOUR GATES · EVERY STATION IS A TEST', 72, 180, 26, '#8b98c8', mono, 500);
  const cx = W / 2, cy = H * 0.56;
  const lines: [string, [number, number][], string[]][] = [
    [LIME, [[-460, -260], [-160, -260], [-0, -100], [0, 0]], ['VERIFY', 'ARYA', 'VOICE', 'REELS']],
    [BLUE, [[470, -300], [190, -300], [0, 0]], ['CONSENT', 'ROUND', 'ROSTER']],
    [CORAL, [[-470, 280], [-180, 280], [0, 0]], ['PHOTO', 'TRY-ON', 'RULES']],
    [AMBER, [[460, 330], [190, 330], [0, 100], [0, 0]], ['TALLY', 'CLOCK', 'REMIND', 'PAY']],
  ];
  x.lineCap = 'round'; x.lineJoin = 'round';
  lines.forEach(([c, pts, names]) => {
    x.strokeStyle = c; x.lineWidth = 26; x.beginPath(); pts.forEach(([px, py], i) => (i ? x.lineTo(cx + px, cy + py) : x.moveTo(cx + px, cy + py))); x.stroke();
    names.forEach((n, i) => { const t = i / Math.max(1, names.length - 1); const k = Math.min(pts.length - 2, Math.floor(t * (pts.length - 1))); const lt = t * (pts.length - 1) - k; const px = cx + pts[k][0] + (pts[k + 1][0] - pts[k][0]) * lt, py = cy + pts[k][1] + (pts[k + 1][1] - pts[k][1]) * lt; if (i === names.length - 1 && pts[pts.length - 1][0] === 0 && pts[pts.length - 1][1] === 0) return; x.fillStyle = '#0a0d18'; x.beginPath(); x.arc(px, py, 19, 0, 7); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 8; x.stroke(); txt(x, n, px, py - 36, 24, '#f4f6ff', mono, 600, 'center'); });
  });
  x.fillStyle = '#fff'; x.beginPath(); x.arc(cx, cy, 44, 0, 7); x.fill(); x.fillStyle = '#0a0d18'; x.beginPath(); x.arc(cx, cy, 28, 0, 7); x.fill(); txt(x, 'ROOT OF TRUST', cx, cy + 92, 30, '#f4f6ff', sans, 800, 'center');
  txt(x, 'Change here for: evidence, rules, proof.', cx, H - 90, 26, '#8b98c8', mono, 500, 'center');
};

const bigo: Draw = (x, W, H) => {
  x.fillStyle = '#f3efe6'; x.fillRect(0, 0, W, H); txt(x, 'KNOW YOUR', 70, 150, 100, '#111', sans, 900); txt(x, 'COMPLEXITY.', 70, 250, 100, '#e0422b', sans, 900);
  const L = 110, R = W - 80, T = 360, B = H - 260; x.strokeStyle = '#111'; x.lineWidth = 6; x.beginPath(); x.moveTo(L, T); x.lineTo(L, B); x.lineTo(R, B); x.stroke();
  const curves: [string, string, (n: number) => number][] = [['O(1)', '#2a9d8f', () => 0.04], ['O(log n)', '#3a86ff', (n) => Math.log2(1 + n * 40) / 5.4], ['O(n)', '#111', (n) => n], ['O(n log n)', '#f4a300', (n) => (n * Math.log2(1 + n * 40)) / 5.4], ['O(n²)', '#e0422b', (n) => n * n], ['O(2ⁿ)', '#7b2cbf', (n) => (Math.pow(2, n * 7) - 1) / 127]];
  curves.forEach(([lab, c, f], k) => { x.strokeStyle = c; x.lineWidth = 9; x.beginPath(); for (let i = 0; i <= 120; i++) { const n = i / 120; const v = Math.min(1.05, f(n)); const px = L + n * (R - L), py = B - v * (B - T); i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); txt(x, lab, R - 10, T + 40 + k * 52, 36, c, mono, 700, 'right'); });
  txt(x, 'input size →', R, B + 56, 28, '#333', mono, 500, 'right'); txt(x, 'time ↑', L + 14, T - 20, 28, '#333', mono, 500);
  txt(x, 'Measure it. Then claim it.', 70, H - 120, 40, '#111', sans, 800); txt(x, 'vikas · nifty analyser · 321 tests', 70, H - 70, 24, '#555', mono, 500);
};

const verify: Draw = (x, W, H) => {
  x.fillStyle = '#05070c'; x.fillRect(0, 0, W, H); x.strokeStyle = 'rgba(198,241,53,.18)'; x.lineWidth = 2; for (let i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(70 + i * 110, 70); x.lineTo(70 + i * 110, H - 70); x.stroke(); } for (let i = 0; i <= 12; i++) { x.beginPath(); x.moveTo(70, 70 + i * 109); x.lineTo(W - 70, 70 + i * 109); x.stroke(); }
  ['VE', 'RI', 'FY'].forEach((s, i) => txt(x, s, 70, 400 + i * 330, 330, i === 2 ? LIME : '#f4f6ff', sans, 900));
  txt(x, 'TRUST IS A LAYER.', 80, H - 150, 46, LIME, mono, 700); txt(x, 'Every claim carries its evidence.', 80, H - 96, 28, '#8b98c8', mono, 500);
  x.fillStyle = LIME; x.fillRect(W - 190, 100, 120, 120); txt(x, '✓', W - 130, 205, 110, '#05070c', sans, 900, 'center');
};

const blueprint: Draw = (x, W, H) => {
  x.fillStyle = '#0b3d78'; x.fillRect(0, 0, W, H); x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = 1; for (let i = 0; i < W; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); } for (let i = 0; i < H; i += 32) { x.beginPath(); x.moveTo(0, i); x.lineTo(W, i); x.stroke(); }
  const oct = (r: number, w: number) => { x.lineWidth = w; x.beginPath(); for (let i = 0; i <= 8; i++) { const a = (i * Math.PI) / 4 + Math.PI / 8; const px = W / 2 + Math.cos(a) * r, py = 600 + Math.sin(a) * r; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); };
  x.strokeStyle = '#fff'; oct(330, 6); oct(280, 3); oct(200, 3); oct(120, 3); x.setLineDash([14, 10]); x.lineWidth = 2; x.beginPath(); x.moveTo(60, 600); x.lineTo(W - 60, 600); x.moveTo(W / 2, 230); x.lineTo(W / 2, 970); x.stroke(); x.setLineDash([]);
  x.lineWidth = 3; x.beginPath(); x.moveTo(W / 2 - 330, 1010); x.lineTo(W / 2 + 330, 1010); x.moveTo(W / 2 - 330, 995); x.lineTo(W / 2 - 330, 1025); x.moveTo(W / 2 + 330, 995); x.lineTo(W / 2 + 330, 1025); x.stroke(); txt(x, '18.0 m  (R 9.0)', W / 2, 1055, 26, '#fff', mono, 600, 'center');
  txt(x, 'GATE · SECTION A-A', 70, 130, 70, '#fff', sans, 800); txt(x, 'EGRESS BOUNDARY · 3 LAYERS', 72, 176, 26, '#bcd6ff', mono, 600);
  x.strokeStyle = '#fff'; x.lineWidth = 3; x.strokeRect(70, H - 290, W - 140, 220); ['LAYER 1  schema allow-list', 'LAYER 2  regex scrub', 'LAYER 3  outbound scanner  → BLOCK'].forEach((s, i) => txt(x, s, 100, H - 230 + i * 56, 30, '#fff', mono, 600));
};

const hello: Draw = (x, W, H) => {
  x.fillStyle = '#0d1117'; x.fillRect(0, 0, W, H); txt(x, 'HELLO,', 70, 190, 150, '#f0f6fc', sans, 900); txt(x, 'WORLD.', 70, 330, 150, '#58a6ff', sans, 900);
  const rows: [string, string, string][] = [['print("Hello, World")', 'Python', '#3572A5'], ['console.log("Hello, World")', 'TypeScript', '#3178c6'], ['println("Hello, World")', 'Kotlin', '#A97BFF'], ["SELECT 'Hello, World';", 'SQL', '#e38c00'], ['document.title = "Hello, World"', 'JavaScript', '#f1e05a']];
  rows.forEach(([code, lang, c], i) => { const y = 470 + i * 150; x.fillStyle = '#161b22'; x.fillRect(70, y - 70, W - 140, 112); x.fillStyle = c; x.fillRect(70, y - 70, 10, 112); txt(x, lang.toUpperCase(), 110, y - 24, 22, c, mono, 700); txt(x, code, 110, y + 22, 38, '#e6edf3', mono, 600); });
  txt(x, 'five languages · nine projects', 70, H - 90, 30, '#8b949e', mono, 500);
};

const blr: Draw = (x, W, H) => {
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1b1b4b'); g.addColorStop(0.5, '#e0527a'); g.addColorStop(0.78, '#ffb347'); g.addColorStop(1, '#ffe29a'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = 'rgba(255,255,255,.9)'; x.beginPath(); x.arc(W * 0.7, H * 0.62, H * 0.2, 0, 7); x.fill();
  x.fillStyle = '#1a1030'; let px = 0; const rnd = (() => { let s = 5; return () => (s = (s * 16807) % 2147483647) / 2147483647; })(); while (px < W) { const bw = 40 + rnd() * 70, bh = 60 + rnd() * 230; x.fillRect(px, H - 110 - bh, bw, bh + 110); px += bw + 4; }
  x.fillStyle = '#1a1030'; x.fillRect(W * 0.28, H - 330, W * 0.4, 230); x.beginPath(); x.arc(W * 0.48, H - 330, 70, Math.PI, 0); x.fill(); x.fillRect(W * 0.46, H - 440, 8, 60); x.fillStyle = '#ffd77a'; for (let i = 0; i < 9; i++) x.fillRect(W * 0.3 + i * 38, H - 280, 14, 70);
  txt(x, 'NAMMA', 70, 160, 120, '#fff', sans, 900); txt(x, 'BENGALURU', 70, 280, 120, '#fff', sans, 900); txt(x, 'where I learn to build', 74, 330, 32, '#ffe9c4', mono, 600);
};

export const POSTER_DRAW: Record<string, { draw: Draw; w: number; h: number }> = {
  metro: { draw: metro, w: 1024, h: 1448 }, bigo: { draw: bigo, w: 1024, h: 1448 }, verify: { draw: verify, w: 1024, h: 1448 },
  blueprint: { draw: blueprint, w: 1024, h: 1448 }, hello: { draw: hello, w: 1024, h: 1448 }, blr: { draw: blr, w: 1448, h: 1024 },
};

export function posterTexture(id: string, scale = 1) {
  const p = POSTER_DRAW[id]; const c = document.createElement('canvas'); c.width = Math.round(p.w * scale); c.height = Math.round(p.h * scale); const x = c.getContext('2d')!; x.scale(scale, scale); p.draw(x, p.w, p.h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
