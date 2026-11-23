import Dive from '@/components/Dive';
import Labs from '@/components/Labs';
import Constellation from '@/components/Constellation';
import { Ticker, Thesis, Work, Method, Decisions, About, Faq } from '@/components/Sections';
import { Numbers, Writing, Contact } from '@/components/Client';
import BuildLog from '@/components/BuildLog';
import Audience from '@/components/Audience';
import Testimonials from '@/components/Testimonials';

export default function Page() {
  return (
    <main id="main">
      <Dive />
      <Audience />
      <Ticker />
      <Thesis />
      <Work />
      <Labs />
      <Constellation />
      <Numbers />
      <Method />
      <Decisions />
      <BuildLog />
      <Writing />
      <About />
      <Testimonials />
      <Faq />
      <Contact />
    </main>
  );
}
