import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';
import { Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';
import VerifierHost from '@/components/VerifierHost';

const noto = Noto_Sans_Bengali({ subsets: ['bengali', 'latin'], display: 'swap' });

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
    <html lang="en">
      <body className={`${noto.className} bg-white text-gray-900 antialiased`}>
        {children}
        <VerifierHost />
      </body>
    </html>
  );
}