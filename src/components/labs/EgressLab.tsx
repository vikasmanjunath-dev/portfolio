'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { scrub, scanOutbound, pseudo, sha256Hex, signRequest, ALLOWED_TOP, REDACTED } from '@/labs/misc';

const RAW = '2026-11-20 10:42:11 sshd[2214]: Failed password for admin from 10.2.4.77 token=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abc12345678 api_key: sk-live-12345678abcd notify=ravi@acme.com';
type Bug = 'none' | 'extra' | 'bypass';
const KEY = 'tenant-alpha-key';

export default function EgressLab() {
  const [raw, setRaw] = useState(RAW);
  const [bug, setBug] = useState<Bug>('none');
  const [tab, setTab] = useState<'egress' | 'sign'>('egress');
  const [node, setNode] = useState('n-…'); const [src, setSrc] = useState('n-…');
  const [hash, setHash] = useState('');

  const scrubbed = useMemo(() => scrub(raw), [raw]);
  const payload = useMemo(() => {
    const p: Record<string, unknown> = {
      payload_id: '3f2b9c1e-7a54-4d0e-9b8a-5c1d2e3f4a5b', tenant_id: 'tenant-alpha', collector_id: 'col-alpha-1', region: 'IN', collector_version: '1.0.0', config_status: 'ok',
      event_time: '2026-11-20T10:42:11Z', source_tz: 'Asia/Kolkata', sent_at: '2026-11-20T10:42:12Z', is_replay: false, node_pseudonym: node,
      event_category: 'SECURITY_BURST', severity: 'high', metrics: { cpu: 41.2, mem: 55.0, disk: 60.1, bandwidth_mbps: 120.4, latency_ms: 38.2, packet_loss: 0.02 },
      auth_failures_60s: 1, auth_source_pseudonym: src,
    };
    if (bug === 'extra') p.message = raw;
    if (bug === 'bypass') p.collector_version = raw;
    return p;
  }, [node, src, bug, raw]);
  const json = useMemo(() => JSON.stringify(payload), [payload]);
  const extra = Object.keys(payload).filter((k) => !ALLOWED_TOP.includes(k));
  const hits = scanOutbound(json);
  const outcome: 'REJECTED' | 'BLOCKED' | 'SENT' = extra.length ? 'REJECTED' : hits.length ? 'BLOCKED' : 'SENT';

  useEffect(() => { let on = true; pseudo('app-01', KEY).then((v) => on && setNode(v)); pseudo('10.2.4.77', KEY).then((v) => on && setSrc(v)); return () => { on = false; }; }, []);
  useEffect(() => { let on = true; sha256Hex(json).then((v) => on && setHash(v)); return () => { on = false; }; }, [json]);

  /* request signing demo */
  const [secret, setSecret] = useState('key-secret-demo'); const [ts, setTs] = useState(1795171332); const [nonce, setNonce] = useState('a1b2c3d4'); const [skew, setSkew] = useState(0);
  const [sig, setSig] = useState({ canonical: '', bodyHash: '', signature: '' }); const [log, setLog] = useState<string[]>([]); const seen = useRef(new Set<string>());
  useEffect(() => { let on = true; signRequest(secret, 'POST', '/ingest', String(ts), nonce, json).then((v) => on && setSig(v)); return () => { on = false; }; }, [secret, ts, nonce, json]);
  const send = () => {
    const server = 1795171332; const out: string[] = [];
    if (Math.abs(server - (ts + skew)) > 300) out.push('401 timestamp outside ±300 s window');
    else if (seen.current.has(nonce)) out.push('401 replayed nonce refused');
    else { seen.current.add(nonce); out.push(`200 accepted, stored, then ACKed (signature ${sig.signature.slice(0, 12)}…)`); }
    setLog((l) => [out[0], ...l].slice(0, 5));
  };

  return (
    <div className="lab">
      <div className="lab-top"><div className="dots" aria-hidden="true"><i /><i /><i /></div><span className="mono">CICADA 2026 · egress guard and signed ingest · ported from collector/redact.py</span><span className="ev doc" style={{ cursor: 'default' }}>Runs in your browser, nothing is sent</span></div>
      <div className="lab-in" style={{ borderRight: 0, paddingBottom: 0 }}>
        <div className="ptab" role="tablist" aria-label="Egress lab">
          <button role="tab" type="button" aria-selected={tab === 'egress'} onClick={() => setTab('egress')}>Three-layer egress boundary</button>
          <button role="tab" type="button" aria-selected={tab === 'sign'} onClick={() => setTab('sign')}>HMAC request signing</button>
        </div>
      </div>
      {tab === 'egress' ? (
        <div className="lab-body">
          <div className="lab-in">
            <label className="fld"><span>Raw event (stays inside the customer network)</span><textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={6} spellCheck={false} /></label>
            <label className="fld"><span>Simulate a developer mistake</span><select value={bug} onChange={(e) => setBug(e.target.value as Bug)}>
              <option value="none">None: the collector builds the payload correctly</option>
              <option value="extra">Add a forbidden field to the payload (message)</option>
              <option value="bypass">Smuggle raw text into a free-text field (collector_version)</option>
            </select></label>
            <div className="chips"><button className="tchip" type="button" onClick={() => setRaw(RAW)}>Reset sample</button><button className="tchip" type="button" onClick={() => setRaw('2026-11-20 11:03:44 app-01 request ok latency=212ms cpu=41%')}>A clean line</button></div>
            <p className="lab-note">Layer 1: schema allow-list (Pydantic <code>extra=&quot;forbid&quot;</code>, the real contracts/schema.py). Layer 2: regex scrub of secrets in text kept for local display. Layer 3: an outbound scanner on the exact bytes: any hit means the payload is BLOCKED and never sent.</p>
          </div>
          <div className="lab-out">
            <div className={`verdict ${outcome === 'SENT' ? 'good' : 'bad'}`} aria-live="polite"><span className="mono">Egress record</span>
              <b style={{ color: 'var(--head)', fontSize: '1.2rem' }}>{outcome === 'SENT' ? 'SENT: metadata only left the boundary' : outcome === 'REJECTED' ? `REJECTED by layer 1: field “${extra.join(', ')}” is not on the allow-list` : `BLOCKED by layer 3: found ${hits.join(', ')}`}</b></div>
            <div><span className="mono">Layer 2 · local display, secrets scrubbed ({scrubbed.hits.length} hit{scrubbed.hits.length === 1 ? '' : 's'})</span>
              <div className="code" style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{scrubbed.text.split(REDACTED).flatMap((part, i, a) => i < a.length - 1 ? [part, <span className="e" key={i}>{REDACTED}</span>] : [part])}</div>
              <div style={{ marginTop: 8 }}>{scrubbed.hits.map((h, i) => <span className="flag" key={i} title={h.match}>{h.name}</span>)}</div></div>
            <div><span className="mono">Outbound payload (what the SaaS would receive)</span><div className="code" style={{ marginTop: 6 }}>{JSON.stringify(payload, null, 1)}</div></div>
            <dl className="kv"><dt>Pseudonyms</dt><dd>node_pseudonym = “n-” + HMAC-SHA256(tenant_key, “app-01”)[:10] = {node}; the source IP becomes {src}. Not a plain hash: the IPv4 space is tiny, so a bare hash would be reversible.</dd>
              <dt>Canonical SHA-256</dt><dd style={{ wordBreak: 'break-all' }}>{hash.slice(0, 32)}…{outcome === 'SENT' ? ' (SaaS re-computes and matches)' : ' (not sent)'}</dd></dl>
            <p className="lab-note">The IP, the user, the e-mail and the secrets never appear in the payload (the IP becomes a pseudonym). They do not leave because the schema has no field for them, and because a scanner checks anyway.</p>
          </div>
        </div>
      ) : (
        <div className="lab-body">
          <div className="lab-in">
            <label className="fld"><span>Shared secret (never sent)</span><input type="text" value={secret} onChange={(e) => setSecret(e.target.value)} /></label>
            <div className="row2"><label className="fld"><span>Timestamp (s)</span><input type="number" value={ts} onChange={(e) => setTs(Number(e.target.value))} /></label><label className="fld"><span>Nonce</span><input type="text" value={nonce} onChange={(e) => setNonce(e.target.value)} /></label></div>
            <label className="fld"><span>Client clock skew: {skew} s</span><input type="range" min={-600} max={600} value={skew} onChange={(e) => setSkew(Number(e.target.value))} /></label>
            <button className="pill sm" type="button" onClick={send}>Send to SaaS</button>
            <p className="lab-note">Send twice with the same nonce, then slide the clock skew past ±300 s.</p>
          </div>
          <div className="lab-out">
            <span className="mono">Canonical string</span><div className="code">{sig.canonical}</div>
            <dl className="kv"><dt>sha256(body)</dt><dd style={{ wordBreak: 'break-all' }}>{sig.bodyHash}</dd><dt>X-Signature</dt><dd style={{ wordBreak: 'break-all' }}><b style={{ color: 'var(--head)' }}>{sig.signature}</b></dd></dl>
            <span className="mono">Server responses</span>
            <div className="code" aria-live="polite">{log.length ? log.map((l, i) => <div key={i} className={l.startsWith('200') ? 'g' : 'e'}>{l}</div>) : <span className="d">(nothing sent yet)</span>}</div>
            <p className="lab-note">Signing proves integrity and origin; it is not encryption. The key is never sent, unknown key and bad signature look identical, and the nonce cache lives in memory only, so a captured request cannot be replayed across a restart.</p>
          </div>
        </div>
      )}
    </div>
  );
}
