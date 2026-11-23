import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PROJECTS, bySlug, tierLabel } from '@/content';
import CaseFile from '@/components/CaseFile';
import { Contact } from '@/components/Client';
import { RUN } from '@/content/run';
import { SITE_URL } from '@/content/site';

export const dynamicParams = false;
export function generateStaticParams() { return PROJECTS.map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const p = bySlug(slug); if (!p) return {};
  return { title: `${p.name}: ${tierLabel(p)} case file`, description: `${p.tagline} Problem, architecture, full stack, decisions and proof.`, alternates: { canonical: `/work/${p.slug}/` },
    openGraph: { type: 'website', title: `${p.name}: ${tierLabel(p)} case file`, description: p.tagline, url: `/work/${p.slug}/`, images: [{ url: `/og/work-${p.slug}.png`, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', images: [`/og/work-${p.slug}.png`] } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const p = bySlug(slug); if (!p) notFound();
  const ld = { '@context': 'https://schema.org', '@type': RUN[p.slug]?.repo ? 'SoftwareSourceCode' : 'CreativeWork', name: p.name, description: p.tagline, url: `${SITE_URL}/work/${p.slug}/`, image: `${SITE_URL}/og/work-${p.slug}.png`, author: { '@type': 'Person', name: 'Vikas Manjunath', url: SITE_URL }, keywords: p.stack.flatMap((l) => l.items.map((i) => i.name)).slice(0, 12).join(', '), ...(RUN[p.slug]?.repo ? { codeRepository: RUN[p.slug].repo } : {}) };
  return (<><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} /><CaseFile p={p} /><Contact /></>);
}
