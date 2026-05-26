import { PrimaryButton } from "@/components/ui/design-system/PrimaryButton";
import { roadmapTheme } from "@/components/ui/design-system/roadmapTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onStart: () => void;
};

/** One-time welcome for first roadmap visit — plain language for non-technical pastors. */
export function PastorJourneyWelcomeModal({ visible, onStart }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onStart}
      accessibilityViewIsModal
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onStart} accessibilityLabel="Close welcome" />

        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="heart-outline" size={36} color={roadmapTheme.tealDeep} />
          </View>

          <Text style={styles.title}>Welcome to your revitalization journey</Text>

          <Text style={styles.body}>
            You will complete phases, tasks, assessments, and mentor activities step-by-step. Take
            your time — we will always show you what to do next.
          </Text>

          <View style={styles.steps}>
            <WelcomeStep icon="layers-outline" text="Phases are big chapters of your journey" />
            <WelcomeStep icon="checkbox-outline" text="Tasks are the steps inside each Roadmap" />
            <WelcomeStep icon="people-outline" text="Your mentor supports you along the way" />
          </View>

          <PrimaryButton
            label="Start Journey"
            onPress={onStart}
            leftIcon={
              <Ionicons name="arrow-forward" size={18} color={roadmapTheme.tealDeep} />
            }
          />
        </View>
      </View>
    </Modal>
  );
}

function WelcomeStep({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.stepRow}>
      <Ionicons name={icon} size={18} color={roadmapTheme.accentMint} />
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(6, 40, 48, 0.72)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 24,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(111, 212, 190, 0.22)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  title: {
    color: roadmapTheme.tealDeep,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 26,
  },
  body: {
    color: "rgba(14, 90, 98, 0.82)",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 22,
  },
  steps: {
    gap: 12,
    paddingVertical: 4,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepText: {
    flex: 1,
    color: "#334155",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
});
