import { describe, expect, it } from 'vitest';

import {
  getProcessProgress,
  getProcessSectionHeight,
  getProcessTravel,
} from '../src/components/home/home-process-motion';

describe('home process motion', () => {
  it('uses only the track width beyond the viewport as horizontal travel', () => {
    expect(getProcessTravel(4200, 1440)).toBe(2760);
    expect(getProcessTravel(900, 1440)).toBe(0);
  });

  it('adds one viewport to the travel so the sticky frame can enter and exit', () => {
    expect(getProcessSectionHeight(2760, 900)).toBe(3660);
    expect(getProcessSectionHeight(0, 900)).toBe(900);
  });

  it('clamps progress before, during, and after the section', () => {
    expect(getProcessProgress(400, 500, 1000)).toBe(0);
    expect(getProcessProgress(1000, 500, 1000)).toBe(0.5);
    expect(getProcessProgress(1800, 500, 1000)).toBe(1);
  });
});
