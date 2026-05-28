import type { TranscriptLine } from "@/lib/session/transcriptParse";
import { messageBodyForTranscriptLine } from "@/lib/session/transcriptParse";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ViewerRole = "mentor" | "pastor";

type Props = {
  lines: TranscriptLine[];
  viewerRole: ViewerRole;
  checkingForTranscript?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export function MeetingTranscriptChat({
  lines,
  viewerRole,
  checkingForTranscript,
  onRefresh,
  refreshing,
}: Props) {
  const hasContent = lines.some((line) => line.text.trim());

  if (!hasContent) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubbles-outline" size={32} color="rgba(255,255,255,0.3)" />
        <Text style={styles.emptyText}>
          {checkingForTranscript ? "Checking for transcript..." : "No transcript available yet"}
        </Text>
        <Text style={styles.emptySubtext}>
          {checkingForTranscript
            ? "Please wait, we are fetching transcript and AI summary."
            : "Transcript will appear after the meeting"}
        </Text>
        {!!onRefresh && (
          <Pressable
            onPress={onRefresh}
            disabled={!!refreshing}
            style={({ pressed }) => [
              styles.refreshButton,
              (pressed || !!refreshing) && styles.refreshButtonPressed,
            ]}
          >
            <View style={styles.refreshButtonContent}>
              {refreshing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
              )}
              <Text
                numberOfLines={1}
                style={[styles.refreshButtonText, refreshing && styles.refreshButtonTextDisabled]}
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </Text>
            </View>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator
      nestedScrollEnabled
    >
      {lines.map((line, idx) => {
        const isMentorLine = line.role === "mentor";
        const isOwnMessage =
          viewerRole === "mentor" ? isMentorLine : !isMentorLine;
        const roleLabel = isMentorLine ? "Mentor" : "Pastor";
        const speaker = line.speaker?.trim();
        const showSpeakerName =
          !!speaker && !/^(mentor|pastor)$/i.test(speaker);

        return (
          <View
            key={`${idx}-${line.role}-${line.text.slice(0, 24)}`}
            style={[styles.messageRow, isOwnMessage ? styles.rowRight : styles.rowLeft]}
          >
            <View
              style={[
                styles.bubble,
                isOwnMessage ? styles.bubbleOwn : styles.bubbleOther,
                isMentorLine ? styles.bubbleMentorTint : styles.bubblePastorTint,
              ]}
            >
              <View style={styles.roleRow}>
                <Ionicons
                  name={isMentorLine ? "person-outline" : "people-outline"}
                  size={14}
                  color="rgba(255,255,255,0.55)"
                />
                <Text style={styles.roleLabel}>{roleLabel}</Text>
                {showSpeakerName ? (
                  <Text style={styles.speakerName} numberOfLines={1}>
                    · {speaker}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.messageText}>{messageBodyForTranscriptLine(line)}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  emptyContainer: { alignItems: "center", padding: 24, gap: 8 },
  emptyText: { color: "rgba(255,255,255,0.5)", fontSize: 15, fontWeight: "500" },
  emptySubtext: { color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center" },
  refreshButton: {
    marginTop: 16,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  refreshButtonPressed: { backgroundColor: "rgba(255,255,255,0.12)" },
  refreshButtonContent: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  refreshButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  refreshButtonTextDisabled: { color: "rgba(255,255,255,0.6)" },
  scroll: { maxHeight: 400 },
  scrollContent: { paddingBottom: 12, gap: 10 },
  messageRow: { flexDirection: "row", width: "100%" },
  rowLeft: { justifyContent: "flex-start" },
  rowRight: { justifyContent: "flex-end" },
  bubble: {
    maxWidth: "82%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleOwn: {
    borderBottomRightRadius: 4,
    backgroundColor: "rgba(56, 189, 248, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.35)",
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  bubbleMentorTint: {},
  bubblePastorTint: {},
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  roleLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.65)" },
  speakerName: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.45)",
    flexShrink: 1,
  },
  messageText: { color: "rgba(255,255,255,0.92)", fontSize: 14, lineHeight: 21 },
});
