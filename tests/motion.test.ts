import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const motionCss = readFileSync(
  new URL('../src/styles/motion.css', import.meta.url),
  'utf8',
);

describe('motion foundation', () => {
  it('defines shared timing and easing tokens', () => {
    expect(motionCss).toContain('--motion-duration-fast: 180ms');
    expect(motionCss).toContain('--motion-ease-standard:');
    expect(motionCss).toContain('--motion-ease-enter:');
    expect(motionCss).toContain('--motion-ease-exit:');
  });

  it('provides a reduced-motion mode', () => {
    expect(motionCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(motionCss).toContain('animation-iteration-count: 1 !important');
    expect(motionCss).toContain('scroll-behavior: auto !important');
  });
});
