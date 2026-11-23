'use client';
import { useMemo, useState } from 'react';
import { EV, type Ev } from '@/content/types';
import type { Claim } from '@/content/ledger';
import { Ev as Tag } from './bits';

export default function LedgerTable({ claims, counts }: { claims: Claim[]; counts: Record<Ev, number> }) {
  const [f, setF] = useState<Ev | 'all'>('all'); const [q, setQ] = useState('');
  const rows = useMemo(() => claims.filter((c) => (f === 'all' || c.ev === f) && `${c.project} ${c.label} ${c.value} ${c.src}`.toLowerCase().includes(q.toLowerCase())), [claims, f, q]);
  return (
    <>
      <div className="filters" role="group" aria-label="Filter claims by evidence class">
        <button className="fchip" type="button" aria-pressed={f === 'all'} onClick={() => setF('all')}>All · {claims.length}</button>
        {(Object.keys(EV) as Ev[]).map((k) => <button key={k} className="fchip" type="button" aria-pressed={f === k} onClick={() => setF(k)}>{EV[k].label} · {counts[k]}</button>)}
        <input className="fld-in" type="search" placeholder="Search claims, projects, sources" aria-label="Search claims" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginLeft: 'auto', minWidth: 240 }} />
      </div>
      <p className="lab-note" role="status">{rows.length} of {claims.length} claims</p>
      <div className="led" role="table" aria-label="Evidence ledger">
        <div className="led-h" role="row"><span>Project</span><span>Claim</span><span>Value</span><span>Evidence</span><span>Source</span></div>
        {rows.map((c, i) => (
          <div className="led-r" role="row" key={`${c.slug}-${c.where}-${c.label}-${i}`}>
            <a href={`/work/${c.slug}/`}>{c.project}</a><span>{c.label} <small className="pdim">· {c.where}</small></span><b>{c.value}</b><span><Tag k={c.ev} always /></span><span className="mono led-s">{c.src || 'see case file'}</span>
          </div>
        ))}
      </div>
    </>
  );
}
