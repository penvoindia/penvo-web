import { resolveSiteUrl } from '@/src/lib/env';

export const siteConfig = {
  name: 'Penvo',
  description: 'Penvo is a creative and digital agency based in Kerala, India.',
  locale: 'en-IN',
  url: resolveSiteUrl(),
} as const;
