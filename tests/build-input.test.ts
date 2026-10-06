import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildScrollOptions,
  createBuildScroll,
} from '@/src/components/home/build-scroll';

const engine = vi.hoisted(() => ({
  options: {} as Record<string, unknown>,
  isScrolling: 'smooth' as string | false,
  raf: vi.fn(),
  scrollTo: vi.fn(),
  destroy: vi.fn(),
  unsubscribe: vi.fn(),
  wheel: () => {},
}));
vi.mock('lenis', () => ({
  default: class {
    constructor(options: Record<string, unknown>) {
      engine.options = options;
    }
    get isScrolling() {
      return engine.isScrolling;
    }
    raf = engine.raf;
    scrollTo = engine.scrollTo;
    destroy = engine.destroy;
    on(_name: string, callback: () => void) {
      engine.wheel = callback;
      return engine.unsubscribe;
    }
  },
}));

class Target {
  events = new Map<string, (event: unknown) => void>();
  addEventListener(name: string, callback: (event: unknown) => void) {
    this.events.set(name, callback);
  }
  removeEventListener(name: string) {
    this.events.delete(name);
  }
  fire(name: string, event: unknown = {}) {
    this.events.get(name)?.(event);
  }
}

function environment() {
  const reduced = Object.assign(new Target(), { matches: false });
  const host = Object.assign(new Target(), {
    innerWidth: 1440,
    innerHeight: 900,
    scrollY: 1200,
    matchMedia: () => reduced,
  });
  const page = Object.assign(new Target(), { hidden: false });
  let id = 0;
  const frames = new Map<number, FrameRequestCallback>();
  vi.stubGlobal('window', host);
  vi.stubGlobal('document', page);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++id, callback);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (key: number) => frames.delete(key));
  const section = new Target();
  function flush() {
    for (const [key, callback] of [...frames]) {
      frames.delete(key);
      callback(100);
    }
  }
  return {
    reduced,
    host,
    page,
    frames,
    flush,
    section,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  engine.isScrolling = 'smooth';
});
afterEach(() => vi.unstubAllGlobals());

describe('Build section reference wheel behaviour', () => {
  it('keeps the reference duration/easing and limits wheel capture to the section', () => {
    const env = environment();
    const cleanup = createBuildScroll(env.section as unknown as HTMLElement);
    expect(engine.options).toMatchObject({
      duration: 1.1,
      smoothWheel: true,
      syncTouch: false,
      eventsTarget: env.section,
    });
    expect(buildScrollOptions.easing(0)).toBeCloseTo(0.001);
    expect(buildScrollOptions.easing(0.5)).toBeCloseTo(0.96975);
    expect(buildScrollOptions.easing(1)).toBe(1);
    expect(env.frames.size).toBe(0);
    engine.wheel();
    expect(engine.raf).toHaveBeenCalledOnce();
    expect(env.frames.size).toBe(1);
    env.flush();
    expect(env.frames.size).toBe(1);
    engine.isScrolling = false;
    env.flush();
    expect(env.frames.size).toBe(0);
    cleanup();
    expect(engine.unsubscribe).toHaveBeenCalledOnce();
    expect(engine.destroy).toHaveBeenCalledOnce();
    expect(env.host.events.size).toBe(0);
  });

  it('does not intercept browser zoom and cancels inertia for native keyboard navigation', () => {
    const env = environment();
    const cleanup = createBuildScroll(env.section as unknown as HTMLElement);
    const filter = engine.options.virtualScroll as (data: {
      event: { ctrlKey: boolean; metaKey: boolean };
    }) => boolean;
    expect(filter({ event: { ctrlKey: true, metaKey: false } })).toBe(false);
    expect(filter({ event: { ctrlKey: false, metaKey: true } })).toBe(false);
    expect(filter({ event: { ctrlKey: false, metaKey: false } })).toBe(true);
    env.host.fire('keydown', { key: 'PageDown' });
    expect(engine.scrollTo).toHaveBeenCalledWith(1200, {
      immediate: true,
      force: true,
    });
    cleanup();
  });
});
