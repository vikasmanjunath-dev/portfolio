import type { Ev } from './types';

export const EMAIL = 'vikasmanjunath.dev@gmail.com';
export const LINKEDIN = 'https://www.linkedin.com/in/vikas-manjunath-';
/** Contact-form delivery: FormSubmit (formsubmit.co) forwards each message to the inbox; no account needed, the owner confirms once by email. Empty = open the visitor's email app instead. */
export const FORM_URL = 'https://formsubmit.co/ajax/vikasmanjunath.dev@gmail.com';
export const GITHUB = 'https://github.com/vikasmanjunath-dev';
export const SITE_REPO = 'https://github.com/vikasmanjunath-dev/portfolio';
export const SITE_URL = 'https://vikas-manjunath.vercel.app'; // [TODO] replace with your real domain (also public/robots.txt and public/sitemap.xml)

/* ───────── Technology constellation: every technology, the projects that prove it, and the evidence ───────── */
export type TechCat = 'Language' | 'Frontend' | 'Backend' | 'Data' | 'AI / ML' | 'Security' | 'Quality' | 'Infra' | 'Graphics' | 'Product';
export type Tech = { id: string; name: string; cat: TechCat; ver?: string; projects: string[]; note: string; ev: Ev };
export const TECH: Tech[] = [
  { id: 'py', name: 'Python', cat: 'Language', ver: '3.11-3.12', projects: ['akaarai', 'dueclock', 'onlymeta', 'relay-ai', 'nifty-analyser', 'syndicate', 'finos', 'bunkbudget'], note: 'Servers, rule engines, ML pipelines, compilers, a game. The language I reach for first.', ev: 'doc' },
  { id: 'ts', name: 'TypeScript', cat: 'Language', projects: ['vybes-lynk', 'relay-ai', 'syndicate', 'finos', 'dueclock'], note: 'Typed clients (VYBES LYNK, RELAY dashboard, Syndicate), the Expo app, and this site’s lab ports.', ev: 'doc' },
  { id: 'js', name: 'JavaScript', cat: 'Language', projects: ['finos', 'bunkbudget', 'dueclock'], note: 'Vanilla multi-page FIN-OS web app and BunkBudget; the DueClock JS SDK.', ev: 'doc' },
  { id: 'kt', name: 'Kotlin', cat: 'Language', ver: '2.0.20', projects: ['akaarai'], note: 'The AkaarAI Android app, Jetpack Compose.', ev: 'doc' },
  { id: 'sql', name: 'SQL / PL-pgSQL', cat: 'Language', projects: ['vybes-lynk', 'dueclock', 'finos', 'syndicate'], note: 'Privacy functions, RLS policies, migrations with rollbacks, 283 database assertions.', ev: 'doc' },
  { id: 'c', name: 'C · C++', cat: 'Language', projects: [], note: 'Listed on the résumé from coursework. No project on this site uses them.', ev: 'self' },

  { id: 'react', name: 'React', cat: 'Frontend', ver: '19', projects: ['vybes-lynk', 'relay-ai', 'syndicate'], note: 'Component UIs for three products.', ev: 'doc' },
  { id: 'next', name: 'Next.js', cat: 'Frontend', ver: '16', projects: ['syndicate'], note: 'App Router web app; this site is also a Next.js static export.', ev: 'ok' },
  { id: 'tw', name: 'Tailwind CSS', cat: 'Frontend', ver: '3-4', projects: ['vybes-lynk', 'relay-ai', 'syndicate'], note: 'Utility styling with AA-safe colour decisions.', ev: 'doc' },
  { id: 'rn', name: 'Expo · React Native', cat: 'Frontend', ver: 'SDK 57 · RN 0.86', projects: ['finos'], note: 'The FIN-OS mobile app: 1,655 tests.', ev: 'doc' },
  { id: 'compose', name: 'Jetpack Compose', cat: 'Frontend', projects: ['akaarai'], note: 'Material 3 Android UI.', ev: 'doc' },
  { id: 'cap', name: 'Capacitor', cat: 'Frontend', ver: '8', projects: ['vybes-lynk'], note: 'Android and iOS shells for the PWA.', ev: 'doc' },
  { id: 'leaf', name: 'Leaflet', cat: 'Frontend', projects: ['vybes-lynk'], note: 'Live campus map with hand-written clustering.', ev: 'ok' },

  { id: 'fastapi', name: 'FastAPI', cat: 'Backend', projects: ['akaarai', 'dueclock', 'onlymeta', 'relay-ai', 'finos', 'syndicate', 'bunkbudget'], note: 'The API layer of seven products.', ev: 'doc' },
  { id: 'nginx', name: 'Nginx gateway', cat: 'Backend', projects: ['finos'], note: 'Single front door with rate limiting and security headers.', ev: 'doc' },
  { id: 'ws', name: 'WebSocket · SSE', cat: 'Backend', projects: ['finos', 'onlymeta'], note: 'Audio streaming (FIN-OS) and live dashboards (OnlyMeta).', ev: 'doc' },
  { id: 'prisma', name: 'Prisma · Auth.js', cat: 'Backend', ver: '6.12 · v5', projects: ['syndicate'], note: 'Typed data access and credential sessions.', ev: 'doc' },

  { id: 'pg', name: 'PostgreSQL', cat: 'Data', projects: ['vybes-lynk', 'dueclock', 'syndicate', 'bunkbudget', 'finos'], note: 'Row-level security, query tuning (index-only scan 63 ms to 0.05 ms).', ev: 'doc' },
  { id: 'sb', name: 'Supabase', cat: 'Data', projects: ['vybes-lynk', 'finos', 'dueclock'], note: 'Auth, Postgres, RLS, Realtime, Storage.', ev: 'doc' },
  { id: 'sqlite', name: 'SQLite', cat: 'Data', projects: ['relay-ai', 'onlymeta', 'dueclock', 'finos'], note: 'Durable queues, per-region stores, FTS5 keyword index.', ev: 'doc' },
  { id: 'qdrant', name: 'Qdrant · Redis', cat: 'Data', projects: ['finos'], note: 'Vector store and ingestion workers for hybrid retrieval.', ev: 'doc' },

  { id: 'ollama', name: 'Ollama · local LLMs', cat: 'AI / ML', ver: 'qwen3:14b · qwen2.5:3b', projects: ['finos', 'syndicate'], note: 'On-device language models; no per-token cost.', ev: 'doc' },
  { id: 'rag', name: 'Hybrid RAG', cat: 'AI / ML', ver: 'bge-m3 + BM25', projects: ['finos', 'nifty-analyser'], note: 'Dense plus keyword retrieval with PII scrubbing and evidence checks.', ev: 'doc' },
  { id: 'gemini', name: 'Gemini structured output', cat: 'AI / ML', ver: '2.5 Flash', projects: ['relay-ai'], note: 'Schema-validated model calls inside an untrusted-output pipeline.', ev: 'doc' },
  { id: 'vton', name: 'FASHN VTON · SigLIP', cat: 'AI / ML', projects: ['akaarai'], note: 'Virtual try-on and vision-language pattern classification, with licences on record.', ev: 'doc' },
  { id: 'cv', name: 'MediaPipe · OpenCV', cat: 'AI / ML', projects: ['akaarai'], note: 'Face and pose checks; k-means colours; skin sampling.', ev: 'doc' },
  { id: 'gbm', name: 'LightGBM · scikit-learn', cat: 'AI / ML', ver: '4.7 · 1.8', projects: ['nifty-analyser', 'syndicate'], note: 'Purged walk-forward validation, calibration, cost-aware backtests.', ev: 'doc' },
  { id: 'whisper', name: 'faster-whisper · edge-tts', cat: 'AI / ML', projects: ['finos'], note: 'Local speech recognition; cloud neural voice (documented exception).', ev: 'doc' },
  { id: 'sml', name: 'Intent routing (SML)', cat: 'AI / ML', projects: ['finos'], note: 'TF-IDF and embedding heads, sealed test sets.', ev: 'doc' },
  { id: 'aiops', name: 'Anomaly detection', cat: 'AI / ML', projects: ['onlymeta', 'dueclock'], note: 'Rolling z-score, EWMA and MAD baselines; incident correlation and root cause.', ev: 'doc' },

  { id: 'hmac', name: 'HMAC signing · Fernet', cat: 'Security', projects: ['onlymeta', 'dueclock'], note: 'Replay-safe signed requests, encrypted secrets at rest.', ev: 'ok' },
  { id: 'chain', name: 'Hash-chained audit', cat: 'Security', projects: ['onlymeta', 'dueclock'], note: 'Tamper-evident logs with a verify endpoint.', ev: 'doc' },
  { id: 'rls', name: 'Row-level security', cat: 'Security', projects: ['vybes-lynk', 'finos', 'dueclock'], note: 'Authorisation enforced by the database, not the client.', ev: 'doc' },
  { id: 'hdr', name: 'CSP · HSTS · rate limits', cat: 'Security', projects: ['finos', 'vybes-lynk', 'onlymeta'], note: 'Headers and per-key throttles.', ev: 'doc' },
  { id: 'threat', name: 'Threat modelling', cat: 'Security', projects: ['relay-ai', 'vybes-lynk'], note: 'Six trust boundaries (RELAY); scraping, stalking and ban evasion (VYBES LYNK).', ev: 'doc' },

  { id: 'pytest', name: 'pytest · Hypothesis', cat: 'Quality', projects: ['dueclock', 'akaarai', 'onlymeta', 'relay-ai', 'nifty-analyser', 'syndicate'], note: 'Thousands of tests; property tests against an independent calculator.', ev: 'doc' },
  { id: 'vitest', name: 'Vitest · Playwright · axe', cat: 'Quality', projects: ['vybes-lynk', 'syndicate', 'finos'], note: '266 unit, 24 e2e, zero serious accessibility issues across 3 viewports.', ev: 'doc' },
  { id: 'mut', name: 'Mutation testing', cat: 'Quality', projects: ['vybes-lynk', 'dueclock'], note: 'SQL 29/30, TypeScript 22/22, DueClock 30/30 mutants killed.', ev: 'doc' },
  { id: 'a11y', name: 'WCAG AA accessibility', cat: 'Quality', projects: ['finos', 'vybes-lynk', 'relay-ai'], note: 'Contrast failures 596 to 29; 44 px targets enforced by a test.', ev: 'doc' },

  { id: 'docker', name: 'Docker · Compose', cat: 'Infra', projects: ['finos', 'relay-ai', 'onlymeta', 'dueclock', 'syndicate'], note: 'Multi-service stacks, pinned sandbox images, health checks.', ev: 'doc' },
  { id: 'hosting', name: 'Vercel · Netlify · Fly.io', cat: 'Infra', projects: ['finos', 'bunkbudget', 'dueclock'], note: 'Static hosting and a Fly.io app config.', ev: 'doc' },
  { id: 'ci', name: 'GitHub Actions · systemd', cat: 'Infra', projects: ['relay-ai'], note: 'CI checks and a production service template.', ev: 'doc' },


  { id: 'prd', name: 'PRD · TRD · FRD · NFRD', cat: 'Product', projects: ['finos', 'akaarai', 'dueclock', 'vybes-lynk'], note: 'Ten requirement documents for FIN-OS, a 25-page PRD with 36 FRs for AkaarAI, frozen v1.2 scope for DueClock.', ev: 'doc' },
  { id: 'claude', name: 'Claude Code', cat: 'Product', projects: ['akaarai', 'finos', 'dueclock'], note: 'AI-assisted engineering: project CLAUDE.md files, plan-then-apply workflows, test-gated changes.', ev: 'doc' },
  { id: 'jira', name: 'Jira · Confluence', cat: 'Product', projects: ['akaarai'], note: 'AkaarAI’s definition of done requires Jira updates; PRD sections live in Confluence.', ev: 'doc' },
];

/* ───────── Principles ───────── */
export const PRINCIPLES: [string, string, string][] = [
  ['01', 'Honest over impressive.', 'Every result says what it is: a preview, a sample, a low-confidence answer. A measured number always names its test set and its limits, and a missing number is stated as missing.'],
  ['02', 'Private by default.', 'Location is off until chosen, AI runs locally, photos are not kept on the server, and a privacy rule lives in the database, where a client bug cannot bypass it.'],
  ['03', 'Explainable by rule.', 'Anything a user could dispute is computed by a written rule with a trace: due dates, interest, colour and pattern verdicts. Models do what only models can do.'],
  ['04', 'Measure, then claim.', 'The heuristic pattern classifier found 2 of 23 striped garments, so it was replaced. The stock model found no edge, so the README says so. A negative result is still a result.'],
];

/* ───────── Method ───────── */
export const METHOD: { step: string; line: string; artifacts: string[] }[] = [
  { step: 'Discover', line: 'Start with the person who has the problem.', artifacts: ['Customer discovery for DueClock', 'A problem table with user pains in every PRD', 'Market and customer requirement docs (MRD, CRD) for FIN-OS'] },
  { step: 'Scope', line: 'Write down what is in, and what is out.', artifacts: ['19-phase MoSCoW roadmap in FIN-OS', 'Ten explicit exclusions in DueClock, frozen at v1.2', 'Non-goals in AkaarAI: no accounts, live AR, iOS release or model training'] },
  { step: 'Decide', line: 'Log every decision and who must act.', artifacts: ['Decision logs with owner actions (VYBES LYNK)', 'Change requests CR-01 and CR-02 (AkaarAI)', 'Amendments D-21 and D-22 (DueClock)', 'Open-decision sign-off before parallel build (OnlyMeta)'] },
  { step: 'Design', line: 'Make the system explainable before it is built.', artifacts: ['PRD, FRD, TRD, BRD, MRD, CRD, DRD, ARD, NFRD and SOP for FIN-OS', 'A 95-token design system with light and dark themes', 'Adapters around everything risky in DueClock', 'A threat model with six trust boundaries (RELAY AI)'] },
  { step: 'Prove', line: 'Set the gates, then measure against them.', artifacts: ['1,655 + 592 tests (FIN-OS), 714/750 (DueClock), 520 + 262 (AkaarAI)', 'Mutation tests: 29/30, 22/22 and 30/30 mutants killed', 'Launch criteria and kill tests for DueClock', 'A NOT_MEASURED register for AkaarAI'] },
];

/* ───────── Timeline: dated entries come from the folders' own docs ───────── */
export const TIMELINE: { when: string; title: string; body: string; ev: Ev; tag: string }[] = [
  { when: '2022', title: 'School', body: 'Baldwin Co-Education Extension High School, 77%.', ev: 'doc', tag: 'Education' },
  { when: '2022 – 2024', title: 'Pre-University', body: 'Narayana PU College, completed 2024 with 90%.', ev: 'doc', tag: 'Education' },
  { when: '2024', title: 'B.E. begins', body: 'Computer Science and Engineering at DSATM, Bengaluru. CGPA 8.24.', ev: 'doc', tag: 'Education' },
  { when: '14 Jul 2026', title: 'FIN-OS voice agent v1.4', body: 'Fully local pipeline: faster-whisper, qwen2.5:3b via Ollama, neural voice, over a WebSocket.', ev: 'doc', tag: 'FIN-OS' },
  { when: '22 Sep 2026', title: 'Nifty Analyser Phases 0-3 complete', body: '321/321 tests; the honest finding that no robust edge exists.', ev: 'doc', tag: 'Research' },
  { when: '1 Oct 2026', title: 'FIN-OS sitewide sweep', body: '117 pages and 88 calculators swept; 10 real runtime bugs fixed.', ev: 'doc', tag: 'FIN-OS' },
  { when: '22 Oct 2026', title: 'Money Reels and Expo SDK 57', body: 'Short lessons in English and Hindi, read-aloud voice; first SML router dataset.', ev: 'doc', tag: 'FIN-OS' },
  { when: '1-4 Nov 2026', title: 'AkaarAI walking skeleton and PRD v0.5', body: 'Server with checks and verdict rules; 25-page PRD, 36 FRs; first real FASHN VTON runs.', ev: 'doc', tag: 'AkaarAI' },
  { when: '10-12 Nov 2026', title: 'VYBES LYNK audit remediation', body: 'Ban-evasion fingerprint, per-viewer rounding, directory-scrape limits, mutation tests.', ev: 'doc', tag: 'VYBES LYNK' },
  { when: '19 Nov 2026', title: 'FIN-OS 1,655 mobile tests · DueClock on real Tally', body: 'tally-check PASS on TallyPrime 7.2; FIN-OS site tests 592 passing.', ev: 'doc', tag: 'Milestone' },
  { when: '20 Nov 2026', title: 'DueClock 714 / 750 tests · OnlyMeta Phase 1', body: '1,000-customer load test; OnlyMeta two-tier AIOps build and Egress Proof prepared.', ev: 'doc', tag: 'Milestone' },
  { when: '21 Nov 2026', title: 'This site, v3', body: 'Four lab engines ported to TypeScript and parity-tested against the originals.', ev: 'ok', tag: 'Site' },
  { when: 'Dec 2026', title: 'AkaarAI demo', body: 'Planned demo of the virtual try-on app.', ev: 'self', tag: 'Planned' },
  { when: '2028', title: 'Graduation', body: 'B.E. Computer Science, class of 2028.', ev: 'self', tag: 'Planned' },
];

export const EDU: { when: string; score: string; label: string; what: string }[] = [
  { when: '2024 – 2028', score: '8.24', label: 'CGPA', what: 'B.E. Computer Science & Engineering · Dayananda Sagar Academy of Technology and Management, Bengaluru' },
  { when: '2022 – 2024', score: '90%', label: 'Pre-University', what: 'Narayana PU College' },
  { when: '2022', score: '77%', label: 'School', what: 'Baldwin Co-Education Extension High School' },
];

export const COURSEWORK: [string, string][] = [
  ['DBMS', 'Row-level security, migrations, query plans in VYBES LYNK and DueClock'],
];

type Cert = { n: string; d?: string };
/** Events and their certificates, read from the LinkedIn posts. Participation only, nothing here is a win. `attend` = no certificate. */
export const CERTS: { title: string; org: string; items: Cert[]; ev: Ev; attend?: boolean }[] = [
  { title: 'CICADA 2026', org: 'TechForcz × Atria Institute of Technology', ev: 'doc', items: [
    { n: 'Project Expo', d: '19 Nov 2026' }, { n: 'IPL Auction', d: '19 Nov 2026' }, { n: '24-hour hackathon (OnlyMeta, a secure two-tier AIOps build)', d: '20–21 Nov 2026' } ] },
  { title: 'ADHIGAMYA: AI Tech Conclave 2026', org: 'DSATM, Dept. of CSE (AI) with the CSI Student Branch', ev: 'doc', items: [
    { n: 'Yantra Drishti: Prompt to Pixel Challenge', d: '4 May 2026' }, { n: 'Antarveda: Cyber Heist Simulation', d: '5 May 2026' } ] },
  { title: 'TechFusion 2.0', org: 'CloudSEK · DSATM, Dept. of CSE (IoT, Cybersecurity, Blockchain)', ev: 'doc', items: [
    { n: 'Hackathon', d: '27–29 Apr 2026' }, { n: 'Ideathon', d: '27–29 Apr 2026' } ] },
  { title: 'Aurora Tech Fest 2025', org: 'Dayananda Sagar Academy of Technology and Management', ev: 'doc', items: [{ n: 'GFG Codeathon' }, { n: 'Fest workshops' }] },
  { title: 'Codex 48 and Code Conqueror India 2026', org: 'National hackathons by WeCodeCoders · via Unstop', ev: 'doc', items: [
    { n: 'Codex 48: National-Level Hackathon', d: '22 Nov 2026' }, { n: 'Code Conqueror India 2026: National Hackathon', d: '21 Nov 2026' } ] },
  { title: 'Prasunex Innovathon 2026', org: 'Organised by Prasunex · via Unstop', ev: 'doc', items: [
    { n: 'Idea Submission and Innovation Screening' }, { n: 'Solution Design and Technical Evaluation' } ] },
  { title: 'Hustle Carnival', org: 'GI Bajaj Group of Institutions · via Unstop', ev: 'doc', items: [{ n: 'Participation' }] },
  { title: 'Build 2026 × ByteAsk (YC F26)', org: 'Open-Source Challenge by Hackyard · via Unstop', ev: 'doc', items: [{ n: 'Open-Source Challenge' }] },
  { title: 'ChaosCore Hackathon 2026', org: 'Organised by Invoqe', ev: 'doc', items: [{ n: 'Hackathon' }] },
  { title: 'Scaler masterclasses', org: 'Scaler', ev: 'doc', items: [
    { n: 'Kafka and ZooKeeper', d: '21 Sep 2026' }, { n: 'The FDE Simulation: Build and Deploy AI in 3 Hours', d: '19 Sep 2026' } ] },
  { title: 'WeAreDevelopers Conference India 2026', org: 'Bengaluru · 25–26 Nov 2026', ev: 'doc', attend: true, items: [{ n: 'Attending (conference pass); no certificate yet' }] },
];
export const CERT_COUNT = CERTS.filter((c) => !c.attend).reduce((n, c) => n + c.items.length, 0);

/** Course certificates posted on LinkedIn (completion, not credentials). Every title was read from the post or the certificate image. */
export const COURSES: { org: string; items: string[] }[] = [
  { org: 'IBM SkillsBuild', items: ['Machine Learning for Data Science Projects'] },
  { org: 'University of Michigan (Coursera)', items: ['Python Data Structures', 'Programming for Everybody (Getting Started with Python)'] },
  { org: 'Great Learning Academy', items: ['Introduction to Artificial Intelligence', 'Introduction to Cyber Security'] },
  { org: 'Cursa', items: ['Cryptography and Network Security'] },
  { org: 'Infosys Springboard', items: ['Programming in C', 'MATLAB for Beginners', 'Fundamentals of Cryptography', 'Fundamentals of Information Security', 'Network Fundamentals', 'Introduction to Cyber Security', 'Cyber Security Foundation', 'Salesforce CRM: The Definitive Admin'] },
  { org: 'LinkedIn Learning', items: [
    'Software Architecture: From Developer to Architect', 'C#: Applied Data Structures', 'Introduction to Web APIs', 'Networking Foundations: Networking Basics',
    'Programming Foundations: SDKs', 'Programming Foundations: Memory, Pointers, and Garbage Collection', 'Programming Foundations: Inside Computing Hardware',
    'Agentic AI Fundamentals: Architectures, Frameworks, and Applications', 'Introduction to NLP and LLMs: Principles and Practical Applications', 'Generative AI: Working with Large Language Models',
    'Intelligent Automation Foundations', 'Advanced Prompt Engineering Techniques', 'Prompt Engineering: How to Talk to the AIs', 'Prompt Engineering with ChatGPT',
    "ChatGPT's Operator: Automating Everyday Tasks with AI Agents", 'Structure Vibe Coding to Save Build Time', 'Enhancing Product Development with Custom ChatGPTs',
    'Streamlining Your Work with Microsoft Copilot', 'Learning Microsoft 365 Copilot and Business Chat', 'What Is Web3?', 'Introduction to Fintech',
    'Agile Foundations', 'Agile Project Leadership', 'Comparing Agile versus Waterfall Project Management', 'Design Thinking for Project Management',
    'Design Thinking, Social Innovation, and Complex Systems', 'Quality Management for Operational Excellence', 'Becoming an AI-First Product Leader',
    'Ethics in the Age of Generative AI', 'Digital Body Language'] },
];
export const COURSE_COUNT = COURSES.reduce((n, c) => n + c.items.length, 0);

/* ───────── Writing ───────── */
export type Essay = { t: string; d: string; m: number; b: string[] };
import essaysRaw from './essays.json';
const base = essaysRaw as unknown as Record<string, Essay>;
export const ESSAYS: Record<string, Essay> = {
  ...base,
  measured: {
    t: 'I measured my own classifier. It failed. I replaced it.',
    d: 'A heuristic pattern detector found 2 of 23 striped garments. What I did next.',
    m: 3,
    b: [
      'AkaarAI has to tell a shopper whether a garment is plain, striped, checked or printed. My first version was a classical image heuristic: edge orientation, periodicity, a busyness score. It looked reasonable on a handful of examples.',
      'So I measured it, on 400 catalogue thumbnails with labels taken from the shop’s own product names. It found 2 of 23 striped garments and 0 of 27 checked ones. That is not a weak classifier. It is a classifier that does not work.',
      'I replaced it with Marqo-FashionSigLIP, an Apache-2.0 vision-language model, and measured again on the same set: stripes 5 of 23, checks 18 of 27, print 40 of 59. Better, and still low, because the thumbnails are 60 by 80 pixels. On sharper stand-in photos a later change lifted stripes from 72% to 84% and checks from 82% to 92%.',
      'None of this is an accuracy claim about AkaarAI, and the project says so in a register called NOT_MEASURED: no accuracy claim without a number, its test set, its limits and a per-skin-depth-band report. A heuristic I could not defend was cheaper to drop than to explain.',
    ],
  },
  parity: {
    t: 'My port disagreed with my own Python 103 times out of 500',
    d: 'How random cases from the real code caught a fallback I had forgotten.',
    m: 3,
    b: [
      'The FIN-OS health score runs in Python on the server. I ported two of its pillars, the emergency fund and debt management, to TypeScript so that a visitor can move a slider on this site and watch the score change. A port is only worth showing if it gives the same answers as the original.',
      'So I did not write test cases by hand. I generated 500 random inputs by calling the real Python functions, saved their outputs, and ran the TypeScript port on the same inputs. The first run disagreed on 103 of the 500.',
      'The cause was one line I had forgotten. When monthly expenses are zero, the Python falls back to 60 percent of income instead of treating the need as zero. My port treated it as zero. A handful of hand-picked cases would never have hit that branch; random ones hit it constantly. After the fix the port matched on all 500.',
      'The same method gave 400 of 400 for the DueClock clock engine and 500 of 500 for the AkaarAI colour rules. What this proves is narrow: the port behaves like the code it copies. It does not prove the rules are right for real people, and the project pages say so.',
    ],
  },
  negative: {
    t: 'A negative result is still a result',
    d: 'Four phases of a stock-direction model, and a README that says "no edge".',
    m: 3,
    b: [
      'The Nifty 50 Analyser began as a question: could a carefully validated pipeline predict daily direction? Phase 1 used technical features only, with purged, embargoed walk-forward folds. Accuracy was 51.4% ± 3.3%, an information coefficient of +0.012 ± 0.053: statistically indistinguishable from no edge.',
      'The tempting move is to add features until a number looks good. I added 98, then 110, including fundamentals and FII/DII flows, and each time measured on identical folds. The ablation showed a mean IC difference of −0.0089 with folds flipping sign (+0.0418, −0.0783, +0.0020, −0.0012). A sign-flipping effect is the signature of no signal.',
      'Phase 3 added a retrieval layer over NSE announcements. Its event features lowered IC in all 4 folds (−0.011). They stayed in the research and explanation layer, not the trading model.',
      'What the project did produce is the discipline: point-in-time correctness, a tracker with 27 documented bugs, 321 passing tests and a cost-stress table where Sharpe falls from +0.149 to −3.057 as costs rise. I would rather show that than a lucky backtest.',
    ],
  },
};
export const ESSAY_ORDER = ['decline', 'private', 'rules', 'measured', 'negative', 'parity'];

/* ───────── FAQ ───────── */
export const FAQ: [string, string][] = [
  ['What roles are you looking for?', 'Internships and entry-level roles in product, AI/ML and software. I am a third-year B.E. Computer Science student at DSATM, Bengaluru, graduating in 2028.'],
  ['How much of this did you build, and how?', 'I define the product, write the requirements, make the architectural and privacy decisions, and verify the result. The implementation is AI-assisted: I work with Claude Code, in plan-then-apply loops, with tests as the gate. Every project folder has its own CLAUDE.md and test suite for that reason. The résumé lists Claude Code as a tool, and this site says so on purpose.'],
  ['Are your core products live?', 'My core projects are FIN-OS, VYBES LYNK, AkaarAI and DueClock, and every card says where each stands. FIN-OS is live. VYBES LYNK has had its audit findings fixed and needs the registrar’s student list to launch. AkaarAI is being prepared for a December 2026 demo. DueClock is built and tested but has no customer in production. The other seven builds are secondary: OnlyMeta and RELAY AI are hackathon-style prototypes, and the rest are research and coursework.'],
  ['Why do your products say "I don’t know"?', 'In FIN-OS a verification layer checks every figure against the user’s own data before an answer shows. A forecast or recommendation that cannot be verified is declined in plain words instead of guessed.'],
  ['Does FIN-OS really keep everything on the device?', 'Mostly, and the exception is documented. Speech recognition and the language models run locally. The reply voice uses Microsoft Edge neural TTS, a cloud service, so reply text leaves the device when voice is on. Replacing it with a local voice is the fix and is not built yet.'],
  ['What is your tech stack, and in which languages?', 'Programming: Python (FastAPI servers, rule engines, ML), TypeScript and React (VYBES LYNK, RELAY, Syndicate), Kotlin and Jetpack Compose (AkaarAI), JavaScript (FIN-OS web), SQL and PL/pgSQL. Data: PostgreSQL and Supabase, SQLite, Qdrant. AI: Ollama local LLMs, FASHN VTON, FashionSigLIP, LightGBM. Human languages: English, Hindi and Hinglish in FIN-OS; Hindi and Kannada buyer pages in DueClock. The Technology section lists every item with its version and evidence.'],
  ['What does "rule-based, never an LLM" mean in DueClock?', 'A language model can write plausible but wrong dates. The 15 and 45 day clock, ageing and interest are computed by written rules that a chartered accountant can check, and the product must pass a signed statutory test pack before launch. You can run the engine in the Labs section.'],
  ['How do you test?', 'Unit tests, database assertions, end-to-end tests, automated accessibility checks, property-based tests against an independent calculator, and mutation tests that deliberately break the code. FIN-OS has 1,655 mobile tests, DueClock 714 to 750, AkaarAI 520 server and 262 app tests. These test rules; they are not a claim about real-world accuracy, and AkaarAI has not been tested with people.'],
  ['What is not proven yet?', 'AkaarAI has no accuracy claim and misses its 30 second target on the dev Mac (62 to 95 s). VYBES LYNK has not been run against a live Supabase project. DueClock has no production customer and eleven legal rulings pending. RELAY AI’s live Gemini and Docker rehearsal has not been run. Each case file has a "What is not proven" section.'],
  ['What does the evidence tag mean?', 'Checkable: you can open it or run it here. Documented: recorded in my own project documents, tests or changelogs, not public. Self-reported: my statement. Press V to show the tags on every claim.'],
  ['How do I reach you?', 'Email vikasmanjunath.dev@gmail.com or use the contact section. LinkedIn is linked in the footer.'],
];

/* ───────── Numbers wall (each tied to a case file and an evidence class) ───────── */
export const NUMBERS: { n: number; suffix?: string; label: string; sub: string; ev: Ev; to: string }[] = [
  { n: 1655, label: 'FIN-OS mobile tests', sub: 'passing, 19 Nov 2026', ev: 'doc', to: 'finos' },
  { n: 750, label: 'DueClock tests', sub: 'on PostgreSQL, 20 Nov 2026', ev: 'doc', to: 'dueclock' },
  { n: 520, label: 'AkaarAI server tests', sub: 'plus 262 app tests', ev: 'doc', to: 'akaarai' },
  { n: 283, label: 'VYBES LYNK database assertions', sub: 'privacy rules tested in SQL', ev: 'doc', to: 'vybes-lynk' },
  { n: 1400, suffix: '/1,400', label: 'port parity cases', sub: 'three labs vs your Python engines', ev: 'ok', to: 'dueclock' },
  { n: 87, suffix: '%', label: 'less map data per hour', sub: '63 MB to 8.4 MB', ev: 'doc', to: 'vybes-lynk' },
];

export const HERO_LINES = ['I build products', 'you can verify.'];
