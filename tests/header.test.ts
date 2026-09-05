import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const headerSource = readFileSync(
  new URL('../src/components/layout/SiteHeader.tsx', import.meta.url),
  'utf8',
);
const headerCss = readFileSync(
  new URL('../src/components/layout/SiteHeader.module.css', import.meta.url),
  'utf8',
);
const rootLayout = readFileSync(
  new URL('../app/layout.tsx', import.meta.url),
  'utf8',
);
const orangeBrandIcon = readFileSync(
  new URL('../public/brand-icon-orange.svg', import.meta.url),
  'utf8',
);

describe('Penvo site header', () => {
  it('is mounted globally from the root layout', () => {
    expect(rootLayout).toContain(
      "import { SiteHeader } from '@/src/components/layout/SiteHeader'",
    );
    expect(rootLayout).toContain('<SiteHeader />');
  });

  it('uses the approved typography roles and project action', () => {
    expect(headerSource).toContain('type-navigation');
    expect(headerSource).toContain(
      "import { ButtonLink } from '@/src/components/ui/Button'",
    );
    expect(headerSource).toContain('<ButtonLink');
    expect(headerSource).toContain('variant="primary"');
    expect(headerSource).toContain('Start a project');
    expect(headerCss).toContain('--header-control-height: 46px');
    expect(headerCss).toContain(
      '--button-min-height: var(--header-control-height)',
    );
    expect(headerCss).toContain('--button-padding-block: 13px');
  });

  it('uses the supplied primary-orange Penvo brand icon', () => {
    expect(headerSource).toContain("import Image from 'next/image'");
    expect(headerSource).toContain('src="/brand-icon-orange.svg"');
    expect(headerSource).toContain('aria-label="Penvo home"');
    expect(headerSource).toContain('alt=""');
    expect(headerSource).not.toMatch(/>\s*Penvo\s*</);
    expect(headerCss).toContain('--header-logo-height: 40px');
    expect(headerCss).toContain('height: var(--header-logo-height)');
    expect(orangeBrandIcon.match(/fill="#FF400C"/g)).toHaveLength(4);
  });

  it('provides the desktop navigation structure', () => {
    for (const label of ['Work', 'About', 'Blog', 'Contact']) {
      expect(headerSource).toContain(`label: '${label}'`);
    }
    expect(headerSource).toContain('Services');
    expect(headerSource).toContain('aria-label="Primary navigation"');
  });

  it('implements the services disclosure for pointer, keyboard, and touch input', () => {
    expect(headerSource).toContain('aria-controls={servicesMenuId}');
    expect(headerSource).toContain('aria-expanded={isServicesOpen}');
    expect(headerSource).toContain("event.pointerType !== 'mouse'");
    expect(headerSource).toContain('openedByHoverRef.current = true');
    expect(headerSource).toContain("event.key !== 'Escape'");
    expect(headerSource).toContain("document.addEventListener('pointerdown'");
    expect(headerSource).toContain('servicesTriggerRef.current?.focus()');
    expect(headerSource).toContain('tabIndex={isServicesOpen ? 0 : -1}');
  });

  it('matches the reference mega-menu structure without either arrow treatment', () => {
    expect(headerSource).toContain('View all services');
    expect(headerSource).toContain('aria-label="Penvo services"');
    expect(headerCss).toContain('width: min(704px, calc(100vw - 48px))');
    expect(headerCss).toContain('padding: 32px');
    expect(headerCss).toContain('border-radius: 24px');
    expect(headerCss).toContain('width: 58.333%');
    expect(headerCss).toContain('width: 41.667%');
    expect(headerSource).not.toMatch(/arrow/i);
    expect(headerCss).not.toMatch(/menuPointer|optionArrow/i);
  });

  it('keeps a 15px visible gap below both header states', () => {
    expect(headerCss).toContain('top: 100%');
    expect(headerCss).toContain('padding-top: 53px');
    expect(headerCss).toContain(
      ".siteHeader[data-compact='true'] .servicesPopover",
    );
    expect(headerCss).toContain('padding-top: 44px');
  });

  it('dims and blurs the page behind the open services menu', () => {
    expect(headerSource).toContain('className={styles.menuBackdrop}');
    expect(headerSource).toContain('data-open={isServicesOpen}');
    expect(headerCss).toContain('backdrop-filter: blur(10px)');
    expect(headerCss).toContain(".menuBackdrop[data-open='true']");
  });

  it('is fixed only from tablet landscape upward', () => {
    expect(headerCss).toContain('.siteHeader {\n  display: none;');
    expect(headerCss).toContain('@media (min-width: 1024px)');
    expect(headerCss).toContain('position: fixed');
    expect(headerCss).toContain('top: 0');
  });

  it('gives the normal header exact 50px internal side padding', () => {
    expect(headerCss).toContain('width: 100%');
    expect(headerCss).toContain('padding: 24px 50px');
    expect(headerCss).toContain('margin-left: 0');
    expect(headerCss).toContain('padding-right: 0');
    expect(headerCss).toContain('height: 96px');
    expect(headerCss).toContain('padding-block: 0');
    expect(headerCss).toContain('border-radius: 0');
  });

  it('uses the approved compact header width and internal spacing', () => {
    expect(headerCss).toContain('width: min(60rem, 99vw)');
    expect(headerCss).toContain('height: 78px');
    expect(headerCss).toContain('margin-top: 12px');
    expect(headerCss).toContain('border-radius: 15px');
    expect(headerCss).toContain('padding: 16px 24px');
    expect(headerCss).not.toContain(
      ".siteHeader[data-compact='true'] .brandSlot",
    );
    expect(headerCss).not.toContain(
      ".siteHeader[data-compact='true'] .projectSlot",
    );
    expect(headerCss).toContain('gap: 28px');
    expect(headerCss).toContain('gap: 40px');
  });

  it('keeps the logo, navigation, and project action vertically centered', () => {
    expect(headerCss).toContain('flex-wrap: nowrap');
    expect(headerCss).toContain('align-items: center');
    expect(
      headerCss.match(/^\s*height: var\(--header-control-height\);$/gm),
    ).toHaveLength(1);
    expect(
      headerCss.match(/^\s*height: var\(--header-logo-height\);$/gm),
    ).toHaveLength(3);
  });

  it('recreates the compact, hide, and return scroll behavior efficiently', () => {
    expect(headerSource).toContain('scrollPosition > 10');
    expect(headerSource).toContain('scrollPosition > 400 && scrollingDown');
    expect(headerSource).toContain('window.requestAnimationFrame');
    expect(headerSource).toContain('{ passive: true }');
    expect(headerCss).toContain(".siteHeader[data-hidden='true']");
    expect(headerCss).toContain('transform: translateY(-112px)');
  });

  it('does not retain the reference-specific connected arrow button', () => {
    expect(headerSource).not.toContain('projectLabel');
    expect(headerSource).not.toContain('projectIcon');
    expect(headerCss).not.toContain('.projectLabel');
    expect(headerCss).not.toContain('.projectIcon');
  });

  it('uses Penvo tokens without hard-coded colours', () => {
    expect(headerCss).toContain('var(--color-attractive-black)');
    expect(headerCss).toContain('var(--color-text-primary)');
    expect(headerCss).toContain('background: var(--color-bright-orange)');
    expect(headerCss).not.toMatch(/#[\da-f]{3,8}\b/i);
  });

  it('limits its client behavior to the scroll-responsive header', () => {
    expect(headerSource).toContain("'use client'");
    expect(headerSource).not.toContain('gsap');
  });
});
