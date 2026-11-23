import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PROJECTS, bySlug, tierLabel } from '@/content';
import CaseFile from '@/components/CaseFile';
import { Contact } from '@/components/Client';

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
  return (<><CaseFile p={p} /><Contact /></>);
}
