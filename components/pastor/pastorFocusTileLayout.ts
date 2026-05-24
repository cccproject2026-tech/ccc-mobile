export const FOCUS_TILE_COLUMNS = 3;
export const FOCUS_TILE_ROWS = 2;
export const FOCUS_TILE_COUNT = FOCUS_TILE_COLUMNS * FOCUS_TILE_ROWS;
export const FOCUS_TILE_GAP = 8;
export const PROGRESS_OVERVIEW_COLUMNS = 4;

/** Split row width into equal column widths (remainder goes to last column). */
export function computeColumnWidths(
  containerWidth: number,
  columns: number,
): number[] {
  if (containerWidth <= 0 || columns <= 0) {
    return Array(Math.max(columns, 0)).fill(0);
  }
  const totalGap = FOCUS_TILE_GAP * (columns - 1);
  const available = containerWidth - totalGap;
  const base = Math.floor(available / columns);
  const remainder = available - base * columns;
  return Array.from({ length: columns }, (_, index) =>
    index === columns - 1 ? base + remainder : base,
  );
}

export function computeFocusTileColumnWidths(containerWidth: number): number[] {
  return computeColumnWidths(containerWidth, FOCUS_TILE_COLUMNS);
}

export function computeProgressOverviewColumnWidths(
  containerWidth: number,
): number[] {
  return computeColumnWidths(containerWidth, PROGRESS_OVERVIEW_COLUMNS);
}
