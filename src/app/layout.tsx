import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';
import { Hind_Siliguri } from 'next/font/google';
import './globals.css';

// Style guide: Hind Siliguri is the one family for Bangla and Latin.
// Noto Sans Bengali stays as the CSS fallback in --font (globals.css).
const hind = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
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
    <html lang="en">
      <body className={`${hind.className} bg-white text-gray-900 antialiased`}>{children}</body>
    </html>
  );
}