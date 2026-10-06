'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import { Button } from '@/src/components/ui/Button';

import { heroModes, heroWords, type HeroMode } from './hero-content';
import { createHeroField, type HeroField } from './hero-particles';
import styles from './HomeHero.module.css';

const MotionContext = createContext(false);
const serverMotionPreference = () => true;
const serverVisibility = () => false;
const getReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const getVisibility = () => document.visibilityState === 'visible';

function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function subscribeVisibility(callback: () => void) {
  document.addEventListener('visibilitychange', callback);
  return () => document.removeEventListener('visibilitychange', callback);
}

export function HeroExperience({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<HeroField | null>(null);
  const [inView, setInView] = useState(false);
  const [mode, setMode] = useState<HeroMode>('flow');
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    serverMotionPreference,
  );
  const visible = useSyncExternalStore(
    subscribeVisibility,
    getVisibility,
    serverVisibility,
  );
  const running = inView && visible && !reducedMotion;

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const field = createHeroField(canvas, section);
    fieldRef.current = field;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(Boolean(entry?.isIntersecting));
    });
    observer.observe(section);

    return () => {
      field?.destroy();
      fieldRef.current = null;
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const field = fieldRef.current;
    if (running) field?.start();
    else field?.stop();
    field?.setMode(mode);
  }, [mode, running]);

  return (
    <MotionContext value={running}>
      <section
        aria-labelledby="home-hero-title"
        className={styles.hero}
        id="top"
        onPointerMove={(event) => {
          if (event.pointerType !== 'mouse') return;
          fieldRef.current?.setPointer(event.clientX, event.clientY);
        }}
        onPointerLeave={() => fieldRef.current?.clearPointer()}
        ref={sectionRef}
      >
        <canvas aria-hidden="true" className={styles.canvas} ref={canvasRef} />
        <div aria-hidden="true" className={styles.veil} />
        {children}
        <div className={styles.controls} data-hero-controls>
          <div
            aria-label="Particle arrangements"
            className={styles.modes}
            role="group"
          >
            <p className={`${styles.controlsLabel} type-micro`}>
              Explore our world
            </p>
            {heroModes.map((item) => (
              <Button
                aria-pressed={mode === item.id}
                className={item.id === 'globe' ? undefined : styles.control}
                key={item.id}
                onClick={() => setMode(item.id)}
                size="compact"
                variant={
                  item.id !== 'globe' && mode === item.id
                    ? 'primary'
                    : 'secondary'
                }
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </section>
    </MotionContext>
  );
}

export function HeroRotatingWord() {
  const running = useContext(MotionContext);
  const [index, setIndex] = useState(0);
  const [swapping, setSwapping] = useState(false);

  useEffect(() => {
    if (!running) return;
    // Visibility changes can interrupt the exit phase; restore readable text first.
    const resumeFrame = requestAnimationFrame(() => setSwapping(false));
    let timeout: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setSwapping(true);
      timeout = setTimeout(() => {
        setIndex((value) => (value + 1) % heroWords.length);
        setSwapping(false);
      }, 320);
    }, 2400);

    return () => {
      cancelAnimationFrame(resumeFrame);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [running]);

  return (
    <span aria-hidden="true" className={styles.wordSlot}>
      {heroWords.map((word) => (
        <span className={styles.wordMeasure} key={word}>
          {word}
        </span>
      ))}
      <span className={styles.word} data-swapping={running && swapping}>
        {heroWords[index]}
      </span>
    </span>
  );
}
