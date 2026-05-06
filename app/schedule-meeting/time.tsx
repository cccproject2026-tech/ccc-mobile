import GradientCalendar from "@/components/atom/calendar";
import TopBar from "@/components/director/TopBar";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { formatTimeSlot, normalizeAvailabilityDateString, slotsFromWeeklyOrMonthlyDay, useWeeklyAvailability } from "@/hooks/mentors/useMentorsAvailability";
import { useAuthStore } from "@/stores/auth.store";
import { useScheduleMeetingStore } from "@/stores/scheduleMeeting.store";
import type { TimeSlot as APITimeSlot } from "@/types/appointment.types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function ymdToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function ScheduleMeetingTimeScreen() {
  const { user } = useAuthStore();
  const { draft, setDay, setSlot, setPlatformLabel } = useScheduleMeetingStore();
  const insets = useSafeAreaInsets();

  const isMentor = String(user?.role || "").toLowerCase() === "mentor";

  // Availability owner:
  // - if logged in as mentor scheduling with pastor -> availability belongs to current mentor (user.id)
  // - else pastor scheduling with mentor -> availability belongs to selected person (mentor)
  const availabilityOwnerId = isMentor ? user?.id : draft.person?.id;

  const { availability: weeklyAvailability, isLoading, isError } = useWeeklyAvailability(
    availabilityOwnerId || null,
  );

  const settings = weeklyAvailability;
  const weeklySlots = weeklyAvailability?.weeklySlots ?? [];

  const toDateString = (value: string) => normalizeAvailabilityDateString(value);

  const availableDates = useMemo(() => {
    if (!weeklySlots) return [];
    return weeklySlots
      .filter((day: any) => slotsFromWeeklyOrMonthlyDay(day).length > 0)
      .map((day: any) => toDateString(day.date))
      .filter((d: string) => d.length >= 10);
  }, [weeklySlots]);

  useEffect(() => {
    // default date
    if (!draft.selectedDayYmd && availableDates.length > 0) {
      const todayYmd = ymdToday();
      if (availableDates.includes(todayYmd)) {
        setDay(todayYmd);
        return;
      }

      const nextUpcoming = [...availableDates]
        .filter((d) => d >= todayYmd)
        .sort()[0];

      setDay(nextUpcoming || [...availableDates].sort()[0]);
    }
  }, [availableDates, draft.selectedDayYmd, setDay]);

  useEffect(() => {
    // reset time when day changes
    setSlot(null);
  }, [draft.selectedDayYmd, setSlot]);

  const getTimeSlotsForDate = useCallback(
    (dateString: string) => {
      if (!weeklySlots) return [] as { id: string; label: string; apiSlot: APITimeSlot }[];
      const dayData = weeklySlots.find((day: any) => toDateString(day.date) === dateString) as any;
      const slots: APITimeSlot[] = dayData ? slotsFromWeeklyOrMonthlyDay(dayData) : [];
      return slots.map((slot: APITimeSlot, idx: number) => ({
        id: slot._id || `${dateString}-${idx}`,
        label: formatTimeSlot(slot),
        apiSlot: slot,
      }));
    },
    [weeklySlots],
  );

  const timeSlots = useMemo(
    () => (draft.selectedDayYmd ? getTimeSlotsForDate(draft.selectedDayYmd) : []),
    [draft.selectedDayYmd, getTimeSlotsForDate],
  );

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

  if (!draft.person?.id) {
    // no person selected
    useEffect(() => {
      router.replace("/schedule-meeting/person");
    }, []);
    return null;
  }

  if (isLoading) {
    return (
      <AppGradientBackground style={{ flex: 1 }}>
        <TopBar role={String(user?.role || "pastor")} showUserName />
        <View style={styles.center}>
          <ActivityIndicator color="#FFFFFF" />
          <Text style={styles.subtle}>Loading availability…</Text>
        </View>
      </AppGradientBackground>
    );
  }

  if (isError) {
    return (
      <AppGradientBackground style={{ flex: 1 }}>
        <TopBar role={String(user?.role || "pastor")} showUserName />
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
      <TopBar role={String(user?.role || "pastor")} showUserName />
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
              showHeader={true}
              disablePastDates={true}
              markToday={true}
            />
          </View>

          <Text style={styles.sectionTitle}>Available times</Text>
          {timeSlots.length === 0 ? (
            <Text style={styles.subtle}>No slots for this date.</Text>
          ) : (
            <View style={styles.slotGrid}>
              {timeSlots.map((s) => {
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
            <Pressable style={styles.secondaryBtn} onPress={() => router.back()}>
              <Text style={styles.secondaryText}>Back</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryBtn, !canContinue && styles.primaryBtnDisabled]}
              disabled={!canContinue}
              onPress={() => router.push("/schedule-meeting/confirm")}
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
  calendarCard: { borderRadius: 16, overflow: "hidden", borderWidth: 0, borderColor: "transparent",  },
  sectionTitle: { marginTop: 14, color: "#FFFFFF", fontWeight: "900" },
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

