import { useAudioPlayer } from "@/hooks/voiceNotes/useAudioPlayer";
import { voiceNotesService } from "@/services/voiceNotes.service";
import { useVoiceNotesStore } from "@/stores/voiceNotes.store";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

interface RecordingSheetProps {
  visible: boolean;
  onClose: () => void;
  onUploadComplete: (voiceNoteId: string) => void;
}

function formatTimer(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export function RecordingSheet({
  visible,
  onClose,
  onUploadComplete,
}: RecordingSheetProps) {
  const {
    recordingState,
    recordingUri,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    reset,
    setDuration,
    requestPermission,
  } = useVoiceNotesStore();

  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const previewPlayer = useAudioPlayer(
    recordingState === "stopped" ? recordingUri ?? undefined : undefined
  );

  useEffect(() => {
    if (recordingState === "recording") {
      timerRef.current = setInterval(() => {
        setDuration(useVoiceNotesStore.getState().recordingDuration + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

  const handleStart = useCallback(async () => {
    try {
      const granted = await requestPermission();
      if (!granted) {
        Toast.show({
          type: "error",
          text1: "Permission Required",
          text2: "Please enable microphone access in settings",
        });
        return;
      }
      await startRecording();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Recording Failed",
        text2: error?.message || "Could not start recording",
      });
    }
  }, [startRecording, requestPermission]);

  const handleStop = useCallback(async () => {
    await stopRecording();
  }, [stopRecording]);

  const handleCancel = useCallback(async () => {
    await cancelRecording();
    setTitle("");
  }, [cancelRecording]);

  const handleReRecord = useCallback(async () => {
    reset();
    setTitle("");
  }, [reset]);

  const handleUpload = useCallback(async () => {
    if (!recordingUri) return;

    const finalTitle = title.trim() || `Recording ${new Date().toLocaleDateString()}`;
    setIsUploading(true);

    try {
      const result = await voiceNotesService.upload({
        audio: {
          uri: recordingUri,
          name: `recording_${Date.now()}.m4a`,
          type: "audio/m4a",
        },
        title: finalTitle,
        source: "recording",
        recordingPlatform: voiceNotesService.getRecordingPlatform(),
        recordingDeviceType: voiceNotesService.getRecordingDeviceType(),
        recordingDurationSeconds: recordingDuration,
      });

      Toast.show({
        type: "success",
        text1: "Upload Successful",
        text2: "Your recording is being processed",
      });

      reset();
      setTitle("");
      onUploadComplete(result.id || result._id!);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: error?.message || "Please try again",
      });
    } finally {
      setIsUploading(false);
    }
  }, [recordingUri, title, recordingDuration, reset, onUploadComplete]);

  const handleClose = useCallback(async () => {
    if (recordingState === "recording") {
      await cancelRecording();
    }
    previewPlayer.unload();
    reset();
    setTitle("");
    onClose();
  }, [recordingState, cancelRecording, reset, onClose, previewPlayer]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Record Voice Note</Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <Ionicons name="close" size={24} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </View>

        <View style={styles.body}>
          {recordingState === "idle" && (
            <View style={styles.idleState}>
              <View style={styles.micCircle}>
                <Ionicons name="mic" size={48} color="#4FC3F7" />
              </View>
              <Text style={styles.instruction}>
                Tap the button below to start recording
              </Text>
              <Pressable style={styles.startButton} onPress={handleStart}>
                <Ionicons name="mic" size={28} color="#fff" />
                <Text style={styles.startButtonText}>Start Recording</Text>
              </Pressable>
            </View>
          )}

          {recordingState === "recording" && (
            <View style={styles.recordingState}>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingLabel}>Recording...</Text>
              </View>
              <Text style={styles.timer}>{formatTimer(recordingDuration)}</Text>
              <View style={styles.recordingActions}>
                <Pressable style={styles.cancelButton} onPress={handleCancel}>
                  <Ionicons name="close-circle" size={24} color="#E57373" />
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.stopButton} onPress={handleStop}>
                  <Ionicons name="stop-circle" size={48} color="#E57373" />
                </Pressable>
              </View>
            </View>
          )}

          {recordingState === "stopped" && recordingUri && (
            <View style={styles.previewState}>
              <Text style={styles.previewTitle}>Recording Complete</Text>
              <Text style={styles.previewDuration}>
                Duration: {formatTimer(recordingDuration)}
              </Text>

              <Pressable
                style={styles.previewPlayBtn}
                onPress={previewPlayer.togglePlayPause}
              >
                <Ionicons
                  name={previewPlayer.isPlaying ? "pause-circle" : "play-circle"}
                  size={56}
                  color="#4FC3F7"
                />
              </Pressable>

              <TextInput
                style={styles.titleInput}
                placeholder="Enter a title (optional)"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />

              <View style={styles.previewActions}>
                <Pressable style={styles.reRecordBtn} onPress={handleReRecord}>
                  <Ionicons name="refresh" size={20} color="#FFB74D" />
                  <Text style={styles.reRecordText}>Re-record</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.uploadBtn,
                    isUploading && styles.uploadBtnDisabled,
                  ]}
                  onPress={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload" size={20} color="#fff" />
                      <Text style={styles.uploadText}>Upload</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F2B44",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  idleState: {
    alignItems: "center",
    gap: 24,
  },
  micCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(79,195,247,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(79,195,247,0.25)",
  },
  instruction: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 15,
    textAlign: "center",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#1976D2",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  recordingState: {
    alignItems: "center",
    gap: 20,
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E57373",
  },
  recordingLabel: {
    color: "#E57373",
    fontSize: 16,
    fontWeight: "600",
  },
  timer: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "300",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  recordingActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 40,
    marginTop: 20,
  },
  cancelButton: {
    alignItems: "center",
    gap: 6,
  },
  cancelText: {
    color: "#E57373",
    fontSize: 13,
    fontWeight: "500",
  },
  stopButton: {
    padding: 4,
  },
  previewState: {
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  previewTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  previewDuration: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
  },
  previewPlayBtn: {
    marginVertical: 12,
  },
  titleInput: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  previewActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 12,
    width: "100%",
  },
  reRecordBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,183,77,0.4)",
  },
  reRecordText: {
    color: "#FFB74D",
    fontSize: 15,
    fontWeight: "600",
  },
  uploadBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#1976D2",
  },
  uploadBtnDisabled: {
    opacity: 0.6,
  },
  uploadText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
