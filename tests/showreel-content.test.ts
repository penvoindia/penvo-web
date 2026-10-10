import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { homeShowreel } from '@/src/components/home/showreel-content';

describe('home showreel content', () => {
  it('describes a 16:9 reel with an accessible name', () => {
    expect(homeShowreel.sources.length).toBeGreaterThan(0);
    expect(homeShowreel.width / homeShowreel.height).toBeCloseTo(16 / 9, 5);
    expect(homeShowreel.label.trim()).not.toBe('');
  });

  it('points at local video files', () => {
    for (const { src } of homeShowreel.sources) {
      const path = fileURLToPath(new URL(`../public${src}`, import.meta.url));
      expect(existsSync(path), src).toBe(true);
    }
  });

  it('uses the first frame instead of a separate poster', () => {
    expect(homeShowreel).not.toHaveProperty('poster');
    const experience = readFileSync(
      new URL('../src/components/home/ShowreelExperience.tsx', import.meta.url),
      'utf8',
    );
    expect(experience).toContain("'#t=0.001'");
    expect(experience).not.toContain('poster=');
  });
});
