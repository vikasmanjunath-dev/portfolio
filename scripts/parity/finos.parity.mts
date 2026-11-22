// Compares src/labs/finos.ts with the real FIN-OS health score pillars (Emergency Fund, Debt Management).
import { emergencyFund, debtManagement } from '../../src/labs/finos.ts';
import fs from 'node:fs';
const cases = JSON.parse(fs.readFileSync(new URL('./finos_cases.json', import.meta.url), 'utf8')); let bad = 0;
for (const c of cases) { const e = emergencyFund({ ...c.ef, income: c.debt.income }), d = debtManagement(c.debt); if (e.pts !== c.efPts || e.target !== c.efTarget || d.pts !== c.debtPts) { bad++; if (bad < 5) console.log('MISMATCH', JSON.stringify(c).slice(0, 220), e.pts, e.target, d.pts); } }
console.log(`cases=${cases.length} mismatches=${bad}`); process.exit(bad ? 1 : 0);
