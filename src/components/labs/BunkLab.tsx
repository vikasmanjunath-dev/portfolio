'use client';
import { useState } from 'react';
import { attendance } from '@/labs/misc';

export default function BunkLab() {
  const [present, setPresent] = useState(62), [total, setTotal] = useState(80), [na, setNa] = useState(4), [target, setTarget] = useState(75);
  const a = attendance(present, total, na, target);
  const col = a.pct >= target + 5 ? 'var(--ok)' : a.pct >= target ? 'var(--self)' : '#ff7a7a';
  const R = 70, C = 2 * Math.PI * R;
  return (
    <div className="lab">
      <div className="lab-top"><div className="dots" aria-hidden="true"><i /><i /><i /></div><span className="mono">BunkBudget · attendance maths · from the project’s README</span><span className="ev doc" style={{ cursor: 'default' }}>Formulas as documented</span></div>
      <div className="lab-body">
        <div className="lab-in">
          <label className="fld"><span>Classes attended (present)</span><input type="number" min={0} value={present} onChange={(e) => setPresent(Math.max(0, Number(e.target.value)))} /></label>
          <label className="fld"><span>Classes conducted (total)</span><input type="number" min={0} value={total} onChange={(e) => setTotal(Math.max(0, Number(e.target.value)))} /></label>
          <label className="fld"><span>“No attendance” slots (NA)</span><input type="number" min={0} value={na} onChange={(e) => setNa(Math.max(0, Number(e.target.value)))} /></label>
          <div className="row2"><button className={`pill sm ${target === 75 ? '' : 'ghost'}`} type="button" onClick={() => setTarget(75)}>75% standard</button><button className={`pill sm ${target === 76 ? '' : 'ghost'}`} type="button" onClick={() => setTarget(76)}>76% safe</button></div>
          <p className="lab-note">NA slots are subtracted from the total, so % = present ÷ (total − NA). The data here is a fixed example; nothing is stored.</p>
        </div>
        <div className="lab-out" aria-live="polite">
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <svg width="170" height="170" viewBox="0 0 170 170" role="img" aria-label={`Attendance ${a.pct.toFixed(1)} percent`}>
              <circle cx="85" cy="85" r={R} fill="none" stroke="var(--line2)" strokeWidth="12" />
              <circle cx="85" cy="85" r={R} fill="none" stroke={col} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(Math.min(100, a.pct) / 100) * C} ${C}`} transform="rotate(-90 85 85)" style={{ transition: 'stroke-dasharray .6s var(--ease)' }} />
              <text x="85" y="92" textAnchor="middle" fill="var(--head)" fontFamily="var(--serif)" fontSize="38">{a.pct.toFixed(1)}%</text>
            </svg>
            <div className={`verdict ${a.mode === 'bunk' ? 'good' : a.mode === 'recover' ? 'bad' : ''}`} style={{ flex: 1, minWidth: 220 }}>
              <span className="mono">{a.mode === 'bunk' ? 'Bunk budget' : a.mode === 'recover' ? 'Recovery mode' : 'No data'}</span>
              <b style={{ color: 'var(--head)', fontSize: '1.15rem' }}>{a.mode === 'bunk' ? `You can skip ${a.n} more class${a.n === 1 ? '' : 'es'} and stay at or above ${target}%.` : a.mode === 'recover' ? `Attend the next ${a.n} classes in a row to reach ${target}%.` : 'Enter classes conducted.'}</b>
            </div>
          </div>
          <div className="code"><span className="d">counted = total − NA = </span>{a.counted}{'\n'}<span className="d">bunks  = ⌊(present − t·counted) ÷ t⌋{'\n'}needed = ⌈(t·counted − present) ÷ (1 − t)⌉   with t = {target / 100}</span></div>
        </div>
      </div>
    </div>
  );
}
