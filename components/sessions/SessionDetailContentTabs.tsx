import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";

const GAP_AFTER_NOTES = 18;
const TAB_MIN_HEIGHT = 48;
const TAB_FONT = 15;
const SEG_GAP = 4;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TabKey = "transcript" | "summary";

type Props = {
  transcriptSlot: React.ReactNode;
  summarySlot: React.ReactNode;
  surface?: "dark" | "light";
};

/** Transcript / Summary segmented control — static pills (no sliding layer) for reliable layout on all platforms. */
export function SessionDetailContentTabs({
  transcriptSlot,
  summarySlot,
  surface = "dark",
}: Props) {
  const [active, setActive] = useState<TabKey>("transcript");
  const fade = useRef(new Animated.Value(1)).current;
  const isLight = surface === "light";
  const palette = isLight ? stylesLight : stylesDark;

  const animateTo = useCallback(
    (key: TabKey) => {
      Animated.timing(fade, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }).start(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setActive(key);
        Animated.timing(fade, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }).start();
      });
    },
    [fade],
  );

  const tabs: { key: TabKey; label: string }[] = [
    { key: "transcript", label: "Transcript" },
    { key: "summary", label: "Summary" },
  ];

  const content =
    active === "transcript" ? transcriptSlot : summarySlot;

  return (
    <View style={styles.wrap}>
      <View style={[styles.track, palette.track]}>
        {tabs.map((t) => {
          const isActive = active === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => {
                if (!isActive) animateTo(t.key);
              }}
              style={({ pressed }) => [
                styles.segment,
                isActive ? palette.segmentOn : palette.segmentOff,
                pressed && !isActive && palette.segmentPressed,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              android_ripple={
                Platform.OS === "android"
                  ? {
                      color: isLight
                        ? "rgba(37, 99, 235, 0.14)"
                        : "rgba(255, 255, 255, 0.14)",
                      borderless: false,
                    }
                  : undefined
              }
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  isActive ? palette.labelOn : palette.labelOff,
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Animated.View style={[styles.panel, { opacity: fade }]}>
        {content}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 0,
    gap: GAP_AFTER_NOTES,
    width: "100%",
    minWidth: 0,
    alignSelf: "stretch",
  },
  track: {
    flexDirection: "row",
    width: "100%",
    minWidth: 0,
    alignSelf: "stretch",
    padding: SEG_GAP,
    borderRadius: 14,
    gap: SEG_GAP,
  },
  segment: {
    flex: 1,
    minWidth: 0,
    minHeight: TAB_MIN_HEIGHT,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  label: {
    fontSize: TAB_FONT,
    fontWeight: "600",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  panel: {
    width: "100%",
    minWidth: 0,
    alignSelf: "stretch",
  },
});

const stylesDark = StyleSheet.create({
  track: {
    backgroundColor: "rgba(0, 0, 0, 0.22)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  segmentOn: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  segmentOff: {
    backgroundColor: "transparent",
  },
  segmentPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  labelOn: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  labelOff: {
    color: "rgba(255, 255, 255, 0.55)",
    fontWeight: "600",
  },
});

const stylesLight = StyleSheet.create({
  track: {
    backgroundColor: "rgba(15, 23, 42, 0.05)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(15, 23, 42, 0.1)",
  },
  segmentOn: {
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(15, 23, 42, 0.08)",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentOff: {
    backgroundColor: "transparent",
  },
  segmentPressed: {
    backgroundColor: "rgba(15, 23, 42, 0.04)",
  },
  labelOn: {
    color: "#1D4ED8",
    fontWeight: "700",
  },
  labelOff: {
    color: "rgba(15, 23, 42, 0.5)",
    fontWeight: "600",
  },
});
