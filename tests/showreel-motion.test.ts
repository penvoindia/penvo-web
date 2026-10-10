import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  createShowreelScrub,
  getShowreelBackdrop,
  getShowreelFrame,
  getShowreelProgress,
  isShowreelCovered,
  scrubEase,
  showreelPinDistance,
  showreelScale,
} from '@/src/components/home/showreel-motion';

describe('showreel settle progress', () => {
  // At 1440 × 900 the reference settles over the 189px before its pin at 604px.
  it.each([
    [300, 0],
    [415, 0],
    [509.5, 0.5],
    [604, 1],
    [2000, 1],
  ])('at scroll %d is %d', (scrollY, expected) => {
    expect(getShowreelProgress(scrollY, 604, 900)).toBeCloseTo(expected, 6);
  });

  it('settles at once without a viewport height', () => {
    expect(getShowreelProgress(0, 604, 0)).toBe(1);
  });
});

describe('showreel frame', () => {
  it('starts full size in place', () => {
    expect(getShowreelFrame(0, 900, 794)).toEqual({ scale: 1, y: 0 });
  });

  // The reference's measured end states at 1440 × 900, 1920 × 1080, and 1024 × 768.
  it.each([
    [900, 794, 53],
    [1080, 945, 67.5],
    [768, 564, 102],
  ])('centres the frame in a %dpx viewport', (viewport, frame, y) => {
    const result = getShowreelFrame(1, viewport, frame);
    expect(result.scale).toBeCloseTo(showreelScale, 10);
    expect(result.y).toBeCloseTo(y, 10);
  });

  it('is covered once the next section has scrolled the pin distance', () => {
    expect(isShowreelCovered(604 + 1259, 604, 900)).toBe(false);
    expect(isShowreelCovered(604 + 1260, 604, 900)).toBe(true);
  });
});

describe('showreel backdrop', () => {
  // At 1440 × 900 the reference recolours its page from 424px to 784px; these
  // are its measured shares of the way from white to #111111.
  it.each([
    [400, 0],
    [424, 0],
    [460, 0.1891],
    [532, 0.5084],
    [604, 0.7479],
    [676, 0.9118],
    [748, 0.9916],
    [784, 1],
    [1500, 1],
  ])('at scroll %d is %d', (scrollY, expected) => {
    expect(getShowreelBackdrop(scrollY, 604, 900)).toBeCloseTo(expected, 2);
  });

  it('changes at once without a viewport height', () => {
    expect(getShowreelBackdrop(603, 604, 0)).toBe(0);
    expect(getShowreelBackdrop(604, 604, 0)).toBe(1);
  });
});

describe('showreel scrub', () => {
  // GSAP expo.out, read from the reference's one-second scrub tween.
  it.each([
    [0, 0],
    [0.1, 0.5],
    [0.2, 0.75],
    [0.5, 0.96875],
    [1, 1],
  ])('eases %d to %d', (t, expected) => {
    expect(scrubEase(t)).toBeCloseTo(expected, 10);
  });

  it('jumps without easing', () => {
    const scrub = createShowreelScrub();
    scrub.jump(0.4);
    expect(scrub.sample(0)).toBe(0.4);
    expect(scrub.settled(0)).toBe(true);
  });

  it('catches up to a new target over one second', () => {
    const scrub = createShowreelScrub();
    scrub.target(1, 100);
    expect(scrub.sample(100)).toBe(0);
    expect(scrub.sample(200)).toBeCloseTo(0.5, 10);
    expect(scrub.settled(1099)).toBe(false);
    expect(scrub.sample(1100)).toBe(1);
    expect(scrub.settled(1100)).toBe(true);
  });

  it('restarts from the current value when the target moves', () => {
    const scrub = createShowreelScrub();
    scrub.target(1, 0);
    const midway = scrub.sample(100);
    scrub.target(0, 100);
    expect(scrub.sample(100)).toBeCloseTo(midway, 10);
    expect(scrub.sample(200)).toBeCloseTo(midway / 2, 10);
    expect(scrub.sample(1100)).toBe(0);
  });

  it('keeps easing when the target repeats', () => {
    const scrub = createShowreelScrub();
    scrub.target(1, 0);
    scrub.target(1, 500);
    expect(scrub.sample(500)).toBeCloseTo(scrubEase(0.5), 10);
  });

  it('applies targets at once without a duration', () => {
    const scrub = createShowreelScrub(0);
    scrub.target(0.7, 10);
    expect(scrub.sample(10)).toBe(0.7);
    expect(scrub.settled(10)).toBe(true);
  });
});

describe('showreel stylesheet contract', () => {
  const css = readFileSync(
    new URL('../src/components/home/HomeShowreel.module.css', import.meta.url),
    'utf8',
  ).replace(/\s+/g, '');
  const experience = readFileSync(
    new URL('../src/components/home/ShowreelExperience.tsx', import.meta.url),
    'utf8',
  ).replace(/\s+/g, '');

  it('pins for the pin distance, with the next section over the last 100vh', () => {
    const height = Math.round((1 + showreelPinDistance) * 100);
    expect(css).toContain(`height:${height}vh;`);
    expect(css).toContain('margin-bottom:-100vh;');
    expect(css).toContain('height:100vh;');
  });

  it('lets the recoloured page show behind testimonials and the reel only', () => {
    const block = (file: string) => {
      const rule = readFileSync(
        new URL(`../src/components/home/${file}`, import.meta.url),
        'utf8',
      )
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, '')
        .match(/(?:^|\})\.section\{[^}]*\}/)?.[0];
      expect(rule, file).toBeDefined();
      return rule ?? '';
    };
    expect(block('HomeTestimonials.module.css')).not.toContain('background');
    expect(block('HomeShowreel.module.css')).not.toContain('background');
    // Projects stays opaque, so it covers the white page as it scrolls over the reel.
    expect(block('HomeProjects.module.css')).toContain(
      'background:var(--color-background);',
    );
  });

  it("matches the reference frame's padding, width, and corners", () => {
    for (const rule of [
      'padding-inline:5%;',
      'padding-inline:4%;',
      'padding-inline:1%;',
      'max-width:105rem;',
      'aspect-ratio:16/9;',
      'border-radius:8px;',
      'border-radius:16px;',
    ]) {
      expect(css).toContain(rule);
    }
  });

  it('pins under the same media query that drives the motion', () => {
    const query = '(min-width:992px)and(prefers-reduced-motion:no-preference)';
    expect(css).toContain(`@media${query}{`);
    expect(experience).toContain(`'${query}'`);
  });
});
