'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

import styles from './HomeWorkTogether.module.css';
import { getWorkTogetherDuration } from './work-together-motion';

const repeats = [0, 1, 2] as const;

function MarqueeIcon() {
  return (
    <span aria-hidden="true" className={styles.marqueeIconWrap}>
      <Image
        alt=""
        className={styles.marqueeIcon}
        draggable={false}
        height={96}
        src="/icon.png"
        unoptimized
        width={96}
      />
    </span>
  );
}

function MarqueeItem({ measure = false }: { measure?: boolean }) {
  return (
    <span className={styles.item} data-marquee-item={measure ? '' : undefined}>
      <span>Let’s work together</span>
      <MarqueeIcon />
    </span>
  );
}

function MarqueeTrack({ reverse = false }: { reverse?: boolean }) {
  return (
    <span className={styles.row}>
      <span
        className={`${styles.track} ${reverse ? styles.trackReverse : styles.trackForward}`}
      >
        {repeats.map((repeat) => (
          <MarqueeItem key={repeat} measure={repeat === 0} />
        ))}
      </span>
    </span>
  );
}

export function HomeWorkTogether() {
  const hostRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const cursor = host?.querySelector<HTMLElement>('[data-marquee-cursor]');
    const measuredItem = host?.querySelector<HTMLElement>(
      '[data-marquee-item]',
    );
    if (!host || !cursor || !measuredItem) return;

    let active = true;
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const measure = () => {
      if (!active) return;
      const duration = getWorkTogetherDuration(
        measuredItem.getBoundingClientRect().width,
      );
      host.style.setProperty('--work-together-duration', `${duration}s`);
    };
    const syncVisibility = () => {
      host.dataset.hidden = String(document.hidden);
      if (document.hidden) cursor.removeAttribute('data-visible');
    };
    const renderCursor = () => {
      frame = 0;
      cursor.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
      const target = document.elementFromPoint(pointerX, pointerY);
      if (!target || !host.contains(target)) {
        cursor.removeAttribute('data-visible');
      }
    };
    const moveCursor = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      cursor.dataset.visible = 'true';
      if (!frame) frame = requestAnimationFrame(renderCursor);
    };
    const checkCursorPosition = () => {
      if (cursor.hasAttribute('data-visible') && !frame) {
        frame = requestAnimationFrame(renderCursor);
      }
    };
    const hideCursor = () => {
      cursor.removeAttribute('data-visible');
    };
    const observer = new ResizeObserver(measure);

    observer.observe(measuredItem);
    host.addEventListener('pointerenter', moveCursor);
    host.addEventListener('pointermove', moveCursor, { passive: true });
    host.addEventListener('pointerleave', hideCursor);
    host.addEventListener('pointercancel', hideCursor);
    window.addEventListener('blur', hideCursor);
    window.addEventListener('scroll', checkCursorPosition, { passive: true });
    document.addEventListener('visibilitychange', syncVisibility);
    syncVisibility();
    measure();
    host.dataset.ready = 'true';
    host.dataset.cursorReady = 'true';
    void document.fonts.ready.then(measure);

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      host.removeEventListener('pointerenter', moveCursor);
      host.removeEventListener('pointermove', moveCursor);
      host.removeEventListener('pointerleave', hideCursor);
      host.removeEventListener('pointercancel', hideCursor);
      window.removeEventListener('blur', hideCursor);
      window.removeEventListener('scroll', checkCursorPosition);
      document.removeEventListener('visibilitychange', syncVisibility);
    };
  }, []);

  return (
    <section
      aria-labelledby="work-together-title"
      className={styles.section}
      data-cursor-ready="false"
      data-hidden="false"
      data-ready="false"
      id="work-together"
      ref={hostRef}
    >
      <h2 className={styles.visuallyHidden} id="work-together-title">
        Let’s work together
      </h2>
      <Link
        aria-label="Let’s work together — contact Penvo"
        className={styles.marqueeLink}
        href="/contact"
      >
        <span aria-hidden="true" className={styles.marquee}>
          <MarqueeTrack />
          <MarqueeTrack reverse />
        </span>
      </Link>
      <span aria-hidden="true" className={styles.cursor} data-marquee-cursor>
        <span className={styles.cursorVisual}>
          <Image
            alt=""
            className={styles.cursorIcon}
            draggable={false}
            height={96}
            src="/icon.png"
            unoptimized
            width={96}
          />
        </span>
      </span>
    </section>
  );
}
