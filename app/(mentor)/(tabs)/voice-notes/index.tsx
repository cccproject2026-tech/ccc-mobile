import { VoiceNotesListScreen } from "@/components/voiceNotes";
import { Stack } from "expo-router";
import React from "react";

export default function MentorVoiceNotesScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <VoiceNotesListScreen detailRoutePath="/(mentor)/(tabs)/voice-notes/detail" />
    </>
  );
}
