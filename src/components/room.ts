import * as THREE from 'three';
import { SCENE } from '@/content/scene';
import { posterTexture } from './posters';

/**
 * The opening room: a dark room, a three-monitor rig, the builder seen from behind (styled hair, headphones, hoodie),
 * six framed posters, props, and a rain-streaked window that looks out on a real 3D night-time Manhattan (rendered to a texture
 * each frame, so it has true parallax). Almost everything is interactive. The main monitor is the portal into the tunnel.
 */
export const ROOM_PORTAL_Z = 22.7;
export type Action = { type: 'nav'; href: string } | { type: 'focus' } | { type: 'dive' } | { type: 'toast'; msg: string };

const mono = 'ui-monospace, Menlo, Consolas, monospace';
function canvasTex(w: number, h: number, srgb = true) { const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d')!; const tex = new THREE.CanvasTexture(c); if (srgb) tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; return { c, ctx, tex }; }
const rr = (() => { let s = 99; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();

const GLASS_V = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const GLASS_F = /* glsl */ `
precision highp float; varying vec2 vUv; uniform sampler2D tScene; uniform vec2 uRes; uniform float uTime; uniform float uAsp; uniform float uFlash; uniform float uRain; uniform float uHover;
#define S(a,b,t) smoothstep(a,b,t)
vec3 N13(float p){ vec3 p3 = fract(vec3(p) * vec3(.1031,.11369,.13787)); p3 += dot(p3, p3.yzx + 19.19); return fract(vec3((p3.x+p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x)); }
float N(float t){ return fract(sin(t*12345.564)*7658.76); }
float Saw(float b, float t){ return S(0.,b,t)*S(1.,b,t); }
vec2 DropLayer(vec2 uv, float t){
  vec2 UV = uv; uv.y += t*0.75; vec2 a = vec2(6.,1.); vec2 grid = a*2.; vec2 id = floor(uv*grid);
  float colShift = N(id.x); uv.y += colShift; id = floor(uv*grid); vec3 n = N13(id.x*35.2 + id.y*2376.1); vec2 st = fract(uv*grid) - vec2(.5,0.);
  float x = n.x - .5; float y = UV.y*20.; float wiggle = sin(y + sin(y)); x += wiggle*(.5 - abs(x))*(n.z - .5); x *= .7;
  float ti = fract(t + n.z); y = (Saw(.85, ti) - .5)*.9 + .5; vec2 p = vec2(x, y);
  float d = length((st - p)*a.yx); float mainDrop = S(.4, .0, d);
  float r = sqrt(S(1., y, st.y)); float cd = abs(st.x - x); float trail = S(.23*r, .15*r*r, cd); float trailFront = S(-.02, .02, st.y - y); trail *= trailFront*r*r;
  y = UV.y; float trail2 = S(.2*r, .0, cd); float droplets = max(0., (sin(y*(1.-y)*120.) - st.y))*trail2*trailFront*n.z;
  y = fract(y*10.) + (st.y - .5); float dd = length(st - vec2(x, y)); droplets = S(.3, 0., dd);
  float m = mainDrop + droplets*r*trailFront; return vec2(m, trail);
}
float StaticDrops(vec2 uv, float t){ uv *= 40.; vec2 id = floor(uv); uv = fract(uv) - .5; vec3 n = N13(id.x*107.45 + id.y*3543.654); vec2 p = (n.xy - .5)*.7; float d = length(uv - p); float fade = Saw(.025, fract(t + n.z)); return S(.3, 0., d)*fract(n.z*10.)*fade; }
vec2 Drops(vec2 uv, float t, float l0, float l1, float l2){ float s = StaticDrops(uv, t)*l0; vec2 m1 = DropLayer(uv, t)*l1; vec2 m2 = DropLayer(uv*1.85, t)*l2; float c = s + m1.x + m2.x; c = S(.3, 1., c); return vec2(c, max(m1.y*l0, m2.y*l1)); }
void main(){
  vec2 uv = (vUv - .5)*vec2(uAsp, 1.); float t = uTime*.2; float R = uRain;
  vec2 c = Drops(uv, t, 1.3*R, .8*R, .55*R); vec2 e = vec2(.001, 0.);
  float cx = Drops(uv + e, t, 1.3*R, .8*R, .55*R).x; float cy = Drops(uv + e.yx, t, 1.3*R, .8*R, .55*R).x; vec2 n = vec2(cx - c.x, cy - c.x);
  vec2 suv = gl_FragCoord.xy / uRes; vec2 base = suv + n*.045*R;
  float focus = mix(2.2*R - c.y*1., .5, S(.1, .2, c.x));
  vec3 col = texture2D(tScene, base).rgb * 2.;
  for (int i = 0; i < 8; i++){ float a = float(i)*.785398; col += texture2D(tScene, base + vec2(cos(a), sin(a)/1.5)*focus*.0032).rgb; }
  col /= 10.; col *= 1. + uFlash*1.4 + c.x*.25 + uHover*.18;
  col = col*.94 + vec3(.004,.008,.016)*(1.-R*.3);
  gl_FragColor = vec4(col, 1.);
}`;
const STEAM_V = `uniform float uTime; uniform float uPx; uniform float uBoost; attribute float aSeed; varying float vA;
void main(){ float life = fract(uTime*.11 + aSeed); vec3 p = vec3(sin(life*6.+aSeed*20.)*.3*life*(1.+uBoost), life*(3.4+uBoost*1.6), cos(life*5.+aSeed*13.)*.22*life); vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv; gl_PointSize = (14.+life*46.)*uPx*(18./-mv.z)*(1.+uBoost*.5); vA = (1.-life)*smoothstep(0.,.12,life)*(.22+uBoost*.3); }`;
const STEAM_F = `precision mediump float; varying float vA; void main(){ float d = length(gl_PointCoord-.5); if(d>.5) discard; gl_FragColor = vec4(1.,.92,.82, smoothstep(.5,0.,d)*vA); }`;
const DUST_V = `uniform float uTime; uniform float uPx; attribute float aSeed; varying float vA;
void main(){ vec3 p = position + vec3(sin(uTime*.2+aSeed*30.)*1.2, mod(uTime*.12*(.4+aSeed)+aSeed*20., 14.)-7., cos(uTime*.17+aSeed*17.)*1.2); vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv; gl_PointSize = (1.2+aSeed*1.6)*uPx*(26./-mv.z); vA = .3 + .35*aSeed; }`;
const DUST_F = `precision mediump float; varying float vA; void main(){ float d = length(gl_PointCoord-.5); if(d>.5) discard; gl_FragColor = vec4(.75,.88,1., smoothstep(.5,0.,d)*vA); }`;

const TERM_LINES: [string, number][] = [['$ whoami', 0], ['  vikas · builds products you can verify', 1], ['$ ./verify --all', 0], ['✓ fin-os        1,655 tests', 2], ['✓ dueclock        750 tests', 2], ['✓ vybes-lynk      283 assertions', 2], ['✓ akaarai         520 tests', 2], ['✓ ports        400/400 parity', 2], ['$ dive --in', 0]];
const TERM_TOTAL = TERM_LINES.reduce((a, [t]) => a + t.length + 4, 0);
const KB_ROWS = ['1234567890-=', 'qwertyuiop[]', "asdfghjkl;'", 'zxcvbnm,./'];
const WEATHER: ('light-rain' | 'heavy-rain' | 'clear')[] = ['light-rain', 'heavy-rain', 'clear'];
const RAIN_AMT = { 'light-rain': 0.6, 'heavy-rain': 1.25, clear: 0 };

export function buildRoom(opts: { coarse: boolean; dpr: number; sceneTex: THREE.Texture; shadows: boolean }) {
  const group = new THREE.Group(); const disp: { dispose: () => void }[] = []; const tr = <T extends { dispose: () => void }>(o: T) => { disp.push(o); return o; };
  const std = (color: number | string, rough = 0.85, metal = 0.1) => tr(new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal }));
  const sh = <T extends THREE.Object3D>(o: T, cast = true, recv = true) => { if (opts.shadows) o.traverse((c) => { const m = c as THREE.Mesh; if (m.isMesh) { m.castShadow = cast; m.receiveShadow = recv; } }); return o; };
  const box = (w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0, parent: THREE.Object3D = group) => { const mesh = new THREE.Mesh(tr(new THREE.BoxGeometry(w, h, d)), m); mesh.position.set(x, y, z); parent.add(mesh); return sh(mesh); };
  const P = SCENE.person;

  /* ───── interaction registry ───── */
  type Inter = { id: string; label: string; h: number; target: number; click: () => Action | null; update?: (h: number) => void };
  const inter = new Map<string, Inter>(); const reg = (id: string, label: string, objs: THREE.Object3D[], click: () => Action | null, update?: (h: number) => void) => { objs.forEach((o) => o.traverse((c) => { c.userData.iid = id; })); inter.set(id, { id, label, h: 0, target: 0, click, update }); };
  let lampOn = SCENE.lamp.on, weatherIdx = Math.max(0, WEATHER.indexOf(SCENE.city.weather)), steamBoost = 0, typing = false, buf = '', termMsg = '', needMain = true;

  /* ───── lights ───── */
  group.add(new THREE.AmbientLight(0x1b2540, 1.1));
  const lCyan = new THREE.PointLight(0x5ea1ff, 130, 60, 1.6); lCyan.position.set(0, 2.5, 25); group.add(lCyan);
  const lSide = new THREE.PointLight(0x8a5bff, 34, 40, 1.8); lSide.position.set(-12, 1, 26); group.add(lSide);
  const lWin = new THREE.PointLight(0x9fc0ff, 90, 60, 1.5); lWin.position.set(14, 5, 23); group.add(lWin);
  const lamp = new THREE.SpotLight(0xffb066, 260, 46, 0.78, 0.9, 1.5); lamp.position.set(9.1, 2.8, 22); lamp.target.position.set(2, -2, 26.5); group.add(lamp, lamp.target);
  if (opts.shadows) { lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -0.0004; lamp.shadow.radius = 4; }
  const pSpot = new THREE.SpotLight(0xfff0d8, 170, 50, 0.62, 1, 1.5); pSpot.position.set(-14.5, 12, 28); pSpot.target.position.set(-14.5, 4.5, 18.2); group.add(pSpot, pSpot.target);
  const baseI = { cyan: lCyan.intensity, win: lWin.intensity, lamp: lamp.intensity };

  /* ───── shell ───── */
  const wall = new THREE.Mesh(tr(new THREE.PlaneGeometry(110, 30)), std(0x0a0d16, 0.92, 0)); wall.position.set(0, 3, 18); group.add(sh(wall, false, true));
  const floor = new THREE.Mesh(tr(new THREE.PlaneGeometry(110, 70)), std(0x05070c, 0.5, 0.25)); floor.rotation.x = -Math.PI / 2; floor.position.set(0, -6.5, 35); group.add(sh(floor, false, true));
  box(110, 0.5, 0.25, std(0x0c0f18, 0.6, 0.2), 0, -6.2, 18.1);

  /* ───── window onto the live city ───── */
  const glass = tr(new THREE.ShaderMaterial({ vertexShader: GLASS_V, fragmentShader: GLASS_F, uniforms: { tScene: { value: opts.sceneTex }, uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uAsp: { value: 20 / 15 }, uFlash: { value: 0 }, uRain: { value: RAIN_AMT[WEATHER[weatherIdx]] }, uHover: { value: 0 } } }));
  const win = new THREE.Mesh(tr(new THREE.PlaneGeometry(20, 15)), glass); win.position.set(14, 4, 18.04); group.add(win);
  const frameM = std(0x090c14, 0.45, 0.65);
  [7.7, 14, 20.3].forEach((x) => box(0.36, 15.4, 0.4, frameM, x, 4, 18.2)); [-0.9, 4.2, 9.2].forEach((y) => box(20.4, 0.36, 0.4, frameM, 14, y, 18.2)); [4, 24].forEach((x) => box(0.5, 15.4, 0.5, frameM, x, 4, 18.2)); box(21, 0.5, 1.2, frameM, 14, -3.6, 18.6);
  reg('window', 'Change the weather', [win], () => { weatherIdx = (weatherIdx + 1) % 3; return { type: 'toast', msg: `Weather: ${WEATHER[weatherIdx].replace('-', ' ')}` }; }, (h) => { glass.uniforms.uHover.value = h; });

  /* ───── desk, wood, cables, soft shadows ───── */
  const wood = canvasTex(1024, 512); { const x = wood.ctx; x.fillStyle = '#2a1a10'; x.fillRect(0, 0, 1024, 512); for (let i = 0; i < 520; i++) { const y = rr() * 512; x.strokeStyle = `rgba(${18 + ((rr() * 34) | 0)},${10 + ((rr() * 18) | 0)},6,${0.1 + rr() * 0.28})`; x.lineWidth = 0.6 + rr() * 2.4; x.beginPath(); x.moveTo(0, y); for (let px = 0; px <= 1024; px += 64) x.lineTo(px, y + Math.sin(px * 0.01 + i) * 3 + rr() * 1.5); x.stroke(); } wood.tex.wrapS = wood.tex.wrapT = THREE.RepeatWrapping; wood.tex.repeat.set(2, 1); wood.tex.needsUpdate = true; }
  tr(wood.tex); const woodM = tr(new THREE.MeshStandardMaterial({ map: wood.tex, roughness: 0.42, metalness: 0.05 }));
  box(30, 0.35, 13, woodM, 0, -2.175, 25.5); [-14, 14].forEach((x) => box(0.5, 4.2, 11, woodM, x, -4.4, 25.5));
  box(29.4, 0.08, 0.08, tr(new THREE.MeshBasicMaterial({ color: new THREE.Color('#5ea1ff').multiplyScalar(2.2), toneMapped: false })), 0, -2.3, 31.9);
  box(15, 0.04, 6.5, std(0x06080e, 0.85, 0), 0, -1.97, 27.2);
  const blobT = canvasTex(64, 64, false); { const g = blobT.ctx.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,.65)'); g.addColorStop(1, 'rgba(0,0,0,0)'); blobT.ctx.fillStyle = g; blobT.ctx.fillRect(0, 0, 64, 64); blobT.tex.needsUpdate = true; } tr(blobT.tex);
  const blob = (x: number, z: number, w: number, d: number) => { const m = new THREE.Mesh(tr(new THREE.PlaneGeometry(w, d)), tr(new THREE.MeshBasicMaterial({ map: blobT.tex, transparent: true, depthWrite: false }))); m.rotation.x = -Math.PI / 2; m.position.set(x, -1.955, z); group.add(m); };
  const cable = (pts: [number, number, number][]) => { group.add(new THREE.Mesh(tr(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 24, 0.045, 6)), std(0x07090d, 0.6, 0.1))); };
  cable([[0, -1.1, 21.7], [0.6, -1.9, 21.9], [2.6, -1.93, 23.5], [3.4, -2.2, 31.8]]); cable([[-8.5, -1.5, 22.2], [-7, -1.93, 23], [-4, -1.94, 24.5], [-3.6, -2.2, 31.8]]); cable([[8.5, -1.5, 22.2], [7, -1.93, 23], [4.6, -1.94, 25], [4.2, -2.2, 31.8]]);

  /* ───── screens ───── */
  const mainScr = canvasTex(1024, 578), leftScr = canvasTex(640, 400), rightScr = canvasTex(640, 400);
  const drawRight = () => { const x = rightScr.ctx; x.fillStyle = '#0a0f1c'; x.fillRect(0, 0, 640, 400); const code = [['export function', 'evaluate', '(i: Input) {'], ['  const base =', 'i.deliveryDate', '|| i.invoiceDate;'], ['  const due =', 'addDays', '(base, days);'], ['  // 3x bank rate, monthly rests', '', ''], ['  interest =', 'compound', '(out, over, rate);'], ['  return { due, interest,', 'exposure', '};'], ['}', '', '']]; x.font = `500 21px ${mono}`; code.forEach((r, i) => { let px = 22; (['#8b98c8', '#c6f135', '#9db1e8'] as const).forEach((c, k) => { x.fillStyle = c; x.fillText(r[k], px, 46 + i * 34); px += x.measureText(r[k]).width + (r[k] ? 8 : 0); }); }); x.fillStyle = '#5ea1ff'; x.fillRect(0, 0, 640, 6); rightScr.tex.needsUpdate = true; };
  drawRight();
  const drawLeft = (t: number) => { const x = leftScr.ctx; x.fillStyle = '#070b16'; x.fillRect(0, 0, 640, 400); x.fillStyle = '#5ea1ff'; x.fillRect(0, 0, 640, 6); x.fillStyle = '#9db1e8'; x.font = `600 20px ${mono}`; x.fillText('● metrics   tests / min', 22, 40); for (let i = 0; i < 26; i++) { const h = 30 + (Math.sin(t * 1.3 + i * 0.7) * 0.5 + 0.5) * 150 + (Math.sin(i * 12.9) * 0.5 + 0.5) * 80; x.fillStyle = i % 5 === 0 ? '#c6f135' : '#5ea1ff'; x.fillRect(24 + i * 23, 360 - h, 15, h); } x.fillStyle = '#7dffb2'; x.font = `500 18px ${mono}`; x.fillText('all green · 0 flaky', 22, 388); leftScr.tex.needsUpdate = true; };
  let lastChars = -1, blink = 0;
  const drawMain = (chars: number, t: number) => {
    const x = mainScr.ctx; x.fillStyle = '#050a14'; x.fillRect(0, 0, 1024, 578); x.fillStyle = 'rgba(94,161,255,.16)'; x.fillRect(0, 0, 1024, 46);
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.arc(26 + i * 24, 23, 7, 0, 7); x.fill(); }); x.fillStyle = typing ? '#c6f135' : '#9db1e8'; x.font = `600 20px ${mono}`; x.fillText(typing ? 'verify — zsh  ● focused: type "dive" + Enter' : 'verify — zsh', 330, 30);
    x.font = `500 30px ${mono}`; let left = chars;
    for (let i = 0; i < TERM_LINES.length && left > 0; i++) { const [txt, kind] = TERM_LINES[i]; const part = txt.slice(0, left); left -= txt.length + 4; x.fillStyle = kind === 0 ? '#eaf0ff' : kind === 2 ? '#7dffb2' : '#c6f135'; x.fillText(part, 36, 100 + i * 46); if (left <= 0 && !typing) { const w = x.measureText(part).width; x.fillStyle = '#c6f135'; x.fillRect(38 + w, 100 + i * 46 - 26, 16, 32); } }
    if (chars >= TERM_TOTAL) { x.fillStyle = '#c6f135'; x.fillText('❯ ' + buf, 36, 100 + 9 * 46 + 4); if (typing && Math.floor(t * 2) % 2 === 0) x.fillRect(36 + x.measureText('❯ ' + buf).width + 2, 100 + 9 * 46 - 22, 16, 30); if (!typing && !buf) { x.fillStyle = 'rgba(158,177,232,.5)'; x.font = `500 22px ${mono}`; x.fillText('click here, then type: dive', 120, 100 + 9 * 46 + 2); } if (termMsg) { x.fillStyle = '#ff8a8a'; x.font = `500 24px ${mono}`; x.fillText(termMsg, 36, 100 + 10 * 46 + 4); } }
    mainScr.tex.needsUpdate = true;
  };
  drawMain(0, 0); drawLeft(0);
  const bezel = std(0x080a10, 0.35, 0.55); const screenMats: THREE.MeshBasicMaterial[] = [];
  const monitor = (w: number, h: number, tex: THREE.Texture, x: number, y: number, z: number, ry: number, bright: number) => {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; group.add(g);
    g.add(sh(new THREE.Mesh(tr(new THREE.BoxGeometry(w + 0.34, h + 0.34, 0.34)), bezel)));
    const m = tr(new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); m.color.setScalar(bright); screenMats.push(m);
    const s = new THREE.Mesh(tr(new THREE.PlaneGeometry(w, h)), m); s.position.z = 0.175; g.add(s);
    const neck = new THREE.Mesh(tr(new THREE.BoxGeometry(0.55, 1.1, 0.35)), bezel); neck.position.set(0, -h / 2 - 0.5, -0.15); g.add(sh(neck));
    const base = new THREE.Mesh(tr(new THREE.BoxGeometry(3.2, 0.14, 1.9)), bezel); base.position.set(0, -h / 2 - 1.1, 0.2); g.add(sh(base));
    const bias = new THREE.Mesh(tr(new THREE.PlaneGeometry(w * 1.12, h * 1.18)), tr(new THREE.MeshBasicMaterial({ color: new THREE.Color(x === 0 ? '#5ea1ff' : '#8a5bff').multiplyScalar(0.9), transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending }))); bias.position.z = -0.28; g.add(bias);
    blob(x, z + 0.2, 4.2, 2.6); return { g, s };
  };
  const mm = monitor(9.2, 5.2, mainScr.tex, 0, 1.6, 22, 0, 1.25), ml = monitor(6.4, 4, leftScr.tex, -8.5, 1.1, 22.8, 0.4, 1.05), mr = monitor(6.4, 4, rightScr.tex, 8.5, 1.1, 22.8, -0.4, 1.05);
  reg('monitor', 'Focus the terminal', [mm.s], () => { typing = true; needMain = true; return { type: 'focus' }; }, (h) => { hoverBright[0] = h; });
  reg('mon-left', 'Open: the numbers', [ml.s], () => ({ type: 'nav', href: '#proof' }), (h) => { hoverBright[1] = h; });
  reg('mon-right', 'Open: DueClock case file', [mr.s], () => ({ type: 'nav', href: '/work/dueclock' }), (h) => { hoverBright[2] = h; });
  const hoverBright = [0, 0, 0];
  [[3.4, 3.3, '#ffe27a', 'verify?'], [3.9, 2.3, '#9be7ff', 'ship it']].forEach(([x, y, c, s], i) => { const n = canvasTex(128, 128); n.ctx.fillStyle = c as string; n.ctx.fillRect(0, 0, 128, 128); n.ctx.fillStyle = '#222'; n.ctx.font = `700 24px ${mono}`; n.ctx.textAlign = 'center'; n.ctx.fillText(s as string, 64, 70); n.tex.needsUpdate = true; tr(n.tex); const m = new THREE.Mesh(tr(new THREE.PlaneGeometry(0.9, 0.9)), tr(new THREE.MeshStandardMaterial({ map: n.tex, roughness: 0.9 }))); m.position.set(x as number, y as number, 22.2); m.rotation.z = i ? 0.12 : -0.08; group.add(m); });

  /* ───── keyboard, mouse, phone, notebook, plant ───── */
  const kb = canvasTex(512, 168); const flash = new Map<string, number>();
  const drawKb = () => { const x = kb.ctx; x.fillStyle = '#05070c'; x.fillRect(0, 0, 512, 168); KB_ROWS.forEach((row, r) => { for (let c = 0; c < row.length; c++) { const f = flash.get(row[c]) || 0; x.fillStyle = f > 0.05 ? `rgba(255,255,255,${0.4 + f * 0.6})` : `hsl(${(c * 24 + r * 30) % 360},85%,${50 - r * 3}%)`; x.fillRect(10 + c * 33 + r * 10, 10 + r * 30, 28, 24); } }); const fs = flash.get(' ') || 0; x.fillStyle = fs > 0.05 ? '#fff' : 'hsl(200,85%,45%)'; x.fillRect(120, 130, 230, 26); kb.tex.needsUpdate = true; };
  drawKb(); const kbm = tr(new THREE.MeshBasicMaterial({ map: kb.tex, toneMapped: false })); kbm.color.setScalar(1.1);
  const kbBody = box(7.4, 0.22, 2.4, std(0x090b12, 0.4, 0.45), -0.4, -1.86, 27.7); kbBody.rotation.x = 0.06;
  const keys = new THREE.Mesh(tr(new THREE.PlaneGeometry(7.1, 2.2)), kbm); keys.rotation.x = -Math.PI / 2 + 0.06; keys.position.set(-0.4, -1.74, 27.7); group.add(keys); blob(-0.4, 27.7, 8.2, 3.4);
  const mouse = new THREE.Mesh(tr(new THREE.CapsuleGeometry(0.34, 0.5, 6, 12)), std(0x0b0e16, 0.35, 0.5)); mouse.rotation.x = Math.PI / 2; mouse.scale.set(1, 1, 0.6); mouse.position.set(5.6, -1.78, 27.8); group.add(sh(mouse));
  const phoneT = canvasTex(256, 512); { const x = phoneT.ctx; const g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, '#1a2a5a'); g.addColorStop(1, '#0a0e1c'); x.fillStyle = g; x.fillRect(0, 0, 256, 512); x.fillStyle = '#fff'; x.font = '700 78px ui-sans-serif, system-ui'; x.textAlign = 'center'; x.fillText('2:14', 128, 150); x.font = '500 20px ui-sans-serif, system-ui'; x.fillStyle = '#9db1e8'; x.fillText('Saturday, 21 November', 128, 190); x.fillStyle = '#ffffffcc'; x.fillText('New York · Rain · 11°', 128, 250); x.fillStyle = '#7dffb2'; x.fillText('✓ CI passed', 128, 310); phoneT.tex.needsUpdate = true; } tr(phoneT.tex);
  const phone = new THREE.Group(); phone.position.set(4.4, -1.9, 29.6); phone.rotation.y = 0.4; group.add(phone); phone.add(sh(new THREE.Mesh(tr(new THREE.BoxGeometry(1.5, 0.12, 3)), std(0x101218, 0.3, 0.6)))); const pscr = new THREE.Mesh(tr(new THREE.PlaneGeometry(1.34, 2.84)), tr(new THREE.MeshBasicMaterial({ map: phoneT.tex, toneMapped: false }))); pscr.rotation.x = -Math.PI / 2; pscr.position.y = 0.07; (pscr.material as THREE.MeshBasicMaterial).color.setScalar(1.15); phone.add(pscr);
  const nbT = canvasTex(256, 360); { const x = nbT.ctx; x.fillStyle = '#e9e2d0'; x.fillRect(0, 0, 256, 360); x.strokeStyle = 'rgba(60,80,140,.25)'; for (let y = 28; y < 360; y += 22) { x.beginPath(); x.moveTo(0, y); x.lineTo(256, y); x.stroke(); } x.strokeStyle = '#223'; x.lineWidth = 2.2; x.font = '600 20px "Bradley Hand", "Segoe Script", cursive'; x.fillStyle = '#223'; x.fillText('trust = layer', 16, 40); x.beginPath(); x.rect(20, 70, 70, 36); x.rect(120, 70, 70, 36); x.rect(70, 150, 90, 36); x.moveTo(90, 88); x.lineTo(120, 88); x.moveTo(155, 106); x.lineTo(130, 150); x.moveTo(55, 106); x.lineTo(80, 150); x.stroke(); x.font = '500 16px "Bradley Hand", cursive'; x.fillText('verify', 30, 93); x.fillText('decline', 130, 93); x.fillText('answer', 84, 173); x.fillText('1. rules not models', 16, 240); x.fillText('2. measure then claim', 16, 266); x.fillText('3. say "I don\'t know"', 16, 292); nbT.tex.needsUpdate = true; } tr(nbT.tex);
  const nb = new THREE.Mesh(tr(new THREE.BoxGeometry(2.6, 0.12, 3.6)), [std(0x15181f), std(0x15181f), tr(new THREE.MeshStandardMaterial({ map: nbT.tex, roughness: 0.9 })), std(0x15181f), std(0x15181f), std(0x15181f)]); nb.position.set(-3.4, -1.9, 29.6); nb.rotation.y = -0.25; group.add(sh(nb));
  const pot = new THREE.Group(); pot.position.set(-12.8, -1.8, 24); group.add(pot); pot.add(sh(new THREE.Mesh(tr(new THREE.CylinderGeometry(0.7, 0.55, 0.8, 20)), std(0x20242c, 0.7, 0.1)))); const leafM = std(0x2f8f5a, 0.6, 0);
  for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2 + rr(), ring = i % 2; const lf = new THREE.Mesh(tr(new THREE.ConeGeometry(0.16, 1.0 - ring * 0.25, 7)), leafM); lf.position.set(Math.cos(a) * (0.28 + ring * 0.12), 0.7 + ring * 0.1, Math.sin(a) * (0.28 + ring * 0.12)); lf.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); pot.add(sh(lf)); }

  /* ───── coffee, steaming ───── */
  const mug = new THREE.Group(); mug.position.set(-6.3, -1.8, 28.6); mug.scale.setScalar(1.15); group.add(mug); const ceramic = std(0x8d877c, 0.35, 0.05);
  const mbody = new THREE.Mesh(tr(new THREE.CylinderGeometry(0.66, 0.56, 1.35, 40, 1, true)), ceramic); (mbody.material as THREE.Material).side = THREE.DoubleSide; mbody.position.y = 0.72; mug.add(sh(mbody));
  const mbot = new THREE.Mesh(tr(new THREE.CircleGeometry(0.56, 32)), ceramic); mbot.rotation.x = -Math.PI / 2; mbot.position.y = 0.05; mug.add(mbot);
  const coffee = new THREE.Mesh(tr(new THREE.CircleGeometry(0.6, 40)), std(0x24120a, 0.12, 0.3)); coffee.rotation.x = -Math.PI / 2; coffee.position.y = 1.28; mug.add(coffee);
  const handle = new THREE.Mesh(tr(new THREE.TorusGeometry(0.38, 0.09, 12, 24, Math.PI)), ceramic); handle.rotation.z = -Math.PI / 2; handle.position.set(0.66, 0.74, 0); mug.add(sh(handle));
  const saucer = new THREE.Mesh(tr(new THREE.CylinderGeometry(1.15, 1.0, 0.09, 40)), ceramic); saucer.position.y = -0.02; mug.add(sh(saucer));
  const NS = opts.coarse ? 26 : 56; const sg = tr(new THREE.BufferGeometry()); sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NS * 3), 3)); sg.setAttribute('aSeed', new THREE.BufferAttribute(Float32Array.from({ length: NS }, () => Math.random()), 1));
  const steamMat = tr(new THREE.ShaderMaterial({ vertexShader: STEAM_V, fragmentShader: STEAM_F, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uPx: { value: opts.dpr }, uBoost: { value: 0 } } }));
  const steam = new THREE.Points(sg, steamMat); steam.position.set(0, 1.35, 0); steam.frustumCulled = false; mug.add(steam); blob(-6.3, 28.6, 3, 3);
  reg('mug', 'Take a sip', [mbody, saucer, handle, coffee], () => { steamBoost = 1; return { type: 'toast', msg: '☕ Hot. Still faster than my first compile.' }; }, (h) => { mug.scale.setScalar(1.15 + h * 0.06); });

  /* ───── desk lamp ───── */
  const lampG = new THREE.Group(); lampG.position.set(12.4, -2, 21); group.add(lampG); const metal = std(0x12151c, 0.3, 0.75);
  lampG.add(sh(new THREE.Mesh(tr(new THREE.CylinderGeometry(0.9, 1.0, 0.14, 24)), metal)));
  const a1 = new THREE.Mesh(tr(new THREE.CylinderGeometry(0.06, 0.06, 4.2, 8)), metal); a1.position.set(0, 2.2, 0); a1.rotation.z = 0.25; lampG.add(a1);
  const a2 = new THREE.Mesh(tr(new THREE.CylinderGeometry(0.06, 0.06, 3.4, 8)), metal); a2.position.set(-1.9, 4.2, 0); a2.rotation.z = -1.1; lampG.add(a2);
  const lhead = new THREE.Mesh(tr(new THREE.ConeGeometry(0.9, 1.1, 24, 1, true)), metal); (lhead.material as THREE.Material).side = THREE.DoubleSide; lhead.position.set(-3.3, 4.55, 0); lhead.rotation.z = 0.5; lampG.add(lhead);
  const bulbM = tr(new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffb36b').multiplyScalar(3), toneMapped: false })); const bulb = new THREE.Mesh(tr(new THREE.SphereGeometry(0.28, 12, 12)), bulbM); bulb.position.set(-3.45, 4.2, 0); lampG.add(bulb); blob(12.4, 21, 3, 3);
  reg('lamp', 'Toggle the lamp', [lhead, a1, a2, bulb], () => { lampOn = !lampOn; return { type: 'toast', msg: lampOn ? 'Lamp on' : 'Lamp off. Just the screens now.' }; }, (h) => { lhead.scale.setScalar(1 + h * 0.08); });

  /* ───── posters ───── */
  const scale = opts.coarse ? 0.6 : 1;
  const place: Record<string, [number, number, number, number]> = { metro: [-21, 7.6, 4.6, 6.5], bigo: [-15.4, 7.6, 4.6, 6.5], verify: [-9.8, 7.6, 4.6, 6.5], blueprint: [-21, 0.4, 4.6, 6.5], hello: [-15.4, 0.4, 4.6, 6.5], blr: [-0.2, 9.9, 6.4, 4.5] };
  SCENE.posters.forEach((p) => {
    const [px, py, w, h] = place[p.id]; const g = new THREE.Group(); g.position.set(px, py, 18.12); group.add(g);
    g.add(sh(new THREE.Mesh(tr(new THREE.BoxGeometry(w + 0.4, h + 0.4, 0.14)), std(0x0c0e14, 0.35, 0.5))));
    const mat = tr(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0, map: tr(posterTexture(p.id, scale)), emissive: 0xffffff, emissiveIntensity: 0.22 })); mat.emissiveMap = mat.map;
    const art = new THREE.Mesh(tr(new THREE.PlaneGeometry(w, h)), mat); art.position.z = 0.075; g.add(art);
    reg('poster-' + p.id, p.title, [g], () => ({ type: 'nav', href: p.href }), (hv) => { g.position.z = 18.12 + hv * 0.5; g.scale.setScalar(1 + hv * 0.05); mat.emissiveIntensity = 0.22 + hv * 0.35; });
  });

  /* ───── the builder, from behind ───── */
  const me = new THREE.Group(); me.position.set(-0.2, 0, 34.6); group.add(me);
  const fabric = canvasTex(256, 256, false); { const x = fabric.ctx; x.fillStyle = '#888'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(${(rr() * 255) | 0},${(rr() * 255) | 0},${(rr() * 255) | 0},.25)`; x.fillRect(rr() * 256, rr() * 256, 2, 2); } fabric.tex.wrapS = fabric.tex.wrapT = THREE.RepeatWrapping; fabric.tex.repeat.set(5, 5); fabric.tex.needsUpdate = true; } tr(fabric.tex);
  const hoodie = tr(new THREE.MeshStandardMaterial({ color: P.hoodie, roughness: 0.92, metalness: 0, bumpMap: fabric.tex, bumpScale: 1.6 }));
  const skin = tr(new THREE.MeshStandardMaterial({ color: P.skin, roughness: 0.62, metalness: 0, emissive: new THREE.Color(P.skin).multiplyScalar(0.06) }));
  const torso = new THREE.Mesh(tr(new THREE.CapsuleGeometry(1.55, 3.4, 8, 20)), hoodie); torso.rotation.z = Math.PI / 2; torso.scale.set(1, 1, 0.85); torso.position.set(0, -1.5, 0.4); me.add(sh(torso));
  const back = new THREE.Mesh(tr(new THREE.CapsuleGeometry(2.0, 2.2, 8, 20)), hoodie); back.position.set(0, -4.2, 1.2); me.add(sh(back));
  const hood = new THREE.Mesh(tr(new THREE.TorusGeometry(1.15, 0.5, 14, 28)), hoodie); hood.rotation.x = Math.PI / 2 - 0.25; hood.position.set(0, 0.0, 0.2); me.add(sh(hood));
  const neck = new THREE.Mesh(tr(new THREE.CylinderGeometry(0.55, 0.62, 0.9, 16)), skin); neck.position.set(0, 0.25, 0); me.add(sh(neck));
  const headG = new THREE.Group(); headG.position.set(0, 1.25, 0); me.add(headG); const shape = new THREE.Group(); shape.scale.set(0.95, 1.08, 1.05); headG.add(shape);
  shape.add(sh(new THREE.Mesh(tr(new THREE.SphereGeometry(1.12, 44, 32)), skin)));
  /* hairstyle: capped surface + strands/curls, from the SCENE config */
  const HR = P.hair, style = HR.style; const hairC = new THREE.Color(HR.color);
  const strand = canvasTex(256, 256, false); { const x = strand.ctx; x.fillStyle = '#777'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 700; i++) { const px = rr() * 256; x.strokeStyle = `rgba(${rr() > 0.5 ? 255 : 0},${rr() > 0.5 ? 255 : 0},255,${0.08 + rr() * 0.22})`; x.lineWidth = 0.7 + rr() * 1.6; x.beginPath(); x.moveTo(px, 0); x.quadraticCurveTo(px + (rr() - 0.5) * 18, 128, px + (rr() - 0.5) * 10, 256); x.stroke(); } strand.tex.wrapS = strand.tex.wrapT = THREE.RepeatWrapping; strand.tex.repeat.set(7, 3); strand.tex.needsUpdate = true; } tr(strand.tex);
  const hairM = tr(new THREE.MeshPhysicalMaterial({ color: hairC, roughness: 0.42, metalness: 0, sheen: 1, sheenColor: new THREE.Color('#2a3a66'), sheenRoughness: 0.5, bumpMap: strand.tex, bumpScale: 0.4, side: THREE.DoubleSide }));
  const capPhi = style === 'long-wavy' ? 0.76 : style === 'curly' ? 0.66 : style === 'buzz' ? 0.58 : 0.62; const thick = style === 'buzz' ? 0.018 : style === 'curly' ? 0.07 : 0.045; const RAD = 1.12 * (1 + thick);
  shape.add(sh(new THREE.Mesh(tr(new THREE.SphereGeometry(RAD, 56, 40, 0, Math.PI * 2, 0, Math.PI * capPhi)), hairM)));
  if ((style === 'textured-crop' || style === 'buzz') && HR.fade > 0) { const fa = canvasTex(4, 128, false); const g = fa.ctx.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, '#fff'); g.addColorStop(1, '#000'); fa.ctx.fillStyle = g; fa.ctx.fillRect(0, 0, 4, 128); fa.tex.needsUpdate = true; tr(fa.tex); const fm = tr(new THREE.MeshStandardMaterial({ color: hairC.clone().lerp(new THREE.Color(P.skin), 0.35), roughness: 0.9, alphaMap: fa.tex, transparent: true, depthWrite: false, bumpMap: strand.tex, bumpScale: 0.6 })); shape.add(new THREE.Mesh(tr(new THREE.SphereGeometry(1.12 * 1.012, 48, 24, 0, Math.PI * 2, Math.PI * (capPhi - 0.01), Math.PI * (0.1 + 0.2 * HR.fade))), fm)); }
  const up = new THREE.Vector3(0, 1, 0); const qd = new THREE.Quaternion(), qt = new THREE.Quaternion(), dm = new THREE.Object3D(), nv = new THREE.Vector3(), dv = new THREE.Vector3();
  if (style !== 'buzz') {
    const count = opts.coarse ? 260 : style === 'long-wavy' ? 460 : style === 'curly' ? 170 : 900; const geo = tr(style === 'curly' ? new THREE.SphereGeometry(1, 10, 8) : new THREE.BoxGeometry(style === 'long-wavy' ? 0.075 : 0.032, 1, style === 'long-wavy' ? 0.03 : 0.03));
    const inst = new THREE.InstancedMesh(geo, hairM, count);
    for (let i = 0; i < count; i++) {
      const th = rr() * Math.PI * 2, ph = (style === 'long-wavy' ? 0.2 + rr() * 0.5 : rr() * capPhi * 0.97) * Math.PI; nv.set(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th));
      const p = nv.clone().multiplyScalar(RAD * 0.99);
      if (style === 'long-wavy') { const len = 1.3 + rr() * 0.7; dv.copy(nv).multiplyScalar(0.5).add(new THREE.Vector3((rr() - 0.5) * 0.3, -1.0, (rr() - 0.5) * 0.3)).normalize(); qd.setFromUnitVectors(up, dv); dm.position.copy(p).addScaledVector(dv, len / 2); dm.quaternion.copy(qd); dm.scale.set(1, len, 1); }
      else if (style === 'curly') { const r = 0.13 + rr() * 0.08; dm.position.copy(p).addScaledVector(nv, 0.06); dm.quaternion.identity(); dm.scale.setScalar(r); }
      else { const len = 0.07 + rr() * 0.1; dv.copy(nv).add(new THREE.Vector3((rr() - 0.5) * 0.35, (rr() - 0.5) * 0.25, (rr() - 0.5) * 0.35)).normalize(); qd.setFromUnitVectors(up, dv); qt.setFromAxisAngle(up, rr() * 6.28); qd.multiply(qt); dm.position.copy(p).addScaledVector(dv, len * 0.38); dm.quaternion.copy(qd); dm.scale.set(1, len, 1); }
      dm.updateMatrix(); inst.setMatrixAt(i, dm.matrix);
    }
    inst.frustumCulled = false; shape.add(sh(inst, true, false));
  }
  /* headphones */
  const cupM = std(P.headphones.band, 0.35, 0.6); const ring = tr(new THREE.MeshBasicMaterial({ color: new THREE.Color(P.headphones.ring).multiplyScalar(2.4), toneMapped: false }));
  const band = new THREE.Mesh(tr(new THREE.TorusGeometry(1.24, 0.09, 10, 40, Math.PI)), cupM); band.position.y = 0.08; headG.add(sh(band));
  [-1, 1].forEach((s) => { const cup = new THREE.Mesh(tr(new THREE.CylinderGeometry(0.62, 0.62, 0.42, 28)), cupM); cup.rotation.z = Math.PI / 2; cup.position.set(s * 1.18, -0.05, 0); headG.add(sh(cup)); const r = new THREE.Mesh(tr(new THREE.TorusGeometry(0.5, 0.035, 8, 28)), ring); r.rotation.y = Math.PI / 2; r.position.set(s * 1.4, -0.05, 0); headG.add(r); });
  const chairBack = new THREE.Mesh(tr(new THREE.BoxGeometry(6.6, 6.2, 0.7)), std(0x0c0f16, 0.7, 0.2)); chairBack.position.set(0, -3.4, 37.4); group.add(sh(chairBack));
  reg('me', 'Say hi', [headG, neck], () => ({ type: 'toast', msg: 'Hi, I am Vikas. Scroll, and I will show you around.' }), (h) => { headG.rotation.z = Math.sin(h * 3) * 0.04; });

  /* dust in the window light */
  const ND = opts.coarse ? 60 : 150; const dp = new Float32Array(ND * 3); for (let i = 0; i < ND; i++) { dp[i * 3] = (Math.random() - 0.2) * 34 + 4; dp[i * 3 + 1] = Math.random() * 4; dp[i * 3 + 2] = 20 + Math.random() * 20; }
  const dg = tr(new THREE.BufferGeometry()); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3)); dg.setAttribute('aSeed', new THREE.BufferAttribute(Float32Array.from({ length: ND }, () => Math.random()), 1));
  const dustMat = tr(new THREE.ShaderMaterial({ vertexShader: DUST_V, fragmentShader: DUST_F, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uPx: { value: opts.dpr } } }));
  const dust = new THREE.Points(dg, dustMat); dust.frustumCulled = false; group.add(dust);

  const pickables: THREE.Object3D[] = []; group.traverse((o) => { if (o.userData.iid && (o as THREE.Mesh).isMesh) pickables.push(o); });
  let nextFlash = 5, flashV = 0, hoverId: string | null = null, rainV = glass.uniforms.uRain.value as number;
  return {
    group,
    setRes(w: number, h: number) { glass.uniforms.uRes.value.set(w, h); },
    /** Returns the interactive id under the ray, or null. */
    pick(ray: THREE.Raycaster): string | null { const hit = ray.intersectObjects(pickables, false)[0]; return hit ? (hit.object.userData.iid as string) : null; },
    setHover(id: string | null) { hoverId = id; },
    label(id: string | null) { return id ? inter.get(id)?.label ?? null : null; },
    click(id: string): Action | null { return inter.get(id)?.click() ?? null; },
    get typing() { return typing; },
    setTyping(b: boolean) { typing = b; needMain = true; },
    /** Key handling for the focused terminal. Returns an action for Enter on "dive". */
    type(key: string): Action | null {
      termMsg = ''; needMain = true;
      if (key === 'Escape') { typing = false; return null; }
      if (key === 'Backspace') { buf = buf.slice(0, -1); return null; }
      if (key === 'Enter') { const c = buf.trim().toLowerCase(); buf = ''; if (c === 'dive' || c === 'dive --in' || c === './dive') { typing = false; return { type: 'dive' }; } termMsg = c ? `command not found: ${c}  (try: dive)` : ''; return null; }
      if (key.length === 1 && buf.length < 26) buf += key;
      return null;
    },
    keyFlash(k: string) { flash.set(k.toLowerCase(), 1); },
    update(t: number, dt: number, mouseX: number, mouseY: number, u: number) {
      glass.uniforms.uTime.value = t; steamMat.uniforms.uTime.value = t; dustMat.uniforms.uTime.value = t;
      steamBoost *= Math.exp(-dt * 0.6); steamMat.uniforms.uBoost.value = steamBoost;
      rainV += (RAIN_AMT[WEATHER[weatherIdx]] - rainV) * Math.min(1, dt * 1.5); glass.uniforms.uRain.value = rainV;
      nextFlash -= dt; if (nextFlash < 0) { if (SCENE.city.lightning && rainV > 0.3) flashV = 1; nextFlash = 7 + Math.random() * 9; } flashV *= Math.exp(-dt * 5); glass.uniforms.uFlash.value = flashV * 0.55;
      lWin.intensity = baseI.win * (1 + flashV * 1.8); lCyan.intensity = baseI.cyan * (0.92 + Math.sin(t * 2.1) * 0.05);
      lamp.intensity += (baseI.lamp * (lampOn ? 1 : 0) - lamp.intensity) * Math.min(1, dt * 8); bulbM.color.set('#ffb36b').multiplyScalar(lampOn ? 3 : 0.15);
      inter.forEach((it) => { it.target = it.id === hoverId ? 1 : 0; it.h += (it.target - it.h) * Math.min(1, dt * 10); it.update?.(it.h); });
      const hot = Math.pow(Math.max(0, (u - 0.7) / 0.3), 2);
      screenMats[0].color.setScalar(1.25 + hoverBright[0] * 0.2 + hot * 7); screenMats[1].color.setScalar(1.05 + hoverBright[1] * 0.3); screenMats[2].color.setScalar(1.05 + hoverBright[2] * 0.3); lCyan.intensity += baseI.cyan * hot * 5;
      flash.forEach((v, k) => { const n2 = v - dt * 4; if (n2 <= 0) flash.delete(k); else flash.set(k, n2); });
      if (Math.floor(t * 12) !== Math.floor((t - dt) * 12)) drawKb();
      const chars = Math.floor(((t * 0.9) % 12.5) * 30); const cc = typing || buf ? 999 : Math.min(chars, TERM_TOTAL + 40); const bn = Math.floor(t * 2);
      if (cc !== lastChars || needMain || (typing && bn !== blink)) { lastChars = cc; blink = bn; needMain = false; drawMain(cc, t); }
      if (Math.floor(t * 5) !== Math.floor((t - dt) * 5)) drawLeft(t);
      me.position.y = Math.sin(t * 1.2) * 0.04; torso.scale.y = 1 + Math.sin(t * 1.2) * 0.012; headG.rotation.y = -mouseX * 0.22; headG.rotation.x = 0.06 - mouseY * 0.07 + Math.sin(t * 0.7) * 0.01; coffee.rotation.z = t * 0.2;
    },
    dispose() { disp.forEach((d) => d.dispose()); },
  };
}
