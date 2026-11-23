import { PROJECTS } from '@/content';
import { EV, type Ev } from '@/content/types';

export type Claim = { project: string; slug: string; where: 'Proof' | 'Spec' | 'Problem'; label: string; value: string; ev: Ev; src: string; href?: string };

/** Every number on the case files, flattened: what it says, how strong the evidence is, and where it comes from. */
/** Raw terminal output of the 23 Nov 2026 re-runs, published under /proof/. */
export const PROOF_FILES: Record<string, { label: string; href: string; match: RegExp }[]> = {
  onlymeta: [
    { label: 'pytest output (377 passed)', href: '/proof/onlymeta-pytest-2026-11-23.txt', match: /test/i },
    { label: 'drill output (41/41)', href: '/proof/onlymeta-drill-2026-11-23.txt', match: /drill|self-check/i },
  ],
  'relay-ai': [{ label: 'pytest output (129 passed, 2 skipped)', href: '/proof/relay-pytest-2026-11-23.txt', match: /test/i }],
};
const link = (slug: string, label: string, src: string) => src.includes('23 Nov 2026') || /re-run/i.test(src) ? PROOF_FILES[slug]?.find((f) => f.match.test(label))?.href : undefined;

export const LEDGER: Claim[] = PROJECTS.flatMap((p) => [
  ...p.proof.map((x): Claim => ({ project: p.name, slug: p.slug, where: 'Proof', label: x.label, value: x.n, ev: x.ev, src: x.src, href: link(p.slug, x.label, x.src) })),
  ...p.spec.map(([label, value, ev, src]): Claim => ({ project: p.name, slug: p.slug, where: 'Spec', label, value, ev, src: src ?? '', href: link(p.slug, `${label} ${value}`, src ?? '') })),
  ...p.problem.stakes.map(([label, value, ev, src]): Claim => ({ project: p.name, slug: p.slug, where: 'Problem', label, value, ev, src: src ?? '', href: link(p.slug, `${label} ${value}`, src ?? '') })),
]);

export const LEDGER_COUNTS = (Object.keys(EV) as Ev[]).reduce((a, k) => ({ ...a, [k]: LEDGER.filter((c) => c.ev === k).length }), {} as Record<Ev, number>);
