import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';
import { Hind_Siliguri, Tiro_Bangla } from 'next/font/google';
import './globals.css';
import VerifierHost from '@/components/VerifierHost';

const sans = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});
const serif = Tiro_Bangla({
  subsets: ['bengali', 'latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Bangladesh Food Map',
  description: 'তুমি বাংলাদেশের কতটা চেখেছ?',
  openGraph: {
    title: 'বাংলাদেশ ফুড ম্যাপ',
    description: 'তুমি বাংলাদেশের কতটা চেখেছ?',
    images: ['/og/default.png'],
    locale: 'bn_BD',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body className={`${sans.className} antialiased`}>
        <div className="botanical-backdrop" aria-hidden="true">
          <span className="banana-leaf banana-leaf-one" />
          <span className="banana-leaf banana-leaf-two" />
          <span className="banana-leaf banana-leaf-three" />
          <span className="banana-leaf banana-leaf-four" />
          <span className="banana-leaf banana-leaf-five" />
          <span className="banana-leaf banana-leaf-six" />
        </div>
        <div className="site-content">{children}</div>
        <VerifierHost />
      </body>
    </html>
  );
}
