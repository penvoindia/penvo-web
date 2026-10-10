'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import styles from './HomeProjects.module.css';
import cursorStyles from './ProjectsCursor.module.css';
import { createProjectsCursor } from './projects-cursor';
import { createProjectsDrag } from './projects-drag';

export function ProjectsGallery({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const viewport = viewportRef.current;
    const cursor = cursorRef.current;
    if (!host || !viewport || !cursor) return;

    const destroyDrag = createProjectsDrag(viewport);
    const destroyCursor = createProjectsCursor(host, viewport, cursor);

    return () => {
      destroyCursor();
      destroyDrag();
    };
  }, []);

  return (
    <div className={cursorStyles.host} ref={hostRef}>
      <div
        aria-label="Project gallery"
        className={styles.viewport}
        ref={viewportRef}
        role="region"
        tabIndex={0}
      >
        {children}
      </div>
      <span aria-hidden="true" className={cursorStyles.cursor} ref={cursorRef}>
        <span className={cursorStyles.visual}>
          <svg
            className={cursorStyles.left}
            fill="none"
            height="10"
            viewBox="0 0 10 10"
            width="10"
          >
            <path d="m6.5 1.5-3.5 3.5 3.5 3.5" />
          </svg>
          <svg
            className={cursorStyles.right}
            fill="none"
            height="10"
            viewBox="0 0 10 10"
            width="10"
          >
            <path d="m3.5 1.5 3.5 3.5-3.5 3.5" />
          </svg>
        </span>
      </span>
    </div>
  );
}
