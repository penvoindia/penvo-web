import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const layoutSource = readFileSync(
  new URL('../app/layout.tsx', import.meta.url),
  'utf8',
);
const typographyCss = readFileSync(
  new URL('../src/styles/typography.css', import.meta.url),
  'utf8',
);

const typographyRoles = [
  'display-mega',
  'display-giant',
  'display-huge',
  'section-title',
  'heading-1',
  'heading-2',
  'heading-3',
  'heading-4',
  'heading-5',
  'heading-6',
  'heading-7',
  'lead',
  'body-large',
  'body',
  'body-small',
  'caption',
  'eyebrow',
  'label',
  'button',
  'navigation',
  'micro',
] as const;

describe('Penvo typography', () => {
  it('loads the approved and available Google variable fonts', () => {
    expect(layoutSource).toContain("from 'next/font/google'");
    expect(layoutSource).toContain('Bricolage_Grotesque({');
    expect(layoutSource).toContain('Hanken_Grotesk({');
    expect(layoutSource).toContain('Pixelify_Sans({');
    expect(layoutSource).toContain("variable: '--font-pixelify-sans'");
    expect(layoutSource.match(/weight: 'variable'/g)).toHaveLength(3);
    expect(layoutSource.match(/display: 'swap'/g)).toHaveLength(3);
    expect(layoutSource).toContain('preload: false');
  });

  it('maps primary and secondary roles to the approved families', () => {
    expect(typographyCss).toContain(
      '--font-primary: var(--font-bricolage-grotesque)',
    );
    expect(typographyCss).toContain(
      '--font-secondary: var(--font-hanken-grotesk)',
    );
  });

  it('uses Hanken Grotesk at 500 for buttons and navigation options', () => {
    for (const role of ['button', 'navigation']) {
      const block = typographyCss.match(
        new RegExp(`\\.type-${role} \\{([^}]+)\\}`),
      )?.[1];

      expect(block).toContain('font-family: var(--font-secondary)');
      expect(block).toContain('font-weight: var(--font-weight-medium)');
    }
  });

  it('shares the approved interface metrics across buttons and navigation', () => {
    expect(typographyCss).toContain('--type-button-size: 16px');
    expect(typographyCss).toContain('--type-button-line-height: 24px');
    expect(typographyCss).toContain('--type-button-letter-spacing: -0.4px');
    expect(typographyCss).toContain('--type-navigation-size: 16px');
    expect(typographyCss).toContain('--type-navigation-line-height: 24px');
    expect(typographyCss).toContain('--type-navigation-letter-spacing: -0.4px');
  });

  it('keeps the type system free of rem and em measurements', () => {
    expect(typographyCss).not.toMatch(/-?\d*\.?\d+(?:rem|em)\b/);
  });

  it('defines the four ordered Penvo viewport tiers', () => {
    const portrait = typographyCss.indexOf('@media (min-width: 768px)');
    const landscape = typographyCss.indexOf('@media (min-width: 1024px)');
    const desktop = typographyCss.indexOf('@media (min-width: 1280px)');

    expect(portrait).toBeGreaterThan(-1);
    expect(landscape).toBeGreaterThan(portrait);
    expect(desktop).toBeGreaterThan(landscape);
  });

  it('preserves the reference display envelope across those tiers', () => {
    expect(typographyCss).toContain('clamp(48px, 11vw, 84px)');
    expect(typographyCss).toContain('clamp(141px, 11vw, 192px)');
    expect(typographyCss).toContain('clamp(40px, 7.5vw, 58px)');
    expect(typographyCss).toContain('clamp(96px, 7.5vw, 112px)');
    expect(typographyCss).toContain('clamp(32px, 5vw, 38px)');
    expect(typographyCss).toContain('clamp(64px, 5vw, 72px)');
  });

  it('scales heading and lead roles at the breakpoint layer', () => {
    expect(typographyCss).toContain('--type-heading-1-size: 40px');
    expect(typographyCss).toContain('--type-heading-1-size: 48px');
    expect(typographyCss).toContain('--type-heading-1-size: 52px');
    expect(typographyCss).toContain('--type-heading-1-size: 60px');
    expect(typographyCss).toContain('--type-lead-size: 20px');
    expect(typographyCss).toContain('--type-lead-size: 22px');
    expect(typographyCss).toContain('--type-lead-size: 24px');
  });

  it('defines Heading 7 as the responsive 18px compact title role', () => {
    expect(typographyCss).toContain('--type-heading-7-size: 16px');
    expect(typographyCss.match(/--type-heading-7-size: 18px/g)).toHaveLength(2);
    expect(typographyCss).toContain('--type-heading-7-line-height: 26px');
    expect(typographyCss).toContain('--type-heading-7-letter-spacing: -0.45px');
  });

  it.each(typographyRoles)(
    'declares every required property for .type-%s',
    (role) => {
      const block = typographyCss.match(
        new RegExp(`\\.type-${role} \\{([^}]+)\\}`),
      )?.[1];

      expect(block).toBeDefined();
      expect(block).toContain('font-family:');
      expect(block).toContain('font-size:');
      expect(block).toContain('font-weight:');
      expect(block).toContain('letter-spacing:');
      expect(block).toContain('line-height:');
    },
  );
});
