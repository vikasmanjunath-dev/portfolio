'use client';
import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { matchJD } from '@/content/match';

const SAMPLE = 'Software Engineering Intern. You will build backend services in Python and FastAPI, work with PostgreSQL and Docker, write automated tests, and help ship an LLM-powered feature with retrieval (RAG). Experience with React or TypeScript is a plus. Familiarity with AWS or Kubernetes is nice to have.';

export default function Matcher() {
  const [jd, setJd] = useState('');
  const r = useMemo(() => (jd.trim().length > 20 ? matchJD(jd) : null), [jd]);
  return (
    <>
      <label className="fld" style={{ display: 'grid', gap: 8 }}><span>Paste a job description or internship posting</span>
        <textarea value={jd} onChange={(e) => setJd(e.target.value)} rows={7} placeholder="Paste the requirements here…" style={{ resize: 'vertical' }} /></label>
      <p style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '12px 0 28px' }}>
        <button className="pill ghost sm" type="button" onClick={() => setJd(SAMPLE)}>Try a sample</button>
        {jd && <button className="pill ghost sm" type="button" onClick={() => setJd('')}>Clear</button>}
        <span className="lab-note" style={{ margin: 0 }}>Runs in your browser. Nothing you paste is sent anywhere.</span>
      </p>
      {r && (
        <div role="status" aria-live="polite" style={{ display: 'grid', gap: 18 }}>
          {r.scored.length === 0 ? <p className="lead">No overlap with my projects’ stacks or skills was found in that text. That is a real answer: <a className="alink" href="/#contact">ask me</a> if you think there is a fit I missed.</p> : (
            <div className="grid-brief">
              {r.scored.slice(0, 3).map(({ p, hit, score }) => (
                <article className="vclaim" key={p.slug} style={{ ['--w' as string]: p.hue } as CSSProperties}>
                  <span className="mono">{score} matching terms</span>
                  <h3>{p.name}</h3><p>{p.tagline}</p>
                  <p style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{hit.slice(0, 14).map((h) => <span className="fchip" key={h}>{h}</span>)}</p>
                  <p><a className="pill ghost arrow sm" href={`/work/${p.slug}/`}>Open the case file</a></p>
                </article>
              ))}
            </div>
          )}
          {r.gaps.length > 0 && (
            <div className="limits"><h3>Asked for, not in my projects</h3>
              <p style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{r.gaps.map((g) => <span className="fchip" key={g}>{g}</span>)}</p>
              <p className="lab-note">I have not used these in the nine projects on this site. I would rather tell you now than have you find out in an interview.</p></div>
          )}
        </div>
      )}
    </>
  );
}
