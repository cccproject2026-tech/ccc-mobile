import { Header } from "@/components/build-components";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import {
  useMonthlyAvailability,
  useSetAvailability,
  useWeeklyAvailability,
} from "@/hooks/mentors/useMentorsAvailability";
import { useAuthStore } from "@/stores/auth.store";
import { SetAvailabilityPayload } from "@/types/appointment.types";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { addDays, format, isValid, startOfWeek } from "date-fns";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import GradientCalendar from "@/components/atom/calendar";

interface TimeSlot {
  id: string;
  start: string;
  end: string;
}

interface DateAvailability {
  date: string; // "YYYY-MM-DD"
  slots: TimeSlot[];
}

type WeekdayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

type RoutineDay = { enabled: boolean; slots: TimeSlot[] };
type WeeklyRoutineState = Record<WeekdayKey, RoutineDay>;

type OverrideMode = "unavailable" | "custom";
type DateOverride = { mode: OverrideMode; slots: TimeSlot[] };

const WEEKDAYS: Array<{ key: WeekdayKey; label: string; jsDay: number }> = [
  { key: "monday", label: "Monday", jsDay: 1 },
  { key: "tuesday", label: "Tuesday", jsDay: 2 },
  { key: "wednesday", label: "Wednesday", jsDay: 3 },
  { key: "thursday", label: "Thursday", jsDay: 4 },
  { key: "friday", label: "Friday", jsDay: 5 },
  { key: "saturday", label: "Saturday", jsDay: 6 },
  { key: "sunday", label: "Sunday", jsDay: 0 },
];

const DEFAULT_SLOT: Pick<TimeSlot, "start" | "end"> = {
  start: "09:00 AM",
  end: "05:00 PM",
};

const TIME_OPTIONS = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
] as const;

function clampToValidDate(d: Date): Date {
  return isValid(d) ? d : new Date();
}

function two(n: number) {
  return String(n).padStart(2, "0");
}

function formatDateToTimeString(d: Date): string {
  const hh = d.getHours();
  const mm = d.getMinutes();
  const period: "AM" | "PM" = hh >= 12 ? "PM" : "AM";
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${two(hour12)}:${two(mm)} ${period}`;
}

function timeStringToDate(timeString: string): Date {
  const [t, p] = timeString.trim().split(/\s+/);
  const [hhStr, mmStr = "0"] = (t || "").split(":");
  let hh = parseInt(hhStr || "0", 10);
  const mm = parseInt(mmStr || "0", 10);
  const period = (p || "AM").toUpperCase();
  if (period === "PM" && hh !== 12) hh += 12;
  if (period === "AM" && hh === 12) hh = 0;
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d;
}

function createEmptyRoutine(): WeeklyRoutineState {
  return {
    monday: { enabled: false, slots: [] },
    tuesday: { enabled: false, slots: [] },
    wednesday: { enabled: false, slots: [] },
    thursday: { enabled: false, slots: [] },
    friday: { enabled: false, slots: [] },
    saturday: { enabled: false, slots: [] },
    sunday: { enabled: false, slots: [] },
  };
}

function normalizeYmd(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const head = raw.includes("T") ? raw.split("T")[0] : raw;
  return head.length >= 10 ? head.slice(0, 10) : "";
}

const AvailabilityScreen = () => {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"appointments" | "availability">(
    "availability",
  );
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [routineExpanded, setRoutineExpanded] = useState<WeekdayKey | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [overridesOpen, setOverridesOpen] = useState(false);
  const [selectedOverrideDate, setSelectedOverrideDate] = useState<string | null>(null);

  // Reset active tab when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setActiveTab("availability");
    }, []),
  );

  const [monthYear, setMonthYear] = useState(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });
  const { month, year } = monthYear;
  const mentorId = user?.id;
  const shouldFetchAvailability = Boolean(mentorId);
  const { availability: apiAvailability, isLoading: isLoadingAvailability } =
    useMonthlyAvailability(
      {
        mentorId: shouldFetchAvailability ? (mentorId as string) : null,
        month,
        year,
      },
      {
        enabled: shouldFetchAvailability,
      },
    );

  const { availability: weeklyAvailabilityApi } = useWeeklyAvailability(
    shouldFetchAvailability ? (mentorId as string) : null,
    { enabled: shouldFetchAvailability, role: "mentor" },
  );

  const [routine, setRoutine] = useState<WeeklyRoutineState>(createEmptyRoutine);
  const didHydrateRef = useRef(false);
  const [dateOverrides, setDateOverrides] = useState<Record<string, DateOverride>>({});

  const [editingTime, setEditingTime] = useState<{
    dayKey: WeekdayKey;
    slotId: string;
    field: "start" | "end";
  } | null>(null);
  const [iosInlineTime, setIosInlineTime] = useState<Date | null>(null);

  const [showOverrideTimePicker, setShowOverrideTimePicker] = useState(false);
  const [selectedOverrideSlot, setSelectedOverrideSlot] = useState<{
    ymd: string;
    slotId: string;
    field: "start" | "end";
  } | null>(null);
  // const [weeklyAvailability, setWeeklyAvailability] =
  //   useState<WeeklyAvailability>({
  //     monday: {
  //       enabled: true,
  //       slots: [
  //         { id: "1", start: "10:00 AM", end: "03:00 PM" },
  //         { id: "2", start: "05:00 PM", end: "07:00 PM" },
  //       ],
  //     },
  //     tuesday: {
  //       enabled: true,
  //       slots: [{ id: "1", start: "10:00 AM", end: "07:00 PM" }],
  //     },
  //     wednesday: {
  //       enabled: true,
  //       slots: [{ id: "1", start: "10:00 AM", end: "07:00 PM" }],
  //     },
  //     thursday: {
  //       enabled: true,
  //       slots: [{ id: "1", start: "10:00 AM", end: "07:00 PM" }],
  //     },
  //     friday: {
  //       enabled: true,
  //       slots: [{ id: "1", start: "10:00 AM", end: "07:00 PM" }],
  //     },
  //     saturday: { enabled: false, slots: [] },
  //     sunday: { enabled: false, slots: [] },
  //   });

  // Meeting preferences state
  const [meetingDuration, setMeetingDuration] = useState("60 Minutes");
  const [maxBookingPerDay, setMaxBookingPerDay] = useState("5");
  const [minSchedulingNotice, setMinSchedulingNotice] = useState("2 Days");

  const durationOptions = ["30 Minutes", "60 Minutes", "90 Minutes"];
  const maxBookingOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  const minNoticeOptions = ["Same day", "1 Day", "2 Days", "3 Days", "1 Week"];

  // API Integration
  const { setAvailabilityAsync, isSettingAvailability } = useSetAvailability({
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Availability saved",
        text2: "Your weekly routine has been updated.",
        position: "bottom",
      });
      setTimeout(() => router.back(), 550);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error.message || "Failed to set availability. Please try again.",
      );
    },
  });

  const anchorWeekStartYmd = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return format(clampToValidDate(start), "yyyy-MM-dd");
  }, []);

  const dateByDayKey = useMemo(() => {
    const base = startOfWeek(new Date(`${anchorWeekStartYmd}T12:00:00`), { weekStartsOn: 1 });
    const map = new Map<WeekdayKey, string>();
    map.set("monday", format(addDays(base, 0), "yyyy-MM-dd"));
    map.set("tuesday", format(addDays(base, 1), "yyyy-MM-dd"));
    map.set("wednesday", format(addDays(base, 2), "yyyy-MM-dd"));
    map.set("thursday", format(addDays(base, 3), "yyyy-MM-dd"));
    map.set("friday", format(addDays(base, 4), "yyyy-MM-dd"));
    map.set("saturday", format(addDays(base, 5), "yyyy-MM-dd"));
    map.set("sunday", format(addDays(base, 6), "yyyy-MM-dd"));
    return map;
  }, [anchorWeekStartYmd]);

  // Hydrate routine + settings from API once.
  // Prefer weeklySlots if available (represents what user saved). If weeklySlots is
  // empty but monthly returns generated/available slots, show that for the current week
  // so the user doesn't see a misleading "empty" state.
  useEffect(() => {
    if (!shouldFetchAvailability) return;
    if (didHydrateRef.current) return;
    if (!weeklyAvailabilityApi && !apiAvailability) return;

    const ws = Array.isArray(weeklyAvailabilityApi?.weeklySlots)
      ? weeklyAvailabilityApi!.weeklySlots
      : [];

    const next: WeeklyRoutineState = createEmptyRoutine();

    const hasWeeklySlots = ws.some((d: any) => {
      const rawSlots = Array.isArray(d?.rawSlots)
        ? d.rawSlots
        : Array.isArray(d?.slots)
          ? d.slots
          : [];
      return rawSlots.length > 0;
    });

    if (hasWeeklySlots) {
      for (const slotDay of ws as any[]) {
        const dayNum = typeof slotDay?.day === "number" ? slotDay.day : undefined;
        const match = WEEKDAYS.find((d) => d.jsDay === dayNum);
        if (!match) continue;
        const rawSlots = Array.isArray(slotDay?.rawSlots)
          ? slotDay.rawSlots
          : Array.isArray(slotDay?.slots)
            ? slotDay.slots
            : [];
        if (!rawSlots.length) continue;
        next[match.key] = {
          enabled: true,
          slots: rawSlots.map((s: any, idx: number) => ({
            id: s?._id ?? `${match.key}-${idx}`,
            start: `${s.startTime} ${s.startPeriod}`,
            end: `${s.endTime} ${s.endPeriod}`,
          })),
        };
      }
    } else {
      // Fallback: map monthly availability for the current week into routine.
      const monthly = Array.isArray(apiAvailability) ? apiAvailability : [];
      const byDate = new Map<string, any>();
      for (const day of monthly) {
        const key = normalizeYmd((day as any)?.date);
        if (!key) continue;
        byDate.set(key, day);
      }
      for (const d of WEEKDAYS) {
        const ymd = dateByDayKey.get(d.key);
        if (!ymd) continue;
        const day = byDate.get(ymd);
        const slots = Array.isArray(day?.slots) ? day.slots : [];
        if (!slots.length) continue;
        next[d.key] = {
          enabled: true,
          slots: slots.map((s: any, idx: number) => ({
            id: s?._id ?? `${d.key}-${idx}`,
            start: `${s.startTime} ${s.startPeriod}`,
            end: `${s.endTime} ${s.endPeriod}`,
          })),
        };
      }
    }
    setRoutine(next);

    // Hydrate date overrides from weeklySlots entries that are NOT part of the anchor week.
    // These represent specific-date customizations saved previously.
    const anchorDates = new Set<string>(Array.from(dateByDayKey.values()));
    const nextOverrides: Record<string, DateOverride> = {};
    for (const slotDay of ws as any[]) {
      const ymd = normalizeYmd(slotDay?.date);
      if (!ymd || anchorDates.has(ymd)) continue;

      const rawSlots = Array.isArray(slotDay?.rawSlots)
        ? slotDay.rawSlots
        : Array.isArray(slotDay?.slots)
          ? slotDay.slots
          : [];

      if (!rawSlots.length) {
        nextOverrides[ymd] = { mode: "unavailable", slots: [] };
        continue;
      }
      nextOverrides[ymd] = {
        mode: "custom",
        slots: rawSlots.map((s: any, idx: number) => ({
          id: s?._id ?? `${ymd}-${idx}`,
          start: `${s.startTime} ${s.startPeriod}`,
          end: `${s.endTime} ${s.endPeriod}`,
        })),
      };
    }
    if (Object.keys(nextOverrides).length) {
      setDateOverrides(nextOverrides);
    }

    // Hydrate meeting settings from API (fall back to defaults).
    if (typeof (weeklyAvailabilityApi as any)?.meetingDuration === "number") {
      setMeetingDuration(`${(weeklyAvailabilityApi as any).meetingDuration} Minutes`);
    }
    if (typeof (weeklyAvailabilityApi as any)?.maxBookingsPerDay === "number") {
      setMaxBookingPerDay(String((weeklyAvailabilityApi as any).maxBookingsPerDay));
    }
    if (typeof (weeklyAvailabilityApi as any)?.minSchedulingNoticeHours === "number") {
      const h = (weeklyAvailabilityApi as any).minSchedulingNoticeHours;
      if (h === 0) setMinSchedulingNotice("Same day");
      else if (h === 24) setMinSchedulingNotice("1 Day");
      else if (h === 48) setMinSchedulingNotice("2 Days");
      else if (h === 72) setMinSchedulingNotice("3 Days");
      else if (h === 168) setMinSchedulingNotice("1 Week");
    }

    didHydrateRef.current = true;
  }, [shouldFetchAvailability, weeklyAvailabilityApi, apiAvailability, dateByDayKey]);

  const dateAvailabilities: DateAvailability[] = useMemo(() => {
    const out: DateAvailability[] = [];
    for (const d of WEEKDAYS) {
      const ymd = dateByDayKey.get(d.key);
      if (!ymd) continue;
      const day = routine[d.key];
      out.push({ date: ymd, slots: day.enabled ? day.slots : [] });
    }
    for (const [ymd, ov] of Object.entries(dateOverrides)) {
      out.push({ date: ymd, slots: ov.mode === "unavailable" ? [] : ov.slots });
    }
    return out;
  }, [routine, dateByDayKey, dateOverrides]);

  const overrideDatesSet = useMemo(() => new Set(Object.keys(dateOverrides)), [dateOverrides]);

  const setDayEnabled = useCallback((dayKey: WeekdayKey, enabled: boolean) => {
    setRoutine((prev) => {
      const existing = prev[dayKey];
      const slots = enabled
        ? (existing.slots.length
          ? existing.slots
          : [{ id: `${Date.now()}`, ...DEFAULT_SLOT }])
        : [];
      return { ...prev, [dayKey]: { enabled, slots } };
    });
  }, []);

  const addSlotForDay = useCallback((dayKey: WeekdayKey) => {
    setRoutine((prev) => {
      const day = prev[dayKey];
      const nextSlots = [...day.slots, { id: `${Date.now()}`, ...DEFAULT_SLOT }];
      return { ...prev, [dayKey]: { enabled: true, slots: nextSlots } };
    });
  }, []);

  const dedupeSlots = useCallback((slots: TimeSlot[]) => {
    return slots.filter(
      (slot, index, self) =>
        index === self.findIndex((s) => s.start === slot.start && s.end === slot.end),
    );
  }, []);

  const copySlots = useCallback(
    (from: WeekdayKey, targets: WeekdayKey[]) => {
      setRoutine((prev) => {
        const source = prev[from];
        const sourceSlots = dedupeSlots(source.slots).map((s) => ({
          ...s,
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        }));
        const next: WeeklyRoutineState = { ...prev };
        for (const k of targets) {
          next[k] = sourceSlots.length
            ? { enabled: true, slots: sourceSlots }
            : { enabled: false, slots: [] };
        }
        return next;
      });
    },
    [dedupeSlots],
  );

  const copyPreviousDay = useCallback(
    (dayKey: WeekdayKey) => {
      const idx = WEEKDAYS.findIndex((d) => d.key === dayKey);
      if (idx < 0) return;
      const prevKey = WEEKDAYS[(idx - 1 + WEEKDAYS.length) % WEEKDAYS.length].key;
      copySlots(prevKey, [dayKey]);
    },
    [copySlots],
  );

  const clearAllAvailability = useCallback(() => {
    setRoutine(createEmptyRoutine());
  }, []);

  const removeSlotForDay = useCallback((dayKey: WeekdayKey, slotId: string) => {
    setRoutine((prev) => {
      const day = prev[dayKey];
      const nextSlots = day.slots.filter((s) => s.id !== slotId);
      return { ...prev, [dayKey]: { enabled: nextSlots.length > 0, slots: nextSlots } };
    });
  }, []);

  const updateSlotTime = useCallback(
    (dayKey: WeekdayKey, slotId: string, field: "start" | "end", value: string) => {
      setRoutine((prev) => {
        const day = prev[dayKey];
        const nextSlots = day.slots.map((s) => (s.id === slotId ? { ...s, [field]: value } : s));
        return { ...prev, [dayKey]: { enabled: true, slots: nextSlots } };
      });
    },
    [],
  );

  const onTimePickerChange = useCallback(
    (event: DateTimePickerEvent, selected?: Date) => {
      if (!editingTime) return;
      if (event.type === "dismissed") {
        setEditingTime(null);
        setIosInlineTime(null);
        return;
      }
      const chosen = selected ?? iosInlineTime ?? new Date();
      updateSlotTime(editingTime.dayKey, editingTime.slotId, editingTime.field, formatDateToTimeString(chosen));
      setIosInlineTime(chosen);
    },
    [editingTime, iosInlineTime, updateSlotTime],
  );

  const getWeeklyDefaultSlotsForDate = useCallback(
    (ymd: string): TimeSlot[] => {
      const dayNum = new Date(`${ymd}T12:00:00`).getDay(); // 0..6
      const match = WEEKDAYS.find((d) => d.jsDay === dayNum);
      if (!match) return [];
      const day = routine[match.key];
      return day.enabled ? day.slots : [];
    },
    [routine],
  );

  const getOverrideEditorSlots = useCallback(
    (ymd: string): { mode: OverrideMode; slots: TimeSlot[] } => {
      const ov = dateOverrides[ymd];
      if (ov) return ov;
      // No override: show weekly default (read-only until user edits; editing will create override)
      const base = getWeeklyDefaultSlotsForDate(ymd);
      return base.length ? { mode: "custom", slots: base } : { mode: "unavailable", slots: [] };
    },
    [dateOverrides, getWeeklyDefaultSlotsForDate],
  );

  const handleTabPress = (tab: "appointments" | "availability") => {
    setActiveTab(tab);
    if (tab === "appointments") {
      router.back();
    }
  };

  // Helper function to parse time from "10:00 AM" to { time: "10", period: "AM" }
  const parseTime = (
    timeString: string,
  ): { time: string; period: "AM" | "PM" } => {
    const [timePart, period] = timeString.split(" ");
    return {
      time: timePart,
      period: period as "AM" | "PM",
    };
  };

  // Helper function to convert min scheduling notice to hours
  const convertNoticeToHours = (notice: string): number => {
    if (notice === "Same day") return 0;
    if (notice === "1 Day") return 24;
    if (notice === "2 Days") return 48;
    if (notice === "3 Days") return 72;
    if (notice === "1 Week") return 168;
    return 48; // Default to 2 days
  };

  // Helper function to convert duration to minutes
  const convertDurationToMinutes = (duration: string): number => {
    const match = duration.match(/(\d+)\s*Minutes?/);
    return match ? parseInt(match[1], 10) : 60;
  };

  const convertToMinutes = (timeString: string): number => {
    const { time, period } = parseTime(timeString);
    const [hourStr, minuteStr = "0"] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return hour * 60 + minute;
  };

  const formatMinutesToTime = (totalMinutes: number): string => {
    const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
    const hour24 = Math.floor(normalized / 60);
    const minute = normalized % 60;
    const period: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
  };

  const normalizeSlots = (slots: TimeSlot[]): TimeSlot[] => {
    if (slots.length <= 1) return slots;

    const sorted = [...slots]
      .map((slot) => ({
        ...slot,
        startMinutes: convertToMinutes(slot.start),
        endMinutes: convertToMinutes(slot.end),
      }))
      .filter((slot) => slot.startMinutes < slot.endMinutes)
      .sort((a, b) => a.startMinutes - b.startMinutes);

    if (sorted.length <= 1) {
      return sorted.map(({ id, startMinutes, endMinutes }) => ({
        id,
        start: formatMinutesToTime(startMinutes),
        end: formatMinutesToTime(endMinutes),
      }));
    }

    const merged: Array<{ startMinutes: number; endMinutes: number }> = [];
    for (const slot of sorted) {
      const prev = merged[merged.length - 1];
      if (!prev) {
        merged.push({
          startMinutes: slot.startMinutes,
          endMinutes: slot.endMinutes,
        });
        continue;
      }

      if (slot.startMinutes < prev.endMinutes) {
        prev.endMinutes = Math.max(prev.endMinutes, slot.endMinutes);
      } else {
        merged.push({
          startMinutes: slot.startMinutes,
          endMinutes: slot.endMinutes,
        });
      }
    }

    return merged.map((slot, index) => ({
      id: `normalized-${index}-${slot.startMinutes}-${slot.endMinutes}`,
      start: formatMinutesToTime(slot.startMinutes),
      end: formatMinutesToTime(slot.endMinutes),
    }));
  };

  useEffect(() => {
    // Reset picker state when routine changes to avoid editing a removed slot.
    setEditingTime(null);
    setIosInlineTime(null);
  }, [routine]);

  const validateSlots = (label: string, slots: TimeSlot[]): string | null => {
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const start = convertToMinutes(slot.start);
      const end = convertToMinutes(slot.end);

      if (start >= end) {
        return `${label}: Start time (${slot.start}) must be before end time (${slot.end}).`;
      }

      for (let j = i + 1; j < slots.length; j++) {
        const other = slots[j];
        const otherStart = convertToMinutes(other.start);
        const otherEnd = convertToMinutes(other.end);

        if (start < otherEnd && end > otherStart) {
          return `${label}: Overlapping slots detected: ${slot.start}-${slot.end} and ${other.start}-${other.end}.`;
        }
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User ID not found. Please log in again.");
      return;
    }

    // Clean payload inputs to avoid duplicate dates/slots being sent
    const cleanedDateAvailabilities = dateAvailabilities
      .map((day) => {
        const dateOnly =
          typeof day.date === "string" && day.date.includes("T")
            ? day.date.split("T")[0]
            : day.date;

        const uniqueSlots = day.slots.filter(
          (slot, index, self) =>
            index ===
            self.findIndex(
              (s) => s.start === slot.start && s.end === slot.end,
            ),
        );
        const normalizedSlots = normalizeSlots(uniqueSlots);

        return {
          ...day,
          date: dateOnly,
          slots: normalizedSlots,
        };
      })
      .filter(
        (day, index, self) =>
          index === self.findIndex((d) => d.date === day.date),
      );

    // Validate slots for all selected dates
    for (const day of cleanedDateAvailabilities) {
      const error = validateSlots(day.date, day.slots);
      if (error) {
        Alert.alert("Invalid Availability", error);
        return;
      }
    }

    try {
      const weeklySlots: SetAvailabilityPayload["weeklySlots"] =
        cleanedDateAvailabilities
          .filter((day) => day.slots.length > 0 || overrideDatesSet.has(day.date))
          .map((day) => {
            const dayNumber = new Date(`${day.date}T12:00:00`).getDay();

            const slots = day.slots
              .map((slot) => {
                const startTime = parseTime(slot.start);
                const endTime = parseTime(slot.end);

                return {
                  startTime: startTime.time,
                  startPeriod: startTime.period,
                  endTime: endTime.time,
                  endPeriod: endTime.period,
                };
              })
              .filter(
                (slot, index, self) =>
                  index ===
                  self.findIndex(
                    (s) =>
                      s.startTime === slot.startTime &&
                      s.startPeriod === slot.startPeriod &&
                      s.endTime === slot.endTime &&
                      s.endPeriod === slot.endPeriod,
                  ),
              );

            return {
              day: dayNumber,
              date: day.date,
              slots,
            };
          });

      const payload: SetAvailabilityPayload = {
        mentorId: user.id,
        weeklySlots: weeklySlots,
        meetingDuration: convertDurationToMinutes(meetingDuration),
        minSchedulingNoticeHours: convertNoticeToHours(minSchedulingNotice),
        maxBookingsPerDay: parseInt(maxBookingPerDay, 10),
      };

      console.log(
        "📦 FINAL AVAILABILITY PAYLOAD:",
        JSON.stringify(payload, null, 2),
      );
      await setAvailabilityAsync(payload);
    } catch (error) {
      console.error("Error submitting availability:", error);
      Alert.alert("Error", "Failed to submit availability. Please try again.");
    }
  };

  const routineHasAny = useMemo(() => {
    return WEEKDAYS.some((d) => routine[d.key].enabled && routine[d.key].slots.length > 0);
  }, [routine]);

  const routinePreview = useMemo(() => {
    return WEEKDAYS.map((d) => {
      const day = routine[d.key];
      const enabled = day.enabled && day.slots.length > 0;
      const slots = enabled ? day.slots : [];
      const summary = enabled
        ? slots
            .slice(0, 2)
            .map((s) => `${s.start}–${s.end}`)
            .join(" · ") + (slots.length > 2 ? ` (+${slots.length - 2})` : "")
        : "Unavailable";
      return { ...d, enabled, slots, summary };
    });
  }, [routine]);

  const overrideAvailableDates = useMemo(() => {
    // Enable all dates the backend says are available OR that have a custom override.
    const set = new Set<string>();
    for (const day of Array.isArray(apiAvailability) ? apiAvailability : []) {
      const ymd = normalizeYmd((day as any)?.date);
      if (ymd) set.add(ymd);
    }
    for (const [ymd, ov] of Object.entries(dateOverrides)) {
      if (ov.mode === "custom") set.add(ymd);
    }
    return Array.from(set);
  }, [apiAvailability, dateOverrides]);

  const overrideUnavailableDates = useMemo(() => {
    return Object.entries(dateOverrides)
      .filter(([, ov]) => ov.mode === "unavailable")
      .map(([ymd]) => ymd);
  }, [dateOverrides]);

  const selectedOverride = useMemo(() => {
    if (!selectedOverrideDate) return null;
    return dateOverrides[selectedOverrideDate] ?? null;
  }, [dateOverrides, selectedOverrideDate]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AppGradientBackground>
        <>
          <View style={{ paddingBottom: 10 }}>
            <TopBar role="mentor" showUserName />
          </View>
          <View style={{ flex: 1 }}>
            {/* Header */}
            <Header
              title="Schedule"
              hideSearchBar={true}
              showSettings={false}
              showNewMeeting={false}
            />

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
              <Pressable
                style={[
                  styles.tab,
                  activeTab === "appointments" && styles.activeTab,
                ]}
                onPress={() => handleTabPress("appointments")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "appointments" && styles.activeTabText,
                  ]}
                >
                  Appointments
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.tab,
                  activeTab === "availability" && styles.activeTab,
                ]}
                onPress={() => handleTabPress("availability")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "availability" && styles.activeTabText,
                  ]}
                >
                  Availability
                </Text>
              </Pressable>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: bottom + 120 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.contentContainer}>
                <View style={styles.heroHeader}>
                  <View style={styles.heroTitleRow}>
                    <View style={styles.heroIconWrap}>
                      <Image source={icons.calendarIcon} style={{ width: 18, height: 18 }} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.heroTitle}>Weekly Availability</Text>
                      <Text style={styles.heroSub}>
                        Choose when you are usually available. Save when done.
                      </Text>
                    </View>
                  </View>
                </View>

                {isLoadingAvailability ? (
                  <View style={styles.loadingBlock}>
                    <ActivityIndicator color="#FFFFFF" />
                    <Text style={styles.loadingText}>Loading your availability…</Text>
                  </View>
                ) : !routineHasAny ? (
                  <View style={styles.emptyStateCard}>
                    <View style={styles.emptyIconWrap}>
                      <Ionicons name="time-outline" size={26} color="rgba(255,255,255,0.75)" />
                    </View>
                    <Text style={styles.emptyTitle}>You haven’t added your availability yet.</Text>
                    <Text style={styles.emptySub}>
                      Add your weekly schedule so pastors can book time with you.
                    </Text>
                    <Pressable
                      style={styles.primaryCta}
                      onPress={() => {
                        setRoutine((prev) => {
                          const next = { ...prev };
                          for (const d of WEEKDAYS) {
                            const isWeekday = d.jsDay >= 1 && d.jsDay <= 5;
                            next[d.key] = isWeekday
                              ? { enabled: true, slots: [{ id: `${Date.now()}-${d.key}`, ...DEFAULT_SLOT }] }
                              : { enabled: false, slots: [] };
                          }
                          return next;
                        });
                      }}
                    >
                      <Ionicons name="add" size={18} color="#0E2A47" />
                      <Text style={styles.primaryCtaText}>Add Weekly Schedule</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.routineList}>
                    <View style={styles.quickActionsRow}>
                      <Pressable
                        style={styles.quickActionPill}
                        onPress={() => setReviewOpen(true)}
                      >
                        <Ionicons name="eye-outline" size={14} color="rgba(255,255,255,0.9)" />
                        <Text style={styles.quickActionText}>Preview</Text>
                      </Pressable>
                      <Pressable
                        style={styles.quickActionPill}
                        onPress={() =>
                          copySlots("monday", WEEKDAYS.map((d) => d.key))
                        }
                      >
                        <Ionicons name="copy-outline" size={14} color="rgba(255,255,255,0.9)" />
                        <Text style={styles.quickActionText}>Copy Monday to All</Text>
                      </Pressable>
                      <Pressable
                        style={styles.quickActionPill}
                        onPress={() =>
                          copySlots(
                            "monday",
                            WEEKDAYS.filter((d) => d.jsDay >= 1 && d.jsDay <= 5).map((d) => d.key),
                          )
                        }
                      >
                        <Ionicons name="copy-outline" size={14} color="rgba(255,255,255,0.9)" />
                        <Text style={styles.quickActionText}>Copy Monday to Weekdays</Text>
                      </Pressable>
                      <Pressable style={styles.quickActionPillDanger} onPress={clearAllAvailability}>
                        <Ionicons name="trash-outline" size={14} color="rgba(255,255,255,0.9)" />
                        <Text style={styles.quickActionText}>Clear All</Text>
                      </Pressable>
                    </View>

                    {WEEKDAYS.map((d) => {
                      const day = routine[d.key];
                      const preview = routinePreview.find((p) => p.key === d.key);
                      const expanded = routineExpanded === d.key;
                      return (
                        <View key={d.key} style={styles.dayCard}>
                          <Pressable
                            style={styles.dayCardHeader}
                            onPress={() => setRoutineExpanded(expanded ? null : d.key)}
                            hitSlop={10}
                          >
                            <View style={{ flex: 1, minWidth: 0 }}>
                              <Text style={styles.dayName}>{d.label}</Text>
                              <Text
                                style={!day.enabled || day.slots.length === 0 ? styles.dayUnavailable : styles.daySummary}
                                numberOfLines={1}
                              >
                                {preview?.summary ?? (day.enabled ? "Available" : "Unavailable")}
                              </Text>
                            </View>

                            <Pressable
                              style={[styles.togglePill, day.enabled && styles.togglePillOn]}
                              onPress={() => setDayEnabled(d.key, !day.enabled)}
                              hitSlop={10}
                            >
                              <View style={[styles.toggleDot, day.enabled && styles.toggleDotOn]} />
                              <Text style={[styles.toggleText, day.enabled && styles.toggleTextOn]}>
                                {day.enabled ? "On" : "Off"}
                              </Text>
                            </Pressable>

                            <Ionicons
                              name={expanded ? "chevron-up" : "chevron-down"}
                              size={18}
                              color="rgba(255,255,255,0.85)"
                            />
                          </Pressable>

                          {expanded ? (
                            <View style={styles.dayCardBody}>
                              {!day.enabled ? (
                                <Text style={styles.inlineHint}>
                                  Turn this day on to add available hours.
                                </Text>
                              ) : (
                                <>
                                  <Pressable
                                    style={styles.copyPrevRow}
                                    onPress={() => copyPreviousDay(d.key)}
                                    hitSlop={10}
                                  >
                                    <Ionicons name="arrow-undo-outline" size={16} color="rgba(255,255,255,0.85)" />
                                    <Text style={styles.copyPrevText}>Copy previous day</Text>
                                  </Pressable>

                                  {day.slots.map((slot, idx) => (
                                    <View key={slot.id} style={styles.slotRow}>
                                      <Pressable
                                        style={styles.timeChip}
                                        onPress={() => {
                                          setEditingTime({ dayKey: d.key, slotId: slot.id, field: "start" });
                                          setIosInlineTime(timeStringToDate(slot.start));
                                        }}
                                      >
                                        <Text style={styles.timeChipText}>{slot.start}</Text>
                                        <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.85)" />
                                      </Pressable>
                                      <Text style={styles.toText}>to</Text>
                                      <Pressable
                                        style={styles.timeChip}
                                        onPress={() => {
                                          setEditingTime({ dayKey: d.key, slotId: slot.id, field: "end" });
                                          setIosInlineTime(timeStringToDate(slot.end));
                                        }}
                                      >
                                        <Text style={styles.timeChipText}>{slot.end}</Text>
                                        <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.85)" />
                                      </Pressable>

                                      {day.slots.length > 1 ? (
                                        <Pressable
                                          style={styles.removeBtn}
                                          onPress={() => removeSlotForDay(d.key, slot.id)}
                                          hitSlop={10}
                                          accessibilityLabel={`Remove slot ${idx + 1}`}
                                        >
                                          <Ionicons name="close" size={16} color="rgba(255,107,107,0.95)" />
                                        </Pressable>
                                      ) : (
                                        <View style={{ width: 32 }} />
                                      )}
                                    </View>
                                  ))}

                                  {editingTime && editingTime.dayKey === d.key ? (
                                    <View style={styles.inlinePickerWrap}>
                                      <View style={styles.inlinePickerHeader}>
                                        <Text style={styles.inlinePickerTitle}>
                                          Pick {editingTime.field === "start" ? "start" : "end"} time
                                        </Text>
                                        <Pressable
                                          onPress={() => {
                                            setEditingTime(null);
                                            setIosInlineTime(null);
                                          }}
                                          hitSlop={10}
                                        >
                                          <Text style={styles.inlinePickerDone}>Done</Text>
                                        </Pressable>
                                      </View>
                                      <DateTimePicker
                                        value={iosInlineTime ?? new Date()}
                                        mode="time"
                                        display="spinner"
                                        onChange={onTimePickerChange}
                                      />
                                    </View>
                                  ) : null}

                                  <Pressable
                                    style={styles.addSlotInline}
                                    onPress={() => addSlotForDay(d.key)}
                                    hitSlop={10}
                                  >
                                    <Ionicons name="add" size={16} color="#FDE68A" />
                                    <Text style={styles.addSlotInlineText}>Add another slot</Text>
                                  </Pressable>
                                </>
                              )}
                            </View>
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                )}

                <View style={styles.settingsCard}>
                  <Pressable
                    style={styles.settingsHeader}
                    onPress={() => setSettingsExpanded((v) => !v)}
                    hitSlop={10}
                  >
                    <View style={styles.settingsHeaderLeft}>
                      <Ionicons name="options-outline" size={18} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.settingsTitle}>Advanced settings</Text>
                    </View>
                    <Ionicons
                      name={settingsExpanded ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="rgba(255,255,255,0.85)"
                    />
                  </Pressable>

                  {settingsExpanded ? (
                    <View style={styles.settingsBody}>
                      <Text style={styles.fieldLabel}>Meeting Length</Text>
                      <View style={styles.inlineOptionsRow}>
                        {durationOptions.map((opt) => (
                          <Pressable
                            key={opt}
                            style={[
                              styles.optionChip,
                              meetingDuration === opt && styles.optionChipActive,
                            ]}
                            onPress={() => setMeetingDuration(opt)}
                          >
                            <Text
                              style={[
                                styles.optionChipText,
                                meetingDuration === opt && styles.optionChipTextActive,
                              ]}
                            >
                              {opt.replace(" Minutes", "m")}
                            </Text>
                          </Pressable>
                        ))}
                      </View>

                      <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
                        Daily Meeting Limit
                      </Text>
                      <View style={styles.inlineOptionsRow}>
                        {maxBookingOptions.slice(0, 6).map((opt) => (
                          <Pressable
                            key={opt}
                            style={[
                              styles.optionChip,
                              maxBookingPerDay === opt && styles.optionChipActive,
                            ]}
                            onPress={() => setMaxBookingPerDay(opt)}
                          >
                            <Text
                              style={[
                                styles.optionChipText,
                                maxBookingPerDay === opt && styles.optionChipTextActive,
                              ]}
                            >
                              {opt}
                            </Text>
                          </Pressable>
                        ))}
                      </View>

                      <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
                        Notice Before Booking
                      </Text>
                      <View style={styles.inlineOptionsRow}>
                        {minNoticeOptions.map((opt) => (
                          <Pressable
                            key={opt}
                            style={[
                              styles.optionChip,
                              minSchedulingNotice === opt && styles.optionChipActive,
                            ]}
                            onPress={() => setMinSchedulingNotice(opt)}
                          >
                            <Text
                              style={[
                                styles.optionChipText,
                                minSchedulingNotice === opt && styles.optionChipTextActive,
                              ]}
                            >
                              {opt}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  ) : null}
                </View>

                {/* Date overrides */}
                <View style={styles.overridesCard}>
                  <View style={styles.overridesHeader}>
                    <View style={styles.settingsHeaderLeft}>
                      <Ionicons name="calendar-outline" size={18} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.settingsTitle}>Customize Specific Dates</Text>
                    </View>
                    <Pressable style={styles.overridesOpenBtn} onPress={() => setOverridesOpen(true)}>
                      <Text style={styles.overridesOpenText}>Open</Text>
                      <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.85)" />
                    </Pressable>
                  </View>
                  <Text style={styles.overridesSub}>
                    Optional. Add one-time changes like holidays, extra hours, or a day off.
                  </Text>
                  {Object.keys(dateOverrides).length === 0 ? (
                    <Text style={styles.overridesEmpty}>No custom date overrides yet.</Text>
                  ) : (
                    <Text style={styles.overridesEmpty}>
                      {Object.keys(dateOverrides).length} override{Object.keys(dateOverrides).length === 1 ? "" : "s"} added.
                    </Text>
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
        </>
      </AppGradientBackground>

      <View style={[styles.stickyFooter, { paddingBottom: bottom + 12 }]}>
        <Pressable
          style={[styles.saveButton, isSettingAvailability && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={isSettingAvailability}
        >
          {isSettingAvailability ? (
            <ActivityIndicator color="#1E3A6F" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={18} color="#1E3A6F" />
              <Text style={styles.saveButtonText}>Save Availability</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Preview / review modal */}
      <Modal
        visible={reviewOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setReviewOpen(false)}
      >
        <View style={styles.reviewOverlay}>
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewTitle}>Your availability</Text>
              <Pressable onPress={() => setReviewOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color="rgba(255,255,255,0.9)" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {routinePreview.map((d) => (
                <View key={d.key} style={styles.reviewRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.reviewDay}>{d.label}</Text>
                    {d.enabled ? (
                      <View style={styles.reviewSlotsWrap}>
                        {d.slots.map((s) => (
                          <View key={s.id} style={styles.reviewSlotChip}>
                            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.85)" />
                            <Text style={styles.reviewSlotText}>{s.start}–{s.end}</Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.reviewUnavailable}>Unavailable</Text>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>

            <Pressable style={styles.reviewDoneBtn} onPress={() => setReviewOpen(false)}>
              <Text style={styles.reviewDoneText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Overrides calendar modal */}
      <Modal
        visible={overridesOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setOverridesOpen(false)}
      >
        <View style={styles.reviewOverlay}>
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewTitle}>Customize specific dates</Text>
              <Pressable onPress={() => setOverridesOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color="rgba(255,255,255,0.9)" />
              </Pressable>
            </View>
            <GradientCalendar
              selected={selectedOverrideDate ?? format(new Date(), "yyyy-MM-dd")}
              setSelected={(ymd) => setSelectedOverrideDate(ymd)}
              onMonthChange={(m, y) => setMonthYear({ month: m, year: y })}
              showHeader={false}
              disablePastDates={false}
              markToday={true}
              availableDates={overrideAvailableDates}
              unavailableDates={overrideUnavailableDates}
            />
            <View style={styles.overrideOldFlowCard}>
              <View style={styles.overrideOldFlowHeader}>
                <Text style={styles.overrideOldFlowTitle}>Available Hours</Text>
                {selectedOverrideDate ? (
                  <Text style={styles.overrideOldFlowDate}>{selectedOverrideDate}</Text>
                ) : null}
              </View>

              {!selectedOverrideDate ? (
                <Text style={styles.overrideOldFlowHint}>Select a date above to customize it.</Text>
              ) : (
                <>
                  <View style={styles.overrideActionRow}>
                    <Pressable
                      style={styles.quickActionPill}
                      onPress={() => {
                        setDateOverrides((prev) => ({
                          ...prev,
                          [selectedOverrideDate]: { mode: "unavailable", slots: [] },
                        }));
                      }}
                    >
                      <Ionicons name="ban-outline" size={14} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.quickActionText}>Mark Unavailable</Text>
                    </Pressable>
                    <Pressable
                      style={styles.quickActionPill}
                      onPress={() => {
                        setDateOverrides((prev) => {
                          const next = { ...prev };
                          delete next[selectedOverrideDate];
                          return next;
                        });
                      }}
                    >
                      <Ionicons name="refresh-outline" size={14} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.quickActionText}>Reset to Weekly</Text>
                    </Pressable>
                  </View>

                  {(() => {
                    const view = getOverrideEditorSlots(selectedOverrideDate);
                    if (view.mode === "unavailable") {
                      return <Text style={styles.overrideOldFlowHint}>This date is unavailable.</Text>;
                    }
                    return (
                      <View style={{ gap: 10 }}>
                        {view.slots.map((slot) => (
                          <View key={slot.id} style={styles.slotRow}>
                            <Pressable
                              style={styles.timeChip}
                              onPress={() => {
                                setShowOverrideTimePicker(true);
                                setSelectedOverrideSlot({
                                  ymd: selectedOverrideDate,
                                  slotId: slot.id,
                                  field: "start",
                                });
                              }}
                            >
                              <Text style={styles.timeChipText}>{slot.start}</Text>
                              <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.85)" />
                            </Pressable>
                            <Text style={styles.toText}>to</Text>
                            <Pressable
                              style={styles.timeChip}
                              onPress={() => {
                                setShowOverrideTimePicker(true);
                                setSelectedOverrideSlot({
                                  ymd: selectedOverrideDate,
                                  slotId: slot.id,
                                  field: "end",
                                });
                              }}
                            >
                              <Text style={styles.timeChipText}>{slot.end}</Text>
                              <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.85)" />
                            </Pressable>
                            <Pressable
                              style={styles.removeBtn}
                              onPress={() =>
                                setDateOverrides((prev) => {
                                  const current = prev[selectedOverrideDate] ?? { mode: "custom" as const, slots: view.slots };
                                  const nextSlots = current.slots.filter((s) => s.id !== slot.id);
                                  return {
                                    ...prev,
                                    [selectedOverrideDate]: {
                                      mode: nextSlots.length ? "custom" : "unavailable",
                                      slots: nextSlots,
                                    },
                                  };
                                })
                              }
                              hitSlop={10}
                            >
                              <Ionicons name="close" size={16} color="rgba(255,107,107,0.95)" />
                            </Pressable>
                          </View>
                        ))}

                        <Pressable
                          style={styles.addSlotInline}
                          onPress={() => {
                            setDateOverrides((prev) => {
                              const current = prev[selectedOverrideDate];
                              const baseSlots =
                                current?.mode === "custom"
                                  ? current.slots
                                  : view.slots;
                              return {
                                ...prev,
                                [selectedOverrideDate]: {
                                  mode: "custom",
                                  slots: [...baseSlots, { id: `${Date.now()}`, ...DEFAULT_SLOT }],
                                },
                              };
                            });
                          }}
                        >
                          <Ionicons name="add" size={16} color="#FDE68A" />
                          <Text style={styles.addSlotInlineText}>+ Add</Text>
                        </Pressable>
                      </View>
                    );
                  })()}
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Override time picker (old list modal) */}
      <Modal
        visible={showOverrideTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowOverrideTimePicker(false);
          setSelectedOverrideSlot(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Times</Text>
              <Pressable
                onPress={() => {
                  setShowOverrideTimePicker(false);
                  setSelectedOverrideSlot(null);
                }}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </Pressable>
            </View>
            <ScrollView style={styles.timePickerList}>
              {TIME_OPTIONS.map((time) => (
                <Pressable
                  key={time}
                  style={styles.timePickerOption}
                  onPress={() => {
                    if (!selectedOverrideSlot) return;
                    const { ymd, slotId, field } = selectedOverrideSlot;
                    setDateOverrides((prev) => {
                      const current = prev[ymd];
                      const base = current?.mode === "custom"
                        ? current.slots
                        : getWeeklyDefaultSlotsForDate(ymd);
                      const nextSlots = (current?.mode === "custom" ? base : base).map((s) =>
                        s.id === slotId ? { ...s, [field]: time } : s,
                      );
                      return {
                        ...prev,
                        [ymd]: { mode: "custom", slots: nextSlots },
                      };
                    });
                    setShowOverrideTimePicker(false);
                    setSelectedOverrideSlot(null);
                  }}
                >
                  <Text style={styles.timePickerOptionText}>{time}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Tab Container
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
  },
  activeTabText: {
    color: "#1E3A6F",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  // Hero
  heroHeader: { marginBottom: 14 },
  heroTitleRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  heroIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  heroTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  heroSub: { marginTop: 3, color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 18 },

  loadingBlock: { paddingVertical: 18, alignItems: "center", gap: 10 },
  loadingText: { color: "rgba(255,255,255,0.8)", fontWeight: "600" },

  emptyStateCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  emptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { color: "#FFFFFF", fontSize: 15.5, fontWeight: "800" },
  emptySub: { color: "rgba(255,255,255,0.72)", fontSize: 13, lineHeight: 18 },
  primaryCta: {
    marginTop: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryCtaText: { color: "#0E2A47", fontWeight: "900", fontSize: 14 },

  routineList: { gap: 10 },
  quickActionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickActionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  quickActionPillDanger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.28)",
  },
  quickActionText: { color: "rgba(255,255,255,0.9)", fontWeight: "900", fontSize: 12.5 },
  dayCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    overflow: "hidden",
  },
  dayCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dayName: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  daySummary: { marginTop: 3, color: "rgba(255,255,255,0.72)", fontSize: 12.5, fontWeight: "700" },
  dayUnavailable: { marginTop: 3, color: "rgba(255,255,255,0.55)", fontSize: 12.5, fontWeight: "700" },

  togglePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  togglePillOn: { backgroundColor: "rgba(255,255,255,0.16)" },
  toggleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  toggleDotOn: { backgroundColor: "#22C55E" },
  toggleText: { color: "rgba(255,255,255,0.75)", fontWeight: "900", fontSize: 12 },
  toggleTextOn: { color: "rgba(255,255,255,0.92)" },

  dayCardBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.10)",
    gap: 10,
  },
  copyPrevRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 2 },
  copyPrevText: { color: "rgba(255,255,255,0.78)", fontWeight: "900", fontSize: 12.5 },
  inlineHint: { color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 18 },
  slotRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  timeChip: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  timeChipText: { color: "#FFFFFF", fontWeight: "900", fontSize: 13.5 },
  toText: { color: "rgba(255,255,255,0.72)", fontWeight: "800", fontSize: 12 },
  removeBtn: {
    width: 32,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  addSlotInline: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  addSlotInlineText: { color: "#FDE68A", fontWeight: "900", fontSize: 13 },

  inlinePickerWrap: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    overflow: "hidden",
  },
  inlinePickerHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.10)",
  },
  inlinePickerTitle: { color: "rgba(255,255,255,0.9)", fontWeight: "900", fontSize: 13 },
  inlinePickerDone: { color: "#FDE68A", fontWeight: "900", fontSize: 13 },

  settingsCard: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    overflow: "hidden",
  },
  settingsHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingsHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  settingsTitle: { color: "#FFFFFF", fontSize: 14.5, fontWeight: "900" },
  settingsBody: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 4 },
  fieldLabel: { color: "rgba(255,255,255,0.75)", fontWeight: "900", fontSize: 12, letterSpacing: 0.2 },
  inlineOptionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  optionChipActive: { backgroundColor: "#FFFFFF", borderColor: "rgba(255,255,255,0.75)" },
  optionChipText: { color: "rgba(255,255,255,0.85)", fontWeight: "900", fontSize: 12.5 },
  optionChipTextActive: { color: "#0E2A47" },

  stickyFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(18, 56, 106, 0.55)",
  },
  saveButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonText: { color: "#1E3A6F", fontSize: 15, fontWeight: "900" },

  // Review modal
  reviewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  reviewCard: {
    backgroundColor: "rgba(30,58,95,0.96)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    padding: 14,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  reviewTitle: { color: "#FFFFFF", fontWeight: "900", fontSize: 16 },
  reviewRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.10)",
  },
  reviewDay: { color: "rgba(255,255,255,0.92)", fontWeight: "900", fontSize: 14 },
  reviewUnavailable: { marginTop: 4, color: "rgba(255,255,255,0.60)", fontWeight: "700" },
  reviewSlotsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  reviewSlotChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  reviewSlotText: { color: "rgba(255,255,255,0.92)", fontWeight: "800", fontSize: 12.5 },
  reviewDoneBtn: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  reviewDoneText: { color: "#0E2A47", fontWeight: "900", fontSize: 14.5 },

  // Overrides section
  overridesCard: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  overridesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  overridesOpenBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  overridesOpenText: { color: "rgba(255,255,255,0.88)", fontWeight: "900" },
  overridesSub: { color: "rgba(255,255,255,0.70)", fontSize: 13, lineHeight: 18 },
  overridesEmpty: { color: "rgba(255,255,255,0.62)", fontWeight: "700", fontSize: 12.5 },
  overridesLegend: { color: "rgba(255,255,255,0.70)", fontWeight: "700", fontSize: 12.5 },
  overrideActionRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 10 },
  overrideStatusText: { color: "rgba(255,255,255,0.78)", fontWeight: "800", marginTop: 6 },

  // Overrides old flow block (calendar + hours)
  overrideOldFlowCard: {
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    padding: 14,
  },
  overrideOldFlowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  overrideOldFlowTitle: { color: "#FFFFFF", fontWeight: "900", fontSize: 14.5 },
  overrideOldFlowDate: { color: "rgba(255,255,255,0.75)", fontWeight: "800", fontSize: 12.5 },
  overrideOldFlowHint: { color: "rgba(255,255,255,0.72)", fontWeight: "700", fontSize: 13, lineHeight: 18 },

  // Old time-picker modal styles (reused for overrides)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.darkBlueGradientOne,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  timePickerList: {
    maxHeight: 300,
  },
  timePickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  timePickerOptionText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});

export default AvailabilityScreen;
