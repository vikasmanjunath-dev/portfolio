/**
 * FIN-OS Financial Health Score: the Emergency Fund and Debt Management pillars are ported line for line from
 * Finos/Initial Deployment/services/alerts/health_score.py (v2). The other six pillars depend on transactions, holdings,
 * insurance and goal data, so the lab takes their points directly. Max points: 16/16/16/16/12/12/6/6 = 100.
 */
export const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
export const grade = (score: number, max: number) => { const p = max ? score / max : 0; return p >= 0.95 ? 'A+' : p >= 0.8 ? 'A' : p >= 0.65 ? 'B' : p >= 0.5 ? 'C' : p >= 0.3 ? 'D' : 'F'; };

export type EfIn = { monthlyExp: number; income: number; liquid: number; vol: number; stab: number; liquidFund: boolean };
export function emergencyFund(i: EfIn) {
  const MAX = 16; const exp = i.monthlyExp > 0 ? i.monthlyExp : i.income * 0.6 || 30000; /* as in the source: no expenses recorded falls back to 60% of income */
  const months = i.liquid / exp;
  let target = 6; if (i.vol > 60) target += 1; if (i.stab < 50) target += 1;
  const ratio = target ? months / target : 0;
  let pts = ratio >= 1 ? 16 : ratio >= 0.8 ? 14 : ratio >= 0.6 ? 11 : ratio >= 0.4 ? 7 : ratio >= 0.2 ? 4 : ratio >= 0.1 ? 2 : 0;
  if (i.liquidFund) pts = Math.min(MAX, pts + 1);
  pts = Math.max(0, Math.min(MAX, pts));
  const tips: string[] = [];
  if (months < target) { tips.push(`Add ${inr(exp * (target - months))} to reach a ${target}-month buffer (your target, given income stability ${i.stab.toFixed(0)}/100)`); if (months < 1) tips.push('Keep the emergency fund in a liquid mutual fund, not stocks, not an FD'); }
  const headline = months < target ? `${months.toFixed(1)}/${target} months covered` : `${months.toFixed(0)} months covered: strong`;
  return { pts, max: MAX, months, target, ratio, headline, tips, name: 'Emergency Fund' };
}

export type DebtIn = { income: number; emi: number; ccBal: number; personalLoan: boolean; carLoan: boolean };
export function debtManagement(i: DebtIn) {
  const MAX = 16; const hasCc = i.ccBal > 500; const dsr = i.income ? i.emi / i.income : 0;
  let pts = dsr === 0 && !hasCc ? 16 : dsr <= 0.1 ? 14 : dsr <= 0.2 ? 11 : dsr <= 0.3 ? 8 : dsr <= 0.4 ? 4 : dsr <= 0.5 ? 2 : 0;
  if (hasCc && i.ccBal > 5000) pts = Math.max(0, pts - 5);
  if (i.personalLoan) pts = Math.max(0, pts - 2);
  if (i.carLoan) pts = Math.max(0, pts - 1);
  pts = Math.max(0, Math.min(MAX, pts));
  const tips: string[] = [];
  if (hasCc && i.ccBal > 5000) tips.push(`Clear the card debt of ${inr(i.ccBal)} first: it costs 36-42% p.a., compounding`);
  if (dsr > 0.4) tips.push(`EMIs are ${(dsr * 100).toFixed(0)}% of income: aim for under 35%. Consider foreclosing the personal loan first`);
  if (i.personalLoan && !hasCc) tips.push('The personal loan is the next priority after the card: typically 14-20% interest');
  const headline = dsr === 0 && !hasCc ? 'Debt-free' : `DSR: ${(dsr * 100).toFixed(0)}% of income${hasCc ? ' + card revolving' : ''}`;
  return { pts, max: MAX, dsr, headline, tips, name: 'Debt Management' };
}

export const OTHER_PILLARS: { name: string; max: number; def: number }[] = [
  { name: 'Savings & Discipline', max: 16, def: 10 }, { name: 'Investment Quality', max: 16, def: 9 }, { name: 'Insurance Coverage', max: 12, def: 7 },
  { name: 'Tax Efficiency', max: 12, def: 7 }, { name: 'Behavioral Health', max: 6, def: 4 }, { name: 'Goal Trajectory', max: 6, def: 3 },
];
export const TIERS: [number, string, string][] = [[90, 'ELITE', '#f0c040'], [75, 'GREAT', '#2dd4bf'], [60, 'GOOD', '#5ea1ff'], [40, 'FAIR', '#ffc247'], [0, 'DANGER', '#f04444']];
export const tierOf = (total: number) => TIERS.find(([t]) => total >= t)!;
