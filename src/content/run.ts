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
    cmds: ['git clone https://github.com/vikasmanjunath-dev/OnlyMeta.git', 'cd OnlyMeta', 'pip3 install -r requirements.txt', 'python3 -m pytest -q          # 182 tests', 'python3 tools/demo.py up      # SaaS :8000 + two collectors', 'python3 tools/demo.py drill   # self-checking drill'],
    note: 'From the README. Run the commands from the folder that holds requirements.txt.',
  },
  'nifty-analyser': {
    repo: `${GH}/NIFTY50`,
    cmds: ['git clone https://github.com/vikasmanjunath-dev/NIFTY50.git', 'cd NIFTY50', 'python -m venv .venv && source .venv/bin/activate', 'pip install -r requirements.txt', 'pytest', 'python scripts/run_phase1_baseline.py'],
    note: 'From the README. Phase 3 needs a local Ollama server.',
  },
};
