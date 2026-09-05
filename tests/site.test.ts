import { describe, expect, it } from 'vitest';

import { siteConfig } from '@/src/config/site';

describe('Penvo product brief', () => {
  it('contains only the approved company identity', () => {
    expect(siteConfig.name).toBe('Penvo');
    expect(siteConfig.description).toBe(
      'Penvo is a creative and digital agency based in Kerala, India.',
    );
    expect(siteConfig.locale).toBe('en-IN');
  });
});
