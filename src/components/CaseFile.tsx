import type { CSSProperties } from 'react';
import { CORE, SECONDARY, isCore, tierLabel, type Project } from '@/content';
import { Ev, Rich, Legend } from './bits';
import ArchDiagram from './ArchDiagram';
import { LabById } from './Labs';
import { RUN } from '@/content/run';
import LabClip from './LabClip';
const CLIP: Record<string, string> = { finos: 'finos', 'vybes-lynk': 'vybes', akaarai: 'akaar', dueclock: 'clock' };
import { LAB_META } from '@/content/labmeta';
import CaseToc from './CaseToc';

const SECTIONS: [string, string][] = [['problem', 'Problem'], ['solution', 'Solution'], ['architecture', 'Architecture'], ['stack', 'Stack'], ['spec', 'Spec sheet'], ['decisions', 'Decisions'], ['hard', 'Hard problems'], ['proof', 'Proof'], ['run', 'Run it yourself'], ['limits', 'Not proven'], ['skills', 'Skills']];

export default function CaseFile({ p }: { p: Project }) {
  const pool = isCore(p) ? CORE : SECONDARY; const i = pool.findIndex((x) => x.slug === p.slug);
  const prev = pool[(i - 1 + pool.length) % pool.length], next = pool[(i + 1) % pool.length];
  const toc = [...SECTIONS.slice(0, 5), ...(p.lab ? [['lab', 'Live lab'] as [string, string]] : []), ...SECTIONS.slice(5).filter(([id]) => id !== 'run' || RUN[p.slug])];
  const words = p.name.split(' ');
  return (
    <main id="main" style={{ ['--w' as string]: p.hue } as CSSProperties}>
      <section className="case-hero">
        <div className="wrap">
          <div className="crumb"><a className="mono alink" href="/#work">← All work</a><span className="mono">/</span><span className="mono">{p.idx} · {tierLabel(p)}</span><span className={`status ${p.tone}`}>{p.status}</span></div>
          <h1>{words.length > 1 ? <>{words.slice(0, -1).join(' ')} <span>{words[words.length - 1]}</span></> : <span>{p.name}</span>}</h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: '58ch', color: 'var(--ink)' }}><Rich here>{p.tagline}</Rich></p>
          <div className="case-meta">
            <div><span className="mono">Period</span><b>{p.period}</b></div>
            <div><span className="mono">My role</span><b>{p.role}</b></div>
            <div><span className="mono">Languages</span><b>{p.languages.join(' · ')}</b></div>
            {p.link && <div><span className="mono">Live</span><b><a className="alink" href={p.link.href} target="_blank" rel="noopener noreferrer">{p.link.text} ↗</a></b></div>}
            {p.team && <div><span className="mono">Team</span><b>{p.team}</b></div>}
          </div>
          <div style={{ marginTop: 22 }}><Legend /></div>
        </div>
      </section>

      <div className="wrap case-layout">
        <CaseToc items={toc} />
        <div>
          <section className="cs rv" id="problem"><span className="mono k">01 · Problem</span>
            <h2>{p.problem.headline}</h2>
            <div className="prose">{p.problem.context.map((c, k) => <p key={k}><Rich here>{c}</Rich></p>)}</div>
            <div className="stakes">{p.problem.stakes.map(([a, b, ev, src]) => <div key={a}><b>{a}</b><span><Rich>{b}</Rich></span><Ev k={ev} src={src} always /></div>)}</div>
            <p className="mono" style={{ margin: '28px 0 12px' }}>Constraints the design had to respect</p>
            <ul className="bullets">{p.constraints.map((c) => <li key={c}><Rich here>{c}</Rich></li>)}</ul>
          </section>

          <section className="cs rv" id="solution"><span className="mono k">02 · Solution</span>
            <h2>{p.solution.headline}</h2>
            <div className="prose">{p.solution.body.map((c, k) => <p key={k}><Rich here>{c}</Rich></p>)}</div>
            <div className="feat">{p.solution.features.map(([a, b]) => <div className="vclaim" key={a}><b>{a}<Ev k={p.lab ? 'ok' : 'doc'} src={p.lab ? 'runnable in the lab below, plus project docs' : 'described in the project’s own docs; see the spec sheet for sources'} /></b><span><Rich>{b}</Rich></span></div>)}</div>
            {p.shots && (<>
              <div className="shots">{p.shots.filter((s) => !s.wide).map((s) => <figure key={s.n}><img src={`/shots/${s.n}.webp`} alt={s.alt} loading="lazy" width={260} height={554} /><figcaption>{s.cap}</figcaption></figure>)}</div>
              {p.shots.some((s) => s.wide) && <div className="shots wide">{p.shots.filter((s) => s.wide).map((s) => <figure key={s.n}><img src={`/shots/${s.n}.webp`} alt={s.alt} loading="lazy" width={600} height={314} /><figcaption>{s.cap}</figcaption></figure>)}</div>}
            </>)}
          </section>

          <section className="cs rv" id="architecture"><span className="mono k">03 · Architecture</span>
            <h2>How it fits together. Click a node to read what it does.</h2>
            <ArchDiagram arch={p.arch} hue={p.hue} />
          </section>

          <section className="cs rv" id="stack"><span className="mono k">04 · Stack, layer by layer</span>
            <h2>Every layer, its version, and the reason it is there.</h2>
            <div className="stack-layers">{p.stack.map((l) => (
              <div className="layer" key={l.layer}><b>{l.layer}</b>
                <ul>{l.items.map((s) => <li key={s.name}><strong>{s.name}{s.ver ? <em>{s.ver}</em> : null}</strong><span><Rich here>{s.why}</Rich></span></li>)}</ul></div>))}
            </div>
          </section>

          <section className="cs rv" id="spec"><span className="mono k">05 · Spec sheet</span>
            <h2>The specifications, each with its evidence and source.</h2>
            <table className="spec"><tbody>{p.spec.map(([a, b, ev, src]) => <tr key={a}><th scope="row">{a}</th><td><Rich here>{b}</Rich>{src ? <small>Source: {src}</small> : null}</td><td className="e"><Ev k={ev} src={src} always /></td></tr>)}</tbody></table>
          </section>

          {p.lab && (
            <section className="cs rv" id="lab"><span className="mono k">06 · Live lab</span>
              <h2>{LAB_META[p.lab].title}</h2>
              <p>{LAB_META[p.lab].blurb}</p>
              {CLIP[p.slug] && <LabClip name={CLIP[p.slug]} alt={`Recording of the ${p.name} live lab`} />}
              <LabById id={p.lab} />
            </section>
          )}

          <section className="cs rv" id="decisions"><span className="mono k">Decisions</span>
            <h2>What I chose, what I turned down, and why.</h2>
            <div className="decs">{p.decisions.map((d) => (
              <div className="dec" key={d.q}><h4 aria-level={3}>{d.q}</h4>
                <div className="opts"><div className="c"><b>Chose</b><span><Rich here>{d.chose}</Rich><Ev k="doc" src="decision logs and PRDs in the project folder" /></span></div><div className="r"><b>Not</b><span>{d.rejected}</span></div><div className="w"><b>Why</b><span><Rich here>{d.why}</Rich></span></div>{d.cost && <div className="x"><b>Cost</b><span>{d.cost}</span></div>}</div></div>))}</div>
          </section>

          <section className="cs rv" id="hard"><span className="mono k">Hard problems</span>
            <h2>The problems that were not obvious, and what resolved them.</h2>
            <div className="hardl">{p.hard.map((h) => <div className="hard" key={h.problem}><div><b>Problem</b><p>{h.problem}</p></div><div><b>Approach</b><p><Rich here>{h.approach}</Rich></p></div><div><b>Result<Ev k="doc" src="project tests, reports and changelogs; see the proof section for sources" /></b><p><Rich here>{h.result}</Rich></p></div></div>)}</div>
          </section>

          <section className="cs rv" id="proof"><span className="mono k">Proof</span>
            <h2>The numbers, with where each one comes from.</h2>
            <div className="proofs">{p.proof.map((x) => <div className="proof" key={x.label}><div className="v">{x.n}</div><span>{x.label}</span><span className="mono" style={{ fontSize: '.62rem' }}>{x.src}</span><Ev k={x.ev} src={x.src} always /></div>)}</div>
          </section>

          {isCore(p) && <p className="rv"><a className="pill ghost arrow" href={`/onepagers/${p.slug}.pdf`} download>One-page summary (PDF)</a></p>}

          {RUN[p.slug] && (<section className="cs rv" id="run"><span className="mono k">Run it yourself</span>
            <h2>Check it on your own machine.</h2>
            {RUN[p.slug].cmds.length > 0 && <pre className="code" tabIndex={0}>{RUN[p.slug].cmds.join('\n')}</pre>}
            <p className="lab-note">{RUN[p.slug].note}</p>
            {RUN[p.slug].repo && <p><a className="pill ghost arrow" href={RUN[p.slug].repo} target="_blank" rel="noopener noreferrer">Open the repository</a></p>}
          </section>)}

          <section className="cs rv" id="limits"><span className="mono k">Not proven</span>
            <div className="limits"><h3>What is not proven yet</h3><ul className="bullets">{p.limits.map((l) => <li key={l}><Rich here>{l}</Rich></li>)}</ul></div>
          </section>

          <section className="cs rv" id="skills"><span className="mono k">Skills demonstrated</span>
            <h2>What this project shows I can do.</h2>
            <div className="skills">{p.skills.map((s) => <span className="skill" key={s}><Rich>{s}</Rich></span>)}</div>
            <nav className="next-case" aria-label="More case files">
              <a href={`/work/${prev.slug}`} style={{ ['--w' as string]: prev.hue } as CSSProperties}><span className="mono">← Previous {isCore(p) ? 'core project' : 'secondary build'}</span><h3>{prev.name}</h3></a>
              <a href={`/work/${next.slug}`} style={{ ['--w' as string]: next.hue } as CSSProperties}><span className="mono">Next {isCore(p) ? 'core project' : 'secondary build'} →</span><h3>{next.name}</h3></a>
            </nav>
          </section>
        </div>
      </div>
    </main>
  );
}
