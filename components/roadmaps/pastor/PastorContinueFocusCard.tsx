import { roadmapTheme } from "@/components/ui/design-system/roadmapTheme";
import { getNestedTaskTitleById } from "@/lib/roadmap/helpers";
import type { Roadmap } from "@/lib/roadmap/types";
import { getFontSize, getSpacing, isSmallDevice } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type JourneyMeta = {
  completed: number;
  total: number;
  nextIncompleteTaskId: string | null;
  allComplete: boolean;
  hasTasks: boolean;
};

type Props = {
  roadmap: Roadmap;
  journey: JourneyMeta;
  onContinue: () => void;
  onOpenPhase: () => void;
};

function ContinueJourneyButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.continueBtnOuter, pressed && styles.continueBtnPressed]}
      accessibilityRole="button"
      accessibilityLabel="Continue Journey"
    >
      <LinearGradient
        colors={["#FFFFFF", "#F0FDF9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.continueBtnGradient}
      >
        <Ionicons name="arrow-forward-circle" size={20} color={roadmapTheme.tealDeep} />
        <Text style={styles.continueBtnText}>Continue Journey</Text>
      </LinearGradient>
    </Pressable>
  );
}

/** Guided next-step card with a single clear CTA. */
export function PastorContinueFocusCard({
  roadmap,
  journey,
  onContinue,
  onOpenPhase,
}: Props) {
  const phaseName = String(roadmap.name ?? roadmap.phase ?? "Current phase").trim();
  const nextTaskTitle = useMemo(
    () =>
      journey.nextIncompleteTaskId
        ? getNestedTaskTitleById(roadmap, journey.nextIncompleteTaskId)
        : "Your next task",
    [roadmap, journey.nextIncompleteTaskId],
  );

  const isStarting = journey.completed === 0;
  const heading = isStarting ? "Your next recommended step" : "Continue where you left off";
  const explanation = isStarting
    ? "Start with this phase and work through each task at your own pace. Your mentor is here to guide you."
    : "Pick up your current task and keep moving forward one step at a time.";

  const imageSource = useMemo(() => {
    const url = roadmap.imageUrl;
    if (typeof url === "string" && url.trim()) return { uri: url };
    return undefined;
  }, [roadmap.imageUrl]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionLabel}>{heading}</Text>

      <View style={styles.cardShell}>
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.16)",
            "rgba(111, 212, 190, 0.12)",
            "rgba(255,255,255,0.08)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.coverWrap}>
            {imageSource ? (
              <Image source={imageSource} style={styles.cover} resizeMode="cover" />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Ionicons name="map-outline" size={32} color="rgba(255,255,255,0.5)" />
              </View>
            )}
            <LinearGradient
              colors={["transparent", "rgba(14, 50, 62, 0.45)"]}
              style={styles.coverFade}
            />
          </View>

          <View style={styles.body}>
            <View style={styles.phasePill}>
              <Ionicons name="layers-outline" size={14} color={roadmapTheme.accentGold} />
              <Text style={styles.phasePillText} numberOfLines={2}>
                {phaseName}
              </Text>
            </View>

            <Text style={styles.taskTitle} numberOfLines={2}>
              {nextTaskTitle}
            </Text>

            <Text style={styles.explanation}>{explanation}</Text>

            {journey.hasTasks && journey.total > 0 ? (
              <Text style={styles.phaseProgress}>
                {journey.completed} of {journey.total} tasks done in this phase
              </Text>
            ) : null}

            <View style={styles.ctaSection}>
              <ContinueJourneyButton onPress={onContinue} />

              <Pressable
                onPress={onOpenPhase}
                style={styles.secondaryLinkPress}
                accessibilityRole="button"
              >
                <Text style={styles.secondaryLink}>View all tasks in this phase</Text>
              </Pressable>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

type AllCaughtUpProps = {
  onViewHistory?: () => void;
};

export function PastorJourneyAllCaughtUp({ onViewHistory }: AllCaughtUpProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionLabel}>Continue where you left off</Text>
      <LinearGradient
        colors={[
          "rgba(34, 197, 94, 0.22)",
          "rgba(111, 212, 190, 0.14)",
          "rgba(255,255,255,0.08)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.caughtUpCard}
      >
        <Ionicons name="trophy" size={36} color={roadmapTheme.accentGold} />
        <Text style={styles.caughtUpTitle}>Wonderful progress!</Text>
        <Text style={styles.caughtUpSubtitle}>
          You have finished every phase assigned to you so far. Celebrate this milestone with your
          mentor.
        </Text>
        {onViewHistory ? (
          <Pressable
            onPress={onViewHistory}
            style={styles.secondaryLinkPress}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryLinkCentered}>Review your history</Text>
          </Pressable>
        ) : null}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 22,
  },
  sectionLabel: {
    color: roadmapTheme.accentGold,
    fontSize: getFontSize(11),
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  cardShell: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
    overflow: "hidden",
  },
  cardGradient: {
    borderRadius: 14,
  },
  coverWrap: {
    position: "relative",
    width: "100%",
    height: 120,
  },
  cover: {
    width: "100%",
    height: "100%",
  },
  coverFade: {
    ...StyleSheet.absoluteFillObject,
  },
  coverPlaceholder: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  body: {
    padding: 14,
    gap: getSpacing(8),
  },
  phasePill: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: getSpacing(6),
    paddingHorizontal: getSpacing(10),
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    maxWidth: "100%",
    marginBottom: getSpacing(2),
  },
  phasePillText: {
    color: roadmapTheme.textPrimary,
    fontSize: getFontSize(13),
    fontWeight: "600",
    flexShrink: 1,
    lineHeight: getFontSize(18),
    opacity: 0.95,
  },
  taskTitle: {
    color: roadmapTheme.textPrimary,
    fontSize: getFontSize(isSmallDevice ? 15 : 17),
    fontWeight: "800",
    lineHeight: getFontSize(isSmallDevice ? 20 : 23),
    letterSpacing: -0.2,
  },
  explanation: {
    color: roadmapTheme.textMuted,
    fontSize: getFontSize(isSmallDevice ? 12.5 : 13.5),
    fontWeight: "500",
    lineHeight: getFontSize(18),
  },
  phaseProgress: {
    color: roadmapTheme.textMuted,
    fontSize: getFontSize(12.5),
    fontWeight: "600",
  },
  ctaSection: {
    marginTop: getSpacing(4),
    gap: 2,
  },
  continueBtnOuter: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  continueBtnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  continueBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
    borderRadius: 12,
  },
  continueBtnText: {
    color: "#153C5A",
    fontSize: getFontSize(15),
    fontWeight: "800",
    letterSpacing: 0.15,
  },
  secondaryLinkPress: {
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryLink: {
    color: roadmapTheme.accentMint,
    fontSize: getFontSize(12.5),
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 8,
  },
  secondaryLinkCentered: {
    color: roadmapTheme.accentMint,
    fontSize: getFontSize(13),
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 10,
    minHeight: 44,
  },
  caughtUpCard: {
    borderRadius: 14,
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  caughtUpTitle: {
    color: roadmapTheme.textPrimary,
    fontSize: getFontSize(isSmallDevice ? 15 : 17),
    fontWeight: "800",
    textAlign: "center",
  },
  caughtUpSubtitle: {
    color: roadmapTheme.textMuted,
    fontSize: getFontSize(isSmallDevice ? 12.5 : 13.5),
    fontWeight: "500",
    textAlign: "center",
    lineHeight: getFontSize(18),
    maxWidth: 300,
  },
});
