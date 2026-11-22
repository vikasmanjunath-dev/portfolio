/**
 * DueClock statutory-clock engine: a TypeScript port of dueclock/core/clock.py (clock-1.1.0), core path only
 * (no part-payment adjustments). Pure functions, no I/O, no LLM: the same inputs always give the same verdict.
 *
 * Rules (MSMED Act 2006 ss.15-16, Income Tax Act s.43B(h)); nothing here is legal advice:
 *  - Covered sellers: Udyam MICRO or SMALL manufacturers or service providers. Traders and MEDIUM/LARGE are not covered.
 *  - Due date = delivery date (or invoice date) + 15 days, or + agreed days capped at 45 with a written agreement.
 *  - Interest = 3x the RBI bank rate in force, compounded with monthly rests of 30 days, remainder pro rata.
 */

export type Category = 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'UNKNOWN';
export type Activity = 'MANUFACTURING' | 'SERVICES' | 'TRADING' | 'UNKNOWN';
export type RatePolicy = 'at_due_date' | 'through_period';

export const RULESET = { id: 'msmed-2006', noAgreementDays: 15, maxAgreementDays: 45, interestMultiplier: 3, restDays: 30, notCoveredDefaultDays: 30 };

/** Bank Rate history, as in dueclock/core/rates.py. Only the 2020 rows are confirmed against an RBI circular. */
export const BANK_RATES: { from: string; pct: number; confirmed: boolean }[] = [
  ['2017-08-02', 6.25, false], ['2018-06-06', 6.5, false], ['2018-08-01', 6.75, false], ['2019-02-07', 6.5, false], ['2019-04-04', 6.25, false],
  ['2019-06-06', 6.0, false], ['2019-08-07', 5.65, false], ['2019-10-04', 5.4, false], ['2020-03-27', 4.65, true], ['2020-05-22', 4.25, true],
  ['2022-05-04', 4.65, false], ['2022-06-08', 5.15, false], ['2022-08-05', 5.65, false], ['2022-09-30', 6.15, false], ['2022-12-07', 6.5, false],
  ['2023-02-08', 6.75, false], ['2025-02-07', 6.5, false], ['2025-04-09', 6.25, false], ['2025-06-06', 5.75, false], ['2025-12-05', 5.5, false],
  ['2026-10-07', 5.75, false],
].map(([from, pct, confirmed]) => ({ from: from as string, pct: pct as number, confirmed: confirmed as boolean }));
export const RATES_VERIFIED_THROUGH = '2026-11-19';
const STALE_AFTER_DAYS = 60;

const D = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d); };
const DAY = 86400000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
export const addDays = (isoDate: string, n: number) => iso(D(isoDate) + n * DAY);
export const diffDays = (a: string, b: string) => Math.round((D(a) - D(b)) / DAY);

export function rateOn(date: string): number {
  let cur = BANK_RATES[0].pct;
  for (const r of BANK_RATES) { if (D(r.from) <= D(date)) cur = r.pct; else break; }
  return cur;
}

const round2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;

export function compoundInterest(principal: number, overdueDays: number, annualRatePct: number, rest = RULESET.restDays): number {
  if (principal <= 0 || overdueDays <= 0) return 0;
  const mr = annualRatePct / 100 / 12;
  const full = Math.floor(overdueDays / rest), rem = overdueDays % rest;
  let amount = principal * Math.pow(1 + mr, full);
  if (rem) amount *= 1 + (mr * rem) / rest;
  return round2(amount - principal);
}

function interestThroughPeriod(principal: number, due: string, overdueDays: number): number {
  const full = Math.floor(overdueDays / RULESET.restDays), rem = overdueDays % RULESET.restDays;
  let amount = principal;
  for (let k = 0; k < full; k++) amount *= 1 + (rateOn(addDays(due, RULESET.restDays * k)) * RULESET.interestMultiplier) / 1200;
  if (rem) amount *= 1 + (((rateOn(addDays(due, RULESET.restDays * full)) * RULESET.interestMultiplier) / 1200) * rem) / RULESET.restDays;
  return round2(amount - principal);
}

export function financialYear(d: string): string {
  const [y, m] = d.split('-').map(Number);
  const fy = m >= 4 ? y : y - 1;
  return `FY ${fy}-${String(fy + 1).slice(-2)}`;
}

export type Input = {
  category: Category; activity: Activity;
  invoiceDate: string; deliveryDate?: string;
  hasAgreement: boolean; agreedDays: number;
  outstanding: number; asOf: string; policy: RatePolicy;
};
export type Output = {
  coverage: string; covered: boolean; baseDate: string; dueDate: string; capDays: number | null; effectiveDays: number;
  daysRemaining: number; overdueDays: number; isOverdue: boolean; annualRatePct: number; interest: number; total: number;
  exposure: boolean; fy: string; flags: string[]; trace: string[];
};

export function assessCoverage(cat: Category, act: Activity): string {
  if (act === 'TRADING') return 'NOT_COVERED_TRADER';
  if (cat === 'MEDIUM' || cat === 'LARGE') return 'NOT_COVERED_SIZE';
  if ((cat === 'MICRO' || cat === 'SMALL') && (act === 'MANUFACTURING' || act === 'SERVICES')) return 'COVERED';
  return 'UNKNOWN';
}

export function evaluate(i: Input): Output {
  const flags: string[] = [], trace: string[] = [];
  const base = i.deliveryDate || i.invoiceDate;
  trace.push(`base date = ${i.deliveryDate ? 'delivery' : 'invoice'} date ${base}`);
  trace.push(`rule set ${RULESET.id}`);
  const coverage = assessCoverage(i.category, i.activity);
  const covered = coverage === 'COVERED';
  if (coverage === 'UNKNOWN') flags.push('SUPPLIER_PROFILE_INCOMPLETE');
  let cap: number | null, days: number;
  if (covered) {
    if (i.hasAgreement) {
      cap = RULESET.maxAgreementDays;
      if (i.agreedDays <= 0) { days = RULESET.noAgreementDays; flags.push('AGREEMENT_DAYS_INVALID'); trace.push('written agreement without valid days: 15-day rule applied'); }
      else if (i.agreedDays > RULESET.maxAgreementDays) { days = RULESET.maxAgreementDays; flags.push('AGREEMENT_CAPPED'); trace.push(`agreed ${i.agreedDays} days capped at ${RULESET.maxAgreementDays} (MSMED s.15)`); }
      else { days = i.agreedDays; trace.push(`written agreement: ${days} days (cap ${RULESET.maxAgreementDays})`); }
    } else { cap = days = RULESET.noAgreementDays; trace.push('no written agreement: 15-day rule (MSMED s.15)'); }
  } else {
    cap = null;
    days = i.agreedDays > 0 ? i.agreedDays : RULESET.notCoveredDefaultDays;
    trace.push(`not covered (${coverage}): agreed terms of ${days} days, no statutory clock`);
  }
  const due = addDays(base, days);
  const remaining = diffDays(due, i.asOf);
  const outstanding = Math.max(0, round2(i.outstanding));
  const overdue = outstanding > 0 ? Math.max(0, diffDays(i.asOf, due)) : 0;
  const isOverdue = overdue > 0;
  const ratePct = rateOn(due) * RULESET.interestMultiplier;
  let interest = 0;
  if (covered && isOverdue) {
    interest = i.policy === 'through_period' ? interestThroughPeriod(outstanding, due, overdue) : compoundInterest(outstanding, overdue, ratePct);
    trace.push(`interest ${ratePct.toFixed(2)}% p.a. (${RULESET.interestMultiplier}x bank rate ${rateOn(due)}%), monthly rests of ${RULESET.restDays} days, ${overdue} days overdue`);
  }
  if (covered && isOverdue && D(due) < D(BANK_RATES[0].from)) { flags.push('RATE_BEFORE_TABLE'); trace.push(`due date ${due} is before the first rate row (${BANK_RATES[0].from}); the first row's rate is a placeholder`); }
  if (!BANK_RATES.every((r) => r.confirmed)) flags.push('RATE_TABLE_UNCONFIRMED');
  if (diffDays(i.asOf, RATES_VERIFIED_THROUGH) > STALE_AFTER_DAYS) flags.push('RATE_TABLE_STALE');
  const exposure = covered && isOverdue;
  if (exposure) trace.push('43B(h) exposure flagged; payment-basis rule awaits reviewer confirmation');
  return { coverage, covered, baseDate: base, dueDate: due, capDays: cap, effectiveDays: days, daysRemaining: remaining, overdueDays: overdue, isOverdue, annualRatePct: round2(ratePct * 10000) / 10000, interest, total: round2(outstanding + interest), exposure, fy: financialYear(i.asOf), flags, trace };
}

export const FLAG_HELP: Record<string, string> = {
  SUPPLIER_PROFILE_INCOMPLETE: 'Category or activity missing: coverage is UNKNOWN, never assumed.',
  AGREEMENT_CAPPED: 'Agreed days exceeded the statutory 45-day cap.',
  AGREEMENT_DAYS_INVALID: 'A written agreement was ticked but has no valid days: falls back to 15.',
  RATE_TABLE_UNCONFIRMED: 'Most bank-rate rows come from secondary sources and await confirmation against RBI Table 46.',
  RATE_TABLE_STALE: 'The rate table was last verified more than 60 days before the as-of date.',
  RATE_BEFORE_TABLE: 'The due date is before the first rate row, so the rate is a placeholder.',
};
