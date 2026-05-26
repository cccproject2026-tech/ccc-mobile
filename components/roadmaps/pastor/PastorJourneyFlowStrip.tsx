import { roadmapTheme } from "@/components/ui/design-system/roadmapTheme";
import type { JourneyFlowStep } from "@/lib/roadmap/journeyFlow";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

type Props = {
  steps: JourneyFlowStep[];
  onPressStep: (step: JourneyFlowStep) => void;
};

const NODE_SIZE = 52;
const CONNECTOR_W = 20;
const MIN_STEP_WIDTH = 88;
const MAX_STEP_WIDTH = 112;

/** Rough width so two-line titles do not collide with neighbors. */
function estimateLabelColumnWidth(title: string): number {
  const chars = title.trim().length;
  const perLine = Math.ceil(chars / 2);
  const estimated = perLine * 6.2 + 14;
  return Math.min(MAX_STEP_WIDTH, Math.max(MIN_STEP_WIDTH, Math.ceil(estimated)));
}

function notStartedStatusLabel(index: number, steps: JourneyFlowStep[]): string {
  const currentIndex = steps.findIndex((s) => s.state === "current");
  if (currentIndex >= 0 && index === currentIndex + 1) return "Coming next";
  return "Not Started";
}

function StepCircle({ step, index }: { step: JourneyFlowStep; index: number }) {
  const isCurrent = step.state === "current";
  const isCompleted = step.state === "completed";
  const isInProgress = step.state === "in-progress";
  const isNotStarted = step.state === "not-started";

  if (isCurrent) {
    return (
      <LinearGradient
        colors={["#6FD4BE", "#34D399"]}
        style={[styles.circle, styles.circleCurrent]}
      >
        <Text style={styles.circleNum}>{index + 1}</Text>
      </LinearGradient>
    );
  }

  if (isInProgress) {
    return (
      <LinearGradient
        colors={["#6FD4BE", "#34D399"]}
        style={[styles.circle, styles.circleInProgress]}
      >
        <Text style={styles.circleNum}>{index + 1}</Text>
      </LinearGradient>
    );
  }

  if (isCompleted) {
    return (
      <View style={[styles.circle, styles.circleCompleted]}>
        <Ionicons name="checkmark" size={22} color="#fff" />
      </View>
    );
  }

  if (isNotStarted) {
    return (
      <View style={[styles.circle, styles.circleNotStarted]}>
        <Text style={styles.circleNumDimmed}>{index + 1}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.circle, styles.circleLocked]}>
      <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.30)" />
    </View>
  );
}

function JourneyStepColumn({
  step,
  index,
  steps,
  stepWidth,
  onPress,
}: {
  step: JourneyFlowStep;
  index: number;
  steps: JourneyFlowStep[];
  stepWidth: number;
  onPress: () => void;
}) {
  const isLocked = step.state === "locked";
  const isCurrent = step.state === "current";
  const isCompleted = step.state === "completed";
  const isInProgress = step.state === "in-progress";
  const isNotStarted = step.state === "not-started";
  const canOpen = step.state !== "locked" && !!step.roadmap;
  const isLast = index === steps.length - 1;
  const connectorActive = step.state === "completed" || step.state === "in-progress";

  return (
    <>
      <View style={[styles.stepColumn, { width: stepWidth }]}>
        <View style={styles.circleAlign}>
          <StepCircle step={step} index={index} />
        </View>

        <Pressable
          onPress={() => canOpen && onPress()}
          disabled={!canOpen}
          style={({ pressed }) => [styles.stepBody, pressed && canOpen && styles.nodePressed]}
          accessibilityRole="button"
          accessibilityLabel={`${step.title}, step ${index + 1}, ${step.state}`}
          accessibilityState={{ disabled: !canOpen }}
        >
          <View style={styles.labelSlot}>
            <Text
              style={[
                styles.label,
                (isCurrent || isInProgress) && styles.labelCurrent,
                isCompleted && styles.labelCompleted,
                (isLocked || isNotStarted) && styles.labelLocked,
              ]}
              numberOfLines={2}
            >
              {step.title}
            </Text>
          </View>

          <View style={styles.statusSlot}>
            {isCurrent ? (
              <View style={styles.hereBadge}>
                <Text style={styles.hereBadgeText} numberOfLines={1}>
                  YOU ARE HERE
                </Text>
              </View>
            ) : isInProgress ? (
              <View style={styles.inProgressBadge}>
                <Ionicons
                  name="ellipsis-horizontal"
                  size={10}
                  color="rgba(56,189,248,0.9)"
                  style={styles.doneIcon}
                />
                <Text style={styles.inProgressText}>In Progress</Text>
              </View>
            ) : isCompleted ? (
              <View style={styles.doneBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={10}
                  color="rgba(74,222,128,0.9)"
                  style={styles.doneIcon}
                />
                <Text style={styles.doneText}>Done</Text>
              </View>
            ) : isNotStarted ? (
              <Text style={styles.notStartedText} numberOfLines={1}>
                {notStartedStatusLabel(index, steps)}
              </Text>
            ) : (
              <Text style={styles.lockedText} numberOfLines={1}>
                Locked
              </Text>
            )}
          </View>
        </Pressable>
      </View>

      {!isLast ? (
        <View style={styles.connectorSlot}>
          <View style={[styles.connector, connectorActive && styles.connectorActive]} />
        </View>
      ) : null}
    </>
  );
}

export function PastorJourneyFlowStrip({ steps, onPressStep }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const [panelWidth, setPanelWidth] = useState(0);

  const progressMeta = useMemo(() => {
    const total = steps.length;
    const completedCount = steps.filter((s) => s.state === "completed").length;
    const activeCount = steps.filter((s) => s.state === "current" || s.state === "in-progress").length;
    const effectiveProgress = completedCount + activeCount * 0.5;
    const fillPct =
      total <= 1 ? (completedCount > 0 ? 100 : 0) : (effectiveProgress / (total - 1)) * 100;
    return { total, completedCount, fillPct };
  }, [steps]);

  const trackWidth = panelWidth || Math.max(260, windowWidth - 80);

  const { stepWidth, flowWidth, enableScroll } = useMemo(() => {
    const count = Math.max(steps.length, 1);
    const connectorTotal = Math.max(0, count - 1) * CONNECTOR_W;
    const contentWidth = steps.reduce(
      (max, step) => Math.max(max, estimateLabelColumnWidth(step.title)),
      MIN_STEP_WIDTH,
    );
    const evenly = (trackWidth - connectorTotal) / count;
    const width =
      evenly >= contentWidth ? Math.floor(evenly) : Math.ceil(contentWidth);
    const total = count * width + connectorTotal;
    return {
      stepWidth: width,
      flowWidth: total,
      enableScroll: total > trackWidth + 1,
    };
  }, [steps, trackWidth]);

  const handlePanelLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - panelWidth) > 1) {
      setPanelWidth(w);
    }
  };

  return (
    <View style={styles.panel} onLayout={handlePanelLayout}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.heading}>Your journey path</Text>
          <Text style={styles.subheading}>Complete each Roadmap phase in your journey</Text>
        </View>
        <View style={styles.phaseBadge}>
          <Text style={styles.phaseBadgeNum}>
            {progressMeta.completedCount}/{progressMeta.total}
          </Text>
          <Text style={styles.phaseBadgeLabel}>PHASES</Text>
        </View>
      </View>

      <View style={styles.trackBg}>
        <LinearGradient
          colors={["#6FD4BE", "#34D399"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.trackFill, { width: `${Math.min(100, progressMeta.fillPct)}%` }]}
        />
      </View>

      <ScrollView
        horizontal
        scrollEnabled={enableScroll}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.flowRow, { width: flowWidth }]}>
          {steps.map((step, index) => (
            <JourneyStepColumn
              key={step.id}
              step={step}
              index={index}
              steps={steps}
              stepWidth={stepWidth}
              onPress={() => onPressStep(step)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorderStrong,
    gap: 14,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  headerCopy: {
    flex: 1,
    gap: 3,
  },
  heading: {
    color: roadmapTheme.textPrimary,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  subheading: {
    color: roadmapTheme.textSubtle,
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 15,
  },
  phaseBadge: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(111,212,190,0.12)",
    borderWidth: 1,
    borderColor: "rgba(111,212,190,0.28)",
  },
  phaseBadgeNum: {
    color: roadmapTheme.accentMint,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 19,
  },
  phaseBadgeLabel: {
    color: roadmapTheme.textSubtle,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.6,
  },

  trackBg: {
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.09)",
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    borderRadius: 999,
  },

  scrollContent: {
    paddingVertical: 4,
    paddingRight: 2,
  },

  flowRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexShrink: 0,
  },

  stepColumn: {
    flexShrink: 0,
    alignItems: "center",
    overflow: "hidden",
  },
  circleAlign: {
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  stepBody: {
    width: "100%",
    marginTop: 12,
    alignItems: "center",
    paddingHorizontal: 4,
    overflow: "hidden",
  },
  labelSlot: {
    width: "100%",
    minHeight: 32,
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 12,
  },
  statusSlot: {
    width: "100%",
    minHeight: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  nodePressed: { opacity: 0.8 },

  connectorSlot: {
    width: CONNECTOR_W,
    height: NODE_SIZE,
    justifyContent: "center",
    flexShrink: 0,
  },
  connector: {
    width: "100%",
    height: 2.5,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  connectorActive: {
    backgroundColor: "rgba(111,212,190,0.75)",
  },

  circle: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  circleCurrent: {
    borderWidth: 2.5,
    borderColor: roadmapTheme.accentGold,
    shadowColor: "#6FD4BE",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 8,
  },
  circleInProgress: {
    borderWidth: 2,
    borderColor: "rgba(56,189,248,0.6)",
    opacity: 0.85,
  },
  circleCompleted: {
    backgroundColor: "rgba(34,197,94,0.88)",
    borderWidth: 1.5,
    borderColor: "rgba(74,222,128,0.45)",
  },
  circleNotStarted: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.20)",
  },
  circleLocked: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.11)",
  },
  circleNum: {
    color: roadmapTheme.tealDeep,
    fontSize: 18,
    fontWeight: "900",
  },
  circleNumDimmed: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 18,
    fontWeight: "900",
  },

  label: {
    alignSelf: "stretch",
    color: roadmapTheme.textPrimary,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 14,
  },
  labelCurrent: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 15,
  },
  labelCompleted: {
    color: "rgba(255,255,255,0.75)",
  },
  labelLocked: {
    color: roadmapTheme.textSubtle,
    fontWeight: "600",
  },

  hereBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(232,200,138,0.36)",
    maxWidth: "100%",
  },
  hereBadgeText: {
    fontSize: 8,
    fontWeight: "900",
    color: roadmapTheme.accentGold,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  doneBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.10)",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.22)",
    maxWidth: "100%",
  },
  inProgressBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
    maxWidth: "100%",
  },
  doneIcon: {
    marginRight: 3,
  },
  doneText: {
    fontSize: 9,
    fontWeight: "700",
    color: "rgba(74,222,128,0.90)",
  },
  inProgressText: {
    fontSize: 9,
    fontWeight: "700",
    color: "rgba(56,189,248,0.90)",
  },

  notStartedText: {
    fontSize: 9,
    fontWeight: "600",
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
  },
  lockedText: {
    fontSize: 9,
    fontWeight: "600",
    color: "rgba(255,255,255,0.28)",
    textAlign: "center",
  },
});
