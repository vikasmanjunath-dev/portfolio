'use client';
import { useMemo, useState } from 'react';
import { rate, hexToLab } from '@/labs/akaar';

const SKINS: [string, string][] = [['#f3d5bd', 'Very light'], ['#e6b98f', 'Light'], ['#c98f63', 'Medium'], ['#a8683f', 'Tan'], ['#7a4a2c', 'Deep'], ['#4d2f1d', 'Very deep']];
const GARMENTS: [string, string][] = [['#2a5db0', 'Blue'], ['#c0392b', 'Red'], ['#f2e8cf', 'Cream'], ['#2e7d4f', 'Green'], ['#e8a33d', 'Mustard'], ['#6b3fa0', 'Purple'], ['#1b1b1b', 'Black']];
const LABEL_COL: Record<string, string> = { Great: 'var(--ok)', Good: '#9be7ff', Okay: 'var(--self)', 'Not ideal': '#ff8a8a' };

export default function AkaarLab() {
  const [skin, setSkin] = useState('#c98f63'); const [g1, setG1] = useState('#2a5db0'); const [g2, setG2] = useState('#f2e8cf'); const [two, setTwo] = useState(false); const [share, setShare] = useState(65);
  const garments = two ? [{ hex: g1, share }, { hex: g2, share: 100 - share }] : [{ hex: g1, share: 100 }];
  const r = useMemo(() => rate(skin, garments), [skin, g1, g2, two, share]); // eslint-disable-line react-hooks/exhaustive-deps
  const sl = hexToLab(skin);
  return (
    <div className="lab">
      <div className="lab-top"><div className="dots" aria-hidden="true"><i /><i /><i /></div><span className="mono">AkaarAI · colour verdict · ported from app/verdict/colour_rules.py</span><span className="ev ok" style={{ cursor: 'default' }}>500 / 500 random cases match the Python rules</span></div>
      <div className="lab-body">
        <div className="lab-in">
          <span className="mono">Skin (in the app: measured from the face pixels)</span>
          <div className="chips">{SKINS.map(([h, n]) => <button key={h} type="button" className="tchip" aria-pressed={skin === h} onClick={() => setSkin(h)} style={{ borderColor: skin === h ? 'var(--acc)' : undefined }}><i style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: h, marginRight: 6, verticalAlign: -1 }} />{n}</button>)}</div>
          <label className="fld"><span>Or any skin colour</span><input type="color" value={skin} onChange={(e) => setSkin(e.target.value)} style={{ height: 38, padding: 2 }} /></label>
          <span className="mono">Garment colour</span>
          <div className="chips">{GARMENTS.map(([h, n]) => <button key={h} type="button" className="tchip" onClick={() => setG1(h)} style={{ borderColor: g1 === h ? 'var(--acc)' : undefined }}><i style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: h, marginRight: 6, verticalAlign: -1 }} />{n}</button>)}</div>
          <label className="fld"><span>Or any garment colour</span><input type="color" value={g1} onChange={(e) => setG1(e.target.value)} style={{ height: 38, padding: 2 }} /></label>
          <label className="toggle"><input type="checkbox" checked={two} onChange={(e) => setTwo(e.target.checked)} /> A second colour (multicolour garments are weighted by area)</label>
          {two && <><label className="fld"><span>Second colour</span><input type="color" value={g2} onChange={(e) => setG2(e.target.value)} style={{ height: 38, padding: 2 }} /></label><label className="fld"><span>Main colour covers {share}%</span><input type="range" min={10} max={90} value={share} onChange={(e) => setShare(+e.target.value)} /></label></>}
          <p className="lab-note">All thresholds are provisional in the project and no accuracy is claimed: this shows the rules, not their real-world agreement with people. Every result in the app is labelled a preview.</p>
        </div>
        <div className="lab-out" aria-live="polite">
          <div className="verdict" style={{ borderColor: LABEL_COL[r.label] }}><span className="mono">Colour verdict · score {r.score.toFixed(2)} / 6</span><b style={{ color: LABEL_COL[r.label], fontFamily: 'var(--serif)', fontSize: '2.4rem', lineHeight: 1, fontWeight: 400 }}>{r.label}</b>{r.capped && <span className="lab-note">Capped to “Okay”: an undertone clash on the main colour never scores Great or Good (rule R-CAP-U).</span>}</div>
          <div><span className="mono">What the app would say</span><ul className="trace" style={{ marginTop: 6 }}>{r.sentences.map((s) => <li key={s.rule}>{s.text} <span style={{ opacity: 0.6 }}>[{s.rule}]</span></li>)}</ul></div>
          <dl className="kv"><dt>Skin L*, chroma, hue</dt><dd>{sl.L.toFixed(1)}, {sl.C.toFixed(1)}, {sl.h.toFixed(0)}°</dd><dt>Undertone</dt><dd>{r.undertone} (warm at hue ≥ 56°, cool below 46°, else neutral)</dd></dl>
          <div className="scroll-x"><table className="tbl"><thead><tr><th>Colour</th><th>Share</th><th>L* / C / h</th><th>Undertone</th><th>Contrast</th><th>Richness</th></tr></thead><tbody>
            {r.per.map((p, i) => <tr key={i}><td><i style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 3, background: p.hex, verticalAlign: -2, marginRight: 6 }} />{p.neutral ? 'neutral' : 'colour'}</td><td>{p.share}%</td><td>{p.lab.L.toFixed(0)} / {p.lab.C.toFixed(0)} / {p.lab.h.toFixed(0)}°</td><td>{p.u[0]}/2</td><td>{p.c[0]}/2</td><td>{p.r[0]}/2</td></tr>)}
          </tbody></table></div>
          <p className="lab-note">Each rule scores 0 to 2 per colour; the weighted sum maps to Great (≥5), Good (≥3.8), Okay (≥2.5) or Not ideal. Pure functions: the same colours always give the same label.</p>
        </div>
      </div>
    </div>
  );
}
