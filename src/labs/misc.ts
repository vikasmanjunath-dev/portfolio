/** Small, faithful engines for the other labs. */

/* ───────── VYBES LYNK: per-viewer location rounding ─────────
 * The database rounds a stored position differently for each viewer (supabase migrations g2/g3):
 *   connection  → round(lat, 4) ≈ 11 m   ("about 10 m")
 *   other       → round(lat, 3) ≈ 111 m  ("a roughly 100 m grid cell")
 *   ghost / off → nothing is returned
 */
export type Viewer = 'connection' | 'other' | 'ghost';
export const DEC: Record<Exclude<Viewer, 'ghost'>, number> = { connection: 4, other: 3 };
export function roundTo(x: number, dec: number) { const f = Math.pow(10, dec); return Math.round(x * f) / f; }
export function publish(lat: number, lng: number, viewer: Viewer): { lat: number; lng: number; dec: number } | null {
  if (viewer === 'ghost') return null;
  const dec = DEC[viewer];
  return { lat: roundTo(lat, dec), lng: roundTo(lng, dec), dec };
}
export function metersBetween(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000, toR = Math.PI / 180;
  const dLat = (lat2 - lat1) * toR, dLng = (lng2 - lng1) * toR;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * toR) * Math.cos(lat2 * toR) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/* ───────── CICADA 2026: egress guard (Tier-1 redaction) ─────────
 * Ported from cicada/collector/redact.py: layer 2 scrub() and layer 3 scan_outbound().
 */
export const REDACTED = '[REDACTED]';
export const SECRET_PATTERNS: Record<string, RegExp> = {
  api_key: /\bsk-[A-Za-z0-9_-]{8,}/g,
  aws_key: /\bAKIA[0-9A-Z]{16}\b/g,
  jwt: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g,
  bearer: /\bBearer\s+[A-Za-z0-9._-]{8,}/gi,
  credential_assignment: /["']?\b(password|passwd|pwd|secret|token|api[_-]?key)\b["']?\s*[=:]\s*["']?[^\s"',;}]+/gi,
};
export const PII_PATTERNS: Record<string, RegExp> = {
  ipv4: /\b(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}\b/g,
  email: /\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+\b/g,
};
const fresh = (r: RegExp) => new RegExp(r.source, r.flags);
export function scrub(text: string): { text: string; hits: { name: string; match: string }[] } {
  const hits: { name: string; match: string }[] = [];
  let out = text;
  for (const [name, p] of Object.entries(SECRET_PATTERNS)) {
    out = out.replace(fresh(p), (m) => { hits.push({ name, match: m }); return REDACTED; });
  }
  return { text: out, hits };
}
export function scanOutbound(payload: string): string[] {
  return Object.entries({ ...SECRET_PATTERNS, ...PII_PATTERNS }).filter(([, p]) => fresh(p).test(payload)).map(([n]) => n);
}
/** Pseudonymous node id: HMAC-SHA256(tenant_key, value) truncated to 10 hex chars, as in collector/redact.py pseudo(). */
export async function hmacHex(key: string, msg: string): Promise<string> {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', k, enc.encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
export async function sha256Hex(msg: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
export async function pseudo(value: string, tenantKey: string) { return 'n-' + (await hmacHex(tenantKey, value)).slice(0, 10); }
/** Request signing, as documented in the OnlyMeta README: HMAC-SHA256 over METHOD \n path?query \n ts \n nonce \n sha256(body). */
export async function signRequest(secret: string, method: string, pathQuery: string, ts: string, nonce: string, body: string) {
  const bodyHash = await sha256Hex(body);
  const canonical = [method.toUpperCase(), pathQuery, ts, nonce, bodyHash].join('\n');
  return { canonical, bodyHash, signature: await hmacHex(secret, canonical) };
}
/** The real allow-list: contracts/schema.py (Pydantic, extra="forbid" on both models). */
export const ALLOWED_TOP = ['payload_id', 'tenant_id', 'collector_id', 'region', 'collector_version', 'config_status', 'event_time', 'source_tz', 'sent_at', 'is_replay', 'node_pseudonym', 'event_category', 'severity', 'metrics', 'auth_failures_60s', 'auth_source_pseudonym'];
export const ALLOWED_METRICS = ['cpu', 'mem', 'disk', 'bandwidth_mbps', 'latency_ms', 'packet_loss'];

/* ───────── BunkBudget: attendance maths ─────────
 * % = present / (total − NA).  bunks = floor((present − t·total) / t)   needed = ceil((t·total − present) / (1 − t))
 */
export function attendance(present: number, total: number, na: number, target: number) {
  const counted = Math.max(0, total - na);
  const pct = counted > 0 ? (present / counted) * 100 : 0;
  const t = target / 100;
  if (counted <= 0) return { pct, counted, mode: 'none' as const, n: 0 };
  if (pct >= target) return { pct, counted, mode: 'bunk' as const, n: Math.max(0, Math.floor((present - t * counted) / t)) };
  return { pct, counted, mode: 'recover' as const, n: Math.max(0, Math.ceil((t * counted - present) / (1 - t))) };
}
