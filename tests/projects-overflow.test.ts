import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  hasProjectsOverflow,
  observeProjectsLayout,
} from '@/src/components/home/projects-overflow';

class LayoutResizeObserver {
  static latest: LayoutResizeObserver;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(private callback: ResizeObserverCallback) {
    LayoutResizeObserver.latest = this;
  }

  change() {
    this.callback([], this as unknown as ResizeObserver);
  }
}

class LayoutMutationObserver {
  static latest: LayoutMutationObserver;
  observe = vi.fn();
  disconnect = vi.fn();

  constructor(private callback: MutationCallback) {
    LayoutMutationObserver.latest = this;
  }

  change() {
    this.callback([], this as unknown as MutationObserver);
  }
}

describe('rendered project overflow', () => {
  it.each([0, 0.5, 1, 1.1, 800])(
    'requires more than one pixel of genuine overflow (%ipx)',
    (overflow) => {
      expect(
        hasProjectsOverflow({
          scrollWidth: 1000 + overflow,
          clientWidth: 1000,
        } as HTMLElement),
      ).toBe(overflow > 1);
    },
  );
});

describe('dynamic project layout observation', () => {
  let viewport: EventTarget & { querySelector: ReturnType<typeof vi.fn> };
  let fonts: EventTarget;
  let changed: ReturnType<typeof vi.fn<() => void>>;
  let destroy: (() => void) | undefined;
  const initialGrid = {};

  beforeEach(() => {
    viewport = Object.assign(new EventTarget(), {
      querySelector: vi.fn(() => initialGrid),
    });
    fonts = new EventTarget();
    changed = vi.fn();
    vi.stubGlobal('document', { fonts });
    vi.stubGlobal('ResizeObserver', LayoutResizeObserver);
    vi.stubGlobal('MutationObserver', LayoutMutationObserver);
  });

  afterEach(() => {
    destroy?.();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  function start() {
    destroy = observeProjectsLayout(
      viewport as unknown as HTMLElement,
      changed,
    );
  }

  it('measures immediately and rechecks when the grid or viewport resizes', () => {
    start();
    expect(changed).toHaveBeenCalledOnce();
    expect(LayoutResizeObserver.latest.observe).toHaveBeenCalledWith(viewport);
    expect(LayoutResizeObserver.latest.observe).toHaveBeenCalledWith(
      initialGrid,
    );
    LayoutResizeObserver.latest.change();
    expect(changed).toHaveBeenCalledTimes(2);
  });

  it('follows a replaced grid when future project data is rendered', () => {
    start();
    const nextGrid = {};
    viewport.querySelector.mockReturnValue(nextGrid);
    LayoutMutationObserver.latest.change();
    expect(LayoutResizeObserver.latest.unobserve).toHaveBeenCalledWith(
      initialGrid,
    );
    expect(LayoutResizeObserver.latest.observe).toHaveBeenCalledWith(nextGrid);
    expect(changed).toHaveBeenCalledTimes(2);
    viewport.querySelector.mockReturnValue(null);
    LayoutMutationObserver.latest.change();
    expect(LayoutResizeObserver.latest.unobserve).toHaveBeenCalledWith(
      nextGrid,
    );
  });

  it('updates for late images and font metrics', () => {
    start();
    viewport.dispatchEvent(new Event('load'));
    fonts.dispatchEvent(new Event('loadingdone'));
    expect(changed).toHaveBeenCalledTimes(3);
  });

  it('disconnects observers and ignores stale callbacks after cleanup', () => {
    start();
    const resize = LayoutResizeObserver.latest;
    const mutation = LayoutMutationObserver.latest;
    destroy?.();
    destroy?.();
    expect(resize.disconnect).toHaveBeenCalledOnce();
    expect(mutation.disconnect).toHaveBeenCalledOnce();
    resize.change();
    mutation.change();
    viewport.dispatchEvent(new Event('load'));
    fonts.dispatchEvent(new Event('loadingdone'));
    expect(changed).toHaveBeenCalledOnce();
  });

  it('retains initial and media-load checks when observers are unavailable', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    vi.stubGlobal('MutationObserver', undefined);
    start();
    viewport.dispatchEvent(new Event('load'));
    expect(changed).toHaveBeenCalledTimes(2);
  });
});
