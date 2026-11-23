import { PROJECTS } from '@/content';
import { EV, type Ev } from '@/content/types';

export type Claim = { project: string; slug: string; where: 'Proof' | 'Spec' | 'Problem'; label: string; value: string; ev: Ev; src: string };

/** Every number on the case files, flattened: what it says, how strong the evidence is, and where it comes from. */
export const LEDGER: Claim[] = PROJECTS.flatMap((p) => [
  ...p.proof.map((x): Claim => ({ project: p.name, slug: p.slug, where: 'Proof', label: x.label, value: x.n, ev: x.ev, src: x.src })),
  ...p.spec.map(([label, value, ev, src]): Claim => ({ project: p.name, slug: p.slug, where: 'Spec', label, value, ev, src: src ?? '' })),
  ...p.problem.stakes.map(([label, value, ev, src]): Claim => ({ project: p.name, slug: p.slug, where: 'Problem', label, value, ev, src: src ?? '' })),
]);

export const LEDGER_COUNTS = (Object.keys(EV) as Ev[]).reduce((a, k) => ({ ...a, [k]: LEDGER.filter((c) => c.ev === k).length }), {} as Record<Ev, number>);
