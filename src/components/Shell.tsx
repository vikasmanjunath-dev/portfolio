'use client';
import { toggleAmbient } from './ambient';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Lenis from 'lenis';
import Palette from './Palette';

type Ctx = {
  verify: boolean; zen: boolean; theme: 'dark' | 'light';
  setVerify: (v: boolean) => void; setZen: (v: boolean) => void; toggleTheme: () => void;
  toast: (m: string) => void; go: (href: string) => void; scrollToId: (id: string) => void; scrollToY: (y: number) => void; openPalette: () => void;
};
const C = createContext<Ctx>(null as unknown as Ctx);
export const useApp = () => useContext(C);

const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* storage can be blocked */ } },
};

const BOOT: [string, string][] = [
  ['finos · mobile tests', '1,655'], ['dueclock · statutory tests (pg)', '750'], ['akaarai · server tests', '520'],
  ['vybes-lynk · database assertions', '283'], ['onlymeta · payloads lost in 10,000', '0'], ['ports · parity with originals', '1,400/1,400'],
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [verify, setVerifyS] = useState(false);
  const [zen, setZenS] = useState(false);
  const [snd, setSnd] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [msg, setMsg] = useState('');
  const [pal, setPal] = useState(false);
  const [booting, setBooting] = useState(false);
  const [bootOut, setBootOut] = useState(false);
  const [curtain, setCurtain] = useState<'' | 'on' | 'off'>('');
  const lenis = useRef<Lenis | null>(null);
  const tm = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPath = useRef(pathname);
  const root = typeof document !== 'undefined' ? document.documentElement : null;

  /* init: flags, stored modes, boot overlay */
  useEffect(() => {
    const el = document.documentElement;
    el.classList.remove('nojs'); el.classList.add('js');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) el.classList.add('reduce');
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) el.classList.add('fine');
    const t = (el.getAttribute('data-theme') as 'dark' | 'light') || 'dark';
    setTheme(t);
    const nv = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const lowPower = !!(nv.connection?.saveData || (nv.deviceMemory && nv.deviceMemory <= 2) || (nv.hardwareConcurrency && nv.hardwareConcurrency <= 2));
    const saved = store.get('vm.zen');
    const v = store.get('vm.verify') === '1'; const z = saved === '1' || reduce || (saved == null && lowPower);
    setVerifyS(v); setZenS(z); el.classList.toggle('verify', v); el.classList.toggle('zen', z);
    if (el.classList.contains('boot')) {
      setBooting(true);
      const t1 = setTimeout(() => finishBoot(), 1500);
      return () => clearTimeout(t1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const finishBoot = useCallback(() => {
    setBootOut(true);
    try { sessionStorage.setItem('vm.boot', '1'); } catch { /* ignore */ }
    setTimeout(() => { document.documentElement.classList.remove('boot'); setBooting(false); }, 600);
  }, []);

  const setVerify = useCallback((v: boolean) => { setVerifyS(v); document.documentElement.classList.toggle('verify', v); store.set('vm.verify', v ? '1' : '0'); }, []);
  const setZen = useCallback((v: boolean) => { setZenS(v); document.documentElement.classList.toggle('zen', v); store.set('vm.zen', v ? '1' : '0'); window.dispatchEvent(new Event('vm:zen')); }, []);
  const toggleTheme = useCallback(() => {
    setTheme((p) => { const n = p === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', n); store.set('vm.theme', n); return n; });
  }, []);
  const toast = useCallback((m: string) => { setMsg(m); if (tm.current) clearTimeout(tm.current); tm.current = setTimeout(() => setMsg(''), 2200); }, []);

  /* smooth scroll (Lenis): off in Zen / reduced motion */
  useEffect(() => {
    if (zen) { lenis.current?.destroy(); lenis.current = null; return; }
    const l = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95, smoothWheel: true });
    lenis.current = l;
    let raf = 0;
    const loop = (t: number) => { l.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); l.destroy(); lenis.current = null; };
  }, [zen]);

  /* scroll progress + nav state + hero parallax var */
  useEffect(() => {
    const bar = document.querySelector<HTMLElement>('.progress');
    let last = 0;
    const on = () => {
      const y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.transform = `scaleX(${h > 0 ? Math.min(1, y / h) : 0})`;
      document.documentElement.style.setProperty('--sy', String(y));
      const nav = document.querySelector('.nav');
      if (nav) { nav.classList.toggle('scrolled', y > 40); nav.classList.toggle('hide', y > 500 && y > last + 4 && !document.querySelector('.nav-links.open')); if (y < last - 4) nav.classList.remove('hide'); }
      last = y;
    };
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [pathname]);

  /* reveal on scroll: a position sweep (never depends on observer timing, so jumps and anchors cannot leave a blank page) */
  useEffect(() => {
    let raf = 0;
    const sweep = () => { raf = 0; const lim = innerHeight * 0.94; document.querySelectorAll('.rv:not(.in), .split:not(.in)').forEach((n) => { if (n.getBoundingClientRect().top < lim) n.classList.add('in'); }); };
    const ask = () => { if (!raf) raf = requestAnimationFrame(sweep); };
    sweep(); addEventListener('scroll', ask, { passive: true }); addEventListener('resize', ask);
    const mo = new MutationObserver(ask); mo.observe(document.body, { childList: true, subtree: true });
    const iv = setInterval(sweep, 350);
    return () => { removeEventListener('scroll', ask); removeEventListener('resize', ask); mo.disconnect(); clearInterval(iv); if (raf) cancelAnimationFrame(raf); };
  }, [pathname]);

  /* page transitions. Same-page anchors are plain scrolls; the curtain always lifts (failsafe), so a page can never stay covered. */
  const scrollHere = useCallback((id: string) => {
    const el = document.getElementById(id); if (!el) return;
    if (lenis.current) lenis.current.scrollTo(el, { offset: -60, duration: 1.4 }); else el.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => { const d = el.getBoundingClientRect().top - 60; if (Math.abs(d) > 24) { lenis.current?.stop(); window.scrollTo(0, window.scrollY + d); lenis.current?.start(); } }, 1900);
  }, []);
  const norm = (p: string) => (p.replace(/\/+$/, '') || '/');
  const go = useCallback((href: string) => {
    const [path, hash] = href.split('#'); const target = norm(path || pathname);
    if (target === norm(pathname)) { if (hash) scrollHere(hash); else if (lenis.current) lenis.current.scrollTo(0); else window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (zen || document.documentElement.classList.contains('reduce')) { router.push(href); return; }
    setCurtain('on');
    setTimeout(() => router.push(href), 520);
    setTimeout(() => setCurtain((c) => (c === 'on' ? 'off' : c)), 1800);
    setTimeout(() => setCurtain((c) => (c === 'off' ? '' : c)), 2700);
  }, [pathname, router, zen, scrollHere]);
  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;
    lenis.current?.scrollTo(0, { immediate: true }); window.scrollTo(0, 0);
    setCurtain('off');
    const t = setTimeout(() => setCurtain(''), 760);
    return () => clearTimeout(t);
  }, [pathname]);

  const scrollToY = useCallback((y: number) => { if (lenis.current) lenis.current.scrollTo(y, { duration: 2.8 }); else window.scrollTo({ top: y, behavior: 'smooth' }); setTimeout(() => { if (Math.abs(window.scrollY - y) > 40) window.scrollTo(0, y); }, 3600); }, []);
  const scrollToId = useCallback((id: string) => {
    const home = pathname === '/' || pathname === '';
    if (!home) { go('/#' + id); return; }
    scrollHere(id);
  }, [pathname, go, scrollHere]);

  /* hash on arrival (from another page) */
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const t = setTimeout(() => { const el = document.getElementById(id); if (el) { if (lenis.current) lenis.current.scrollTo(el, { offset: -60, immediate: true }); else el.scrollIntoView(); } }, 450);
    return () => clearTimeout(t);
  }, [pathname]);

  /* delegated: internal links use the curtain; # links use smooth scroll */
  useEffect(() => {
    const click = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const a = (e.target as HTMLElement).closest('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#')) { e.preventDefault(); scrollToId(href.slice(1)); document.querySelector('.nav-links')?.classList.remove('open'); return; }
      if (href.startsWith('/') && !href.startsWith('//') && !/\.(pdf|png|xml|txt)$/.test(href)) {
        e.preventDefault(); document.querySelector('.nav-links')?.classList.remove('open');
        const [path, hash] = href.split('#'); go(path + (hash ? '#' + hash : ''));
      }
    };
    document.addEventListener('click', click);
    return () => document.removeEventListener('click', click);
  }, [go, scrollToId]);

  /* cursor + magnetic */
  useEffect(() => {
    if (!document.documentElement.classList.contains('fine')) return;
    const dot = document.querySelector<HTMLElement>('.cur'), ring = document.querySelector<HTMLElement>('.cur-ring'), lbl = ring?.querySelector<HTMLElement>('.lbl');
    if (!dot || !ring) return;
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0;
    const move = (e: PointerEvent) => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px)`; };
    const loop = () => { rx += (x - rx) * 0.18; ry += (y - ry) * 0.18; ring.style.transform = `translate(${rx}px,${ry}px)`; raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement; const c = t.closest<HTMLElement>('[data-cursor]'); const hit = t.closest('a,button,[role=tab],summary,input,select,textarea');
      ring.classList.toggle('hov', !!c); if (lbl) lbl.textContent = c?.dataset.cursor || '';
      ring.style.borderColor = hit && !c ? 'transparent' : '#fff'; ring.style.background = hit && !c ? 'rgba(255,255,255,.18)' : '';
    };
    const mag = (e: PointerEvent) => {
      document.querySelectorAll<HTMLElement>('[data-mag]').forEach((el) => {
        const r = el.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; const d = Math.hypot(e.clientX - cx, e.clientY - cy);
        const R = Math.max(r.width, r.height) * 0.9;
        el.style.transform = d < R ? `translate(${(e.clientX - cx) * 0.22}px,${(e.clientY - cy) * 0.28}px)` : '';
      });
    };
    const tiltEls = new Set<HTMLElement>();
    const tilt = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-tilt]');
      tiltEls.forEach((t) => { if (t !== el) { t.style.transform = ''; tiltEls.delete(t); } });
      if (!el || document.documentElement.classList.contains('zen')) return;
      const r = el.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 7).toFixed(2)}deg) translateZ(0)`; tiltEls.add(el);
    };
    const hv = (e: Event) => { const label = (e as CustomEvent).detail as string | null; ring.classList.toggle('hov', !!label); if (lbl) lbl.textContent = label || ''; };
    window.addEventListener('vm:hover', hv);
    window.addEventListener('pointermove', tilt, { passive: true });
    window.addEventListener('pointermove', move, { passive: true }); window.addEventListener('pointermove', mag, { passive: true }); document.addEventListener('pointerover', over);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('vm:hover', hv); window.removeEventListener('pointermove', tilt); window.removeEventListener('pointermove', move); window.removeEventListener('pointermove', mag); document.removeEventListener('pointerover', over); };
  }, []);

  /* keep glossary tooltips inside the viewport */
  useEffect(() => {
    const fit = (e: Event) => {
      const term = (e.target as HTMLElement).closest?.('.term'); if (!term) return;
      const tip = term.querySelector<HTMLElement>('.term-tip'); if (!tip) return;
      requestAnimationFrame(() => {
        tip.style.transform = ''; const r = tip.getBoundingClientRect(); let dx = 0;
        if (r.right > innerWidth - 8) dx = innerWidth - 8 - r.right; if (r.left + dx < 8) dx = 8 - r.left;
        if (dx) tip.style.transform = `translateX(${dx}px)`;
      });
    };
    document.addEventListener('mouseover', fit); document.addEventListener('focusin', fit);
    return () => { document.removeEventListener('mouseover', fit); document.removeEventListener('focusin', fit); };
  }, []);

  /* keyboard */
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement; const typing = /INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPal((p) => !p); return; }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === '/') { e.preventDefault(); setPal(true); }
      else if (e.key.toLowerCase() === 'v') { setVerify(!document.documentElement.classList.contains('verify')); toast(document.documentElement.classList.contains('verify') ? 'Verify mode on: evidence tags shown' : 'Verify mode off'); }
      else if (e.key.toLowerCase() === 'z') { setZen(!document.documentElement.classList.contains('zen')); toast(document.documentElement.classList.contains('zen') ? 'Zen mode on' : 'Zen mode off'); }
      else if (e.key.toLowerCase() === 't') toggleTheme();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [setVerify, setZen, toggleTheme, toast]);

  const value = useMemo<Ctx>(() => ({ verify, zen, theme, setVerify, setZen, toggleTheme, toast, go, scrollToId, scrollToY, openPalette: () => setPal(true) }), [verify, zen, theme, setVerify, setZen, toggleTheme, toast, go, scrollToId, scrollToY]);
  void root;

  return (
    <C.Provider value={value}>
      <a className="skip" href="#main">Skip to content</a>
      <div className="progress" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div className="cur" aria-hidden="true" /><div className="cur-ring" aria-hidden="true"><span className="lbl" /></div>
      <div className={`curtain ${curtain}`} aria-hidden="true" />
      {booting && (
        <div className={`pre ${bootOut ? 'out' : ''}`} aria-hidden="true">
          <div className="pre-in">
            <div className="big-n">Vikas Manjunath</div>
            {BOOT.map(([k, v], i) => <div className="ln" style={{ ['--d' as string]: 250 + i * 250 } as React.CSSProperties} key={k}><span>{k}</span><b>{v} ✓</b></div>)}
            <div className="pre-bar"><i /></div>
            <button className="pre-skip" onClick={finishBoot} type="button">Skip intro</button>
          </div>
        </div>
      )}
      {children}
      <div className="dock" role="toolbar" aria-label="Viewing modes">
        <button type="button" aria-pressed={verify} onClick={() => { setVerify(!verify); toast(!verify ? 'Verify mode on: evidence tags shown' : 'Verify mode off'); }} title="Show evidence tags (V)">Verify <span className="kbd hide-s">V</span></button>
        <button type="button" aria-pressed={zen} onClick={() => { setZen(!zen); toast(!zen ? 'Zen mode on' : 'Zen mode off'); }} title="Calm mode: no 3D, grain, cursor or smooth scroll (Z)">Zen <span className="kbd hide-s">Z</span></button>
        <button type="button" aria-pressed={snd} onClick={() => { const v = toggleAmbient(); setSnd(v); toast(v ? 'Room sound on: rain and keys' : 'Room sound off'); }} title="Ambient rain and keyboard sound (off by default)">Sound</button>
        <button type="button" onClick={() => setPal(true)} title="Command palette (Ctrl or Cmd + K)">⌘K</button>
      </div>
      {pal && <Palette onClose={() => setPal(false)} />}
      <div className={`toast ${msg ? 'on' : ''}`} role="status" aria-live="polite">{msg}</div>
    </C.Provider>
  );
}
