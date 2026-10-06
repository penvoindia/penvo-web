import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export const buildScrollOptions = {
  duration: 1.1,
  easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
  smoothWheel: true,
  syncTouch: false,
  autoRaf: false,
} as const;

/** Same wheel physics as the local reference; never replaces touch/keyboard input. */
export function createBuildScroll(section: HTMLElement) {
  const lenis = new Lenis({
    ...buildScrollOptions,
    eventsTarget: section,
    stopInertiaOnNavigate: true,
    virtualScroll: ({ event }) => !event.ctrlKey && !event.metaKey,
  });
  let frame = 0;

  function tick(time: number) {
    frame = 0;
    lenis.raf(time);
    if (lenis.isScrolling === 'smooth') frame = requestAnimationFrame(tick);
  }

  const unsubscribe = lenis.on('virtual-scroll', () => {
    if (frame) return;
    // Reset the time base before a new wheel gesture after an idle period.
    lenis.raf(performance.now());
    frame = requestAnimationFrame(tick);
  });

  function interrupt(event: KeyboardEvent) {
    if (
      [
        'ArrowUp',
        'ArrowDown',
        'PageUp',
        'PageDown',
        'Home',
        'End',
        ' ',
        'Tab',
      ].includes(event.key)
    ) {
      lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    }
  }
  window.addEventListener('keydown', interrupt);
  return () => {
    cancelAnimationFrame(frame);
    unsubscribe();
    window.removeEventListener('keydown', interrupt);
    lenis.destroy();
  };
}
