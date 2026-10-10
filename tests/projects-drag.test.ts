import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createProjectsDrag } from '@/src/components/home/projects-drag';

class DragPreference extends EventTarget {
  matches = true;

  change(matches: boolean) {
    this.matches = matches;
    this.dispatchEvent(new Event('change'));
  }
}

class DragViewport extends EventTarget {
  dataset: Record<string, string> = {};
  scrollLeft = 100;
  scrollWidth = 1800;
  clientWidth = 1000;
  closest = vi.fn(() => null);
  querySelector = vi.fn(() => null);
  captured = new Set<number>();
  setPointerCapture = vi.fn((pointerId: number) => {
    this.captured.add(pointerId);
  });
  hasPointerCapture = vi.fn((pointerId: number) =>
    this.captured.has(pointerId),
  );
  releasePointerCapture = vi.fn((pointerId: number) => {
    this.captured.delete(pointerId);
    this.dispatchEvent(
      Object.assign(new Event('lostpointercapture'), { pointerId }),
    );
  });
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
    vi.stubGlobal('performance', { now: () => now });
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

  function frame(milliseconds: number) {
    now += milliseconds;
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(now));
  }

  it('prevents selection on the first press and captures only after horizontal intent', () => {
    start();
    expect(pointer('pointerdown').defaultPrevented).toBe(true);
    expect(native('selectstart').defaultPrevented).toBe(true);
    pointer('pointermove', { clientX: 95 });
    expect(viewport.scrollLeft).toBe(100);
    expect(viewport.dataset.dragging).toBeUndefined();
    expect(viewport.setPointerCapture).not.toHaveBeenCalled();

    expect(pointer('pointermove', { clientX: 94 }).defaultPrevented).toBe(true);
    expect(viewport.scrollLeft).toBe(106);
    expect(viewport.dataset.dragging).toBe('true');
    expect(viewport.setPointerCapture).toHaveBeenCalledOnce();
    pointer('pointermove', { clientX: 50 });
    expect(viewport.scrollLeft).toBe(150);
    pointer('pointerup');
    expect(viewport.dataset.dragging).toBeUndefined();
    expect(viewport.releasePointerCapture).toHaveBeenCalledWith(7);
    expect(native('selectstart').defaultPrevented).toBe(false);
  });

  it('preserves ordinary clicks without adding mouse focus highlights', () => {
    start();
    const figure = { focus: vi.fn() };
    viewport.closest.mockReturnValue(figure as never);
    const onClick = vi.fn();
    viewport.addEventListener('click', onClick);

    pointer('pointerdown');
    expect(figure.focus).not.toHaveBeenCalled();
    pointer('pointermove', { clientX: 96, clientY: 122 });
    pointer('pointerup');
    expect(click().defaultPrevented).toBe(false);
    expect(onClick).toHaveBeenCalledOnce();
    expect(viewport.setPointerCapture).not.toHaveBeenCalled();
    expect(viewport.scrollLeft).toBe(100);
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

  it('suppresses only the click following a horizontal drag', () => {
    start();
    const onClick = vi.fn();
    viewport.addEventListener('click', onClick);
    drag();
    pointer('pointerup');
    expect(click().defaultPrevented).toBe(true);
    expect(onClick).not.toHaveBeenCalled();

    pointer('pointerdown');
    pointer('pointerup');
    expect(click().defaultPrevented).toBe(false);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('keeps keyboard activation and fresh clicks available after a drag without a click', () => {
    start();
    drag();
    pointer('pointerup');
    expect(click({ detail: 0 }).defaultPrevented).toBe(false);
    pointer('pointerdown');
    pointer('pointerup');
    expect(click().defaultPrevented).toBe(false);
  });

  it('glides from recent half-velocity over at most one second and stops at its destination', () => {
    start();
    pointer('pointerdown', { timeStamp: 0 });
    pointer('pointermove', { clientX: 80, timeStamp: 100 });
    pointer('pointerup', { timeStamp: 110 });
    expect(viewport.scrollLeft).toBe(120);
    expect(viewport.dataset.dragging).toBeUndefined();
    expect(frames.size).toBe(1);

    frame(250);
    expect(viewport.scrollLeft).toBeCloseTo(177.8125);
    expect(frames.size).toBe(1);
    frame(750);
    expect(viewport.scrollLeft).toBe(220);
    expect(frames.size).toBe(0);
    frame(1000);
    expect(viewport.scrollLeft).toBe(220);
  });

  it('uses the latest movement samples when the user reverses before release', () => {
    start();
    pointer('pointerdown', { timeStamp: 0 });
    pointer('pointermove', { clientX: 50, timeStamp: 100 });
    pointer('pointermove', { clientX: 70, timeStamp: 200 });
    pointer('pointerup', { timeStamp: 210 });
    expect(viewport.scrollLeft).toBe(130);
    frame(1000);
    expect(viewport.scrollLeft).toBe(30);
    expect(frames.size).toBe(0);
  });

  it.each(['left', 'right'])(
    'bounds release gliding at the %s endpoint',
    (edge) => {
      viewport.scrollLeft = edge === 'left' ? 100 : 700;
      start();
      pointer('pointerdown', { timeStamp: 0 });
      pointer('pointermove', {
        clientX: edge === 'left' ? 150 : 50,
        timeStamp: 100,
      });
      pointer('pointerup', { timeStamp: 110 });
      frame(100);
      expect(viewport.scrollLeft).toBeGreaterThanOrEqual(0);
      expect(viewport.scrollLeft).toBeLessThanOrEqual(800);
      frame(100);
      expect(viewport.scrollLeft).toBe(edge === 'left' ? 0 : 800);
      expect(frames.size).toBe(0);
    },
  );

  it.each(['paused release', 'old sample', 'low velocity', 'reduced motion'])(
    'omits release gliding for %s',
    (condition) => {
      if (condition === 'reduced motion') reducedMotion.matches = true;
      start();
      pointer('pointerdown', { timeStamp: 0 });
      pointer('pointermove', {
        clientX: 50,
        timeStamp: condition === 'old sample' ? 200 : 100,
      });
      if (condition === 'low velocity') {
        pointer('pointermove', { clientX: 49, timeStamp: 200 });
      }
      pointer('pointerup', {
        timeStamp:
          condition === 'paused release'
            ? 401
            : condition === 'low velocity' || condition === 'old sample'
              ? 210
              : 110,
      });
      expect(frames.size).toBe(0);
      expect(viewport.scrollLeft).toBe(
        condition === 'reduced motion'
          ? 100
          : condition === 'low velocity'
            ? 151
            : 150,
      );
    },
  );

  it.each([
    'new press',
    'blur',
    'resize',
    'visibilitychange',
    'media change',
    'reduced motion',
    'element resize',
    'wheel',
    'touchstart',
    'keydown',
  ])('stops release gliding immediately on %s', (trigger) => {
    start();
    drag();
    pointer('pointerup');
    expect(frames.size).toBe(1);
    if (trigger === 'new press') pointer('pointerdown');
    else if (trigger === 'media change') preference.change(false);
    else if (trigger === 'reduced motion') reducedMotion.change(true);
    else if (trigger === 'element resize') DragResizeObserver.latest.resize();
    else if (trigger === 'visibilitychange')
      document.dispatchEvent(new Event(trigger));
    else if (trigger === 'wheel' || trigger === 'touchstart')
      expect(native(trigger).defaultPrevented).toBe(false);
    else {
      const event = new Event(trigger, { cancelable: true });
      window.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
    expect(frames.size).toBe(0);
    frame(1000);
    expect(viewport.scrollLeft).toBe(150);
  });

  it('cancels release gliding and ignores its stale callback after cleanup', () => {
    start();
    drag();
    pointer('pointerup');
    const previousFrame = [...frames.values()][0];
    if (!previousFrame) throw new Error('Expected a queued release glide');
    destroy?.();
    expect(frames.size).toBe(0);
    previousFrame(1000);
    expect(viewport.scrollLeft).toBe(150);
    expect(frames.size).toBe(0);
    start();
    pointer('pointerdown');
    previousFrame(2000);
    expect(viewport.scrollLeft).toBe(150);
    expect(frames.size).toBe(0);
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
    expect(viewport.setPointerCapture).not.toHaveBeenCalled();
  });

  it.each([
    'no overflow',
    'non-hover pointer',
    'hidden tab',
    'coarse pointer',
    'reduced motion',
  ])('does not intercept a gallery with %s', (condition) => {
    if (condition === 'no overflow')
      viewport.scrollWidth = viewport.clientWidth;
    else if (condition === 'non-hover pointer') preference.matches = false;
    else if (condition === 'coarse pointer') coarsePointer.matches = true;
    else if (condition === 'reduced motion') reducedMotion.matches = true;
    else document.hidden = true;
    start();
    expect(pointer('pointerdown').defaultPrevented).toBe(false);
    expect(native('dragstart').defaultPrevented).toBe(false);
    pointer('pointermove', { clientX: 50 });
    expect(viewport.scrollLeft).toBe(100);
  });

  it('blocks native image dragging whenever the mouse carousel is available', () => {
    start();
    expect(native('dragstart').defaultPrevented).toBe(true);
    expect(native('selectstart').defaultPrevented).toBe(false);
    pointer('pointerdown');
    expect(native('dragstart').defaultPrevented).toBe(true);
  });

  it('abandons vertical intent without capturing or preventing further page input', () => {
    start();
    pointer('pointerdown');
    expect(
      pointer('pointermove', { clientX: 98, clientY: 130 }).defaultPrevented,
    ).toBe(false);
    pointer('pointermove', { clientX: 50, clientY: 130 });
    expect(viewport.scrollLeft).toBe(100);
    expect(viewport.setPointerCapture).not.toHaveBeenCalled();
    expect(native('selectstart').defaultPrevented).toBe(false);
    pointer('pointerup');
    expect(click().defaultPrevented).toBe(false);
  });

  it('clamps both ends and reverses immediately relative to the original press', () => {
    start();
    pointer('pointerdown');
    pointer('pointermove', { clientX: -1000 });
    expect(viewport.scrollLeft).toBe(800);
    pointer('pointermove', { clientX: 150 });
    expect(viewport.scrollLeft).toBe(50);
    pointer('pointermove', { clientX: 1000 });
    expect(viewport.scrollLeft).toBe(0);
    pointer('pointermove', { clientX: 50 });
    expect(viewport.scrollLeft).toBe(150);
    expect(viewport.setPointerCapture).toHaveBeenCalledOnce();
  });

  it('tracks off-viewport movement and releases only the initiating pointer', () => {
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
    expect(viewport.releasePointerCapture).toHaveBeenCalledWith(7);
    pointer('pointermove', { clientX: -100 });
    expect(viewport.scrollLeft).toBe(150);
    expect(click().defaultPrevented).toBe(false);
  });

  it('clears a failed capture and permits the next gesture', () => {
    viewport.setPointerCapture.mockImplementationOnce(() => {
      throw new Error('Pointer is no longer active');
    });
    start();
    pointer('pointerdown');
    expect(pointer('pointermove', { clientX: 50 }).defaultPrevented).toBe(
      false,
    );
    expect(viewport.dataset.dragging).toBeUndefined();
    expect(viewport.scrollLeft).toBe(100);
    expect(native('selectstart').defaultPrevented).toBe(false);
    expect(click().defaultPrevented).toBe(false);
    drag();
  });

  it.each(['pointercancel', 'lostpointercapture'])(
    'clears capture and pending clicks on %s',
    (eventType) => {
      start();
      drag();
      pointer(eventType, {}, eventType === 'pointercancel' ? window : viewport);
      expect(viewport.dataset.dragging).toBeUndefined();
      pointer('pointermove', { clientX: -100 });
      expect(viewport.scrollLeft).toBe(150);
      expect(click().defaultPrevented).toBe(false);
      expect(native('selectstart').defaultPrevented).toBe(false);
    },
  );

  it.each([
    'blur',
    'resize',
    'visibilitychange',
    'media change',
    'element resize',
  ])('releases active capture on %s', (trigger) => {
    start();
    drag();
    if (trigger === 'media change') preference.change(false);
    else if (trigger === 'element resize') DragResizeObserver.latest.resize();
    else if (trigger === 'visibilitychange')
      document.dispatchEvent(new Event(trigger));
    else window.dispatchEvent(new Event(trigger));

    expect(viewport.dataset.dragging).toBeUndefined();
    expect(viewport.releasePointerCapture).toHaveBeenCalledWith(7);
    expect(click().defaultPrevented).toBe(false);
    pointer('pointermove', { clientX: -100 });
    expect(viewport.scrollLeft).toBe(150);
  });

  it('rechecks actual overflow while dragging', () => {
    start();
    drag();
    viewport.scrollWidth = viewport.clientWidth;
    expect(pointer('pointermove', { clientX: 20 }).defaultPrevented).toBe(
      false,
    );
    expect(viewport.dataset.dragging).toBeUndefined();
    expect(viewport.releasePointerCapture).toHaveBeenCalledWith(7);
    expect(click().defaultPrevented).toBe(false);
  });

  it('preserves native wheel, touch scrolling, and keyboard scrolling', () => {
    start();
    for (const type of ['wheel', 'touchstart', 'touchmove', 'keydown']) {
      expect(native(type).defaultPrevented).toBe(false);
    }
    expect(viewport.scrollLeft).toBe(100);
    expect(viewport.setPointerCapture).not.toHaveBeenCalled();
  });

  it('cleans up safely and isolates Strict Mode setups from stale callbacks', () => {
    start();
    drag();
    const previousObserver = DragResizeObserver.latest;
    destroy?.();
    destroy?.();
    expect(viewport.dataset.dragging).toBeUndefined();
    expect(viewport.captured.size).toBe(0);
    expect(previousObserver.disconnect).toHaveBeenCalledOnce();
    expect(pointer('pointerdown').defaultPrevented).toBe(false);
    expect(native('dragstart').defaultPrevented).toBe(false);
    expect(native('selectstart').defaultPrevented).toBe(false);
    pointer('pointermove', { clientX: 0 });
    expect(viewport.scrollLeft).toBe(150);

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
    expect(viewport.releasePointerCapture).toHaveBeenCalledWith(7);
  });
});
