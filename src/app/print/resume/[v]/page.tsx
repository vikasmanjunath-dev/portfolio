import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EMAIL, LINKEDIN, GITHUB, SITE_URL } from '@/content/site';

export const dynamicParams = false;
export function generateStaticParams() { return [{ v: 'software' }, { v: 'product' }, { v: 'risk' }]; }
export const metadata: Metadata = { title: 'Résumé (print)', robots: { index: false, follow: false } };

type Job = { t: string; s: string; d: string; b: string[] };
type V = { summary?: string; skills: [string, string][]; jobs: Job[]; extra: string };

const OM: Job = { t: 'OnlyMeta', s: 'Python, FastAPI, SQLite, HMAC', d: 'Nov 2026', b: [] };
const V: Record<string, V> = {
  software: {
    skills: [
      ['Languages', 'Python, TypeScript, JavaScript, Kotlin, SQL (C and C++ from coursework)'],
      ['Frameworks', 'React, Next.js, FastAPI, Expo / React Native, Jetpack Compose, Three.js'],
      ['Data and infrastructure', 'PostgreSQL, Supabase (row-level security), SQLite, Docker, Nginx, Vercel, Fly.io'],
      ['Testing and AI', 'pytest, Playwright, mutation testing, hybrid RAG (dense + BM25), Ollama, MediaPipe'],
    ],
    jobs: [
      { t: 'FIN-OS: AI personal-finance platform', s: 'Python, JavaScript, Expo, Supabase, Ollama', d: 'May 2026 – Present', b: [
        'Built an India-focused finance platform, live on Vercel: 120 pages, 90 calculators, a Hindi/Hinglish voice assistant on local LLMs and a 14-rule alert engine behind an Nginx gateway.',
        'Cut axe contrast failures from 596 to 29 and DOMContentLoaded by 36% (4x CPU, slow 4G); 1,655 mobile and 592 site tests passing.',
        'Verified a TypeScript port of two health-score pillars against the Python on 500 random cases; the first run exposed a missed 60%-of-income fallback (103 mismatches, now 0).' ] },
      { t: 'VYBES LYNK: verified-student campus discovery PWA', s: 'React, TypeScript, Supabase, PostgreSQL, Playwright', d: '2026', b: [
        'Enforced per-viewer location rounding inside Postgres functions so a client bug cannot bypass it; cut map data by 87% per active hour and kept initial JS at 195 KB gzipped (budget 250).',
        'Closed a three-round security audit, accepted against 266 unit tests, 283 database assertions and 24 end-to-end tests; mutation testing killed 51 of 52 mutants.' ] },
      { t: 'AkaarAI: virtual try-on Android app', s: 'Kotlin, Jetpack Compose, FastAPI, MediaPipe', d: 'Oct 2026 – Present', b: [
        'Built rule-based colour and pattern verdicts with no photo kept on the server; cut try-on time from 668 s to 62 s; 520 server and 262 app tests passing.',
        'Measured my own heuristic pattern detector (2 of 23 striped garments found on 400 thumbnails) and replaced it with a vision-language model: 93.1% category guess on held-out public photos. Colour rules match the Python on 500 of 500 random cases. No accuracy claim is made for the product.' ] },
      { t: 'DueClock: MSME payment-compliance engine', s: 'Python, FastAPI, PostgreSQL, TallyPrime connector', d: 'Nov 2026', b: [
        'Built the statutory clock (Section 43B(h): 15/45 days, RBI-rate interest): 750 tests on PostgreSQL, 30 of 30 mutants killed, 1,000-customer load test passed in 23 s.',
        'Ported the engine to TypeScript; it matches the Python on 400 of 400 random cases.' ] },
      { ...OM, t: 'OnlyMeta: two-tier observability (CICADA 2026, 24-hour hackathon)', b: ['Led a four-person team’s build: local redaction before any data leaves the site, HMAC-signed ingest with replay defence; 45 commits from my account and 377 tests.'] },
    ],
    extra: 'Portfolio with live labs and 1,400 parity cases: ' + SITE_URL.replace('https://', '') + ' (source: github.com/vikasmanjunath-dev/portfolio).',
  },
  product: {
    summary: 'Third-year CS student who writes the requirements before the code: PRDs, scope cuts, trade-off records and honest limits, then verifies the result with tests. Four products in finance, campus life, fashion and small-business payments.',
    skills: [
      ['Product', 'PRD, FRD, TRD, BRD, MRD, CRD, DRD, ARD, NFRD, SOP; MoSCoW roadmaps; customer discovery; success metrics and launch criteria'],
      ['Technical', 'Python, TypeScript, Kotlin, SQL; React, FastAPI, Supabase and PostgreSQL; testing and mutation testing'],
      ['Tools', 'Claude Code, Ollama (local LLMs), Jira, Confluence, Vercel'],
    ],
    jobs: [
      { t: 'FIN-OS: AI personal-finance platform', s: 'Product owner and architect', d: 'May 2026 – Present', b: [
        'Defined the product for a documented gap (people juggle 6 to 10 apps; adviser reach under 1% of the population): wrote 10 requirement documents and a 19-phase MoSCoW roadmap, then shipped it live on Vercel.',
        'Set the trust guardrails as product rules: local-only AI, row-level security, figures verified before they are shown, and 177 short “Money Reels” that educate without advising.' ] },
      { t: 'VYBES LYNK: verified-student campus app', s: 'Product owner', d: '2026', b: [
        'Wrote the requirements and made the privacy calls as product decisions: location off by default, connections-only visibility, rounding decided per viewer.',
        'Drove a three-round audit remediation to acceptance: 266 unit tests, 283 database assertions, 24 end-to-end tests.' ] },
      { t: 'AkaarAI: virtual try-on Android app', s: 'Product owner and builder', d: 'Oct 2026 – Present', b: [
        'Authored the 25-page PRD (36 functional requirements, success metrics, launch criteria); chose rule-based verdicts over model opinion so every result is traceable.',
        'Measured my own classifier, found it failed (2 of 23 striped garments), replaced it, and recorded that the product makes 0 accuracy claims until it is tested with people.' ] },
      { t: 'DueClock: MSME payment-compliance tool', s: 'Team lead, about 50% of the code', d: 'Nov 2026', b: [
        'With the team, ran customer discovery with MSME suppliers paid past the 15/45-day statutory limit; froze a five-feature v1 scope with ten explicit exclusions.',
        'Tracked 66 roadmap features to launch criteria and published what is still open (eleven legal rulings await a named reviewer).' ] },
      { ...OM, t: 'OnlyMeta (CICADA 2026, 24-hour hackathon)', b: ['Led a four-person team to a working two-tier observability build that keeps raw data on the customer’s side; 45 commits, 377 tests.'] },
    ],
    extra: 'Every claim on my portfolio carries an evidence tag (checkable, documented or self-reported): ' + SITE_URL.replace('https://', '') + '.',
  },
  risk: {
    summary: 'Third-year CS student focused on controls that can be checked: privacy by design, statutory compliance, audit remediation and honest limits. Four products built with documented tests and a public evidence trail.',
    skills: [
      ['Security and privacy', 'Row-level security, role-based access, field-level encryption, HMAC request signing, data redaction, audit logging'],
      ['Compliance and assurance', 'Requirements traceability, test evidence, mutation testing, audit remediation, accessibility checks (axe)'],
      ['Technical', 'Python, TypeScript, SQL, Kotlin; PostgreSQL, Supabase, FastAPI, Docker'],
    ],
    jobs: [
      { t: 'DueClock: MSME payment-compliance engine', s: 'Python, FastAPI, PostgreSQL', d: 'Nov 2026', b: [
        'Built a statutory clock for Section 43B(h) (15/45-day payment limits) with RBI-rate interest; hash-chained audit log, field-level encryption and key scopes; 750 tests, 30 of 30 mutants killed.',
        'Published the open items instead of hiding them: no customer in production yet, eleven legal rulings awaiting a named reviewer.' ] },
      { t: 'VYBES LYNK: verified-student campus app', s: 'React, TypeScript, Supabase, PostgreSQL', d: '2026', b: [
        'Privacy by design: location off by default, consent logged server-side, rounding enforced in Postgres so a client bug cannot bypass it.',
        'Closed a three-round security audit against 283 database assertions, 266 unit and 24 end-to-end tests; 51 of 52 mutants killed.' ] },
      { t: 'FIN-OS: AI personal-finance platform', s: 'Python, JavaScript, Supabase, Ollama', d: 'May 2026 – Present', b: [
        'Set guardrails as controls: AI runs locally, row-level security on user data, figures checked against the user’s own records before display, “not advice” on every lesson.',
        'Reduced accessibility contrast failures from 596 to 29 (axe) and validated the scoring logic against the Python on 500 random cases, catching one missed fallback.' ] },
      { t: 'AkaarAI: virtual try-on Android app', s: 'Kotlin, FastAPI', d: 'Oct 2026 – Present', b: [
        'No photo is kept on the server; every verdict traces to a written rule; thresholds are marked provisional and the product makes 0 accuracy claims until tested with people.' ] },
      { ...OM, t: 'OnlyMeta (CICADA 2026, 24-hour hackathon)', b: ['Led a four-person team’s two-tier design: redaction runs before data leaves the customer site; HMAC-signed requests with nonce replay defence; 45 commits, 377 tests.'] },
    ],
    extra: 'Participation certificates: CICADA 2026, Codex 48, Code Conqueror India 2026, Prasunex Innovathon 2026, ChaosCore 2026. Evidence-tagged portfolio: ' + SITE_URL.replace('https://', '') + '.',
  },
};

export default async function Resume({ params }: { params: Promise<{ v: string }> }) {
  const { v } = await params; const d = V[v]; if (!d) notFound();
  return (
    <>
      <style>{`
        .nav,.dock,.grain,.cur,.cur-ring,.toast,.curtain,.foot,[class^="pre"],.skip,.aud{display:none!important}
        html,body{background:#fff!important;color:#000!important} @page{size:A4;margin:0}
        .rs{font:10.5pt/1.24 "Times New Roman",Times,serif;color:#000;background:#fff;width:210mm;min-height:297mm;padding:12mm 15mm;margin:0 auto;box-sizing:border-box}
        .rs h1{font:700 24pt/1 "Times New Roman",serif;text-align:center;font-variant:small-caps;letter-spacing:.02em;margin:0 0 3px} .rs .c{text-align:center;font-size:9.8pt;margin-bottom:2px}
        .rs h2{font:700 11.6pt/1 "Times New Roman",serif;font-variant:small-caps;letter-spacing:.04em;border-bottom:.7pt solid #000;padding-bottom:1.5px;margin:10px 0 4px}
        .rs .r{display:flex;justify-content:space-between;gap:8px;align-items:baseline} .rs .r span:last-child{white-space:nowrap} .rs ul{margin:1px 0 2px;padding-left:15px} .rs li{margin:.6px 0;padding-left:0}
        .rs a{color:#000;text-decoration:none} .rs i{font-style:italic} .rs p{margin:1px 0}
      `}</style>
      <div className="rs" id="main">
        <h1>Vikas Manjunath</h1>
        <p className="c">Bengaluru, India · {EMAIL} · 9986010907</p>
        <p className="c"><a href={LINKEDIN}>linkedin.com/in/vikas-manjunath-</a> · <a href={GITHUB}>github.com/vikasmanjunath-dev</a> · <a href={SITE_URL}>{SITE_URL.replace('https://', '')}</a></p>
        {d.summary && (<><h2>Summary</h2><p>{d.summary}</p></>)}
        <h2>Education</h2>
        <div className="r"><span><b>Dayananda Sagar Academy of Technology and Management</b>, Bengaluru</span><span>2024 – 2028 (expected)</span></div>
        <div className="r"><span><i>B.E. Computer Science and Engineering · CGPA 8.24</i></span><span /></div>
        <div className="r"><span>Narayana PU College · 90% (2024) · Baldwin Co-Education Extension High School · 77% (2022)</span><span /></div>
        <h2>Projects</h2>
        {d.jobs.map((j) => (
          <div key={j.t}><div className="r"><span><b>{j.t}</b> | <i>{j.s}</i></span><span>{j.d}</span></div><ul>{j.b.map((x) => <li key={x}>{x}</li>)}</ul></div>
        ))}
        <h2>{v === 'product' ? 'Skills' : 'Technical skills'}</h2>
        {d.skills.map(([a, b]) => <p key={a}><b>{a}:</b> {b}</p>)}
        <h2>Additional</h2>
        <p>{d.extra}</p>
        {v !== 'risk' && <p>Participation certificates: CICADA 2026 (Project Expo, 24-hour hackathon), Codex 48 and Code Conqueror India 2026 (national hackathons), Prasunex Innovathon 2026, ChaosCore 2026. Courses: IBM SkillsBuild (Machine Learning for Data Science Projects), University of Michigan (Python Data Structures), Infosys Springboard (Programming in C, Cyber Security Foundation) and more.</p>}
      </div>
    </>
  );
}
