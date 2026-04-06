import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

export function usePastorMeetingLayout() {
  const { width } = useWindowDimensions();
  return useMemo(() => {
    const horizontalPad =
      width < 340 ? 12 : width < 380 ? 14 : width < 440 ? 16 : 18;
    const sectionGapAfterHero = width < 380 ? 18 : 24;
    const meetingsBlockBottom = width < 380 ? 12 : 16;
    const cardRadius = width < 380 ? 16 : 20;
    const inset = 16;
    const available = Math.max(0, width - inset * 2);
    const feedMaxWidth = Math.min(available, 560);
    return {
      width,
      horizontalPad,
      sectionGapAfterHero,
      meetingsBlockBottom,
      cardRadius,
      feedMaxWidth,
    };
  }, [width]);
}
