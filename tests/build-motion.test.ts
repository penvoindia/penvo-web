import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildShards,
  createBuildMotion,
  getBuildFrame,
} from '@/src/components/home/build-motion';

afterEach(() => vi.unstubAllGlobals());

function setupMotion(reduced = false, initialProgress = 0) {
  const cancellations: ReturnType<typeof vi.fn>[] = [];
  const makeElement = () => ({
    style: { transform: '', opacity: '', removeProperty: vi.fn() },
    clientHeight: 900,
    animate: vi.fn<
      (
        keyframes: Keyframe[],
        options: KeyframeAnimationOptions,
      ) => { cancel: ReturnType<typeof vi.fn> }
    >(() => {
      const cancel = vi.fn();
      cancellations.push(cancel);
      return { cancel };
    }),
  });
  const selectors = [
    'stage',
    'title',
    'left',
    'right',
    'caption',
    'hint',
    'ring',
    'flash',
    'content',
    'subtitle',
  ];
  const elements = Object.fromEntries(
    selectors.map((name) => [name, makeElement()]),
  );
  const shards = buildShards.map(makeElement);
  const sparks = Array.from({ length: 8 }, makeElement);
  let top = -initialProgress * 2160;
  const dataset: Record<string, string> = {};
  const section = {
    dataset,
    getBoundingClientRect: () => ({ top, height: 3060 }),
    querySelector: (selector: string) => elements[selector.slice(12, -1)],
    querySelectorAll: (selector: string) =>
      selector.includes('shard') ? shards : sparks,
  };
  const media = {
    matches: reduced,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  const windowEvents = new Map<string, () => void>();
  const documentEvents = new Map<string, () => void>();
  const page = {
    visibilityState: 'visible',
    addEventListener: vi.fn((name: string, callback: () => void) =>
      documentEvents.set(name, callback),
    ),
    removeEventListener: vi.fn(),
  };
  const host = {
    innerWidth: 1440,
    matchMedia: () => media,
    addEventListener: vi.fn((name: string, callback: () => void) =>
      windowEvents.set(name, callback),
    ),
    removeEventListener: vi.fn(),
  };
  const requestFrame = vi.fn<(callback: FrameRequestCallback) => number>(
    () => 1,
  );
  const cancelFrame = vi.fn();
  const observers: { disconnect: ReturnType<typeof vi.fn> }[] = [];
  let intersect: (entries: { isIntersecting: boolean }[]) => void = () => {};
  let observeResize: () => void = () => {};
  vi.stubGlobal('window', host);
  vi.stubGlobal('document', page);
  vi.stubGlobal('requestAnimationFrame', requestFrame);
  vi.stubGlobal('cancelAnimationFrame', cancelFrame);
  vi.stubGlobal('getComputedStyle', () => ({
    getPropertyValue: () => 'ease-out',
  }));
  vi.stubGlobal(
    'ResizeObserver',
    class {
      disconnect = vi.fn();
      constructor(callback: typeof observeResize) {
        observeResize = callback;
        observers.push(this);
      }
      observe() {}
    },
  );
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      disconnect = vi.fn();
      constructor(callback: typeof intersect) {
        intersect = callback;
        observers.push(this);
      }
      observe() {}
    },
  );
  const cleanup = createBuildMotion(section as unknown as HTMLElement);
  return {
    cleanup,
    dataset,
    media,
    requestFrame,
    cancelFrame,
    host,
    page,
    elements,
    observers,
    cancellations,
    setProgress: (progress: number) => {
      top = -progress * (3060 - elements.stage!.clientHeight);
    },
    scroll: () => windowEvents.get('scroll')?.(),
    resize: (source: 'window' | 'observer') => {
      if (source === 'window') windowEvents.get('resize')?.();
      else observeResize();
    },
    flush: () => requestFrame.mock.lastCall?.[0](0),
    setVisible: (isIntersecting: boolean) => intersect([{ isIntersecting }]),
    setHidden: (hidden: boolean) => {
      page.visibilityState = hidden ? 'hidden' : 'visible';
      documentEvents.get('visibilitychange')?.();
    },
    setReduced: (value: boolean) => {
      media.matches = value;
      media.addEventListener.mock.lastCall?.[1]();
    },
  };
}

describe('Let’s build scroll sequence', () => {
  it('preserves the local Navbar component’s exact radial fan and stagger', () => {
    expect(buildShards).toHaveLength(10);
    expect(buildShards[0]!.clip).toBe(
      'polygon(52.0% 46.0%, 20.0% 0.0%, 50.0% 0.0%)',
    );
    expect(buildShards[0]!.origin).toBe('40.7% 15.3%');
    expect(buildShards[2]!.clip).toBe(
      'polygon(52.0% 46.0%, 80.0% 0.0%, 100.0% 0.0%, 100.0% 25.0%)',
    );
    buildShards.forEach((shard, index) => {
      expect(shard.start).toBeCloseTo(0.62 + 0.012 * index);
      expect(Math.abs(shard.rotation)).toBe(9 + 5 * (index % 3));
    });
  });

  it.each([390, 820, 1100, 1440])(
    'approaches and meets cleanly at %ipx',
    (width) => {
      const start = getBuildFrame(0, width, 900);
      expect(start.leftX).toBeCloseTo(-width * 0.58);
      expect(start.rightX).toBeCloseTo(width * 0.58);
      expect(start.skew).toBe(12);
      expect(start.hintOpacity).toBe(0);
      expect(start.exploreHintOpacity).toBe(1);
      const impact = getBuildFrame(0.45, width, 900);
      expect(impact.leftX).toBeCloseTo(0);
      expect(impact.rightX).toBeCloseTo(0);
      expect(impact.skew).toBe(0);
      expect(impact.captionOpacity).toBe(1);
      expect(impact.hintOpacity).toBe(0);
    },
  );

  it('finishes the top hint before revealing the bottom hint', () => {
    for (let step = 0; step <= 100; step++) {
      const frame = getBuildFrame(step / 100, 1440, 900);
      expect(frame.exploreHintOpacity * frame.hintOpacity).toBe(0);
    }
    expect(getBuildFrame(0.09, 1440, 900).exploreHintOpacity).toBe(0);
    expect(getBuildFrame(0.09, 1440, 900).hintOpacity).toBe(0);
    expect(getBuildFrame(0.15, 1440, 900).hintOpacity).toBe(1);
    expect(getBuildFrame(0.31, 1440, 900).hintOpacity).toBe(0);
  });

  it('hands off to intact shards before falling and fading them completely', () => {
    const split = getBuildFrame(0.62, 1440, 900);
    expect(split.titleOpacity).toBe(0);
    for (const shard of split.shards) {
      expect(shard.x).toBeCloseTo(0);
      expect(shard.y).toBeCloseTo(0);
      expect(shard.rotation).toBeCloseTo(0);
      expect(shard.opacity).toBe(1);
    }
    expect(
      getBuildFrame(0.8, 1440, 900).shards.some((shard) => shard.y > 50),
    ).toBe(true);
    const end = getBuildFrame(1, 1440, 900);
    expect(end.captionOpacity).toBe(0);
    expect(end.shards.every((shard) => shard.opacity === 0)).toBe(true);
  });

  it('is deterministic and reversible after rapid scrolling or resizing', () => {
    const expected = getBuildFrame(0.3, 390, 844);
    getBuildFrame(1, 1440, 900);
    expect(getBuildFrame(0.3, 390, 844)).toEqual(expected);
    for (const input of [-3, 4, NaN, Infinity]) {
      const state = getBuildFrame(input, 0, 0);
      expect(Number.isFinite(state.leftX)).toBe(true);
      expect(state.shards.every((shard) => Number.isFinite(shard.y))).toBe(
        true,
      );
    }
  });

  it('leaves the readable unpinned fallback untouched with reduced motion', () => {
    const fixture = setupMotion(true);
    expect(fixture.dataset.motion).toBeUndefined();
    expect(fixture.host.addEventListener).not.toHaveBeenCalled();
    expect(fixture.requestFrame).not.toHaveBeenCalled();
    fixture.cleanup();
    expect(fixture.media.removeEventListener).toHaveBeenCalledOnce();
  });

  it.each(['window', 'observer'] as const)(
    'recalculates progress and transforms after a %s resize',
    (source) => {
      const fixture = setupMotion(false, 0.3);
      const initialTransform = fixture.elements.left!.style.transform;
      fixture.host.innerWidth = 390;
      fixture.elements.stage!.clientHeight = 600;
      fixture.resize(source);
      expect(fixture.requestFrame).toHaveBeenCalledOnce();
      fixture.flush();

      // Keep the scroll offset fixed while the available sticky travel changes.
      const progress = (0.3 * 2160) / (3060 - 600);
      const expected = getBuildFrame(progress, 390, 600);
      expect(fixture.elements.left!.style.transform).not.toBe(initialTransform);
      expect(fixture.elements.left!.style.transform).toBe(
        `translateX(${expected.leftX}px) skewX(${-expected.skew}deg)`,
      );
      expect(fixture.elements.right!.style.transform).toBe(
        `translateX(${expected.rightX}px) skewX(${expected.skew}deg)`,
      );
      fixture.cleanup();
    },
  );

  it.each([0.46, 0.75])(
    'renders restored progress %s without triggering an impact',
    (progress) => {
      const fixture = setupMotion(false, progress);
      const expected = getBuildFrame(progress, 1440, 900);
      expect(fixture.elements.title!.style.opacity).toBe(
        String(expected.titleOpacity),
      );
      fixture.scroll();
      fixture.flush();
      expect(fixture.elements.ring!.animate).not.toHaveBeenCalled();
      expect(fixture.elements.flash!.animate).not.toHaveBeenCalled();
      expect(fixture.elements.subtitle!.style.opacity).toBe('1');
      expect(fixture.cancellations).toHaveLength(0);
      fixture.cleanup();
    },
  );

  it('cancels impact on reversal and replays when crossing the reference threshold again', () => {
    const fixture = setupMotion();
    const scrollTo = (progress: number) => {
      fixture.setProgress(progress);
      fixture.scroll();
      fixture.flush();
    };

    scrollTo(0.46);
    expect(fixture.elements.ring!.animate).toHaveBeenCalledOnce();
    expect(fixture.elements.flash!.animate.mock.calls[0]?.[0]).toEqual([
      { opacity: 0.35 },
      { opacity: 0 },
    ]);
    const firstImpact = [...fixture.cancellations];
    scrollTo(0.3);
    expect(firstImpact.length).toBeGreaterThan(0);
    for (const cancel of firstImpact) expect(cancel).toHaveBeenCalledOnce();
    scrollTo(0.46);
    expect(fixture.elements.ring!.animate).toHaveBeenCalledTimes(2);

    scrollTo(0.19);
    scrollTo(0.46);
    expect(fixture.elements.ring!.animate).toHaveBeenCalledTimes(3);
    fixture.cleanup();
    for (const cancel of fixture.cancellations)
      expect(cancel).toHaveBeenCalledOnce();
  });

  it('coalesces scroll work, triggers impact once, and cleans up', () => {
    const fixture = setupMotion();
    expect(fixture.dataset.motion).toBe('true');
    fixture.setProgress(0.46);
    fixture.scroll();
    fixture.scroll();
    expect(fixture.requestFrame).toHaveBeenCalledOnce();
    fixture.flush();
    expect(fixture.elements.ring!.animate).toHaveBeenCalledOnce();
    fixture.scroll();
    fixture.flush();
    expect(fixture.elements.ring!.animate).toHaveBeenCalledOnce();
    fixture.cleanup();
    expect(fixture.dataset.motion).toBeUndefined();
    expect(
      fixture.observers.every(
        (observer) => observer.disconnect.mock.calls.length === 1,
      ),
    ).toBe(true);
    expect(
      fixture.cancellations.every((cancel) => cancel.mock.calls.length === 1),
    ).toBe(true);
    expect(fixture.host.removeEventListener).toHaveBeenCalledTimes(2);
  });

  it('stops offscreen/hidden work and switches live to the static fallback', () => {
    const fixture = setupMotion();
    fixture.setVisible(false);
    fixture.scroll();
    expect(fixture.requestFrame).not.toHaveBeenCalled();
    fixture.setVisible(true);
    expect(fixture.requestFrame).toHaveBeenCalledOnce();
    fixture.setHidden(true);
    fixture.scroll();
    expect(fixture.requestFrame).toHaveBeenCalledOnce();
    fixture.setHidden(false);
    fixture.flush();
    fixture.setReduced(true);
    expect(fixture.dataset.motion).toBeUndefined();
    expect(fixture.elements.title!.style.removeProperty).toHaveBeenCalledWith(
      'opacity',
    );
    fixture.cleanup();
  });
});
