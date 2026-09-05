import { describe, expect, it } from 'vitest';

import { resolveSiteUrl } from '@/src/lib/env';

describe('site URL', () => {
  it('uses localhost when no public URL exists', () => {
    expect(resolveSiteUrl(undefined).href).toBe('http://localhost:3000/');
  });

  it('accepts HTTPS origins', () => {
    expect(resolveSiteUrl('https://penvo.example').origin).toBe(
      'https://penvo.example',
    );
  });

  it('rejects unsupported protocols', () => {
    expect(() => resolveSiteUrl('javascript:alert(1)')).toThrow(
      'NEXT_PUBLIC_SITE_URL must use HTTP or HTTPS.',
    );
  });
});
