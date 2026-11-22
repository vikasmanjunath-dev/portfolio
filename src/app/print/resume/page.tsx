import type { Metadata } from 'next';
import PrintStyle from '../PrintStyle';
import { EMAIL, LINKEDIN, GITHUB, SITE_URL } from '@/content/site';

export const metadata: Metadata = { title: 'Résumé (print)', robots: { index: false, follow: false } };

const P: { h: string; r: string; b: string[] }[] = [
  { h: 'FIN-OS: AI personal-finance platform', r: 'Live: finos1.vercel.app', b: [
    'Led product definition for an India-focused finance platform, live on Vercel: PRD, TRD and design requirements for 120 pages, 90 calculators and a Hindi/Hinglish voice AI on local models; 177 “Money Reels” that educate without advising.',
    'Defined a 19-phase MoSCoW roadmap and the trust guardrails (local-only AI, row-level security, answers verified before delivery). Ported two health-score pillars to TypeScript and checked them against the Python on 500 random cases: the first run caught a forgotten fallback (103 mismatches, now 0).' ] },
  { h: 'VYBES LYNK: campus discovery PWA', r: 'React, TypeScript, Supabase', b: [
    'Led product definition for a verified-student networking app: live campus map, interest-based discovery and chat, college-email sign-up and roster checks.',
    'Made the privacy calls (location off by default, connections-only visibility, per-viewer rounding in the database) and drove a three-round audit remediation, accepted against 266 unit, 283 database and 24 end-to-end tests.' ] },
  { h: 'AkaarAI: virtual try-on Android app', r: 'Kotlin, FastAPI, FASHN VTON', b: [
    'Authored the 25-page PRD (36 functional requirements, success metrics, launch criteria) for an app that previews a garment on the shopper and returns rule-based colour and pattern verdicts.',
    'Set the principles: rule verdicts instead of model opinion, no photos kept on the server. Measured my own pattern classifier (2 of 23 striped garments found), replaced it, and checked the colour rules against the Python on 500 random cases. Thresholds are provisional; no accuracy claim is made.' ] },
  { h: 'DueClock: MSME payment-compliance tool', r: 'Python, FastAPI, PostgreSQL · in development', b: [
    'Authored the PRD and ran customer discovery on MSME suppliers paid past the statutory 15/45-day limit (Section 43B(h)); froze a five-feature scope with ten explicit exclusions.',
    'Designed a read-only Tally connector feeding a cloud core with a rule-based clock engine; the TypeScript port of the engine matches the Python on 400 of 400 random cases.' ] },
];

export default function Resume() {
  return (
    <>
      <PrintStyle />
      <div className="pp">
        <h1>Vikas Manjunath</h1>
        <p className="psub">{EMAIL} · 9986010907 · Bengaluru · <a href={LINKEDIN}>linkedin.com/in/vikas-manjunath-ab0842258</a> · <a href={GITHUB}>github.com/vikasmanjunath-dev</a> · <a href={SITE_URL}>{SITE_URL.replace('https://', '')}</a></p>
        <h2>Summary</h2>
        <p>Third-year Computer Science undergraduate (DSATM, Bengaluru; graduating 2028) who defines products, writes the requirements, decides the architecture and verifies the result with tests. Four core products across finance, campus life, fashion and small-business payments, built with Claude Code as pair-programmer. Every claim on my portfolio carries an evidence tag. Seeking internships and entry-level roles in product, AI/ML and software.</p>
        <h2>Skills</h2>
        <div className="prow"><span><b>Programming:</b> Python, TypeScript, JavaScript, Kotlin, SQL (C and C++ from coursework)</span></div>
        <p><b>Web and data:</b> React, Next.js, FastAPI, Supabase and PostgreSQL with row-level security, Docker · <b>AI and tools:</b> Claude Code, Ollama (local LLMs), hybrid RAG (dense + BM25), Three.js · <b>Product:</b> PRD, FRD, TRD, requirements, UX, evidence-based claims</p>
        <h2>Core projects</h2>
        {P.map((p) => (
          <div key={p.h}><div className="prow"><h3>{p.h}</h3><span className="pdim">{p.r}</span></div><ul>{p.b.map((x) => <li key={x}>{x}</li>)}</ul></div>
        ))}
        <h2>Other builds</h2>
        <ul>
          <li><b>OnlyMeta</b> (CICADA 2026, 24-hour hackathon): led the build of a four-person team’s two-tier, privacy-first observability platform (local redaction, HMAC-signed ingest); 45 commits from my account, 182 tests.</li>
          <li><b>Nifty 50 Analyser:</b> point-in-time-correct ML pipeline that publishes a negative result (no edge) instead of tuning until a number looks good. Also RELAY AI, Syndicate and BunkBudget.</li>
          <li><b>Portfolio:</b> {SITE_URL.replace('https://', '')}: nine case files, four live labs, 1,400 random parity cases; source public at github.com/vikasmanjunath-dev/portfolio.</li>
        </ul>
        <h2>Hackathons</h2>
        <p>CICADA 2026 (TechForcz × Atria Institute of Technology) · ChaosCore Hackathon 2026 (Invoqe) · Prasunex Innovathon 2026: Solution Design and Technical Evaluation round.</p>
        <h2>Education</h2>
        <div className="prow"><span><b>B.E. Computer Science and Engineering</b>, Dayananda Sagar Academy of Technology and Management, Bengaluru</span><span style={{ whiteSpace: 'nowrap' }}>2024 – 2028 · CGPA 8.24</span></div>
        <div className="prow"><span>Pre-University, Narayana PU College</span><span>2022 – 2024 · 90%</span></div>
        <div className="prow"><span>School, Baldwin Co-Education Extension High School</span><span>2022 · 77%</span></div>
      </div>
    </>
  );
}
