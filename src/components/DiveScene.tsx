'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildRoom, ROOM_PORTAL_Z, type Action } from './room';
import { buildCity } from './city';

/**
 * THE STACK: a flight down an octagonal server corridor. Walls are procedural circuit boards with live pulses,
 * data packets stream down four lanes, each of the four gates is a holographic firewall that drops a share of them,
 * and terminal windows, chips and nested data cubes float in the volume. Post: bloom, chromatic aberration,
 * scanlines and glitch bursts on every gate crossing. Scroll drives `cur.p` (0..1); everything is derived from it.
 */
export const Z0 = 4, ZL = 125;
export const GATES = [
  { z: -26, hue: '#c6f135', p: 0.24, tag: 'GATE 01 // VERIFY' },
  { z: -52, hue: '#5ea1ff', p: 0.24, tag: 'GATE 02 // PRIVACY' },
  { z: -78, hue: '#ff7a59', p: 0.24, tag: 'GATE 03 // RULES' },
  { z: -104, hue: '#ffc247', p: 0.24, tag: 'GATE 04 // CLOCK' },
];
/** Timeline: 0..P_PORTAL the room (over the shoulder, into the screen); P_PORTAL..P_INTRO the plunge; then the tunnel. */
export const P_INTRO = 0.14, P_PORTAL = 0.105;
export const GATE_P = GATES.map((g) => P_INTRO + ((Z0 - g.z) / ZL) * (1 - P_INTRO));
export type Cur = { p: number; vel: number };

const TL = ZL + 34; // tunnel length
const R = 9; // circumradius of the octagon
const RI = R * Math.cos(Math.PI / 8); // inradius
const BG = 0x02050d;

const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const col4 = GATES.map((g) => new THREE.Color(g.hue));
/** Zone colour at depth z: blends through the four gate hues. */
function zoneRGB(z: number, out: THREE.Color) {
  out.copy(col4[0]);
  for (let i = 1; i < 4; i++) out.lerp(col4[i], smooth(GATES[i - 1].z + 6, GATES[i - 1].z - 6, z));
  return out;
}
const hash1 = (n: number) => { const s = Math.sin(n * 91.3458) * 47453.5453; return s - Math.floor(s); };

const ZONE_GLSL = /* glsl */ `
uniform vec3 uCol[4]; uniform vec4 uGate[4];
vec3 zoneCol(float z){ vec3 c = uCol[0]; for(int i=1;i<4;i++){ c = mix(c, uCol[i], smoothstep(uGate[i-1].x + 6.0, uGate[i-1].x - 6.0, z)); } return c; }
float hash21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
`;

/* ─────────── circuit-board walls ─────────── */
const WALL_V = /* glsl */ `
varying vec2 vUv; varying float vZ; varying vec3 vView;
void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.0); vZ = w.z; vec4 mv = viewMatrix * w; vView = mv.xyz; gl_Position = projectionMatrix * mv; }`;
const WALL_F = /* glsl */ `
precision highp float; ${ZONE_GLSL}
uniform float uTime; uniform float uPulse;
varying vec2 vUv; varying float vZ; varying vec3 vView;
float seg(float v, float w){ return 1.0 - smoothstep(w, w + 0.03, abs(v - 0.5)); }
void main(){
  float face = floor(vUv.x * 8.0);
  vec2 g = vec2(vUv.x * 8.0 * 7.0, vZ * 0.5);
  vec2 id = floor(g); vec2 f = fract(g);
  float h = hash21(id + face * 17.3);
  float grid = (1.0 - smoothstep(0.0, 0.035, min(f.x, f.y))) * 0.5;
  float t = 0.0;
  if (h < 0.28) t = seg(f.y, 0.035);
  else if (h < 0.56) t = seg(f.x, 0.035);
  else if (h < 0.74) t = max(seg(f.y, 0.035) * step(f.x, 0.5), seg(f.x, 0.035) * step(0.5, f.y));
  else if (h < 0.86) t = max(seg(f.y, 0.035) * step(0.5, f.x), seg(f.x, 0.035) * step(f.y, 0.5));
  float pad = step(0.9, h) * (1.0 - smoothstep(0.1, 0.14, length(f - 0.5)));
  float ring = step(0.9, h) * smoothstep(0.17, 0.2, length(f - 0.5)) * (1.0 - smoothstep(0.2, 0.23, length(f - 0.5)));
  float ph = fract(uTime * (0.25 + h * 0.4) - vZ * 0.07 + h * 9.0);
  float pulse = smoothstep(0.0, 0.015, ph) * smoothstep(0.12, 0.015, ph);
  vec3 col = zoneCol(vZ);
  vec3 c = col * 0.03 + col * (grid * 0.08 + t * 0.32 + pad * 0.5 + ring * 0.3);
  c += (col * 1.5 + vec3(0.12)) * t * pulse + col * 1.0 * pad * pulse;
  c += col * t * uPulse * 0.25;
  float d = length(vView);
  c *= 1.0 - smoothstep(30.0, 100.0, d);
  c *= smoothstep(0.0, 4.0, d);
  gl_FragColor = vec4(c, 1.0);
}`;

/* ─────────── crisp code glyphs in depth ─────────── */
const GLYPH_V = /* glsl */ `
${ZONE_GLSL}
uniform float uTime; uniform float uPx; uniform float uL; uniform float uZ0;
attribute float aSeed; varying float vCell; varying vec3 vC; varying float vA;
void main(){
  float speed = 1.2 + aSeed * 3.2;
  float z = uZ0 + 8.0 - mod(position.z + uTime * speed, uL);
  vec4 mv = modelViewMatrix * vec4(position.x, position.y, z, 1.0);
  gl_Position = projectionMatrix * mv;
  float dist = -mv.z;
  vCell = floor(mod(aSeed * 64.0 + floor(uTime * (0.6 + aSeed * 1.4) + aSeed * 40.0), 64.0));
  vC = zoneCol(z) * (0.8 + 0.5 * aSeed);
  vA = smoothstep(2.0, 9.0, dist) * (1.0 - smoothstep(22.0, 70.0, dist)) * (0.3 + 0.4 * aSeed);
  gl_PointSize = min((11.0 + aSeed * 12.0) * uPx * 60.0 / max(dist, 1.0), 70.0 * uPx);
}`;
const GLYPH_F = /* glsl */ `
precision mediump float; uniform sampler2D uAtlas; varying float vCell; varying vec3 vC; varying float vA;
void main(){
  float col = mod(vCell, 8.0); float row = floor(vCell / 8.0);
  vec2 uv = vec2((col + gl_PointCoord.x) / 8.0, 1.0 - (row + gl_PointCoord.y) / 8.0);
  float a = texture2D(uAtlas, uv).a;
  if (a < 0.08) discard;
  gl_FragColor = vec4(vC, a * vA);
}`;

/* ─────────── gate hologram ─────────── */
const HOLO_F = /* glsl */ `
precision mediump float; varying vec2 vUv; uniform float uTime; uniform float uPulse; uniform float uNear; uniform vec3 uColor;
void main(){
  vec2 p = (vUv - 0.5) * 2.0; float r = length(p);
  vec2 q = p * 9.0; float grid = 1.0 - smoothstep(0.0, 0.07, min(abs(fract(q.x) - 0.5), abs(fract(q.y) - 0.5)));
  float scan = 1.0 - smoothstep(0.0, 0.05, abs(fract(p.y * 0.35 - uTime * 0.3) - 0.5));
  float rim = smoothstep(0.7, 1.0, r);
  float a = (0.015 + grid * 0.04 + scan * 0.14 + rim * 0.1) * (0.4 + uNear * 0.9) + uPulse * 0.25 * (1.0 - r * 0.6);
  gl_FragColor = vec4(uColor * 1.2, a * (1.0 - smoothstep(0.96, 1.0, r)));
}`;
const HOLO_V = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;

/* ─────────── post: chromatic aberration, scanlines, glitch, vignette ─────────── */
const PostShader = {
  uniforms: { tDiffuse: { value: null as THREE.Texture | null }, uTime: { value: 0 }, uAb: { value: 0 }, uGlitch: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: /* glsl */ `
  uniform sampler2D tDiffuse; uniform float uTime; uniform float uAb; uniform float uGlitch; uniform vec2 uRes; varying vec2 vUv;
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
  void main(){
    vec2 uv = vUv;
    float row = floor(uv.y * 42.0); float tick = floor(uTime * 22.0);
    float band = step(1.0 - uGlitch * 0.35, h(vec2(row, tick)));
    uv.x += band * uGlitch * 0.05 * (h(vec2(row + 3.0, tick)) - 0.5) * 2.0;
    vec2 d = uv - 0.5; float a = uAb * (0.0035 + dot(d, d) * 0.03);
    vec3 col = vec3(texture2D(tDiffuse, uv + d * a).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - d * a).b);
    col *= 0.955 + 0.045 * sin(uv.y * uRes.y * 1.6 + uTime * 6.0);
    col += band * uGlitch * 0.08;
    col *= smoothstep(1.25, 0.25, length(d) * 1.45);
    col += (h(uv * uRes + uTime) - 0.5) * 0.018;
    gl_FragColor = vec4(col, 1.0);
  }`,
};

function glyphAtlas() {
  const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d')!;
  const chars = '01{}[]()<>/\\=+-*;:#$%&|^~?!@ABCDEF0123456789xyzfn_;{}</>'.padEnd(64, '01').slice(0, 64);
  x.fillStyle = '#fff'; x.font = '700 46px ui-monospace, Menlo, Consolas, monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
  for (let i = 0; i < 64; i++) x.fillText(chars[i], (i % 8) * 64 + 32, Math.floor(i / 8) * 64 + 34);
  const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; return t;
}
function termTexture(title: string, lines: string[], hue: string) {
  const c = document.createElement('canvas'); c.width = 560; c.height = 320; const x = c.getContext('2d')!;
  x.fillStyle = 'rgba(3,7,18,.86)'; x.fillRect(0, 0, 560, 320);
  x.strokeStyle = hue; x.lineWidth = 3; x.strokeRect(2, 2, 556, 316);
  x.fillStyle = hue + '33'; x.fillRect(3, 3, 554, 40);
  x.fillStyle = hue; x.font = '600 20px ui-monospace, Menlo, monospace'; x.fillText('● ' + title, 16, 30);
  x.font = '500 21px ui-monospace, Menlo, monospace';
  lines.forEach((l, i) => { x.fillStyle = l.startsWith('$') ? '#eaf0ff' : l.includes('✓') || l.includes('ok') ? '#7dffb2' : l.includes('BLOCKED') || l.includes('0') && l.includes('stored') ? hue : '#9db1e8'; x.fillText(l, 18, 82 + i * 30); });
  x.fillStyle = hue; x.fillRect(18 + (lines[lines.length - 1].length) * 12.6, 82 + (lines.length - 1) * 30 - 18, 11, 22);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const TERMS: [string, string[], number][] = [
  ['fin-os · ci', ['$ npm test', '✓ 1,655 passed', '$ tsc --noEmit', '✓ clean'], 0],
  ['gateway :8000', ['alert-engine :8001  ok', 'arya-ai      :7475  ok', 'rag-engine    :7476  ok', 'ollama     127.0.0.1 only'], 0],
  ['vybes · postgres', ['select round(lat,3);', '→ 12.825   (stranger)', 'select round(lat,4);', '→ 12.8251  (connection)'], 1],
  ['rls · tests', ['$ npm run test:sql', '✓ 283 assertions', '✓ migrate up/down/up', '29/30 mutants killed'], 1],
  ['akaarai · api', ['POST /v1/tryon', '200 {colour, pattern}', 'photos stored: 0', 'preview, not a size check'], 2],
  ['akaarai · pytest', ['$ pytest -q', '✓ 520 server tests', '✓ 262 app tests', 'accuracy claimed: none'], 2],
  ['dueclock · engine', ['due = base + min(days,45)', 'interest = 3 × bank_rate', '✓ 750 passed (pg)', '30/30 mutants killed'], 3],
  ['onlymeta · egress', ['X-Signature: 71efff30…', 'HMAC-SHA256  nonce fresh', 'payload → BLOCKED (jwt)', 'raw data never leaves'], 3],
  ['relay · worker', ['AWAITING_HUMAN_APPROVAL', 'sandbox: pinned sha256', 'tests: pass  review: APPROVE', 'push / merge / deploy: never'], 2],
  ['parity · ports', ['$ npm run test:parity', '✓ 400/400 clock cases', '✓ 500/500 colour rules', '✓ 500/500 health pillars'], 3],
];

type Props = { cur: React.MutableRefObject<Cur>; onGate?: (i: number) => void; onAction?: (a: Action) => void; onHover?: (label: string | null) => void; onTyping?: (b: boolean) => void };

export default function DiveScene({ cur, onGate, onAction, onHover, onTyping }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' }); } catch { return; }
    const coarse = matchMedia('(pointer: coarse)').matches || innerWidth < 760;
    const dpr = Math.min(devicePixelRatio || 1, coarse ? 1.25 : 1.6);
    renderer.setPixelRatio(dpr); renderer.setClearColor(BG, 1); renderer.shadowMap.enabled = !coarse; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(BG); scene.fog = new THREE.Fog(BG, 34, 125);
    const cam = new THREE.PerspectiveCamera(64, 1, 0.1, 4000);
    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(o: T) => { disposables.push(o); return o; };
    const uCol = { value: col4 }; const uGate = { value: GATES.map((g) => new THREE.Vector4(g.z, g.p, 0, 0)) };

    /* circuit corridor */
    const wallGeo = track(new THREE.CylinderGeometry(R, R, TL, 8, 1, true)); wallGeo.rotateX(Math.PI / 2); wallGeo.translate(0, 0, Z0 + 12 - TL / 2);
    const wallMat = track(new THREE.ShaderMaterial({ vertexShader: WALL_V, fragmentShader: WALL_F, side: THREE.BackSide, uniforms: { uTime: { value: 0 }, uPulse: { value: 0 }, uCol, uGate } }));
    scene.add(new THREE.Mesh(wallGeo, wallMat));

    /* structural ribs */
    const ribGeo = track(new THREE.TorusGeometry(R * 0.985, 0.05, 4, 8));
    const ribs: THREE.Mesh[] = []; const tmp = new THREE.Color();
    for (let z = Z0 + 6; z > -ZL - 20; z -= 10) {
      if (GATES.some((g) => Math.abs(g.z - z) < 4)) continue;
      const m = track(new THREE.MeshBasicMaterial({ color: zoneRGB(z, tmp).clone().multiplyScalar(1.3), transparent: true, opacity: 0.6 }));
      const r = new THREE.Mesh(ribGeo, m); r.position.z = z; r.rotation.z = Math.PI / 8; scene.add(r); ribs.push(r);
    }

    /* gates: octagonal firewall frames with a holographic field */
    const frameGeo = track(new THREE.TorusGeometry(R * 0.97, 0.17, 6, 8));
    const arcGeos = [0, 1, 2].map((i) => track(new THREE.TorusGeometry(6.8 - i * 0.7, 0.045, 6, 48, Math.PI * (0.5 + i * 0.25))));
    const holoGeo = track(new THREE.CircleGeometry(R * 0.96, 8));
    const tickGeo = track(new THREE.BoxGeometry(0.3, 0.3, 0.9));
    const gateObjs = GATES.map((gt, i) => {
      const grp = new THREE.Group(); grp.position.z = gt.z; scene.add(grp);
      const c = new THREE.Color(gt.hue);
      const hot = track(new THREE.MeshBasicMaterial({ color: c.clone().multiplyScalar(1.5), toneMapped: false }));
      const frame = new THREE.Mesh(frameGeo, hot); frame.rotation.z = Math.PI / 8; grp.add(frame);
      for (const dz of [-1.6, 1.6]) { const gm = track(new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.22 })); const f = new THREE.Mesh(frameGeo, gm); f.rotation.z = Math.PI / 8; f.position.z = dz; f.scale.setScalar(0.985); grp.add(f); }
      for (let k = 0; k < 8; k++) { const t = new THREE.Mesh(tickGeo, hot); const a = (k * Math.PI) / 4; t.position.set(Math.sin(a) * R * 0.97, -Math.cos(a) * R * 0.97, 0); t.rotation.z = -a; grp.add(t); }
      const hm = track(new THREE.ShaderMaterial({ vertexShader: HOLO_V, fragmentShader: HOLO_F, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uTime: { value: 0 }, uPulse: { value: 0 }, uNear: { value: 0 }, uColor: { value: c } } }));
      const holo = new THREE.Mesh(holoGeo, hm); holo.rotation.z = Math.PI / 8; grp.add(holo);
      const arcs = arcGeos.map((ag, k) => { const m = track(new THREE.MeshBasicMaterial({ color: c.clone().multiplyScalar(1.8), toneMapped: false })); const a = new THREE.Mesh(ag, m); a.position.z = 0.3 + k * 0.1; grp.add(a); return a; });
      const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const cx = cv.getContext('2d')!; cx.font = '700 44px ui-monospace, Menlo, monospace'; cx.fillStyle = gt.hue; cx.textAlign = 'center'; cx.fillText(gt.tag, 256, 62);
      const tex = track(new THREE.CanvasTexture(cv)); tex.colorSpace = THREE.SRGBColorSpace;
      const sp = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false }))); sp.scale.set(7.5, 1.4, 1); sp.position.set(0, 6.6, 0.2); grp.add(sp);
      return { grp, hm, arcs, hot, frame };
    });

    /* data packets: four lanes per wall, thinned by every gate */
    const NP = coarse ? 320 : 760;
    const pk = { x: new Float32Array(NP), y: new Float32Array(NP), z: new Float32Array(NP), v: new Float32Array(NP), h: new Float32Array(NP), s: new Float32Array(NP), rx: new Float32Array(NP) };
    const spawn = (i: number, first: boolean) => {
      const th = Math.random() * Math.PI * 2; const step = Math.PI / 4; const dev = (((th % step) + step) % step) - step / 2;
      const r = (RI * (0.78 + Math.random() * 0.14)) / Math.cos(dev);
      pk.x[i] = Math.sin(th) * r; pk.y[i] = -Math.cos(th) * r; pk.rx[i] = th;
      pk.z[i] = first ? Z0 + 8 - Math.random() * (ZL + 28) : Z0 + 8 + Math.random() * 6; pk.v[i] = 7 + Math.random() * 13; pk.h[i] = Math.random(); pk.s[i] = 0.5 + Math.random() * 1.6;
    };
    for (let i = 0; i < NP; i++) spawn(i, true);
    const pkGeo = track(new THREE.BoxGeometry(0.3, 0.3, 1)); const pkMat = track(new THREE.MeshBasicMaterial({ toneMapped: false })); pkMat.color.setScalar(1.15);
    const packets = new THREE.InstancedMesh(pkGeo, pkMat, NP); packets.frustumCulled = false; packets.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(packets);
    const dummy = new THREE.Object3D(); const pc = new THREE.Color(); const RED = new THREE.Color('#ff4d5e');
    packets.setColorAt(0, pc); if (packets.instanceColor) packets.instanceColor.setUsage(THREE.DynamicDrawUsage);

    /* code glyphs */
    const NG = coarse ? 700 : 2000;
    const gp = new Float32Array(NG * 3), gs = new Float32Array(NG);
    for (let i = 0; i < NG; i++) { const th = Math.random() * Math.PI * 2; const step = Math.PI / 4; const dev = (((th % step) + step) % step) - step / 2; const rr = 2.6 + Math.random() * 0.86 * (RI / Math.cos(dev) - 2.6); gp[i * 3] = Math.sin(th) * rr; gp[i * 3 + 1] = -Math.cos(th) * rr; gp[i * 3 + 2] = Math.random() * (ZL + 30); gs[i] = Math.random(); }
    const gg = track(new THREE.BufferGeometry()); gg.setAttribute('position', new THREE.BufferAttribute(gp, 3)); gg.setAttribute('aSeed', new THREE.BufferAttribute(gs, 1));
    const atlas = track(glyphAtlas());
    const gm = track(new THREE.ShaderMaterial({ vertexShader: GLYPH_V, fragmentShader: GLYPH_F, transparent: true, depthWrite: false, uniforms: { uTime: { value: 0 }, uPx: { value: dpr }, uL: { value: ZL + 30 }, uZ0: { value: Z0 }, uAtlas: { value: atlas }, uCol, uGate } }));
    const glyphs = new THREE.Points(gg, gm); glyphs.frustumCulled = false; scene.add(glyphs);

    /* floating terminal windows with real numbers */
    const termGeo = track(new THREE.PlaneGeometry(6.4, 3.65));
    const terms = TERMS.map(([title, lines, gi], i) => {
      const tex = track(termTexture(title, lines, GATES[gi].hue)); const m = track(new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.96, side: THREE.DoubleSide, toneMapped: false }));
      const mesh = new THREE.Mesh(termGeo, m); const side = i % 2 ? 1 : -1;
      const z = -10 - i * 11.2 - (i % 3) * 1.5; const base = new THREE.Vector3(side * (5.2 + (i % 3) * 0.6), ((i * 37) % 7) - 3, z);
      mesh.position.copy(base); mesh.rotation.y = -side * 0.5; scene.add(mesh); return { mesh, base, ph: i * 1.7 };
    });

    /* floating tech objects: chips, nested data cubes, neural clusters */
    const edgeMat = (hex: string) => track(new THREE.LineBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(1.6), transparent: true, opacity: 0.85, toneMapped: false }));
    const floaters: { o: THREE.Object3D; sp: THREE.Vector3; base: THREE.Vector3; ph: number }[] = [];
    const addF = (o: THREE.Object3D, z: number, side: number, y: number, spd = 0.4) => { const base = new THREE.Vector3(side * (3.6 + Math.random() * 2.6), y, z); o.position.copy(base); scene.add(o); floaters.push({ o, sp: new THREE.Vector3((Math.random() - 0.5) * spd, (Math.random() - 0.5) * spd, (Math.random() - 0.5) * spd), base, ph: Math.random() * 6.28 }); };
    const chipGeo = track(new THREE.BoxGeometry(2.4, 0.3, 2.4)); const chipEdges = track(new THREE.EdgesGeometry(chipGeo)); const dieEdges = track(new THREE.EdgesGeometry(track(new THREE.BoxGeometry(1.2, 0.34, 1.2))));
    const pinGeo = track(new THREE.BufferGeometry()); { const v: number[] = []; for (let k = -4; k <= 4; k++) { const o = k * 0.26; v.push(o, 0, 1.2, o, 0, 1.7, o, 0, -1.2, o, 0, -1.7, 1.2, 0, o, 1.7, 0, o, -1.2, 0, o, -1.7, 0, o); } pinGeo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); }
    const cubeE = [track(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.2, 2.2, 2.2))), track(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.4, 1.4, 1.4))), track(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.7, 0.7, 0.7)))];
    for (let i = 0; i < (coarse ? 8 : 18); i++) {
      const z = Z0 - 8 - (i / 18) * (ZL - 14); const hue = GATES[Math.min(3, Math.floor((Z0 - z) / 26))].hue; const side = i % 2 ? 1 : -1;
      if (i % 3 === 0) { const g = new THREE.Group(); g.add(new THREE.LineSegments(chipEdges, edgeMat(hue)), new THREE.LineSegments(dieEdges, edgeMat('#ffffff')), new THREE.LineSegments(pinGeo, edgeMat(hue))); g.rotation.set(0.6, 0.4, 0.2); addF(g, z, side, ((i * 53) % 8) - 4); }
      else { const g = new THREE.Group(); cubeE.forEach((e, k) => g.add(new THREE.LineSegments(e, edgeMat(k === 1 ? '#ffffff' : hue)))); g.scale.setScalar(0.8 + Math.random() * 0.9); addF(g, z, side, ((i * 41) % 8) - 4); }
    }
    const nets: THREE.Group[] = [];
    for (let n = 0; n < (coarse ? 2 : 4); n++) {
      const g = new THREE.Group(); const layers = [4, 6, 6, 3]; const pts: THREE.Vector3[][] = []; const nodeGeo = track(new THREE.OctahedronGeometry(0.16));
      const hue = GATES[n % 4].hue; const nm = track(new THREE.MeshBasicMaterial({ color: new THREE.Color(hue).multiplyScalar(2), toneMapped: false }));
      layers.forEach((c, li) => { const arr: THREE.Vector3[] = []; for (let k = 0; k < c; k++) { const p = new THREE.Vector3((li - 1.5) * 1.5, (k - (c - 1) / 2) * 0.62, (Math.random() - 0.5) * 1.4); arr.push(p); const m = new THREE.Mesh(nodeGeo, nm); m.position.copy(p); g.add(m); } pts.push(arr); });
      const lv: number[] = []; for (let li = 0; li < pts.length - 1; li++) pts[li].forEach((a) => pts[li + 1].forEach((b) => { if (Math.random() < 0.7) lv.push(a.x, a.y, a.z, b.x, b.y, b.z); }));
      const lg = track(new THREE.BufferGeometry()); lg.setAttribute('position', new THREE.Float32BufferAttribute(lv, 3));
      g.add(new THREE.LineSegments(lg, track(new THREE.LineBasicMaterial({ color: new THREE.Color(hue), transparent: true, opacity: 0.35 }))));
      g.scale.setScalar(1.35); const z = -22 - n * 27; addF(g, z, n % 2 ? 1 : -1, 1.5 - n, 0.15); nets.push(g);
    }

    /* the root of trust at the bottom */
    const core = new THREE.Group(); core.position.set(0, 0, -ZL - 1); scene.add(core);
    [[3.4, '#ffffff', 2], [5.2, '#c6f135', 1.6], [7.2, '#5ea1ff', 1.2]].forEach(([s, c, k]) => { const e = track(new THREE.EdgesGeometry(new THREE.BoxGeometry(s as number, s as number, s as number))); const l = new THREE.LineSegments(e, track(new THREE.LineBasicMaterial({ color: new THREE.Color(c as string).multiplyScalar(k as number), toneMapped: false }))); core.add(l); });
    const heart = new THREE.Mesh(track(new THREE.IcosahedronGeometry(0.8, 1)), track(new THREE.MeshBasicMaterial({ color: new THREE.Color('#c6f135').multiplyScalar(3), wireframe: true, toneMapped: false }))); heart.position.z = -3; core.add(heart);

    /* the opening room, a live 3D city rendered to a texture for the window, reflections, camera path and portal */
    const pmrem = new THREE.PMREMGenerator(renderer); const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environment = envTex; scene.environmentIntensity = 0.16;
    const sceneRT = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType });
    const city = buildCity({ coarse }); city.group.traverse((o) => o.layers.set(1)); scene.add(city.group);
    const room = buildRoom({ coarse, dpr, sceneTex: sceneRT.texture, shadows: !coarse }); scene.add(room.group);
    const roomPath = new THREE.CatmullRomCurve3([new THREE.Vector3(1.0, 2.0, 39.5), new THREE.Vector3(2.4, 1.7, 33), new THREE.Vector3(1.4, 1.35, 27), new THREE.Vector3(0.2, 1.25, 23.5), new THREE.Vector3(0, 1.2, ROOM_PORTAL_Z)]);
    const tv = new THREE.Vector3(); const camV = new THREE.Vector3(); const lookV = new THREE.Vector3();

    /* composer */
    const composer = new EffectComposer(renderer); composer.setPixelRatio(dpr);
    composer.addPass(new RenderPass(scene, cam));
    const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), coarse ? 0.45 : 0.6, 0.5, 0.62); composer.addPass(bloom);
    const post = new ShaderPass(PostShader); composer.addPass(post); composer.addPass(new OutputPass());

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => { mouse.tx = (e.clientX / innerWidth - 0.5) * 2; mouse.ty = -(e.clientY / innerHeight - 0.5) * 2; };
    addEventListener('pointermove', onMove, { passive: true });
    const resize = () => { const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); composer.setSize(w, h); sceneRT.setSize(Math.max(2, Math.round(w * dpr * 0.75)), Math.max(2, Math.round(h * dpr * 0.75))); room.setRes(w * dpr, h * dpr); bloom.setSize(w * (coarse ? 0.5 : 0.75), h * (coarse ? 0.5 : 0.75)); post.uniforms.uRes.value.set(w * dpr, h * dpr); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    resize(); const ro = new ResizeObserver(resize); ro.observe(canvas);
    let visible = true; const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }); io.observe(canvas);

    /* room interaction: hover, click, and the focused terminal */
    const ray = new THREE.Raycaster(); const ptr = { x: 0, y: 0, in: false, ui: false }; let interactive = true; let hoverLocal: string | null = null;
    const pickAt = () => { if (!interactive || ptr.ui || !ptr.in || !room.group.visible) return null; const r = canvas.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2(((ptr.x - r.left) / r.width) * 2 - 1, -((ptr.y - r.top) / r.height) * 2 + 1), cam); return room.pick(ray); };
    const isUI = (t: EventTarget | null) => !!(t as HTMLElement | null)?.closest?.('a,button,input,textarea,select,.dpanel,.nav,.dock,.pal-bg,.sheet-bg,.dive-end');
    const onPtr = (e: PointerEvent) => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.in = true; ptr.ui = isUI(e.target); };
    const onClick = (e: MouseEvent) => {
      if (!interactive) return; ptr.x = e.clientX; ptr.y = e.clientY; ptr.in = true; ptr.ui = isUI(e.target); const id = pickAt();
      if (!id) { if (room.typing) { room.setTyping(false); onTyping?.(false); } return; }
      const a = room.click(id); if (a) { if (a.type === 'focus') onTyping?.(true); onAction?.(a); }
    };
    const onKey = (e: KeyboardEvent) => {
      if (!interactive || /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName)) return;
      if (e.key.length === 1) room.keyFlash(e.key);
      if (room.typing && !(e.metaKey || e.ctrlKey || e.altKey)) { e.preventDefault(); e.stopImmediatePropagation(); const a = room.type(e.key); if (!room.typing) onTyping?.(false); if (a) onAction?.(a); }
    };
    addEventListener('pointermove', onPtr, { passive: true }); addEventListener('click', onClick); addEventListener('keydown', onKey, true);
    const clock = new THREE.Clock(); let t = 0, prevZ = 40, pulse = 0, fov = 64, glitch = 0;
    renderer.setAnimationLoop(() => {
      if (!visible || document.hidden) return;
      const dt = Math.min(clock.getDelta(), 0.05); t += dt;
      const p = cur.current.p; const vel = cur.current.vel;
      mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06;
      const sway = (k: number) => camV.set(Math.sin(t * 0.37) * 0.35 * k + mouse.x * 1.1 * k, Math.cos(t * 0.31) * 0.3 * k + mouse.y * 0.8 * k, 0);
      let camZ: number;
      if (p < P_PORTAL) { const u = smooth(0, 1, p / P_PORTAL); roomPath.getPoint(u, tv); camZ = tv.z; cam.position.set(tv.x + mouse.x * 0.35, tv.y + mouse.y * 0.2, tv.z); }
      else if (p < P_INTRO) { const u = smooth(0, 1, (p - P_PORTAL) / (P_INTRO - P_PORTAL)); camZ = ROOM_PORTAL_Z + (Z0 - ROOM_PORTAL_Z) * u; sway(u); cam.position.set(camV.x, 1.2 + (camV.y - 1.2) * u, camZ); }
      else { camZ = Z0 - ((p - P_INTRO) / (1 - P_INTRO)) * ZL; sway(1); cam.position.set(camV.x, camV.y, camZ); }
      GATES.forEach((gt, i) => { if ((prevZ > gt.z && camZ <= gt.z) || (prevZ < gt.z && camZ >= gt.z)) { pulse = 1; glitch = 1; onGate?.(i); } });
      if ((prevZ > ROOM_PORTAL_Z && camZ <= ROOM_PORTAL_Z) || (prevZ < ROOM_PORTAL_Z && camZ >= ROOM_PORTAL_Z)) { pulse = 1; glitch = 1; onGate?.(-1); }
      prevZ = camZ; pulse *= Math.exp(-dt * 2.4); glitch *= Math.exp(-dt * 4.2);
      room.group.visible = camZ > ROOM_PORTAL_Z + 0.001; interactive = p < P_PORTAL * 0.8;
      if (room.group.visible) {
        const id = pickAt(); if (id !== hoverLocal) { hoverLocal = id; room.setHover(id); onHover?.(room.label(id)); }
        room.update(t, dt, mouse.x, mouse.y, Math.min(1, p / P_PORTAL)); city.update(t, cam.position);
        cam.layers.set(1); renderer.setRenderTarget(sceneRT); renderer.clear(); renderer.render(scene, cam); renderer.setRenderTarget(null); cam.layers.set(0);
      } else if (hoverLocal) { hoverLocal = null; onHover?.(null); }
      const w = smooth(P_PORTAL - 0.02, P_INTRO, p);
      lookV.set(mouse.x * (1.2 + 1.4 * w), mouse.y * (0.6 + 1.2 * w) + 1.2 * (1 - w), (1 - w) * 12 + w * (camZ - 24));
      cam.lookAt(lookV); cam.rotateZ(Math.sin(t * 0.21) * 0.025 - mouse.x * 0.06 + (1 - w) * 0.02);
      const wantFov = 64 + Math.min(24, Math.abs(vel) * 60) + pulse * 12 + (p >= P_PORTAL - 0.02 && p < P_INTRO ? 12 : 0); fov += (wantFov - fov) * 0.12; cam.fov = fov; cam.updateProjectionMatrix();

      wallMat.uniforms.uTime.value = t; wallMat.uniforms.uPulse.value = pulse; gm.uniforms.uTime.value = t;
      post.uniforms.uTime.value = t; post.uniforms.uAb.value = 0.5 + Math.min(3, Math.abs(vel) * 14) + pulse * 2.2; post.uniforms.uGlitch.value = glitch * 0.9;
      bloom.strength = (p < P_PORTAL ? 0.2 : coarse ? 0.45 : 0.6) + pulse * 0.6;

      /* gates */
      gateObjs.forEach((g, i) => { const near = Math.max(0, 1 - Math.abs(camZ - GATES[i].z) / 16); g.hm.uniforms.uTime.value = t; g.hm.uniforms.uNear.value = near; g.hm.uniforms.uPulse.value = pulse * (near > 0.6 ? 0.5 : 0.15); g.arcs.forEach((a, k) => { a.rotation.z = t * (0.5 + k * 0.35) * (k % 2 ? -1 : 1); }); g.frame.rotation.z = Math.PI / 8; g.grp.scale.setScalar(1 + near * 0.015); });

      /* packets: stream down the corridor, dropped by the gates */
      for (let i = 0; i < NP; i++) {
        pk.z[i] -= pk.v[i] * dt; if (pk.z[i] < -ZL - 24) spawn(i, false);
        const z = pk.z[i]; let sc = 1; let red = 0;
        for (let g = 0; g < 4; g++) { if (hash1(pk.h[i] * 131 + g * 7.7) < GATES[g].p) { if (z < GATES[g].z) { sc = 0; break; } if (z - GATES[g].z < 2.2) { red = 1 - (z - GATES[g].z) / 2.2; sc = 1 + red * 0.8; } } }
        dummy.position.set(pk.x[i], pk.y[i], z); dummy.rotation.set(0, 0, -pk.rx[i]); dummy.scale.set(sc * 0.9, sc * 0.9, sc * pk.s[i]); dummy.updateMatrix(); packets.setMatrixAt(i, dummy.matrix);
        zoneRGB(z, pc); if (red > 0) pc.lerp(RED, Math.min(1, red * 1.4)); packets.setColorAt(i, pc);
      }
      packets.instanceMatrix.needsUpdate = true; if (packets.instanceColor) packets.instanceColor.needsUpdate = true;

      terms.forEach((m, i) => { m.mesh.position.y = m.base.y + Math.sin(t * 0.6 + m.ph) * 0.35; m.mesh.position.x = m.base.x + Math.sin(t * 0.3 + m.ph) * 0.25; m.mesh.rotation.x = Math.sin(t * 0.4 + i) * 0.04; });
      floaters.forEach((f) => { f.o.rotation.x += f.sp.x * dt; f.o.rotation.y += f.sp.y * dt; f.o.rotation.z += f.sp.z * dt; f.o.position.set(f.base.x + Math.sin(t * 0.45 + f.ph) * 0.7, f.base.y + Math.cos(t * 0.38 + f.ph) * 0.7, f.base.z); });
      nets.forEach((n, i) => { n.rotation.y = t * 0.18 * (i % 2 ? 1 : -1); });
      core.rotation.z = t * 0.12; core.children.forEach((c, k) => { if (k < 3) { c.rotation.x = t * 0.2 * (k + 1) * (k % 2 ? -1 : 1); c.rotation.y = t * 0.15 * (k + 1); } }); heart.rotation.y = t * 0.8; heart.rotation.x = t * 0.5; heart.scale.setScalar(1 + Math.sin(t * 2) * 0.08);
      composer.render();
    });
    return () => {
      renderer.setAnimationLoop(null); removeEventListener('pointermove', onMove); ro.disconnect(); io.disconnect();
      removeEventListener('pointermove', onPtr); removeEventListener('click', onClick); removeEventListener('keydown', onKey, true); packets.dispose(); room.dispose(); city.dispose(); sceneRT.dispose(); envTex.dispose(); pmrem.dispose(); disposables.forEach((d) => d.dispose()); composer.dispose(); renderer.dispose();
    };
  }, [cur, onGate, onAction, onHover, onTyping]);
  return <canvas ref={ref} className="gl" aria-hidden="true" />;
}
