import MentorRevitalizationPhasesLayout from "@/components/roadmap/MentorRevitalizationPhasesLayout";
import { Stack } from "expo-router";

export default function RevitalizationScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MentorRevitalizationPhasesLayout />
    </>
  );
}
