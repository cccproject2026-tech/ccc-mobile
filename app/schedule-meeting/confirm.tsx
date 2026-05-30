import AppGradientBackground from "@/components/layout/AppGradientBackground";
import TopBar from "@/components/director/TopBar";
import { useAuthStore } from "@/stores/auth.store";
import { useScheduleMeetingStore } from "@/stores/scheduleMeeting.store";
import { useMeetingScheduler } from "@/hooks/appointments/useMeetingScheduler";
import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useWeeklyAvailability } from "@/hooks/mentors/useMentorsAvailability";
import {
  exitScheduleMeetingFlow,
  getScheduleMeetingBase,
} from "@/lib/scheduling/scheduleMeetingNavigation";
import { getDeviceTimezone } from "@/utils/appointments/timezone";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScheduleMeetingConfirmScreen() {
  const { user } = useAuthStore();
  const { drawerContext } = useLocalSearchParams<{ drawerContext?: string }>();
  const deviceTz = useMemo(() => getDeviceTimezone(), []);
  const { draft } = useScheduleMeetingStore();
  const [isDone, setIsDone] = useState(false);
  const insets = useSafeAreaInsets();
  const scheduleBase = getScheduleMeetingBase(drawerContext, user?.role);

  const handleBack = useCallback(() => {
    router.replace({
      pathname: `${scheduleBase}/time` as any,
      params: { drawerContext },
    });
  }, [drawerContext, scheduleBase]);

  // Drawer freezes screens — clear "done" from the previous booking when re-entering.
  useFocusEffect(
    useCallback(() => {
      setIsDone(false);
    }, []),
  );

  const canSubmit = Boolean(draft.person?.id && draft.selectedDayYmd && draft.selectedSlot);

  const isMentor = String(user?.role || "").toLowerCase() === "mentor";
  const availabilityOwnerId = isMentor ? user?.id : draft.person?.id;

  const { appointments: mentorAppointments } = useAppointments(
    availabilityOwnerId ? { mentorId: availabilityOwnerId } : {},
  );
  const { appointments: userAppointments } = useAppointments({
    userId: isMentor ? draft.person?.id : user?.id,
  });

  const { availability: weeklyAvailability } = useWeeklyAvailability(
    availabilityOwnerId || null,
    {
      enabled: Boolean(availabilityOwnerId),
      role: "mentor",
    },
  );

  const existingAppointment = useMemo(() => {
    if (!draft.appointmentId) return null;
    // Find from either list (best-effort)
    const all = [...mentorAppointments, ...userAppointments];
    return all.find((a) => String(a.id) === String(draft.appointmentId)) ?? null;
  }, [draft.appointmentId, mentorAppointments, userAppointments]);

  const { submit, isSubmitting } = useMeetingScheduler({
    mode: draft.mode,
    currentUserId: user?.id,
    currentUserRole: user?.role,
    selectedPerson: draft.person ? { id: draft.person.id, name: draft.person.name, role: draft.person.role } : null,
    existingAppointment,
    selectedDayYmd: draft.selectedDayYmd,
    selectedSlot: draft.selectedSlot,
    meetingOptionLabel: draft.meetingOptionLabel,
    settings: weeklyAvailability ?? undefined,
    mentorAppointments,
    userAppointments,
  });

  if (!canSubmit) return null;

  return (
    <AppGradientBackground style={{ flex: 1 }}>
      <TopBar
        role={String(user?.role || "pastor")}
        showUserName
        showDrawer={false}
        showBackButton
        onPressBack={handleBack}
      />
      <View style={styles.container}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
          <Text style={styles.title}>Confirm meeting</Text>
          <Text style={styles.subtitle}>Review details before scheduling.</Text>

          <View style={styles.card}>
            <Row label="Person" value={draft.person?.name} icon="person-outline" />
            <Divider />
            <Row label="Date" value={draft.selectedDayYmd} icon="calendar-outline" />
            <Divider />
            <Row
              label="Time"
              value={
                draft.selectedSlot
                  ? `${draft.selectedSlot.startTime} ${draft.selectedSlot.startPeriod} - ${draft.selectedSlot.endTime} ${draft.selectedSlot.endPeriod}`
                  : "—"
              }
              icon="time-outline"
            />
            <Divider />
            <Row label="Platform" value={draft.meetingOptionLabel} icon="videocam-outline" />
            <Divider />
            <Row label="Timezone" value={deviceTz.timeZone || "Local"} icon="globe-outline" />
          </View>
        </ScrollView>

        <View style={[styles.footerOuter, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <View style={styles.footerBar}>
            <Pressable style={styles.secondaryBtn} onPress={handleBack} disabled={isSubmitting || isDone}>
              <Text style={styles.secondaryText}>Back</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryBtn, (isSubmitting || isDone) && styles.primaryBtnDisabled]}
              disabled={isSubmitting || isDone}
              onPress={async () => {
                try {
                  const result = await submit();
                  setIsDone(true);
                  const baseTitle =
                    draft.mode === "reschedule" ? "Meeting rescheduled" : "Meeting scheduled";
                  const warningSuffix =
                    result.googleCalendarSyncWarnings.length > 0
                      ? ` Note: ${result.googleCalendarSyncWarnings.join(" · ")}`
                      : "";
                  const text1 = result.googleCalendarSuccessHint
                    ? `${baseTitle}. ${result.googleCalendarSuccessHint}${warningSuffix}`
                    : `${baseTitle}${warningSuffix}`;
                  Toast.show({
                    type: "floating",
                    text1,
                    text2: "Returning to your appointments…",
                    visibilityTime: result.googleCalendarSyncWarnings.length > 0 ? 9000 : 4500,
                  });
                  setTimeout(() => {
                    exitScheduleMeetingFlow(router, user?.role);
                  }, 400);
                } catch (e: any) {
                  const msg =
                    typeof e?.message === "string"
                      ? e.message
                      : e?.response?.data?.message != null
                        ? String(e.response.data.message)
                        : "Please try again.";
                  const errTitle = e?.title || "Booking failed";
                  Toast.show({
                    type: "floating",
                    text1: errTitle,
                    text2: msg,
                  });
                  Alert.alert(errTitle, msg);
                }
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryText}>
                  {draft.mode === "reschedule" ? "Reschedule meeting" : "Schedule meeting"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </AppGradientBackground>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function Row({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | null;
  icon: any;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={18} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} numberOfLines={1}>
          {value || "—"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  title: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  subtitle: { marginTop: 6, color: "rgba(255,255,255,0.7)", fontWeight: "600" },
  card: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 14,
  },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 10 },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.10)" },
  label: { color: "rgba(255,255,255,0.6)", fontWeight: "900", fontSize: 11, textTransform: "uppercase" },
  value: { marginTop: 3, color: "#FFFFFF", fontWeight: "900", fontSize: 14 },
  footerOuter: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: "transparent" },
  footerBar: { flexDirection: "row", gap: 12 },
  secondaryBtn: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  secondaryText: { color: "#1E3A6F", fontWeight: "900" },
  primaryBtn: { flex: 1, backgroundColor: "rgba(30, 54, 111, 1)", borderRadius: 14, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: "#FFFFFF" },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryText: { color: "#FFFFFF", fontWeight: "900" },
});

