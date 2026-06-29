import GradientCalendar from "@/components/atom/calendar";
import GoogleCalendarConnectButton from "@/components/GoogleCalendarConnectButton";
import TopBar from "@/components/director/TopBar";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import {
  calendarYearMonthFromYmd,
  formatTimeSlot,
  normalizeAvailabilityDateString,
  useMonthlyAvailability,
  useWeeklyAvailability,
} from "@/hooks/mentors/useMentorsAvailability";
import {
  isSelectedSlotStillAvailable,
  slotStartKeysMatch,
  useAvailableMeetingSlots,
} from "@/hooks/appointments/useAvailableMeetingSlots";
import { appointmentKeys } from "@/hooks/appointments/useAppointments";
import { appointmentService } from "@/services/appointments.service";
import {
  isSameSlotAsMeetingDate,
  meetingDateToDayYmd,
  parseSlotFromMeetingDateIso,
} from "@/utils/appointments/appointmentSlot";
import {
  buildScheduleFlowParams,
  exitScheduleMeetingFlow,
  getScheduleMeetingBase,
} from "@/lib/scheduling/scheduleMeetingNavigation";
import { getReturnToParam } from "@/utils/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useScheduleMeetingStore } from "@/stores/scheduleMeeting.store";
import type { TimeSlot as APITimeSlot, WeeklyAvailability } from "@/types/appointment.types";
import { resolveMinSchedulingNoticeHours } from "@/utils/appointments/validation";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function ymdToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** First upcoming date that still has at least one bookable slot (min-notice applied). */
function pickNearestBookableDay(
  availableDates: string[],
  hasBookableSlots: (ymd: string) => boolean,
  skipYmd?: string,
): string {
  const todayYmd = ymdToday();
  const ordered = [...availableDates].filter((d) => d >= todayYmd).sort();
  for (const ymd of ordered) {
    if (skipYmd && ymd === skipYmd) continue;
    if (hasBookableSlots(ymd)) return ymd;
  }
  return ordered.find((d) => d !== skipYmd) || "";
}

export default function ScheduleMeetingTimeScreen() {
  const { user } = useAuthStore();
  const routeParams = useLocalSearchParams<{
    drawerContext?: string;
    assessmentId?: string;
    returnTo?: string;
    rescheduleContext?: "appointment" | "mentorship";
    appointmentId?: string;
    mode?: "schedule" | "reschedule";
  }>();
  const { drawerContext, assessmentId, rescheduleContext, appointmentId: routeAppointmentId } =
    routeParams;
  const { draft, setDay, setSlot, setPlatformLabel, setAppointmentId, setRescheduleContext, setMode } =
    useScheduleMeetingStore();
  const insets = useSafeAreaInsets();
  const scheduleBase = getScheduleMeetingBase(drawerContext, user?.role);
  const flowParams = useMemo(
    () =>
      buildScheduleFlowParams({
        drawerContext,
        assessmentId,
        returnTo: getReturnToParam(routeParams),
        rescheduleContext:
          rescheduleContext === "mentorship" ? "mentorship" : undefined,
        mode: draft.mode,
        appointmentId: draft.appointmentId ?? routeAppointmentId,
      }),
    [
      assessmentId,
      draft.appointmentId,
      draft.mode,
      drawerContext,
      rescheduleContext,
      routeAppointmentId,
      routeParams.returnTo,
    ],
  );

  useFocusEffect(
    useCallback(() => {
      if (routeAppointmentId) {
        setAppointmentId(routeAppointmentId);
      }
      if (routeParams.mode) {
        setMode(routeParams.mode);
      }
      if (rescheduleContext === "mentorship") {
        setRescheduleContext("mentorship");
      }
    }, [
      rescheduleContext,
      routeAppointmentId,
      routeParams.mode,
      setAppointmentId,
      setMode,
      setRescheduleContext,
    ]),
  );

  const handleBack = useCallback(() => {
    const returnTo = getReturnToParam(routeParams);
    if (rescheduleContext === "mentorship" && returnTo) {
      exitScheduleMeetingFlow(router, user?.role, { returnTo });
      return;
    }
    router.replace({
      pathname: `${scheduleBase}/person` as any,
      params: {
        ...flowParams,
        mode: draft.mode,
        appointmentId: draft.appointmentId,
        preserveDraft: "1",
      },
    });
  }, [
    draft.appointmentId,
    draft.mode,
    flowParams,
    rescheduleContext,
    routeParams,
    router,
    scheduleBase,
    user?.role,
  ]);

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
      params: flowParams,
    });
  }, [flowParams, hasPerson, scheduleBase]);

  const isMentor = String(user?.role || "").toLowerCase() === "mentor";

  
  const availabilityOwnerId = isMentor ? user?.id : draft.person?.id;
  
  const participantUserId = isMentor ? draft.person?.id : user?.id;

  const excludeAppointmentId =
    draft.mode === "reschedule" ? draft.appointmentId : undefined;

  const { data: rescheduleAppointment } = useQuery({
    queryKey: [...appointmentKeys.all, "by-id", excludeAppointmentId ?? ""] as const,
    queryFn: async () => {
      const apt = await appointmentService.getAppointmentById(String(excludeAppointmentId!));
      return apt ?? null;
    },
    enabled: Boolean(excludeAppointmentId),
    staleTime: 60_000,
  });

  const currentBookingDayYmd = useMemo(() => {
    if (!rescheduleAppointment?.meetingDate) return undefined;
    return meetingDateToDayYmd(rescheduleAppointment.meetingDate);
  }, [rescheduleAppointment?.meetingDate]);

  const currentBookingSlot = useMemo(() => {
    if (!rescheduleAppointment?.meetingDate) return null;
    return parseSlotFromMeetingDateIso(rescheduleAppointment.meetingDate);
  }, [rescheduleAppointment?.meetingDate]);

  const queryClient = useQueryClient();
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [isScanningForBookableMonth, setIsScanningForBookableMonth] = useState(false);
  const monthScanAttemptsRef = useRef(0);
  const lastSlotSyncSkipRef = useRef<string | null>(null);

  const prevAvailabilityOwnerRef = useRef<string | null>(null);
  const prevSelectedDayRef = useRef<string | undefined>(undefined);

  const setScanningForBookableMonth = useCallback((scanning: boolean) => {
    setIsScanningForBookableMonth((prev) => (prev === scanning ? prev : scanning));
  }, []);

  // Drawer keeps this screen mounted (freezeOnBlur). Re-align month on revisit without
  // forcing a full refetch storm (OAuth + focus used to duplicate slow network calls).
  useFocusEffect(
    useCallback(() => {
      if (!availabilityOwnerId) return;

      monthScanAttemptsRef.current = 0;
      lastSlotSyncSkipRef.current = null;
      setScanningForBookableMonth(false);

      const draftState = useScheduleMeetingStore.getState().draft;
      const ymd = draftState.selectedDayYmd;
      if (ymd) {
        const cal = calendarYearMonthFromYmd(ymd);
        if (cal) {
          setCurrentMonth(cal.month);
          setCurrentYear(cal.year);
        }
      }
    }, [availabilityOwnerId, setScanningForBookableMonth]),
  );

  const handleGoogleCalendarConnectionSynced = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["monthly-availability"] });
    void queryClient.invalidateQueries({ queryKey: ["available-meeting-slots"] });
  }, [queryClient]);

  // New person / second booking in a row — drop stale month + slot sync from the prior session.
  useEffect(() => {
    if (!availabilityOwnerId) return;
    const ownerChanged = prevAvailabilityOwnerRef.current !== availabilityOwnerId;
    prevAvailabilityOwnerRef.current = availabilityOwnerId;
    if (!ownerChanged) return;

    prevSelectedDayRef.current = undefined;
    monthScanAttemptsRef.current = 0;
    lastSlotSyncSkipRef.current = null;
    setScanningForBookableMonth(false);

    if (!draft.selectedDayYmd) {
      const n = new Date();
      setCurrentMonth(n.getMonth() + 1);
      setCurrentYear(n.getFullYear());
    }
  }, [availabilityOwnerId, draft.selectedDayYmd]);

  // Weekly settings / saved slots (source of truth for meeting settings + raw saved blocks).
  const { availability: weeklyAvailability, isLoading: isLoadingWeekly, isError: isWeeklyError } = useWeeklyAvailability(
    availabilityOwnerId || null,
    {
      enabled: Boolean(availabilityOwnerId),
      
      role: "mentor",
    },
  );

  // Monthly availability (source of truth for which dates are selectable this month).
  // This endpoint also applies backend constraints (min notice / max bookings per day).
  const {
    availability: monthlyAvailability,
    isLoading: isLoadingMonthly,
    isError: isMonthlyError,
  } = useMonthlyAvailability(
    {
      mentorId: availabilityOwnerId || null,
      month: currentMonth,
      year: currentYear,
      role: "mentor",
      participantUserId: participantUserId || undefined,
      excludeAppointmentId,
    },
    {
      enabled: Boolean(availabilityOwnerId),
      
      allowDefaultForMentee: false,
      staleTimeMs: 2000,
    },
  );

  const settings = weeklyAvailability;
  const toDateString = (value: string) => normalizeAvailabilityDateString(value);

  const {
    data: availableSlotsData,
    isLoading: isLoadingAvailableSlots,
    isFetching: isFetchingAvailableSlots,
    isError: isAvailableSlotsError,
  } = useAvailableMeetingSlots({
    mentorId: availabilityOwnerId || undefined,
    date: draft.selectedDayYmd,
    participantUserId: participantUserId || undefined,
    excludeAppointmentId,
    enabled: Boolean(availabilityOwnerId && draft.selectedDayYmd),
  });

  const slotsLoading = isLoadingAvailableSlots;
  const availableDates = useMemo(() => {
    if (!monthlyAvailability?.length) return [];
    const todayYmd = ymdToday();
    const set = new Set<string>();
    for (const day of monthlyAvailability) {
      const key = toDateString(String(day?.date ?? ""));
      if (!key || key < todayYmd) continue;
      if ((day as { unavailable?: boolean }).unavailable) continue;
      if ((day.slots?.length ?? 0) > 0) set.add(key);
    }
    return Array.from(set).sort();
  }, [monthlyAvailability]);

  /** Authoritative slots for the selected day — same rules as POST /appointments. */
  const displayTimeSlots = useMemo(() => {
    const dateStr = draft.selectedDayYmd;
    if (!dateStr || !availableSlotsData?.slots?.length) return [];
    let slots = availableSlotsData.slots;
    if (
      excludeAppointmentId &&
      currentBookingDayYmd === dateStr &&
      currentBookingSlot
    ) {
      slots = slots.filter(
        (slot) => !slotStartKeysMatch(slot, currentBookingSlot),
      );
    }
    return slots.map((slot: APITimeSlot, idx: number) => ({
      id: slot._id || `${dateStr}-${slot.startTime}-${slot.startPeriod}-${idx}`,
      label: formatTimeSlot(slot),
      apiSlot: slot,
    }));
  }, [
    availableSlotsData?.slots,
    currentBookingDayYmd,
    currentBookingSlot,
    draft.selectedDayYmd,
    excludeAppointmentId,
  ]);

  const canKeepCurrentTime = Boolean(
    excludeAppointmentId &&
      currentBookingDayYmd &&
      currentBookingSlot &&
      draft.selectedDayYmd === currentBookingDayYmd,
  );

  const isKeepingCurrentTime = Boolean(
    canKeepCurrentTime &&
      draft.selectedSlot &&
      isSameSlotAsMeetingDate(draft.selectedSlot, rescheduleAppointment!.meetingDate),
  );

  /** Dates with at least one server-filtered slot this month (calendar highlights). */

  const mentorHasNoAvailability = useMemo(() => {
    if (isLoadingWeekly || isLoadingMonthly) return false;
    const weeklyCount = weeklyAvailability?.weeklySlots?.length ?? 0;
    return weeklyCount === 0 && availableDates.length === 0;
  }, [availableDates.length, isLoadingMonthly, isLoadingWeekly, weeklyAvailability?.weeklySlots?.length]);

  /** Only block the calendar when the user picks a month — not during background auto-scan. */
  const showMonthLoadingOverlay = isLoadingMonthly && !isScanningForBookableMonth;

  const schedulingSettings = useMemo((): WeeklyAvailability | null => {
    if (!weeklyAvailability) return null;
    return weeklyAvailability as WeeklyAvailability;
  }, [weeklyAvailability]);

  const minNoticeHours = resolveMinSchedulingNoticeHours(schedulingSettings);

  const hasBookableSlotsOnDate = useCallback(
    (ymd: string) => {
      if (!monthlyAvailability?.length) return false;
      const day = monthlyAvailability.find(
        (d) => toDateString(String(d?.date ?? "")) === ymd,
      );
      return (day?.slots?.length ?? 0) > 0 && !(day as { unavailable?: boolean }).unavailable;
    },
    [monthlyAvailability],
  );

  const selectNearestBookableDay = useCallback(
    (skipYmd?: string) => {
      if (availableDates.length === 0) return;
      const next = pickNearestBookableDay(availableDates, hasBookableSlotsOnDate, skipYmd);
      if (!next || next === draft.selectedDayYmd) return;
      setDay(next);
      const cal = calendarYearMonthFromYmd(next);
      if (cal) {
        setCurrentMonth(cal.month);
        setCurrentYear(cal.year);
      }
    },
    [availableDates, draft.selectedDayYmd, hasBookableSlotsOnDate, setDay],
  );

  // If this month has no bookable days, try a few months ahead — but stop immediately
  // when the mentor has no availability configured (avoids sequential empty API calls).
  useEffect(() => {
    if (isLoadingWeekly || isLoadingMonthly) return;

    if (availableDates.length > 0) {
      monthScanAttemptsRef.current = 0;
      setScanningForBookableMonth(false);
      return;
    }

    if (mentorHasNoAvailability) {
      monthScanAttemptsRef.current = 0;
      setScanningForBookableMonth(false);
      return;
    }

    const maxMonthsToScan = 3;
    if (monthScanAttemptsRef.current >= maxMonthsToScan) {
      setScanningForBookableMonth(false);
      return;
    }

    monthScanAttemptsRef.current += 1;
    setScanningForBookableMonth(true);
    const next = new Date(currentYear, currentMonth, 1);
    setCurrentMonth(next.getMonth() + 1);
    setCurrentYear(next.getFullYear());
  }, [
    availableDates.length,
    currentMonth,
    currentYear,
    isLoadingMonthly,
    isLoadingWeekly,
    mentorHasNoAvailability,
    setScanningForBookableMonth,
  ]);

  useEffect(() => {
    if (availableDates.length === 0) return;

    const todayYmd = ymdToday();
    const current = draft.selectedDayYmd;
    const invalid = !current || current < todayYmd || !availableDates.includes(current);
    if (invalid) {
      selectNearestBookableDay();
    }
  }, [availableDates, draft.selectedDayYmd, selectNearestBookableDay]);

  // Clear slot only when the selected day changes — not when the user picks a time.
  useEffect(() => {
    const prev = prevSelectedDayRef.current;
    prevSelectedDayRef.current = draft.selectedDayYmd;
    if (prev !== undefined && prev !== draft.selectedDayYmd) {
      setSlot(null);
    }
  }, [draft.selectedDayYmd, setSlot]);

  // Clear selected slot when server says it is no longer bookable.
  useEffect(() => {
    if (slotsLoading || !draft.selectedDayYmd || !draft.selectedSlot) return;
    if (!isSelectedSlotStillAvailable(availableSlotsData?.slots ?? [], draft.selectedSlot)) {
      setSlot(null);
    }
  }, [
    availableSlotsData?.slots,
    draft.selectedDayYmd,
    draft.selectedSlot,
    setSlot,
    slotsLoading,
  ]);

  // Selected day had no bookable slots from server — try the next highlighted date.
  useEffect(() => {
    if (slotsLoading || isFetchingAvailableSlots || availableDates.length === 0) return;

    if (displayTimeSlots.length > 0) {
      lastSlotSyncSkipRef.current = null;
      return;
    }

    const current = draft.selectedDayYmd;
    if (!current) {
      selectNearestBookableDay();
      return;
    }

    const todayYmd = ymdToday();
    const invalid = current < todayYmd || !availableDates.includes(current);
    if (invalid) {
      selectNearestBookableDay();
      return;
    }

    const next = pickNearestBookableDay(
      availableDates,
      hasBookableSlotsOnDate,
      current,
    );
    if (!next || next === current || next === lastSlotSyncSkipRef.current) {
      lastSlotSyncSkipRef.current = null;
      return;
    }
    lastSlotSyncSkipRef.current = current;
    setDay(next);
    const cal = calendarYearMonthFromYmd(next);
    if (cal) {
      setCurrentMonth(cal.month);
      setCurrentYear(cal.year);
    }
  }, [
    availableDates,
    displayTimeSlots.length,
    draft.selectedDayYmd,
    hasBookableSlotsOnDate,
    selectNearestBookableDay,
    setDay,
    slotsLoading,
    isFetchingAvailableSlots,
  ]);

  const canContinue = Boolean(draft.person?.id && draft.selectedDayYmd && draft.selectedSlot);

  const visibleMonthLabel = useMemo(() => {
    const d = new Date(currentYear, currentMonth - 1, 1);
    return d.toLocaleString("en-US", { month: "long", year: "numeric" });
  }, [currentMonth, currentYear]);

  if (!hasPerson) return null;

  // Only block the whole screen until weekly settings exist — monthly refetches on month change
  // must NOT replace the UI (that caused “loading same month” and missing next-month dates).
  // Block only when there is no cached availability yet (prefetch on session detail avoids this).
  const showBlockingLoader = isLoadingWeekly && !weeklyAvailability;
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
              onConnectionSynced={handleGoogleCalendarConnectionSynced}
            />
          </View>

          <View style={styles.calendarCard}>
            <GradientCalendar
              selected={draft.selectedDayYmd}
              setSelected={(ymd: string) => setDay(ymd)}
              availableDates={availableDates}
              onMonthChange={(m, y) => {
                monthScanAttemptsRef.current = 0;
                setScanningForBookableMonth(false);
                setCurrentMonth(m);
                setCurrentYear(y);
              }}
              showHeader={true}
              disablePastDates={true}
              markToday={true}
            />
            {showMonthLoadingOverlay ? (
              <View style={styles.calendarLoadingOverlay} pointerEvents="none">
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.calendarLoadingText}>Loading {visibleMonthLabel}…</Text>
              </View>
            ) : null}
            {isScanningForBookableMonth && isLoadingMonthly ? (
              <View style={styles.scanningHint} pointerEvents="none">
                <ActivityIndicator color="#8ec5eb" size="small" />
                <Text style={styles.scanningHintText}>Looking for next available date…</Text>
              </View>
            ) : null}
          </View>

          {mentorHasNoAvailability ? (
            <Text style={styles.noAvailabilityBanner}>
              This mentor has not set their availability yet. Please ask them to configure their
              schedule, or try again later.
            </Text>
          ) : null}

          {isMonthlyError ? (
            <Text style={styles.monthlyWarning}>
              Could not refresh this month from the server. Please try again.
            </Text>
          ) : null}

          <Text style={styles.sectionTitle}>Available times</Text>
          {canKeepCurrentTime ? (
            <Pressable
              style={[styles.keepCurrentBtn, isKeepingCurrentTime && styles.keepCurrentBtnSelected]}
              onPress={() => {
                if (currentBookingSlot) {
                  setSlot({
                    ...currentBookingSlot,
                    endTime: currentBookingSlot.startTime,
                    endPeriod: currentBookingSlot.startPeriod,
                  } as APITimeSlot);
                }
              }}
            >
              <Ionicons
                name="time-outline"
                size={16}
                color={isKeepingCurrentTime ? "#1E3A6F" : "#FFFFFF"}
              />
              <Text
                style={[
                  styles.keepCurrentText,
                  isKeepingCurrentTime && styles.keepCurrentTextSelected,
                ]}
              >
                Keep current time ({formatTimeSlot(currentBookingSlot!)})
              </Text>
            </Pressable>
          ) : null}
          {isFetchingAvailableSlots && !slotsLoading ? (
            <Text style={styles.syncText}>Updating times…</Text>
          ) : null}
          {slotsLoading ? (
            <View style={styles.syncRow}>
              <ActivityIndicator color="#8ec5eb" size="small" />
              <Text style={styles.syncText}>Loading available times…</Text>
            </View>
          ) : null}
          {isAvailableSlotsError ? (
            <Text style={styles.calendarError}>
              Could not load available times. Pick another date or try again.
            </Text>
          ) : null}
          {minNoticeHours > 0 && !slotsLoading ? (
            <Text style={styles.noticeHint}>
              Slots must start at least {minNoticeHours} hour{minNoticeHours === 1 ? "" : "s"} from now.
            </Text>
          ) : null}
          {!slotsLoading && displayTimeSlots.length === 0 ? (
            <Text style={styles.subtle}>
              {minNoticeHours > 0
                ? "No bookable slots for this date (notice period, availability, or calendar conflicts)."
                : "No slots for this date."}
            </Text>
          ) : null}
          {!slotsLoading && displayTimeSlots.length > 0 ? (
            <View style={styles.slotGrid}>
              {displayTimeSlots.map((s) => {
                const selected =
                  draft.selectedSlot != null &&
                  draft.selectedSlot.startTime === s.apiSlot.startTime &&
                  draft.selectedSlot.startPeriod === s.apiSlot.startPeriod;
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
          ) : null}

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
                  params: flowParams,
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
  calendarCard: {
    marginTop: 12,
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
  scanningHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  scanningHintText: {
    color: "#8ec5eb",
    fontWeight: "600",
    fontSize: 12,
  },
  noAvailabilityBanner: {
    marginTop: 10,
    color: "rgba(255, 209, 102, 0.95)",
    fontWeight: "600",
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  monthlyWarning: {
    marginTop: 8,
    color: "rgba(255, 209, 102, 0.95)",
    fontWeight: "600",
    fontSize: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: { marginTop: 14, color: "#FFFFFF", fontWeight: "900" },
  keepCurrentBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  keepCurrentBtnSelected: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  keepCurrentText: { color: "#FFFFFF", fontWeight: "800", fontSize: 12 },
  keepCurrentTextSelected: { color: "#1E3A6F" },
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

