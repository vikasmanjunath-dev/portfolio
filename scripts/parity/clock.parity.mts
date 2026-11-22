// Compares src/labs/clock.ts with the Python engine on the cases from gen_clock_cases.py.
// Run:  node scripts/parity/clock.parity.mts   (Node 22.18+ strips TypeScript types natively)
import { evaluate } from '../../src/labs/clock.ts';
import fs from 'node:fs';
const cases = JSON.parse(fs.readFileSync(new URL('./clock_cases.json', import.meta.url), 'utf8'));
let bad = 0;
for (const c of cases) {
  const r = evaluate(c.in), o = c.out;
  const ok = r.coverage === o.coverage && r.baseDate === o.baseDate && r.dueDate === o.dueDate && r.effectiveDays === o.effectiveDays && r.overdueDays === o.overdueDays && Math.abs(r.interest - o.interest) < 0.011 && Math.abs(r.annualRatePct - o.rate) < 1e-6 && r.exposure === o.exposure;
  if (!ok) { bad++; console.log('MISMATCH', JSON.stringify(c.in)); }
}
console.log(`cases=${cases.length} mismatches=${bad}`);
process.exit(bad ? 1 : 0);
