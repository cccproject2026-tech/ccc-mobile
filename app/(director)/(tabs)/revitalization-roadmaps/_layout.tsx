import { AssessmentProvider } from '@/context/AssessmentsContext';
import { RoadmapProgressProvider } from '@/context/RoadmapProgressContext';
import { Stack } from 'expo-router';

export default function RevitalizationRoadmapLayout() {
  return (
    <RoadmapProgressProvider>
      <AssessmentProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </AssessmentProvider>
    </RoadmapProgressProvider>
  );
}
