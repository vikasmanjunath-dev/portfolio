'use client';
import { useEffect, useRef, useState } from 'react';

/** Looping recording of a live lab. Autoplays muted; with reduced motion it shows controls and does not autoplay. */
export default function LabClip({ name, alt }: { name: string; alt: string }) {
  const v = useRef<HTMLVideoElement>(null); const [reduce, setReduce] = useState(false);
  useEffect(() => { const r = matchMedia('(prefers-reduced-motion: reduce)').matches; setReduce(r); if (!r) v.current?.play().catch(() => {}); }, []);
  return (
    <figure className="clip">
      <video ref={v} src={`/clips/lab-${name}.mp4`} poster={`/clips/lab-${name}.jpg`} muted loop playsInline preload="metadata" controls={reduce} aria-label={alt} />
      <figcaption className="lab-note">A short recording of the live lab below, captured from this site with the controls moving.</figcaption>
    </figure>
  );
}
