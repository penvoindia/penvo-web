import type { Project } from './projects-content';

export type DesktopPlacement = { column: number; row: number; rows: number };
export type TabletPlacement = {
  column: number;
  columns: number;
  row: number;
  rows: number;
};
export type MobilePlacement = { column: number; row: number };

export type ProjectPlacement = {
  project: Project;
  desktop: DesktopPlacement;
  tablet: TabletPlacement;
  mobile: MobilePlacement;
};

/** Tablet column tracks: three per eight-cover panel, two halves for a four-cover panel. */
export type TabletTrack = 'third' | 'half';

export type ProjectsLayout = {
  placements: ProjectPlacement[];
  tabletTracks: TabletTrack[];
};

// The reference gallery is a strip of eight-cover panels.
const panelSize = 8;

// Desktop panel: four columns across twelve rows; every pair shares a column.
const desktopFrames = [
  { column: 1, row: 1, rows: 5 },
  { column: 1, row: 6, rows: 7 },
  { column: 2, row: 1, rows: 7 },
  { column: 2, row: 8, rows: 5 },
  { column: 3, row: 1, rows: 6 },
  { column: 3, row: 7, rows: 6 },
  { column: 4, row: 1, rows: 8 },
  { column: 4, row: 9, rows: 4 },
] as const;

// Tablet panel: three columns; the seventh cover spans two.
const tabletFrames = [
  { column: 1, columns: 1, row: 1, rows: 2 },
  { column: 2, columns: 1, row: 1, rows: 3 },
  { column: 3, columns: 1, row: 1, rows: 2 },
  { column: 1, columns: 1, row: 3, rows: 3 },
  { column: 2, columns: 1, row: 4, rows: 2 },
  { column: 3, columns: 1, row: 3, rows: 4 },
  { column: 1, columns: 2, row: 6, rows: 3 },
  { column: 3, columns: 1, row: 7, rows: 2 },
] as const;

// Smaller tablet panels use half-width columns over the full panel height,
// staggered like the reference's four-cover template, so no panel leaves holes.
const tabletHalfFrames: Record<number, readonly TabletPlacement[]> = {
  1: [{ column: 1, columns: 1, row: 1, rows: 8 }],
  2: [
    { column: 1, columns: 1, row: 1, rows: 8 },
    { column: 2, columns: 1, row: 1, rows: 8 },
  ],
  3: [
    { column: 1, columns: 1, row: 1, rows: 8 },
    { column: 2, columns: 1, row: 1, rows: 4 },
    { column: 2, columns: 1, row: 5, rows: 4 },
  ],
  4: [
    { column: 1, columns: 1, row: 1, rows: 5 },
    { column: 2, columns: 1, row: 1, rows: 4 },
    { column: 1, columns: 1, row: 6, rows: 3 },
    { column: 2, columns: 1, row: 5, rows: 4 },
  ],
};

// A five- to seven-cover panel keeps the three-column frames and extends the
// lowest cover in each column to the bottom row.
function tabletPanelFrames(count: number): readonly TabletPlacement[] {
  const half = tabletHalfFrames[count];
  if (half) return half;
  const frames = tabletFrames.slice(0, count).map((frame) => ({ ...frame }));
  for (let column = 1; column <= 3; column++) {
    let lowest: TabletPlacement | undefined;
    for (const frame of frames) {
      const covers =
        frame.column <= column && column < frame.column + frame.columns;
      if (covers && (!lowest || frame.row > lowest.row)) lowest = frame;
    }
    if (lowest) lowest.rows = 9 - lowest.row;
  }
  return frames;
}

// Phone panels are balanced so none is left half empty: twelve become 6 + 6,
// and nineteen become 7 + 6 + 6.
function mobilePlacement(index: number, count: number): MobilePlacement {
  const panels = Math.ceil(count / panelSize);
  const size = Math.floor(count / panels);
  const larger = count % panels;
  const inLarger = larger * (size + 1);
  if (index < inLarger) {
    return {
      column: Math.floor(index / (size + 1)) + 1,
      row: (index % (size + 1)) + 1,
    };
  }
  const offset = index - inLarger;
  return {
    column: larger + Math.floor(offset / size) + 1,
    row: (offset % size) + 1,
  };
}

export function layoutProjects(projects: readonly Project[]): ProjectsLayout {
  const tabletTracks: TabletTrack[] = [];
  const placements: ProjectPlacement[] = [];

  for (let start = 0; start < projects.length; start += panelSize) {
    const panel = projects.slice(start, start + panelSize);
    const frames = tabletPanelFrames(panel.length);
    const tabletOffset = tabletTracks.length;
    const tabletWidth = Math.max(
      ...frames.map(({ column, columns }) => column + columns - 1),
    );
    tabletTracks.push(
      ...Array.from({ length: tabletWidth }, (): TabletTrack =>
        panel.length <= 4 ? 'half' : 'third',
      ),
    );

    panel.forEach((project, slot) => {
      const index = start + slot;
      const frame = desktopFrames[slot]!;
      // As in the reference's odd templates, an unpaired final cover fills its column.
      const unpaired = index === projects.length - 1 && slot % 2 === 0;
      const tablet = frames[slot]!;

      placements.push({
        project,
        desktop: {
          column: (start / panelSize) * 4 + frame.column,
          row: unpaired ? 1 : frame.row,
          rows: unpaired ? 12 : frame.rows,
        },
        tablet: { ...tablet, column: tabletOffset + tablet.column },
        mobile: mobilePlacement(index, projects.length),
      });
    });
  }

  return { placements, tabletTracks };
}
