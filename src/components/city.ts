import * as THREE from 'three';

/**
 * A real 3D night-time Manhattan seen from a high floor: ~800 instanced towers with procedurally lit windows,
 * an Empire State-style stepped tower, a One WTC-style tapered tower, a glowing street grid, a cloudy sky with a moon,
 * and blinking aircraft. Everything lives on layer 1 and is rendered to a texture that the rainy window samples,
 * so the view has true parallax as the camera moves.
 */
const GROUND = -150;
const NOISE = /* glsl */ `
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0., a = .5; for(int i=0;i<5;i++){ v += a*noise(p); p = p*2.03 + 7.1; a *= .5; } return v; }`;

const SKY_V = `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelViewMatrix*vec4(position,1.); gl_Position = projectionMatrix*p; gl_Position.z = gl_Position.w; }`;
const SKY_F = /* glsl */ `precision highp float; varying vec3 vDir; uniform float uTime; ${NOISE}
void main(){
  vec3 d = normalize(vDir); float h = d.y;
  vec3 zen = vec3(.006,.012,.04), mid = vec3(.07,.045,.15), hor = vec3(.95,.38,.2);
  vec3 c = mix(hor, mid, smoothstep(-.02,.16,h)); c = mix(c, zen, smoothstep(.1,.55,h)); if(h<0.) c = hor*.6*(1.+h*3.);
  if(h > .01){
    vec2 p = d.xz/(h+.14)*1.1 + vec2(uTime*.006, 0.); float n = fbm(p*1.4); float cl = smoothstep(.46,.82,n)*smoothstep(.01,.18,h)*(1.-smoothstep(.5,.9,h));
    vec3 cc = mix(vec3(.55,.22,.28), vec3(.2,.12,.3), smoothstep(0.,.35,h)); c = mix(c, cc*(.45+n*.9), cl*.7);
  }
  vec3 m = normalize(vec3(.58,.3,-1.)); float md = dot(d,m);
  c += vec3(.9,.93,1.)*smoothstep(.99935,.99965,md)*1.1 + vec3(.35,.45,.8)*smoothstep(.99,.9993,md)*.22 + vec3(.2,.25,.5)*smoothstep(.95,.999,md)*.08;
  gl_FragColor = vec4(c, 1.);
}`;

const BLD_V = /* glsl */ `
attribute vec4 aDim; varying vec3 vN; varying vec3 vLp; varying float vSeed; varying vec3 vW;
void main(){ vec3 p = position * aDim.xyz; vLp = p; vN = normal; vSeed = aDim.w; vec4 w = modelMatrix * instanceMatrix * vec4(p, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const BLD_F = /* glsl */ `precision highp float; varying vec3 vN; varying vec3 vLp; varying float vSeed; varying vec3 vW; uniform float uTime; ${NOISE}
void main(){
  float dist = length(vW - cameraPosition);
  vec3 haze = mix(vec3(.55,.2,.24), vec3(.12,.07,.2), smoothstep(-150., 350., vW.y));
  float fog = 1. - exp(-dist*0.00052);
  vec3 col = vec3(.012,.014,.03)*(.6+vSeed);
  if (abs(vN.y) < .5) {
    vec2 uv = abs(vN.x) > .5 ? vec2(vLp.z, vLp.y) : vec2(vLp.x, vLp.y);
    vec2 cell = vec2(13., 19.); vec2 id = floor(uv/cell); vec2 f = fract(uv/cell);
    float h = hash(id + vSeed*57.3); float h2 = hash(id*1.7 + vSeed*13.1);
    float win = step(.16,f.x)*step(f.x,.84)*step(.2,f.y)*step(f.y,.8);
    float on = step(.46, h) * win; float tw = step(.985, h2) * (.5 + .5*sin(uTime*(2.+h*5.)));
    vec3 wc = h2 < .55 ? vec3(1.,.74,.42) : h2 < .85 ? vec3(.62,.8,1.) : vec3(1.,.95,.85);
    col += wc * on * (.9 + h*1.6) + vec3(1.,.9,.7)*tw*win*1.5;
    col += vec3(.9,.35,.2) * smoothstep(-90., -150., vW.y) * .5;
  } else col += vec3(.02,.02,.04);
  col = mix(col, haze*.55, fog);
  gl_FragColor = vec4(col, 1.);
}`;
const GROUND_F = /* glsl */ `precision highp float; varying vec3 vW; uniform float uTime; ${NOISE}
void main(){
  vec2 g = vW.xz / 70.; vec2 f = abs(fract(g) - .5); vec2 id = floor(g);
  float st = max(step(f.x, .055), step(f.y, .055)); float av = max(step(abs(fract(g.x/5.)-.5), .014), step(abs(fract(g.y/5.)-.5), .014));
  float block = hash(id); float lit = st * (.35 + .65*hash(id*3.1)) + av*.8;
  float car = step(.93, hash(id + floor(uTime*.8 + hash(id)*9.))) * st;
  vec3 c = vec3(.02,.016,.03) + vec3(1.,.66,.35)*lit*.9 + vec3(1.,.2,.15)*car*.9 + vec3(.45,.6,1.)*lit*.1*block;
  float dist = length(vW - cameraPosition); float fog = 1. - exp(-dist*0.00038);
  c = mix(c, vec3(.5,.2,.24)*.45, fog);
  gl_FragColor = vec4(c, 1.);
}`;
const GROUND_V = `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`;

export function buildCity(opts: { coarse: boolean }) {
  const group = new THREE.Group(); const disp: { dispose: () => void }[] = []; const tr = <T extends { dispose: () => void }>(o: T) => { disp.push(o); return o; };
  const sky = new THREE.Mesh(tr(new THREE.SphereGeometry(2600, 32, 20)), tr(new THREE.ShaderMaterial({ vertexShader: SKY_V, fragmentShader: SKY_F, side: THREE.BackSide, depthWrite: false, uniforms: { uTime: { value: 0 } } })));
  sky.renderOrder = -10; sky.frustumCulled = false; group.add(sky);
  const ground = new THREE.Mesh(tr(new THREE.PlaneGeometry(9000, 9000)), tr(new THREE.ShaderMaterial({ vertexShader: GROUND_V, fragmentShader: GROUND_F, uniforms: { uTime: { value: 0 } } }))); ground.rotation.x = -Math.PI / 2; ground.position.set(600, GROUND, -1800); group.add(ground);

  /* towers */
  let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const list: { x: number; z: number; w: number; d: number; h: number }[] = []; const N = opts.coarse ? 380 : 820;
  for (let i = 0; i < N; i++) {
    const r = rnd(); let x: number, z: number, hk: number;
    if (r < 0.5) { x = 520 + (rnd() + rnd() - 1) * 520; z = -1000 - rnd() * 700; hk = 1 - Math.abs(x - 520) / 560; }
    else if (r < 0.75) { x = 900 + (rnd() + rnd() - 1) * 330; z = -1450 - rnd() * 700; hk = 1 - Math.abs(x - 900) / 360; }
    else { x = -300 + rnd() * 1700; z = -650 - rnd() * 1700; hk = 0.2; }
    list.push({ x, z, w: 40 + rnd() * 80, d: 40 + rnd() * 80, h: 70 + Math.pow(rnd(), 2) * 230 * (0.35 + Math.max(0, hk)) });
  }
  const stack = (cx: number, cz: number, parts: [number, number][], spire: number) => { let y = 0; parts.forEach(([w, h]) => { list.push({ x: cx, z: cz, w, d: w, h: h + y }); y += h; }); list.push({ x: cx, z: cz, w: 7, d: 7, h: y + spire }); };
  stack(330, -900, [[120, 190], [92, 30], [70, 34], [48, 30]], 70); /* Empire State style */
  [[150, 230], [118, 20], [86, 20], [60, 20], [40, 20]].forEach(([w, h], i) => list.push({ x: 800, z: -1500, w, d: w, h: h + i * 18 + 120 })); list.push({ x: 800, z: -1500, w: 8, d: 8, h: 470 }); /* One WTC style */
  const geo = tr(new THREE.BoxGeometry(1, 1, 1)); const dim = new Float32Array(list.length * 4);
  const mat = tr(new THREE.ShaderMaterial({ vertexShader: BLD_V, fragmentShader: BLD_F, uniforms: { uTime: { value: 0 } } }));
  const mesh = new THREE.InstancedMesh(geo, mat, list.length); mesh.frustumCulled = false; const d = new THREE.Object3D();
  list.forEach((b, i) => { d.position.set(b.x, GROUND + b.h / 2, b.z); d.updateMatrix(); mesh.setMatrixAt(i, d.matrix); dim.set([b.w, b.h, b.d, rnd()], i * 4); });
  geo.setAttribute('aDim', new THREE.InstancedBufferAttribute(dim, 4)); group.add(mesh);

  /* beacons: aviation lights on the tall towers and aircraft crossing the sky */
  const tall = list.filter((b) => b.h > 250).slice(0, 40); const nb = tall.length + 4;
  const bp = new Float32Array(nb * 3); tall.forEach((b, i) => bp.set([b.x, GROUND + b.h + 6, b.z], i * 3));
  const bg = tr(new THREE.BufferGeometry()); bg.setAttribute('position', new THREE.BufferAttribute(bp, 3));
  const bm = tr(new THREE.PointsMaterial({ color: new THREE.Color('#ff3b3b').multiplyScalar(3), size: 7, sizeAttenuation: true, transparent: true, depthWrite: false, fog: false, toneMapped: false }));
  const beacons = new THREE.Points(bg, bm); beacons.frustumCulled = false; group.add(beacons);
  const top = new THREE.Mesh(tr(new THREE.BoxGeometry(18, 22, 18)), tr(new THREE.MeshBasicMaterial({ color: '#ffe0a0', toneMapped: false, fog: false }))); top.position.set(330, GROUND + 190 + 30 + 34 + 30 + 11 + 70 + 22, -900); group.add(top);

  return {
    group,
    update(t: number, camPos: THREE.Vector3) {
      (sky.material as THREE.ShaderMaterial).uniforms.uTime.value = t; sky.position.copy(camPos);
      mat.uniforms.uTime.value = t; (ground.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      bm.opacity = 0.35 + 0.65 * (Math.sin(t * 2.2) > 0 ? 1 : 0.1);
      const pos = bg.attributes.position as THREE.BufferAttribute; for (let i = tall.length; i < nb; i++) { const a = (t * 0.012 * (1 + i * 0.4) + i * 1.7) % 1; pos.setXYZ(i, 300 + a * 2200 * (i % 2 ? -1 : 1), 200 + i * 55, -1900 - i * 120); } pos.needsUpdate = true;
      (top.material as THREE.MeshBasicMaterial).color.setHSL((t * 0.04) % 1, 0.7, 0.75);
    },
    dispose() { disp.forEach((x) => x.dispose()); },
  };
}
