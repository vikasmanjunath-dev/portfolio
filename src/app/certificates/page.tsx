import type { Metadata } from 'next';
import { CERT_COUNT, COURSE_COUNT, CERT_IMAGES, ATTENDING } from '@/content/certs';
import CertGallery from '@/components/CertGallery';
import { Contact } from '@/components/Client';

export const metadata: Metadata = {
  title: 'Certificates',
  description: `${CERT_COUNT} participation certificates and ${COURSE_COUNT} course certificates, each with its image, event or provider and date.`,
  alternates: { canonical: '/certificates/' },
};

export default function Page() {
  return (
    <>
      <main id="main" className="sec" style={{ paddingTop: 120 }}>
        <div className="wrap">
          <p className="mono kicker">Certificates</p>
          <h1 className="h2">Every certificate, with its photo.</h1>
          <p className="lead">{CERT_COUNT} participation certificates from hackathons, expos and masterclasses (none is a win) and {COURSE_COUNT} course completion certificates. {CERT_IMAGES} of {CERT_COUNT + COURSE_COUNT} show the certificate image. Each was first posted on my LinkedIn, and the images are cut from those posts.</p>
          <p className="lead" style={{ fontSize: '.88rem' }}>Also attending: {ATTENDING}</p>
          <CertGallery />
        </div>
      </main>
      <Contact />
    </>
  );
}
