import type { Metadata } from 'next';
import { CORE } from '@/content';
import { EMAIL, LINKEDIN, GITHUB } from '@/content/site';
import { Ev } from '@/components/bits';

export const metadata: Metadata = {
  title: '30-second version',
  description: 'The short version: four core projects, what each proves, and how to reach Vikas Manjunath.',
  alternates: { canonical: '/brief/' },
};

export default function Brief() {
  return (
    <main id="main" className="sec" style={{ paddingTop: 120 }}>
      <div className="wrap">
        <p className="mono kicker">30-second version</p>
        <h1 className="h2">Vikas Manjunath. Computer science, Bengaluru, class of 2028.</h1>
        <p className="lead">I define products, write the requirements, decide the architecture and verify the result with tests. Four core projects, each below with one problem and its strongest checked numbers. Every figure carries an evidence tag.</p>
        <div className="cta-row" style={{ margin: '22px 0 34px' }}>
          <a className="pill" href={`mailto:${EMAIL}`}>Email me</a>
          <a className="pill ghost" href="/Vikas_Manjunath_Resume.pdf" download>Résumé (PDF)</a>
          <a className="pill ghost arrow" href={LINKEDIN} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a className="pill ghost arrow" href={GITHUB} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a className="pill ghost arrow" href="/">Full site</a>
        </div>
        <p className="lab-note" style={{ marginBottom: 24 }}>Résumé versions, one page each: <a className="alink" href="/Vikas_Manjunath_Resume_Software.pdf" download>Software engineering</a> · <a className="alink" href="/Vikas_Manjunath_Resume_Product.pdf" download>Product</a> · <a className="alink" href="/Vikas_Manjunath_Resume_Risk-Consulting.pdf" download>Risk and consulting</a></p>
        <div className="grid-brief">
          {CORE.map((p) => (
            <article className="vclaim" key={p.slug} style={{ ['--w' as string]: p.hue }}>
              <span className="mono">{p.idx} · {p.status}</span>
              <h2 className="h3"><a href={`/work/${p.slug}/`}>{p.name}</a></h2>
              <p>{p.tagline}</p>
              <ul className="bullets">{p.proof.slice(0, 3).map((x) => <li key={x.label}><b>{x.n}</b> {x.label}<Ev k={x.ev} src={x.src} /></li>)}</ul>
              <a className="alink" href={`/work/${p.slug}/`}>Case file →</a>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
