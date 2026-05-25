import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

export interface PhaseCompletionModalProps {
  visible: boolean;
  phaseName: string;
  completedCount: number;
  totalCount: number;
  currentPhaseNumber: number;
  totalPhases: number;
  nextPhaseName?: string;
  hasNextPhase: boolean;
  onStartNextPhase: () => void;
  onBackToJourney: () => void;
}

export function PhaseCompletionModal({
  visible,
  phaseName,
  completedCount,
  totalCount,
  currentPhaseNumber,
  totalPhases,
  nextPhaseName,
  hasNextPhase,
  onStartNextPhase,
  onBackToJourney,
}: PhaseCompletionModalProps) {
  if (!visible) return null;

  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <Animated.View entering={FadeInUp.duration(350)} style={styles.card}>
          <LinearGradient
            colors={["#0B2A45", "#0E3A5A", "#123E60"]}
            style={styles.cardGradient}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              bounces={false}
            >
              <Animated.View
                entering={FadeIn.delay(150).duration(300)}
                style={styles.trophyWrap}
              >
                <LinearGradient
                  colors={["#FFD700", "#FFA500"]}
                  style={styles.trophyCircle}
                >
                  <Ionicons name="trophy" size={34} color="#fff" />
                </LinearGradient>
              </Animated.View>

              <Animated.View entering={FadeIn.delay(250).duration(300)}>
                <Text style={styles.title}>🎊 Congratulations!</Text>
                <Text style={styles.subtitle}>
                  You've completed the {phaseName} phase.
                </Text>
              </Animated.View>

              <Animated.View
                entering={FadeIn.delay(350).duration(300)}
                style={styles.statsRow}
              >
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>
                    {completedCount}/{totalCount}
                  </Text>
                  <Text style={styles.statLabel}>Tasks Done</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{progressPercent}%</Text>
                  <Text style={styles.statLabel}>Phase Complete</Text>
                </View>
              </Animated.View>

              <Animated.View
                entering={FadeIn.delay(450).duration(300)}
                style={styles.journeyProgressCard}
              >
                <View style={styles.journeyProgressHeader}>
                  <Ionicons name="map-outline" size={16} color="#7EC8FF" />
                  <Text style={styles.journeyProgressTitle}>
                    Journey Progress
                  </Text>
                </View>
                <Text style={styles.journeyProgressValue}>
                  Phase {currentPhaseNumber} of {totalPhases} completed
                </Text>
                <View style={styles.journeyProgressTrack}>
                  {Array.from({ length: totalPhases }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.journeyProgressDot,
                        i < currentPhaseNumber &&
                          styles.journeyProgressDotActive,
                      ]}
                    />
                  ))}
                </View>
              </Animated.View>

              {hasNextPhase && (
                <Animated.View
                  entering={FadeIn.delay(500).duration(300)}
                  style={styles.whatsNextCard}
                >
                  <View style={styles.whatsNextHeader}>
                    <Ionicons
                      name="arrow-forward-circle"
                      size={18}
                      color="#34D399"
                    />
                    <Text style={styles.whatsNextTitle}>What's Next</Text>
                  </View>
                  <Text style={styles.whatsNextDesc}>
                    {nextPhaseName
                      ? `Your next journey phase "${nextPhaseName}" is now available.`
                      : "Your next journey phase is now available."}
                  </Text>
                </Animated.View>
              )}

              <Animated.View
                entering={FadeInDown.delay(550).duration(300)}
                style={styles.actions}
              >
                {hasNextPhase ? (
                  <Pressable style={styles.primaryBtn} onPress={onStartNextPhase}>
                    <Text style={styles.primaryBtnText}>Start Next Phase</Text>
                    <Ionicons name="arrow-forward" size={16} color="#0B2E4D" />
                  </Pressable>
                ) : (
                  <Pressable style={styles.primaryBtn} onPress={onBackToJourney}>
                    <Text style={styles.primaryBtnText}>View Journey</Text>
                    <Ionicons name="arrow-forward" size={16} color="#0B2E4D" />
                  </Pressable>
                )}
                <Pressable style={styles.secondaryBtn} onPress={onBackToJourney}>
                  <Text style={styles.secondaryBtnText}>Back to Journey</Text>
                </Pressable>
              </Animated.View>
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    maxHeight: "88%",
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 14,
  },
  cardGradient: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 28,
    overflow: "hidden",
  },
  scrollContent: {
    padding: 24,
    alignItems: "center",
    gap: 16,
  },
  trophyWrap: {
    marginBottom: 4,
  },
  trophyCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: "rgba(200,225,255,0.82)",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
    marginTop: 4,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  statLabel: {
    color: "rgba(200,225,255,0.65)",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  journeyProgressCard: {
    width: "100%",
    backgroundColor: "rgba(126,200,255,0.06)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(126,200,255,0.12)",
    gap: 8,
  },
  journeyProgressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  journeyProgressTitle: {
    color: "#7EC8FF",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  journeyProgressValue: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontWeight: "700",
  },
  journeyProgressTrack: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  journeyProgressDot: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  journeyProgressDotActive: {
    backgroundColor: "#34D399",
  },
  whatsNextCard: {
    width: "100%",
    backgroundColor: "rgba(52,211,153,0.06)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.15)",
    gap: 6,
  },
  whatsNextHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  whatsNextTitle: {
    color: "#34D399",
    fontSize: 14,
    fontWeight: "800",
  },
  whatsNextDesc: {
    color: "rgba(200,225,255,0.75)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  actions: {
    width: "100%",
    gap: 10,
    marginTop: 4,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  primaryBtnText: {
    color: "#0B2E4D",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  secondaryBtnText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontWeight: "700",
  },
});
