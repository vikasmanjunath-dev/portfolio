/** "Run it yourself" data. Commands are copied from each project's own README; the repository links are the public GitHub repos. */
export type RunInfo = { repo?: string; cmds: string[]; note: string };
const GH = 'https://github.com/vikasmanjunath-dev';
const PRIVATE = 'The source repository for this project is private. The live lab on this page runs the real rules in your browser; email me for read access to the code.';
export const RUN: Record<string, RunInfo> = {
  finos: {
    repo: `${GH}/FIN-OS`,
    cmds: ['git clone https://github.com/vikasmanjunath-dev/FIN-OS.git', 'cd FIN-OS', 'python3 -m http.server 3000   # serve the web app locally', 'npm run check               # static audits', 'npm test                    # JS unit tests and pytest files'],
    note: 'From the README. The browser test suites need Playwright and Chromium; the voice agent needs a local Ollama model.',
  },
  'vybes-lynk': { cmds: [], note: PRIVATE },
  akaarai: { cmds: [], note: PRIVATE },
  dueclock: {
    repo: `${GH}/DueClock`,
    cmds: ['git clone https://github.com/vikasmanjunath-dev/DueClock.git', 'cd DueClock', 'pip install -r requirements-dev.txt', 'python3 -m pytest -q', 'python3 -m dueclock.core.cli create-tenant "Customer" --data-dir ./data', 'python3 -m dueclock.core.cli serve --data-dir ./data --port 8100'],
    note: 'From the README. Runs the clock engine, the HTTP API and the owner dashboard on your machine.',
  },
  onlymeta: {
    repo: `${GH}/OnlyMeta`,
    cmds: ['git clone https://github.com/vikasmanjunath-dev/OnlyMeta.git', 'cd OnlyMeta/platform', 'python3 -m venv .venv && source .venv/bin/activate', 'pip3 install -r requirements.txt', 'python3 -m pytest -q          # 377 tests, about 2 minutes', 'python3 tools/demo.py up      # SaaS :8000 + two collectors', 'python3 tools/demo.py drill   # 41 self-checks, about 2 minutes'],
    note: 'From the README, corrected after I re-ran it on a fresh clone on 23 Nov 2026: the code is in platform/, and the README’s test counts are out of date.',
  },
};
