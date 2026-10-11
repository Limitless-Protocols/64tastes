import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';
import { Hind_Siliguri, Tiro_Bangla } from 'next/font/google';
import './globals.css';

// Style guide §3: Tiro Bangla is the serif (italics for English asides),
// Hind Siliguri the UI family — Bangla first, English second.
// The variables feed --serif / --sans in globals.css.
const hind = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-hind',
});
const tiro = Tiro_Bangla({
  subsets: ['bengali', 'latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-tiro',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'খাবার বুক · The Khabar Book',
  description: 'তুমি বাংলাদেশের কতটা চেখেছ? ৬৪ জেলার খাবারের মানচিত্র।',
  openGraph: {
    title: 'খাবার বুক · The Khabar Book',
    description: 'তুমি বাংলাদেশের কতটা চেখেছ? ৬৪ জেলার খাবারের মানচিত্র।',
    images: ['/og/bangladesh-food-map-post.png'],
    locale: 'bn_BD',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${hind.variable} ${tiro.variable}`}>
      <body>{children}</body>
    </html>
  );
}
