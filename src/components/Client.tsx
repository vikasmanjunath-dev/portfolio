'use client';
import { useEffect, useRef, useState } from 'react';
import { NUMBERS, ESSAYS, ESSAY_ORDER, EMAIL, LINKEDIN, GITHUB, SITE_REPO, FORM_URL } from '@/content/site';
import { Ev, Rich, Split } from './bits';
import { useApp } from './Shell';

/* ───── Numbers wall: counters animate once when scrolled into view ───── */
function Count({ to, suffix }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null); const [v, setV] = useState(0); const [run, setRun] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const reduce = document.documentElement.classList.contains('reduce') || document.documentElement.classList.contains('zen');
    if (reduce) { setV(to); return; }
    const check = () => { if (el.getBoundingClientRect().top < innerHeight * 0.9) { setRun(true); return true; } return false; };
    if (check()) return;
    const iv = setInterval(() => { if (check()) clearInterval(iv); }, 250);
    return () => clearInterval(iv);
  }, [to]);
  useEffect(() => {
    if (!run) return; const t0 = Date.now(); const D = 1600;
    const iv = setInterval(() => { const p = Math.min(1, (Date.now() - t0) / D); setV(Math.round(to * (1 - Math.pow(1 - p, 4)))); if (p >= 1) clearInterval(iv); }, 40);
    const fin = setTimeout(() => setV(to), D + 300);
    return () => { clearInterval(iv); clearTimeout(fin); };
  }, [run, to]);
  return <span ref={ref}>{v.toLocaleString('en-IN')}{suffix ? <small>{suffix}</small> : null}</span>;
}

export function Numbers() {
  return (
    <section className="sec" id="proof" aria-labelledby="nH">
      <div className="wrap">
        <div className="sec-head"><p className="mono kicker rv">Proof</p><h2 className="h2" id="nH"><Split text="Numbers I can point at." /></h2><p className="lead rv">Each tile links to the case file that holds its source, date and limits. Tests prove rules; they are not a claim about real-world accuracy.</p></div>
        <div className="nums rv">
          {NUMBERS.map((n) => (
            <a key={n.label} href={`/work/${n.to}`} data-cursor="Open">
              <div className="v"><Count to={n.n} suffix={n.suffix} /></div>
              <b>{n.label}</b><span className="s">{n.sub}</span><span style={{ marginTop: 6 }}><Ev k={n.ev} always /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Writing ───── */
export function Writing() {
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    const on = (e: Event) => { setOpen((e as CustomEvent).detail as string); try { sessionStorage.removeItem('vm.pendingEssay'); } catch { /* ignore */ } };
    window.addEventListener('vm:essay', on);
    try { const p = sessionStorage.getItem('vm.pendingEssay'); if (p) { sessionStorage.removeItem('vm.pendingEssay'); setOpen(p); } } catch { /* ignore */ }
    return () => window.removeEventListener('vm:essay', on);
  }, []);
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); }; window.addEventListener('keydown', k); document.body.style.overflow = 'hidden'; return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; }; }, [open]);
  const e = open ? ESSAYS[open] : null;
  return (
    <section className="sec" id="writing" aria-labelledby="wrH">
      <div className="wrap">
        <div className="sec-head"><p className="mono kicker rv">Writing · how I think</p><h2 className="h2" id="wrH"><Split text="Six short essays on building things you can trust." /></h2></div>
        <div className="essays">
          {ESSAY_ORDER.map((k, i) => (
            <button key={k} className="essay rv" type="button" style={{ ['--i' as string]: i % 3 } as React.CSSProperties} onClick={() => setOpen(k)} data-cursor="Read">
              <span className="mono">{ESSAYS[k].m} min read</span><h3>{ESSAYS[k].t}</h3><p>{ESSAYS[k].d}</p>
            </button>
          ))}
        </div>
      </div>
      {e && (
        <div className="sheet-bg" onMouseDown={(ev) => { if (ev.target === ev.currentTarget) setOpen(null); }}>
          <article className="sheet" role="dialog" aria-modal="true" aria-label={e.t}>
            <button className="pill ghost sm" type="button" style={{ justifySelf: 'start' }} onClick={() => setOpen(null)}>Close · Esc</button>
            <span className="mono">{e.m} min read · <a href={`/writing/${open}/`}>Permalink</a></span>
            <h2>{e.t}</h2>
            {e.b.map((p, i) => <p key={i}><Rich>{p}</Rich></p>)}
          </article>
        </div>
      )}
    </section>
  );
}

/* ───── Contact ───── */
export function Contact() {
  const { toast } = useApp(); const [f, setF] = useState({ name: '', email: '', role: '', msg: '' });
  const copy = () => { const d = () => toast('Email copied'); try { navigator.clipboard.writeText(EMAIL).then(d, d); } catch { d(); } };
  const hp = useRef<HTMLInputElement>(null);
  const [st, setSt] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const send = (ev: React.FormEvent) => { ev.preventDefault(); if (FORM_URL) { if (hp.current?.value) { setSt('sent'); return; } setSt('sending'); fetch(FORM_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ name: f.name, email: f.email, role: f.role, message: f.msg, _subject: 'Portfolio message from ' + f.name, _replyto: f.email, _template: 'table' }) }).then((r) => r.json().then((j) => setSt(r.ok && j.success !== 'false' ? 'sent' : 'error'), () => setSt('error')), () => setSt('error')); return; } const body = `${f.msg}\n\n${f.name}\n${f.email}${f.role ? '\n' + f.role : ''}`; location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Opportunity for Vikas' + (f.role ? ' · ' + f.role : ''))}&body=${encodeURIComponent(body)}`; };
  const set = (k: string) => (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: ev.target.value });
  return (
    <>
      <section className="sec" id="contact" aria-labelledby="cH">
        <div className="wrap">
          <h2 className="big" id="cH"><Split text="Let’s build something people can trust." italicFrom={3} /></h2>
          <p className="lead rv" style={{ marginTop: 24 }}>Open to internships and entry-level roles in product, AI/ML and software. Tell me about the problem and I will take it from there.</p>
          <p className="mono rv" style={{ marginTop: 16 }}><span className="dot" />Available · class of 2028</p>
          <div className="cta-row rv">
            <a className="pill" href={`mailto:${EMAIL}`} data-mag>Email me</a>
            <button className="pill ghost" type="button" onClick={copy} data-mag>Copy email</button>
            <a className="pill ghost" href="/Vikas_Manjunath_Resume.pdf" download data-mag>Download résumé</a>
            <a className="pill ghost arrow" href={LINKEDIN} target="_blank" rel="noopener noreferrer" data-mag>LinkedIn</a>
            <a className="pill ghost arrow" href={GITHUB} target="_blank" rel="noopener noreferrer" data-mag>GitHub</a>
          </div>
          <div className="cgrid">
            <form className="form rv" onSubmit={send}>
              <h3 className="h3">Or write it here</h3>
              <p className="lab-note">{FORM_URL ? 'The message is sent to my inbox through the FormSubmit service. Nothing is stored on this site.' : 'This opens your email app with the message ready. Nothing is stored on this site.'}</p>
              <div className="f2"><label className="fld"><span>Your name</span><input required value={f.name} onChange={set('name')} autoComplete="name" /></label><label className="fld"><span>Your email</span><input required type="email" value={f.email} onChange={set('email')} autoComplete="email" /></label></div>
              <input ref={hp} name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, opacity: 0, height: 0, width: 0 }} />
              <label className="fld"><span>Role or team</span><input value={f.role} onChange={set('role')} /></label>
              <label className="fld"><span>Message</span><textarea required value={f.msg} onChange={set('msg')} /></label>
              <button className="pill" type="submit" style={{ justifySelf: 'start' }}>{FORM_URL ? (st === 'sending' ? 'Sending…' : 'Send message') : 'Open in my email app'}</button>
              {st === 'sent' && <p className="lab-note" role="status">Sent. I will reply by email.</p>}
              {st === 'error' && <p className="lab-note" role="alert">Could not send. Email {EMAIL} instead.</p>}
            </form>
            <div className="reach rv">
              <div><span className="mono">Email</span><b>{EMAIL}</b></div>
              <div><span className="mono">LinkedIn</span><b><a className="alink" href={LINKEDIN} target="_blank" rel="noopener noreferrer">linkedin.com/in/vikas-manjunath-</a></b></div>
              <div><span className="mono">GitHub</span><b><a className="alink" href={GITHUB} target="_blank" rel="noopener noreferrer">github.com/vikasmanjunath-dev</a></b></div>
              <div><span className="mono">Based in</span><b>Bengaluru, India</b></div>
              <div><span className="mono">Shortcuts</span><b><span className="kbd">⌘K</span> search · <span className="kbd">V</span> verify · <span className="kbd">Z</span> zen · <span className="kbd">T</span> theme</b></div>
            </div>
          </div>
        </div>
      </section>
      <footer className="foot wrap"><span>© 2026 Vikas Manjunath · Bengaluru · <a className="alink" href={LINKEDIN} target="_blank" rel="noopener noreferrer">LinkedIn</a> · <a className="alink" href={GITHUB} target="_blank" rel="noopener noreferrer">GitHub</a></span><span>Built with Next.js, Three.js and Lenis. Every claim tagged with its evidence. <a className="alink" href={SITE_REPO} target="_blank" rel="noopener noreferrer">Source code</a> · <a className="alink" href="/evidence/">Evidence ledger</a> · <a className="alink" href="/feed.xml">RSS</a></span></footer>
    </>
  );
}
