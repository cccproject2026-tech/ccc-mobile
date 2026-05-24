export const FOCUS_TILE_COLUMNS = 3;
export const FOCUS_TILE_ROWS = 2;
export const FOCUS_TILE_COUNT = FOCUS_TILE_COLUMNS * FOCUS_TILE_ROWS;
export const FOCUS_TILE_GAP = 8;

/** Split row width into 3 equal column widths (remainder goes to last column). */
export function computeFocusTileColumnWidths(containerWidth: number): number[] {
  if (containerWidth <= 0) {
    return Array(FOCUS_TILE_COLUMNS).fill(0);
  }
  const totalGap = FOCUS_TILE_GAP * (FOCUS_TILE_COLUMNS - 1);
  const available = containerWidth - totalGap;
  const base = Math.floor(available / FOCUS_TILE_COLUMNS);
  const remainder = available - base * FOCUS_TILE_COLUMNS;
  return Array.from({ length: FOCUS_TILE_COLUMNS }, (_, index) =>
    index === FOCUS_TILE_COLUMNS - 1 ? base + remainder : base,
  );
}
