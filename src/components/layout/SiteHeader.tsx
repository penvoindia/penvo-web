'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ButtonLink } from '@/src/components/ui/Button';

import styles from './SiteHeader.module.css';

const navigation = [
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
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

export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const servicesRegionRef = useRef<HTMLLIElement>(null);
  const servicesTriggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const openedByHoverRef = useRef(false);
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
      setIsServicesOpen(false);
      closeTimerRef.current = null;
    }, 160);
  }, [clearCloseTimer]);

  useEffect(() => {
    const header = headerRef.current;
    const landscapeQuery = window.matchMedia('(min-width: 1024px)');

    if (!header) return;

    let previousScrollPosition = 0;
    let animationFrame = 0;

    const updateHeader = () => {
      const scrollPosition = Math.max(window.scrollY, 0);
      const scrollingDown = scrollPosition > previousScrollPosition;

      header.dataset.compact = String(scrollPosition > 10);
      header.dataset.hidden = String(scrollPosition > 400 && scrollingDown);
      previousScrollPosition = scrollPosition;
      animationFrame = 0;
    };

    const handleScroll = () => {
      if (!landscapeQuery.matches || animationFrame) return;

      setIsServicesOpen(false);
      animationFrame = window.requestAnimationFrame(updateHeader);
    };

    const handleBreakpointChange = () => {
      if (landscapeQuery.matches) {
        updateHeader();
        return;
      }

      header.dataset.compact = 'false';
      header.dataset.hidden = 'false';
      setIsServicesOpen(false);
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
        data-compact="false"
        data-hidden="false"
        data-menu-open={isServicesOpen}
        ref={headerRef}
      >
        <div className={styles.frame}>
          <div className={styles.brandSlot}>
            <Link aria-label="Penvo home" className={styles.brand} href="/">
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
                onPointerLeave={() => {
                  openedByHoverRef.current = false;
                  scheduleServicesMenuClose();
                }}
                ref={servicesRegionRef}
              >
                <button
                  aria-controls={servicesMenuId}
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
                  Services
                </button>

                <div
                  aria-labelledby="penvo-services-trigger"
                  className={styles.servicesPopover}
                  data-open={isServicesOpen}
                  id={servicesMenuId}
                  onPointerEnter={clearCloseTimer}
                  onPointerLeave={scheduleServicesMenuClose}
                >
                  <div className={styles.servicesPanel}>
                    <ul
                      aria-label="Penvo services"
                      className={styles.servicesList}
                    >
                      {services.map((service) => (
                        <li className={styles.serviceItem} key={service.href}>
                          <Link
                            className={styles.serviceLink}
                            href={service.href}
                            onClick={closeServicesMenu}
                            tabIndex={isServicesOpen ? 0 : -1}
                          >
                            <span
                              className={`${styles.serviceTitle} type-heading-6`}
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
                        className={styles.servicesOverview}
                        href="/services"
                        onClick={closeServicesMenu}
                        tabIndex={isServicesOpen ? 0 : -1}
                      >
                        <span className={styles.servicesOverviewCopy}>
                          <span
                            className={`${styles.servicesOverviewTitle} type-heading-5`}
                          >
                            View all services
                          </span>
                          <span
                            className={`${styles.servicesOverviewDescription} type-body-small`}
                          >
                            Explore how Penvo combines strategy, creativity, and
                            technology to move brands forward.
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
                    className={`${styles.navigationControl} type-navigation`}
                    href={item.href}
                  >
                    {item.label}
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
        </div>
      </header>
    </>
  );
}
