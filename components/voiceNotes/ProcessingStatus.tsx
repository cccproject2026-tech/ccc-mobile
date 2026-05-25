import type { VoiceNoteStatus } from "@/types/voiceNote.types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

interface ProcessingStatusProps {
  status: VoiceNoteStatus;
}

const STATUS_INFO: Record<
  VoiceNoteStatus,
  { message: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  pending: {
    message: "Uploading audio...",
    icon: "cloud-upload-outline",
    color: "#FFB74D",
  },
  transcribing: {
    message: "Generating transcript...",
    icon: "document-text-outline",
    color: "#4FC3F7",
  },
  summarizing: {
    message: "Creating AI summary...",
    icon: "sparkles-outline",
    color: "#CE93D8",
  },
  completed: {
    message: "Processing complete",
    icon: "checkmark-circle",
    color: "#81C784",
  },
  failed: {
    message: "Processing failed",
    icon: "alert-circle",
    color: "#E57373",
  },
};

export function ProcessingStatus({ status }: ProcessingStatusProps) {
  const info = STATUS_INFO[status];
  const spinAnim = useRef(new Animated.Value(0)).current;
  const isProcessing = status !== "completed" && status !== "failed";

  useEffect(() => {
    if (isProcessing) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.setValue(0);
    }
  }, [isProcessing]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, { borderColor: `${info.color}30` }]}>
      <Animated.View
        style={isProcessing ? { transform: [{ rotate: spin }] } : undefined}
      >
        <Ionicons name={info.icon} size={24} color={info.color} />
      </Animated.View>
      <Text style={[styles.message, { color: info.color }]}>{info.message}</Text>
      {isProcessing && (
        <Text style={styles.hint}>This may take a moment...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
  },
});
