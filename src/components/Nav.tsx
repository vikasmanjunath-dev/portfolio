'use client';
import { useState } from 'react';
import { useApp } from './Shell';

const LINKS: [string, string][] = [['work', 'Work'], ['labs', 'Labs'], ['stack', 'Stack'], ['method', 'Method'], ['writing', 'Writing'], ['about', 'About'], ['contact', 'Contact']];

export default function Nav() {
  const { openPalette, theme, toggleTheme } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <header className={`nav`}>
      <a className="brand" href="/" aria-label="Vikas Manjunath, home"><i />Vikas Manjunath</a>
      <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Primary">
        {LINKS.map(([id, l]) => <a key={id} href={`/#${id}`} onClick={() => setOpen(false)}>{l}</a>)}
        <button type="button" onClick={() => { setOpen(false); openPalette(); }}>Search <span className="kbd">⌘K</span></button>
        <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? 'Light' : 'Dark'}</button>
      </nav>
      <button className="burger" type="button" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}><span aria-hidden="true">{open ? '✕' : '☰'}</span></button>
    </header>
  );
}
