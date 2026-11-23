import type { Metadata } from 'next';
import { LEDGER, LEDGER_COUNTS } from '@/content/ledger';
import LedgerTable from '@/components/LedgerTable';
import { Contact } from '@/components/Client';

export const metadata: Metadata = {
  title: 'Evidence ledger',
  description: 'Every number on this site with its evidence class and source: checkable, documented or self-reported. Also available as JSON.',
  alternates: { canonical: '/evidence/' },
};

export default function Page() {
  return (
    <>
      <main id="main" className="sec" style={{ paddingTop: 120 }}>
        <div className="wrap">
          <p className="mono kicker">Evidence ledger</p>
          <h1 className="h2">Every number on this site, and what backs it.</h1>
          <p className="lead">{LEDGER.length} claims from the nine case files, flattened into one table. Filter by evidence class to see exactly how much is checkable by you and how much is only my own record. Machine-readable copy: <a className="alink" href="/evidence.json">evidence.json</a>.</p>
          <LedgerTable claims={LEDGER} counts={LEDGER_COUNTS} />
        </div>
      </main>
      <Contact />
    </>
  );
}
