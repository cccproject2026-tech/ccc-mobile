import { Stack } from "expo-router";

export const unstable_settings = {
  
  index: {
    initialRouteName: "../index",
  },

  
  roadmap: {
    initialRouteName: "roadmap/index",
  },

  
  assessments: {
    initialRouteName: "assessments/index",
  },

  appointments: {
    initialRouteName: "appointments/index",
  },

  progress: {
    initialRouteName: "progress/index",
  },
};

export default function SharedStackLayout({ segment }: { segment: string }) {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }}>
      {}
      <Stack.Screen name="search" />
      <Stack.Screen name="roadmap/index" /> {}
      <Stack.Screen name="roadmap/[phaseId]/index" /> {}
      <Stack.Screen name="roadmap/[phaseId]/[itemId]/index" /> {}
      <Stack.Screen name="roadmap/[phaseId]/comments" />
      <Stack.Screen name="roadmap/[phaseId]/queries" />
      <Stack.Screen name="roadmap/[phaseId]/shared-media" />
      {}
      <Stack.Screen name="assessments/survey-guidelines" />
      <Stack.Screen name="assessments/survey" />
      <Stack.Screen name="assessments/report" />
      <Stack.Screen name="assessments/answer-questions" />
      {}
      <Stack.Screen name="profile/assignments" />
      {}
      <Stack.Screen
        name="appointments/index"
        dangerouslySingular={() => String(Date.now())}
      />
      {}
      <Stack.Screen
        name="progress/index"
        dangerouslySingular={() => String(Date.now())}
      />
      <Stack.Screen
        name="progress/report"
        dangerouslySingular={() => String(Date.now())}
      />

    </Stack>
  );
}
