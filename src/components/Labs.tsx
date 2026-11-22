'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { LabId } from '@/content/types';
import { Split } from './bits';
import { LAB_META, LAB_ORDER } from '@/content/labmeta';

const FinosLab = dynamic(() => import('./labs/FinosLab'));
const AkaarLab = dynamic(() => import('./labs/AkaarLab'));
const ClockLab = dynamic(() => import('./labs/ClockLab'));
const PrivacyLab = dynamic(() => import('./labs/PrivacyLab'));
const EgressLab = dynamic(() => import('./labs/EgressLab'));
const BunkLab = dynamic(() => import('./labs/BunkLab'));

export function LabById({ id }: { id: LabId }) {
  return id === 'finos' ? <FinosLab /> : id === 'clock' ? <ClockLab /> : id === 'privacy' ? <PrivacyLab /> : id === 'akaar' ? <AkaarLab /> : id === 'egress' ? <EgressLab /> : <BunkLab />;
}

export default function Labs() {
  const [id, setId] = useState<LabId>('finos');
  const m = LAB_META[id];
  return (
    <section className="sec" id="labs" aria-labelledby="lH">
      <div className="wrap">
        <div className="sec-head">
          <p className="mono kicker rv">Live labs · one per core project, running in your browser</p>
          <h2 className="h2" id="lH"><Split text="Do not take my word for it. Run it." /></h2>
          <p className="lead rv">These are not mock-ups. Each lab is the real logic of a core project, ported faithfully and checked against your original Python on hundreds of random cases. Nothing you type leaves your browser.</p>
        </div>
        <div className="labs-tabs" role="tablist" aria-label="Labs">
          {LAB_ORDER.map((k) => <button key={k} role="tab" type="button" className="tab" aria-selected={id === k} onClick={() => setId(k)}>{LAB_META[k].tab}</button>)}
        </div>
        <div className="rv"><h3 className="h3" style={{ marginBottom: 6 }}>{m.title}</h3><p className="lead" style={{ marginBottom: 20, fontSize: '1rem' }}>{m.blurb}</p></div>
        <div role="tabpanel"><LabById id={id} /></div>
      </div>
    </section>
  );
}
