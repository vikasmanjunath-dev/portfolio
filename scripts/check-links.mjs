// Crawls the built site (out/) and fails on any broken internal link, asset or #anchor.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
const out = resolve(import.meta.dirname, '../out');
const pages = []; (function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && pages.push(p); } })(out);
const file = (u) => { const p = join(out, decodeURI(u)); for (const c of [p, join(p, 'index.html'), p + '.html']) if (existsSync(c) && statSync(c).isFile()) return c; return null; };
const ids = new Map(); const idsOf = (f) => ids.get(f) ?? ids.set(f, new Set([...readFileSync(f, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))).get(f);
const bad = []; let n = 0;
for (const pg of pages) {
  if (pg.endsWith('404.html')) continue;
  const html = readFileSync(pg, 'utf8'), here = '/' + pg.slice(out.length + 1).replace(/index\.html$/, '');
  for (const [, , u] of html.matchAll(/\s(href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(u)) continue;
    n++; const [path, hash] = u.split('#'); const t = path ? (path.startsWith('/') ? path : new URL(path, 'http://x' + here).pathname) : here;
    const f = file(t); if (!f) { bad.push(`${here} -> ${u}`); continue; }
    if (hash && f.endsWith('.html') && !idsOf(f).has(hash)) bad.push(`${here} -> ${u} (no #${hash})`);
  }
}
console.log(`checked ${n} internal links in ${pages.length} pages`);
if (bad.length) { console.error('BROKEN:\n' + [...new Set(bad)].join('\n')); process.exit(1); }
