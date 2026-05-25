import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

export interface TaskCompletionModalProps {
  visible: boolean;
  taskName: string;
  phaseName: string;
  completedCount: number;
  totalCount: number;
  onContinueJourney: () => void;
  onBackToPhase: () => void;
}

export function TaskCompletionModal({
  visible,
  taskName,
  phaseName,
  completedCount,
  totalCount,
  onContinueJourney,
  onBackToPhase,
}: TaskCompletionModalProps) {
  const checkScale = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      checkScale.value = withDelay(150, withTiming(1, { duration: 350 }));
      const target = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
      progressWidth.value = withDelay(400, withTiming(target, { duration: 600 }));
    } else {
      checkScale.value = 0;
      progressWidth.value = 0;
    }
  }, [visible, completedCount, totalCount]);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <Animated.View entering={FadeInUp.duration(300)} style={styles.card}>
          <LinearGradient
            colors={["#0B2E4D", "#0F3B5C", "#164B72"]}
            style={styles.cardGradient}
          >
            <Animated.View style={[styles.iconCircle, checkStyle]}>
              <LinearGradient
                colors={["#34D399", "#10B981"]}
                style={styles.iconGradient}
              >
                <Ionicons name="checkmark" size={30} color="#fff" />
              </LinearGradient>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(200).duration(300)}>
              <Text style={styles.title}>🎉 Great Job!</Text>
              <Text style={styles.subtitle}>You completed this task successfully.</Text>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(300).duration(300)} style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Ionicons name="checkmark-circle" size={16} color="#34D399" />
                <Text style={styles.detailLabel} numberOfLines={2}>
                  {taskName}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Ionicons name="layers-outline" size={16} color="#7EC8FF" />
                <Text style={styles.detailLabel} numberOfLines={1}>
                  {phaseName}
                </Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(400).duration(300)} style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Phase Progress</Text>
                <Text style={styles.progressCount}>
                  {completedCount} of {totalCount} tasks completed
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, progressBarStyle]} />
              </View>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(450).duration(300)} style={styles.encouragement}>
              <Ionicons name="sparkles" size={14} color="#E8C88A" />
              <Text style={styles.encouragementText}>
                Every completed step strengthens your journey forward.
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(500).duration(300)} style={styles.actions}>
              <Pressable style={styles.primaryBtn} onPress={onContinueJourney}>
                <Text style={styles.primaryBtnText}>Continue Journey</Text>
                <Ionicons name="arrow-forward" size={16} color="#0B2E4D" />
              </Pressable>
              <Pressable style={styles.secondaryBtn} onPress={onBackToPhase}>
                <Text style={styles.secondaryBtnText}>Back to Phase</Text>
              </Pressable>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  cardGradient: {
    padding: 24,
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
  },
  iconCircle: {
    marginBottom: 4,
  },
  iconGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: "rgba(200,225,255,0.8)",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
    marginTop: 4,
  },
  detailsCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailLabel: {
    flex: 1,
    color: "rgba(255,255,255,0.88)",
    fontSize: 13,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  progressSection: {
    width: "100%",
    gap: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressTitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressCount: {
    color: "#7EC8FF",
    fontSize: 12,
    fontWeight: "800",
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#34D399",
  },
  encouragement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(232,200,138,0.08)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(232,200,138,0.15)",
  },
  encouragementText: {
    flex: 1,
    color: "rgba(232,200,138,0.9)",
    fontSize: 12,
    fontWeight: "600",
    fontStyle: "italic",
    lineHeight: 18,
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
    paddingVertical: 15,
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
