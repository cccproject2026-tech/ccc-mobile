import type { VoiceNote, VoiceNoteStatus } from "@/types/voiceNote.types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface VoiceNoteCardProps {
  voiceNote: VoiceNote;
  onPress: (voiceNote: VoiceNote) => void;
}

const STATUS_CONFIG: Record<
  VoiceNoteStatus,
  { label: string; color: string; bgColor: string }
> = {
  pending: { label: "Uploading", color: "#FFB74D", bgColor: "rgba(255,183,77,0.15)" },
  transcribing: { label: "Transcribing", color: "#4FC3F7", bgColor: "rgba(79,195,247,0.15)" },
  summarizing: { label: "Summarizing", color: "#CE93D8", bgColor: "rgba(206,147,216,0.15)" },
  completed: { label: "Completed", color: "#81C784", bgColor: "rgba(129,199,132,0.15)" },
  failed: { label: "Failed", color: "#E57373", bgColor: "rgba(229,115,115,0.15)" },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function VoiceNoteCard({ voiceNote, onPress }: VoiceNoteCardProps) {
  const statusConfig = STATUS_CONFIG[voiceNote.status];
  const isRecording = voiceNote.source === "recording";

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(voiceNote)}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={isRecording ? "mic" : "document-attach"}
          size={22}
          color="rgba(255,255,255,0.7)"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {voiceNote.title || "Untitled Voice Note"}
        </Text>

        <View style={styles.metaRow}>
          <View
            style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}
          >
            <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>

          <Text style={styles.dateText}>{formatDate(voiceNote.createdAt)}</Text>
        </View>

        {voiceNote.recordingDurationSeconds != null && (
          <Text style={styles.durationText}>
            {Math.floor(voiceNote.recordingDurationSeconds / 60)}:
            {(voiceNote.recordingDurationSeconds % 60).toString().padStart(2, "0")}
          </Text>
        )}
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="rgba(255,255,255,0.3)"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardPressed: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  dateText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
  },
  durationText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    marginTop: 4,
  },
});
