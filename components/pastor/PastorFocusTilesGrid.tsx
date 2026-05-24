import { PastorFocusTileCard } from "@/components/pastor/PastorFocusTileCard";
import type { PastorFocusHighlightStatusVariant } from "@/components/pastor/PastorFocusHighlightCard";
import {
  FOCUS_TILE_COLUMNS,
  FOCUS_TILE_GAP,
  computeFocusTileColumnWidths,
} from "@/components/pastor/pastorFocusTileLayout";
import React, { useCallback, useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

export type PastorFocusGridTile = {
  sectionId: string;
  icon: React.ComponentProps<typeof PastorFocusTileCard>["icon"];
  line1: string;
  line2: string;
  sheetTitle: string;
};

type PastorFocusTilesGridProps = {
  tiles: PastorFocusGridTile[];
  statuses: Record<
    string,
    { label: string; variant: PastorFocusHighlightStatusVariant }
  >;
  onTilePress: (tile: PastorFocusGridTile) => void;
};

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

function getTileHeight(screenWidth: number): number {
  return screenWidth < 375 ? 96 : 102;
}

export function PastorFocusTilesGrid({
  tiles,
  statuses,
  onTilePress,
}: PastorFocusTilesGridProps) {
  const { width: screenWidth } = useWindowDimensions();
  const tileHeight = getTileHeight(screenWidth);
  const [gridWidth, setGridWidth] = useState(0);

  const columnWidths = useMemo(
    () => computeFocusTileColumnWidths(gridWidth),
    [gridWidth],
  );

  const rows = useMemo(
    () => chunk(tiles, FOCUS_TILE_COLUMNS),
    [tiles],
  );

  const onGridLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    setGridWidth((prev) => (prev === nextWidth ? prev : nextWidth));
  }, []);

  return (
    <View style={styles.grid} onLayout={onGridLayout}>
      {rows.map((row, rowIndex) => (
        <View
          key={`focus-row-${rowIndex}`}
          style={[
            styles.row,
            { height: tileHeight },
            rowIndex < rows.length - 1 ? styles.rowSpacing : null,
          ]}
        >
          {row.map((tile, columnIndex) => {
            const status = statuses[tile.sectionId] ?? {
              label: "View",
              variant: "inProgress" as const,
            };
            const slotWidth = columnWidths[columnIndex] ?? 0;
            const marginRight =
              columnIndex < row.length - 1 ? FOCUS_TILE_GAP : 0;

            return (
              <View
                key={tile.sectionId}
                style={[
                  styles.slot,
                  {
                    width: slotWidth > 0 ? slotWidth : undefined,
                    marginRight,
                    height: tileHeight,
                  },
                  slotWidth <= 0 ? styles.slotFlex : null,
                ]}
              >
                <PastorFocusTileCard
                  icon={tile.icon}
                  line1={tile.line1}
                  line2={tile.line2}
                  statusLabel={status.label}
                  statusVariant={status.variant}
                  tileHeight={tileHeight}
                  onPress={() => onTilePress(tile)}
                />
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: "100%",
    alignSelf: "stretch",
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
  },
  rowSpacing: {
    marginBottom: FOCUS_TILE_GAP,
  },
  slot: {
    overflow: "hidden",
  },
  /** Brief fallback before onLayout; replaced by measured pixel widths. */
  slotFlex: {
    flex: 1,
    minWidth: 0,
  },
});
