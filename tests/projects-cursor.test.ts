import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createProjectsCursor } from '@/src/components/home/projects-cursor';

class CursorPreference extends EventTarget {
  constructor(public matches: boolean) {
    super();
  }

  change(matches: boolean) {
    this.matches = matches;
    this.dispatchEvent(new Event('change'));
  }
}

class CursorResizeObserver {
  static latest: CursorResizeObserver;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(private callback: ResizeObserverCallback) {
    CursorResizeObserver.latest = this;
  }

  resize() {
    this.callback([], this as unknown as ResizeObserver);
  }
}

describe('project gallery custom cursor', () => {
  let host: {
    dataset: Record<string, string>;
    getBoundingClientRect: ReturnType<typeof vi.fn>;
  };
  let viewport: EventTarget & {
    scrollWidth: number;
    clientWidth: number;
    contains: ReturnType<typeof vi.fn>;
    querySelector: ReturnType<typeof vi.fn>;
  };
  let cursor: {
    style: { transform: string; removeProperty: ReturnType<typeof vi.fn> };
  };
  let desktopMouse: CursorPreference;
  let coarsePointer: CursorPreference;
  let window: EventTarget;
  let document: EventTarget & {
    hidden: boolean;
    elementFromPoint: ReturnType<typeof vi.fn>;
  };
  let frames: Map<number, FrameRequestCallback>;
  let destroy: (() => void) | undefined;
  const card = {};
  const cardChild = { closest: vi.fn(() => card) };

  beforeEach(() => {
    host = {
      dataset: {},
      getBoundingClientRect: vi.fn(() => ({ left: 20, top: 30 })),
    };
    viewport = Object.assign(new EventTarget(), {
      scrollWidth: 1800,
      clientWidth: 1000,
      contains: vi.fn((element: unknown) => element === card),
      querySelector: vi.fn(() => card),
    });
    cursor = { style: { transform: '', removeProperty: vi.fn() } };
    desktopMouse = new CursorPreference(true);
    coarsePointer = new CursorPreference(false);
    window = new EventTarget();
    document = Object.assign(new EventTarget(), {
      hidden: false,
      elementFromPoint: vi.fn(() => cardChild),
    });
    frames = new Map();
    let nextFrame = 0;
    vi.stubGlobal(
      'window',
      Object.assign(window, {
        matchMedia: (query: string) =>
          query === '(any-pointer: coarse)' ? coarsePointer : desktopMouse,
      }),
    );
    vi.stubGlobal('document', document);
    vi.stubGlobal('ResizeObserver', CursorResizeObserver);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.set(++nextFrame, callback);
      return nextFrame;
    });
    vi.stubGlobal('cancelAnimationFrame', (frame: number) => {
      frames.delete(frame);
    });
  });

  afterEach(() => {
    destroy?.();
    destroy = undefined;
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  function start() {
    destroy = createProjectsCursor(
      host as unknown as HTMLElement,
      viewport as unknown as HTMLElement,
      cursor as unknown as HTMLElement,
    );
  }

  function move(properties: Partial<PointerEvent> = {}) {
    const event = Object.assign(
      new Event('pointermove', { cancelable: true }),
      {
        pointerType: 'mouse',
        isPrimary: true,
        clientX: 100,
        clientY: 120,
        ...properties,
      },
    );
    viewport.dispatchEvent(event);
    return event;
  }

  function flush() {
    const queued = [...frames.values()];
    frames.clear();
    queued.forEach((callback) => callback(0));
  }

  function show() {
    move();
    flush();
    expect(host.dataset.cursorVisible).toBe('true');
  }

  function pointer(
    type: string,
    target: EventTarget = viewport,
    properties: Partial<PointerEvent> = {},
  ) {
    const event = Object.assign(new Event(type, { cancelable: true }), {
      pointerType: 'mouse',
      pointerId: 7,
      isPrimary: true,
      button: 0,
      clientX: 100,
      clientY: 120,
      ...properties,
    });
    target.dispatchEvent(event);
    return event;
  }

  it('eases toward the pointer and stops requesting frames when settled', () => {
    start();
    show();
    expect(frames.size).toBe(0);
    move({ clientX: 180, clientY: 200 });
    flush();
    expect(cursor.style.transform).toBe('translate3d(90px, 100px, 0)');
    expect(frames.size).toBe(1);

    for (let step = 0; step < 100 && frames.size; step++) flush();
    expect(frames.size).toBe(0);
    expect(cursor.style.transform).toBe('translate3d(160px, 170px, 0)');
  });

  it('keeps the cursor visible in gaps belonging to the project grid', () => {
    start();
    document.elementFromPoint.mockReturnValue({
      closest: (selector: string) =>
        selector === '[data-projects-grid]' ? card : null,
    });
    show();
  });

  it('tracks a primary press without intercepting dragging or ordinary clicks', () => {
    start();
    const down = pointer('pointerdown');
    flush();
    expect(host.dataset.cursorPressed).toBe('true');
    expect(host.dataset.cursorVisible).toBe('true');
    expect(down.defaultPrevented).toBe(false);

    pointer('pointerup', window, { pointerId: 99 });
    expect(host.dataset.cursorPressed).toBe('true');
    pointer('pointerup', window);
    expect(host.dataset.cursorPressed).toBeUndefined();
    expect(host.dataset.cursorVisible).toBe('true');
  });

  it.each([{ button: 2 }, { isPrimary: false }, { pointerType: 'touch' }])(
    'ignores an ineligible press %j',
    (properties) => {
      start();
      pointer('pointerdown', viewport, properties);
      expect(host.dataset.cursorPressed).toBeUndefined();
      expect(frames.size).toBe(0);
    },
  );

  it('clears pressed feedback on cancellation and lost pointer capture', () => {
    start();
    pointer('pointerdown');
    flush();
    pointer('lostpointercapture');
    expect(host.dataset.cursorPressed).toBeUndefined();

    pointer('pointerdown');
    pointer('pointercancel', window);
    expect(host.dataset.cursorPressed).toBeUndefined();
    expect(host.dataset.cursorVisible).toBeUndefined();
    expect(frames.size).toBe(0);
  });

  it('coalesces pointer updates and shows only after positioning over a card', () => {
    start();
    const first = move();
    const latest = move({ clientX: 150, clientY: 180 });
    expect(host.dataset.cursorVisible).toBeUndefined();
    expect(frames.size).toBe(1);
    expect(first.defaultPrevented).toBe(false);
    expect(latest.defaultPrevented).toBe(false);

    flush();
    expect(cursor.style.transform).toBe('translate3d(130px, 150px, 0)');
    expect(document.elementFromPoint).toHaveBeenCalledWith(150, 180);
    expect(host.getBoundingClientRect).toHaveBeenCalledTimes(1);
    expect(host.dataset.cursorVisible).toBe('true');
  });

  it.each([
    { pointerType: 'touch' },
    { pointerType: 'pen' },
    { isPrimary: false },
  ])(
    'does not hide the native cursor for ineligible input %j',
    (properties) => {
      start();
      show();
      move(properties);
      expect(host.dataset.cursorVisible).toBeUndefined();
      expect(frames.size).toBe(0);
    },
  );

  it.each(['desktop profile', 'coarse pointer', 'hidden document'])(
    'requires an eligible gallery: %s',
    (condition) => {
      if (condition === 'desktop profile') desktopMouse.matches = false;
      if (condition === 'coarse pointer') coarsePointer.matches = true;
      if (condition === 'hidden document') document.hidden = true;
      start();
      move();
      flush();
      expect(host.dataset.cursorVisible).toBeUndefined();
      expect(document.elementFromPoint).not.toHaveBeenCalled();
    },
  );

  it('restores the native cursor over gutters, outside cards, and captured outside movement', () => {
    start();
    show();
    document.elementFromPoint.mockReturnValue({ closest: () => null });
    move();
    flush();
    expect(host.dataset.cursorVisible).toBeUndefined();

    document.elementFromPoint.mockReturnValue(cardChild);
    show();
    viewport.contains.mockReturnValue(false);
    move();
    flush();
    expect(host.dataset.cursorVisible).toBeUndefined();

    viewport.contains.mockReturnValue(true);
    show();
    document.elementFromPoint.mockReturnValue(null);
    move({ clientX: -200 });
    flush();
    expect(host.dataset.cursorVisible).toBeUndefined();
  });

  it.each(['pointerleave', 'pointercancel'])(
    'immediately hides and cancels pending movement on %s',
    (eventType) => {
      start();
      show();
      move({ clientX: 200 });
      viewport.dispatchEvent(new Event(eventType));
      expect(host.dataset.cursorVisible).toBeUndefined();
      expect(frames.size).toBe(0);
      flush();
      expect(host.dataset.cursorVisible).toBeUndefined();
    },
  );

  it.each([
    'blur',
    'resize',
    'keydown',
    'desktop profile',
    'coarse pointer',
    'visibilitychange',
  ])('restores the native cursor on %s', (trigger) => {
    start();
    show();
    if (trigger === 'desktop profile') desktopMouse.change(false);
    else if (trigger === 'coarse pointer') coarsePointer.change(true);
    else if (trigger === 'visibilitychange')
      document.dispatchEvent(new Event(trigger));
    else window.dispatchEvent(new Event(trigger));
    expect(host.dataset.cursorVisible).toBeUndefined();
    expect(frames.size).toBe(0);
  });

  it('rechecks hit testing and coordinates when the page or gallery scrolls', () => {
    start();
    show();
    host.getBoundingClientRect.mockReturnValue({ left: 20, top: -100 });
    const scroll = new Event('scroll', { cancelable: true });
    window.dispatchEvent(scroll);
    flush();
    expect(scroll.defaultPrevented).toBe(false);
    expect(cursor.style.transform).toBe('translate3d(80px, 220px, 0)');

    document.elementFromPoint.mockReturnValue(null);
    window.dispatchEvent(new Event('scroll'));
    flush();
    expect(host.dataset.cursorVisible).toBeUndefined();
  });

  it.each([0, 1])(
    'keeps the normal cursor when overflow is only %ipx',
    (overflow) => {
      viewport.scrollWidth = viewport.clientWidth + overflow;
      start();
      move();
      flush();
      expect(host.dataset.cursorVisible).toBeUndefined();
      expect(document.elementFromPoint).not.toHaveBeenCalled();
      expect(frames.size).toBe(0);
    },
  );

  it('keeps the cursor in place when late images or fonts re-measure the gallery', () => {
    start();
    show();
    CursorResizeObserver.latest.resize();
    expect(host.dataset.cursorVisible).toBe('true');
    flush();
    expect(host.dataset.cursorVisible).toBe('true');
    expect(cursor.style.transform).toBe('translate3d(80px, 90px, 0)');
  });

  it('switches between normal and scrolling cursor when content changes', () => {
    start();
    show();
    viewport.scrollWidth = viewport.clientWidth;
    CursorResizeObserver.latest.resize();
    expect(host.dataset.cursorVisible).toBeUndefined();
    move();
    flush();
    expect(host.dataset.cursorVisible).toBeUndefined();

    viewport.scrollWidth = 1800;
    CursorResizeObserver.latest.resize();
    show();
  });

  it('rechecks overflow before rendering a queued cursor frame', () => {
    start();
    move();
    viewport.scrollWidth = viewport.clientWidth;
    flush();
    expect(host.dataset.cursorVisible).toBeUndefined();
    expect(frames.size).toBe(0);
  });

  it('cleans up safely and isolates Strict Mode setups from stale callbacks', () => {
    start();
    show();
    const previousObserver = CursorResizeObserver.latest;
    move();
    destroy?.();
    destroy?.();
    expect(frames.size).toBe(0);
    expect(host.dataset.cursorVisible).toBeUndefined();
    expect(previousObserver.disconnect).toHaveBeenCalledTimes(1);
    expect(cursor.style.removeProperty).toHaveBeenCalledWith('transform');
    move();
    window.dispatchEvent(new Event('scroll'));
    expect(frames.size).toBe(0);

    start();
    show();
    previousObserver.resize();
    expect(host.dataset.cursorVisible).toBe('true');
  });

  it('keeps window resize cleanup available without ResizeObserver', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    start();
    show();
    window.dispatchEvent(new Event('resize'));
    expect(host.dataset.cursorVisible).toBeUndefined();
  });
});
