import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  contactGreetings,
  createContactGreetingMotion,
} from '@/src/components/home/contact-greeting-motion';

class GreetingButton extends EventTarget {
  disabled = true;
  title = '';
  attributes = new Map<string, string>();
  word = {
    textContent: 'Hi.',
    lang: 'en',
    dir: '',
    dataset: {} as Record<string, string>,
  };

  querySelector() {
    return this.word;
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
}

class MotionPreference extends EventTarget {
  matches = false;

  change(matches: boolean) {
    this.matches = matches;
    this.dispatchEvent(new Event('change'));
  }
}

class GreetingDocument extends EventTarget {
  visibilityState = 'visible';
  activeElement: GreetingButton | null = null;

  changeVisibility(value: string) {
    this.visibilityState = value;
    this.dispatchEvent(new Event('visibilitychange'));
  }
}

class GreetingObserver {
  static latest: GreetingObserver;
  target: Element | undefined;
  disconnect = vi.fn();

  constructor(private callback: IntersectionObserverCallback) {
    GreetingObserver.latest = this;
  }

  observe(target: Element) {
    this.target = target;
  }

  change(inView: boolean) {
    this.callback(
      [
        {
          target: this.target,
          isIntersecting: inView,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }
}

describe('contact greeting motion', () => {
  let button: GreetingButton;
  let preference: MotionPreference;
  let document: GreetingDocument;
  let destroy: (() => void) | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    button = new GreetingButton();
    preference = new MotionPreference();
    document = new GreetingDocument();
    vi.stubGlobal('window', { matchMedia: () => preference });
    vi.stubGlobal('document', document);
    vi.stubGlobal('IntersectionObserver', GreetingObserver);
    vi.stubGlobal('getComputedStyle', () => ({
      getPropertyValue: () => '180ms',
    }));
  });

  afterEach(() => {
    destroy?.();
    destroy = undefined;
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function start() {
    destroy = createContactGreetingMotion(
      button as unknown as HTMLButtonElement,
    );
  }

  function enterView() {
    GreetingObserver.latest.change(true);
  }

  function nextGreeting() {
    vi.advanceTimersByTime(1780);
  }

  it('starts in view and cycles through the reference languages with the shared fade duration', () => {
    start();
    vi.advanceTimersByTime(5000);
    expect(button.word.textContent).toBe('Hi.');
    expect(vi.getTimerCount()).toBe(0);
    expect(button.disabled).toBe(false);
    expect(button.title).toBe('Pause greeting rotation');

    enterView();
    vi.advanceTimersByTime(1600);
    expect(button.word.dataset.swapping).toBe('true');
    expect(button.word.textContent).toBe('Hi.');
    vi.advanceTimersByTime(180);
    expect(button.word.textContent).toBe('Olá.');
    expect(button.word.lang).toBe('pt');
    expect(button.word.dir).toBe('auto');
    expect(button.word.dataset.swapping).toBe('false');

    for (const greeting of [
      ...contactGreetings.slice(2),
      contactGreetings[0],
    ]) {
      vi.advanceTimersByTime(1600);
      expect(button.word.textContent).toBe(greeting.text);
      expect(button.word.lang).toBe(greeting.lang);
    }
    expect(vi.getTimerCount()).toBe(1);
  });

  it('cancels an interrupted fade offscreen and resumes without skipping greetings or catching up', () => {
    start();
    enterView();
    vi.advanceTimersByTime(1600);
    GreetingObserver.latest.change(false);
    expect(button.word.dataset.swapping).toBe('false');
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(10_000);
    expect(button.word.textContent).toBe('Hi.');

    enterView();
    vi.advanceTimersByTime(1599);
    expect(button.word.dataset.swapping).toBe('false');
    vi.advanceTimersByTime(181);
    expect(button.word.textContent).toBe('Olá.');
  });

  it('keeps the current greeting visible when a tab is hidden and resumes on return', () => {
    start();
    enterView();
    nextGreeting();
    vi.advanceTimersByTime(1420);
    expect(button.word.dataset.swapping).toBe('true');
    document.changeVisibility('hidden');
    vi.advanceTimersByTime(5000);
    expect(button.word.textContent).toBe('Olá.');
    expect(button.word.dataset.swapping).toBe('false');
    expect(vi.getTimerCount()).toBe(0);

    document.changeVisibility('visible');
    nextGreeting();
    expect(button.word.textContent).toBe('Hola.');
  });

  it('uses a static disabled control for reduced motion and handles live preference changes', () => {
    preference.matches = true;
    start();
    enterView();
    vi.advanceTimersByTime(5000);
    expect(button.disabled).toBe(true);
    expect(button.word.textContent).toBe('Hi.');
    expect(vi.getTimerCount()).toBe(0);

    preference.change(false);
    vi.advanceTimersByTime(1600);
    expect(button.disabled).toBe(false);
    expect(button.word.dataset.swapping).toBe('true');
    preference.change(true);
    expect(button.word.dataset.swapping).toBe('false');
    expect(button.disabled).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    button.dispatchEvent(new Event('click'));
    expect(button.getAttribute('aria-pressed')).toBe('false');

    preference.change(false);
    nextGreeting();
    expect(button.word.textContent).toBe('Olá.');
  });

  it('pauses for mouse hover and keyboard focus, including during a fade', () => {
    start();
    enterView();
    button.dispatchEvent(new Event('pointerenter'));
    vi.advanceTimersByTime(5000);
    expect(button.word.textContent).toBe('Hi.');
    expect(vi.getTimerCount()).toBe(0);

    button.dispatchEvent(new Event('pointerleave'));
    vi.advanceTimersByTime(1600);
    button.dispatchEvent(new Event('focus'));
    expect(button.word.dataset.swapping).toBe('false');
    vi.advanceTimersByTime(5000);
    expect(button.word.textContent).toBe('Hi.');
    button.dispatchEvent(new Event('blur'));
    nextGreeting();
    expect(button.word.textContent).toBe('Olá.');
  });

  it('makes the greeting itself a persistent pause control for keyboard and touch', () => {
    start();
    enterView();
    button.dispatchEvent(new Event('focus'));
    button.dispatchEvent(new Event('click'));
    button.dispatchEvent(new Event('blur'));
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Resume greeting rotation');
    expect(button.title).toBe('Resume greeting rotation');
    vi.advanceTimersByTime(5000);
    expect(button.word.textContent).toBe('Hi.');

    button.dispatchEvent(new Event('focus'));
    button.dispatchEvent(new Event('click'));
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(vi.getTimerCount()).toBe(0);
    button.dispatchEvent(new Event('blur'));
    button.dispatchEvent(
      Object.assign(new Event('pointerenter'), { pointerType: 'touch' }),
    );
    nextGreeting();
    expect(button.word.textContent).toBe('Olá.');
    button.dispatchEvent(new Event('click'));
    vi.advanceTimersByTime(5000);
    expect(button.word.textContent).toBe('Olá.');
  });

  it('removes timers and listeners on destroy and safely remounts without duplicate rotations', () => {
    start();
    enterView();
    nextGreeting();
    vi.advanceTimersByTime(1420);
    const oldObserver = GreetingObserver.latest;
    destroy?.();
    destroy?.();
    expect(vi.getTimerCount()).toBe(0);
    expect(oldObserver.disconnect).toHaveBeenCalledTimes(1);
    expect(button.disabled).toBe(true);
    expect(button.word.dataset.swapping).toBe('false');

    button.dispatchEvent(new Event('click'));
    preference.change(false);
    document.changeVisibility('visible');
    oldObserver.change(true);
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-pressed')).toBe('false');
    vi.advanceTimersByTime(5000);
    expect(button.word.textContent).toBe('Olá.');

    start();
    enterView();
    nextGreeting();
    expect(button.word.textContent).toBe('Hola.');
    expect(vi.getTimerCount()).toBe(1);
  });

  it('rotates without IntersectionObserver support while respecting document visibility', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    document.visibilityState = 'hidden';
    start();
    expect(vi.getTimerCount()).toBe(0);
    document.changeVisibility('visible');
    nextGreeting();
    expect(button.word.textContent).toBe('Olá.');
  });
});
