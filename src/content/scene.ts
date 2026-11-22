/**
 * Specifications for the opening room. Edit these to change how the scene looks.
 * hair.style: 'textured-crop' | 'buzz' | 'long-wavy' | 'curly'   (fade: 0 none .. 1 high skin fade, used by crop/buzz)
 */
export const SCENE = {
  person: {
    skin: '#9a6a4a',
    hoodie: '#1d2433',
    hair: { style: 'textured-crop' as 'textured-crop' | 'buzz' | 'long-wavy' | 'curly', color: '#0a0a0d', fade: 0.55 },
    headphones: { band: '#0a0c12', ring: '#5ea1ff' },
  },
  city: { name: 'New York', weather: 'light-rain' as 'light-rain' | 'heavy-rain' | 'clear', lightning: true },
  lamp: { on: true },
  /** Posters on the wall. href: '#section' scrolls the home page, '/work/slug' opens a case file. */
  posters: [
    { id: 'metro', title: 'The Stack Line: a metro map of the four gates', href: '#work' },
    { id: 'bigo', title: 'Know your complexity (Big-O)', href: '/work/nifty-analyser' },
    { id: 'verify', title: 'Verify everything', href: '#thesis' },
    { id: 'blueprint', title: 'Gate, section A-A: the egress boundary', href: '/work/onlymeta' },
    { id: 'hello', title: 'Hello, World in the languages I ship', href: '#stack' },
    { id: 'blr', title: 'Namma Bengaluru', href: '#about' },
  ],
};
