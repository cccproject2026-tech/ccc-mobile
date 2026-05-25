import { Platform } from "react-native";
import { apiClient } from "./api/client";
import type { VoiceNote, VoiceNoteUploadPayload } from "@/types/voiceNote.types";

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

const VOICE_NOTES_BASE = "/voice-notes";

export const voiceNotesService = {
  async getAll(): Promise<VoiceNote[]> {
    const response = await apiClient.get<ApiEnvelope<VoiceNote[]>>(
      VOICE_NOTES_BASE
    );
    const data = response.data?.data;
    const list = Array.isArray(data) ? data : [];
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async getById(id: string): Promise<VoiceNote> {
    const response = await apiClient.get<ApiEnvelope<VoiceNote>>(
      `${VOICE_NOTES_BASE}/${encodeURIComponent(id)}`
    );
    return response.data.data!;
  },

  async upload(payload: VoiceNoteUploadPayload): Promise<VoiceNote> {
    const formData = new FormData();

    formData.append("audio", {
      uri: payload.audio.uri,
      name: payload.audio.name,
      type: payload.audio.type,
    } as any);

    formData.append("title", payload.title);
    formData.append("source", payload.source);

    if (payload.recordingPlatform) {
      formData.append("recordingPlatform", payload.recordingPlatform);
    }
    if (payload.recordingDeviceType) {
      formData.append("recordingDeviceType", payload.recordingDeviceType);
    }
    if (payload.recordingDurationSeconds != null) {
      formData.append(
        "recordingDurationSeconds",
        String(payload.recordingDurationSeconds)
      );
    }

    const response = await apiClient.post<ApiEnvelope<VoiceNote>>(
      VOICE_NOTES_BASE,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      }
    );
    return response.data.data!;
  },

  async delete(id: string): Promise<boolean> {
    const response = await apiClient.delete<ApiEnvelope<any>>(
      `${VOICE_NOTES_BASE}/${encodeURIComponent(id)}`
    );
    return response.data?.success ?? false;
  },

  getRecordingPlatform(): string {
    return Platform.OS;
  },

  getRecordingDeviceType(): string {
    if (Platform.OS === "ios") return "iPhone";
    if (Platform.OS === "android") return "Android";
    return "unknown";
  },
};
