import { heroModes, type HeroMode } from './hero-content';

export type HeroParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  homeX: number;
  homeY: number;
  angle: number;
  radius: number;
  size: number;
  sphereX: number;
  sphereY: number;
  sphereZ: number;
};

export function particleCountForWidth(width: number) {
  if (width < 768) return 480;
  if (width < 1024) return 720;
  return 1200;
}

export function createHeroParticles(width: number, height: number) {
  const count = particleCountForWidth(width);
  let seed = 37;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  return Array.from({ length: count }, (_, index): HeroParticle => {
    const homeX = random();
    const homeY = random();
    const sphereY = 1 - (index / (count - 1)) * 2;
    const radius = Math.sqrt(1 - sphereY * sphereY);
    const theta = index * Math.PI * (3 - Math.sqrt(5));

    return {
      x: homeX * width,
      y: homeY * height,
      vx: 0,
      vy: 0,
      homeX,
      homeY,
      angle: random() * Math.PI * 2,
      radius: 9 + random() * 46,
      size: 1.7 + random() * 2.6,
      sphereX: Math.cos(theta) * radius,
      sphereY,
      sphereZ: Math.sin(theta) * radius,
    };
  });
}

export function advanceFreeParticle(
  particle: HeroParticle,
  width: number,
  height: number,
  delta: number,
  pointer: { x: number; y: number } | null,
) {
  const step = Math.min(Math.max(delta, 0), 2);
  particle.vx += (particle.homeX * width - particle.x) * 0.006 * step;
  particle.vy += (particle.homeY * height - particle.y) * 0.006 * step;
  particle.angle += 0.004 * step;
  particle.vx += Math.cos(particle.angle) * 0.03 * step;
  particle.vy += Math.sin(particle.angle) * 0.03 * step;

  if (pointer) {
    const dx = particle.x - pointer.x;
    const dy = particle.y - pointer.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 0 && distance < 210) {
      const force = (1 - distance / 210) * 2.6 * step;
      particle.vx += (dx / distance) * force;
      particle.vy += (dy / distance) * force;
    }
  }

  particle.vx *= 0.9 ** step;
  particle.vy *= 0.9 ** step;
  const speed = Math.hypot(particle.vx, particle.vy);
  if (speed > 6) {
    particle.vx *= 6 / speed;
    particle.vy *= 6 / speed;
  }
  particle.x += particle.vx * step;
  particle.y += particle.vy * step;
}

export function createHeroField(
  canvas: HTMLCanvasElement,
  section: HTMLElement,
) {
  const context = canvas.getContext('2d');
  if (!context) return null;

  let width = 0;
  let height = 0;
  let particles: HeroParticle[] = [];
  let mode: HeroMode = 'flow';
  let frame = 0;
  let previousTime = 0;
  let angle = 0;
  let running = false;
  let hasStarted = false;
  let pointer: { x: number; y: number } | null = null;
  let centers: { x: number; y: number }[] = [];
  let region = { left: 0, right: 0, top: 0, bottom: 0 };
  let canvasRect = canvas.getBoundingClientRect();
  const tokens = getComputedStyle(canvas);
  const palette = [
    '--color-bright-orange',
    '--color-pink-affair',
    '--color-full-white',
    '--color-smooth-grey',
    '--color-super-grey',
  ].map((token) => tokens.getPropertyValue(token).trim());
  const labelColor = tokens.getPropertyValue('--color-text-secondary').trim();
  const labelFont = `${tokens.getPropertyValue('--font-weight-medium')} ${tokens.getPropertyValue('--type-caption-size')} ${tokens.getPropertyValue('--font-secondary')}`;

  function layoutCenters() {
    canvasRect = canvas.getBoundingClientRect();
    const copy = section
      .querySelector('[data-hero-copy]')
      ?.getBoundingClientRect();
    const controls = section
      .querySelector('[data-hero-controls]')
      ?.getBoundingClientRect();
    region = {
      left: Math.min(
        width * 0.6,
        (copy ? copy.right - canvasRect.left : width / 2) + 74,
      ),
      right: width - 70,
      top: 120,
      bottom: Math.max(
        280,
        Math.min(
          height - 100,
          (controls ? controls.top - canvasRect.top : height - 40) - 74,
        ),
      ),
    };
    const groups = heroModes.find((item) => item.id === mode)?.groups ?? [];
    centers = groups.map((_, index) => ({
      x: region.left + (region.right - region.left) * (index % 2 ? 0.72 : 0.28),
      y:
        region.top +
        ((index + 0.5) / groups.length) * (region.bottom - region.top),
    }));
  }

  function paint(delta: number, settle = false) {
    if (!context || !width || !height) return;
    context.clearRect(0, 0, width, height);
    angle += 0.0032 * delta;
    const lerp = settle ? 1 : 1 - 0.94 ** delta;
    const groups = heroModes.find((item) => item.id === mode)?.groups ?? [];

    particles.forEach((particle, index) => {
      let depth = 1;
      if (mode === 'flow') {
        if (settle) {
          particle.x = particle.homeX * width;
          particle.y = particle.homeY * height;
          particle.vx = 0;
          particle.vy = 0;
        } else if (delta) {
          advanceFreeParticle(particle, width, height, delta, pointer);
        }
      } else if (mode === 'globe') {
        const x =
          particle.sphereX * Math.cos(angle) -
          particle.sphereZ * Math.sin(angle);
        const z =
          particle.sphereX * Math.sin(angle) +
          particle.sphereZ * Math.cos(angle);
        const y = particle.sphereY * Math.cos(0.42) - z * Math.sin(0.42);
        const rotatedZ = particle.sphereY * Math.sin(0.42) + z * Math.cos(0.42);
        const perspective = 1.6 / (1.6 - rotatedZ);
        const radius = Math.min(width * 0.13, height * 0.2);
        const targetX = width * 0.76 + x * radius * perspective;
        const targetY = height * 0.38 + y * radius * perspective;
        particle.x += (targetX - particle.x) * lerp;
        particle.y += (targetY - particle.y) * lerp;
        depth = 0.22 + ((rotatedZ + 1) / 2) * 0.78;
      } else {
        const center = centers[index % centers.length];
        if (!center) return;
        particle.angle += 0.004 * delta;
        const driftX = Math.sin(angle + (index % centers.length)) * 12;
        const driftY = Math.cos(angle + (index % centers.length)) * 10;
        particle.x +=
          (center.x +
            driftX +
            Math.cos(particle.angle) * particle.radius -
            particle.x) *
          lerp;
        particle.y +=
          (center.y +
            driftY +
            Math.sin(particle.angle) * particle.radius -
            particle.y) *
          lerp;
      }

      context.fillStyle = groups.length
        ? palette[(index % groups.length) % palette.length]!
        : palette[0]!;
      context.globalAlpha = (mode === 'flow' ? 0.68 : 0.9) * depth;
      const halfSize = particle.size * (mode === 'globe' ? 0.65 : 1);
      context.fillRect(
        particle.x - halfSize,
        particle.y - halfSize,
        halfSize * 2,
        halfSize * 2,
      );
    });

    context.globalAlpha = 1;
    context.fillStyle = labelColor;
    context.font = labelFont;
    context.textAlign = 'center';
    groups.forEach((label, index) => {
      const center = centers[index];
      if (center) context.fillText(label, center.x, center.y + 68);
    });
  }

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    if (!width || !height) return;
    const scale = Math.min(window.devicePixelRatio || 1, width < 768 ? 1.5 : 2);
    const pixelWidth = Math.round(width * scale);
    const pixelHeight = Math.round(height * scale);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      context?.setTransform(scale, 0, 0, scale, 0, 0);
    }

    if (particles.length !== particleCountForWidth(width)) {
      const nextParticles = createHeroParticles(width, height);
      if (running && particles.length) {
        nextParticles.forEach((particle, index) => {
          // Retain live positions at breakpoints. New squares join from an
          // existing point instead of snapping straight to their destination.
          const previous = particles[index % particles.length]!;
          particle.x = previous.x;
          particle.y = previous.y;
          particle.vx = previous.vx;
          particle.vy = previous.vy;
          particle.angle = previous.angle;
        });
      }
      particles = nextParticles;
    }
    layoutCenters();
    // Moving particles spring/lerp to their new targets in the existing loop.
    // Reduced-motion and suspended fields get an immediate, static layout.
    paint(0, !running);
  }

  function tick(time: number) {
    if (!running) return;
    const interval = width < 1024 ? 1000 / 30 : 1000 / 60;
    const elapsed = time - previousTime;
    if (!previousTime || elapsed >= interval - 0.5) {
      paint(previousTime ? Math.min(elapsed / (1000 / 60), 2) : 1);
      previousTime = time;
    }
    frame = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    if (!hasStarted && width && height) {
      hasStarted = true;
      if (mode === 'flow') {
        const radius = Math.min(width, height) * 0.34;
        particles.forEach((particle) => {
          const perspective = 1.6 / (1.6 - particle.sphereZ);
          const dx = particle.sphereX * radius * perspective;
          const dy = particle.sphereY * radius * perspective;
          const distance = Math.hypot(dx, dy) || 1;
          particle.x = width / 2 + dx;
          particle.y = height / 2 + dy;
          particle.vx = (dx / distance) * 3;
          particle.vy = (dy / distance) * 3;
        });
      }
    }
    running = true;
    previousTime = 0;
    frame = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    pointer = null;
    cancelAnimationFrame(frame);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const copy = section.querySelector('[data-hero-copy]');
  if (copy) observer.observe(copy);
  resize();

  return {
    start,
    stop,
    setMode(nextMode: HeroMode) {
      if (nextMode === mode) return;
      mode = nextMode;
      layoutCenters();
      if (!running) paint(0, true);
    },
    setPointer(clientX: number, clientY: number) {
      if (!running) return;
      // Read only on pointer input, never inside the frame loop.
      canvasRect = canvas.getBoundingClientRect();
      pointer = { x: clientX - canvasRect.left, y: clientY - canvasRect.top };
    },
    clearPointer() {
      pointer = null;
    },
    destroy() {
      stop();
      observer.disconnect();
    },
  };
}

export type HeroField = NonNullable<ReturnType<typeof createHeroField>>;
