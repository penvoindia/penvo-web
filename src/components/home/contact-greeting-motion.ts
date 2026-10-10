export const contactGreetings = [
  { text: 'Hi.', lang: 'en' },
  { text: 'Olá.', lang: 'pt' },
  { text: 'Hola.', lang: 'es' },
  { text: 'Ciao.', lang: 'it' },
  { text: 'Bonjour.', lang: 'fr' },
  { text: 'Hallo.', lang: 'de' },
  { text: '你好', lang: 'zh' },
  { text: '안녕', lang: 'ko' },
  { text: 'مرحبا', lang: 'ar' },
  { text: 'Xin chào.', lang: 'vi' },
] as const;

export function createContactGreetingMotion(button: HTMLButtonElement) {
  const word = button.querySelector<HTMLElement>(
    '[data-contact-greeting-word]',
  );
  if (!word) return () => {};

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const swapDuration =
    Number.parseFloat(
      getComputedStyle(button).getPropertyValue('--motion-duration-fast'),
    ) || 180;
  let index = Math.max(
    0,
    contactGreetings.findIndex(
      (greeting) => greeting.text === word.textContent,
    ),
  );
  let paused = button.getAttribute('aria-pressed') === 'true';
  let hovered = false;
  let focused = document.activeElement === button;
  let inView = typeof IntersectionObserver !== 'function';
  let destroyed = false;
  let interval: ReturnType<typeof setInterval> | undefined;
  let swapTimeout: ReturnType<typeof setTimeout> | undefined;

  word.lang = (contactGreetings[index] ?? contactGreetings[0]).lang;
  word.dir = 'auto';

  function stop() {
    clearInterval(interval);
    clearTimeout(swapTimeout);
    interval = undefined;
    swapTimeout = undefined;
    word!.dataset.swapping = 'false';
  }

  function sync() {
    if (destroyed) return;
    button.disabled = reducedMotion.matches;
    button.setAttribute('aria-pressed', String(paused));
    const label = `${paused ? 'Resume' : 'Pause'} greeting rotation`;
    button.setAttribute('aria-label', label);
    button.title = label;

    if (
      reducedMotion.matches ||
      !inView ||
      document.visibilityState !== 'visible' ||
      paused ||
      hovered ||
      focused
    ) {
      stop();
      return;
    }

    if (interval !== undefined) return;
    interval = setInterval(() => {
      word!.dataset.swapping = 'true';
      swapTimeout = setTimeout(() => {
        index = (index + 1) % contactGreetings.length;
        const greeting = contactGreetings[index] ?? contactGreetings[0];
        word!.textContent = greeting.text;
        word!.lang = greeting.lang;
        word!.dataset.swapping = 'false';
        swapTimeout = undefined;
      }, swapDuration);
    }, 1600);
  }

  function enter(event: PointerEvent) {
    if (event.pointerType === 'touch') return;
    hovered = true;
    sync();
  }

  function leave() {
    hovered = false;
    sync();
  }

  function focus() {
    focused = true;
    sync();
  }

  function blur() {
    focused = false;
    sync();
  }

  function toggle() {
    if (button.disabled) return;
    paused = !paused;
    sync();
  }

  const observer =
    typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(
          (entries) => {
            const entry = entries.find((entry) => entry.target === button);
            if (!entry) return;
            inView = entry.isIntersecting;
            sync();
          },
          { threshold: 0.12 },
        )
      : undefined;

  observer?.observe(button);
  reducedMotion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  button.addEventListener('pointerenter', enter);
  button.addEventListener('pointerleave', leave);
  button.addEventListener('focus', focus);
  button.addEventListener('blur', blur);
  button.addEventListener('click', toggle);
  sync();

  return () => {
    if (destroyed) return;
    destroyed = true;
    stop();
    observer?.disconnect();
    reducedMotion.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', sync);
    button.removeEventListener('pointerenter', enter);
    button.removeEventListener('pointerleave', leave);
    button.removeEventListener('focus', focus);
    button.removeEventListener('blur', blur);
    button.removeEventListener('click', toggle);
    button.disabled = true;
  };
}
