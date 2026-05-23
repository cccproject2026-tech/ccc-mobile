import { roadmapTheme } from "@/components/ui/design-system/roadmapTheme";
import type { JourneyFlowStep } from "@/lib/roadmap/journeyFlow";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  steps: JourneyFlowStep[];
  onPressStep: (step: JourneyFlowStep) => void;
};

const NODE_SIZE = 44;

function StepNode({
  step,
  index,
  onPress,
}: {
  step: JourneyFlowStep;
  index: number;
  onPress: () => void;
}) {
  const isLocked = step.state === "locked";
  const isCurrent = step.state === "current";
  const isCompleted = step.state === "completed";
  const canOpen = !isLocked && !!step.roadmap;

  return (
    <Pressable
      onPress={() => canOpen && onPress()}
      disabled={!canOpen}
      style={({ pressed }) => [
        styles.nodeCol,
        pressed && canOpen ? styles.nodePressed : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${step.title}, step ${index + 1}, ${step.state}`}
      accessibilityState={{ disabled: !canOpen }}
    >
      {isCurrent ? (
        <View style={styles.currentRing}>
          <LinearGradient
            colors={["#6FD4BE", "#34D399"]}
            style={styles.nodeCircleCurrent}
          >
            <Text style={styles.nodeStepNum}>{index + 1}</Text>
          </LinearGradient>
        </View>
      ) : isCompleted ? (
        <View style={[styles.nodeCircle, styles.nodeCircleCompleted]}>
          <Ionicons name="checkmark" size={20} color="#fff" />
        </View>
      ) : (
        <View style={[styles.nodeCircle, styles.nodeCircleLocked]}>
          <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.45)" />
        </View>
      )}

      <Text
        style={[
          styles.nodeLabel,
          isCurrent && styles.nodeLabelCurrent,
          isLocked && styles.nodeLabelLocked,
          isCompleted && styles.nodeLabelCompleted,
        ]}
        numberOfLines={2}
      >
        {step.title}
      </Text>

      {isCurrent ? (
        <View style={styles.hereBadge}>
          <Text style={styles.hereBadgeText}>You are here</Text>
        </View>
      ) : isLocked ? (
        <Text style={styles.comingHint}>Coming next</Text>
      ) : isCompleted ? (
        <Text style={styles.doneHint}>Done</Text>
      ) : null}
    </Pressable>
  );
}

/** Timeline-style journey path with progress track and clear step nodes. */
export function PastorJourneyFlowStrip({ steps, onPressStep }: Props) {
  const progressMeta = useMemo(() => {
    const total = steps.length;
    let currentIndex = steps.findIndex((s) => s.state === "current");
    if (currentIndex < 0) {
      const allDone = steps.every((s) => s.state === "completed");
      currentIndex = allDone ? total : 0;
    }
    const completedCount = steps.filter((s) => s.state === "completed").length;
    const fillPct =
      total <= 1 ? (completedCount > 0 ? 100 : 0) : (completedCount / (total - 1)) * 100;
    return { total, currentIndex, completedCount, fillPct };
  }, [steps]);

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.heading}>Your journey path</Text>
          <Text style={styles.hint}>Complete each phase to unlock the next</Text>
        </View>
        <View style={styles.stepCounter}>
          <Text style={styles.stepCounterText}>
            {progressMeta.completedCount}/{progressMeta.total}
          </Text>
          <Text style={styles.stepCounterLabel}>phases</Text>
        </View>
      </View>

      <View style={styles.trackWrap}>
        <View style={styles.trackBg} />
        <View style={[styles.trackFill, { width: `${Math.min(100, progressMeta.fillPct)}%` }]} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepSlot}>
            <StepNode
              step={step}
              index={index}
              onPress={() => onPressStep(step)}
            />
            {index < steps.length - 1 ? (
              <View style={styles.connector}>
                <View
                  style={[
                    styles.connectorLine,
                    step.state === "completed" && styles.connectorLineActive,
                  ]}
                />
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginBottom: 22,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorderStrong,
    gap: 14,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
    gap: 4,
  },
  heading: {
    color: roadmapTheme.textPrimary,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  hint: {
    color: roadmapTheme.textSubtle,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  stepCounter: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 52,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "rgba(111, 212, 190, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(111, 212, 190, 0.28)",
  },
  stepCounterText: {
    color: roadmapTheme.accentMint,
    fontSize: 16,
    fontWeight: "900",
  },
  stepCounterLabel: {
    color: roadmapTheme.textSubtle,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  trackWrap: {
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  trackBg: {
    ...StyleSheet.absoluteFillObject,
  },
  trackFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: roadmapTheme.accentMint,
  },
  scrollContent: {
    paddingVertical: 6,
    paddingHorizontal: 2,
    alignItems: "flex-start",
  },
  stepSlot: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  nodeCol: {
    width: 108,
    alignItems: "center",
    gap: 8,
  },
  nodePressed: {
    opacity: 0.88,
  },
  currentRing: {
    padding: 3,
    borderRadius: NODE_SIZE,
    borderWidth: 2,
    borderColor: roadmapTheme.accentGold,
    backgroundColor: "rgba(232, 200, 138, 0.15)",
  },
  nodeCircle: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  nodeCircleCurrent: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  nodeCircleCompleted: {
    backgroundColor: "rgba(34, 197, 94, 0.9)",
    borderColor: "rgba(74, 222, 128, 0.55)",
  },
  nodeCircleLocked: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.14)",
  },
  nodeStepNum: {
    color: roadmapTheme.tealDeep,
    fontSize: 18,
    fontWeight: "900",
  },
  nodeLabel: {
    color: roadmapTheme.textPrimary,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 16,
    minHeight: 32,
  },
  nodeLabelCurrent: {
    color: "#fff",
    fontSize: 13,
  },
  nodeLabelCompleted: {
    color: "rgba(255,255,255,0.88)",
  },
  nodeLabelLocked: {
    color: roadmapTheme.textSubtle,
    fontWeight: "700",
  },
  hereBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(232, 200, 138, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(232, 200, 138, 0.35)",
  },
  hereBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: roadmapTheme.accentGold,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  comingHint: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.38)",
  },
  doneHint: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(74, 222, 128, 0.85)",
  },
  connector: {
    width: 28,
    paddingTop: NODE_SIZE / 2 - 1,
    alignItems: "center",
  },
  connectorLine: {
    width: "100%",
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  connectorLineActive: {
    backgroundColor: "rgba(111, 212, 190, 0.65)",
  },
});
