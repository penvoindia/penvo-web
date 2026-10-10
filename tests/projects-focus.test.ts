import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { revealProjectsFocus } from '@/src/components/home/projects-focus';

type Bounds = { left: number; right: number };

function card(bounds: Bounds, keyboard = true) {
  const figure = {
    getBoundingClientRect: vi.fn(() => bounds),
    matches: vi.fn(
      (selector: string) => selector === ':focus-visible' && keyboard,
    ),
    scrollIntoView: vi.fn(),
    closest: vi.fn((): unknown => figure),
  };
  return figure;
}

describe('keyboard focus in the project strip', () => {
  let viewport: EventTarget & {
    contains: ReturnType<typeof vi.fn>;
    getBoundingClientRect: ReturnType<typeof vi.fn>;
  };
  let destroy: (() => void) | undefined;

  beforeEach(() => {
    viewport = Object.assign(new EventTarget(), {
      contains: vi.fn(() => true),
      getBoundingClientRect: vi.fn(() => ({ left: 20, right: 1420 })),
    });
    destroy = revealProjectsFocus(viewport as unknown as HTMLElement);
  });

  afterEach(() => {
    destroy?.();
    destroy = undefined;
  });

  function focus(target: unknown) {
    const event = new Event('focusin');
    Object.defineProperty(event, 'target', { value: target });
    viewport.dispatchEvent(event);
  }

  it.each([
    ['a sliver at the clip edge', { left: 1419.97, right: 1866 }],
    ['half past the end', { left: 1200, right: 1512 }],
    ['half before the start', { left: -100, right: 212 }],
  ])('reveals a cover showing %s', (_, bounds) => {
    const figure = card(bounds);
    focus(figure);
    expect(figure.scrollIntoView).toHaveBeenCalledWith({
      block: 'nearest',
      inline: 'nearest',
    });
  });

  it('leaves a fully visible cover in place, allowing sub-pixel rounding', () => {
    const figure = card({ left: 19.6, right: 1420.4 });
    focus(figure);
    expect(figure.scrollIntoView).not.toHaveBeenCalled();
  });

  it('ignores focus from pointer presses', () => {
    const figure = card({ left: 1200, right: 1512 }, false);
    focus(figure);
    expect(figure.scrollIntoView).not.toHaveBeenCalled();
  });

  it('ignores the region itself and covers outside the strip', () => {
    focus({ closest: () => null });
    const outside = card({ left: 1200, right: 1512 });
    viewport.contains.mockReturnValue(false);
    focus(outside);
    expect(outside.scrollIntoView).not.toHaveBeenCalled();
  });

  it('stops listening after cleanup', () => {
    destroy?.();
    destroy = undefined;
    const figure = card({ left: 1200, right: 1512 });
    focus(figure);
    expect(figure.scrollIntoView).not.toHaveBeenCalled();
  });
});
