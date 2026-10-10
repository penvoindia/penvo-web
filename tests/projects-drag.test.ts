import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createProjectsDrag,
  easeOut,
  resistOvershoot,
} from '@/src/components/home/projects-drag';

class DragPreference extends EventTarget {
  matches = true;

  change(matches: boolean) {
    this.matches = matches;
    this.dispatchEvent(new Event('change'));
  }
}

class DragGrid {
  values = new Map<string, string>();
  style = {
    setProperty: vi.fn((name: string, value: string) => {
      this.values.set(name, value);
    }),
    removeProperty: vi.fn((name: string) => {
      this.values.delete(name);
    }),
  };
}

class DragViewport extends EventTarget {
  dataset: Record<string, string> = {};
  scrollLeft = 100;
  scrollWidth = 1800;
  clientWidth = 1000;
  grid = new DragGrid();
  querySelector = vi.fn(() => this.grid);
}

class DragResizeObserver {
  static latest: DragResizeObserver;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(private callback: ResizeObserverCallback) {
    DragResizeObserver.latest = this;
  }

  resize() {
    this.callback([], this as unknown as ResizeObserver);
  }
}

describe('reference free-mode curves', () => {
  it.each([
    [10, 6],
    [20, 11],
    [50, 26],
    [100, 49],
    [150, 69],
    [200, 89],
    [250, 108],
    [300, 126],
    [350, 144],
    [400, 161],
  ])(
    'moves %ipx of pull past an edge by the measured %ipx',
    (distance, travel) => {
      expect(Math.floor(resistOvershoot(distance))).toBe(travel);
    },
  );

  it('has no travel without a pull past the edge', () => {
    expect(resistOvershoot(0)).toBe(0);
    expect(resistOvershoot(1)).toBe(0);
    expect(resistOvershoot(-20)).toBe(0);
  });

  it.each([
    [0, 0],
    [0.1, 0.160572],
    [0.25, 0.378138],
    [0.5, 0.684643],
    [0.75, 0.906535],
    [0.9, 0.982973],
    [1, 1],
  ])('follows CSS ease-out at %f', (progress, value) => {
    expect(easeOut(progress)).toBeCloseTo(value, 5);
  });
});

describe('projects native mouse dragging', () => {
  let viewport: DragViewport;
  let preference: DragPreference;
  let reducedMotion: DragPreference;
  let coarsePointer: DragPreference;
  let window: EventTarget;
  let document: EventTarget & {
    hidden: boolean;
    getSelection: ReturnType<typeof vi.fn>;
  };
  let frames: Map<number, FrameRequestCallback>;
  let now: number;
  let destroy: (() => void) | undefined;

  beforeEach(() => {
    viewport = new DragViewport();
    preference = new DragPreference();
    reducedMotion = new DragPreference();
    reducedMotion.matches = false;
    coarsePointer = new DragPreference();
    coarsePointer.matches = false;
    window = new EventTarget();
    document = Object.assign(new EventTarget(), {
      hidden: false,
      getSelection: vi.fn(() => null),
    });
    frames = new Map();
    now = 0;
    let nextFrame = 0;
    vi.stubGlobal(
      'window',
      Object.assign(window, {
        matchMedia: (query: string) =>
          query === '(prefers-reduced-motion: reduce)'
            ? reducedMotion
            : query === '(any-pointer: coarse)'
              ? coarsePointer
              : preference,
        requestAnimationFrame: (callback: FrameRequestCallback) => {
          frames.set(++nextFrame, callback);
          return nextFrame;
        },
        cancelAnimationFrame: (frame: number) => frames.delete(frame),
      }),
    );
    vi.stubGlobal('document', document);
    vi.stubGlobal('ResizeObserver', DragResizeObserver);
  });

  afterEach(() => {
    destroy?.();
    destroy = undefined;
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  function start() {
    destroy = createProjectsDrag(viewport as unknown as HTMLElement);
  }

  function pointer(
    type: string,
    properties: Partial<PointerEvent> = {},
    target: EventTarget = type === 'pointerdown' ? viewport : window,
  ) {
    const { timeStamp = now + 16, ...details } = properties;
    now = timeStamp;
    const event = Object.assign(new Event(type, { cancelable: true }), {
      pointerType: 'mouse',
      pointerId: 7,
      isPrimary: true,
      button: 0,
      buttons: 1,
      clientX: 100,
      clientY: 120,
      ...details,
    });
    Object.defineProperty(event, 'timeStamp', { value: timeStamp });
    target.dispatchEvent(event);
    return event;
  }

  function click(properties: Partial<MouseEvent> = {}) {
    const event = Object.assign(new Event('click', { cancelable: true }), {
      button: 0,
      detail: 1,
      ...properties,
    });
    viewport.dispatchEvent(event);
    return event;
  }

  function native(type: string, target: EventTarget = viewport) {
    const event = new Event(type, { cancelable: true });
    target.dispatchEvent(event);
    return event;
  }

  function drag() {
    pointer('pointerdown');
    pointer('pointermove', { clientX: 50 });
    expect(viewport.dataset.dragging).toBe('true');
    expect(viewport.scrollLeft).toBe(150);
  }

  // Releases 0.625px/ms to the left: twenty pixels in the last sixteen milliseconds.
  function flick() {
    pointer('pointerdown');
    pointer('pointermove', { clientX: 90 });
    pointer('pointermove', { clientX: 70 });
    pointer('pointerup');
  }

  function frame(milliseconds: number) {
    now += milliseconds;
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(now));
  }

  function overshoot() {
    return Number.parseFloat(
      viewport.grid.values.get('--projects-overshoot') ?? '0',
    );
  }

  it('follows the pointer from the first pixel after preventing selection', () => {
    start();
    expect(pointer('pointerdown').defaultPrevented).toBe(true);
    expect(native('selectstart').defaultPrevented).toBe(true);
    expect(pointer('pointermove', { clientX: 99 }).defaultPrevented).toBe(true);
    expect(viewport.scrollLeft).toBe(101);
    expect(viewport.dataset.dragging).toBe('true');
    pointer('pointermove', { clientX: 50 });
    expect(viewport.scrollLeft).toBe(150);
    pointer('pointerup', { timeStamp: now + 400 });
    expect(viewport.dataset.dragging).toBeUndefined();
    expect(frames.size).toBe(0);
    expect(native('selectstart').defaultPrevented).toBe(false);
  });

  it('keeps ordinary clicks and suppresses only the click after any drag', () => {
    start();
    const onClick = vi.fn();
    viewport.addEventListener('click', onClick);
    pointer('pointerdown');
    pointer('pointerup');
    expect(click().defaultPrevented).toBe(false);
    expect(onClick).toHaveBeenCalledOnce();

    pointer('pointerdown');
    pointer('pointermove', { clientX: 99 });
    pointer('pointerup', { timeStamp: now + 400 });
    expect(click().defaultPrevented).toBe(true);
    expect(onClick).toHaveBeenCalledOnce();
    expect(click().defaultPrevented).toBe(false);
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('keeps keyboard activation available after a drag', () => {
    start();
    drag();
    pointer('pointerup', { timeStamp: now + 400 });
    expect(click({ detail: 0 }).defaultPrevented).toBe(false);
  });

  it('leaves gestures steeper than 45 degrees to the page once 5px away', () => {
    start();
    pointer('pointerdown');
    pointer('pointermove', { clientX: 98, clientY: 124 });
    expect(viewport.scrollLeft).toBe(102);
    expect(
      pointer('pointermove', { clientX: 97, clientY: 126 }).defaultPrevented,
    ).toBe(false);
    pointer('pointermove', { clientX: 50, clientY: 200 });
    expect(viewport.scrollLeft).toBe(102);
    expect(viewport.dataset.dragging).toBeUndefined();
    expect(native('selectstart', document).defaultPrevented).toBe(false);
    pointer('pointerup');
    expect(click().defaultPrevented).toBe(false);
  });

  it('keeps a 45 degree or level gesture horizontal', () => {
    start();
    pointer('pointerdown');
    pointer('pointermove', { clientX: 96, clientY: 124 });
    pointer('pointermove', { clientX: 60, clientY: 200 });
    expect(viewport.scrollLeft).toBe(140);
    pointer('pointerup', { timeStamp: now + 400 });

    pointer('pointerdown');
    pointer('pointermove', { clientX: 99 });
    pointer('pointermove', { clientX: 90, clientY: 200 });
    expect(viewport.scrollLeft).toBe(150);
  });

  it('resists past both edges with the reference power curve', () => {
    viewport.scrollLeft = 0;
    start();
    pointer('pointerdown');
    pointer('pointermove', { clientX: 300 });
    expect(viewport.scrollLeft).toBe(0);
    expect(overshoot()).toBeCloseTo(200 ** 0.85 - 1);
    pointer('pointermove', { clientX: 101 });
    expect(overshoot()).toBe(0);
    expect(viewport.grid.values.has('--projects-overshoot')).toBe(false);
    pointer('pointermove', { clientX: -900 });
    expect(viewport.scrollLeft).toBe(800);
    expect(overshoot()).toBeCloseTo(-(200 ** 0.85 - 1));
  });

  it('returns from an edge over 600ms ease-out without momentum', () => {
    viewport.scrollLeft = 0;
    start();
    pointer('pointerdown');
    pointer('pointermove', { clientX: 200 });
    pointer('pointermove', { clientX: 300 });
    const pulled = overshoot();
    pointer('pointerup');
    frame(16);
    expect(overshoot()).toBeCloseTo(pulled);
    frame(300);
    expect(overshoot()).toBeCloseTo(pulled * (1 - 0.684643), 3);
    frame(300);
    expect(overshoot()).toBe(0);
    expect(viewport.scrollLeft).toBe(0);
    expect(frames.size).toBe(0);
  });

  it('glides half the release velocity for 1000ms with ease-out', () => {
    start();
    flick();
    frame(16);
    expect(viewport.scrollLeft).toBe(130);
    frame(500);
    expect(viewport.scrollLeft).toBeCloseTo(130 + 625 * 0.684643, 3);
    frame(500);
    expect(viewport.scrollLeft).toBe(755);
    expect(frames.size).toBe(0);
  });

  it('bounces twenty times the velocity past an edge, then returns over 600ms', () => {
    viewport.scrollLeft = 700;
    start();
    flick();
    // 625px of momentum would pass the end; the bounce peaks 12.5px past it.
    frame(16);
    frame((812.5 - 730) / 0.625);
    expect(viewport.scrollLeft).toBe(800);
    expect(overshoot()).toBeCloseTo(-12.5);
    frame(16);
    expect(overshoot()).toBeCloseTo(-12.5);
    frame(300);
    expect(overshoot()).toBeCloseTo(-12.5 * (1 - 0.684643), 3);
    frame(300);
    expect(overshoot()).toBe(0);
    expect(viewport.scrollLeft).toBe(800);
    expect(frames.size).toBe(0);
  });

  it('uses the latest movement samples when the user reverses before release', () => {
    start();
    pointer('pointerdown');
    pointer('pointermove', { clientX: 60 });
    pointer('pointermove', { clientX: 80 });
    pointer('pointerup');
    frame(16);
    frame((120 + 12.5) / 0.625);
    expect(viewport.scrollLeft).toBe(0);
    expect(overshoot()).toBeCloseTo(12.5);
  });

  it.each(['paused release', 'old sample', 'low velocity', 'reduced motion'])(
    'skips momentum after a %s',
    (condition) => {
      start();
      pointer('pointerdown');
      pointer('pointermove', { clientX: 90 });
      if (condition === 'old sample') {
        pointer('pointermove', { clientX: 70, timeStamp: now + 151 });
      } else if (condition === 'low velocity') {
        pointer('pointermove', { clientX: 89, timeStamp: now + 40 });
      } else {
        pointer('pointermove', { clientX: 70 });
      }
      if (condition === 'reduced motion') reducedMotion.matches = true;
      const left = viewport.scrollLeft;
      pointer(
        'pointerup',
        condition === 'paused release' ? { timeStamp: now + 301 } : {},
      );
      expect(frames.size).toBe(0);
      expect(viewport.scrollLeft).toBe(left);
    },
  );

  it('drags with reduced motion and returns from an edge immediately', () => {
    viewport.scrollLeft = 0;
    reducedMotion.matches = true;
    start();
    expect(pointer('pointerdown').defaultPrevented).toBe(true);
    pointer('pointermove', { clientX: 300 });
    expect(overshoot()).toBeGreaterThan(0);
    pointer('pointerup');
    expect(overshoot()).toBe(0);
    expect(viewport.scrollLeft).toBe(0);
    expect(frames.size).toBe(0);
  });

  it('keeps returning to an edge while a press is held, then drags on without a jump', () => {
    viewport.scrollLeft = 700;
    start();
    flick();
    frame(16);
    frame((812.5 - 730) / 0.625);
    expect(pointer('pointerdown', { clientX: 400 }).defaultPrevented).toBe(
      true,
    );
    expect(frames.size).toBe(1);
    frame(16);
    frame(300);
    const held = overshoot();
    expect(held).toBeCloseTo(-12.5 * (1 - 0.684643), 3);
    pointer('pointermove', { clientX: 400 });
    expect(frames.size).toBe(0);
    expect(overshoot()).toBeCloseTo(held);
    pointer('pointermove', { clientX: 390 });
    expect(overshoot()).toBeCloseTo(
      -resistOvershoot((1 - held) ** (1 / 0.85) + 10),
    );
    pointer('pointerup', { timeStamp: now + 400 });
    frame(16);
    frame(600);
    expect(overshoot()).toBe(0);
    expect(viewport.scrollLeft).toBe(800);
    expect(frames.size).toBe(0);
  });

  it('lets a still press past an edge finish its return', () => {
    viewport.scrollLeft = 0;
    start();
    pointer('pointerdown');
    pointer('pointermove', { clientX: 300 });
    pointer('pointerup');
    frame(16);
    frame(100);
    pointer('pointerdown');
    pointer('pointerup');
    expect(frames.size).toBe(1);
    expect(click().defaultPrevented).toBe(false);
    frame(16);
    frame(600);
    expect(overshoot()).toBe(0);
    expect(frames.size).toBe(0);
  });

  it.each([1, 2])('leaves motion running for mouse button %i', (button) => {
    viewport.scrollLeft = 700;
    start();
    flick();
    frame(16);
    frame(50);
    expect(pointer('pointerdown', { button }).defaultPrevented).toBe(false);
    expect(frames.size).toBe(1);
    frame((812.5 - 730) / 0.625);
    expect(overshoot()).toBeCloseTo(-12.5);
  });

  it('bounces the full amount at the far end even when momentum barely passes it', () => {
    viewport.scrollLeft = 150;
    start();
    flick();
    // 625px of momentum from 180 ends 5px past the end; the bounce still peaks 12.5px past.
    frame(16);
    frame((812.5 - 180) / 0.625);
    expect(viewport.scrollLeft).toBe(800);
    expect(overshoot()).toBeCloseTo(-12.5);
  });

  it('bounces only as far as momentum reaches at the start edge', () => {
    viewport.scrollLeft = 650;
    start();
    pointer('pointerdown');
    pointer('pointermove', { clientX: 110 });
    pointer('pointermove', { clientX: 130 });
    pointer('pointerup');
    // From 620, -0.625px/ms reaches 5px past the start, inside the 12.5px bounce.
    frame(16);
    frame((620 + 5) / 0.625);
    expect(viewport.scrollLeft).toBe(0);
    expect(overshoot()).toBeCloseTo(5);
  });

  it('freezes a glide in place when pressed', () => {
    start();
    flick();
    frame(16);
    frame(500);
    const left = viewport.scrollLeft;
    pointer('pointerdown');
    frame(500);
    expect(viewport.scrollLeft).toBe(left);
    expect(frames.size).toBe(0);
  });

  it.each(['wheel', 'touchstart'])(
    'hands momentum and bounce to native %s input',
    (type) => {
      viewport.scrollLeft = 700;
      start();
      flick();
      frame(16);
      frame((812.5 - 730) / 0.625);
      expect(native(type).defaultPrevented).toBe(false);
      expect(frames.size).toBe(0);
      expect(overshoot()).toBe(0);
    },
  );

  it('keeps gliding while late images re-measure an unchanged strip', () => {
    start();
    flick();
    frame(16);
    frame(200);
    DragResizeObserver.latest.resize();
    expect(frames.size).toBe(1);
    viewport.scrollWidth = 2000;
    DragResizeObserver.latest.resize();
    expect(frames.size).toBe(0);
  });

  it('keeps a drag through re-measurement unless its extent changes', () => {
    start();
    drag();
    DragResizeObserver.latest.resize();
    expect(viewport.dataset.dragging).toBe('true');
    viewport.scrollWidth = 1700;
    DragResizeObserver.latest.resize();
    expect(viewport.dataset.dragging).toBeUndefined();
  });

  it('cancels gliding and ignores its stale callback after cleanup', () => {
    start();
    flick();
    frame(16);
    const stale = [...frames.values()][0];
    destroy?.();
    destroy = undefined;
    const left = viewport.scrollLeft;
    stale?.(now + 500);
    expect(viewport.scrollLeft).toBe(left);
    expect(frames.size).toBe(0);
  });

  it('prevents background selection outside the viewport only during the gallery gesture', () => {
    start();
    expect(native('selectstart', document).defaultPrevented).toBe(false);
    pointer('pointerdown');
    expect(native('selectstart', document).defaultPrevented).toBe(true);
    expect(native('dragstart', document).defaultPrevented).toBe(true);
    pointer('pointermove', { clientX: -100 });
    expect(viewport.scrollLeft).toBe(300);
    expect(native('selectstart', document).defaultPrevented).toBe(true);
    pointer('pointerup');
    expect(native('selectstart', document).defaultPrevented).toBe(false);
    expect(native('dragstart', document).defaultPrevented).toBe(false);
  });

  it('clears only existing selections that intersect the project gallery', () => {
    const range = { intersectsNode: vi.fn(() => true) };
    const selection = {
      rangeCount: 1,
      getRangeAt: vi.fn(() => range),
      removeAllRanges: vi.fn(),
    };
    document.getSelection.mockReturnValue(selection);
    start();
    pointer('pointerdown');
    expect(range.intersectsNode).toHaveBeenCalledWith(viewport);
    expect(selection.removeAllRanges).toHaveBeenCalledOnce();
    range.intersectsNode.mockReturnValue(false);
    document.dispatchEvent(new Event('selectionchange'));
    expect(selection.removeAllRanges).toHaveBeenCalledOnce();
    range.intersectsNode.mockReturnValue(true);
    document.dispatchEvent(new Event('selectionchange'));
    expect(selection.removeAllRanges).toHaveBeenCalledTimes(2);
    pointer('pointerup');
    document.dispatchEvent(new Event('selectionchange'));
    expect(selection.removeAllRanges).toHaveBeenCalledTimes(2);
  });

  it('restores background selection after interruption and cleanup', () => {
    start();
    drag();
    window.dispatchEvent(new Event('keydown'));
    expect(native('selectstart', document).defaultPrevented).toBe(false);
    expect(viewport.dataset.dragging).toBeUndefined();
    viewport.scrollLeft = 100;
    drag();
    destroy?.();
    expect(native('selectstart', document).defaultPrevented).toBe(false);
    expect(native('dragstart', document).defaultPrevented).toBe(false);
  });

  it('updates drag availability as the featured list grows or shrinks', () => {
    viewport.scrollWidth = viewport.clientWidth;
    start();
    expect(viewport.dataset.scrollable).toBeUndefined();
    expect(pointer('pointerdown').defaultPrevented).toBe(false);

    viewport.scrollWidth = 1800;
    DragResizeObserver.latest.resize();
    expect(viewport.dataset.scrollable).toBe('true');
    drag();

    viewport.scrollWidth = viewport.clientWidth + 1;
    DragResizeObserver.latest.resize();
    expect(viewport.dataset.scrollable).toBeUndefined();
    expect(viewport.dataset.dragging).toBeUndefined();
    expect(pointer('pointerdown').defaultPrevented).toBe(false);
    expect(native('selectstart', document).defaultPrevented).toBe(false);
  });

  it.each([
    { pointerType: 'touch' },
    { pointerType: 'pen' },
    { isPrimary: false },
    { button: 1 },
    { button: 2 },
  ])('preserves native input for an ineligible pointer %j', (properties) => {
    start();
    expect(pointer('pointerdown', properties).defaultPrevented).toBe(false);
    expect(pointer('pointermove', { clientX: 50 }).defaultPrevented).toBe(
      false,
    );
    expect(native('selectstart').defaultPrevented).toBe(false);
    expect(viewport.scrollLeft).toBe(100);
  });

  it.each(['no overflow', 'non-hover pointer', 'hidden tab', 'coarse pointer'])(
    'does not intercept a gallery with %s',
    (condition) => {
      if (condition === 'no overflow')
        viewport.scrollWidth = viewport.clientWidth;
      else if (condition === 'non-hover pointer') preference.matches = false;
      else if (condition === 'coarse pointer') coarsePointer.matches = true;
      else document.hidden = true;
      start();
      expect(pointer('pointerdown').defaultPrevented).toBe(false);
      expect(native('dragstart').defaultPrevented).toBe(false);
      pointer('pointermove', { clientX: 50 });
      expect(viewport.scrollLeft).toBe(100);
    },
  );

  it('blocks native image dragging whenever the mouse carousel is available', () => {
    start();
    expect(native('dragstart').defaultPrevented).toBe(true);
    expect(native('selectstart').defaultPrevented).toBe(false);
    pointer('pointerdown');
    expect(native('dragstart').defaultPrevented).toBe(true);
  });

  it('tracks movement outside the viewport for the initiating pointer only', () => {
    start();
    drag();
    pointer('pointermove', { pointerId: 99, clientX: -100 });
    pointer('pointerup', { pointerId: 99 });
    pointer('pointercancel', { pointerId: 99 });
    expect(viewport.scrollLeft).toBe(150);
    expect(viewport.dataset.dragging).toBe('true');
    pointer('pointermove', { clientX: -100 });
    expect(viewport.scrollLeft).toBe(300);
    pointer('pointerup');
    expect(viewport.dataset.dragging).toBeUndefined();
  });

  it('ends a gesture immediately when the primary mouse button is lost', () => {
    start();
    drag();
    expect(
      pointer('pointermove', { clientX: 10, buttons: 0 }).defaultPrevented,
    ).toBe(false);
    expect(viewport.dataset.dragging).toBeUndefined();
    pointer('pointermove', { clientX: -100 });
    expect(viewport.scrollLeft).toBe(150);
    expect(click().defaultPrevented).toBe(false);
  });

  it.each([
    'pointercancel',
    'blur',
    'resize',
    'keydown',
    'visibilitychange',
    'media change',
    'reduced motion change',
    'coarse pointer change',
  ])('interrupts a gesture and its overshoot on %s', (trigger) => {
    viewport.scrollLeft = 0;
    start();
    pointer('pointerdown');
    pointer('pointermove', { clientX: 300 });
    expect(overshoot()).toBeGreaterThan(0);
    if (trigger === 'pointercancel') pointer(trigger);
    else if (trigger === 'media change') preference.change(false);
    else if (trigger === 'reduced motion change') reducedMotion.change(true);
    else if (trigger === 'coarse pointer change') coarsePointer.change(true);
    else if (trigger === 'visibilitychange')
      document.dispatchEvent(new Event(trigger));
    else window.dispatchEvent(new Event(trigger));

    expect(viewport.dataset.dragging).toBeUndefined();
    expect(overshoot()).toBe(0);
    expect(native('selectstart', document).defaultPrevented).toBe(false);
    pointer('pointermove', { clientX: 400 });
    expect(overshoot()).toBe(0);
    pointer('pointerup');
    expect(click().defaultPrevented).toBe(false);
  });

  it('rechecks actual overflow while dragging', () => {
    start();
    drag();
    viewport.scrollWidth = viewport.clientWidth;
    expect(pointer('pointermove', { clientX: 20 }).defaultPrevented).toBe(
      false,
    );
    expect(viewport.dataset.dragging).toBeUndefined();
    expect(click().defaultPrevented).toBe(false);
  });

  it('preserves native wheel, touch scrolling, and keyboard scrolling', () => {
    start();
    for (const type of ['wheel', 'touchstart', 'touchmove', 'keydown']) {
      expect(native(type).defaultPrevented).toBe(false);
    }
    expect(viewport.scrollLeft).toBe(100);
  });

  it('cleans up safely and isolates Strict Mode setups from stale callbacks', () => {
    viewport.scrollLeft = 0;
    start();
    pointer('pointerdown');
    pointer('pointermove', { clientX: 300 });
    const previousObserver = DragResizeObserver.latest;
    destroy?.();
    destroy?.();
    expect(viewport.dataset.dragging).toBeUndefined();
    expect(overshoot()).toBe(0);
    expect(previousObserver.disconnect).toHaveBeenCalledOnce();
    expect(pointer('pointerdown').defaultPrevented).toBe(false);
    expect(native('dragstart').defaultPrevented).toBe(false);
    expect(native('selectstart').defaultPrevented).toBe(false);
    pointer('pointermove', { clientX: 0 });
    expect(viewport.scrollLeft).toBe(0);

    viewport.scrollLeft = 100;
    start();
    drag();
    previousObserver.resize();
    expect(viewport.dataset.dragging).toBe('true');
    pointer('pointerup');
    expect(click().defaultPrevented).toBe(true);
  });

  it('keeps window resize cleanup available without ResizeObserver', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    start();
    drag();
    window.dispatchEvent(new Event('resize'));
    expect(viewport.dataset.dragging).toBeUndefined();
  });
});
