import type { Metadata } from 'next';
import Matcher from '@/components/Matcher';
import { Contact } from '@/components/Client';

export const metadata: Metadata = {
  title: 'Match a job description',
  description: 'Paste a job description and see which of Vikas Manjunath’s projects overlap with it, and which requirements are honestly not covered.',
  alternates: { canonical: '/match/' },
};

export default function Page() {
  return (
    <>
      <main id="main" className="sec" style={{ paddingTop: 120 }}>
        <div className="wrap">
          <p className="mono kicker">For recruiters</p>
          <h1 className="h2">Does my work fit your role? Check in ten seconds.</h1>
          <p className="lead">Paste a posting. The page compares its terms with the stacks and skills in my nine case files, shows the three closest projects, and lists the technologies you asked for that I have <b>not</b> used.</p>
          <Matcher />
        </div>
      </main>
      <Contact />
    </>
  );
}
