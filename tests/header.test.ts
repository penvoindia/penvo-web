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
const designGuideCss = readFileSync(
  new URL('../app/design-guide/page.module.css', import.meta.url),
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
    expect(rootLayout).toContain('<div id="site-content">{children}</div>');
  });

  it('uses the approved typography roles and project action', () => {
    expect(headerSource).toContain('type-navigation');
    expect(headerSource).toContain(
      "import { Button, ButtonLink } from '@/src/components/ui/Button'",
    );
    expect(headerSource).toContain('<ButtonLink');
    expect(headerSource).toContain('variant="primary"');
    expect(headerSource).toContain('Start a project');
    expect(headerCss).toContain('--header-control-height: 46px');
    expect(headerCss).toContain(
      '--button-min-height: var(--header-control-height)',
    );
    expect(headerCss).toContain('--button-padding-block: 11px');
    expect(headerCss).not.toContain('--type-button-size: 14px');
    expect(headerCss).not.toContain('--type-button-line-height: 20px');
    expect(headerCss).not.toContain('--type-button-letter-spacing: -0.35px');
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

  it('uses a compact square instead of an underline for navigation state', () => {
    expect(headerSource).toContain(
      "import { usePathname } from 'next/navigation'",
    );
    expect(headerSource).toContain('aria-current={');
    expect(headerSource).toContain(
      "getNavigationCurrent(pathname, '/services')",
    );
    expect(
      headerSource.match(/className=\{styles\.navigationLabel\}/g),
    ).toHaveLength(2);
    expect(headerCss).toContain('--navigation-indicator-size: 14px');
    expect(headerCss).toContain(
      'padding-inline-end: var(--navigation-indicator-shift)',
    );
    expect(headerCss).toContain('width: var(--navigation-indicator-size)');
    expect(headerCss).toContain('height: var(--navigation-indicator-size)');
    expect(headerCss).toContain('transform: translateY(-50%) scaleX(0)');
    expect(headerCss).toContain('transform: translateY(-50%) scaleX(1)');
    expect(headerCss).toContain("[aria-current='page']");
    expect(headerCss).toContain("[aria-current='location']");
    expect(headerCss).toContain(
      '@media (hover: hover) and (pointer: fine) and (min-width: 1024px)',
    );
    expect(headerCss).toMatch(
      /\.navigationControl::before,\s*\.navigationLabel \{\s*transition: none;/s,
    );
    expect(headerCss).not.toContain('height: 1px');
    expect(headerCss).not.toContain('transition: width 900ms');
  });

  it('implements the services disclosure for pointer, keyboard, and touch input', () => {
    expect(headerSource).toContain('aria-controls={servicesMenuId}');
    expect(headerSource).toContain('aria-expanded={isServicesOpen}');
    expect(headerSource).toContain("event.pointerType !== 'mouse'");
    expect(headerSource).toContain('openedByHoverRef.current = true');
    expect(headerSource.match(/event\.pointerType !== 'mouse'/g)).toHaveLength(
      2,
    );
    expect(headerSource).toContain("servicesRegion?.matches(':hover')");
    expect(headerSource).toContain(
      'servicesRegion?.contains(document.activeElement)',
    );
    expect(headerSource).toContain("header.dataset.menuOpen === 'true'");
    expect(headerSource).toContain('servicesRegionIsActive');
    expect(headerSource).toContain("event.key !== 'Escape'");
    expect(headerSource).toContain("document.addEventListener('pointerdown'");
    expect(headerSource).toContain('servicesTriggerRef.current?.focus()');
    expect(headerSource).toContain('tabIndex={isServicesOpen ? 0 : -1}');
    expect(headerSource).not.toContain(
      'onPointerLeave={scheduleServicesMenuClose}',
    );
    expect(headerSource).not.toContain('onPointerEnter={clearCloseTimer}');
    expect(headerCss).toContain('.servicesTrigger::after');
    expect(headerCss).toContain('inset: -11px -12px');
  });

  it('matches the reference mega-menu structure without either arrow treatment', () => {
    expect(headerSource).toContain('View all services');
    expect(headerSource).toContain('aria-label="Penvo services"');
    expect(headerSource).toContain(
      'className={`${styles.serviceTitle} type-heading-7`}',
    );
    expect(headerSource).toContain(
      'className={`${styles.servicesOverviewTitle} type-heading-6`}',
    );
    expect(headerCss).toContain('width: min(736px, calc(100vw - 48px))');
    expect(headerCss).toContain('width: min(800px, calc(100vw - 48px))');
    expect(headerCss).toContain('padding: 30px');
    expect(headerCss).toContain('border-radius: 15px');
    expect(headerCss.match(/border-radius: 10px/g)).toHaveLength(3);
    expect(headerCss).toContain('width: 58.333%');
    expect(headerCss).toContain('width: 41.667%');
    expect(headerCss).toMatch(
      /\.servicesList \{[^}]*justify-content: space-between;/s,
    );
    expect(headerCss).toMatch(/\.serviceItem \{[^}]*flex: 0 0 auto;/s);
    expect(headerCss).toContain('padding: 12px 16px');
    expect(headerCss).toContain('justify-content: space-between');
    expect(headerCss).toContain('row-gap: 20px');
    expect(headerCss).toContain('padding: 22px');
    expect(headerCss).toContain('margin-bottom: 6px');
    expect(headerSource).not.toMatch(/arrow/i);
    expect(headerCss).not.toMatch(/menuPointer|optionArrow/i);
  });

  it('keeps a 15px visible gap below both header states', () => {
    expect(headerCss).toContain('top: 100%');
    expect(headerCss).toContain('padding-top: 51px');
    expect(headerCss).toContain(
      ".siteHeader[data-compact='true'] .servicesPopover",
    );
    expect(headerCss).toContain('padding-top: 42px');
  });

  it('dims and blurs the page behind the open services menu', () => {
    expect(headerSource).toContain('className={styles.menuBackdrop}');
    expect(headerSource).toContain('data-open={isServicesOpen}');
    expect(headerCss).toContain('backdrop-filter: blur(10px)');
    expect(headerCss).toContain(".menuBackdrop[data-open='true']");
  });

  it('is fixed across all breakpoints and hands off at tablet landscape', () => {
    expect(headerCss).toMatch(
      /\.siteHeader \{[^}]*position: fixed;[^}]*display: flex;/s,
    );
    expect(headerCss).toContain('@media (min-width: 1024px)');
    expect(headerCss).toContain('top: 0');
    expect(headerCss).toMatch(
      /@media \(min-width: 1024px\) \{\s*\.mobileActions,\s*\.mobileDrawer \{\s*display: none;/s,
    );
    expect(headerCss).toMatch(
      /\.navigation,\s*\.projectSlot \{\s*display: none;/s,
    );
    expect(headerCss).toMatch(
      /@media \(min-width: 1024px\)[\s\S]*?\.navigation \{\s*display: inline-flex;/,
    );
  });

  it('uses the responsive normal and compact header dimensions', () => {
    expect(headerCss).toMatch(/\.frame \{[^}]*height: 80px;/s);
    expect(headerCss).toMatch(
      /\.siteHeader\[data-compact='true'\] \.frame \{[^}]*width: min\(var\(--header-compact-width\), 99vw\);[^}]*height: 64px;[^}]*margin-top: 8px;/s,
    );
    expect(headerCss).toContain(
      '@media (min-width: 768px) and (max-width: 1023px)',
    );
    expect(headerCss).toMatch(
      /@media \(min-width: 768px\) and \(max-width: 1023px\)[\s\S]*?\.frame \{[^}]*height: 88px;/,
    );
    expect(headerCss).toMatch(
      /@media \(min-width: 768px\) and \(max-width: 1023px\)[\s\S]*?\.siteHeader\[data-compact='true'\] \.frame \{[^}]*height: 72px;[^}]*margin-top: 12px;/,
    );
    expect(designGuideCss).toContain('padding-top: 80px');
    expect(designGuideCss).toContain('padding-top: 88px');
    expect(designGuideCss).toContain('padding-top: 96px');
  });

  it('uses the shared Penvo button and reference hamburger geometry', () => {
    expect(headerSource).toContain('<Button');
    expect(headerSource).toContain('className={styles.mobileMenuToggle}');
    expect(headerSource).toContain('variant="secondary"');
    expect(headerSource).toContain('aria-controls={mobileMenuId}');
    expect(headerSource).toContain('aria-expanded={isMobileMenuOpen}');
    expect(headerSource).toContain("isMobileMenuOpen ? 'Close main menu'");
    expect(headerSource).toContain('<path d="M4 5h16" />');
    expect(headerSource).toContain('<path d="M4 12h16" />');
    expect(headerSource).toContain('<path d="M4 19h16" />');
    expect(headerSource).toContain('<path d="M18 6 6 18" />');
    expect(headerCss).toMatch(
      /\.mobileMenuToggle \{[^}]*--button-min-height: var\(--header-logo-height\);[^}]*width: var\(--header-control-height\);[^}]*height: var\(--header-logo-height\);/s,
    );
    expect(headerCss).toMatch(
      /\.mobileMenuGlyph \{[^}]*width: 20px;[^}]*height: 20px;/s,
    );
  });

  it('provides an accessible, scroll-safe mobile navigation disclosure', () => {
    expect(headerSource).toContain('aria-label="Mobile primary navigation"');
    expect(headerSource).toContain('aria-hidden={!isMobileMenuOpen}');
    expect(headerSource).toContain('inert={!isMobileMenuOpen}');
    expect(headerSource).toContain("event.key !== 'Escape'");
    expect(headerSource).toContain(
      'mobileMenuFirstLinkRef.current?.focus({ preventScroll: true })',
    );
    expect(headerSource).toContain(
      'mobileMenuTriggerRef.current?.focus({ preventScroll: true })',
    );
    expect(headerSource).toContain("document.getElementById('site-content')");
    expect(headerSource).toContain("siteContent.setAttribute('inert', '')");
    expect(headerSource).toContain("body.style.position = 'fixed'");
    expect(headerSource).toContain('window.scrollTo(0, scrollPosition)');
    expect(headerSource).not.toContain('restoreScroll');
    expect(headerCss).toContain('height: 100dvh');
    expect(headerCss).toContain('overscroll-behavior: contain');
    expect(headerCss).toContain('.siteHeader:focus-within');
  });

  it('keeps mobile drawer motion composited and removes it when requested', () => {
    expect(headerCss).toMatch(
      /\.mobileNavigationItem \{[^}]*opacity: 0;[^}]*transform: translateX\(-20px\);/s,
    );
    expect(headerCss).toContain('transition-delay: 80ms');
    expect(headerCss).toContain('transition-delay: 280ms');
    expect(headerCss).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\.mobileDrawer,[\s\S]*?transition: none;/,
    );
    expect(headerCss).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\.mobileDrawer\[data-open='true'\] \.mobileNavigationItem,[\s\S]*?transform: none;/,
    );
    const mobileDrawerRule =
      headerCss.match(/\.mobileDrawer \{([\s\S]*?)\n\}/)?.[1] ?? '';
    expect(mobileDrawerRule).not.toContain('backdrop-filter');
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
    expect(headerCss).toContain('--header-compact-width: 320px');
    expect(headerCss).toContain('--header-compact-width: 1120px');
    expect(headerCss).toContain(
      'width: min(var(--header-compact-width), 99vw)',
    );
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
    expect(headerCss).toContain('gap: 20px');
    expect(headerCss).toContain('gap: 30px');
  });

  it('keeps the logo, navigation, and project action vertically centered', () => {
    expect(headerCss).toContain('flex-wrap: nowrap');
    expect(headerCss).toContain('align-items: center');
    expect(headerCss).toMatch(
      /\.mobileMenuToggle \{[^}]*height: var\(--header-logo-height\);/s,
    );
    expect(headerCss).toMatch(
      /\.projectSlot \{[^}]*height: var\(--header-control-height\);/s,
    );
    expect(headerCss).toMatch(
      /\.brand \{[^}]*height: var\(--header-logo-height\);/s,
    );
    expect(headerCss).toMatch(
      /\.brandSlot \{[^}]*height: var\(--header-logo-height\);/s,
    );
    expect(headerCss).toMatch(
      /\.brandLogo \{[^}]*height: var\(--header-logo-height\);/s,
    );
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
