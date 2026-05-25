import { useAudioPlayer } from "@/hooks/voiceNotes/useAudioPlayer";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface AudioPlayerCardProps {
  audioUri: string | undefined;
  title?: string;
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function AudioPlayerCard({ audioUri, title }: AudioPlayerCardProps) {
  const {
    isPlaying,
    isLoaded,
    positionMs,
    durationMs,
    isBuffering,
    togglePlayPause,
    replay,
  } = useAudioPlayer(audioUri);

  if (!audioUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.noAudioText}>No audio available</Text>
      </View>
    );
  }

  const progress = durationMs > 0 ? positionMs / durationMs : 0;

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      <View style={styles.controls}>
        <Pressable
          onPress={togglePlayPause}
          style={styles.playButton}
          hitSlop={12}
        >
          {isBuffering ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={28}
              color="#fff"
            />
          )}
        </Pressable>

        <View style={styles.progressArea}>
          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(positionMs)}</Text>
            <Text style={styles.timeText}>{formatTime(durationMs)}</Text>
          </View>
        </View>

        <Pressable onPress={replay} style={styles.replayButton} hitSlop={12}>
          <Ionicons name="refresh" size={22} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  progressArea: {
    flex: 1,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4FC3F7",
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  timeText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontFamily: "monospace",
  },
  replayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  noAudioText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
});
