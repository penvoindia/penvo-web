import type { Metadata } from 'next';

import { HomeHero } from '@/src/components/home/HomeHero';
import { HomeContact } from '@/src/components/home/HomeContact';
import { HomeProcess } from '@/src/components/home/HomeProcess';
import { HomeProjects } from '@/src/components/home/HomeProjects';
import { HomeServices } from '@/src/components/home/HomeServices';
import { HomeTestimonials } from '@/src/components/home/HomeTestimonials';
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
      <HomeTestimonials />
      <HomeProjects />
      <HomeContact />
    </main>
  );
}
