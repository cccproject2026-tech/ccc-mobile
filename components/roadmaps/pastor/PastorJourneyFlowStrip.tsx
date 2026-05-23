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

const NODE_SIZE = 52;
const CONNECTOR_W = 32;

function StepNode({
  step,
  index,
  onPress,
  isLast,
}: {
  step: JourneyFlowStep;
  index: number;
  onPress: () => void;
  isLast: boolean;
}) {
  const isLocked = step.state === "locked";
  const isCurrent = step.state === "current";
  const isCompleted = step.state === "completed";
  const canOpen = !isLocked && !!step.roadmap;

  return (
    <View style={styles.stepSlot}>
      {/* ── Node column ── */}
      <Pressable
        onPress={() => canOpen && onPress()}
        disabled={!canOpen}
        style={({ pressed }) => [styles.nodeCol, pressed && canOpen && styles.nodePressed]}
        accessibilityRole="button"
        accessibilityLabel={`${step.title}, step ${index + 1}, ${step.state}`}
        accessibilityState={{ disabled: !canOpen }}
      >
        {/* Circle */}
        {isCurrent ? (
          <LinearGradient
            colors={["#6FD4BE", "#34D399"]}
            style={[styles.circle, styles.circleCurrent]}
          >
            <Text style={styles.circleNum}>{index + 1}</Text>
          </LinearGradient>
        ) : isCompleted ? (
          <View style={[styles.circle, styles.circleCompleted]}>
            <Ionicons name="checkmark" size={22} color="#fff" />
          </View>
        ) : (
          <View style={[styles.circle, styles.circleLocked]}>
            <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.30)" />
          </View>
        )}

        {/* Label */}
        <Text
          style={[
            styles.label,
            isCurrent && styles.labelCurrent,
            isCompleted && styles.labelCompleted,
            isLocked && styles.labelLocked,
          ]}
          numberOfLines={2}
        >
          {step.title}
        </Text>

        {/* Status badge */}
        {isCurrent ? (
          <View style={styles.hereBadge}>
            <Text style={styles.hereBadgeText}>YOU ARE HERE</Text>
          </View>
        ) : isCompleted ? (
          <View style={styles.doneBadge}>
            <Ionicons name="checkmark-circle" size={10} color="rgba(74,222,128,0.9)" style={{ marginRight: 3 }} />
            <Text style={styles.doneText}>Done</Text>
          </View>
        ) : (
          <Text style={styles.lockedText}>Coming next</Text>
        )}
      </Pressable>

      {/* ── Connector ── */}
      {!isLast && (
        <View style={styles.connectorWrap}>
          <View
            style={[
              styles.connectorLine,
              isCompleted && styles.connectorActive,
            ]}
          />
          {isCompleted && <View style={styles.connectorArrow} />}
        </View>
      )}
    </View>
  );
}

export function PastorJourneyFlowStrip({ steps, onPressStep }: Props) {
  const progressMeta = useMemo(() => {
    const total = steps.length;
    const completedCount = steps.filter((s) => s.state === "completed").length;
    const fillPct =
      total <= 1 ? (completedCount > 0 ? 100 : 0) : (completedCount / (total - 1)) * 100;
    return { total, completedCount, fillPct };
  }, [steps]);

  return (
    <View style={styles.panel}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={styles.heading}>Your journey path</Text>
          <Text style={styles.subheading}>Complete each phase to unlock the next</Text>
        </View>
        <View style={styles.phaseBadge}>
          <Text style={styles.phaseBadgeNum}>
            {progressMeta.completedCount}/{progressMeta.total}
          </Text>
          <Text style={styles.phaseBadgeLabel}>PHASES</Text>
        </View>
      </View>

      {/* ── Progress bar ── */}
      <View style={styles.trackBg}>
        <LinearGradient
          colors={["#6FD4BE", "#34D399"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.trackFill, { width: `${Math.min(100, progressMeta.fillPct)}%` }]}
        />
      </View>

      {/* ── Steps (horizontal scroll) ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {steps.map((step, index) => (
          <StepNode
            key={step.id}
            step={step}
            index={index}
            onPress={() => onPressStep(step)}
            isLast={index === steps.length - 1}
          />
        ))}
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

  // ── Header ────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
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

  // ── Progress track ────────────────────────────────────
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

  // ── Scroll row ────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: 2,
    paddingVertical: 4,
    alignItems: "flex-start",
  },
  stepSlot: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  // ── Node column ───────────────────────────────────────
  nodeCol: {
    width: 88,
    alignItems: "center",
    gap: 8,
  },
  nodePressed: { opacity: 0.80 },

  circle: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
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
  circleCompleted: {
    backgroundColor: "rgba(34,197,94,0.88)",
    borderWidth: 1.5,
    borderColor: "rgba(74,222,128,0.45)",
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

  label: {
    marginTop: 10,
    color: roadmapTheme.textPrimary,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 14,
    minHeight: 28,
  },
  labelCurrent: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
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
  },
  hereBadgeText: {
    fontSize: 8,
    fontWeight: "900",
    color: roadmapTheme.accentGold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
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
  },
  doneText: {
    fontSize: 9,
    fontWeight: "700",
    color: "rgba(74,222,128,0.90)",
  },

  lockedText: {
    fontSize: 9,
    fontWeight: "600",
    color: "rgba(255,255,255,0.28)",
  },

  // ── Connector ─────────────────────────────────────────
  connectorWrap: {
    width: CONNECTOR_W,
    height: NODE_SIZE,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  connectorLine: {
    flex: 1,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  connectorActive: {
    backgroundColor: "rgba(111,212,190,0.55)",
  },
  connectorArrow: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(111,212,190,0.75)",
    marginLeft: -1,
  },
});