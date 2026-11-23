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
