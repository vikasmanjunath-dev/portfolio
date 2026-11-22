import type { Project } from './types';

export const BUNK: Project = {
  slug: 'bunkbudget', idx: 'S5', name: 'BunkBudget', kind: 'Coursework', hue: '#34d399', status: 'Released 2.1.1', tone: 'done',
  tagline: 'A dark-mode attendance planner with NA-aware maths, a bunk budget, recovery mode and a PDF parser that runs in the browser.',
  period: 'Nov 2026',
  role: 'Author: product, frontend, API and deployment configuration.',
  problem: {
    headline: 'Students track attendance in their heads and discover a shortage too late.',
    context: ['College rules need 75% attendance. Slots marked "No Attendance" must not count, subjects vary, and the question that matters is "how many can I skip, and what must I attend to recover?"'],
    stakes: [['Core rule', 'Percentage = Present ÷ (Total − NA) = Present ÷ (Present + Absent)', 'doc', 'README']],
  },
  constraints: ['No framework or build step on the frontend (vanilla JavaScript).', 'Reports are parsed locally; scanned image-only PDFs are not supported and the app says so.', 'Secrets stay in the environment, never in source.'],
  solution: {
    headline: 'Exact formulas, a weekly planner and a private report archive.',
    body: ['The calculator separates attended, conducted and NA slots; a ring shows status against a 75% or 76% target. Above target it computes how many classes can be skipped; below it, how many consecutive classes must be attended. A weekly planner evaluates combinations of days and refuses to call a plan safe until attendance and timetable data are complete.', 'Reports (PDF, CSV, Excel, JSON) are versioned in the browser’s IndexedDB; shortage and timetable PDFs are parsed locally with PDF.js. An optional account syncs subjects through a FastAPI and PostgreSQL backend.'],
    features: [
      ['Bunk budget', 'bunks = ⌊(present − target × total) ÷ target⌋'],
      ['Recovery mode', 'needed = ⌈(target × total − present) ÷ (1 − target)⌉'],
      ['Day-bunking simulation', 'Subtracts one attended class per scheduled occurrence and lists subjects dropping below target'],
      ['Local PDF parsing', 'PDF.js reads text and positions in the browser; no upload'],
      ['Cloud sync', 'JWT sessions, bcrypt hashes, per-user filtering from the token'],
    ],
  },
  stack: [
    { layer: 'Frontend', items: [
      { name: 'HTML5, CSS3, vanilla JavaScript', why: 'No framework, no build step for the app itself.' },
      { name: 'PDF.js (pdfjs-dist ^6.5)', why: 'In-browser PDF text and position extraction; no OCR.' },
      { name: 'localStorage + IndexedDB', why: 'Tracker data and versioned report files stay on the device.' },
    ]},
    { layer: 'Backend', items: [
      { name: 'FastAPI + Uvicorn + Pydantic', ver: 'Python 3.12', why: 'Validates bodies; the role field is not accepted at registration.' },
      { name: 'SQLAlchemy asyncio + asyncpg', why: 'Async PostgreSQL access on Neon.' },
      { name: 'PyJWT + Passlib/bcrypt', why: '60-minute JWTs signed with SECRET_KEY; bcrypt password hashes.' },
    ]},
    { layer: 'Hosting', items: [{ name: 'Netlify, Render, Neon', why: 'Static frontend with an /api proxy rule; FastAPI service described in render.yaml; hosted PostgreSQL.' }] },
  ],
  languages: ['JavaScript', 'Python', 'SQL'],
  spec: [
    ['Single-owner admin', 'Registration always assigns role "student"; /api/admin/stats needs role admin and the ADMIN_EMAIL from the environment; other admin rows are demoted at startup', 'doc', 'README'],
    ['Versions', 'Project release 2.1.1; Node 22.13 for the build; Python 3.12', 'doc', 'TECH_STACK.md (11 Nov 2026)'],
    ['Deployment status', 'Configured, not verified live: on 11 Nov 2026 the configured Render hostname responded "no-server", so the backend had to be deployed and /api/health checked before login or cloud sync could be relied on', 'doc', 'TECH_STACK.md'],
  ],
  arch: {
    title: 'BunkBudget data paths',
    nodes: [
      { id: 'ui', label: 'Browser app', sub: 'vanilla JS', detail: 'Calculator, planner and archive; all maths runs locally.', col: 0, row: 1 },
      { id: 'idb', label: 'IndexedDB', sub: 'report versions', detail: 'Uploaded reports with version history, per browser.', col: 1, row: 0 },
      { id: 'pdf', label: 'PDF.js', sub: 'local parse', detail: 'Reads shortage and timetable PDFs in the browser.', col: 1, row: 1 },
      { id: 'api', label: 'FastAPI', sub: 'JWT · bcrypt', detail: 'Optional cloud sync; protected routes filter by the user id from the token.', col: 1, row: 2 },
      { id: 'pg', label: 'PostgreSQL (Neon)', sub: 'users · subjects', detail: 'Accounts and subject attendance.', col: 2, row: 2 },
    ],
    edges: [['ui', 'idb'], ['ui', 'pdf'], ['ui', 'api'], ['api', 'pg']],
  },
  decisions: [
    { q: 'Frontend framework?', chose: 'None.', rejected: 'React or Vue', why: 'A static site with a tiny surface area; fewer dependencies to audit.' },
    { q: 'Where do reports live?', chose: 'In the browser (IndexedDB), parsed locally.', rejected: 'Uploading reports to a server', why: 'Attendance reports are personal; no upload is needed.' },
  ],
  hard: [{ problem: 'A bunk planner must not mislead.', approach: 'The planner flags missing attendance or timetable data and refuses to call a plan safe until the data is complete.', result: 'It cannot claim safety it has not computed.' }],
  proof: [
    { n: '2.1.1', label: 'released version', ev: 'doc', src: 'TECH_STACK.md' },
    { n: '60 min', label: 'JWT lifetime', ev: 'doc', src: 'README' },
  ],
  limits: ['The Render backend was not live when checked on 11 Nov 2026. Scanned image-only PDFs need manual entry.'],
  skills: ['Vanilla JavaScript application design', 'Client-side PDF parsing', 'IndexedDB versioning', 'FastAPI, JWT and bcrypt auth', 'Async SQLAlchemy', 'Deployment configuration'],
  lab: 'bunk',
};
