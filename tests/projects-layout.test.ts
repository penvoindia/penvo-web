import { describe, expect, it } from 'vitest';

import {
  homeProjects,
  type Project,
} from '@/src/components/home/projects-content';
import { layoutProjects } from '@/src/components/home/projects-layout';

function projects(count: number): Project[] {
  return Array.from({ length: count }, (_, index) => ({
    ...homeProjects[index % homeProjects.length],
    id: String(index),
  }));
}

describe('project cover composition', () => {
  it('repeats the first six frames across subsequent groups', () => {
    const layout = layoutProjects(projects(20));
    const firstGroup = layout.slice(0, 6);

    expect(firstGroup.map(({ rowSpan }) => rowSpan)).toEqual([
      4, 8, 5, 7, 8, 4,
    ]);

    for (let index = 6; index < layout.length; index++) {
      const original = firstGroup[index % 6];
      expect(layout[index]).toMatchObject({
        column: original.column + Math.floor(index / 6) * 3,
        rowStart: original.rowStart,
        rowSpan: original.rowSpan,
        shape: original.shape,
      });
    }
  });

  it('keeps geometry identical when source dimensions or crop metadata change', () => {
    const source = projects(18);
    const variations = source.map((project, index) => ({
      ...project,
      width: index % 2 ? 200 : 2400,
      height: index % 2 ? 2400 : 200,
      shape: index % 2 ? ('landscape' as const) : ('portrait' as const),
    }));
    const frames = (items: readonly Project[]) =>
      layoutProjects(items).map(({ shape, column, rowStart, rowSpan }) => ({
        shape,
        column,
        rowStart,
        rowSpan,
      }));

    expect(frames(variations)).toEqual(frames(source));
    expect(
      frames(source.map((project) => ({ ...project, shape: undefined }))),
    ).toEqual(frames(source));
  });

  it.each([0, 1, 2, 3, 5, 6, 7, 8, 11, 12, 13, 14, 19])(
    'preserves order and non-overlapping paired columns for %i projects',
    (count) => {
      const source = projects(count);
      const layout = layoutProjects(source);
      expect(layout.map(({ project }) => project)).toEqual(source);
      expect(new Set(layout.map(({ column }) => column)).size).toBe(
        Math.ceil(count / 2),
      );

      for (let column = 1; column <= Math.ceil(count / 2); column++) {
        const cards = layout.filter((card) => card.column === column);
        expect(cards[0].rowStart).toBe(1);
        const occupied = new Set<number>();
        for (const card of cards) {
          for (
            let row = card.rowStart;
            row < card.rowStart + card.rowSpan;
            row++
          ) {
            expect(row).toBeGreaterThanOrEqual(1);
            expect(row).toBeLessThanOrEqual(12);
            expect(occupied.has(row)).toBe(false);
            occupied.add(row);
          }
        }
        const expectedRows = cards.length === 2 ? 12 : cards[0].rowSpan;
        expect([...occupied].sort((a, b) => a - b)).toEqual(
          Array.from({ length: expectedRows }, (_, index) => index + 1),
        );
      }
    },
  );

  it.each([1, 3, 5, 7, 9, 11, 13, 15, 17])(
    'does not stretch the trailing unpaired card with %i projects',
    (count) => {
      const source = Object.freeze(
        projects(count).map((project) => Object.freeze(project)),
      );
      const complete = layoutProjects(projects(18));
      const layout = layoutProjects(source);

      expect(layout).toHaveLength(count);
      expect(layout.at(-1)).toMatchObject({
        shape: complete[count - 1].shape,
        rowStart: complete[count - 1].rowStart,
        rowSpan: complete[count - 1].rowSpan,
      });
      expect(layout.at(-1)?.rowSpan).toBeLessThan(12);
      expect(source).toHaveLength(count);
    },
  );

  it.each([600, 800])(
    'keeps the square frame square and the other frames mixed at %ipx height',
    (viewportHeight) => {
      const layout = layoutProjects(projects(12));
      const gap = 30;
      const track = (viewportHeight - 11 * gap) / 12;
      const columnWidth = (viewportHeight * 7 - gap * 5) / 12;

      for (const { rowSpan, shape } of layout) {
        const height = rowSpan * track + (rowSpan - 1) * gap;
        if (shape === 'square') expect(height).toBeCloseTo(columnWidth);
        if (shape === 'portrait') expect(height).toBeGreaterThan(columnWidth);
        if (shape === 'landscape') expect(height).toBeLessThan(columnWidth);
      }
    },
  );
});
