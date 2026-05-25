import { VoiceNotesListScreen } from "@/components/voiceNotes";
import { Stack } from "expo-router";
import React from "react";

export default function PastorVoiceNotesScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <VoiceNotesListScreen detailRoutePath="/(pastor)/(tabs)/voice-notes/detail" />
    </>
  );
}
