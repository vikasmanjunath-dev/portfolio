/** Evidence classes. Every claim on the site carries one. Only tag what is true. */
export type Ev = 'ok' | 'doc' | 'self';
export const EV: Record<Ev, { label: string; short: string; help: string }> = {
  ok: { label: 'Checkable', short: 'CHK', help: 'You can open it, run it on this page, or see it live.' },
  doc: { label: 'Documented', short: 'DOC', help: 'Recorded in my own project documents, tests or changelogs. Not public.' },
  self: { label: 'Self-reported', short: 'SELF', help: 'My own statement. Nothing independent backs it yet.' },
};

/** label, value, evidence, source (repo-relative doc and date) */
export type Row = [string, string, Ev, string?];

export type ArchNode = { id: string; label: string; sub: string; detail: string; col: number; row: number; hl?: boolean };
export type ArchEdge = [from: string, to: string, label?: string];

export type StackItem = { name: string; ver?: string; why: string };
export type StackLayer = { layer: string; items: StackItem[] };
export type Decision = { q: string; chose: string; rejected: string; why: string; cost?: string };
export type Hard = { problem: string; approach: string; result: string };
export type Proof = { n: string; label: string; ev: Ev; src: string };

export type LabId = 'finos' | 'clock' | 'privacy' | 'akaar' | 'egress' | 'bunk';

export type Project = {
  slug: string;
  idx: string;
  name: string;
  kind: 'Core' | 'Systems' | 'Research' | 'Coursework';
  tagline: string;
  status: string;
  tone: 'live' | 'build' | 'proto' | 'done';
  hue: string; // accent colour of this project's "world"
  period: string;
  role: string;
  link?: { href: string; text: string };
  problem: { headline: string; context: string[]; stakes: Row[] };
  constraints: string[];
  solution: { headline: string; body: string[]; features: [string, string][] };
  stack: StackLayer[];
  languages: string[]; // programming + human languages, shown as chips
  spec: Row[];
  arch: { title: string; nodes: ArchNode[]; edges: ArchEdge[] };
  decisions: Decision[];
  hard: Hard[];
  proof: Proof[];
  limits: string[];
  skills: string[];
  shots?: { n: string; alt: string; cap: string; wide?: boolean }[];
  lab?: LabId;
  team?: string;
};
