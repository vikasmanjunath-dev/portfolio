// Lighthouse (mobile) score budget. Needs `npm run build` + a server on :4300 (npx serve out -l 4300).
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const BUDGET = [
  ['/', { performance: 0.7, accessibility: 0.98, 'best-practices': 0.95, seo: 0.95 }],
  ['/brief/', { performance: 0.9, accessibility: 0.98, 'best-practices': 0.95, seo: 0.95 }],
  ['/work/finos/', { performance: 0.8, accessibility: 0.98, 'best-practices': 0.95, seo: 0.95 }],
];
let fail = 0;
for (const [path, min] of BUDGET) {
  const o = `lh-${path.replace(/\W/g, '_')}.json`;
  execFileSync('npx', ['--yes', 'lighthouse@12', `http://localhost:4300${path}`, '--output=json', `--output-path=${o}`, '--quiet', '--chrome-flags=--headless=new --no-sandbox', '--only-categories=performance,accessibility,best-practices,seo'], { stdio: 'inherit' });
  const c = JSON.parse(readFileSync(o, 'utf8')).categories;
  for (const [k, m] of Object.entries(min)) { const s = c[k].score; const ok = s >= m; if (!ok) fail++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${path} ${k} ${s} (min ${m})`); }
}
process.exit(fail ? 1 : 0);
