'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import { createBuildMotion } from './build-motion';
import styles from './HomeBuild.module.css';

export function BuildExperience({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const stopMotion = createBuildMotion(section);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let generation = 0;
    let stopScroll: (() => void) | undefined;
    function updateScroll() {
      const current = ++generation;
      stopScroll?.();
      stopScroll = undefined;
      if (!visible || reduced.matches || document.hidden) return;
      // Load the wheel runtime only as this below-the-fold section approaches.
      void import('./build-scroll')
        .then(({ createBuildScroll }) => {
          if (current === generation) stopScroll = createBuildScroll(section!);
        })
        .catch(() => {
          // A failed optional chunk must leave native scrolling operational.
        });
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = Boolean(entry?.isIntersecting);
        if (visible === nextVisible) return;
        visible = nextVisible;
        updateScroll();
      },
      { rootMargin: '150px 0px' },
    );
    observer.observe(section);
    reduced.addEventListener('change', updateScroll);
    document.addEventListener('visibilitychange', updateScroll);
    return () => {
      generation++;
      stopScroll?.();
      stopMotion();
      observer.disconnect();
      reduced.removeEventListener('change', updateScroll);
      document.removeEventListener('visibilitychange', updateScroll);
    };
  }, []);

  return (
    <section
      aria-labelledby="home-build-title"
      className={styles.section}
      id="lets-build"
      ref={sectionRef}
    >
      <div className={styles.stage} data-build-stage>
        <div aria-hidden="true" className={styles.flash} data-build-flash />
        <div aria-hidden="true" className={styles.ring} data-build-ring />
        <div aria-hidden="true" className={styles.sparks}>
          {Array.from({ length: 8 }, (_, index) => (
            <span className={styles.spark} data-build-spark key={index} />
          ))}
        </div>
        {children}
        <p
          aria-hidden="true"
          className={`${styles.hint} ${styles.exploreHint} type-micro`}
          data-build-explore-hint
        >
          Scroll to explore
        </p>
        <p
          aria-hidden="true"
          className={`${styles.hint} type-micro`}
          data-build-hint
        >
          Keep scrolling
        </p>
      </div>
    </section>
  );
}
