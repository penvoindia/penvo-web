'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button, ButtonLink } from '@/src/components/ui/Button';

import styles from './SiteHeader.module.css';

const navigation = [
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
] as const;

const mobileNavigation = [
  { href: '/services', label: 'Services' },
  ...navigation,
] as const;

const services = [
  {
    description: 'Build a clear, memorable foundation for your business.',
    href: '/services/brand-strategy',
    label: 'Brand Strategy',
  },
  {
    description: 'Create an identity people recognise and remember.',
    href: '/services/brand-identity',
    label: 'Brand Identity',
  },
  {
    description: 'Turn business goals into useful digital experiences.',
    href: '/services/web-design',
    label: 'Web Design',
  },
  {
    description: 'Ship fast, durable websites built for long-term growth.',
    href: '/services/web-development',
    label: 'Web Development',
  },
  {
    description: 'Connect creative ideas with measurable digital growth.',
    href: '/services/digital-growth',
    label: 'Digital Growth',
  },
] as const;

const servicesMenuId = 'penvo-services-menu';
const mobileMenuId = 'penvo-mobile-menu';

function getNavigationCurrent(pathname: string, href: string) {
  if (pathname === href) return 'page';
  if (pathname.startsWith(`${href}/`)) return 'location';

  return undefined;
}

function MobileMenuIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={styles.mobileMenuGlyph}
      data-open={isOpen}
    >
      <svg
        className={styles.mobileMenuIcon}
        fill="none"
        focusable="false"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M4 5h16" />
        <path d="M4 12h16" />
        <path d="M4 19h16" />
      </svg>
      <svg
        className={styles.mobileMenuCloseIcon}
        fill="none"
        focusable="false"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileMenuFirstLinkRef = useRef<HTMLAnchorElement>(null);
  const servicesRegionRef = useRef<HTMLLIElement>(null);
  const servicesTriggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const openedByHoverRef = useRef(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current === null) return;

    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const openServicesMenu = useCallback(() => {
    clearCloseTimer();
    setIsServicesOpen(true);
  }, [clearCloseTimer]);

  const closeServicesMenu = useCallback(() => {
    clearCloseTimer();
    setIsServicesOpen(false);
  }, [clearCloseTimer]);

  const scheduleServicesMenuClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      const servicesRegion = servicesRegionRef.current;

      if (
        servicesRegion?.matches(':hover') ||
        servicesRegion?.contains(document.activeElement)
      ) {
        closeTimerRef.current = null;
        return;
      }

      setIsServicesOpen(false);
      closeTimerRef.current = null;
    }, 160);
  }, [clearCloseTimer]);

  const openMobileMenu = useCallback(() => {
    closeServicesMenu();

    if (headerRef.current) {
      headerRef.current.dataset.hidden = 'false';
    }

    setIsMobileMenuOpen(true);
  }, [closeServicesMenu]);

  const closeMobileMenu = useCallback(
    ({
      restoreFocus = true,
    }: {
      restoreFocus?: boolean;
    } = {}) => {
      if (restoreFocus) {
        mobileMenuTriggerRef.current?.focus({ preventScroll: true });
      }

      setIsMobileMenuOpen(false);
    },
    [],
  );

  const toggleMobileMenu = useCallback(() => {
    if (isMobileMenuOpen) {
      closeMobileMenu();
      return;
    }

    openMobileMenu();
  }, [closeMobileMenu, isMobileMenuOpen, openMobileMenu]);

  useEffect(() => {
    const header = headerRef.current;
    const landscapeQuery = window.matchMedia('(min-width: 1024px)');

    if (!header) return;

    let previousScrollPosition = Math.max(window.scrollY, 0);
    let animationFrame = 0;

    const updateHeader = () => {
      const scrollPosition = Math.max(window.scrollY, 0);
      const scrollingDown = scrollPosition > previousScrollPosition;
      const servicesRegion = servicesRegionRef.current;
      const servicesRegionIsActive = Boolean(
        servicesRegion &&
        (servicesRegion.matches(':hover') ||
          servicesRegion.contains(document.activeElement)),
      );

      if (header.dataset.mobileMenuOpen === 'true') {
        header.dataset.compact = String(scrollPosition > 10);
        header.dataset.hidden = 'false';
        previousScrollPosition = scrollPosition;
        animationFrame = 0;
        return;
      }

      if (header.dataset.menuOpen === 'true' && servicesRegionIsActive) {
        header.dataset.hidden = 'false';
        previousScrollPosition = scrollPosition;
        animationFrame = 0;
        return;
      }

      if (header.dataset.menuOpen === 'true') {
        setIsServicesOpen(false);
      }

      header.dataset.compact = String(scrollPosition > 10);
      header.dataset.hidden = String(scrollPosition > 400 && scrollingDown);
      previousScrollPosition = scrollPosition;
      animationFrame = 0;
    };

    const handleScroll = () => {
      if (animationFrame) return;

      animationFrame = window.requestAnimationFrame(updateHeader);
    };

    const handleBreakpointChange = () => {
      if (landscapeQuery.matches) {
        setIsMobileMenuOpen(false);
      } else {
        openedByHoverRef.current = false;
        setIsServicesOpen(false);
      }

      updateHeader();
    };

    handleBreakpointChange();
    window.addEventListener('scroll', handleScroll, { passive: true });
    landscapeQuery.addEventListener('change', handleBreakpointChange);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      landscapeQuery.removeEventListener('change', handleBreakpointChange);

      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    if (!isServicesOpen) return;

    const handleDocumentPointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        !servicesRegionRef.current?.contains(target)
      ) {
        closeServicesMenu();
      }
    };

    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      closeServicesMenu();
      servicesTriggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', handleDocumentPointerDown);
    document.addEventListener('keydown', handleDocumentKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown);
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, [closeServicesMenu, isServicesOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const focusFrame = window.requestAnimationFrame(() => {
      mobileMenuFirstLinkRef.current?.focus({ preventScroll: true });
    });

    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      event.preventDefault();
      closeMobileMenu();
    };

    document.addEventListener('keydown', handleDocumentKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, [closeMobileMenu, isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const body = document.body;
    const siteContent = document.getElementById('site-content');
    const scrollPosition = Math.max(window.scrollY, 0);
    const scrollbarWidth = Math.max(
      window.innerWidth - document.documentElement.clientWidth,
      0,
    );
    const previousBodyStyles = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    const siteContentWasInert = siteContent?.hasAttribute('inert') ?? false;

    if (siteContent && !siteContentWasInert) {
      siteContent.setAttribute('inert', '');
    }

    body.style.position = 'fixed';
    body.style.top = `-${scrollPosition}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    if (scrollbarWidth > 0) {
      const bodyPaddingRight = Number.parseFloat(
        window.getComputedStyle(body).paddingRight,
      );

      body.style.paddingRight = `${bodyPaddingRight + scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousBodyStyles.overflow;
      body.style.paddingRight = previousBodyStyles.paddingRight;
      body.style.position = previousBodyStyles.position;
      body.style.top = previousBodyStyles.top;
      body.style.width = previousBodyStyles.width;

      if (siteContent && !siteContentWasInert) {
        siteContent.removeAttribute('inert');
      }

      window.scrollTo(0, scrollPosition);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const closeFrame = window.requestAnimationFrame(() => {
      setIsMobileMenuOpen(false);
    });

    return () => window.cancelAnimationFrame(closeFrame);
  }, [pathname]);

  useEffect(
    () => () => {
      clearCloseTimer();
    },
    [clearCloseTimer],
  );

  return (
    <>
      <button
        aria-label="Close services menu"
        className={styles.menuBackdrop}
        data-open={isServicesOpen}
        disabled={!isServicesOpen}
        onClick={closeServicesMenu}
        tabIndex={-1}
        type="button"
      />

      <header
        className={styles.siteHeader}
        data-menu-open={isServicesOpen}
        data-mobile-menu-open={isMobileMenuOpen}
        ref={headerRef}
      >
        <div className={styles.frame}>
          <div className={styles.brandSlot}>
            <Link
              aria-label="Penvo home"
              className={styles.brand}
              href="/"
              onClick={() =>
                closeMobileMenu({
                  restoreFocus: false,
                })
              }
            >
              <Image
                alt=""
                className={styles.brandLogo}
                height={50}
                priority
                src="/brand-icon-orange.svg"
                width={44}
              />
            </Link>
          </div>

          <nav aria-label="Primary navigation" className={styles.navigation}>
            <ul className={styles.navigationList}>
              <li
                className={styles.servicesNavigationItem}
                onBlur={(event) => {
                  if (
                    event.relatedTarget instanceof Node &&
                    event.currentTarget.contains(event.relatedTarget)
                  ) {
                    return;
                  }

                  scheduleServicesMenuClose();
                }}
                onFocus={clearCloseTimer}
                onPointerEnter={(event) => {
                  if (event.pointerType !== 'mouse') return;

                  openedByHoverRef.current = true;
                  openServicesMenu();
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType !== 'mouse') return;

                  if (
                    event.relatedTarget instanceof Node &&
                    event.currentTarget.contains(event.relatedTarget)
                  ) {
                    return;
                  }

                  openedByHoverRef.current = false;
                  scheduleServicesMenuClose();
                }}
                ref={servicesRegionRef}
              >
                <button
                  aria-controls={servicesMenuId}
                  aria-current={
                    getNavigationCurrent(pathname, '/services')
                      ? 'location'
                      : undefined
                  }
                  aria-expanded={isServicesOpen}
                  className={`${styles.navigationControl} ${styles.servicesTrigger} type-navigation`}
                  id="penvo-services-trigger"
                  onClick={() => {
                    if (openedByHoverRef.current) {
                      openServicesMenu();
                      return;
                    }

                    if (isServicesOpen) {
                      closeServicesMenu();
                      return;
                    }

                    openServicesMenu();
                  }}
                  ref={servicesTriggerRef}
                  type="button"
                >
                  <span className={styles.navigationLabel}>Services</span>
                </button>

                <div
                  aria-labelledby="penvo-services-trigger"
                  className={styles.servicesPopover}
                  data-open={isServicesOpen}
                  id={servicesMenuId}
                >
                  <div className={styles.servicesPanel}>
                    <ul
                      aria-label="Penvo services"
                      className={styles.servicesList}
                    >
                      {services.map((service) => (
                        <li className={styles.serviceItem} key={service.href}>
                          <Link
                            aria-current={
                              pathname === service.href ? 'page' : undefined
                            }
                            className={styles.serviceLink}
                            href={service.href}
                            onClick={closeServicesMenu}
                            tabIndex={isServicesOpen ? 0 : -1}
                          >
                            <span
                              className={`${styles.serviceTitle} type-heading-7`}
                            >
                              {service.label}
                            </span>
                            <span
                              className={`${styles.serviceDescription} type-body-small`}
                            >
                              {service.description}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <div className={styles.servicesOverviewColumn}>
                      <Link
                        aria-current={
                          pathname === '/services' ? 'page' : undefined
                        }
                        className={styles.servicesOverview}
                        href="/services"
                        onClick={closeServicesMenu}
                        tabIndex={isServicesOpen ? 0 : -1}
                      >
                        <span className={styles.servicesOverviewCopy}>
                          <span
                            className={`${styles.servicesOverviewTitle} type-heading-6`}
                          >
                            View all services
                          </span>
                          <span
                            className={`${styles.servicesOverviewDescription} type-body-small`}
                          >
                            Explore how Penvo combines strategy, creativity, and
                            technology for your own brand.
                          </span>
                        </span>

                        <span
                          aria-hidden="true"
                          className={styles.servicesOverviewVisual}
                        >
                          <Image
                            alt=""
                            className={styles.servicesOverviewLogo}
                            height={100}
                            src="/brand-icon-orange.svg"
                            width={88}
                          />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </li>

              {navigation.map((item) => (
                <li key={item.href} onPointerEnter={closeServicesMenu}>
                  <Link
                    aria-current={getNavigationCurrent(pathname, item.href)}
                    className={`${styles.navigationControl} type-navigation`}
                    href={item.href}
                  >
                    <span className={styles.navigationLabel}>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.projectSlot}>
            <ButtonLink
              className={styles.projectLink}
              href="/start-a-project"
              variant="primary"
            >
              Start a project
            </ButtonLink>
          </div>

          <div className={styles.mobileActions}>
            <Button
              aria-controls={mobileMenuId}
              aria-expanded={isMobileMenuOpen}
              aria-label={
                isMobileMenuOpen ? 'Close main menu' : 'Open main menu'
              }
              className={styles.mobileMenuToggle}
              onClick={toggleMobileMenu}
              ref={mobileMenuTriggerRef}
              variant="secondary"
            >
              <MobileMenuIcon isOpen={isMobileMenuOpen} />
            </Button>
          </div>
        </div>
      </header>

      <div
        aria-hidden={!isMobileMenuOpen}
        className={styles.mobileDrawer}
        data-open={isMobileMenuOpen}
        id={mobileMenuId}
        inert={!isMobileMenuOpen}
        onPointerDown={(event) => {
          if (event.target !== event.currentTarget) return;

          closeMobileMenu();
        }}
      >
        <div className={styles.mobileDrawerInner}>
          <nav aria-label="Mobile primary navigation">
            <ul className={styles.mobileNavigationList}>
              {mobileNavigation.map((item, index) => (
                <li className={styles.mobileNavigationItem} key={item.href}>
                  <Link
                    aria-current={getNavigationCurrent(pathname, item.href)}
                    className={`${styles.mobileNavigationControl} type-navigation`}
                    href={item.href}
                    onClick={() =>
                      closeMobileMenu({
                        restoreFocus: false,
                      })
                    }
                    ref={index === 0 ? mobileMenuFirstLinkRef : undefined}
                    tabIndex={isMobileMenuOpen ? 0 : -1}
                  >
                    <span className={styles.mobileNavigationLabel}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <ButtonLink
            className={styles.mobileDrawerProjectLink}
            href="/start-a-project"
            onClick={() =>
              closeMobileMenu({
                restoreFocus: false,
              })
            }
            tabIndex={isMobileMenuOpen ? 0 : -1}
            variant="primary"
          >
            Start a project
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
