import type { LabId } from './types';

export const LAB_META: Record<LabId, { tab: string; title: string; blurb: string }> = {
  finos: { tab: 'FIN-OS · health score', title: 'Score a financial life by rule', blurb: 'The real FIN-OS scoring rules for the Emergency Fund and Debt Management pillars, ported to TypeScript and matched against the Python on 500 random cases. Change the numbers and watch the tier move.' },
  privacy: { tab: 'VYBES LYNK · privacy lens', title: 'See what each viewer is allowed to see', blurb: 'The database rounds a student’s position differently for connections and strangers. Switch the viewer and move the point.' },
  akaar: { tab: 'AkaarAI · colour verdict', title: 'A colour verdict you can trace to a rule', blurb: 'The three AkaarAI colour rules (undertone, contrast, richness), ported and matched against the Python on 500 random cases. Pick a skin tone and a garment, and read which rule said what.' },
  clock: { tab: 'DueClock · statutory clock', title: 'Compute a legal deadline by rule', blurb: 'The real clock engine, ported to TypeScript and tested against the Python original on 400 random invoices. Change the seller, the agreement or the dates and read the trace.' },
  egress: { tab: 'OnlyMeta · egress guard', title: 'Try to leak a secret. Fail.', blurb: 'Three layers keep raw data inside the customer’s network. Break one on purpose and watch the next one catch it, then sign a request and try to replay it.' },
  bunk: { tab: 'BunkBudget · attendance', title: 'How many classes can you skip?', blurb: 'NA-aware attendance maths with a bunk budget and recovery mode.' },
};
/** The home page shows only the four core projects' labs, in project order. Secondary labs live on their case files. */
export const LAB_ORDER: LabId[] = ['finos', 'privacy', 'akaar', 'clock'];
