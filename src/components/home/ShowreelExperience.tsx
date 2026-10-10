'use client';

import { useEffect, useRef } from 'react';

import styles from './HomeShowreel.module.css';
import type { Showreel } from './showreel-content';
import {
  createShowreelScrub,
  getShowreelBackdrop,
  getShowreelFrame,
  getShowreelProgress,
  isShowreelCovered,
} from './showreel-motion';

// Matches the pinned layout in HomeShowreel.module.css.
const pinnedQuery =
  '(min-width: 992px) and (prefers-reduced-motion: no-preference)';

// Makes every browser, iOS Safari included, show the first frame as the thumbnail.
const firstFrame = '#t=0.001';

const frameDuration = 1000 / 60;

export function ShowreelExperience({ showreel }: { showreel: Showreel }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const frame = frameRef.current;
    const video = videoRef.current;
    const section = stage?.closest('section');
    if (!stage || !frame || !video || !section) return;

    const pinned = window.matchMedia(pinnedQuery);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const scrub = createShowreelScrub();
    let animation = 0;
    let lastTick = 0;
    let viewportHeight = 0;
    let frameHeight = 0;
    let backdrop = '';
    video.muted = true;

    const sectionTop = () =>
      section.getBoundingClientRect().top + window.scrollY;

    function render(progress: number) {
      const { scale, y } = getShowreelFrame(
        progress,
        viewportHeight,
        frameHeight,
      );
      frame!.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
    }

    // Turns the page from black to white, as the reference turns its page
    // dark, and back once the next section covers the reel.
    function paintBackdrop() {
      const top = sectionTop();
      const amount =
        pinned.matches &&
        !isShowreelCovered(window.scrollY, top, viewportHeight)
          ? getShowreelBackdrop(window.scrollY, top, viewportHeight)
          : 0;
      const color =
        amount > 0
          ? `color-mix(in srgb, var(--color-background), var(--color-full-white) ${(amount * 100).toFixed(2)}%)`
          : '';
      if (color === backdrop) return;
      backdrop = color;
      document.body.style.backgroundColor = color;
    }

    function tick(now: number) {
      animation = 0;
      if (!pinned.matches) return;
      paintBackdrop();
      // GSAP restarts a scrub from the previous frame's time, so the first
      // frame after a scroll already moves.
      const previous = now - Math.min(now - lastTick, frameDuration);
      lastTick = now;
      scrub.target(
        getShowreelProgress(window.scrollY, sectionTop(), viewportHeight),
        previous,
      );
      render(scrub.sample(now));
      if (!scrub.settled(now)) animation = requestAnimationFrame(tick);
    }

    function scroll() {
      if (pinned.matches && !animation) animation = requestAnimationFrame(tick);
    }

    function layout() {
      cancelAnimationFrame(animation);
      animation = 0;
      if (pinned.matches) {
        viewportHeight = stage!.clientHeight;
        frameHeight = frame!.offsetHeight;
        scrub.jump(
          getShowreelProgress(window.scrollY, sectionTop(), viewportHeight),
        );
        render(scrub.sample(performance.now()));
      } else {
        frame!.style.removeProperty('transform');
      }
      paintBackdrop();
    }

    // Two screens ahead, load the first frame so it is ready as the thumbnail.
    const nearby = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        nearby.disconnect();
        if (video.preload !== 'none') return;
        video.preload = 'metadata';
        video.load();
      },
      { rootMargin: '200% 0px' },
    );
    // From first sight it plays non-stop, and `loop` repeats it back to back.
    // Reduced motion keeps the first frame.
    const visibility = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || reducedMotion.matches) return;
      visibility.disconnect();
      video.preload = 'auto';
      void video.play().catch(() => {
        // The first frame remains if the browser blocks playback.
      });
    });
    const resize = new ResizeObserver(layout);

    nearby.observe(frame);
    visibility.observe(frame);
    resize.observe(frame);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', layout);
    pinned.addEventListener('change', layout);
    layout();

    return () => {
      cancelAnimationFrame(animation);
      nearby.disconnect();
      visibility.disconnect();
      resize.disconnect();
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', layout);
      pinned.removeEventListener('change', layout);
      video.pause();
      frame.style.removeProperty('transform');
      document.body.style.removeProperty('background-color');
    };
  }, []);

  return (
    <div className={styles.stage} ref={stageRef}>
      <div className={styles.frame} ref={frameRef}>
        <video
          aria-label={showreel.label}
          className={styles.video}
          disableRemotePlayback
          height={showreel.height}
          loop
          muted
          playsInline
          preload="none"
          ref={videoRef}
          width={showreel.width}
        >
          {showreel.sources.map((source) => (
            <source
              key={source.src}
              src={`${source.src}${firstFrame}`}
              type={source.type}
            />
          ))}
        </video>
      </div>
    </div>
  );
}
