import { Stack } from "expo-router";

export const unstable_settings = {
  
  index: {
    initialRouteName: "../index",
  },

  
  roadmap: {
    initialRouteName: "roadmap/landing/landing",
  },

  
  assessments: {
    initialRouteName: "assessments-v2/survey",
  },
  
  "assessments-v2": {
    initialRouteName: "assessments-v2/index",
  },

  
  appointments: {
    initialRouteName: "appointments/index",
  },

  
  progress: {
    initialRouteName: "progress/progress",
  },

  
  mentees: {
    initialRouteName: "mentees/index",
  },
};

export default function SharedStackLayout({ segment }: { segment: string }) {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }}>
      {}
      <Stack.Screen name="roadmap/landing/landing" />
      <Stack.Screen name="roadmap/[phaseId]/index" />
      <Stack.Screen name="roadmap/[phaseId]/[itemId]/index" />
      <Stack.Screen name="roadmap/comments" />
      <Stack.Screen name="roadmap/queries" />
      <Stack.Screen name="roadmap/phase-1/detailed-roadmap" />
      <Stack.Screen name="roadmap/phase-1/revitalization-roadmap" />
      <Stack.Screen name="roadmap/phase-2/detailed-roadmap" />
      <Stack.Screen name="roadmap/phase-2/detailed-empowerment" />
      <Stack.Screen name="roadmap/phase-2/empowerment-cards" />
      <Stack.Screen name="roadmap/phase-2/media" />
      <Stack.Screen name="roadmap/phase-2/revitalization-roadmap" />

      {}
      <Stack.Screen name="assessments/survey" />
      <Stack.Screen name="assessments/cma-survey-page" />
      <Stack.Screen name="assessments/answer-question-page" />
      <Stack.Screen name="assessments/answer-questions" />
      <Stack.Screen name="assessments/survey-form" />
      <Stack.Screen name="assessments/(pmp)/pmp-survey-page" />
      <Stack.Screen name="assessments/(pmp)/survey-form" />
      <Stack.Screen name="assessments/(pmp)/submit" />

      {}
      <Stack.Screen name="assessments-v2/index" />
      <Stack.Screen name="assessments-v2/assign-to" />
      <Stack.Screen name="assessments-v2/create-assessment" />
      <Stack.Screen name="assessments-v2/edit-instructions" />
      <Stack.Screen name="assessments-v2/select-assessment" />

      {}
      <Stack.Screen
        name="appointments/index"
        dangerouslySingular={() => String(Date.now())}
      />

      {}
      <Stack.Screen
        name="progress/progress"
        dangerouslySingular={() => String(Date.now())}
      />
      <Stack.Screen
        name="progress/report"
        dangerouslySingular={() => String(Date.now())}
      />

      {}
      <Stack.Screen name="mentees/index" />
      <Stack.Screen name="mentees/mentee-profile" />
      <Stack.Screen name="mentees/mentee-progress" />
      <Stack.Screen name="mentees/mentee-documents" />
      <Stack.Screen name="mentees/progress-tracker" />

      {}
      <Stack.Screen name="notes/index" />
      <Stack.Screen name="notes/note-detail" />
      <Stack.Screen name="notes/new-note" />

    </Stack>
  );
}
