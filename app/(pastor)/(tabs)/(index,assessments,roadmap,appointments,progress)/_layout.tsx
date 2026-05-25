import { Stack } from "expo-router";

export const unstable_settings = {
  // Dashboard context
  index: {
    initialRouteName: "../index", // Points to dashboard outside group
  },

  // Roadmap context
  roadmap: {
    initialRouteName: "roadmap/index", // ✅ Roadmap list is the initial route
  },

  // Assessments context - when coming from assessment list
  assessments: {
    initialRouteName: "assessments/index", // ✅ Points to assessment LIST outside group
  },

  appointments: {
    initialRouteName: "appointments/index", // ✅ Points to appointments LIST outside group
  },

  progress: {
    initialRouteName: "progress/index", // ✅ Points to progress LIST outside group
  },
};

export default function SharedStackLayout({ segment }: { segment: string }) {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }}>
      {/* Roadmap routes - ALL inside shared group */}
      <Stack.Screen name="search" />
      <Stack.Screen name="roadmap/index" /> {/* Roadmap list */}
      <Stack.Screen name="roadmap/[phaseId]/index" /> {/* Phase details */}
      <Stack.Screen name="roadmap/[phaseId]/[itemId]/index" /> {/* Task details + form */}
      <Stack.Screen name="roadmap/[phaseId]/comments" />
      <Stack.Screen name="roadmap/[phaseId]/queries" />
      <Stack.Screen name="roadmap/[phaseId]/shared-media" />
      {/* Shared assessment pages */}
      <Stack.Screen name="assessments/survey-guidelines" />
      <Stack.Screen name="assessments/survey" />
      <Stack.Screen name="assessments/report" />
      <Stack.Screen name="assessments/answer-questions" />
      {/* Shared profile pages */}
      <Stack.Screen name="profile/assignments" />
      {/* Shared Appointments pages*/}
      <Stack.Screen
        name="appointments/index"
        dangerouslySingular={() => String(Date.now())}
      />
      {/* Shared Progress pages */}
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
