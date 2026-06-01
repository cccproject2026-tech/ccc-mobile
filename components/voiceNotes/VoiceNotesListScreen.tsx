import { useUploadVoiceNote, useVoiceNotesList, voiceNoteKeys } from "@/hooks/voiceNotes";
import { voiceNotesService } from "@/services/voiceNotes.service";
import type { VoiceNote } from "@/types/voiceNote.types";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useQueryClient } from "@tanstack/react-query";
import { RecordingSheet } from "./RecordingSheet";
import { VoiceNoteCard } from "./VoiceNoteCard";

interface VoiceNotesListScreenProps {
  detailRoutePath: string;
}

const ALLOWED_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/m4a",
  "audio/x-m4a",
  "audio/mp4",
  "audio/webm",
  "audio/ogg",
  "audio/opus",
  "audio/3gpp",
  "audio/3gpp2",
  "audio/*",
];

export function VoiceNotesListScreen({ detailRoutePath }: VoiceNotesListScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: voiceNotes, isLoading, refetch, isRefetching } = useVoiceNotesList();
  const uploadMutation = useUploadVoiceNote();

  const [showRecording, setShowRecording] = useState(false);
  const [isPickingFile, setIsPickingFile] = useState(false);

  const handleVoiceNotePress = useCallback(
    (voiceNote: VoiceNote) => {
      const noteId = voiceNote.id || voiceNote._id;
      router.push(`${detailRoutePath}?id=${noteId}` as any);
    },
    [router, detailRoutePath]
  );

  const handleUploadFile = useCallback(async () => {
    try {
      setIsPickingFile(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      const fileName = file.name || `upload_${Date.now()}`;
      const mimeType = file.mimeType || "audio/mpeg";

      await uploadMutation.mutateAsync({
        audio: {
          uri: file.uri,
          name: fileName,
          type: mimeType,
        },
        title: fileName.replace(/\.[^/.]+$/, ""),
        source: "upload",
        recordingPlatform: voiceNotesService.getRecordingPlatform(),
        recordingDeviceType: voiceNotesService.getRecordingDeviceType(),
      });

      Toast.show({
        type: "success",
        text1: "Upload Successful",
        text2: "Your audio is being processed",
      });
    } catch (error: any) {
      if (error?.message?.includes("cancel")) return;
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: error?.message || "Could not upload file",
      });
    } finally {
      setIsPickingFile(false);
    }
  }, [uploadMutation]);

  const handleRecordingComplete = useCallback(
    (voiceNoteId: string) => {
      setShowRecording(false);
      queryClient.invalidateQueries({ queryKey: voiceNoteKeys.list() });
      router.push(`${detailRoutePath}?id=${voiceNoteId}` as any);
    },
    [queryClient, router, detailRoutePath]
  );

  const sortedNotes = [...(voiceNotes || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <LinearGradient
      colors={["#0F3B5C", "#1A4F7A", "#264387"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Voice Notes</Text>
            <Text style={styles.headerSubtitle}>
              Record or upload audio for AI analysis
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.actionBtn, styles.uploadBtn]}
            onPress={handleUploadFile}
            disabled={isPickingFile || uploadMutation.isPending}
          >
            {isPickingFile || uploadMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
            )}
            <Text style={styles.actionBtnText}>Upload Audio</Text>
          </Pressable>

          <Pressable
            style={[styles.actionBtn, styles.recordBtn]}
            onPress={() => setShowRecording(true)}
          >
            <Ionicons name="mic" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Record</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4FC3F7" />
            <Text style={styles.loadingText}>Loading voice notes...</Text>
          </View>
        ) : sortedNotes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="mic-off-outline"
              size={64}
              color="rgba(255,255,255,0.15)"
            />
            <Text style={styles.emptyTitle}>No Voice Notes Yet</Text>
            <Text style={styles.emptySubtitle}>
              Upload an audio file or record your voice to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={sortedNotes}
            keyExtractor={(item, index) => item.id || item._id || String(index)}
            renderItem={({ item }) => (
              <VoiceNoteCard voiceNote={item} onPress={handleVoiceNotePress} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#4FC3F7"
              />
            }
          />
        )}

        <RecordingSheet
          visible={showRecording}
          onClose={() => setShowRecording(false)}
          onUploadComplete={handleRecordingComplete}
        />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
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
    fontSize: 26,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
  },
  uploadBtn: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  recordBtn: {
    backgroundColor: "#1976D2",
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 18,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
