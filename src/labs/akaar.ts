/**
 * AkaarAI colour verdict: ported from akaarai-server/app/verdict/colour_rules.py (+ skin.py undertone and the
 * thresholds in app/thresholds.py). Three rules per garment colour (undertone match, contrast, richness), each 0-2,
 * weighted by area, summed to a 0-6 score, mapped to a label, with sentences from fixed templates. ALL THRESHOLDS ARE
 * PROVISIONAL in the project (to be calibrated on its own rated outfits); this is a rule demo, not an accuracy claim.
 */
export const T = { UNDERTONE_WARM_HUE: 56, UNDERTONE_COOL_HUE: 46, CONTRAST_BLEND: 8, CONTRAST_GENTLE: 15, CONTRAST_VERY_HIGH: 65, RICHNESS_MATCH_LOW: -10, RICHNESS_MATCH_HIGH: 25, RICHNESS_FAR: 45, LABEL_GREAT: 5, LABEL_GOOD: 3.8, LABEL_OKAY: 2.5, NEUTRAL_CHROMA: 10, NEUTRAL_PALE_L: 92, NEUTRAL_DARK_L: 14 };

export type Lab = { L: number; a: number; b: number; C: number; h: number };
export function hexToLab(hex: string): Lab {
  const n = parseInt(hex.replace('#', ''), 16); const lin = (v: number) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const r = lin((n >> 16) & 255), g = lin((n >> 8) & 255), b = lin(n & 255);
  const X = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047, Y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b, Z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const L = 116 * f(Y) - 16, a = 500 * (f(X) - f(Y)), bb = 200 * (f(Y) - f(Z));
  return { L, a, b: bb, C: Math.hypot(a, bb), h: ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360 };
}
export const undertoneOf = (h: number) => (h >= T.UNDERTONE_WARM_HUE ? 'warm' : h < T.UNDERTONE_COOL_HUE ? 'cool' : 'neutral');
export const hueFamily = (h: number) => (h >= 330 || h <= 100 ? 'warm' : h >= 160 && h <= 300 ? 'cool' : 'between');

export const SENTENCES: Record<string, string> = {
  'colour.undertone.match': 'The colour sits well with your {undertone} undertone.',
  'colour.undertone.neutral_skin': 'Your neutral undertone works with most colours.',
  'colour.undertone.neutral_garment': 'A neutral colour, which suits any undertone.',
  'colour.undertone.clash': 'This colour leans {family}, against your {undertone} undertone.',
  'colour.contrast.blend': 'The colour is close to your skin tone, so it blends in a little.',
  'colour.contrast.gentle': 'The contrast with your skin is gentle.',
  'colour.contrast.good': 'There is a clear contrast with your skin, so it looks fresh.',
  'colour.contrast.very_high': 'The contrast with your skin is very strong, so it stands out.',
  'colour.richness.match': 'The richness of the colour matches your skin.',
  'colour.richness.bolder': 'The colour is bolder than your skin tone.',
  'colour.richness.muted': 'The colour is more muted than your skin tone.',
  'colour.richness.far': "The richness of the colour is very different from your skin's.",
};
const say = (rule: string, undertone: string, family: string) => SENTENCES[rule].replace('{undertone}', undertone).replace('{family}', family);

export type Garment = { hex: string; share: number };
export type PerColour = { hex: string; share: number; lab: Lab; neutral: boolean; u: [number, string]; c: [number, string]; r: [number, string] };
export function rate(skinHex: string, garments: Garment[]) { return rateLabs(hexToLab(skinHex), garments.map((g) => ({ hex: g.hex, share: g.share, lab: hexToLab(g.hex) }))); }
export function rateLabs(skin: Lab, garments: { hex: string; share: number; lab: Lab }[]) {
  const undertone = undertoneOf(skin.h);
  const total = garments.reduce((s, g) => s + g.share, 0) || 1; let score = 0; const per: PerColour[] = [];
  for (const g of garments) {
    const lab = g.lab; const neutral = lab.C < T.NEUTRAL_CHROMA || lab.L > T.NEUTRAL_PALE_L || lab.L < T.NEUTRAL_DARK_L; const fam = hueFamily(lab.h);
    const u: [number, string] = neutral ? [2, 'colour.undertone.neutral_garment'] : undertone === 'neutral' ? [2, 'colour.undertone.neutral_skin'] : fam === 'between' || fam === undertone ? [2, 'colour.undertone.match'] : [0, 'colour.undertone.clash'];
    const d = Math.abs(skin.L - lab.L);
    const c: [number, string] = d < T.CONTRAST_BLEND ? [0, 'colour.contrast.blend'] : d < T.CONTRAST_GENTLE ? [1, 'colour.contrast.gentle'] : d > T.CONTRAST_VERY_HIGH ? [1, 'colour.contrast.very_high'] : [2, 'colour.contrast.good'];
    const dv = lab.C - skin.C;
    const r: [number, string] = Math.abs(dv) > T.RICHNESS_FAR ? [0, 'colour.richness.far'] : dv >= T.RICHNESS_MATCH_LOW && dv <= T.RICHNESS_MATCH_HIGH ? [2, 'colour.richness.match'] : [1, dv > 0 ? 'colour.richness.bolder' : 'colour.richness.muted'];
    score += (g.share / total) * (u[0] + c[0] + r[0]); per.push({ hex: g.hex, share: g.share, lab, neutral, u, c, r });
  }
  let label = score >= T.LABEL_GREAT ? 'Great' : score >= T.LABEL_GOOD ? 'Good' : score >= T.LABEL_OKAY ? 'Okay' : 'Not ideal'; let capped = false;
  const main = per[0];
  if (main.u[0] === 0 && (label === 'Great' || label === 'Good')) { label = 'Okay'; capped = true; }
  const pick = main.c[0] <= main.r[0] ? main.c : main.r; const fam = hueFamily(main.lab.h);
  const sentences = [main.u[1], pick[1]].map((rule) => ({ rule, text: say(rule, undertone, fam) }));
  return { skin, undertone, score: Math.round(score * 1000) / 1000, label, capped, per, sentences };
}
