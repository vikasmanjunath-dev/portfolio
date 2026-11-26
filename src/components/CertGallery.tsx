'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CERT_LIST, CERT_COUNT, COURSE_COUNT, type CertItem } from '@/content/certs';
import { Ev as Tag } from './bits';

type K = 'all' | 'event' | 'course';

export default function CertGallery() {
  const [k, setK] = useState<K>('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(-1);
  const dlg = useRef<HTMLDialogElement>(null);
  const rows = useMemo(() => CERT_LIST.filter((c) => (k === 'all' || c.kind === k) && `${c.title} ${c.group} ${c.org} ${c.date ?? ''}`.toLowerCase().includes(q.toLowerCase())), [k, q]);
  const groups = useMemo(() => {
    const m = new Map<string, CertItem[]>();
    rows.forEach((c) => { const key = `${c.kind}|${c.group}`; const a = m.get(key) ?? []; a.push(c); m.set(key, a); });
    return [...m.values()];
  }, [rows]);
  const cur = open >= 0 ? rows[open] : undefined;

  useEffect(() => {
    const d = dlg.current; if (!d) return;
    if (open >= 0 && !d.open) d.showModal();
    if (open < 0 && d.open) d.close();
  }, [open]);

  const step = (n: number) => setOpen((o) => { const t = o + n; return t < 0 || t >= rows.length ? o : t; });
  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); };

  return (
    <>
      <div className="filters" role="group" aria-label="Filter certificates">
        <button className="fchip" type="button" aria-pressed={k === 'all'} onClick={() => setK('all')}>All · {CERT_COUNT + COURSE_COUNT}</button>
        <button className="fchip" type="button" aria-pressed={k === 'event'} onClick={() => setK('event')}>Participation · {CERT_COUNT}</button>
        <button className="fchip" type="button" aria-pressed={k === 'course'} onClick={() => setK('course')}>Courses · {COURSE_COUNT}</button>
        <input className="fld-in" type="search" placeholder="Search title, event, provider" aria-label="Search certificates" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginLeft: 'auto', minWidth: 220 }} />
      </div>
      <p className="lab-note" role="status">{rows.length} of {CERT_LIST.length} certificates</p>

      {groups.map((g) => (
        <section key={`${g[0].kind}|${g[0].group}`} aria-label={g[0].group}>
          <div className="cg-gh">
            <h2>{g[0].group}</h2>
            <span className="mono pdim">{g[0].kind === 'event' ? 'participation' : 'course'} · {g.length}{g[0].org ? ` · ${g[0].org}` : ''}</span>
            <Tag k="doc" always />
          </div>
          <div className="cg-grid">
            {g.map((c) => {
              const idx = rows.indexOf(c);
              const inner = (
                <>
                  {c.img ? <img className="cg-th" src={c.img} width={c.w} height={c.h} loading="lazy" decoding="async" alt="" /> : <span className="cg-ph">Certificate image not available (posted as a link only)</span>}
                  <span className="cg-t">{c.title}</span>
                  <span className="mono cg-d pdim">{c.date ?? 'Date not on the certificate'}</span>
                </>
              );
              return c.img
                ? <button key={c.id} type="button" className="cg-card" onClick={() => setOpen(idx)} aria-label={`Open certificate: ${c.title}, ${c.group}`}>{inner}</button>
                : <div key={c.id} className="cg-card cg-static">{inner}</div>;
            })}
          </div>
        </section>
      ))}

      <dialog ref={dlg} className="cg-dlg" aria-label={cur ? `Certificate: ${cur.title}` : 'Certificate'} onClose={() => setOpen(-1)} onKeyDown={onKey} onClick={(e) => { if (e.target === dlg.current) setOpen(-1); }}>
        {cur && (
          <>
            <img src={cur.img} width={cur.w} height={cur.h} alt={`${cur.kind === 'event' ? 'Certificate of participation' : 'Course completion certificate'}: ${cur.title}, ${cur.group}${cur.date ? `, ${cur.date}` : ''}`} />
            <div className="cg-bar">
              <b className="cg-t" style={{ fontSize: '1rem' }}>{cur.title}</b>
              <span className="mono pdim">{cur.group}{cur.date ? ` · ${cur.date}` : ''}</span>
            </div>
            {cur.note && <p className="lab-note" style={{ marginTop: 6 }}>{cur.note}</p>}
            <div className="cg-bar">
              <button className="fchip" type="button" onClick={() => step(-1)} disabled={open <= 0}>← Previous</button>
              <button className="fchip" type="button" onClick={() => step(1)} disabled={open >= rows.length - 1}>Next →</button>
              <button className="fchip" type="button" onClick={() => setOpen(-1)} style={{ marginLeft: 'auto' }} autoFocus>Close (Esc)</button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
