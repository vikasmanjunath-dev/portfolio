'use client';
import { useEffect, useState } from 'react';

export default function CaseToc({ items }: { items: [string, string][] }) {
  const [on, setOn] = useState(items[0][0]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) setOn(e.target.id); }); }, { rootMargin: '-30% 0px -60% 0px' });
    items.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [items]);
  return <nav className="toc" aria-label="On this page">{items.map(([id, l]) => <a key={id} href={`#${id}`} className={on === id ? 'on' : ''}>{l}</a>)}</nav>;
}
