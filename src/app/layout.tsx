import type { Metadata } from 'next';
import { Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';

const noto = Noto_Sans_Bengali({ subsets: ['bengali', 'latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Bangladesh Food Map',
  description: 'How much of Bangladesh have you tasted?',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${noto.className} bg-white text-gray-900 antialiased`}>{children}</body>
    </html>
  );
}