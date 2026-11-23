import { TESTIMONIALS } from '@/content/testimonials';
import { bySlug } from '@/content';
import { Split } from './bits';

export default function Testimonials() {
  const t = TESTIMONIALS.filter((x) => x.permission);
  if (!t.length) return null;
  return (
    <section className="sec" id="said" aria-labelledby="tmH">
      <div className="wrap">
        <div className="sec-head"><p className="mono kicker rv">Said by others</p><h2 className="h2" id="tmH"><Split text="Not my words." /></h2><p className="lead rv">Quoted with each person’s permission. These are their statements, not independent verification of the code.</p></div>
        <div className="essays">
          {t.map((x) => { const p = x.about ? bySlug(x.about) : undefined; return (
            <figure className="essay rv" key={x.name}><blockquote><p style={{ fontSize: '1.05rem', color: 'var(--ink)' }}>“{x.quote}”</p></blockquote><figcaption className="mono">{x.name} · {x.relation}{p ? <> · about <a className="alink" href={`/work/${p.slug}/`}>{p.name}</a></> : null}</figcaption></figure>
          ); })}
        </div>
      </div>
    </section>
  );
}
