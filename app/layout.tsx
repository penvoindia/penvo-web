import type { Metadata } from 'next';
import { Bricolage_Grotesque, Hanken_Grotesk } from 'next/font/google';

import { SiteHeader } from '@/src/components/layout/SiteHeader';
import { siteConfig } from '@/src/config/site';
import '@/src/styles/foundation.css';
import '@/src/styles/colors.css';
import '@/src/styles/motion.css';
import '@/src/styles/layout.css';
import '@/src/styles/typography.css';

const bricolageGrotesque = Bricolage_Grotesque({
  axes: ['opsz', 'wdth'],
  adjustFontFallback: true,
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
  preload: true,
  subsets: ['latin'],
  variable: '--font-bricolage-grotesque',
  weight: 'variable',
});

const hankenGrotesk = Hanken_Grotesk({
  adjustFontFallback: true,
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
  preload: true,
  subsets: ['latin'],
  variable: '--font-hanken-grotesk',
  weight: 'variable',
});

export const metadata: Metadata = {
  metadataBase: siteConfig.url,
  title: siteConfig.name,
  description: siteConfig.description,
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${bricolageGrotesque.variable} ${hankenGrotesk.variable}`}
      lang={siteConfig.locale}
    >
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
