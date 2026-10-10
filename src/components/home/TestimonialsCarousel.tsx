'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import { Button } from '@/src/components/ui/Button';

import styles from './HomeTestimonials.module.css';
import { createTestimonialsScroll } from './testimonials-scroll';

function CarouselArrow({ direction }: { direction: 'previous' | 'next' }) {
  return (
    <svg
      aria-hidden="true"
      className={styles.arrow}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d={
          direction === 'previous'
            ? 'M14 5 7 12l7 7M7 12h14'
            : 'm10 5 7 7-7 7M17 12H3'
        }
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function TestimonialsCarousel({
  children,
  heading,
}: {
  children: ReactNode;
  heading: ReactNode;
}) {
  const viewportRef = useRef<HTMLUListElement>(null);
  const previousRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const previous = previousRef.current;
    const next = nextRef.current;
    if (!viewport || !previous || !next) return;

    return createTestimonialsScroll(viewport, previous, next);
  }, []);

  return (
    <>
      <div className={`${styles.header} layout-container`}>
        {heading}
        <div
          aria-label="Testimonial navigation"
          className={styles.navigation}
          role="group"
        >
          <Button
            aria-controls="testimonials-cards"
            aria-label="Previous testimonial"
            className={styles.navigationButton}
            disabled
            ref={previousRef}
            variant="secondary"
          >
            <CarouselArrow direction="previous" />
          </Button>
          <Button
            aria-controls="testimonials-cards"
            aria-label="Next testimonial"
            className={styles.navigationButton}
            disabled
            ref={nextRef}
            variant="secondary"
          >
            <CarouselArrow direction="next" />
          </Button>
        </div>
      </div>
      <ul
        aria-label="Client testimonials"
        className={styles.cards}
        id="testimonials-cards"
        ref={viewportRef}
        role="list"
        tabIndex={0}
      >
        {children}
      </ul>
    </>
  );
}
