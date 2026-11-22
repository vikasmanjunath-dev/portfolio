'use client';
import { useMemo, useState } from 'react';
import { emergencyFund, debtManagement, OTHER_PILLARS, tierOf, grade, inr } from '@/labs/finos';

export default function FinosLab() {
  const [income, setIncome] = useState(120000), [exp, setExp] = useState(60000), [liquid, setLiquid] = useState(240000);
  const [vol, setVol] = useState(40), [stab, setStab] = useState(70), [lf, setLf] = useState(true);
  const [emi, setEmi] = useState(30000), [cc, setCc] = useState(0), [pl, setPl] = useState(false), [car, setCar] = useState(false);
  const [others, setOthers] = useState(OTHER_PILLARS.map((p) => p.def));
  const ef = useMemo(() => emergencyFund({ monthlyExp: exp, income, liquid, vol, stab, liquidFund: lf }), [exp, income, liquid, vol, stab, lf]);
  const debt = useMemo(() => debtManagement({ income, emi, ccBal: cc, personalLoan: pl, carLoan: car }), [income, emi, cc, pl, car]);
  const rows = [{ name: ef.name, pts: ef.pts, max: ef.max, real: true }, { name: debt.name, pts: debt.pts, max: debt.max, real: true }, ...OTHER_PILLARS.map((p, i) => ({ name: p.name, pts: others[i], max: p.max, real: false }))];
  const total = rows.reduce((s, r) => s + r.pts, 0); const [, tier, col] = tierOf(total);
  const worst = [...rows].sort((a, b) => a.pts / a.max - b.pts / b.max)[0];
  const num = (v: number, f: (n: number) => void, step = 1000) => <input type="number" min={0} step={step} value={v} onChange={(e) => f(Math.max(0, Number(e.target.value)))} />;
  return (
    <div className="lab">
      <div className="lab-top"><div className="dots" aria-hidden="true"><i /><i /><i /></div><span className="mono">FIN-OS · financial health score (v2) · ported from services/alerts/health_score.py</span><span className="ev ok" style={{ cursor: 'default' }}>500 / 500 random cases match the Python pillars</span></div>
      <div className="lab-body">
        <div className="lab-in">
          <span className="mono">Shared</span>
          <label className="fld"><span>Monthly income (₹)</span>{num(income, setIncome)}</label>
          <span className="mono">Emergency fund pillar (ported)</span>
          <div className="row2"><label className="fld"><span>Monthly expenses (₹)</span>{num(exp, setExp)}</label><label className="fld"><span>Liquid savings (₹)</span>{num(liquid, setLiquid, 5000)}</label></div>
          <label className="fld"><span>Spending volatility: {vol}/100</span><input type="range" min={0} max={100} value={vol} onChange={(e) => setVol(+e.target.value)} /></label>
          <label className="fld"><span>Income stability: {stab}/100</span><input type="range" min={0} max={100} value={stab} onChange={(e) => setStab(+e.target.value)} /></label>
          <label className="toggle"><input type="checkbox" checked={lf} onChange={(e) => setLf(e.target.checked)} /> Held in a liquid fund</label>
          <span className="mono">Debt management pillar (ported)</span>
          <div className="row2"><label className="fld"><span>Monthly EMIs (₹)</span>{num(emi, setEmi)}</label><label className="fld"><span>Card balance (₹)</span>{num(cc, setCc)}</label></div>
          <label className="toggle"><input type="checkbox" checked={pl} onChange={(e) => setPl(e.target.checked)} /> Personal loan</label>
          <label className="toggle"><input type="checkbox" checked={car} onChange={(e) => setCar(e.target.checked)} /> Car loan</label>
          <span className="mono">Other six pillars (points set directly)</span>
          {OTHER_PILLARS.map((p, i) => <label className="fld" key={p.name}><span>{p.name}: {others[i]}/{p.max}</span><input type="range" min={0} max={p.max} value={others[i]} onChange={(e) => setOthers((o) => o.map((v, k) => (k === i ? +e.target.value : v)))} /></label>)}
          <p className="lab-note">Educational tooling, not financial advice. Emergency Fund and Debt Management run the real scoring rules; the other six need transactions, holdings or insurance data in the app.</p>
        </div>
        <div className="lab-out" aria-live="polite">
          <div className="verdict" style={{ borderColor: col, background: `color-mix(in srgb, ${col} 10%, transparent)` }}><span className="mono" style={{ color: col }}>{tier}</span><div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}><span className="big-num">{total}</span><span className="mono">/ 100</span></div><span className="lab-note">Lowest pillar: <b style={{ color: 'var(--head)' }}>{worst.name}</b> ({worst.pts}/{worst.max}). Tiers: 0-39 danger, 40-59 fair, 60-74 good, 75-89 great, 90+ elite.</span></div>
          <div style={{ display: 'grid', gap: 10 }}>
            {rows.map((r) => (<div key={r.name}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.84rem' }}><span>{r.name}{r.real ? <span className="ev ok" style={{ marginLeft: 8, cursor: 'default' }}>ported</span> : null}</span><span className="mono">{r.pts}/{r.max} · {grade(r.pts, r.max)}</span></div><div className="bar" style={{ marginTop: 4 }}><i style={{ width: `${(r.pts / r.max) * 100}%`, background: r.pts / r.max < 0.4 ? '#f04444' : r.pts / r.max < 0.7 ? '#ffc247' : 'var(--lime)' }} /></div></div>))}
          </div>
          <dl className="kv"><dt>Emergency fund</dt><dd>{ef.headline} · target {ef.target} months (6, +1 if volatile, +1 if unstable income)</dd><dt>Debt</dt><dd>{debt.headline}</dd></dl>
          {[...ef.tips, ...debt.tips].length > 0 && <div><span className="mono">Tips the engine would give</span><ul className="trace" style={{ marginTop: 6 }}>{[...ef.tips, ...debt.tips].map((t, i) => <li key={i}>{t}</li>)}</ul></div>}
          <p className="lab-note">Nothing you enter leaves your browser. In FIN-OS the same rules run on the user’s own data, locally.</p>
        </div>
      </div>
    </div>
  );
}
