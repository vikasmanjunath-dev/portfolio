import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CORE, bySlug } from '@/content';
import { EV } from '@/content/types';
import { SITE_URL, EMAIL } from '@/content/site';
import PrintStyle from '../PrintStyle';

export const dynamicParams = false;
export function generateStaticParams() { return CORE.map((p) => ({ slug: p.slug })); }
export const metadata: Metadata = { title: 'One-page summary (print)', robots: { index: false, follow: false } };

export default async function OnePager({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const p = bySlug(slug); if (!p) notFound();
  return (
    <>
      <PrintStyle />
      <div className="pp">
        <div className="prow"><span className="pdim">{p.idx} · Core project · Vikas Manjunath</span><span className="pdim">{p.status}</span></div>
        <h1>{p.name}</h1>
        <p className="psub">{p.tagline}</p>
        <p className="pdim"><b>My role:</b> {p.role}</p>
        <h2>Problem</h2>
        <h3>{p.problem.headline}</h3>
        <ul>{p.problem.stakes.slice(0, 3).map((s) => <li key={s[0]}><b>{s[0]}:</b> {s[1]} <span className="ptag">{EV[s[2]].short}</span></li>)}</ul>
        <h2>Solution</h2>
        <h3>{p.solution.headline}</h3>
        <ul>{p.solution.features.slice(0, 4).map(([a, b]) => <li key={a}><b>{a}.</b> {b}</li>)}</ul>
        <h2>Architecture</h2>
        <div className="pchips">{p.arch.nodes.map((n) => <span className="pchip" key={n.id}><b>{n.label}</b> · {n.sub}</span>)}</div>
        <h2>Stack</h2>
        {p.stack.map((l) => <p key={l.layer}><b>{l.layer}:</b> {l.items.slice(0, 7).map((i) => i.name).join(', ')}</p>)}
        <h2>Proof, with where each number comes from</h2>
        <div className="pgrid">{p.proof.slice(0, 4).map((x) => <div className="pbox" key={x.label}><b>{x.n}</b><span>{x.label}</span><br /><span className="ptag">{EV[x.ev].label}</span></div>)}</div>
        <h2>Not proven yet</h2>
        <div className="plim"><ul>{p.limits.slice(0, 3).map((l) => <li key={l}>{l}</li>)}</ul></div>
        <p className="pdim" style={{ marginTop: 10 }}>Full case file: <a href={`${SITE_URL}/work/${p.slug}/`}>{SITE_URL.replace('https://', '')}/work/{p.slug}/</a> · {EMAIL}. Tags: Checkable = you can run or see it; Documented = in my project records; Self-reported = my statement.</p>
      </div>
    </>
  );
}
