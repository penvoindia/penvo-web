import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const rootLayout = readFileSync(
  new URL('../app/layout.tsx', import.meta.url),
  'utf8',
);
const layoutCss = readFileSync(
  new URL('../src/styles/layout.css', import.meta.url),
  'utf8',
);

describe('Penvo layout system', () => {
  it('loads the shared layout foundation globally', () => {
    expect(rootLayout).toContain("import '@/src/styles/layout.css'");
  });

  it('preserves the wide frame and aligns the desktop gutter with the header', () => {
    expect(layoutCss).toContain('--layout-max-width: 1700px');
    expect(layoutCss).toContain('--layout-gutter: clamp(20px, 5vw, 38px)');
    expect(layoutCss).toContain('--layout-gutter: 50px');
  });

  it('defines the four ordered project viewport tiers', () => {
    const portrait = layoutCss.indexOf('@media (min-width: 768px)');
    const landscape = layoutCss.indexOf('@media (min-width: 1024px)');
    const desktop = layoutCss.indexOf('@media (min-width: 1280px)');

    expect(portrait).toBeGreaterThan(-1);
    expect(landscape).toBeGreaterThan(portrait);
    expect(desktop).toBeGreaterThan(landscape);
  });

  it('uses the intended responsive grid progression', () => {
    expect(layoutCss.match(/--layout-grid-columns: 4;/g)).toHaveLength(1);
    expect(layoutCss.match(/--layout-grid-columns: 8;/g)).toHaveLength(1);
    expect(layoutCss.match(/--layout-grid-columns: 12;/g)).toHaveLength(2);
  });

  it.each([
    'layout-container',
    'layout-section',
    'layout-grid',
    'layout-stack',
    'layout-cluster',
    'layout-copy',
    'layout-viewport',
  ])('exposes the .%s primitive', (className) => {
    expect(layoutCss).toContain(`.${className} {`);
  });
});
