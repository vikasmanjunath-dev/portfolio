// Compares src/labs/akaar.ts with the real Python colour rules on cases from gen_akaar_cases.py.
import { rateLabs } from '../../src/labs/akaar.ts';
import fs from 'node:fs';
const cases = JSON.parse(fs.readFileSync(new URL('./akaar_cases.json', import.meta.url), 'utf8'));
const L = (o: any) => ({ L: o.L, C: o.C, h: o.h, a: 0, b: 0 });
const map: Record<string, string> = { great: 'Great', good: 'Good', okay: 'Okay', not_ideal: 'Not ideal' };
let bad = 0;
for (const c of cases) {
  const r = rateLabs(L(c.skin), c.g.map((g: any) => ({ hex: '#000000', share: g.share, lab: L(g) })));
  const rules = r.sentences.map((s) => s.rule);
  if (map[c.label] !== r.label || Math.abs(r.score - c.score) > 0.0011 || JSON.stringify(rules) !== JSON.stringify(c.rules)) { bad++; if (bad < 5) console.log('MISMATCH', JSON.stringify(c).slice(0, 200), '=>', r.label, r.score, rules); }
}
console.log(`cases=${cases.length} mismatches=${bad}`); process.exit(bad ? 1 : 0);
