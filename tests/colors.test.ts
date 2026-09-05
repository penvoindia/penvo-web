import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const colorsCss = readFileSync(
  new URL('../src/styles/colors.css', import.meta.url),
  'utf8',
);

const approvedPalette = [
  ['bright-orange', '#ff400c'],
  ['pink-affair', '#ffefe8'],
  ['full-white', '#ffffff'],
  ['concrete', '#f2f2f2'],
  ['smooth-grey', '#cccccc'],
  ['super-grey', '#999999'],
  ['attractive-black', '#222222'],
  ['pure-black', '#000000'],
] as const;

describe('Penvo color system', () => {
  it.each(approvedPalette)('preserves the %s brand value', (name, value) => {
    expect(colorsCss).toContain(`--color-${name}: ${value}`);
  });

  it('contains no unapproved hex colors', () => {
    const usedHexValues = [
      ...new Set(
        colorsCss.match(/#[\da-f]{6}/gi)?.map((hex) => hex.toLowerCase()),
      ),
    ].sort();
    const approvedHexValues = approvedPalette.map(([, value]) => value).sort();

    expect(usedHexValues).toEqual(approvedHexValues);
  });

  it('maps the dark theme to the approved foundation colors', () => {
    expect(colorsCss).toContain('--color-background: var(--color-pure-black)');
    expect(colorsCss).toContain(
      '--color-surface-secondary: var(--color-attractive-black)',
    );
    expect(colorsCss).toContain(
      '--color-text-primary: var(--color-full-white)',
    );
    expect(colorsCss).toContain('color-scheme: dark');
  });

  it('uses accessible foreground colors for actions and selection', () => {
    expect(colorsCss).toContain(
      '--color-action-primary-foreground: var(--color-pure-black)',
    );
    expect(colorsCss).toContain(
      '--color-selection-foreground: var(--color-pure-black)',
    );
    expect(colorsCss).toContain(
      '--color-focus-ring: var(--color-bright-orange)',
    );
  });
});
