import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import './globals.css';
import Shell from '@/components/Shell';
import Nav from '@/components/Nav';
import { Analytics } from '@vercel/analytics/next';
import { SITE_URL, EMAIL, LINKEDIN, GITHUB, FAQ } from '@/content/site';

const title = 'Vikas Manjunath · Products you can verify';
const description = 'Computer-science undergraduate in Bengaluru. Four core products (FIN-OS, VYBES LYNK, AkaarAI, DueClock) plus five secondary builds, each with its problem, architecture, full stack, decisions and proof. Run the engineering in four live labs.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: '%s · Vikas Manjunath' },
  description,
  openGraph: { title, description, type: 'website', url: '/', images: [{ url: '/og.png', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title, description, images: ['/og.png'] },
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/favicon.ico' }], apple: '/apple-touch-icon.png' },
  manifest: '/site.webmanifest',
  alternates: { canonical: '/', types: { 'application/rss+xml': '/feed.xml' } },
};
export const viewport: Viewport = { themeColor: '#03060f', width: 'device-width', initialScale: 1 };

const ld = [
  { '@context': 'https://schema.org', '@type': 'Person', name: 'Vikas Manjunath', jobTitle: 'Computer Science undergraduate', description, knowsAbout: ['Product management', 'Requirements engineering', 'AI and machine learning', 'Software engineering', 'Privacy engineering', 'FastAPI', 'TypeScript', 'PostgreSQL'], email: EMAIL, address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressCountry: 'IN' }, alumniOf: 'Dayananda Sagar Academy of Technology and Management', sameAs: [LINKEDIN, GITHUB] },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f[0], acceptedAnswer: { '@type': 'Answer', text: f[1] } })) },
];

/* Runs before first paint: theme, and the one-time boot overlay (skipped for reduced motion and repeat visits in a session). */
const BOOT = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('vm.theme');if(!t){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}d.setAttribute('data-theme',t);var r=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!r&&!sessionStorage.getItem('vm.boot')&&location.pathname==='/'&&localStorage.getItem('vm.zen')!=='1'){d.classList.add('boot')}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="nojs" data-theme="dark" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: BOOT }} /></head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        <Shell>
          <Nav />
          {children}
        </Shell>
        <Analytics />
      </body>
    </html>
  );
}
