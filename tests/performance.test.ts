import { describe, expect, it } from 'vitest';

import { performanceBudget } from '@/src/config/performance';

describe('performance budget', () => {
  it('uses Core Web Vitals good thresholds', () => {
    expect(performanceBudget.largestContentfulPaintMs).toBeLessThanOrEqual(
      2_500,
    );
    expect(performanceBudget.interactionToNextPaintMs).toBeLessThanOrEqual(200);
    expect(performanceBudget.cumulativeLayoutShift).toBeLessThanOrEqual(0.1);
  });

  it('caps initial page assets', () => {
    expect(performanceBudget.initialRouteJavaScriptKb).toBeLessThanOrEqual(120);
    expect(performanceBudget.initialCssKb).toBeLessThanOrEqual(40);
  });
});
