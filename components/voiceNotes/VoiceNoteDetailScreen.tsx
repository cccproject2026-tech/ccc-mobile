import { useVoiceNotePolling } from "@/hooks/voiceNotes";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AudioPlayerCard } from "./AudioPlayerCard";
import { ProcessingStatus } from "./ProcessingStatus";
import { SummaryView } from "./SummaryView";
import { TranscriptView } from "./TranscriptView";

type TabType = "transcript" | "summary";

export function VoiceNoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: voiceNote, isLoading } = useVoiceNotePolling(id);
  const [activeTab, setActiveTab] = useState<TabType>("transcript");

  if (isLoading || !voiceNote) {
    return (
      <LinearGradient colors={["#0F3B5C", "#1A4F7A", "#264387"]} style={styles.gradient}>
        <SafeAreaView style={styles.loadingContainer}>
          <Stack.Screen options={{ headerShown: false }} />
          <ActivityIndicator size="large" color="#4FC3F7" />
          <Text style={styles.loadingText}>Loading voice note...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const isProcessing =
    voiceNote.status !== "completed" && voiceNote.status !== "failed";

  return (
    <LinearGradient colors={["#0F3B5C", "#1A4F7A", "#264387"]} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {voiceNote.title || "Voice Note"}
            </Text>
            <Text style={styles.headerDate}>
              {new Date(voiceNote.createdAt).toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* Audio Player */}
        <View style={styles.playerSection}>
          <AudioPlayerCard audioUri={voiceNote.audioUrl} title="Audio Playback" />
        </View>

        {/* Processing Status */}
        {isProcessing && (
          <View style={styles.statusSection}>
            <ProcessingStatus status={voiceNote.status} />
          </View>
        )}

        {/* Tabs */}
        {!isProcessing && (
          <View style={styles.tabsContainer}>
            <View style={styles.tabBar}>
              <Pressable
                style={[styles.tab, activeTab === "transcript" && styles.tabActive]}
                onPress={() => setActiveTab("transcript")}
              >
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color={activeTab === "transcript" ? "#4FC3F7" : "rgba(255,255,255,0.5)"}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "transcript" && styles.tabTextActive,
                  ]}
                >
                  Transcript
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, activeTab === "summary" && styles.tabActive]}
                onPress={() => setActiveTab("summary")}
              >
                <Ionicons
                  name="sparkles-outline"
                  size={16}
                  color={activeTab === "summary" ? "#CE93D8" : "rgba(255,255,255,0.5)"}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "summary" && styles.tabTextActive,
                  ]}
                >
                  AI Summary
                </Text>
              </Pressable>
            </View>

            <View style={styles.tabContent}>
              {activeTab === "transcript" ? (
                <TranscriptView transcript={voiceNote.transcript} />
              ) : (
                <SummaryView summary={voiceNote.transcriptSummary} />
              )}
            </View>
          </View>
        )}

        {/* Failed state */}
        {voiceNote.status === "failed" && (
          <View style={styles.failedContainer}>
            <ProcessingStatus status="failed" />
            <Text style={styles.failedHint}>
              The audio could not be processed. Please try uploading again.
            </Text>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  headerDate: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 2,
  },
  playerSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  statusSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  tabsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  tabText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#fff",
  },
  tabContent: {
    flex: 1,
  },
  failedContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: "center",
  },
  failedHint: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
});
