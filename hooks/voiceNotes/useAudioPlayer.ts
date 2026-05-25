import { useCallback, useEffect, useRef, useState } from "react";

interface AudioPlayerState {
  isPlaying: boolean;
  isLoaded: boolean;
  positionMs: number;
  durationMs: number;
  isBuffering: boolean;
}

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

export function useAudioPlayer(audioUri: string | undefined) {
  const soundRef = useRef<any>(null);
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isLoaded: false,
    positionMs: 0,
    durationMs: 0,
    isBuffering: false,
  });

  const onPlaybackStatusUpdate = useCallback((status: any) => {
    if (!status.isLoaded) {
      setState((prev) => ({
        ...prev,
        isLoaded: false,
        isPlaying: false,
        isBuffering: false,
      }));
      return;
    }

    setState({
      isPlaying: status.isPlaying,
      isLoaded: true,
      positionMs: status.positionMillis ?? 0,
      durationMs: status.durationMillis ?? 0,
      isBuffering: status.isBuffering ?? false,
    });

    if (status.didJustFinish) {
      soundRef.current?.setPositionAsync(0);
      setState((prev) => ({ ...prev, isPlaying: false, positionMs: 0 }));
    }
  }, []);

  const loadSound = useCallback(async () => {
    if (!audioUri) return;
    const AudioModule = getAudio();
    if (!AudioModule) return;

    try {
      await unloadSound();

      await AudioModule.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await AudioModule.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
    } catch (error) {
      console.error("Failed to load audio:", error);
    }
  }, [audioUri, onPlaybackStatusUpdate]);

  const unloadSound = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
      setState({
        isPlaying: false,
        isLoaded: false,
        positionMs: 0,
        durationMs: 0,
        isBuffering: false,
      });
    }
  }, []);

  const play = useCallback(async () => {
    if (!soundRef.current) {
      await loadSound();
    }
    await soundRef.current?.playAsync();
  }, [loadSound]);

  const pause = useCallback(async () => {
    await soundRef.current?.pauseAsync();
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (state.isPlaying) {
      await pause();
    } else {
      await play();
    }
  }, [state.isPlaying, play, pause]);

  const replay = useCallback(async () => {
    await soundRef.current?.setPositionAsync(0);
    await soundRef.current?.playAsync();
  }, []);

  const seekTo = useCallback(async (positionMs: number) => {
    await soundRef.current?.setPositionAsync(positionMs);
  }, []);

  useEffect(() => {
    if (audioUri) {
      loadSound();
    }
    return () => {
      unloadSound();
    };
  }, [audioUri]);

  return {
    ...state,
    play,
    pause,
    togglePlayPause,
    replay,
    seekTo,
    unload: unloadSound,
  };
}
