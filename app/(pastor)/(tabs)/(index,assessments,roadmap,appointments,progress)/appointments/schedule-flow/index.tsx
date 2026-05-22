import { Redirect, useLocalSearchParams } from "expo-router";

export default function ScheduleFlowScreen() {
  const params = useLocalSearchParams<{
    mentorData?: string;
    mode?: "create" | "reschedule";
    appointmentId?: string;
  }>();

  return (
    <Redirect
      href={{
        pathname: "/(pastor)/schedule-meeting/person",
        params: {
          mode: params.mode === "reschedule" ? "reschedule" : "schedule",
          drawerContext: "pastor",
          ...(params.appointmentId ? { appointmentId: params.appointmentId } : {}),
          ...(params.mentorData ? { personData: params.mentorData } : {}),
        },
      }}
    />
  );
}
