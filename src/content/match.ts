import { PROJECTS } from '@/content';

/** Normalise a skill phrase to canonical lowercase tokens so "Postgres", "PostgreSQL" and "psql" meet. */
const ALIAS: Record<string, string> = {
  postgres: 'postgresql', psql: 'postgresql', 'node.js': 'nodejs', node: 'nodejs', js: 'javascript', ts: 'typescript', k8s: 'kubernetes',
  ml: 'ml', llms: 'llm', 'react.js': 'react', reactjs: 'react', nextjs: 'next.js', next: 'next.js',
  'ci/cd': 'cicd', cicd: 'cicd', restful: 'rest', apis: 'api', tests: 'testing', test: 'testing',
  tdd: 'testing', sqlite3: 'sqlite', golang: 'go', py: 'python', gpt: 'llm', genai: 'llm', docker: 'docker', containers: 'docker',
};
const STOP = new Set('engineering engineer software developer intern internship a an and or the of to in on for with by from at as is are be this that your our you we will can using use used build building design designing strong experience knowledge years year plus etc good great team work working ability skills skill preferred required requirements responsibilities role candidate must have has into across within including such other more new'.split(' '));
/** Common tech terms we can name as gaps when a job description wants them and no project of mine uses them. */
const WATCH = 'java spring kotlin swift scala ruby rails php laravel c++ c# .net golang rust kubernetes terraform ansible jenkins aws azure gcp kafka rabbitmq redis mongodb cassandra elasticsearch spark hadoop airflow snowflake tableau powerbi pytorch tensorflow numpy pandas opencv graphql grpc flutter android ios angular vue svelte django flask nginx linux bash selenium cypress jira figma'.split(' ');

export const canon = (w: string) => { const x = w.toLowerCase().replace(/^[^a-z0-9+#.]+|[^a-z0-9+#.]+$/g, ''); return ALIAS[x] ?? x; };
export const tokens = (s: string) => s.replace(/[(),;:/\-]/g, ' ').split(/\s+/).map(canon).filter((t) => t.length > 1 && !STOP.has(t));

export type MatchProject = { slug: string; name: string; tagline: string; hue: string; vocab: string[]; };
export const MATCH_DATA: MatchProject[] = PROJECTS.map((p) => ({
  slug: p.slug, name: p.name, tagline: p.tagline, hue: p.hue,
  vocab: [...new Set([...p.stack.flatMap((l) => l.items.map((i) => i.name)), ...p.skills, ...p.languages].flatMap(tokens))],
}));
export const KNOWN = new Set(MATCH_DATA.flatMap((p) => p.vocab));
export const WATCHLIST = WATCH;

export function matchJD(jd: string) {
  const jt = new Set(tokens(jd.replace(/\bci\/cd\b/gi, 'cicd')));
  const scored = MATCH_DATA.map((p) => { const hit = p.vocab.filter((v) => jt.has(v)); return { p, hit, score: hit.length }; }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
  const gaps = WATCH.filter((w) => jt.has(canon(w)) && !KNOWN.has(canon(w)));
  return { scored, gaps, terms: jt.size };
}
