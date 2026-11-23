// Renders 1200x630 share cards for every case file and essay from the BUILT pages (run `npm run build` first).
// Usage: node scripts/og/make-og.mjs   (needs Chrome; set CHROME=/path if not on macOS default)
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
const root = resolve(import.meta.dirname, '../..'), out = join(root, 'out'), dest = join(root, 'public/og'), tmp = join(root, '.og-tmp');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const fonts = (f) => `file://${root}/node_modules/${f}`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const meta = (html, re) => (html.match(re) || [, ''])[1].replace(/&amp;/g, '&').replace(/&#x27;/g, '’').replace(/&quot;/g, '"');
mkdirSync(dest, { recursive: true }); mkdirSync(tmp, { recursive: true });
const jobs = [];
for (const [kind, label] of [['work', 'Case file'], ['writing', 'Essay']]) {
  if (!existsSync(join(out, kind))) continue;
  for (const slug of readdirSync(join(out, kind))) {
    const f = join(out, kind, slug, 'index.html'); if (!existsSync(f)) continue;
    const h = readFileSync(f, 'utf8');
    const t = meta(h, /<title>([^<]*)<\/title>/).replace(/ · Vikas Manjunath$/, '');
    const d = meta(h, /<meta name="description" content="([^"]*)"/);
    jobs.push({ id: `${kind}-${slug}`, label, t, d });
  }
}
const tpl = ({ label, t, d }) => `<!doctype html><meta charset=utf-8><style>
@font-face{font-family:IS;src:url(${fonts('@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2')})}
@font-face{font-family:G;font-weight:100 900;src:url(${fonts('@fontsource-variable/geist/files/geist-latin-wght-normal.woff2')})}
*{box-sizing:border-box;margin:0}body{width:1200px;height:630px;background:#03060f;color:#eef3ff;font-family:G,sans-serif;position:relative;overflow:hidden;padding:56px 64px}
.g{position:absolute;inset:0;background:linear-gradient(rgba(94,161,255,.08) 1px,transparent 1px) 0 0/48px 48px,linear-gradient(90deg,rgba(94,161,255,.08) 1px,transparent 1px) 0 0/48px 48px;-webkit-mask:radial-gradient(70% 90% at 80% 20%,#000,transparent)}
.b{position:absolute;right:-120px;top:-160px;width:700px;height:700px;border-radius:50%;background:radial-gradient(circle,rgba(201,255,61,.28),rgba(94,161,255,.22) 40%,transparent 70%)}
.k{font:500 20px/1 monospace;letter-spacing:.14em;text-transform:uppercase;color:#c9ff3d;position:relative}
h1{font:400 ${t.length > 60 ? 68 : t.length > 34 ? 84 : 112}px/.98 IS,serif;letter-spacing:-.02em;margin-top:34px;position:relative;max-width:1040px}
p{font-size:27px;line-height:1.4;color:#b7c4e0;max-width:960px;margin-top:26px;position:relative;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.r{position:absolute;left:64px;right:64px;bottom:46px;display:flex;justify-content:space-between;font:500 21px monospace;color:#b7c4e0}
</style><div class=g></div><div class=b></div><div class=k>Vikas Manjunath · ${esc(label)}</div><h1>${esc(t)}</h1><p>${esc(d)}</p>
<div class=r><span>Evidence-tagged: checkable · documented · self-reported</span><span>vikas-manjunath.vercel.app</span></div>`;
for (const j of jobs) {
  const html = join(tmp, `${j.id}.html`); writeFileSync(html, tpl(j));
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1200,630', '--virtual-time-budget=3000', `--screenshot=${join(dest, j.id + '.png')}`, `file://${html}`], { stdio: 'ignore' });
  console.log('og', j.id);
}
rmSync(tmp, { recursive: true, force: true });
