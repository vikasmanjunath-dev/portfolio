'use client';
import { useMemo, useState } from 'react';
import { evaluate, FLAG_HELP, BANK_RATES, type Input, type Category, type Activity, type RatePolicy, addDays } from '@/labs/clock';

const inr = (n: number) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ClockLab() {
  const [s, setS] = useState<Input>({ category: 'MICRO', activity: 'MANUFACTURING', invoiceDate: '2026-08-01', deliveryDate: '', hasAgreement: false, agreedDays: 30, outstanding: 500000, asOf: '2026-11-21', policy: 'at_due_date' });
  const set = <K extends keyof Input>(k: K, v: Input[K]) => setS((p) => ({ ...p, [k]: v }));
  const r = useMemo(() => evaluate({ ...s, deliveryDate: s.deliveryDate || undefined }), [s]);

  /* interest accrual curve for the same invoice, 0..360 days past due */
  const curve = useMemo(() => {
    const pts: [number, number][] = [];
    for (let d = 0; d <= 360; d += 10) { const o = evaluate({ ...s, deliveryDate: s.deliveryDate || undefined, asOf: addDays(r.dueDate, d) }); pts.push([d, o.interest]); }
    return pts;
  }, [s, r.dueDate]);
  const max = Math.max(1, ...curve.map((p) => p[1]));
  const W = 420, H = 130;
  const path = curve.map(([d, v], i) => `${i ? 'L' : 'M'}${(d / 360) * (W - 20) + 10},${H - 14 - (v / max) * (H - 30)}`).join(' ');
  const cx = r.isOverdue ? (Math.min(360, r.overdueDays) / 360) * (W - 20) + 10 : 10;

  return (
    <div className="lab">
      <div className="lab-top"><div className="dots" aria-hidden="true"><i /><i /><i /></div><span className="mono">DueClock clock engine · ported from dueclock/core/clock.py (clock-1.1.0)</span><span className="ev ok" style={{ cursor: 'default' }}>400 / 400 random cases match the Python engine</span></div>
      <div className="lab-body">
        <div className="lab-in">
          <div className="row2">
            <label className="fld"><span>Seller size (Udyam)</span><select value={s.category} onChange={(e) => set('category', e.target.value as Category)}>{['MICRO', 'SMALL', 'MEDIUM', 'LARGE', 'UNKNOWN'].map((x) => <option key={x}>{x}</option>)}</select></label>
            <label className="fld"><span>Activity</span><select value={s.activity} onChange={(e) => set('activity', e.target.value as Activity)}>{['MANUFACTURING', 'SERVICES', 'TRADING', 'UNKNOWN'].map((x) => <option key={x}>{x}</option>)}</select></label>
          </div>
          <div className="row2">
            <label className="fld"><span>Invoice date</span><input type="date" value={s.invoiceDate} onChange={(e) => set('invoiceDate', e.target.value)} /></label>
            <label className="fld"><span>Delivery date (optional)</span><input type="date" value={s.deliveryDate || ''} onChange={(e) => set('deliveryDate', e.target.value)} /></label>
          </div>
          <label className="toggle"><input type="checkbox" checked={s.hasAgreement} onChange={(e) => set('hasAgreement', e.target.checked)} /> Written agreement on payment terms</label>
          {s.hasAgreement && <label className="fld"><span>Agreed credit days (cap 45)</span><input type="number" min={0} max={365} value={s.agreedDays} onChange={(e) => set('agreedDays', Number(e.target.value))} /></label>}
          <div className="row2">
            <label className="fld"><span>Outstanding (₹)</span><input type="number" min={0} value={s.outstanding} onChange={(e) => set('outstanding', Number(e.target.value))} /></label>
            <label className="fld"><span>As of</span><input type="date" value={s.asOf} onChange={(e) => set('asOf', e.target.value)} /></label>
          </div>
          <label className="fld"><span>Bank-rate policy</span><select value={s.policy} onChange={(e) => set('policy', e.target.value as RatePolicy)}><option value="at_due_date">Rate in force on the due date (default)</option><option value="through_period">Rate in force in each month (ruling Q4)</option></select></label>
          <p className="lab-note">Educational. Not legal advice. The same inputs always give the same output: a rule engine, never an LLM. Try MEDIUM or TRADING to see coverage change, or tick the agreement and enter 60 days to see the 45-day cap.</p>
        </div>
        <div className="lab-out" aria-live="polite">
          <div className={`verdict ${r.covered ? (r.isOverdue ? 'bad' : 'good') : 'warn'}`}>
            <span className="mono">{r.coverage.replace(/_/g, ' ')}</span>
            <b style={{ color: 'var(--head)', fontSize: '1.15rem' }}>{!r.covered ? `No statutory clock. Agreed terms: ${r.effectiveDays} days.` : r.isOverdue ? `Overdue by ${r.overdueDays} days. Section 43B(h) exposure flagged.` : `${r.daysRemaining} days remaining before the statutory limit.`}</b>
          </div>
          <dl className="kv">
            <dt>Base date</dt><dd>{r.baseDate}</dd>
            <dt>Days allowed</dt><dd>{r.effectiveDays}{r.capDays ? ` (cap ${r.capDays})` : ''}</dd>
            <dt>Due date</dt><dd><b style={{ color: 'var(--head)' }}>{r.dueDate}</b></dd>
            <dt>Interest rate</dt><dd>{r.covered ? `${r.annualRatePct.toFixed(2)}% p.a. (3 × ${(r.annualRatePct / 3).toFixed(2)}% bank rate)` : 'n/a'}</dd>
            <dt>Interest owed</dt><dd><span className="big-num" style={{ fontSize: '2rem' }}>{inr(r.interest)}</span></dd>
            <dt>Total payable</dt><dd>{inr(r.total)}</dd>
            <dt>Financial year</dt><dd>{r.fy}</dd>
          </dl>
          {r.covered && (
            <div>
              <span className="mono">Interest accrual after the due date (monthly rests of 30 days)</span>
              <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Interest accrual curve" style={{ width: '100%', marginTop: 6 }}>
                <path d={path} fill="none" stroke="var(--lime)" strokeWidth="2" /><line x1={10} y1={H - 14} x2={W - 10} y2={H - 14} stroke="var(--line2)" />
                {r.isOverdue && <><line x1={cx} x2={cx} y1={8} y2={H - 14} stroke="var(--acc)" strokeDasharray="3 4" /><circle cx={cx} cy={H - 14 - (Math.min(r.interest, max) / max) * (H - 30)} r="4" fill="var(--head)" /></>}
                <text x={10} y={H - 2} fill="var(--dim)" fontSize="9" fontFamily="var(--mono)">0 d</text><text x={W - 10} y={H - 2} fill="var(--dim)" fontSize="9" textAnchor="end" fontFamily="var(--mono)">360 d past due</text>
              </svg>
            </div>
          )}
          {r.flags.length > 0 && <div><span className="mono">Review flags (open questions stay visible, never silently decided)</span><div style={{ marginTop: 8 }}>{r.flags.map((f) => <span className="flag" key={f} title={FLAG_HELP[f] || f}>{f}</span>)}</div></div>}
          <div><span className="mono">Rule trace</span><ul className="trace" style={{ marginTop: 6 }}>{r.trace.map((t, i) => <li key={i}>{t}</li>)}</ul></div>
          <p className="lab-note">Bank-rate table: {BANK_RATES.length} dated rows; only the 2020 rows are confirmed against an RBI circular, so every covered result carries RATE_TABLE_UNCONFIRMED.</p>
        </div>
      </div>
    </div>
  );
}
