import type { Metadata } from 'next';

import { HomeHero } from '@/src/components/home/HomeHero';
import { HomeProcess } from '@/src/components/home/HomeProcess';
import { HomeServices } from '@/src/components/home/HomeServices';
import { HomeWorkTogether } from '@/src/components/home/HomeWorkTogether';
import { HomeBuild } from '@/src/components/home/HomeBuild';
import { siteConfig } from '@/src/config/site';

export const metadata: Metadata = {
  title: 'Penvo — Creative & Digital Agency',
  description: siteConfig.description,
};

export default function HomePage() {
  return (
    <main>
      <HomeHero />
      <HomeBuild />
      <HomeServices />
      <HomeWorkTogether />
      <HomeProcess />
    </main>
  );
}
