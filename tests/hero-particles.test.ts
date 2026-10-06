import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  advanceFreeParticle,
  createHeroField,
  createHeroParticles,
  particleCountForWidth,
} from '@/src/components/home/hero-particles';

afterEach(() => vi.unstubAllGlobals());

function setupField(width = 1440, height = 900) {
  const requestFrame = vi.fn<(callback: FrameRequestCallback) => number>(
    () => 7,
  );
  const cancelFrame = vi.fn();
  const disconnect = vi.fn();
  let resize: () => void = () => {};
  vi.stubGlobal('requestAnimationFrame', requestFrame);
  vi.stubGlobal('cancelAnimationFrame', cancelFrame);
  vi.stubGlobal('window', { devicePixelRatio: 3 });
  vi.stubGlobal('getComputedStyle', () => ({
    getPropertyValue: () => 'orange',
  }));
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe() {}
      disconnect = disconnect;
    },
  );
  const context = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn<(x: number, y: number, w: number, h: number) => void>(),
    fillText: vi.fn(),
  };
  const canvas = {
    clientWidth: width,
    clientHeight: height,
    width: 0,
    height: 0,
    getContext: () => context,
    getBoundingClientRect: () => ({ left: 0, top: 0 }),
  };
  const field = createHeroField(
    canvas as unknown as HTMLCanvasElement,
    { querySelector: () => null } as unknown as HTMLElement,
  )!;
  return {
    canvas,
    context,
    field,
    requestFrame,
    cancelFrame,
    disconnect,
    resize: () => resize(),
    tick: (time: number) => requestFrame.mock.lastCall?.[0](time),
    points: () =>
      context.fillRect.mock.calls
        .slice(-particleCountForWidth(canvas.clientWidth))
        .map(([x, y, w, h]) => ({ x: x + w / 2, y: y + h / 2 })),
  };
}

describe('hero particle field', () => {
  it('scales density at the portrait and landscape boundaries', () => {
    expect(particleCountForWidth(767)).toBe(480);
    expect(particleCountForWidth(768)).toBe(720);
    expect(particleCountForWidth(1023)).toBe(720);
    expect(particleCountForWidth(1024)).toBe(1200);
  });

  it.each([320, 390, 820, 1100, 1440])(
    'starts within the %ipx canvas with repeatable sphere coordinates',
    (width) => {
      const particles = createHeroParticles(width, 900);
      expect(particles).toEqual(createHeroParticles(width, 900));
      for (const particle of particles) {
        expect(particle.x).toBeGreaterThanOrEqual(0);
        expect(particle.x).toBeLessThan(width);
        expect(particle.y).toBeGreaterThanOrEqual(0);
        expect(particle.y).toBeLessThan(900);
        expect(
          Math.hypot(particle.sphereX, particle.sphereY, particle.sphereZ),
        ).toBeCloseTo(1);
      }
    },
  );

  it('handles a pointer at the particle center and long frame gaps without invalid positions', () => {
    const particle = createHeroParticles(390, 844)[0]!;
    for (let frame = 0; frame < 500; frame++) {
      advanceFreeParticle(particle, 390, 844, 120, {
        x: particle.x,
        y: particle.y,
      });
      expect(Number.isFinite(particle.x)).toBe(true);
      expect(Number.isFinite(particle.y)).toBe(true);
      expect(Math.hypot(particle.vx, particle.vy)).toBeLessThanOrEqual(
        6.000001,
      );
    }
  });

  it('repels nearby particles and leaves a zero-duration step unchanged', () => {
    const particle = createHeroParticles(1440, 900)[0]!;
    const unchanged = { ...particle };
    advanceFreeParticle(particle, 1440, 900, 0, null);
    expect(particle).toEqual(unchanged);
    const previousX = particle.x;
    advanceFreeParticle(particle, 1440, 900, 1, {
      x: particle.x - 10,
      y: particle.y,
    });
    expect(particle.x).toBeGreaterThan(previousX);
  });

  it('does not animate static modes and cancels observers and frames on cleanup', () => {
    const { field, canvas, context, requestFrame, cancelFrame, disconnect } =
      setupField();

    expect(canvas.width).toBe(2880);
    field.setMode('services');
    expect(context.fillText).toHaveBeenCalledWith(
      'Strategy',
      expect.any(Number),
      expect.any(Number),
    );
    expect(requestFrame).not.toHaveBeenCalled();
    field.start();
    field.start();
    expect(requestFrame).toHaveBeenCalledTimes(1);
    field.stop();
    expect(cancelFrame).toHaveBeenCalledWith(7);
    field.setMode('globe');
    expect(requestFrame).toHaveBeenCalledTimes(1);
    field.destroy();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it.each([390, 820, 1100, 1440])(
    'spreads into free flow on first start at %ipx without replaying on resume',
    (width) => {
      const { field, tick, points, resize } = setupField(width);
      const homes = points();
      const distanceFromHome = () =>
        points().reduce(
          (sum, point, index) =>
            sum +
            Math.hypot(point.x - homes[index]!.x, point.y - homes[index]!.y),
          0,
        ) / homes.length;
      field.start();
      tick(17);
      const initialDistance = distanceFromHome();
      expect(initialDistance).toBeGreaterThan(50);
      for (let time = 51; time <= 6000; time += 34) tick(time);
      expect(distanceFromHome()).toBeLessThan(initialDistance * 0.1);

      const settled = points();
      field.stop();
      field.start();
      resize();
      expect(points()).toEqual(settled);
      field.destroy();
    },
  );

  it.each(['flow', 'services', 'globe'] as const)(
    'preserves live %s positions through responsive changes and then moves to new targets',
    (mode) => {
      const { field, canvas, tick, points, resize, requestFrame } =
        setupField();
      field.start();
      field.setMode(mode);
      tick(17);
      let time = 17;
      for (const width of [820, 390, 1100, 1440, 1280]) {
        const previous = points();
        canvas.clientWidth = width;
        const frameCount = requestFrame.mock.calls.length;
        resize();
        const resized = points();
        const retainedCount = Math.min(previous.length, resized.length);
        expect(resized.slice(0, retainedCount)).toEqual(
          previous.slice(0, retainedCount),
        );
        expect(requestFrame).toHaveBeenCalledTimes(frameCount);
        tick((time += 40));
        expect(points()[0]).not.toEqual(resized[0]);
        for (const point of points()) {
          expect(Number.isFinite(point.x) && Number.isFinite(point.y)).toBe(
            true,
          );
        }
      }
      field.destroy();
    },
  );

  it('lays out resized particles immediately without frames when motion is disabled', () => {
    const { field, canvas, points, resize, requestFrame } = setupField();
    for (const width of [390, 820, 1100, 1440]) {
      canvas.clientWidth = width;
      resize();
      const expected = createHeroParticles(width, 900);
      points().forEach((point, index) => {
        expect(point.x).toBeCloseTo(expected[index]!.x);
        expect(point.y).toBeCloseTo(expected[index]!.y);
      });
    }
    expect(requestFrame).not.toHaveBeenCalled();
    field.destroy();
  });
});
