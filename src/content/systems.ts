import type { Project } from './types';

export const OnlyMeta: Project = {
  slug: 'onlymeta', idx: 'S1', name: 'OnlyMeta', kind: 'Systems', hue: '#4de3d0', status: '24-hour hackathon build', tone: 'done',
  tagline: 'Secure two-tier AIOps observability: only metadata leaves the customer’s network, and a judge can re-compute that claim themselves.',
  period: 'Nov 2026 · built at the CICADA 2026 hackathon (TechForcz × Atria Institute of Technology)',
  role: 'Led the build of a four-person team (collector, SaaS backend, AIOps and frontend lanes) and worked across all four. All 45 commits in the combined repository are under my account, across the collector, SaaS service and UI, tools, tests and docs.',
  team: 'Four roles: P1 collector, P2 SaaS backend, P3 AIOps, P4 frontend.',
  problem: {
    headline: 'Every observability vendor says "only metadata leaves your network". A CISO cannot tell a promise from a fact.',
    context: [
      'Teams that run many sites want one place to see health, anomalies and incidents. But shipping raw logs, IPs, usernames and secrets to a vendor SaaS is a breach waiting to happen, and static thresholds bury operators in noisy alerts.',
      'The brief was a two-tier design: a Tier-1 collector inside the customer environment, a Tier-2 SaaS that sees only numbers and pseudonyms, with AIOps on top that detects, correlates and safely proposes fixes.',
    ],
    stakes: [
      ['Trust boundary', 'Raw logs, IPs, users, emails, secrets must never reach the SaaS', 'doc', 'docs/allowlist.md'],
      ['Alert noise', 'Static thresholds create noisy, uncorrelated alerts', 'doc', 'Phase 1 pack'],
      ['Data residency', 'Tenants send to their assigned region (IN, EU)', 'doc', 'contracts/tenants.yaml'],
    ],
  },
  constraints: [
    'A 24-hour event with a 15-hour build plan; contracts agreed in the first 90 minutes so four people could build in parallel.',
    'The SaaS must never hold raw data, even by accident: the boundary has to fail closed.',
    'Everything measured, nothing simulated as real: remediation touches no real system.',
    'Each tenant isolated, with per-region storage.',
  ],
  solution: {
    headline: 'A collector with three layers of redaction, a signed ingest path, and an AIOps engine that explains its own decisions.',
    body: [
      'Tier 1 turns raw events into an 18-field allow-listed payload (Pydantic with extra="forbid"), scrubs secret-looking text, and runs an outbound scanner that BLOCKS the whole payload if any secret or PII pattern remains. An Egress Proof Panel shows raw and outbound side by side with a SHA-256 per payload that the SaaS re-computes.',
      'Tier 2 verifies HMAC-signed requests, stores before it acknowledges, deduplicates by (tenant_id, payload_id), and evaluates health, anomalies, incidents, root cause and recommendations. Remediation is a simulation behind policy, two-person approval, auto-rollback and a hash-chained audit log.',
    ],
    features: [
      ['Egress Proof', 'Per-payload record of exactly what left, next to the raw data it came from, with a re-computable SHA-256'],
      ['Signed ingest', 'HMAC-SHA256 over method, path, timestamp, nonce and body hash; replay-safe'],
      ['AIOps', 'Rolling z-score baselines, incident correlation, weighted root cause, ranked recommendations'],
      ['Safe remediation', 'Allow-listed catalogue, autonomy levels, two approvals for high risk, auto-rollback, kill switch'],
      ['Chaos panel', 'Inject secrets, outages, brute force, latency, CPU spikes, duplicates and out-of-order events'],
      ['Tracker', 'Six-hop latency per payload (collected, sent, received, stored, evaluated, published) with p95 against a 10 s target'],
    ],
  },
  stack: [
    { layer: 'Tier 1: collector', items: [
      { name: 'Python', why: 'Adapter for the organiser’s stream, redaction, aggregation, outbox with backpressure, adaptive sampling, self-health in every payload.' },
      { name: 'Pydantic v2', why: 'Structural allow-list: unknown fields are refused, not dropped silently.' },
      { name: 'SQLite outbox', why: 'Store-and-forward with replay; sheds lowest severity first under pressure and always records DROPPED.' },
    ]},
    { layer: 'Tier 2: SaaS', items: [
      { name: 'FastAPI + Uvicorn', why: 'Ingest, auth, fleet, incidents, remediation, tracker; SSE live stream for the dashboard.' },
      { name: 'SQLite per region', why: 'data/saas_in.db and data/saas_eu.db enforce residency by file; retention purge configurable.' },
      { name: 'httpx', why: 'Collector client and signed webhooks (host allow-list, HMAC + timestamp, retries, delivery log).' },
    ]},
    { layer: 'Security', items: [
      { name: 'HMAC-SHA256 request signing', why: 'Key never sent; ±300 s window; nonce cache; constant-time compare; unknown key and bad signature look identical; 429 per key (20 rps, burst 40).' },
      { name: 'Fernet at rest', why: 'Rotated key secrets are encrypted; KEK from a secret manager or an auto-created chmod-600 file.' },
      { name: 'Hash-chained audit log', why: '/api/audit/verify detects any edit or deletion; never purged.' },
    ]},
    { layer: 'Contracts and ops', items: [
      { name: 'YAML contracts', why: 'thresholds, tenants, dependency map, remediation policy, webhooks: every rule reported, nothing hard-coded.' },
      { name: 'Prometheus-format /metrics', why: 'cicada_incidents_open, cicada_anomalies_open, cicada_remediations{status}.' },
      { name: 'Docker Compose', why: 'Ports bound to 127.0.0.1; one-command demo (python tools/demo.py up).' },
    ]},
  ],
  languages: ['Python', 'YAML', 'HTML/JavaScript (dashboard)', 'English'],
  spec: [
    ['Event', '24-hour hackathon: CICADA 2026, TechForcz × Atria Institute of Technology; theme "Secure Two-Tier AIOps Observability"', 'doc', 'Phase 1 problem-understanding PDF'],
    ['Boundary', 'Three layers: schema allow-list (extra="forbid"), regex scrub, outbound scanner that blocks the payload', 'doc', 'collector/redact.py'],
    ['Allow-list', '18 allow-listed payload fields; anything else is refused', 'doc', 'Egress Proof (PDF)'],
    ['Detectors', '16 detector families: 13 secret, 2 PII, 1 entropy', 'doc', 'Egress Proof (PDF)'],
    ['Egress states', '5: QUEUED, SENT, BLOCKED, DROPPED, REJECTED', 'doc', 'Egress Proof (PDF)'],
    ['Signing', 'HMAC-SHA256 over METHOD, path?query, timestamp, nonce, sha256(body); ±300 s; nonce cache; per-key 429', 'doc', 'README, Advancements P1+P2'],
    ['Reliability', 'Store before ACK; recover() re-queues stored-but-unevaluated; same payload_id with different content is refused (payload_id_conflict) and audited', 'doc', 'README'],
    ['Throughput', '10,000 payloads across 5 collectors: 0 lost, 0 duplicated; ~2.6k/s with inline evaluation, ~5.2k/s acknowledged with the async queue (one laptop-class core, in-process)', 'doc', 'README'],
    ['Latency', 'p95 event-to-dashboard 1.5 s at the demo stream over loopback HTTP; target 10 s', 'doc', 'README'],
    ['Anomalies', 'Rolling 15-min baseline, 30-sample warm-up, z-score with sigma floor, 2-of-3 confirmation (fast path z≥6); anomalous samples are not learned', 'doc', 'README P3'],
    ['Root cause', 'Weighted score: coverage 0.5, timing 0.3, strength 0.2 over the dependency graph; incidents merge within 2 hops and 30 s', 'doc', 'README P3'],
    ['Testing', '182 tests (contracts, collector, SaaS) plus a self-checking drill: two-tenant isolation, CLI scenarios, kill -9 recovery', 'doc', 'README'],
  ],
  arch: {
    title: 'Two tiers, one trust boundary',
    nodes: [
      { id: 'raw', label: 'Raw data', sub: 'logs · IPs · users', detail: 'Visible only inside the customer environment, and in the Egress Proof Panel next to what left.', col: 0, row: 1 },
      { id: 'col', label: 'Collector', sub: 'allow-list + scrub', detail: 'Layer 1: Pydantic allow-list (extra="forbid"). Layer 2: regex scrub of secrets. Pseudonyms are HMAC(tenant_key, label), never a bare hash.', col: 1, row: 1, hl: true },
      { id: 'gate', label: 'Egress gate', sub: 'outbound scanner', detail: 'Layer 3: scans the exact outbound JSON for secrets, IPs and emails. Any hit means the payload is BLOCKED and never sent.', col: 2, row: 1, hl: true },
      { id: 'proof', label: 'Egress Proof', sub: 'SHA-256 per payload', detail: 'Shows raw vs outbound side by side with outcome and a canonical hash the SaaS re-computes.', col: 2, row: 0 },
      { id: 'ingest', label: 'SaaS ingest', sub: 'signed · dedup · store→ACK', detail: 'Verifies the HMAC, checks region residency, dedups by (tenant_id, payload_id), stores, then ACKs. Evaluation is queued.', col: 3, row: 1 },
      { id: 'aiops', label: 'AIOps engine', sub: 'z-score · RCA', detail: 'Baselines, 2-of-3 confirmation, incident correlation, weighted root cause, ranked recommendations with a digital-twin estimate.', col: 4, row: 0 },
      { id: 'rem', label: 'Remediation', sub: 'simulated · approved', detail: 'Policy, two approvals for high risk (approver ≠ proposer), 15 min expiry, precondition re-check, auto-rollback, kill switch.', col: 4, row: 1 },
      { id: 'dash', label: 'Dashboard + SSE', sub: 'fleet · incidents', detail: 'Live health, incidents, tracker and chaos tabs over server-sent events; tenant comes only from the token.', col: 4, row: 2 },
    ],
    edges: [['raw', 'col'], ['col', 'gate'], ['col', 'proof', 'raw vs out'], ['gate', 'ingest', 'signed'], ['ingest', 'aiops'], ['aiops', 'rem'], ['ingest', 'dash', 'SSE']],
  },
  decisions: [
    { q: 'Pseudonyms vs the dependency map?', chose: 'Pseudonym = HMAC(tenant_key, logical label); the tenant registers labels only.', rejected: 'Collector sends the map already pseudonymised', why: 'Real FQDNs and IPs never leave. Option B is safer but needs a registration call; the trade-off was written down for the team.' },
    { q: 'How to prove the boundary?', chose: 'Egress Proof: show what left, side by side with the raw data, with a re-computable hash.', rejected: 'A slide saying "we are safe"', why: 'A judge or CISO can watch and re-compute instead of trusting.' },
    { q: 'How to stop baselines being poisoned?', chose: 'Anomalous samples are not learned; level shifts re-baseline after 3 minutes.', rejected: 'Learning from every sample', why: 'A sustained fault would otherwise teach the model that the fault is normal.' },
    { q: 'Autonomous remediation?', chose: 'Off by default; suggest, assisted, auto_low; two approvals for high risk.', rejected: 'Fully autonomous fixes', why: 'Approver must differ from proposer; preconditions re-checked at execution; auto-rollback if worse.' },
    { q: 'Where to scale later?', chose: 'Roadmap only: Postgres/Timescale, a message queue, managed KMS, mTLS.', rejected: 'Building them in 24 hours', why: 'Known limits are stated instead of hidden.' },
  ],
  hard: [
    { problem: 'Make "only metadata leaves" checkable.', approach: 'Three-layer boundary plus an Egress Proof Panel and a SHA-256 the receiver recomputes.', result: 'The claim becomes something a judge can watch and verify. Try the guard in the lab below.' },
    { problem: 'A captured request must not be replayable, even across a restart.', approach: 'Timestamp window, nonce cache held in memory only, constant-time compare, identical errors for unknown key and bad signature.', result: 'Requests signed before a SaaS restart are refused after it.' },
    { problem: 'Never lose or duplicate a payload.', approach: 'Store before ACK, evaluate afterwards, recover() on start, dedup on (tenant_id, payload_id), refuse conflicting replays.', result: '10,000 payloads over 5 collectors: 0 lost, 0 duplicated.' },
    { problem: 'Detect anomalies honestly.', approach: 'Benchmarked static thresholds, EWMA, rolling MAD and the AIOps z-score on the same labelled faults with 30 seeds.', result: 'It reports its own misses, for example a 12 to 17 ms latency shift is not detected.' },
    { problem: 'Rank root causes, not symptoms.', approach: 'Weighted score of coverage, timing and strength over the dependency graph; a silent collector is its own root.', result: 'One incident per failure instead of one alert per node.' },
  ],
  proof: [
    { n: '182', label: 'tests passing', ev: 'doc', src: 'README' },
    { n: '0 / 0', label: 'payloads lost / duplicated in 10,000', ev: 'doc', src: 'README' },
    { n: '1.5 s', label: 'p95 event-to-dashboard (target 10 s)', ev: 'doc', src: 'README' },
    { n: '16', label: 'detector families guarding egress', ev: 'doc', src: 'Egress Proof PDF' },
    { n: '27', label: 'self-checks in the drill script', ev: 'doc', src: 'README' },
  ],
  limits: [
    'Single process: the rate limiter, login throttle and live-stream bus are in memory, and ingest runs on the event loop.',
    'The Docker files were untested at authoring time (no daemon in the sandbox).',
    'Signing proves integrity and origin; it is not encryption. Outside localhost, TLS is required.',
    'Throughput numbers are in-process on one laptop-class core, not a network load test.',
    'Leading the team is my own statement; nothing independent backs it. What the git history does show is 45 commits from my account across the collector, SaaS service, tools, tests and docs.',
  ],
  skills: ['Trust-boundary design', 'Secure data egress and redaction', 'HMAC request signing, nonce replay defence', 'FastAPI service design', 'Anomaly detection (z-score, EWMA, MAD)', 'Incident correlation and root-cause scoring', 'Safe automation (approvals, rollback, kill switch)', 'Reliability (store-before-ACK, dedup, recovery)', 'Observability (Prometheus metrics, SSE)', 'Team contracts and parallel build planning'],
  lab: 'egress',
};

export const RELAY: Project = {
  slug: 'relay-ai', idx: 'S2', name: 'RELAY AI', kind: 'Systems', hue: '#a78bfa', status: 'Hackathon prototype', tone: 'proto',
  tagline: 'An engineering workflow that turns a bug report and a repo snapshot into a tested patch for human review, treating all AI output as untrusted input.',
  period: 'Nov 2026',
  role: 'Builder. Architecture, backend, dashboard and threat model; pitch deck, documentation and judge Q&A prepared.',
  problem: {
    headline: 'AI code assistants can propose a fix, but nobody can safely let them change a repository on their own.',
    context: [
      'A bug report arrives with a repository. Triage, investigation, patching and testing are slow and repetitive. A model can do the first drafts, but its output may be wrong, may touch files it should not, and may carry prompt-injected instructions.',
      'The product question is not "can an AI write a patch" but "what evidence must exist, and who must decide, before it changes anything".',
    ],
    stakes: [
      ['Model output', 'Untrusted: paths, patch scope, size, schema and state transitions all validated', 'doc', 'BLUEPRINT.md'],
      ['Authority', 'A passing test and a reviewer recommendation are evidence, not authorisation', 'doc', 'BLUEPRINT.md'],
    ],
  },
  constraints: [
    'Human approval before any target repository changes; apply and commit are separate, explicit actions.',
    'Test execution must be isolated; production must not silently fall back to running uploaded code on the host.',
    'Long-running work is asynchronous: submit, get a task id, watch progress, decide.',
    'Provider, persistence, sandbox and API boundaries must stay replaceable.',
  ],
  solution: {
    headline: 'A durable, auditable pipeline: triage, patch, sandboxed tests, review, human decision.',
    body: [
      'A React dashboard submits a bug report (JSON or ZIP of a repo). A FastAPI backend stores the task in SQLite; a lease-based worker runs three model calls (triage; investigation plus patch; review), applies the patch in a temporary workspace and runs the repository’s tests in a pinned Docker sandbox. The result lands in AWAITING_HUMAN_APPROVAL with the diff, test output and reviewer verdict.',
      'Only then can an operator approve, apply to a base-checked, allow-listed repository, and commit as a separate action. An optional GitHub adapter opens a pull request only after approval and commit, after verifying the exact remote base and head SHAs. RELAY never pushes, merges or deploys.',
    ],
    features: [
      ['Durable worker', 'SQLite queue with leases, abandoned-work recovery, stage-boundary cancellation, bounded retries'],
      ['Three model stages', 'Gemini structured output for triage, investigate-and-patch, and review, validated against schemas'],
      ['Sandbox', 'Pinned immutable image digest, allow-listed test command, resource and network limits, bounded output'],
      ['Approval gate', 'Needs a patch, passing sandbox evidence, security PASS and reviewer APPROVE'],
      ['Repository adapters', 'Task-owned copy by default; optional local Git target with base-revision check; optional GitHub PR adapter'],
      ['Roles', 'Per-user bearer tokens with viewer and operator roles; viewers see only their own tasks'],
    ],
  },
  stack: [
    { layer: 'Dashboard', items: [
      { name: 'React', ver: '19', why: 'Task list, stage timeline, diff and evidence views, guarded approve, reject, apply and commit controls.' },
      { name: 'Vite 8 + Tailwind 4 + TypeScript', why: 'Apple-inspired visual language, System/Light/Dark preference, reduced-motion support, no external fonts.' },
      { name: 'node --test', why: 'Frontend regression tests, including a 4.5:1 contrast guard against the real theme tokens.' },
    ]},
    { layer: 'Backend', items: [
      { name: 'Python 3.11+ and FastAPI', why: 'ASGI-level request-body caps before FastAPI parses JSON or multipart; typed state machine; readiness and health.' },
      { name: 'SQLite', why: 'Task snapshots, source files, append-only events and jobs; transactional state changes.' },
      { name: 'google-genai (Gemini 2.5 Flash)', why: 'Structured-output calls with a configurable model and a deterministic fake provider for local runs.' },
    ]},
    { layer: 'Execution and ops', items: [
      { name: 'Docker sandbox', why: 'Pinned sha256 image; production refuses host-subprocess mode (RELAY_ALLOW_UNSAFE_SUBPROCESS).' },
      { name: 'systemd, GitHub Actions', why: 'Service template that enables production mode; CI runs backend and frontend checks.' },
      { name: 'Backup, retention, redaction', why: 'Backup drills and alerting, retention policy, secret redaction in logs.' },
    ]},
  ],
  languages: ['Python', 'TypeScript', 'Shell', 'English'],
  spec: [
    ['Pipeline', 'QUEUED → RUNNING → TRIAGING → TRIAGED → INVESTIGATING → PATCHED → SANDBOX_RUNNING → SANDBOX_TESTED → REVIEWING → AWAITING_HUMAN_APPROVAL → APPROVED → APPLIED → COMMITTED; terminal: REJECTED, FAILED, CANCELLED', 'doc', 'README.md'],
    ['Model', 'Gemini 2.5 Flash by default (GEMINI_MODEL); three calls: triage; combined investigation and patch; review', 'doc', 'README.md'],
    ['Worker', 'Leases, recovery of abandoned work, stage-boundary cancellation, bounded manual retry', 'doc', 'worker.py'],
    ['Auth', 'Static per-user bearer tokens, optional viewer/operator roles, production requires authentication and a non-wildcard CORS list', 'doc', 'README.md'],
    ['Threat model', 'Six trust boundaries: browser to API, upload to store, worker to Gemini, worker to sandbox, storage to backup, task workspace to repository', 'doc', 'THREAT_MODEL.md'],
    ['Backend tests', '128 passed, 3 skipped in the latest full suite (25 test files)', 'doc', 'TRACKER.md P-B2'],
    ['Concurrency drill', '64 queued jobs drained by 16 concurrent store instances; every job claimed once at attempt 1', 'doc', 'TRACKER.md P-D8'],
    ['Seeded demo bug', 'A $10 discount subtracted twice from a $100 cart ($80, not $90): one failing regression, one passing zero-discount test', 'doc', 'demo-store/README.md'],
    ['Never does', 'Push, merge or deploy; auto-apply; trust model output', 'doc', 'BLUEPRINT.md'],
  ],
  arch: {
    title: 'RELAY AI pipeline',
    nodes: [
      { id: 'ui', label: 'Dashboard', sub: 'React 19', detail: 'Submit a report or ZIP, watch stages, inspect diff and evidence, and take guarded actions.', col: 0, row: 1 },
      { id: 'api', label: 'FastAPI', sub: 'auth · state machine', detail: 'Validates requests, enforces authorisation and state transitions, never runs model calls or tests in the request thread.', col: 1, row: 1 },
      { id: 'db', label: 'SQLite store', sub: 'tasks · events · jobs', detail: 'Durable task snapshots plus append-only events; transactional transitions with idempotency.', col: 2, row: 0 },
      { id: 'w', label: 'Worker', sub: 'leases · retries', detail: 'Claims queued jobs with leases, recovers abandoned work, honours cancellation at stage boundaries.', col: 2, row: 1 },
      { id: 'llm', label: 'Gemini adapter', sub: 'structured output', detail: 'Triage, investigate-and-patch and review. Output is validated against schemas and patch-scope rules before use.', col: 3, row: 0, hl: true },
      { id: 'sb', label: 'Docker sandbox', sub: 'pinned image', detail: 'Runs the allow-listed test command under resource and network limits and captures bounded output with provenance.', col: 3, row: 1, hl: true },
      { id: 'human', label: 'Human approval', sub: 'approve · apply · commit', detail: 'Approval needs a patch, passing sandbox evidence, security PASS and reviewer APPROVE. Apply needs a matching base revision. Commit is a separate action.', col: 3, row: 2, hl: true },
      { id: 'git', label: 'Repo adapter', sub: 'local · GitHub PR', detail: 'Allow-listed targets only; base re-checked before apply; PR opened only after commit with exact SHA verification.', col: 4, row: 2 },
    ],
    edges: [['ui', 'api'], ['api', 'db'], ['api', 'w', 'enqueue'], ['w', 'llm'], ['w', 'sb'], ['sb', 'human', 'evidence'], ['llm', 'human'], ['human', 'git']],
  },
  decisions: [
    { q: 'Is a passing test enough to apply a patch?', chose: 'No: evidence, not authorisation. A human approves.', rejected: 'Auto-apply on green', why: 'Tests can be incomplete, and a model can write a patch that passes while being wrong.' },
    { q: 'What if Docker is missing in production?', chose: 'Refuse to run.', rejected: 'Fall back to running uploaded code on the host', why: 'The host-subprocess mode runs untrusted code on the API host; it exists only for trusted local development.' },
    { q: 'Should RELAY push and merge?', chose: 'Never. Open a PR only from an already-published, SHA-verified branch.', rejected: 'Push, merge or deploy endpoints', why: 'The blast radius of a mistaken model output stays at "a PR someone must review".' },
    { q: 'Where does state live?', chose: 'SQLite behind a replaceable store interface.', rejected: 'A hosted database from day one', why: 'Single-host simplicity for a prototype, with the boundary kept clean for a later swap.' },
  ],
  hard: [
    { problem: 'Model output may contain anything.', approach: 'Validate paths, patch scope, size, schema and state transitions before acting; redact secrets; bound outputs.', result: 'The system treats AI as an untrusted input stream, with tests for redaction and schemas.' },
    { problem: 'Two workers must never run one job.', approach: 'Lease-based claims in SQLite and a concurrency drill.', result: '64 jobs, 16 concurrent stores, each claimed exactly once.' },
    { problem: 'Cancellation raced completion.', approach: 'Durable-store drills for expired-lease recovery, cancellation winning a race and retry exhaustion.', result: 'Behaviour pinned by tests in test_recovery_drills.py.' },
    { problem: 'A commit acknowledgement can be lost.', approach: 'Disposable-repository drills: stale-base rejection, snapshot matching, recovery after staging, idempotent recognition after a lost acknowledgement.', result: 'Apply and commit stay safe to retry (test_repository_drills.py).' },
  ],
  proof: [
    { n: '128', label: 'backend tests passing (3 skipped)', ev: 'doc', src: 'TRACKER.md' },
    { n: '25', label: 'backend test files', ev: 'doc', src: 'relay-ai/tests' },
    { n: '6', label: 'trust boundaries in the threat model', ev: 'doc', src: 'THREAT_MODEL.md' },
    { n: '64/16', label: 'jobs / concurrent workers in the claim drill', ev: 'doc', src: 'TRACKER.md' },
  ],
  limits: [
    'The live rehearsal with real Gemini and Docker was not run in the authoring environment (it needs credentials and a Docker daemon); the fake-provider and fixture rehearsals pass. Sandbox isolation on a deployment host is unverified.',
    'SQLite and a single host: not a horizontally scaled design. Inbound chat events are not implemented.',
    'A threat model is documentation of the implementation, not a security certification.',
  ],
  skills: ['Agentic workflow design with human-in-the-loop', 'Treating LLM output as untrusted input', 'Durable job queues (leases, retries, cancellation)', 'Sandboxed code execution (Docker)', 'Threat modelling', 'GitHub REST integration with SHA verification', 'FastAPI + React + TypeScript', 'Resilience drills and recovery testing'],
};

export const STM: Project = {
  slug: 'nifty-analyser', idx: 'S3', name: 'Nifty 50 Analyser', kind: 'Research', hue: '#8be28b', status: 'Phases 0-3 complete', tone: 'done',
  tagline: 'A leakage-free machine-learning pipeline for Nifty 50 direction plus a local RAG layer over NSE announcements, with results reported honestly, including that no edge was found.',
  period: 'Sep 2026',
  role: 'Researcher and builder: pipeline design, validation protocol, and a tracker of every task and every bug found.',
  problem: {
    headline: 'Most hobbyist "stock prediction" projects fail silently, either by leaking the future into training or by reporting a cherry-picked number.',
    context: [
      'If features use information that was not available at the time, a backtest looks brilliant and the live result is nothing. If a result is tuned until it looks good, it is noise.',
      'The project’s goal was not a profitable model. It was to build the discipline a real system needs (point-in-time correctness, purged validation, realistic costs, drift monitoring) and then measure honestly.',
    ],
    stakes: [
      ['Failure mode 1', 'Look-ahead leakage inflates backtests', 'doc', 'README'],
      ['Failure mode 2', 'Selective reporting of lucky results', 'doc', 'README'],
    ],
  },
  constraints: [
    'Point-in-time correctness everywhere: no feature may see the future.',
    'Every number reported must be a locked result from a real run on real data.',
    'The LLM layer must be grounded in retrieved evidence, with guardrails against unsupported claims.',
  ],
  solution: {
    headline: 'A validated pipeline plus a retrieval-augmented intelligence layer, and a tracker that records every failure.',
    body: [
      'Phase 1 builds ingestion, labels, technical features and purged, embargoed walk-forward validation. Phase 2 enriches with 110 features (technical, delivery, cross-sectional, macro, regime, fundamentals, FII/DII flows), calibration, ensembles, regime detection, cost-aware backtests and drift monitoring. Phase 3 adds a local RAG and LLM layer over NSE announcements with extraction, chunking, embeddings, retrieval, evidence checks and guardrails.',
      'The result: a technicals-only baseline is statistically indistinguishable from no edge, richer features do not change that, and the RAG event features show no incremental trading value (mean IC difference −0.011, negative in all 4 folds). The README says so plainly.',
    ],
    features: [
      ['Walk-forward validation', 'Purged and embargoed folds so overlapping labels and nearby samples cannot leak'],
      ['110-feature pipeline', 'Technical, delivery, cross-sectional, macro, regime, fundamentals, FII/DII'],
      ['Calibration and ensembles', 'Calibrated probabilities, ensemble, selective prediction'],
      ['Cost-stressed backtests', 'Sharpe at baseline, 2x and 5x costs'],
      ['Drift monitoring', 'Feature and data drift checks'],
      ['RAG over NSE filings', 'Local LLM, retrieval, evidence and guardrail modules'],
    ],
  },
  stack: [
    { layer: 'Modelling', items: [
      { name: 'Python, pandas 2.1, NumPy 1.26', why: 'Data and feature pipeline; pyarrow for columnar storage.' },
      { name: 'LightGBM 4.7, XGBoost 3.2, CatBoost, scikit-learn 1.8', why: 'Baselines, boosted trees, logistic regression, calibration.' },
      { name: 'Pydantic 2.12, SciPy', why: 'Typed schemas for data and documents; statistics.' },
    ]},
    { layer: 'Intelligence layer', items: [
      { name: 'Local LLM + embeddings', why: 'Extraction, retrieval and explanation over NSE announcements with evidence and guardrails.' },
      { name: 'pytest', why: '321 tests across 39 test files, including leakage guards and retrieval evaluation.' },
    ]},
  ],
  languages: ['Python', 'SQL', 'English'],
  spec: [
    ['Status', 'Phases 0-3 complete; Phase 4 (production operations) not started', 'doc', 'README, 22 Sep 2026'],
    ['Tests', '321 of 321 passing across 39 test files', 'doc', 'README, 22 Sep 2026'],
    ['Bugs', '27 real bugs found and documented in the tracker', 'doc', 'TRACKER.md'],
    ['Phase 1', 'LightGBM 51.4% ± 3.3% accuracy, IC +0.012 ± 0.053; logistic 51.5% ± 3.4%, IC −0.010 ± 0.049: indistinguishable from no edge', 'doc', 'README'],
    ['Phase 2 (98 features)', '50.4% ± 4.4% accuracy, ROC-AUC 0.519 ± 0.044, IC +0.045 ± 0.093; cost-stressed Sharpe −0.48 at baseline, −1.50 at 2x, −4.21 at 5x', 'doc', 'README'],
    ['Phase 2 (110 features)', '50.10% ± 5.23% accuracy, ROC-AUC 0.5069 ± 0.0212; Sharpe +0.149 at baseline cost, −0.685 at 2x, −3.057 at 5x', 'doc', 'README'],
    ['Ablation', 'Fundamentals + FII/DII: mean IC difference −0.0089 with sign-flipping folds (+0.0418, −0.0783, +0.0020, −0.0012): no real incremental signal', 'doc', 'README'],
    ['RAG ablation', 'Mean IC difference with vs without event features: −0.011, negative in all 4 folds', 'doc', 'README'],
  ],
  arch: {
    title: 'Pipeline stages',
    nodes: [
      { id: 'd', label: 'Data', sub: 'prices · fundamentals · flows', detail: 'Ingestion with quality checks; fundamentals including insurance PDFs; FII/DII flows (DII coverage starts June 2026).', col: 0, row: 1 },
      { id: 'f', label: 'Features', sub: '110 families', detail: 'Technical, delivery, cross-sectional, macro, regime, fundamentals, flow features, all point-in-time.', col: 1, row: 1 },
      { id: 'l', label: 'Labels', sub: 'direction', detail: 'Short-horizon direction targets built without look-ahead.', col: 2, row: 0 },
      { id: 'v', label: 'Purged walk-forward CV', sub: 'embargo', detail: 'Trains on the past, tests on the future, purges overlapping labels and embargoes neighbours.', col: 2, row: 1, hl: true },
      { id: 'm', label: 'Models', sub: 'LightGBM · calibrated', detail: 'Baselines, calibrated ensemble, selective prediction, regime detection.', col: 3, row: 1 },
      { id: 'b', label: 'Cost-aware backtest', sub: 'Sharpe at 1x, 2x, 5x', detail: 'Realistic transaction costs and stress multipliers.', col: 4, row: 1 },
      { id: 'r', label: 'RAG layer', sub: 'NSE announcements', detail: 'Chunk, embed, retrieve and answer with evidence and guardrails.', col: 3, row: 2 },
    ],
    edges: [['d', 'f'], ['f', 'v'], ['l', 'v'], ['v', 'm'], ['m', 'b'], ['d', 'r']],
  },
  decisions: [
    { q: 'What if more features do not help?', chose: 'Report it and keep the features in the research layer only.', rejected: 'Adding complexity until a number looks good', why: 'Every phase’s job was to measure rigorously and say so plainly.' },
    { q: 'How to validate time series?', chose: 'Purged and embargoed walk-forward CV.', rejected: 'Random k-fold', why: 'Random folds leak overlapping labels from the future.' },
    { q: 'What to do with sign-flipping results?', chose: 'Treat them as the signature of no signal.', rejected: 'Promoting the best fold', why: 'Not evidence to promote and not grounds to remove: a disciplined non-conclusion.' },
  ],
  hard: [
    { problem: 'DII flow columns were entirely missing in 3 of 4 training windows.', approach: 'Detected the coverage gap, documented it and reported the result with that caveat.', result: 'The 110-feature result is flagged as flat to slightly worse, not as an improvement.' },
    { problem: '27 bugs hid in a long pipeline.', approach: 'A tracker that logs every task, bug and honestly reported result; 321 tests with leakage guards.', result: 'Each bug is documented with its fix.' },
  ],
  proof: [
    { n: '321', label: 'tests passing', ev: 'doc', src: 'README' },
    { n: '27', label: 'documented bugs found and fixed', ev: 'doc', src: 'TRACKER.md' },
    { n: '110', label: 'features in the latest run', ev: 'doc', src: 'README' },
    { n: '−0.011', label: 'IC difference from RAG features (4 of 4 folds negative)', ev: 'doc', src: 'README' },
  ],
  limits: [
    'The headline finding is negative: no statistically robust directional edge on Nifty 50 daily direction. This is research, not a trading system, and not advice.',
    'Phase 4 (production API, monitoring, audit log, kill switch) has not started.',
  ],
  skills: ['Time-series ML validation (purged walk-forward)', 'Leakage prevention', 'Gradient boosting and calibration', 'Cost-aware backtesting', 'Drift monitoring', 'Retrieval-augmented generation with guardrails', 'Statistical honesty and ablation design', 'Test-driven research'],
};

export const SYNDICATE: Project = {
  slug: 'syndicate', idx: 'S4', name: 'Syndicate', kind: 'Systems', hue: '#f472b6', status: 'Working prototype', tone: 'proto',
  tagline: 'An AI-native procurement and revenue platform: reorder-to-RFQ, contract intelligence, spend analytics and a grounded business copilot, with a written "what is real, what is scoped out" register.',
  period: '2026',
  role: 'Concept, architecture and build: web app, two services, tests.',
  problem: {
    headline: 'Small companies run procurement, spend, contracts and bookkeeping across disconnected tools and spreadsheets.',
    context: [
      'Reorders are manual, contract renewals and auto-renewal traps are missed, supplier concentration risk is invisible, and revenue analytics need a data team.',
      'Syndicate is a "complete business operating system" concept in four pillars (procurement, finance and analytics, bookkeeping, and an audit-and-approval layer). The build covers a first slice of each and says exactly where it stops.',
    ],
    stakes: [
      ['Honesty rule', 'Features that need outside data (credit monitoring, news) are scoped out, not faked', 'doc', 'README: what’s real vs scoped out'],
      ['Benchmarks', 'Cross-company benchmarking is gated behind a 50-company threshold; group purchasing behind 500', 'doc', 'README'],
    ],
  },
  constraints: [
    'Rule-based where explainability matters more than fluency (bookkeeping categorisation is never an LLM guess).',
    'Nothing is sent automatically: approving a drafted email only marks it reviewed.',
    'LLM output is grounded in the user’s own data, and the model must say so plainly when data does not cover a question.',
  ],
  solution: {
    headline: 'A Next.js app over two Python services: one for procurement documents, one for analytics.',
    body: [
      'Inventory intelligence turns a low-stock row into a real RFQ in one click. Contract intelligence extracts renewal dates, auto-renewal terms and risk flags from uploaded contracts, and turns a plain-English need into a complete RFQ. A spend and revenue dashboard runs statistics and ML for overspend and anomaly detection and forecasting.',
      'Supplier analytics rank spend and flag concentration risk and pricing anomalies from your own transactions. A business copilot answers questions about one data domain at a time, grounded in your data. An audit log explains each suggested action in plain, non-hallucinated terms.',
    ],
    features: [
      ['Reorder-to-RFQ', 'One click from low stock to a generated RFQ; re-uploads update SKUs rather than duplicating'],
      ['Contract intelligence', 'Renewal date, auto-renewal terms, risk flags; natural-language RFQ'],
      ['Spend analytics', 'Overspend and anomaly detection, forecasting (pandas, scikit-learn)'],
      ['Bookkeeping', 'Rule-based chart-of-accounts suggestions and a sales-tax economic-nexus monitor'],
      ['Act-with-approval', 'Drafted renegotiation emails are reviewed, never sent automatically'],
      ['Copilot', 'Single-domain, data-grounded Q&A that declines when the data does not cover the question'],
    ],
  },
  stack: [
    { layer: 'Web', items: [
      { name: 'Next.js', ver: '16.3.5', why: 'App Router, server components, server-only data access.' },
      { name: 'React 19, TypeScript, Tailwind, shadcn/ui, Radix', why: 'UI components; Recharts for charts; Sonner toasts; zod 4 validation.' },
      { name: 'Auth.js (NextAuth v5) + bcryptjs', why: 'Credential sessions with the Prisma adapter.' },
      { name: 'Prisma', ver: '6.12', why: '19 models and enums over PostgreSQL; migrations and a seed script.' },
    ]},
    { layer: 'Services', items: [
      { name: 'procurement-service (FastAPI)', why: 'pdfplumber and python-docx text extraction; LLM logic for contracts, RFQs and renegotiation drafts.' },
      { name: 'analysis-service (FastAPI)', why: 'pandas and scikit-learn for statistics, anomalies and forecasting.' },
      { name: 'Docker Compose', why: 'Dev and prod compositions for web, both services and the database.' },
    ]},
    { layer: 'Quality', items: [
      { name: 'pytest + Vitest', why: '22 tests (analysis), 28 (procurement), 30 web unit tests; Playwright e2e scaffold.' },
      { name: 'FakeLLMClient', why: 'A test double so prompt-building and response-parsing are tested without a model or flaky output.' },
    ]},
  ],
  languages: ['TypeScript', 'Python', 'SQL', 'English'],
  spec: [
    ['Architecture', 'Next.js web + two FastAPI services + PostgreSQL via Prisma', 'doc', 'README; package.json'],
    ['Tests', '22 pytest (analysis), 28 pytest (procurement), 30 Vitest (web)', 'doc', 'TRACKER.md'],
    ['Refactor for testability', 'Pure logic extracted from server-only files into stats.ts, gl-categorization.ts and nexus-thresholds.ts before testing, instead of mocking Prisma', 'doc', 'TRACKER.md'],
    ['Gated features', 'Benchmarking needs 50 peer companies; group purchasing needs 500: below that they are not shown', 'doc', 'README'],
    ['Not built', 'Cross-pillar copilot reasoning, external supplier credit or news monitoring, automatic sending of any email', 'doc', 'README'],
  ],
  arch: {
    title: 'Syndicate services',
    nodes: [
      { id: 'web', label: 'Next.js web', sub: 'App Router · Auth.js', detail: 'UI, authentication and server-side data access through Prisma.', col: 0, row: 1 },
      { id: 'db', label: 'PostgreSQL', sub: 'Prisma · 19 models', detail: 'Users, companies, SKUs, transactions, contracts, RFQs, audit entries.', col: 1, row: 0 },
      { id: 'pro', label: 'procurement-service', sub: 'FastAPI', detail: 'Extracts text from PDFs and DOCX, drives LLM calls for contracts, RFQs and renegotiation drafts.', col: 1, row: 1 },
      { id: 'ana', label: 'analysis-service', sub: 'FastAPI · pandas', detail: 'Statistical analysis, anomaly detection and forecasting with scikit-learn.', col: 1, row: 2 },
      { id: 'llm', label: 'Local LLM', sub: 'Ollama', detail: 'Used behind a client interface so tests can substitute a fake.', col: 2, row: 1 },
    ],
    edges: [['web', 'db'], ['web', 'pro'], ['web', 'ana'], ['pro', 'llm']],
  },
  decisions: [
    { q: 'LLM or rules for bookkeeping?', chose: 'Rules against a standard chart of accounts.', rejected: 'An LLM guess', why: 'Exactly where explainability matters more than fluency.' },
    { q: 'How to test LLM-backed code?', chose: 'A FakeLLMClient test double.', rejected: 'Live model calls in tests', why: 'Tests the real prompt-building and parsing without 10-90 s waits or flaky output.' },
    { q: 'What if data is below the threshold?', chose: 'Do not show the benchmark at all.', rejected: 'Showing a statistically meaningless number', why: 'A benchmark under 50 peers is not a benchmark.' },
  ],
  hard: [
    { problem: 'Business logic was welded to database imports, so it could not be tested.', approach: 'Extracted pure logic into dependency-free modules before writing tests, rather than skipping tests or mocking Prisma.', result: 'A real architectural improvement, verified by a full build and lint pass first.' },
    { problem: 'It is easy to overclaim a "complete" business OS.', approach: 'Wrote a "what is real vs scoped out" register for every pillar.', result: 'Every feature states its limits in the README.' },
  ],
  proof: [
    { n: '80', label: 'automated tests (22 + 28 + 30)', ev: 'doc', src: 'TRACKER.md' },
    { n: '3', label: 'services in one compose stack', ev: 'doc', src: 'infra/' },
    { n: '19', label: 'Prisma models and enums', ev: 'doc', src: 'prisma/schema.prisma' },
  ],
  limits: [
    'Full browser end-to-end tests are a noted gap. The audit log never sends email, and no email integration exists.',
    'Cross-pillar copilot reasoning and external supplier risk feeds are explicitly not built.',
  ],
  skills: ['Full-stack architecture (Next.js, Prisma, FastAPI)', 'Document extraction (pdfplumber, python-docx)', 'Data analysis (pandas, scikit-learn)', 'LLM integration with test doubles', 'Scope honesty', 'Docker Compose'],
};
