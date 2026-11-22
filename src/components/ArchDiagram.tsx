'use client';
import { useMemo, useState } from 'react';
import type { Project } from '@/content/types';

const NW = 168, NH = 64, GX = 64, GY = 26, PAD = 28;

export default function ArchDiagram({ arch, hue }: { arch: Project['arch']; hue: string }) {
  const [sel, setSel] = useState<string>(arch.nodes.find((n) => n.hl)?.id || arch.nodes[0].id);
  const [hov, setHov] = useState<string | null>(null);
  const cols = Math.max(...arch.nodes.map((n) => n.col)) + 1, rows = Math.max(...arch.nodes.map((n) => n.row)) + 1;
  const W = PAD * 2 + cols * NW + (cols - 1) * GX, H = PAD * 2 + rows * NH + (rows - 1) * GY;
  const pos = useMemo(() => { const m = new Map<string, { x: number; y: number }>(); arch.nodes.forEach((n) => m.set(n.id, { x: PAD + n.col * (NW + GX), y: PAD + n.row * (NH + GY) })); return m; }, [arch]);
  const focus = hov || sel; const node = arch.nodes.find((n) => n.id === sel)!;
  const touches = (e: [string, string, string?]) => e[0] === focus || e[1] === focus;
  const near = new Set<string>([focus, ...arch.edges.filter(touches).flatMap((e) => [e[0], e[1]])]);

  return (
    <div className="arch-wrap" style={{ ['--w' as string]: hue } as React.CSSProperties}>
      <div className="arch-scroll"><svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={arch.title}>
        <defs><marker id="ah" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="var(--w)" /></marker></defs>
        {arch.edges.map(([a, b, label], i) => {
          const A = pos.get(a)!, B = pos.get(b)!; if (!A || !B) return null;
          const fwd = B.x >= A.x; const x1 = fwd ? A.x + NW : A.x, x2 = fwd ? B.x : B.x + NW; const same = A.x === B.x;
          const y1 = A.y + NH / 2, y2 = B.y + NH / 2;
          const d = same ? `M${A.x + NW / 2},${A.y + (B.y > A.y ? NH : 0)} L${B.x + NW / 2},${B.y + (B.y > A.y ? 0 : NH)}` : `M${x1},${y1} C${x1 + (fwd ? 38 : -38)},${y1} ${x2 + (fwd ? -38 : 38)},${y2} ${x2},${y2}`;
          const on = touches([a, b]); const dim = focus && !on;
          return (
            <g key={i}>
              <path d={d} className={`ed ${on ? 'on' : ''} ${dim ? 'dim' : ''}`} markerEnd={on ? 'url(#ah)' : undefined} />
              <path d={d} className={`flow ${on ? 'on' : ''}`} />
              {label && <text className="el" x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} fontSize="9" textAnchor="middle" opacity={dim ? 0.3 : 1}>{label}</text>}
            </g>
          );
        })}
        {arch.nodes.map((n) => {
          const p = pos.get(n.id)!; const dim = focus && !near.has(n.id);
          return (
            <g key={n.id} className={`nd ${n.hl ? 'hl' : ''} ${sel === n.id ? 'sel' : ''} ${dim ? 'dim' : ''}`} transform={`translate(${p.x},${p.y})`} tabIndex={0} role="button" aria-label={`${n.label}: ${n.sub}`} aria-pressed={sel === n.id}
              onClick={() => setSel(n.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel(n.id); } }} onMouseEnter={() => setHov(n.id)} onMouseLeave={() => setHov(null)} onFocus={() => setHov(n.id)} onBlur={() => setHov(null)}>
              <rect width={NW} height={NH} rx="12" strokeWidth={n.hl ? 1.6 : 1} />
              <text x={14} y={27} fontSize="13.5" fontWeight="600">{n.label.length > 22 ? n.label.slice(0, 21) + '…' : n.label}</text>
              <text className="sub" x={14} y={47} fontSize="10">{n.sub.length > 30 ? n.sub.slice(0, 29) + '…' : n.sub}</text>
            </g>
          );
        })}
      </svg></div>
      <div className="arch-detail" aria-live="polite"><span className="mono" style={{ color: 'var(--w)' }}>{arch.title} · click a node</span><h4>{node.label}</h4><p>{node.detail}</p></div>
    </div>
  );
}
