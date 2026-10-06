import { describe, expect, it } from 'vitest';

import {
  getWorkTogetherDuration,
  WORK_TOGETHER_FALLBACK_DURATION,
} from '@/src/components/home/work-together-motion';

describe('Let’s work together marquee timing', () => {
  it('preserves the reference speed as the phrase width changes', () => {
    expect(getWorkTogetherDuration(1116)).toBeCloseTo(12.4);
    expect(getWorkTogetherDuration(750)).toBeCloseTo(8.333, 3);
  });

  it('keeps narrow or unavailable measurements usable', () => {
    expect(getWorkTogetherDuration(200)).toBe(6);
    expect(getWorkTogetherDuration(0)).toBe(WORK_TOGETHER_FALLBACK_DURATION);
    expect(getWorkTogetherDuration(Number.NaN)).toBe(
      WORK_TOGETHER_FALLBACK_DURATION,
    );
  });
});
