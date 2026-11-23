'use client';
import { useEffect, useState } from 'react';

const AUD = [
  ['recruiter', 'Recruiter', 'Default order: the four core projects, then labs, proof and contact.'],
  ['judge', 'Judge', 'Labs, the build log and the decisions come first, so you can run and check the work.'],
  ['founder', 'Founder', 'The work, the decisions and the method come first: problems solved and how I think.'],
] as const;
type A = (typeof AUD)[number][0];

export default function Audience() {
  const [a, setA] = useState<A>('recruiter');
  useEffect(() => { try { const q = new URLSearchParams(location.search).get('for'); const v = (AUD.some((x) => x[0] === q) ? q : localStorage.getItem('vm.aud')) as A | null; if (v && AUD.some((x) => x[0] === v)) { setA(v); document.documentElement.dataset.aud = v; } } catch { /* ignore */ } }, []);
  const pick = (v: A) => { setA(v); document.documentElement.dataset.aud = v; try { localStorage.setItem('vm.aud', v); } catch { /* ignore */ } };
  return (
    <div className="aud" role="group" aria-label="Reorder this page for you">
      <span className="mono">I am a</span>
      {AUD.map(([id, l]) => <button key={id} className="fchip" type="button" aria-pressed={a === id} onClick={() => pick(id)}>{l}</button>)}
      <span className="aud-hint">{AUD.find((x) => x[0] === a)![2]}</span>
    </div>
  );
}
