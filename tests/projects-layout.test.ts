import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  homeProjects,
  type Project,
} from '@/src/components/home/projects-content';
import {
  layoutProjects,
  type ProjectPlacement,
} from '@/src/components/home/projects-layout';

function projects(count: number): Project[] {
  return Array.from({ length: count }, (_, index) => ({
    ...homeProjects[index % homeProjects.length]!,
    id: String(index),
  }));
}

type Area = { column: number; columns: number; row: number; rows: number };

function areas(
  placements: ProjectPlacement[],
  profile: 'desktop' | 'tablet' | 'mobile',
): Area[] {
  return placements.map((placement) => {
    if (profile === 'desktop') {
      const { column, row, rows } = placement.desktop;
      return { column, columns: 1, row, rows };
    }
    if (profile === 'tablet') return placement.tablet;
    return { ...placement.mobile, columns: 1, rows: 1 };
  });
}

function expectComplete(cells: Area[], columns: number, rows: number) {
  const covered = cells.reduce(
    (total, cell) => total + cell.columns * cell.rows,
    0,
  );
  expectNoOverlap(cells);
  expect(covered).toBe(columns * rows);
  for (const { column, columns: span, row, rows: height } of cells) {
    expect(column + span - 1).toBeLessThanOrEqual(columns);
    expect(row + height - 1).toBeLessThanOrEqual(rows);
  }
}

function expectNoOverlap(cells: Area[]) {
  const occupied = new Set<string>();
  for (const { column, columns, row, rows } of cells) {
    for (let x = column; x < column + columns; x++) {
      for (let y = row; y < row + rows; y++) {
        expect(occupied.has(`${x}:${y}`)).toBe(false);
        occupied.add(`${x}:${y}`);
      }
    }
  }
}

describe('project gallery composition', () => {
  const { placements, tabletTracks } = layoutProjects(projects(12));

  it('places twelve desktop covers in the reference column pattern', () => {
    expect(
      placements.map(({ desktop }) => [
        desktop.column,
        desktop.row,
        desktop.rows,
      ]),
    ).toEqual([
      [1, 1, 5],
      [1, 6, 7],
      [2, 1, 7],
      [2, 8, 5],
      [3, 1, 6],
      [3, 7, 6],
      [4, 1, 8],
      [4, 9, 4],
      [5, 1, 5],
      [5, 6, 7],
      [6, 1, 7],
      [6, 8, 5],
    ]);
  });

  it('uses the reference three-column tablet panel, then its four-cover panel', () => {
    expect(placements.map(({ tablet }) => tablet)).toEqual([
      { column: 1, columns: 1, row: 1, rows: 2 },
      { column: 2, columns: 1, row: 1, rows: 3 },
      { column: 3, columns: 1, row: 1, rows: 2 },
      { column: 1, columns: 1, row: 3, rows: 3 },
      { column: 2, columns: 1, row: 4, rows: 2 },
      { column: 3, columns: 1, row: 3, rows: 4 },
      { column: 1, columns: 2, row: 6, rows: 3 },
      { column: 3, columns: 1, row: 7, rows: 2 },
      { column: 4, columns: 1, row: 1, rows: 5 },
      { column: 5, columns: 1, row: 1, rows: 4 },
      { column: 4, columns: 1, row: 6, rows: 3 },
      { column: 5, columns: 1, row: 5, rows: 4 },
    ]);
    expect(tabletTracks).toEqual(['third', 'third', 'third', 'half', 'half']);
  });

  it('balances phone panels so neither is left half empty', () => {
    expect(placements.map(({ mobile }) => [mobile.column, mobile.row])).toEqual(
      [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 4],
        [1, 5],
        [1, 6],
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 4],
        [2, 5],
        [2, 6],
      ],
    );
  });

  it.each(Array.from({ length: 24 }, (_, index) => index + 1))(
    'leaves no holes in any layout for %i projects',
    (count) => {
      const layout = layoutProjects(projects(count));
      const desktopColumns = Math.max(
        ...layout.placements.map(({ desktop }) => desktop.column),
      );
      expectComplete(areas(layout.placements, 'desktop'), desktopColumns, 12);
      expectComplete(
        areas(layout.placements, 'tablet'),
        layout.tabletTracks.length,
        8,
      );

      const panels = new Map<number, number>();
      for (const { mobile } of layout.placements) {
        panels.set(mobile.column, (panels.get(mobile.column) ?? 0) + 1);
      }
      const sizes = [...panels.values()];
      expect(Math.max(...sizes)).toBeLessThanOrEqual(8);
      expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
    },
  );

  it.each([0, 1, 2, 3, 4, 5, 7, 8, 9, 11, 12, 16, 17, 24])(
    'keeps order and avoids overlaps for %i projects',
    (count) => {
      const source = projects(count);
      const layout = layoutProjects(source);
      expect(layout.placements.map(({ project }) => project)).toEqual(source);
      for (const profile of ['desktop', 'tablet', 'mobile'] as const) {
        expectNoOverlap(areas(layout.placements, profile));
      }
      for (const { tablet } of layout.placements) {
        expect(tablet.column + tablet.columns - 1).toBeLessThanOrEqual(
          layout.tabletTracks.length,
        );
      }
    },
  );

  it.each([1, 3, 5, 7, 9, 11, 13])(
    'lets an unpaired final cover fill its desktop column for %i projects',
    (count) => {
      const last = layoutProjects(projects(count)).placements.at(-1)!;
      expect(last.desktop).toMatchObject({ row: 1, rows: 12 });
    },
  );

  it('repeats the eight-cover panel across larger collections', () => {
    const layout = layoutProjects(projects(16));
    expect(layout.placements[8]!.desktop).toEqual({
      column: 5,
      row: 1,
      rows: 5,
    });
    expect(layout.placements[15]!.desktop).toEqual({
      column: 8,
      row: 9,
      rows: 4,
    });
    expect(layout.placements[15]!.tablet).toEqual({
      column: 6,
      columns: 1,
      row: 7,
      rows: 2,
    });
    expect(layout.tabletTracks).toEqual(Array(6).fill('third'));
  });

  it('leaves the source records unchanged', () => {
    const source = Object.freeze(
      projects(12).map((project) => Object.freeze(project)),
    );
    expect(() => layoutProjects(source)).not.toThrow();
    expect(source).toHaveLength(12);
  });

  // These check the algebra of the formulas the stylesheet contract below pins.
  it.each([1220, 1340, 1600])(
    'makes the desktop formulas keep the reference proportions in a %ipx frame',
    (content) => {
      const gap = 30;
      const column = (content - gap * 3) / 4;
      const row = (column * 0.5625 - gap * 3) / 4;
      const height = (rows: number) => rows * row + (rows - 1) * gap;

      expect(height(4)).toBeCloseTo(column * 0.5625);
      expect(height(12)).toBeCloseTo(column * 1.6875 + 60);
      expect(4 * column + 3 * gap).toBeCloseTo(content);
    },
  );

  it.each([691.2, 921.6, 1151])(
    'makes the tablet formulas keep covers 7 and 8 at 16:9 in a %ipx frame',
    (content) => {
      const gap = 30;
      const third = (content - gap * 2) / 3;
      const sixth = third * 0.5625 - gap * 0.4375;
      const last = (third * 0.5625 - gap) / 2;

      expect(sixth + last * 2 + gap * 2).toBeCloseTo(
        (third * 2 + gap) * 0.5625,
      );
      expect(last * 2 + gap).toBeCloseTo(third * 0.5625);
    },
  );
});

describe('project gallery stylesheet contract', () => {
  const css = readFileSync(
    new URL('../src/components/home/HomeProjects.module.css', import.meta.url),
    'utf8',
  ).replace(/\s+/g, '');
  const rule = (declaration: string) => declaration.replace(/\s+/g, '');

  it.each([
    '--projects-content: calc(min(100cqw, var(--layout-max-width)) - (var(--layout-gutter) * 2));',
    '--projects-gap: 20px;',
    '--projects-gap: 30px;',
    '--projects-tablet-third: calc((var(--projects-content) - (var(--projects-gap) * 2)) / 3);',
    '--projects-tablet-half: calc((var(--projects-content) - var(--projects-gap)) / 2);',
    'grid-template-rows: repeat(5, 75px);',
    'grid-auto-rows: calc((var(--projects-tablet-third) * 0.5625) - (var(--projects-gap) * 0.4375)) calc(((var(--projects-tablet-third) * 0.5625) - var(--projects-gap)) / 2) calc(((var(--projects-tablet-third) * 0.5625) - var(--projects-gap)) / 2);',
    '--projects-column: calc((var(--projects-content) - (var(--projects-gap) * 3)) / 4);',
    'grid-template-rows: repeat(12, calc(((var(--projects-column) * 0.5625) - (var(--projects-gap) * 3)) / 4));',
  ])('uses the measured formula %s', (declaration) => {
    expect(css).toContain(rule(declaration));
  });
});
