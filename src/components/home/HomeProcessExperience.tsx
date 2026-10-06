'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import {
  getProcessProgress,
  getProcessSectionHeight,
  getProcessTravel,
} from './home-process-motion';

type HomeProcessExperienceProps = {
  children: ReactNode;
  className?: string;
};

export function HomeProcessExperience({
  children,
  className,
}: HomeProcessExperienceProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = section?.querySelector<HTMLElement>('[data-process-track]');
    const progress = section?.querySelector<HTMLElement>(
      '[data-process-progress]',
    );
    if (!section || !track || !progress) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stackedLayout = window.matchMedia('(max-width: 767px)');
    let frame = 0;
    let travel = 0;

    const isStacked = () => reducedMotion.matches || stackedLayout.matches;

    const render = () => {
      frame = 0;
      if (isStacked()) return;

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const progressValue = getProcessProgress(
        window.scrollY,
        sectionTop,
        travel,
      );
      track.style.transform = `translate3d(${-progressValue * travel}px, 0, 0)`;
      progress.style.transform = `scaleX(${progressValue})`;
    };

    const requestRender = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const layout = () => {
      const stacked = isStacked();
      section.dataset.layout = stacked ? 'stacked' : 'horizontal';

      if (stacked) {
        travel = 0;
        section.style.removeProperty('height');
        track.style.removeProperty('transform');
        progress.style.removeProperty('transform');
        return;
      }

      travel = getProcessTravel(track.scrollWidth, window.innerWidth);
      section.style.height = `${getProcessSectionHeight(travel, window.innerHeight)}px`;
      render();
    };

    const observer = new ResizeObserver(layout);
    observer.observe(track);
    window.addEventListener('scroll', requestRender, { passive: true });
    window.addEventListener('resize', layout);
    reducedMotion.addEventListener('change', layout);
    stackedLayout.addEventListener('change', layout);
    layout();
    void document.fonts.ready.then(layout);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', requestRender);
      window.removeEventListener('resize', layout);
      reducedMotion.removeEventListener('change', layout);
      stackedLayout.removeEventListener('change', layout);
    };
  }, []);

  return (
    <section
      aria-labelledby="process-title"
      className={className}
      data-layout="stacked"
      id="process"
      ref={sectionRef}
    >
      {children}
    </section>
  );
}
