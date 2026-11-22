import { EV, type Ev as EvK } from '@/content/types';
import { GLOSS, TERM_MAP } from '@/content/gloss';
import { PROJECTS } from '@/content';

/** Evidence tag. always: shown always (spec tables). Otherwise only in Verify mode. */
export function Ev({ k, src, always }: { k: EvK; src?: string; always?: boolean }) {
  const e = EV[k];
  return <span className={`ev ${k} ${always ? '' : 'verify-only'}`} tabIndex={0} data-tip={`${e.label}: ${e.help}${src ? ' Source: ' + src : ''}`} aria-label={`${e.label}${src ? ', source ' + src : ''}`}>{e.short}</span>;
}

const SORTED = [...TERM_MAP].sort((a, b) => b[0].length - a[0].length);
const ESC = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RX = new RegExp('(' + SORTED.map(([t]) => ESC(t)).join('|') + ')(?![A-Za-z0-9])', 'g');
const GMAP = new Map(SORTED.map(([t, id]) => [t, id]));

/** Text with glossary terms: the first occurrence of each term gets a hover/focus definition. */
export function Rich({ children, here }: { children: string; here?: boolean }) {
  const text = children;
  const out: React.ReactNode[] = []; const seen = new Set<string>(); let last = 0; let m: RegExpExecArray | null; let i = 0;
  RX.lastIndex = 0;
  while ((m = RX.exec(text))) {
    if (m.index > 0 && /[A-Za-z0-9]/.test(text[m.index - 1])) continue;
    const id = GMAP.get(m[1]); if (!id || seen.has(id)) continue; seen.add(id);
    if (m.index > last) out.push(text.slice(last, m.index));
    const g = GLOSS[id];
    out.push(<span className="term" tabIndex={0} key={i++}>{m[1]}<span className="term-tip" role="tooltip"><b>{g.t}</b>{g.d}{here && g.here ? <i>Here: {g.here}</i> : null}</span></span>);
    last = m.index + m[1].length;
  }
  out.push(text.slice(last));
  return <>{out}</>;
}

/** Split a heading into word masks for the reveal animation. */
export function Split({ text, className = '', tag: Tag = 'span', italicFrom }: { text: string; className?: string; tag?: 'span' | 'h1' | 'h2' | 'h3' | 'p'; italicFrom?: number }) {
  const words = text.split(' ');
  return (
    <Tag className={`split ${className}`}>
      <span className="sr-only">{text}</span>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true">
          <span className="ch" style={{ ['--c' as string]: i } as React.CSSProperties}><span style={italicFrom !== undefined && i >= italicFrom ? { fontStyle: 'italic', color: 'var(--acc)' } : undefined}>{w}</span></span>{i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}

export function Legend() {
  return (
    <div className="legend" role="group" aria-label="Evidence legend">
      {(['ok', 'doc', 'self'] as EvK[]).map((k) => <span key={k} className={`ev ${k}`} style={{ cursor: 'default' }} title={EV[k].help}>{EV[k].label}</span>)}
      <span className="mono" style={{ fontSize: '.66rem' }}>Press V to tag every claim</span>
    </div>
  );
}

export const projectBySlug = (s: string) => PROJECTS.find((p) => p.slug === s);
