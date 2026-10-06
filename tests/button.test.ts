import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const buttonSource = readFileSync(
  new URL('../src/components/ui/Button.tsx', import.meta.url),
  'utf8',
);
const buttonCss = readFileSync(
  new URL('../src/components/ui/Button.module.css', import.meta.url),
  'utf8',
);
const guideSource = readFileSync(
  new URL('../app/design-guide/page.tsx', import.meta.url),
  'utf8',
);

describe('Penvo button', () => {
  it('preserves the approved button typography role', () => {
    expect(buttonSource).toContain(
      "styles.button, variantClass, 'type-button', className",
    );
  });

  it('defaults to a safe non-submitting button type', () => {
    expect(buttonSource).toContain("type = 'button'");
  });

  it('uses the Rig-inspired chamfered shape and accessible touch height', () => {
    expect(buttonCss).toContain('--button-outline-width: 1px');
    expect(buttonCss).toContain('--button-chamfer-size: 14px');
    expect(buttonCss).toContain('--button-outline-ring: polygon(');
    expect(buttonCss).toContain('evenodd');
    expect(buttonCss).toContain('display: inline-flex');
    expect(buttonCss).toContain('gap: 8px');
    expect(buttonCss).toContain('min-height: var(--button-min-height, 50px)');
    expect(buttonCss).toContain('var(--button-padding-block, 13px)');
    expect(buttonCss).toContain('var(--button-padding-inline, 30px)');
    expect(buttonCss).toContain('clip-path: polygon(');
  });

  it('provides primary and secondary variants', () => {
    expect(buttonSource).toContain(
      "export type ButtonVariant = 'primary' | 'secondary'",
    );
    expect(buttonSource).toContain("variant = 'primary'");
    expect(buttonSource).toContain("variant === 'primary'");
  });

  it('provides a semantic link version for navigation actions', () => {
    expect(buttonSource).toContain('export function ButtonLink');
    expect(buttonSource).toContain('<Link');
    expect(buttonCss).toContain('text-decoration: none');
  });

  it('shares one stored internal structure between buttons and button links', () => {
    expect(buttonSource).toContain('function ButtonContents');
    expect(buttonSource).toContain('className={styles.outline}');
    expect(buttonSource).toContain('className={styles.surface}');
    expect(buttonSource.match(/<ButtonContents>/g)).toHaveLength(2);
  });

  it('uses only the approved orange and black brand tokens', () => {
    expect(buttonCss).toContain(
      '--button-outline-color: var(--color-bright-orange)',
    );
    expect(buttonCss).toContain(
      '--button-surface-color: var(--color-bright-orange)',
    );
    expect(buttonCss).toContain('--button-text: var(--color-pure-black)');
    expect(buttonCss).toContain('--button-text: var(--color-bright-orange)');
    expect(buttonCss).not.toContain('var(--color-pink-affair)');
    expect(buttonCss).not.toMatch(/#[\da-f]{3,8}\b/i);
  });

  it('pairs the filled primary and transparent secondary states', () => {
    expect(buttonCss).toContain('background: transparent');
    expect(buttonCss).toContain(
      '.primary .surface {\n  clip-path: var(--button-surface-full)',
    );
    expect(buttonCss).toContain(
      '.secondary .surface {\n  clip-path: var(--button-surface-collapsed)',
    );
    expect(buttonCss).toContain(
      '.primary:where(:hover, :focus-visible):not(:disabled) .surface',
    );
    expect(buttonCss).toContain(
      '.secondary:where(:hover, :focus-visible):not(:disabled) .surface',
    );
    expect(buttonCss).toContain('color: var(--button-hover-text)');
  });

  it('uses the supplied reveal timing on hover and hover removal', () => {
    expect(buttonCss).toContain('color 250ms ease');
    expect(buttonCss).toContain('transition: clip-path 500ms ease');
    expect(buttonCss).toContain('transition-duration: 200ms');
    expect(buttonCss).toContain('color: var(--button-hover-text)');
  });

  it('supports hover, keyboard focus, disabled, and forced-colour states', () => {
    expect(buttonCss).toContain(
      ':where(:hover, :focus-visible):not(:disabled)',
    );
    expect(buttonCss).toContain('.button:disabled');
    expect(buttonCss).toContain('@media (forced-colors: active)');
  });

  it('is visible on the temporary design guide', () => {
    expect(guideSource).toContain(
      "import { Button } from '@/src/components/ui/Button'",
    );
    expect(guideSource).toContain('<Button>View project</Button>');
    expect(guideSource).toContain(
      '<Button variant="secondary">Explore Penvo</Button>',
    );
  });
});
