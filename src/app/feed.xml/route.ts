import { ESSAYS, ESSAY_ORDER, SITE_URL } from '@/content/site';

export const dynamic = 'force-static';
const x = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function GET() {
  const items = ESSAY_ORDER.map((k) => `<item><title>${x(ESSAYS[k].t)}</title><link>${SITE_URL}/writing/${k}/</link><guid>${SITE_URL}/writing/${k}/</guid><description>${x(ESSAYS[k].d)}</description></item>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Vikas Manjunath: essays</title><link>${SITE_URL}/#writing</link><description>Short essays on building things you can trust.</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
