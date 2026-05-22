import { Redirect, useLocalSearchParams } from "expo-router";

/** Legacy route — forwards into pastor drawer scheduler stack. */
export default function ScheduleMeetingRedirect() {
  const params = useLocalSearchParams<{ mentorData?: string }>();

  return (
    <Redirect
      href={{
        pathname: "/(pastor)/schedule-meeting/person",
        params: {
          mode: "schedule",
          drawerContext: "pastor",
          ...(params.mentorData ? { personData: params.mentorData } : {}),
        },
      }}
    />
  );
}
