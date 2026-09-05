import { describe, expect, it } from 'vitest';

import { securityHeaders } from '@/src/config/security';

describe('security headers', () => {
  it('prevents MIME sniffing and framing', () => {
    expect(securityHeaders).toContainEqual({
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    });
    expect(securityHeaders).toContainEqual({
      key: 'X-Frame-Options',
      value: 'DENY',
    });
  });

  it('disables unused device capabilities', () => {
    expect(securityHeaders).toContainEqual({
      key: 'Permissions-Policy',
      value: 'camera=(), geolocation=(), microphone=()',
    });
  });
});
