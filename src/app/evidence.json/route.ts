import { LEDGER, LEDGER_COUNTS } from '@/content/ledger';
import { SITE_URL } from '@/content/site';
import { EV } from '@/content/types';

export const dynamic = 'force-static';
export function GET() {
  const body = { site: SITE_URL, about: 'Every claim on the case files with its evidence class and source. Checkable = you can run or see it; Documented = in the author’s own project records; Self-reported = the author’s statement only.', classes: EV, counts: LEDGER_COUNTS, total: LEDGER.length, claims: LEDGER.map((c) => ({ ...c, url: `${SITE_URL}/work/${c.slug}/` })) };
  return new Response(JSON.stringify(body, null, 1), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
