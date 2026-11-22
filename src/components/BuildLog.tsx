'use client';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { LOG, LOG_TAGS, FIN_MONTHS, REPOS, CLAUDE_CODE, type LogTag } from '@/content/buildlog';
import { Ev, Split } from './bits';

const hue = (t: LogTag) => ({ ['--w' as string]: LOG_TAGS[t].hue } as CSSProperties);

export default function BuildLog() {
  const [f, setF] = useState<LogTag | 'all'>('all'); const [all, setAll] = useState(false);
  const items = LOG.filter((i) => f === 'all' || i.tag === f);
  const maxC = Math.max(...FIN_MONTHS.map((m) => m[1])), maxD = Math.max(...CLAUDE_CODE.map((c) => c.days));
  const total = REPOS.reduce((s, r) => s + r.commits, 0), sess = CLAUDE_CODE.reduce((s, c) => s + c.sessions, 0);
  return (
    <section className="sec" id="journey" aria-labelledby="jH">
      <div className="wrap">
        <div className="sec-head"><p className="mono kicker rv">Build log · from git history, changelogs and Claude Code sessions</p><h2 className="h2" id="jH"><Split text="Dated, in order, with the commits and sessions behind it." /></h2>
          <p className="lead rv">{total} commits across five repositories and {sess} recorded Claude Code sessions on this machine, from the first FIN-OS commit on 12 May 2026 to today. The numbers are counted from the logs, not remembered.</p></div>
        <div className="bl-grid">
          <div className="bl-card rv"><span className="mono">FIN-OS commits per month <Ev k="doc" src="git log, Initial Deployment repository" /></span>
            <div className="bl-bars">{FIN_MONTHS.map(([m, n]) => <div key={m}><i style={{ height: `${Math.max(2, (n / maxC) * 100)}%` }} /><b>{n}</b><span>{m}</span></div>)}</div>
            <p className="lab-note">283 commits since 12 May. October is the peak at 136: the mobile app, Hindi everywhere, Money Reels and the RAG engine.</p></div>
          <div className="bl-card rv"><span className="mono">Claude Code: sessions and active days <Ev k="doc" src="session transcripts on this machine (counted, not quoted)" /></span>
            <div className="bl-rows">{CLAUDE_CODE.map((c) => <div key={c.name} style={hue(c.tag)}><span>{c.name}</span><div className="bar"><i style={{ width: `${(c.days / maxD) * 100}%`, background: 'var(--w)' }} /></div><b>{c.sessions} sessions · {c.days} days</b></div>)}</div>
            <p className="lab-note">Transcript files in each project folder; no text from them is used on this site.</p></div>
          <div className="bl-card rv"><span className="mono">Commits per repository <Ev k="doc" src="git log per repository" /></span>
            <div className="bl-rows">{REPOS.map((r) => <div key={r.name} style={hue(r.tag)}><span>{r.name}</span><small>{r.span}</small><b>{r.commits}</b></div>)}</div></div>
        </div>
        <div className="filters" role="group" aria-label="Filter the build log" style={{ marginTop: 40 }}>
          <button className="fchip" type="button" aria-pressed={f === 'all'} onClick={() => setF('all')}>All</button>
          {(Object.keys(LOG_TAGS) as LogTag[]).map((t) => <button key={t} className="fchip" type="button" aria-pressed={f === t} onClick={() => setF(t)}>{LOG_TAGS[t].label}</button>)}
          <button className="fchip" type="button" aria-pressed={all} onClick={() => setAll((a) => !a)} style={{ marginLeft: 'auto' }}>{all ? 'Collapse details' : 'Expand all details'}</button>
        </div>
        <div className="tl">
          {items.map((t) => (
            <div className={`tl-i ${t.ev === 'self' ? 'plan' : ''}`} key={t.sort + t.title} style={hue(t.tag)}>
              <span className="w">{t.when} · <b style={{ color: 'var(--w)', fontWeight: 500 }}>{LOG_TAGS[t.tag].label}</b></span>
              <h4 aria-level={3}>{t.title}<Ev k={t.ev} /></h4><p>{t.body}</p>
              {t.points && <details open={all} key={String(all)} className="tl-d"><summary>{t.points.length} detail points</summary><ul className="bullets">{t.points.map((p) => <li key={p}>{p}</li>)}</ul></details>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
