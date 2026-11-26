import { CORE, SECONDARY, PROJECTS, tierLabel } from '@/content';
import { CERT_COUNT, COURSE_COUNT, CERT_IMAGES } from '@/content/certs';
import { PRINCIPLES, METHOD, TIMELINE, EDU, COURSEWORK, FAQ } from '@/content/site';
import { Ev, Rich, Split, Legend } from './bits';
import type { CSSProperties } from 'react';

const wv = (hue: string) => ({ ['--w' as string]: hue } as CSSProperties);

export function Ticker() {
  const items = ['FIN-OS · 120 pages · 90 calculators · 1,655 tests', 'VYBES LYNK · 283 database assertions · per-viewer privacy', 'AkaarAI · 0 accuracy claims without a test set', 'DueClock · 750 tests · 30/30 mutants killed', 'Secondary · OnlyMeta · RELAY AI · Nifty Analyser · Syndicate · BunkBudget'];
  const row = items.map((t, i) => <span key={i}><b>{t.split(' · ')[0]}</b> {t.split(' · ').slice(1).join(' · ')}<i /></span>);
  return <div className="ticker" aria-hidden="true"><div className="ticker-track">{row}{row}</div></div>;
}

export function Thesis() {
  return (
    <section className="sec" id="thesis" aria-labelledby="thH">
      <div className="wrap">
        <p className="mono kicker rv">The idea</p>
        <h2 id="thH" className="manifesto" style={{ marginTop: 22 }}>
          <Split text="Every portfolio says trust me. I would rather you could check." italicFrom={7} />
        </h2>
        <p className="lead rv" style={{ marginTop: 28 }}>Trust is a layer, not a slogan. Each of my four core products puts a gate in front of the user’s data or decision and lets some things through and declines others: FIN-OS verifies figures, VYBES LYNK rounds location per viewer, AkaarAI scores by rule, DueClock computes by rule. This site is built the same way: every claim carries an evidence tag, and the maths is runnable.</p>
        <div className="thesis-grid rv">
          {PRINCIPLES.map(([n, h, p]) => (<div key={n}><span className="n">{n}</span><h3>{h}</h3><p><Rich>{p}</Rich></p></div>))}
        </div>
        <div style={{ marginTop: 28 }} className="rv"><Legend /></div>
      </div>
    </section>
  );
}

export function Work() {
  return (
    <section className="sec" id="work" aria-labelledby="wH" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <div className="sec-head">
          <p className="mono kicker rv">Core projects · FIN-OS, VYBES LYNK, AkaarAI, DueClock</p>
          <div className="work-head">
            <h2 className="h2" id="wH"><Split text="Problem first. Then the system, the decisions and the proof." /></h2>
            <p className="lead rv" style={{ maxWidth: '40ch' }}>Each case file states the problem with numbers, the architecture, every layer of the stack with its version and reason, the decisions I rejected, and what is not proven yet.</p>
          </div>
        </div>
        <div className="work-rail">
          {CORE.map((p, i) => (
            <article className="pcard rv" data-tilt key={p.slug} style={{ ...wv(p.hue), ['--k' as string]: i } as CSSProperties}>
              <div>
                <div className="idx">{p.idx}</div>
                <h3>{p.name}</h3>
                <p style={{ marginBottom: 16 }}><span className={`status ${p.tone}`}>{p.status}</span></p>
                <p className="tag"><Rich>{p.tagline}</Rich></p>
                <div className="chips" style={{ marginTop: 20 }}>{p.languages.map((l) => <span className="tchip" key={l}>{l}</span>)}</div>
                <p style={{ marginTop: 26 }}><span className="more">Open case file →</span></p>
              </div>
              <div className="pcard-r">
                <div className="pq"><span className="mono">Problem</span><p>{p.problem.headline}</p></div>
                <div className="pq"><span className="mono">Solution</span><p>{p.solution.headline}</p></div>
                <div className="pstats">{p.proof.slice(0, 3).map((x) => <div key={x.label}><b>{x.n}</b><span>{x.label}</span><Ev k={x.ev} src={x.src} /></div>)}</div>
              </div>
              <a className="go" href={`/work/${p.slug}`} data-cursor="Open" aria-label={`Open the ${p.name} case file`} />
            </article>
          ))}
        </div>
        <p className="mono kicker rv" style={{ marginTop: 72 }}>Secondary builds · systems, research and coursework</p>
        <div className="mini-grid">
          {SECONDARY.map((p, i) => (
            <article className="mini rv" data-tilt key={p.slug} style={{ ...wv(p.hue), ['--i' as string]: i % 4 } as CSSProperties}>
              <span className="mono">{p.idx} · {tierLabel(p)}</span>
              <h4 aria-level={3}>{p.name}</h4>
              <p><Rich>{p.tagline}</Rich></p>
              <div className="chips">{p.languages.slice(0, 3).map((l) => <span className="tchip" key={l}>{l}</span>)}</div>
              <a className="go" href={`/work/${p.slug}`} data-cursor="Open" aria-label={`Open the ${p.name} case file`} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Method() {
  return (
    <section className="sec" id="method" aria-labelledby="mH">
      <div className="wrap">
        <div className="sec-head"><p className="mono kicker rv">Method</p><h2 className="h2" id="mH"><Split text="How a vague problem becomes a verified product." /></h2></div>
        <div className="method">
          {METHOD.map((m, i) => (
            <div className="mrow rv" key={m.step}>
              <span className="n">0{i + 1}</span>
              <h3>{m.step}<small>{m.line}</small></h3>
              <ul>{m.artifacts.map((a) => <li key={a}><Rich>{a}</Rich><Ev k="doc" src="project documents and test reports" /></li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Decisions() {
  const pick = CORE.flatMap((p) => p.decisions.slice(0, 3).map((d) => ({ p, d })));
  return (
    <section className="sec" id="decisions" aria-labelledby="dH">
      <div className="wrap">
        <div className="sec-head"><p className="mono kicker rv">Decisions wall · architecture decision records</p><h2 className="h2" id="dH"><Split text="The options I turned down matter more than the ones I shipped." /></h2><p className="lead rv">Twelve decisions from the four core projects: what I chose, what I rejected, and why. Every case file has the full list.</p></div>
        <div className="adr-grid">
          {pick.map(({ p, d }, i) => (
            <article className="adr rv" key={p.slug + d.q} style={{ ...wv(p.hue), ['--i' as string]: i % 3 } as CSSProperties}>
              <span className="proj">{p.name}</span>
              <h4 aria-level={3}>{d.q}</h4>
              <div className="row c"><b>Chose</b><span><Rich>{d.chose}</Rich></span></div>
              <div className="row r"><b>Not</b><span>{d.rejected}</span></div>
              <div className="row w"><b>Why</b><span><Rich>{d.why}</Rich></span></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Journey() {
  return (
    <section className="sec" id="journey" aria-labelledby="jH">
      <div className="wrap">
        <div className="sec-head"><p className="mono kicker rv">Build log</p><h2 className="h2" id="jH"><Split text="Dated, in order, from the projects’ own changelogs." /></h2></div>
        <div className="tl">
          {TIMELINE.map((t, i) => (
            <div className={`tl-i rv ${t.ev === 'self' ? 'plan' : ''}`} key={t.when + t.title} style={{ ['--i' as string]: i % 3 } as CSSProperties}>
              <span className="w">{t.when} · {t.tag}</span>
              <h4 aria-level={3}>{t.title}<Ev k={t.ev} /></h4>
              <p>{t.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section className="sec" id="about" aria-labelledby="aH">
      <div className="wrap about-grid">
        <div>
          <p className="mono kicker rv">About</p>
          <h2 className="h2" id="aH" style={{ margin: '18px 0 24px' }}><Split text="A student who treats every project as a product." /></h2>
          <p className="lead rv">I am a third-year B.E. Computer Science student at Dayananda Sagar Academy of Technology and Management, Bengaluru, graduating in 2028. I turn ideas into products people can trust: I have led the product definition of four products across finance, campus life, retail and small business, from understanding the user to writing the requirements and shaping the technical design.</p>
          <p className="lead rv" style={{ marginTop: 16 }}>I work with Claude Code as my pair-programmer and keep the judgement for myself: scope, privacy, rules and proof. I am looking for internships and entry-level roles in product, AI/ML and software.</p>
          <p className="mono kicker" style={{ marginTop: 40 }}>Coursework that became code</p>
          <ul className="bullets" style={{ marginTop: 14 }}>{COURSEWORK.map(([a, b]) => <li key={a}><b style={{ color: 'var(--head)', fontWeight: 500 }}>{a}</b>: {b}</li>)}</ul>
        </div>
        <div>
          <div className="edu rv">{EDU.map((e) => <div key={e.when}><div><b>{e.score}</b><small>{e.label}</small></div><div><span className="mono">{e.when}</span><p style={{ marginTop: 4 }}>{e.what}</p></div></div>)}</div>
          <p className="mono kicker" style={{ marginTop: 40 }}>Events and certificates</p>
          <p className="lead rv" style={{ marginTop: 14 }}><b style={{ color: 'var(--head)', fontWeight: 500 }}>{CERT_COUNT}</b> participation certificates (hackathons, expos and masterclasses; none is a win) and <b style={{ color: 'var(--head)', fontWeight: 500 }}>{COURSE_COUNT}</b> course certificates from IBM SkillsBuild, the University of Michigan, Infosys Springboard, Great Learning, Cursa and LinkedIn Learning. {CERT_IMAGES} have their certificate image on the page.</p>
          <p style={{ marginTop: 14 }}><a className="alink" href="/certificates/">See every certificate, with photos →</a></p>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="sec" id="faq" aria-labelledby="fH">
      <div className="wrap" style={{ maxWidth: 1000 }}>
        <div className="sec-head"><p className="mono kicker rv">Questions a recruiter would ask</p><h2 className="h2" id="fH"><Split text="Straight answers, including the uncomfortable ones." /></h2></div>
        <div className="faq">{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p><Rich>{a}</Rich></p></details>)}</div>
      </div>
    </section>
  );
}
