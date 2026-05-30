import GradientCalendar from "@/components/atom/calendar";
import GoogleCalendarConnectButton from "@/components/GoogleCalendarConnectButton";
import TopBar from "@/components/director/TopBar";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import {
  calendarYearMonthFromYmd,
  formatTimeSlot,
  mergeMonthlyAvailabilityWithWeeklySlotDates,
  normalizeAvailabilityDateString,
  slotsFromWeeklyOrMonthlyDay,
  useMonthlyAvailability,
  useWeeklyAvailability,
} from "@/hooks/mentors/useMentorsAvailability";
import { getScheduleMeetingBase } from "@/lib/scheduling/scheduleMeetingNavigation";
import { appointmentService } from "@/services/appointments.service";
import { useAuthStore } from "@/stores/auth.store";
import { useScheduleMeetingStore } from "@/stores/scheduleMeeting.store";
import type { TimeSlot as APITimeSlot, WeeklyAvailability } from "@/types/appointment.types";
import { filterTimeSlotsAgainstGoogleCalendar } from "@/utils/google-calendar/google-calendar-scheduling";
import { filterSlotsByMinNotice } from "@/utils/appointments/validation";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function ymdToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function pickDefaultDayYmd(availableDates: string[]): string {
  if (availableDates.length === 0) return "";
  const todayYmd = ymdToday();
  if (availableDates.includes(todayYmd)) return todayYmd;
  const nextUpcoming = [...availableDates].filter((d) => d >= todayYmd).sort()[0];
  return nextUpcoming || [...availableDates].sort()[0];
}

export default function ScheduleMeetingTimeScreen() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { drawerContext } = useLocalSearchParams<{ drawerContext?: string }>();
  const { draft, setDay, setSlot, setPlatformLabel } = useScheduleMeetingStore();
  const insets = useSafeAreaInsets();
  const scheduleBase = getScheduleMeetingBase(drawerContext, user?.role);

  const handleBack = useCallback(() => {
    router.replace({
      pathname: `${scheduleBase}/person` as any,
      params: {
        drawerContext,
        mode: draft.mode,
        appointmentId: draft.appointmentId,
        preserveDraft: "1",
      },
    });
  }, [drawerContext, draft.appointmentId, draft.mode, scheduleBase]);

  const topBar = (
    <TopBar
      role={String(user?.role || "pastor")}
      showUserName
      showDrawer={false}
      showBackButton
      onPressBack={handleBack}
    />
  );

  const hasPerson = Boolean(draft.person?.id);

  useEffect(() => {
    if (hasPerson) return;
    router.replace({
      pathname: `${scheduleBase}/person` as any,
      params: { drawerContext },
    });
  }, [drawerContext, hasPerson, scheduleBase]);

  const isMentor = String(user?.role || "").toLowerCase() === "mentor";

  // Availability owner (mentor hosting the grid).
  const availabilityOwnerId = isMentor ? user?.id : draft.person?.id;
  // Booker whose Google calendar may also block slots.
  const participantUserId = isMentor ? draft.person?.id : user?.id;

  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);
  const [calendarSlotSyncLoading, setCalendarSlotSyncLoading] = useState(false);
  const [calendarSlotSyncError, setCalendarSlotSyncError] = useState<string | null>(null);
  const [calendarConnectBanners, setCalendarConnectBanners] = useState<string[]>([]);
  const [calendarBusyStripped, setCalendarBusyStripped] = useState(0);
  const [googleFilteredSlots, setGoogleFilteredSlots] = useState<
    { id: string; label: string; apiSlot: APITimeSlot }[] | null
  >(null);

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  // Drawer keeps this screen mounted (freezeOnBlur). Re-sync calendar + refetch on each visit.
  useFocusEffect(
    useCallback(() => {
      if (!availabilityOwnerId) return;

      queryClient.invalidateQueries({
        queryKey: ["monthly-availability", availabilityOwnerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["weekly-availability", availabilityOwnerId],
      });

      setSlot(null);

      const ymd = useScheduleMeetingStore.getState().draft.selectedDayYmd;
      if (ymd) {
        const cal = calendarYearMonthFromYmd(ymd);
        if (cal) {
          setCurrentMonth(cal.month);
          setCurrentYear(cal.year);
          return;
        }
      }
      const n = new Date();
      setCurrentMonth(n.getMonth() + 1);
      setCurrentYear(n.getFullYear());
    }, [availabilityOwnerId, queryClient, setSlot]),
  );

  // Weekly settings / saved slots (source of truth for meeting settings + raw saved blocks).
  const { availability: weeklyAvailability, isLoading: isLoadingWeekly, isError: isWeeklyError } = useWeeklyAvailability(
    availabilityOwnerId || null,
    {
      enabled: Boolean(availabilityOwnerId),
      // IMPORTANT: availability belongs to mentor participant; avoid "pastor" defaults.
      role: "mentor",
    },
  );

  // Monthly availability (source of truth for which dates are selectable this month).
  // This endpoint also applies backend constraints (min notice / max bookings per day).
  const {
    availability: monthlyAvailability,
    isFetching: isFetchingMonthly,
    isError: isMonthlyError,
  } = useMonthlyAvailability(
    {
      mentorId: availabilityOwnerId || null,
      month: currentMonth,
      year: currentYear,
      // IMPORTANT: availability belongs to mentor participant; avoid "pastor" defaults.
      role: "mentor",
    },
    {
      enabled: Boolean(availabilityOwnerId),
      // IMPORTANT: never show generated/fake availability in scheduling flow.
      allowDefaultForMentee: false,
      staleTimeMs: 0,
    },
  );

  const settings = weeklyAvailability;
  const weeklySlots = weeklyAvailability?.weeklySlots ?? [];

  const toDateString = (value: string) => normalizeAvailabilityDateString(value);

  const mergedAvailability = useMemo(() => {
    // Merge the backend month view with the saved weekly slots.
    // We prefer the "richer" representation (more segments) per day.
    return mergeMonthlyAvailabilityWithWeeklySlotDates(
      currentMonth,
      currentYear,
      monthlyAvailability,
      weeklySlots,
    );
  }, [currentMonth, currentYear, monthlyAvailability, weeklySlots]);

  const availableDates = useMemo(() => {
    if (!mergedAvailability?.length) return [];
    const set = new Set<string>();
    for (const day of mergedAvailability as any[]) {
      const key = toDateString(String(day?.date ?? ""));
      if (!key) continue;
      const slots = slotsFromWeeklyOrMonthlyDay(day);
      if (slots.length > 0) set.add(key);
    }
    return Array.from(set).sort();
  }, [mergedAvailability]);

  useEffect(() => {
    if (availableDates.length === 0) return;

    const current = draft.selectedDayYmd;
    if (!current || !availableDates.includes(current)) {
      setDay(pickDefaultDayYmd(availableDates));
    }
  }, [availableDates, draft.selectedDayYmd, setDay]);

  useEffect(() => {
    // reset time when day changes
    setSlot(null);
  }, [draft.selectedDayYmd, setSlot]);

  const schedulingSettings = useMemo((): WeeklyAvailability | null => {
    if (!weeklyAvailability) return null;
    return weeklyAvailability as WeeklyAvailability;
  }, [weeklyAvailability]);

  const minNoticeHours = schedulingSettings?.minSchedulingNoticeHours ?? 0;

  const getTimeSlotsForDate = useCallback(
    (dateString: string) => {
      if (!mergedAvailability?.length) {
        return [] as { id: string; label: string; apiSlot: APITimeSlot }[];
      }
      const dayData = (mergedAvailability as any[]).find(
        (d) => toDateString(String(d?.date ?? "")) === dateString,
      ) as any;
      const raw: APITimeSlot[] = dayData ? slotsFromWeeklyOrMonthlyDay(dayData) : [];
      const slots = filterSlotsByMinNotice(dateString, raw, schedulingSettings);
      return slots.map((slot: APITimeSlot, idx: number) => ({
        id: slot._id || `${dateString}-${idx}`,
        label: formatTimeSlot(slot),
        apiSlot: slot,
      }));
    },
    [mergedAvailability, schedulingSettings],
  );

  const timeSlots = useMemo(
    () => (draft.selectedDayYmd ? getTimeSlotsForDate(draft.selectedDayYmd) : []),
    [draft.selectedDayYmd, getTimeSlotsForDate],
  );

  const meetingDurationMinutes = schedulingSettings?.meetingDuration ?? 60;

  useEffect(() => {
    if (!availabilityOwnerId || !draft.selectedDayYmd || timeSlots.length === 0) {
      setGoogleFilteredSlots(null);
      setCalendarConnectBanners([]);
      setCalendarBusyStripped(0);
      setCalendarSlotSyncError(null);
      return;
    }

    let cancelled = false;
    setCalendarSlotSyncLoading(true);
    setCalendarSlotSyncError(null);

    void (async () => {
      const rawApiSlots = timeSlots.map((s) => s.apiSlot);
      const result = await filterTimeSlotsAgainstGoogleCalendar({
        meetingDateYmd: draft.selectedDayYmd,
        rawSlots: rawApiSlots,
        availabilityMentorUserId: availabilityOwnerId,
        availabilityParticipantUserId: participantUserId,
        meetingDurationMinutes,
        fetchMergedAvailability: (mentorUserId, params) =>
          appointmentService.getMergedAvailability(mentorUserId, params),
      });

      if (cancelled) return;

      const filtered = timeSlots.filter((row) =>
        result.slots.some((slot) => slot._id === row.apiSlot._id || (
          slot.startTime === row.apiSlot.startTime &&
          slot.startPeriod === row.apiSlot.startPeriod
        )),
      );

      setGoogleFilteredSlots(filtered);
      setCalendarConnectBanners(
        googleCalendarConnected
          ? result.connectGoogleBanners.filter(
              (msg) => !/link google calendar|avoid double-booking/i.test(msg),
            )
          : result.connectGoogleBanners,
      );
      setCalendarBusyStripped(result.strippedCount);
      setCalendarSlotSyncError(result.error ?? null);
      setCalendarSlotSyncLoading(false);

      if (draft.selectedSlot && !filtered.some((s) => s.apiSlot._id === draft.selectedSlot?._id)) {
        setSlot(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    availabilityOwnerId,
    draft.selectedDayYmd,
    draft.selectedSlot,
    googleCalendarConnected,
    meetingDurationMinutes,
    participantUserId,
    setSlot,
    timeSlots,
  ]);

  const displayTimeSlots = googleFilteredSlots ?? timeSlots;

  // After a booking, cached dates can still list a day with zero remaining slots.
  useEffect(() => {
    if (!draft.selectedDayYmd || displayTimeSlots.length > 0 || availableDates.length === 0) {
      return;
    }
    const fallback = availableDates.find((d) => getTimeSlotsForDate(d).length > 0);
    if (fallback && fallback !== draft.selectedDayYmd) {
      setDay(fallback);
    }
  }, [
    availableDates,
    draft.selectedDayYmd,
    displayTimeSlots.length,
    getTimeSlotsForDate,
    setDay,
  ]);

  const canContinue = Boolean(draft.person?.id && draft.selectedDayYmd && draft.selectedSlot);

  const today = ymdToday();
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const inThisWeek = useMemo(() => {
    const start = new Date(`${today}T00:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return availableDates.find((ymd) => {
      const d = new Date(`${ymd}T00:00:00`);
      return d >= start && d <= end;
    });
  }, [availableDates, today]);

  const visibleMonthLabel = useMemo(() => {
    const d = new Date(currentYear, currentMonth - 1, 1);
    return d.toLocaleString("en-US", { month: "long", year: "numeric" });
  }, [currentMonth, currentYear]);

  if (!hasPerson) return null;

  // Only block the whole screen until weekly settings exist — monthly refetches on month change
  // must NOT replace the UI (that caused “loading same month” and missing next-month dates).
  const showBlockingLoader = isLoadingWeekly;
  const weeklyFatalError = isWeeklyError;

  if (showBlockingLoader) {
    return (
      <AppGradientBackground style={{ flex: 1 }}>
        {topBar}
        <View style={styles.center}>
          <ActivityIndicator color="#FFFFFF" />
          <Text style={styles.subtle}>Loading availability…</Text>
        </View>
      </AppGradientBackground>
    );
  }

  if (weeklyFatalError) {
    return (
      <AppGradientBackground style={{ flex: 1 }}>
        {topBar}
        <View style={styles.center}>
          <Text style={styles.title}>Unable to load availability</Text>
          <Text style={styles.subtle}>Please try again.</Text>
          <Pressable style={styles.primary} onPress={() => router.back()}>
            <Text style={styles.primaryText}>Go back</Text>
          </Pressable>
        </View>
      </AppGradientBackground>
    );
  }

  return (
    <AppGradientBackground style={{ flex: 1 }}>
      {topBar}
      <View style={styles.container}>
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          <Text style={styles.title}>Pick date & time</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            Meeting with {draft.person?.name}
          </Text>

          <View style={styles.googleCalendarSection}>
            <GoogleCalendarConnectButton
              variant="dark"
              onStatusChange={(status) => setGoogleCalendarConnected(status === "connected")}
              onConnectionSynced={() => {
                queryClient.invalidateQueries({ queryKey: ["weekly-availability"] });
                queryClient.invalidateQueries({ queryKey: ["monthly-availability"] });
              }}
            />
          </View>

          {calendarConnectBanners.map((msg) => (
            <Text key={msg.slice(0, 80)} style={styles.calendarBanner}>
              {msg}
            </Text>
          ))}

          <View style={styles.quickDatesRow}>
            <Pressable
              style={[
                styles.chip,
                draft.selectedDayYmd === today && styles.chipSelected,
                !availableDates.includes(today) && styles.chipDisabled,
              ]}
              disabled={!availableDates.includes(today)}
              onPress={() => setDay(today)}
            >
              <Text style={[styles.chipText, draft.selectedDayYmd === today && styles.chipTextSelected]}>
                Today
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.chip,
                draft.selectedDayYmd === tomorrow && styles.chipSelected,
                !availableDates.includes(tomorrow) && styles.chipDisabled,
              ]}
              disabled={!availableDates.includes(tomorrow)}
              onPress={() => setDay(tomorrow)}
            >
              <Text style={[styles.chipText, draft.selectedDayYmd === tomorrow && styles.chipTextSelected]}>
                Tomorrow
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.chip,
                styles.chipGrow,
                inThisWeek && draft.selectedDayYmd === inThisWeek && styles.chipSelected,
                !inThisWeek && styles.chipDisabled,
              ]}
              disabled={!inThisWeek}
              onPress={() => inThisWeek && setDay(inThisWeek)}
            >
              <Text style={[styles.chipText, inThisWeek && draft.selectedDayYmd === inThisWeek && styles.chipTextSelected]}>
                This week
              </Text>
            </Pressable>
          </View>

          <View style={styles.calendarCard}>
            <GradientCalendar
              selected={draft.selectedDayYmd}
              setSelected={(ymd: string) => setDay(ymd)}
              availableDates={availableDates}
              onMonthChange={(m, y) => {
                setCurrentMonth(m);
                setCurrentYear(y);
              }}
              showHeader={true}
              disablePastDates={true}
              markToday={true}
            />
            {isFetchingMonthly ? (
              <View style={styles.calendarLoadingOverlay} pointerEvents="none">
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.calendarLoadingText}>Loading {visibleMonthLabel}…</Text>
              </View>
            ) : null}
          </View>

          {isMonthlyError ? (
            <Text style={styles.monthlyWarning}>
              Could not refresh this month from the server; showing saved weekly slots only.
            </Text>
          ) : null}

          <Text style={styles.sectionTitle}>Available times</Text>
          {calendarSlotSyncLoading ? (
            <View style={styles.syncRow}>
              <ActivityIndicator color="#8ec5eb" size="small" />
              <Text style={styles.syncText}>Syncing Google Calendar availability…</Text>
            </View>
          ) : null}
          {calendarSlotSyncError ? (
            <Text style={styles.calendarError}>
              {calendarSlotSyncError} Time slots cannot be validated until calendar access works.
            </Text>
          ) : null}
          {calendarBusyStripped > 0 ? (
            <Text style={styles.calendarBanner}>
              Some times are hidden due to conflicting Google Calendar events.
            </Text>
          ) : null}
          {minNoticeHours > 0 ? (
            <Text style={styles.noticeHint}>
              Slots must start at least {minNoticeHours} hour{minNoticeHours === 1 ? "" : "s"} from now.
            </Text>
          ) : null}
          {displayTimeSlots.length === 0 ? (
            <Text style={styles.subtle}>
              {minNoticeHours > 0
                ? "No bookable slots for this date (notice period, availability, or calendar conflicts)."
                : "No slots for this date."}
            </Text>
          ) : (
            <View style={styles.slotGrid}>
              {displayTimeSlots.map((s) => {
                const selected = draft.selectedSlot?._id === s.apiSlot._id;
                return (
                  <Pressable
                    key={s.id}
                    style={[styles.slot, selected && styles.slotSelected]}
                    onPress={() => setSlot(s.apiSlot)}
                  >
                    <Text style={[styles.slotText, selected && styles.slotTextSelected]}>
                      {s.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Text style={styles.sectionTitle}>Platform</Text>
          <View style={styles.platformRow}>
            {["Zoom"].map((p) => {
              const selected = draft.meetingOptionLabel === p;
              return (
                <Pressable
                  key={p}
                  style={[styles.platformChip, selected && styles.platformChipSelected]}
                  onPress={() => setPlatformLabel(p)}
                >
                  <Ionicons
                    name="videocam-outline"
                    size={16}
                    color={selected ? "#1E3A6F" : "#FFFFFF"}
                  />
                  <Text style={[styles.platformChipText, selected && styles.platformChipTextSelected]}>
                    {p}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={[styles.footerOuter, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <View style={styles.footerBar}>
            <Pressable style={styles.secondaryBtn} onPress={handleBack}>
              <Text style={styles.secondaryText}>Back</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryBtn, !canContinue && styles.primaryBtnDisabled]}
              disabled={!canContinue}
              onPress={() =>
                router.replace({
                  pathname: `${scheduleBase}/confirm` as any,
                  params: { drawerContext },
                })
              }
            >
              <Text style={styles.primaryBtnText}>Review meeting</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </AppGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  title: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  subtitle: { marginTop: 6, color: "rgba(255,255,255,0.75)", fontWeight: "700" },
  googleCalendarSection: { marginTop: 12, marginBottom: 4 },
  calendarBanner: {
    color: "#fef3c7",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  calendarError: {
    color: "#fef3c7",
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.35)",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
  },
  syncRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  syncText: { color: "#8ec5eb", fontSize: 12, fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 24 },
  subtle: { color: "rgba(255,255,255,0.75)", fontWeight: "600" },
  primary: { marginTop: 12, backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  primaryText: { color: "#1E3A6F", fontWeight: "900" },
  quickDatesRow: { flexDirection: "row", gap: 10, marginTop: 14, marginBottom: 12 },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
  chipGrow: { flex: 1, alignItems: "center" },
  chipDisabled: { opacity: 0.45 },
  chipText: { color: "#FFFFFF", fontWeight: "900", fontSize: 12 },
  chipSelected: { backgroundColor: "#FFFFFF", borderColor: "#FFFFFF" },
  chipTextSelected: { color: "#1E3A6F" },
  calendarCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 0,
    borderColor: "transparent",
    position: "relative",
  },
  calendarLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13, 51, 81, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  calendarLoadingText: {
    color: "rgba(255,255,255,0.92)",
    fontWeight: "700",
    fontSize: 13,
  },
  monthlyWarning: {
    marginTop: 8,
    color: "rgba(255, 209, 102, 0.95)",
    fontWeight: "600",
    fontSize: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: { marginTop: 14, color: "#FFFFFF", fontWeight: "900" },
  noticeHint: {
    marginTop: 6,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "600",
    fontSize: 12,
  },
  slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  slot: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", backgroundColor: "rgba(255,255,255,0.06)" },
  slotSelected: { backgroundColor: "#FFFFFF", borderColor: "#FFFFFF" },
  slotText: { color: "#FFFFFF", fontWeight: "800", fontSize: 12 },
  slotTextSelected: { color: "#1E3A6F" },
  platformRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  platformChip: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", backgroundColor: "rgba(255,255,255,0.06)" },
  platformChipSelected: { backgroundColor: "#FFFFFF", borderColor: "#FFFFFF" },
  platformChipText: { color: "#FFFFFF", fontWeight: "900", fontSize: 12 },
  platformChipTextSelected: { color: "#1E3A6F" },
  footerOuter: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: "transparent" },
  footerBar: { flexDirection: "row", gap: 12 },
  secondaryBtn: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  secondaryText: { color: "#1E3A6F", fontWeight: "900" },
  primaryBtn: { flex: 1, backgroundColor: "rgba(30, 54, 111, 1)", borderRadius: 14, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: "#FFFFFF" },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "900" },
});

