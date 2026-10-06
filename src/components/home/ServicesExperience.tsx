'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import styles from './HomeServices.module.css';

export function ServicesExperience({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = hostRef.current;
    const preview = host?.querySelector<HTMLElement>('[data-service-preview]');
    if (!host || !preview) return;
    const video = preview.querySelector<HTMLVideoElement>(
      '[data-service-preview-video]',
    );
    if (!video) return;
    const title = preview.querySelector<HTMLElement>('[data-preview-title]');
    const label = preview.querySelector<HTMLElement>('[data-preview-label]');
    if (!title || !label) return;
    const media = window.matchMedia(
      '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    );
    let frame = 0;
    let x = 0;
    let y = 0;
    function hide() {
      cancelAnimationFrame(frame);
      frame = 0;
      preview!.removeAttribute('data-visible');
      video!.pause();
    }
    function move(event: PointerEvent) {
      if (!media.matches || event.pointerType !== 'mouse') return hide();
      const row =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>('a[data-service-preview-trigger]')
          : null;
      if (!row) return hide();
      title!.textContent = row.dataset.serviceTitle ?? '';
      label!.textContent = `${row.dataset.serviceIndex ?? ''} / SERVICE`;
      if (!preview!.hasAttribute('data-visible')) {
        void video!.play().catch(() => {
          // The card remains usable as a static video frame if playback fails.
        });
      }
      x = event.clientX;
      y = event.clientY;
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          const rect = host!.getBoundingClientRect();
          const left = Math.max(150, Math.min(rect.width - 150, x - rect.left));
          preview!.style.transform = `translate(${left}px, ${y - rect.top}px)`;
          preview!.dataset.visible = 'true';
        });
    }
    host.addEventListener('pointermove', move, { passive: true });
    host.addEventListener('pointerleave', hide);
    host.addEventListener('focusin', hide);
    host.addEventListener('click', hide);
    window.addEventListener('scroll', hide, { passive: true });
    window.addEventListener('blur', hide);
    media.addEventListener('change', hide);
    document.addEventListener('visibilitychange', hide);
    return () => {
      hide();
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerleave', hide);
      host.removeEventListener('focusin', hide);
      host.removeEventListener('click', hide);
      window.removeEventListener('scroll', hide);
      window.removeEventListener('blur', hide);
      media.removeEventListener('change', hide);
      document.removeEventListener('visibilitychange', hide);
    };
  }, []);
  return (
    <div ref={hostRef} className={styles.experience}>
      {children}
      <div
        aria-hidden="true"
        className={styles.previewPosition}
        data-service-preview
      >
        <div className={styles.preview}>
          <video
            className={styles.previewVideo}
            data-service-preview-video
            height="2160"
            loop
            muted
            playsInline
            preload="metadata"
            src="/services-preview.webm"
            width="3840"
          />
          <div className={styles.previewCopy}>
            <span className="type-label" data-preview-label />
            <span
              className={`${styles.previewTitle} type-heading-4`}
              data-preview-title
            />
          </div>
        </div>
      </div>
    </div>
  );
}
