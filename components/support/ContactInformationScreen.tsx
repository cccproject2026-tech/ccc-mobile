import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SUPPORT_PHONE = "269-471-0159";
const SUPPORT_EMAIL = "communitychange@andrews.edu";

/**
 * Shared contact / help screen (pastor home Help, mentor home Help).
 */
export default function ContactInformationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleCallSupport = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`);
  };

  const handleMailSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  };

  return (
    <LinearGradient
      colors={["#0F3B5C", "#1A4F7A", "#2389C2"]}
      style={styles.screen}
    >
      <View
        style={[
          styles.container,
          { paddingTop: Math.max(insets.top, 12) + 8 },
        ]}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <Text style={styles.title}>Contact Information</Text>
        <Text style={styles.subtitle}>
          Need help? Reach out through the options below.
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="call-outline" size={18} color="#BFE7FF" />
            <Text style={styles.cardLabel}>Phone</Text>
          </View>
          <Text style={styles.cardValue}>: {SUPPORT_PHONE}</Text>
          <View style={styles.row}>
            <Ionicons name="mail-outline" size={18} color="#BFE7FF" />
            <Text style={styles.cardLabel}>Email</Text>
          </View>
          <Text style={styles.cardValue}>: {SUPPORT_EMAIL}</Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={styles.actionButton} onPress={handleCallSupport}>
            <Ionicons name="call-outline" size={16} color="#0A3F6B" />
            <Text style={styles.actionText}>Call</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleMailSupport}>
            <Ionicons name="mail-outline" size={16} color="#0A3F6B" />
            <Text style={styles.actionText}>Email</Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  backText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    marginTop: 2,
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    lineHeight: 19,
  },
  card: {
    marginTop: 8,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  cardValue: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    lineHeight: 20,
  },
  actionsRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  actionText: {
    color: "#0A3F6B",
    fontSize: 14,
    fontWeight: "700",
  },
});
