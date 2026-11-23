import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ESSAYS, ESSAY_ORDER, SITE_URL } from '@/content/site';
import { Rich } from '@/components/bits';
import { Contact } from '@/components/Client';

export const dynamicParams = false;
export function generateStaticParams() { return ESSAY_ORDER.map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const e = ESSAYS[slug]; if (!e) return {};
  const img = `/og/writing-${slug}.png`;
  return { title: e.t, description: e.d, alternates: { canonical: `/writing/${slug}/` },
    openGraph: { type: 'article', title: e.t, description: e.d, url: `/writing/${slug}/`, images: [{ url: img, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title: e.t, description: e.d, images: [img] } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const e = ESSAYS[slug]; if (!e) notFound();
  const i = ESSAY_ORDER.indexOf(slug), nx = ESSAY_ORDER[(i + 1) % ESSAY_ORDER.length];
  const ld = { '@context': 'https://schema.org', '@type': 'Article', headline: e.t, description: e.d, url: `${SITE_URL}/writing/${slug}/`, image: `${SITE_URL}/og/writing-${slug}.png`, author: { '@type': 'Person', name: 'Vikas Manjunath', url: SITE_URL } };
  return (
    <>
      <main id="main" className="wrap" style={{ paddingTop: 140, maxWidth: 760, display: 'grid', gap: 18 }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        <p><Link className="pill ghost sm" href="/#writing">← All essays</Link></p>
        <p className="mono">{e.m} min read · Vikas Manjunath</p>
        <h1 className="big" style={{ fontSize: 'clamp(2.2rem,5vw,3.6rem)' }}>{e.t}</h1>
        <p className="lead">{e.d}</p>
        {e.b.map((p, k) => <p key={k} style={{ fontSize: '1.08rem', lineHeight: 1.7 }}><Rich>{p}</Rich></p>)}
        <p style={{ marginTop: 24 }}><Link className="pill" href={`/writing/${nx}/`}>Next: {ESSAYS[nx].t} →</Link></p>
      </main>
      <Contact />
    </>
  );
}
