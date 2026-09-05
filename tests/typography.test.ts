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
  it('loads both approved Google variable fonts', () => {
    expect(layoutSource).toContain(
      "import { Bricolage_Grotesque, Hanken_Grotesk } from 'next/font/google'",
    );
    expect(layoutSource).toContain('Bricolage_Grotesque({');
    expect(layoutSource).toContain('Hanken_Grotesk({');
    expect(layoutSource.match(/weight: 'variable'/g)).toHaveLength(2);
    expect(layoutSource.match(/display: 'swap'/g)).toHaveLength(2);
  });

  it('maps primary and secondary roles to the approved families', () => {
    expect(typographyCss).toContain(
      '--font-primary: var(--font-bricolage-grotesque)',
    );
    expect(typographyCss).toContain(
      '--font-secondary: var(--font-hanken-grotesk)',
    );
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
