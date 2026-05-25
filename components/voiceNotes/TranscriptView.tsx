import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

interface TranscriptViewProps {
  transcript: string | undefined;
}

export function TranscriptView({ transcript }: TranscriptViewProps) {
  const handleCopy = useCallback(async () => {
    if (!transcript) return;
    try {
      await Clipboard.setStringAsync(transcript);
      Toast.show({
        type: "success",
        text1: "Copied",
        text2: "Transcript copied to clipboard",
        position: "top",
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Copy failed",
        position: "top",
      });
    }
  }, [transcript]);

  if (!transcript) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="document-text-outline"
          size={48}
          color="rgba(255,255,255,0.2)"
        />
        <Text style={styles.emptyText}>Transcript not available yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transcript</Text>
        <Pressable onPress={handleCopy} style={styles.copyBtn} hitSlop={10}>
          <Ionicons name="copy-outline" size={18} color="rgba(255,255,255,0.6)" />
          <Text style={styles.copyText}>Copy</Text>
        </Pressable>
      </View>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.transcriptText}>{transcript}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  copyText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "500",
  },
  scrollArea: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  scrollContent: {
    padding: 16,
  },
  transcriptText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 60,
  },
  emptyText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
  },
});
