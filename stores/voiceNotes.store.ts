import { create } from "zustand";
import { AppState, AppStateStatus } from "react-native";

type RecordingState = "idle" | "recording" | "paused" | "stopped";

interface VoiceNotesState {
  recordingState: RecordingState;
  recording: any | null;
  recordingUri: string | null;
  recordingDuration: number;
  permissionGranted: boolean;
}

interface VoiceNotesActions {
  requestPermission: () => Promise<boolean>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  cancelRecording: () => Promise<void>;
  reset: () => void;
  setDuration: (duration: number) => void;
}

type VoiceNotesStore = VoiceNotesState & VoiceNotesActions;

let Audio: any = null;
function getAudio() {
  if (!Audio) {
    try {
      Audio = require("expo-av").Audio;
    } catch {
      console.warn("expo-av native module not available");
    }
  }
  return Audio;
}

function getRecordingOptions() {
  const AudioModule = getAudio();
  if (!AudioModule) return {};

  return {
    isMeteringEnabled: false,
    android: {
      extension: ".m4a",
      outputFormat: AudioModule.AndroidOutputFormat.MPEG_4,
      audioEncoder: AudioModule.AndroidAudioEncoder.AAC,
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
    },
    ios: {
      extension: ".m4a",
      outputFormat: AudioModule.IOSOutputFormat.MPEG4AAC,
      audioQuality: AudioModule.IOSAudioQuality.HIGH,
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
    },
    web: {
      mimeType: "audio/webm",
      bitsPerSecond: 128000,
    },
  };
}

export const useVoiceNotesStore = create<VoiceNotesStore>((set, get) => {
  let appStateSubscription: { remove: () => void } | null = null;

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === "background" || nextAppState === "inactive") {
      const { recordingState } = get();
      if (recordingState === "recording") {
        await get().stopRecording();
      }
    }
  };

  return {
    recordingState: "idle",
    recording: null,
    recordingUri: null,
    recordingDuration: 0,
    permissionGranted: false,

    requestPermission: async () => {
      const AudioModule = getAudio();
      if (!AudioModule) return false;

      try {
        const { status } = await AudioModule.requestPermissionsAsync();
        const granted = status === "granted";
        set({ permissionGranted: granted });
        return granted;
      } catch (error) {
        console.error("Failed to request mic permission:", error);
        set({ permissionGranted: false });
        return false;
      }
    },

    startRecording: async () => {
      const AudioModule = getAudio();
      if (!AudioModule) throw new Error("Audio module not available. Please rebuild the app.");

      try {
        const { permissionGranted } = get();
        if (!permissionGranted) {
          const granted = await get().requestPermission();
          if (!granted) throw new Error("Microphone permission denied");
        }

        await AudioModule.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await AudioModule.Recording.createAsync(getRecordingOptions());

        appStateSubscription = AppState.addEventListener(
          "change",
          handleAppStateChange
        );

        set({
          recording,
          recordingState: "recording",
          recordingUri: null,
          recordingDuration: 0,
        });
      } catch (error) {
        console.error("Failed to start recording:", error);
        throw error;
      }
    },

    stopRecording: async () => {
      const AudioModule = getAudio();
      const { recording, recordingState } = get();
      if (!recording || recordingState !== "recording") return null;

      try {
        await recording.stopAndUnloadAsync();
        if (AudioModule) {
          await AudioModule.setAudioModeAsync({ allowsRecordingIOS: false });
        }

        const uri = recording.getURI();

        appStateSubscription?.remove();
        appStateSubscription = null;

        set({
          recordingState: "stopped",
          recording: null,
          recordingUri: uri,
        });

        return uri;
      } catch (error) {
        console.error("Failed to stop recording:", error);
        set({ recordingState: "idle", recording: null });
        return null;
      }
    },

    cancelRecording: async () => {
      const AudioModule = getAudio();
      const { recording } = get();
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
        } catch {}
      }

      if (AudioModule) {
        await AudioModule.setAudioModeAsync({ allowsRecordingIOS: false });
      }

      appStateSubscription?.remove();
      appStateSubscription = null;

      set({
        recordingState: "idle",
        recording: null,
        recordingUri: null,
        recordingDuration: 0,
      });
    },

    reset: () => {
      appStateSubscription?.remove();
      appStateSubscription = null;

      set({
        recordingState: "idle",
        recording: null,
        recordingUri: null,
        recordingDuration: 0,
      });
    },

    setDuration: (duration: number) => set({ recordingDuration: duration }),
  };
});
