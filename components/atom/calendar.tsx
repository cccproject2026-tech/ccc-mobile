import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
  ColorValue,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";

export interface RecurringAvailability {
  type: "weekly" | "monthly" | "custom";
  daysOfWeek?: number[];
  daysOfMonth?: number[];
  customCheck?: (date: string) => boolean;
}

interface GradientCalendarProps {
  selected: string;
  setSelected: (date: string) => void;
  onMonthChange?: (month: number, year: number) => void;
  containerStyle?: ViewStyle;
  headerTextStyle?: TextStyle;
  gradientColors?: string[];

  availableDates?: string[];
  unavailableDates?: string[];
  recurringAvailability?: RecurringAvailability;

  disablePastDates?: boolean;
  showHeader?: boolean;
  minDate?: string;
  maxDate?: string;

  markToday?: boolean;
  headerText?: string;
}

/* ============================= */
/* ✅ SAFE DATE HELPERS (ADDED)  */
/* ============================= */

const isValidDate = (date: Date) =>
  date instanceof Date && !isNaN(date.getTime());

const safeParseDate = (value?: string | Date) => {
  if (!value) return new Date();
  const date = value instanceof Date ? value : new Date(value);
  return isValidDate(date) ? date : new Date();
};

const formatDate = (date: Date) => {
  if (!isValidDate(date)) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Local calendar day string — avoids UTC pitfalls of parsing ISO dates for Y-M-D. */
const parseLocalYmdToDate = (ymd: string): Date => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return new Date();
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10) - 1;
  const d = parseInt(m[3], 10);
  const dt = new Date(y, mo, d);
  return isValidDate(dt) ? dt : new Date();
};

const YMD_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/* ============================= */

const GradientCalendar: React.FC<GradientCalendarProps> = ({
  selected,
  setSelected,
  onMonthChange,
  containerStyle,
  gradientColors = ["#176192", "#1D548D", "#0d2847"],
  availableDates,
  unavailableDates = [],
  recurringAvailability,
  disablePastDates = true,
  showHeader = true,
  minDate,
  maxDate,
  markToday = true,
  headerText = "Select Available Date",
  headerTextStyle,
}) => {
  /* ✅ FIXED INITIAL STATE */
  const [currentMonth, setCurrentMonth] = useState<Date>(() =>
    selected && YMD_PATTERN.test(selected.trim())
      ? parseLocalYmdToDate(selected.trim())
      : new Date(),
  );

  /* ✅ FIXED TODAY (no timezone bug) */
  const today = formatDate(new Date());

  /* ============================= */
  /* Sync visible month when user selects a day — NOT when selection is cleared */
  /* ============================= */
  /* Clearing selected (e.g. "") used safeParseDate → today and jumped the grid back */
  /* to the current month while the user had already navigated forward — looked like */
  /* “next goes to May” and every day disabled. Only react to real YYYY-MM-DD picks. */

  useEffect(() => {
    const ymd = typeof selected === "string" ? selected.trim() : "";
    if (!ymd || !YMD_PATTERN.test(ymd)) return;
    setCurrentMonth(parseLocalYmdToDate(ymd));
  }, [selected]);

  /* ============================= */
  /* Date enabling: when availableDates is provided, use ONLY availableDates.includes(dateStr).
   * No filtering by current month/year — any date in availableDates is enabled. */
  /* ============================= */

  const isDateAvailable = (dateStr: string): boolean => {
    if (unavailableDates.includes(dateStr)) return false;

    if (disablePastDates && dateStr < today) return false;

    // When availableDates is provided, ONLY those dates are enabled.
    // (If it's an empty array, that means no availability → disable all.)
    if (availableDates) {
      return availableDates.includes(dateStr);
    }

    if (recurringAvailability) {
      const date = safeParseDate(dateStr);

      if (
        recurringAvailability.type === "weekly" &&
        recurringAvailability.daysOfWeek
      ) {
        return recurringAvailability.daysOfWeek.includes(date.getDay());
      }

      if (
        recurringAvailability.type === "monthly" &&
        recurringAvailability.daysOfMonth
      ) {
        return recurringAvailability.daysOfMonth.includes(date.getDate());
      }

      if (
        recurringAvailability.type === "custom" &&
        recurringAvailability.customCheck
      ) {
        return recurringAvailability.customCheck(dateStr);
      }
    }

    return true;
  };

  const handleDayPress = (day: DateData): void => {
    if (isDateAvailable(day.dateString)) {
      setSelected(day.dateString);
    }
  };

  /* ============================= */
  /* ✅ SAFE MONTH NAVIGATION */
  /* ============================= */

  const handlePrevMonth = () => {
    const safePrev = safeParseDate(currentMonth);
    const newDate = new Date(safePrev);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
    onMonthChange?.(newDate.getMonth() + 1, newDate.getFullYear());
  };

  const handleNextMonth = () => {
    const safePrev = safeParseDate(currentMonth);
    const newDate = new Date(safePrev);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
    onMonthChange?.(newDate.getMonth() + 1, newDate.getFullYear());
  };

  let monthYearString = currentMonth.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  /* ============================= */
  /* ✅ FIXED MARKED DATES */
  /* ============================= */

  const markedDates = useMemo(() => {
    const marked: any = {};

    const safeMonth = safeParseDate(currentMonth);
    const year = safeMonth.getFullYear();
    /** 0–11, same as JS Date */
    const month = safeMonth.getMonth();

    // Full visible grid for this month: Sunday before/on the 1st → Saturday after last day.
    // (Previous code used `month - 1` for the start day, which shifted marking one month early
    // and broke January / month boundaries — availability dots looked wrong after changing month.)
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    const startDate = new Date(firstOfMonth);
    startDate.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());
    const endDate = new Date(lastOfMonth);
    endDate.setDate(lastOfMonth.getDate() + (6 - lastOfMonth.getDay()));

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      /* ✅ REPLACED toISOString() */
      const dateStr = formatDate(currentDate);
      const isAvailable = isDateAvailable(dateStr);

      marked[dateStr] = {
        disabled: !isAvailable,
        disableTouchEvent: !isAvailable,
        customStyles: {
          container: {},
          text: {
            color: isAvailable ? "#fff" : "rgba(255,255,255,0.3)",
            fontWeight: isAvailable ? "500" : "400",
          },
        },
      };

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (markToday && marked[today]) {
      marked[today] = {
        ...marked[today],
        marked: true,
        dotColor: "#FF4444",
        customStyles: {
          ...marked[today].customStyles,
          container: {
            ...marked[today].customStyles?.container,
          },
          text: {
            ...marked[today].customStyles?.text,
            fontWeight: "600",
          },
        },
      };
    }

    if (selected && marked[selected] && isDateAvailable(selected)) {
      marked[selected] = {
        ...marked[selected],
        customStyles: {
          container: {
            borderWidth: 2,
            borderColor: "#fff",
            borderRadius: 50,
            backgroundColor: "transparent",
          },
          text: {
            color: "#fff",
            fontWeight: "700",
          },
        },
      };
    }

    return marked;
  }, [
    currentMonth,
    selected,
    today,
    availableDates,
    unavailableDates,
    recurringAvailability,
    disablePastDates,
    markToday,
  ]);

  /** Local calendar day — never use toISOString() here (UTC shifts can show the wrong month). */
  const calendarDayString = formatDate(safeParseDate(currentMonth));

  return (
    <View style={containerStyle}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={[styles.headerTitle,headerTextStyle?headerTextStyle:{}]}>{headerText}</Text>
        </View>
      )}

      <LinearGradient
        colors={gradientColors as [ColorValue, ColorValue, ...ColorValue[]]}
        style={styles.container}
      >
        <View style={styles.monthHeader}>
          <Pressable
            onPress={handlePrevMonth}
            hitSlop={12}
            style={styles.navButton}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>

          <Text style={styles.monthText}>{monthYearString}</Text>

          <Pressable
            onPress={handleNextMonth}
            hitSlop={12}
            style={styles.navButton}
          >
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.calendarWrapper}>
          <Calendar
            key={calendarDayString}
            current={calendarDayString}
            onDayPress={handleDayPress}
            renderHeader={() => <View style={styles.hiddenMonthHeader} />}
            markingType="custom"
            markedDates={markedDates}
            minDate={minDate || (disablePastDates ? today : undefined)}
            maxDate={maxDate}
            theme={{
              backgroundColor: "transparent",
              calendarBackground: "transparent",
              textSectionTitleColor: "#fff",
              selectedDayBackgroundColor: "transparent",
              selectedDayTextColor: "#fff",
              todayTextColor: "#fff",
              dayTextColor: "#fff",
              textDisabledColor: "rgba(255,255,255,0.3)",
              textDayFontSize: 16,
              textDayFontWeight: "500",
              arrowColor: "transparent",
              monthTextColor: "transparent",
              // textMonthFontSize: 0,
            }}
            style={{ backgroundColor: "transparent" }}
            hideArrows={true}
            hideDayNames={false}
            hideExtraDays={true}
            disableMonthChange={true}
            enableSwipeMonths={false}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 0,
    borderColor: "transparent",
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
  },
  navButton: {
    padding: 4,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  calendarWrapper: {
    backgroundColor: "transparent",
  },
  hiddenMonthHeader: {
    height: 0,
    margin: 0,
    padding: 0,
  },
});

export default GradientCalendar;
