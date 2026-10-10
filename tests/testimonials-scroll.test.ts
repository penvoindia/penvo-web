import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTestimonialsScroll } from '@/src/components/home/testimonials-scroll';

class ScrollPreference extends EventTarget {
  matches = false;

  change(matches: boolean) {
    this.matches = matches;
    this.dispatchEvent(new Event('change'));
  }
}

class ScrollButton extends EventTarget {
  disabled = true;

  click() {
    if (!this.disabled) this.dispatchEvent(new Event('click'));
  }
}

class ScrollViewport extends EventTarget {
  scrollLeft = 0;
  scrollWidth = 1432;
  clientWidth = 840;
  cardWidth = 340;
  cardGap = 24;
  cards = Array.from({ length: 4 }, (_, index) => ({
    getBoundingClientRect: () => ({
      left: 40 + index * (this.cardWidth + this.cardGap) - this.scrollLeft,
      width: this.cardWidth,
    }),
  }));
  scrollTo = vi.fn((options: ScrollToOptions) => {
    this.scrollLeft = options.left ?? this.scrollLeft;
    this.dispatchEvent(new Event('scroll'));
  });

  querySelectorAll() {
    return this.cards;
  }
}

class ScrollResizeObserver {
  static latest: ScrollResizeObserver;
  observe = vi.fn();
  disconnect = vi.fn();

  constructor(private callback: ResizeObserverCallback) {
    ScrollResizeObserver.latest = this;
  }

  resize() {
    this.callback([], this as unknown as ResizeObserver);
  }
}

describe('testimonials native scrolling', () => {
  let viewport: ScrollViewport;
  let previous: ScrollButton;
  let next: ScrollButton;
  let preference: ScrollPreference;
  let window: EventTarget;
  let destroy: (() => void) | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    viewport = new ScrollViewport();
    previous = new ScrollButton();
    next = new ScrollButton();
    preference = new ScrollPreference();
    window = new EventTarget();
    vi.stubGlobal(
      'window',
      Object.assign(window, {
        matchMedia: () => preference,
        requestAnimationFrame: (callback: FrameRequestCallback) =>
          setTimeout(() => callback(0), 16),
        cancelAnimationFrame: clearTimeout,
      }),
    );
    vi.stubGlobal('ResizeObserver', ScrollResizeObserver);
  });

  afterEach(() => {
    destroy?.();
    destroy = undefined;
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function start() {
    destroy = createTestimonialsScroll(
      viewport as unknown as HTMLElement,
      previous as unknown as HTMLButtonElement,
      next as unknown as HTMLButtonElement,
    );
  }

  function frame() {
    vi.advanceTimersByTime(16);
  }

  it('advances by the measured card spacing and clamps both endpoints', () => {
    start();
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(false);
    previous.click();
    expect(viewport.scrollTo).not.toHaveBeenCalled();

    next.click();
    expect(viewport.scrollTo).toHaveBeenLastCalledWith({
      left: 364,
      behavior: 'smooth',
    });
    frame();
    expect(previous.disabled).toBe(false);
    expect(next.disabled).toBe(false);
    next.click();
    frame();
    expect(viewport.scrollLeft).toBe(592);
    expect(next.disabled).toBe(true);

    previous.click();
    frame();
    expect(viewport.scrollLeft).toBe(228);
    previous.click();
    frame();
    expect(viewport.scrollLeft).toBe(0);
    expect(previous.disabled).toBe(true);
  });

  it('uses current responsive measurements and updates controls when resized', () => {
    start();
    expect(ScrollResizeObserver.latest.observe).toHaveBeenCalledTimes(5);
    viewport.cardWidth = 240;
    viewport.cardGap = 16;
    viewport.clientWidth = 390;
    viewport.scrollWidth = 1008;
    ScrollResizeObserver.latest.resize();
    frame();
    next.click();
    expect(viewport.scrollTo).toHaveBeenLastCalledWith({
      left: 256,
      behavior: 'smooth',
    });
    frame();

    viewport.clientWidth = viewport.scrollWidth;
    ScrollResizeObserver.latest.resize();
    frame();
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(true);

    viewport.clientWidth = 600;
    window.dispatchEvent(new Event('resize'));
    frame();
    expect(previous.disabled).toBe(false);
    expect(next.disabled).toBe(false);
  });

  it('coalesces native scroll events and handles fractional or overscrolled edges', () => {
    start();
    viewport.scrollLeft = -12;
    viewport.dispatchEvent(new Event('scroll'));
    viewport.dispatchEvent(new Event('scroll'));
    expect(vi.getTimerCount()).toBe(1);
    frame();
    expect(previous.disabled).toBe(true);

    viewport.scrollLeft = 300;
    viewport.dispatchEvent(new Event('scroll'));
    frame();
    expect(previous.disabled).toBe(false);
    expect(next.disabled).toBe(false);

    viewport.scrollLeft = 590.5;
    viewport.dispatchEvent(new Event('scroll'));
    frame();
    expect(next.disabled).toBe(true);
    viewport.scrollLeft = 610;
    viewport.dispatchEvent(new Event('scroll'));
    frame();
    expect(next.disabled).toBe(true);
  });

  it('scrolls immediately for reduced motion and reads preference changes live', () => {
    preference.matches = true;
    start();
    next.click();
    expect(viewport.scrollTo).toHaveBeenLastCalledWith({
      left: 364,
      behavior: 'auto',
    });
    frame();
    preference.change(false);
    previous.click();
    expect(viewport.scrollTo).toHaveBeenLastCalledWith({
      left: 0,
      behavior: 'smooth',
    });
  });

  it('cleans up queued frames, observers, and listeners safely on repeated destroy', () => {
    start();
    next.click();
    expect(vi.getTimerCount()).toBe(1);
    destroy?.();
    destroy?.();
    expect(vi.getTimerCount()).toBe(0);
    expect(ScrollResizeObserver.latest.disconnect).toHaveBeenCalledTimes(1);
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(true);

    viewport.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('resize'));
    preference.change(true);
    ScrollResizeObserver.latest.resize();
    previous.dispatchEvent(new Event('click'));
    next.dispatchEvent(new Event('click'));
    expect(vi.getTimerCount()).toBe(0);
    expect(viewport.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('keeps resize and scrolling controls usable without ResizeObserver support', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    start();
    viewport.clientWidth = viewport.scrollWidth;
    window.dispatchEvent(new Event('resize'));
    frame();
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(true);
  });
});
