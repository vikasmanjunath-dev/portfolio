[![CI](https://github.com/vikasmanjunath-dev/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/vikasmanjunath-dev/portfolio/actions/workflows/ci.yml)

# Vikas Manjunath · proof-of-work portfolio (v3)

**Concept: "Trust is a layer", taken literally.** Every other portfolio says *trust me*. This one lets a visitor *check*:
every claim carries an evidence tag, every core project has a full case file, and five engines from the real projects run in the browser.

## Run
    npm install
    npm run dev            # http://localhost:4300
    npm run build          # static site in ./out  (Hostinger public_html, Vercel, Netlify, GitHub Pages)
    npm run test:parity    # re-checks the lab ports against the originals (see below)

## What is on the site
| Area | What it does |
|---|---|
| **Boot overlay** | Plays once per session with real numbers from your test suites. Skippable; off for reduced motion. |
| **Hero** | Three.js signal tunnel: thousands of particles pass four gates (one per core product) and each gate *declines* some of them. GPU-animated from one time uniform, code-split, with a CSS fallback. |
| **Case files** (`/work/<slug>`) | 4 core projects (FIN-OS, VYBES LYNK, AkaarAI, DueClock) plus 5 secondary builds. Each: problem with numbers → constraints → solution → clickable architecture diagram → stack layer by layer (version + reason) → spec sheet (each row evidence-tagged with its source) → decisions (chose / rejected / why) → hard problems → proof → **what is not proven** → skills. Glossary terms explain themselves on hover. |
| **Live labs** | The home page shows one lab per core project: FIN-OS health score, VYBES LYNK privacy, AkaarAI colour verdict, DueClock statutory clock. OnlyMeta (egress guard) and BunkBudget have theirs on their case files. Real logic, ported to TypeScript. |
| **Constellation** | 49 technologies linked to the 9 projects (4 core, 5 secondary) that prove them. Click, drag, filter; accessible table beneath. |
| **Verify mode (V)** | Tags every claim `CHK` / `DOC` / `SELF` with its source. |
| **Zen mode (Z)** | No 3D, grain, cursor or smooth scroll. Automatic for reduced motion. |
| **⌘K / Ctrl+K** | Command palette over projects, technologies, essays and actions. `T` toggles the theme. |
| **Writing** | Five essays, including *I measured my own classifier. It failed. I replaced it.* |

## Evidence classes
`Checkable`: open it or run it here · `Documented`: recorded in my own project docs, tests or changelogs (not public) · `Self-reported`: my word.
Only tag what is true. Add one with `<Ev k="ok|doc|self" src="..." />` (`src/components/bits.tsx`) or as the third element of a spec/proof row.

## Parity: the labs are not mock-ups
`scripts/parity/` holds the checks. On 21 Nov 2026:
- **DueClock**: the TypeScript clock engine matches `dueclock/core/clock.py` on **400 randomised invoices, 0 mismatches** (coverage, due date, overdue days, interest, rate, 43B(h) exposure; both rate policies).
- **AkaarAI**: the colour-verdict port matches `colour_rules.py` on **500 random cases** (label, score, rule ids). **FIN-OS**: the Emergency Fund and Debt Management pillars match `health_score.py` on **500 random cases** (the check found the 60%-of-income expense fallback).

To regenerate the DueClock cases from the real engine:
`python3 scripts/parity/gen_clock_cases.py ~/Desktop/DueClock > scripts/parity/clock_cases.json`

## Where things are
- `src/content/` all copy and data. `flagship.ts`, `systems.ts`, `builds.ts` (projects), `site.ts` (technology, timeline, essays, FAQ, numbers), `gloss.ts` (hover definitions).
- `src/labs/` the pure engines (`clock.ts`, `akaar.ts`, `finos.ts`, `misc.ts`). `src/components/labs/` their UIs.
- `src/components/Scene.tsx` the 3D hero. `Constellation.tsx` the technology graph. `ArchDiagram.tsx` the architecture diagrams.
- `src/app/globals.css` all tokens and styles. Palette is carried over from the previous site: `#03060f #0a1030 #2a3fd6 #c6f135 #9db1e8 #8b98c8`.

## Deploy on Hostinger
1. Replace `vikas-manjunath.vercel.app` in `src/content/site.ts` (`SITE_URL`), `public/robots.txt` and `public/sitemap.xml`.
2. `npm run build`, then upload the **contents** of `out/` to `public_html` (include the hidden `.htaccess`: HTTPS, caching and security headers).
3. hPanel → SSL → install the free certificate.

## [TODO] needs your input
- **Domain** (above).
- **OnlyMeta role**: the repo is a four-lane team build (collector, SaaS, AIOps, frontend) and does not say which lane was yours. Edit `role` in `src/content/systems.ts`.
- **Role wording**: the case files say you define the product and decisions and build with Claude Code. Adjust `role` fields and the FAQ answer if that is not how you want it put.
- **DueClock hosting**: the repo's deploy config is Fly.io (Tokyo) plus a Supabase database in Seoul; the old site said AWS Mumbai. The case file states both and marks the data-residency decision as open. Update it when decided.
- **FIN-OS voice**: the reply voice uses Microsoft Edge TTS (cloud, per your own TRD). The site says so under "not proven". Replace with a local TTS and update, or keep the note.
- Add public GitHub links as "Source" rows where repos are public. Add real testimonials only if you have them.

## Check the "1,400 parity cases" claim yourself

```bash
git clone https://github.com/vikasmanjunath-dev/portfolio.git && cd portfolio
npm ci
npm run test:parity   # DueClock 400/400, AkaarAI colour rules 500/500, FIN-OS pillars 500/500
```

The case files in `scripts/parity/*_cases.json` were generated by calling the real Python rule engines with random inputs
(`gen_*.py`). The generators import the original project code, and two of those repositories (VYBES LYNK, AkaarAI) are private,
so only the saved cases are re-run here; the TypeScript ports in `src/labs/` must reproduce every saved output exactly.
What this shows is that a port behaves like the code it copies, not that the rules are right for real users.

## Print routes

`/print/resume/<software|product|risk>/` and `/print/<core-slug>/` are print-styled pages. The PDFs in `public/` (`Vikas_Manjunath_Resume*.pdf`, `onepagers/`)
are produced from them with headless Chrome (`--print-to-pdf`), so the PDFs and the site share one source of content.

## Tests and guards (all run in CI)

```bash
npm run test:parity   # 1,400 random cases from the real Python vs the TypeScript ports
npm run build && npm run test:links   # every internal href, src and #anchor in out/
npm run test:e2e      # Playwright: Verify/Zen/palette keys, ?for= presets, contact form (mocked), honeypot, essays, RSS, 404
npm run test:lh       # Lighthouse mobile budget (a11y >= 0.98 everywhere, home perf >= 0.7, /brief/ >= 0.9)
npm run og            # regenerate public/og/*.png share cards from the built pages
```

Deep links: `/?for=recruiter`, `/?for=judge` or `/?for=founder` opens the page in that visitor order. Essays have permanent URLs under `/writing/<slug>/` and an RSS feed at `/feed.xml`.

Licence: MIT.
