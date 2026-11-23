'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PROJECTS, isCore, tierLabel } from '@/content';
import { TECH, EMAIL, LINKEDIN, GITHUB, ESSAYS, ESSAY_ORDER } from '@/content/site';
import { useApp } from './Shell';

type Item = { id: string; label: string; hint: string; group: string; run: () => void; kw?: string };

export default function Palette({ onClose }: { onClose: () => void }) {
  const { go, scrollToId, verify, setVerify, zen, setZen, toggleTheme, toast } = useApp();
  const [q, setQ] = useState(''); const [sel, setSel] = useState(0);
  const inp = useRef<HTMLInputElement>(null); const list = useRef<HTMLUListElement>(null);
  useEffect(() => { inp.current?.focus(); }, []);

  const items = useMemo<Item[]>(() => {
    const close = (f: () => void) => () => { onClose(); setTimeout(f, 30); };
    const it: Item[] = [];
    PROJECTS.forEach((p) => it.push({ id: 'p-' + p.slug, label: p.name, hint: tierLabel(p), group: isCore(p) ? 'Core projects' : 'Secondary builds', run: close(() => go('/work/' + p.slug)), kw: `${p.tagline} ${p.languages.join(' ')} ${p.skills.join(' ')}` }));
    [['work', 'Selected work'], ['labs', 'Live labs: run the engineering'], ['stack', 'Technology constellation'], ['proof', 'Numbers'], ['method', 'Method'], ['decisions', 'Decisions wall'], ['journey', 'Build log'], ['writing', 'Writing'], ['about', 'About and education'], ['faq', 'FAQ'], ['contact', 'Contact']].forEach(([id, l]) => it.push({ id: 's-' + id, label: l, hint: 'Section', group: 'Go to', run: close(() => scrollToId(id)) }));
    TECH.forEach((t) => it.push({ id: 't-' + t.id, label: t.name, hint: `${t.cat} · ${t.projects.length} project${t.projects.length === 1 ? '' : 's'}`, group: 'Technology', run: close(() => { try { sessionStorage.setItem('vm.pending', 't:' + t.id); } catch { /* ignore */ } scrollToId('stack'); window.dispatchEvent(new CustomEvent('vm:tech', { detail: t.id })); }), kw: t.note }));
    ESSAY_ORDER.forEach((k) => it.push({ id: 'e-' + k, label: ESSAYS[k].t, hint: 'Essay', group: 'Writing', run: close(() => { try { sessionStorage.setItem('vm.pendingEssay', k); } catch { /* ignore */ } scrollToId('writing'); window.dispatchEvent(new CustomEvent('vm:essay', { detail: k })); }) }));
    it.push(
      { id: 'a-verify', label: verify ? 'Verify mode: turn off' : 'Verify mode: tag every claim with its evidence', hint: 'V', group: 'Actions', run: close(() => setVerify(!verify)) },
      { id: 'a-zen', label: zen ? 'Zen mode: turn off' : 'Zen mode: calm, no 3D or motion', hint: 'Z', group: 'Actions', run: close(() => setZen(!zen)) },
      { id: 'a-theme', label: 'Toggle light and dark theme', hint: 'T', group: 'Actions', run: close(toggleTheme) },
      { id: 'a-mail', label: 'Copy my email', hint: EMAIL, group: 'Actions', run: close(() => { try { navigator.clipboard.writeText(EMAIL); } catch { /* ignore */ } toast('Email copied'); }) },
      { id: 'a-cv', label: 'Download résumé (PDF)', hint: 'PDF', group: 'Actions', run: close(() => { const a = document.createElement('a'); a.href = '/Vikas_Manjunath_Resume.pdf'; a.download = ''; a.click(); }) },
      { id: 'a-brief', label: '30-second version', hint: 'page', group: 'Actions', run: close(() => { window.location.href = '/brief/'; }) },
      { id: 'a-tour', label: 'Watch the 80-second tour', hint: 'video', group: 'Actions', run: close(() => { window.location.href = '/brief/#tour'; }) },
      { id: 'a-match', label: 'Match a job description to my projects', hint: 'page', group: 'Actions', run: close(() => { window.location.href = '/match/'; }) },
      { id: 'a-ledger', label: 'Evidence ledger (every number, with its source)', hint: 'page', group: 'Actions', run: close(() => { window.location.href = '/evidence/'; }) },
      { id: 'a-gh', label: 'Open GitHub', hint: '↗', group: 'Actions', run: close(() => window.open(GITHUB, '_blank', 'noopener')) },
      { id: 'a-li', label: 'Open LinkedIn', hint: '↗', group: 'Actions', run: close(() => window.open(LINKEDIN, '_blank', 'noopener')) },
    );
    return it;
  }, [go, scrollToId, verify, setVerify, zen, setZen, toggleTheme, toast, onClose]);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items.filter((i) => ['Core projects', 'Secondary builds', 'Go to', 'Actions'].includes(i.group)).slice(0, 40);
    const terms = s.split(/\s+/);
    return items.map((i) => { const hay = (i.label + ' ' + i.hint + ' ' + (i.kw || '')).toLowerCase(); let sc = 0; for (const t of terms) { if (!hay.includes(t)) return null; sc += i.label.toLowerCase().startsWith(t) ? 3 : i.label.toLowerCase().includes(t) ? 2 : 1; } return { i, sc }; }).filter(Boolean).sort((a, b) => b!.sc - a!.sc).slice(0, 30).map((x) => x!.i);
  }, [q, items]);
  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => { list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }); }, [sel]);

  const key = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(shown.length - 1, s + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); shown[sel]?.run(); }
  };
  let lastG = '';
  return (
    <div className="pal-bg" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pal" role="dialog" aria-modal="true" aria-label="Command palette" onKeyDown={key}>
        <input ref={inp} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects, technologies, essays, actions…" aria-label="Search" role="combobox" aria-expanded="true" aria-controls="pal-list" />
        <ul id="pal-list" role="listbox" ref={list}>
          {shown.length === 0 && <li className="grp">No match. Try “python”, “privacy”, “tests” or “rag”.</li>}
          {shown.map((i, n) => { const head = i.group !== lastG; lastG = i.group; return (
            <li key={i.id} role="presentation">
              {head && <div className="grp">{i.group}</div>}
              <button role="option" type="button" aria-selected={n === sel} onMouseMove={() => setSel(n)} onClick={i.run}><span>{i.label}</span><small>{i.hint}</small></button>
            </li>); })}
        </ul>
        <div className="pal-foot"><span>↑↓ navigate</span><span>↵ open</span><span>esc close</span></div>
      </div>
    </div>
  );
}
