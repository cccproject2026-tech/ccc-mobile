import GradientCalendar from "@/components/atom/calendar"
import {
  formatTimeSlot,
  mergeMonthlyAvailabilityWithWeeklySlotDates,
  useMonthlyAvailability,
  useWeeklyAvailability,
} from "@/hooks/mentors/useMentorsAvailability"
import { useAuthStore } from "@/stores"
import { AppointmentPlatform, TimeSlot } from "@/types/appointment.types"
import { Mentee } from "@/types/mentee.types"
import { Ionicons } from "@expo/vector-icons"
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet"
import { LinearGradient } from "expo-linear-gradient"
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export interface ScheduleMeetingBottomSheetRef {
  present: () => void
  dismiss: () => void
}

interface ScheduleMeetingBottomSheetProps {
  mentee: Mentee | null
  onClose?: () => void
  onSchedule?: (data: {
    selectedDate: string
    selectedSlot: TimeSlot
    optionId: string
    platform: AppointmentPlatform
  }) => void
  onSetAvailabilityPress?: () => void
}

const ScheduleMeetingBottomSheet = forwardRef<ScheduleMeetingBottomSheetRef, ScheduleMeetingBottomSheetProps>(
  ({ mentee, onClose, onSchedule, onSetAvailabilityPress }, ref) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null)
    const { bottom } = useSafeAreaInsets()
    const { user } = useAuthStore()
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const now = new Date()
    const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1)
    const [currentYear, setCurrentYear] = useState(now.getFullYear())
    const [selectedDate, setSelectedDate] = useState<string>("")
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [showMeetingOptions, setShowMeetingOptions] = useState(false)

    const {
      availability,
      isLoading: isLoadingAvailability,
    } = useMonthlyAvailability(
      {
        mentorId: user?.id ?? null,
        month: currentMonth,
        year: currentYear,
        role: "mentor",
      },
      { enabled: !!user?.id && isSheetOpen, allowDefaultForMentee: false },
    )

    const { weeklySlots, isLoading: isLoadingWeekly } = useWeeklyAvailability(
      user?.id ?? null,
      { enabled: !!user?.id && isSheetOpen, role: "mentor" },
    )

    const generatedMonthlyFromWeeklyPattern = useMemo(() => {
      if (!weeklySlots?.length) return []

      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
      const byDayOfWeek = new Map<number, TimeSlot[]>()

      weeklySlots.forEach((ws: any) => {
        const dayNum =
          typeof ws?.day === "number"
            ? ws.day
            : typeof ws?.date === "string"
              ? new Date(ws.date).getDay()
              : null
        if (dayNum === null || Number.isNaN(dayNum)) return

        const slotsCandidate = ws?.rawSlots ?? ws?.slots
        const slots = Array.isArray(slotsCandidate) ? slotsCandidate : []
        if (slots.length === 0) return

        byDayOfWeek.set(dayNum, slots)
      })

      if (byDayOfWeek.size === 0) return []

      const out: any[] = []
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(currentYear, currentMonth - 1, day)
        const dow = d.getDay()
        const slots = byDayOfWeek.get(dow)
        if (!slots || slots.length === 0) continue

        const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`
        out.push({
          date: dateStr,
          day: dow,
          rawSlots: slots,
          slots,
        })
      }

      return out
    }, [weeklySlots, currentMonth, currentYear])

    const mergedMonthlyAndWeekly = useMemo(
      () =>
        mergeMonthlyAvailabilityWithWeeklySlotDates(
          currentMonth,
          currentYear,
          availability,
          weeklySlots,
        ),
      [availability, weeklySlots, currentMonth, currentYear],
    )

    const effectiveAvailability = useMemo(() => {
      if (mergedMonthlyAndWeekly.length > 0) return mergedMonthlyAndWeekly
      return generatedMonthlyFromWeeklyPattern
    }, [mergedMonthlyAndWeekly, generatedMonthlyFromWeeklyPattern])

    const availableDates = useMemo(() => {
      if (!effectiveAvailability?.length) return []
      return effectiveAvailability
        .filter((day) => {
          const slots = (day as any).rawSlots ?? day.slots
          return (slots?.length ?? 0) > 0
        })
        .map((day) => {
          const d = day.date
          return typeof d === "string" && d.includes("T") ? d.split("T")[0] : d
        })
    }, [effectiveAvailability])

    const hasAnyAvailability = availableDates.length > 0

    const selectedDateAvailability = useMemo(() => {
      if (!selectedDate || !effectiveAvailability?.length) return null
      const day = effectiveAvailability.find((dayItem: any) => {
        const d = dayItem.date
        const dateStr = typeof d === "string" && d.includes("T") ? d.split("T")[0] : d
        return dateStr === selectedDate
      })
      return day ?? null
    }, [effectiveAvailability, selectedDate])

    const availableSlots: TimeSlot[] = useMemo(() => {
      if (!selectedDateAvailability) return []
      const raw = (selectedDateAvailability as any).rawSlots ?? selectedDateAvailability.slots
      return Array.isArray(raw) ? raw : []
    }, [selectedDateAvailability])

    const snapPoints = useMemo(() => ["90%"], [])

    useImperativeHandle(ref, () => ({
      present: () => {
        
        setSelectedDate("")
        setSelectedTime(null)
        setSelectedSlot(null)
        setSelectedOption(null)
        setShowMeetingOptions(false)
        bottomSheetRef.current?.present()
      },
      dismiss: () => bottomSheetRef.current?.dismiss(),
    }))

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.7}
          pressBehavior="close"
        />
      ),
      []
    )

    const handleDismiss = () => {
      setSelectedDate("")
      setSelectedTime(null)
      setSelectedSlot(null)
      setSelectedOption(null)
      setShowMeetingOptions(false)
      onClose?.()
    }

    const meetingOptions = [
      { id: "zoom", label: "Zoom Meeting", icon: "videocam" },
      { id: "google-meet", label: "Google Meet", icon: "logo-google" },
      { id: "teams", label: "Microsoft Teams", icon: "people" },
      { id: "in-person", label: "In Person", icon: "person" },
    ]

    const handleSchedule = () => {
      if (!onSchedule || !selectedDate || !selectedOption) return
      if (!hasAnyAvailability) {
        Alert.alert(
          "Set Availability First",
          "You don’t have any availability set yet. Please set your availability, then schedule a meeting.",
        )
        return
      }
      if (!selectedDateAvailability) {
        Alert.alert(
          "Invalid Date",
          "No availability for selected date.",
        )
        return
      }
      const isValidSlot =
        selectedSlot &&
        availableSlots.some(
          (s) =>
            s.startTime === selectedSlot.startTime &&
            s.startPeriod === selectedSlot.startPeriod,
        )
      if (!isValidSlot) {
        Alert.alert(
          "Invalid Time",
          "Selected time is not available.",
        )
        return
      }
      if (!selectedSlot) return
      const platformMap: Record<string, AppointmentPlatform> = {
        zoom: "zoom",
        "google-meet": "google_meet",
        teams: "teams",
        "in-person": "in_person",
      }
      const platform = platformMap[selectedOption.toLowerCase()] ?? "zoom"

      onSchedule({
        selectedDate,
        selectedSlot,
        optionId: selectedOption,
        platform,
      })
      bottomSheetRef.current?.dismiss()
    }

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundComponent={() => null}
        handleIndicatorStyle={styles.handleIndicator}
        onChange={(index) => setIsSheetOpen(index >= 0)}
        onDismiss={handleDismiss}
        android_keyboardInputMode="adjustResize"
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <LinearGradient
          colors={["#1A2B5C", "#2B3E7E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.sheetGradient, { paddingBottom: bottom }]}
        >
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Ionicons name="calendar" size={28} color="#FFFFFF" />
                <Text style={styles.headerTitle}>Schedule Meeting</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => bottomSheetRef.current?.dismiss()}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {}
            <View style={styles.section}>
              {isLoadingAvailability ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.loadingText}>Loading availability…</Text>
                </View>
              ) : null}
              {!isLoadingAvailability && !hasAnyAvailability ? (
                <View style={styles.warningBox}>
                  <Ionicons name="alert-circle-outline" size={18} color="#FFD166" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.warningText}>
                      No availability set. Please set your availability first to enable scheduling.
                    </Text>
                    {onSetAvailabilityPress ? (
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={onSetAvailabilityPress}
                        style={styles.setAvailabilityButton}
                      >
                        <Text style={styles.setAvailabilityButtonText}>Set availability</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              ) : null}
              <GradientCalendar
                selected={selectedDate}
                setSelected={(dateStr) => {
                  setSelectedDate(dateStr)
                  setSelectedTime(null)
                  setSelectedSlot(null)
                }}
                showHeader={true}
                disablePastDates={true}
                markToday={true}
                // While loading, pass [] so users can't select random dates.
                
                availableDates={
                  isLoadingAvailability || isLoadingWeekly ? [] : availableDates
                }
                onMonthChange={(month, year) => {
                  setCurrentMonth(month)
                  setCurrentYear(year)
                }}
                gradientColors={["#176192", "#1D548D", "#0d2847"]}
              />
            </View>

            {}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose a Time</Text>
              {selectedDate ? (
                availableSlots.length === 0 ? (
                  <Text style={styles.noSlotsText}>
                    No slots available for this date.
                  </Text>
                ) : (
                  <View style={styles.timeGrid}>
                    {availableSlots.map((slot) => {
                      const label = formatTimeSlot(slot)
                      const isSelected =
                        selectedSlot?.startTime === slot.startTime &&
                        selectedSlot?.startPeriod === slot.startPeriod
                      return (
                        <TouchableOpacity
                          key={slot._id ?? label}
                          style={[
                            styles.timeSlot,
                            isSelected && styles.selectedTimeSlot,
                          ]}
                          onPress={() => {
                            setSelectedSlot(slot)
                            setSelectedTime(label)
                          }}
                        >
                          <Text
                            style={[
                              styles.timeText,
                              isSelected && styles.selectedTimeText,
                            ]}
                          >
                            {label}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                )
              ) : (
                <Text style={styles.noSlotsText}>
                  Select a date first.
                </Text>
              )}
            </View>

            {}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => setShowMeetingOptions(!showMeetingOptions)}
              >
                <Text style={styles.dropdownText}>
                  {selectedOption
                    ? meetingOptions.find((opt) => opt.id === selectedOption)
                        ?.label
                    : "Choose your meeting option"}
                </Text>
                <Ionicons
                  name={showMeetingOptions ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              {showMeetingOptions && (
                <View style={styles.dropdownMenu}>
                  {meetingOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.dropdownItem,
                        selectedOption === option.id &&
                          styles.selectedDropdownItem,
                      ]}
                      onPress={() => {
                        setSelectedOption(option.id)
                        setShowMeetingOptions(false)
                      }}
                    >
                      <Ionicons
                        name={option.icon as any}
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.dropdownItemText}>
                        {option.label}
                      </Text>
                      {selectedOption === option.id && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color="#4CAF50"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
              {}

            {}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => bottomSheetRef.current?.dismiss()}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.scheduleButton,
                  (!hasAnyAvailability ||
                    !selectedDate ||
                    !selectedSlot ||
                    !selectedOption) &&
                    styles.disabledButton,
                ]}
                onPress={handleSchedule}
                disabled={!hasAnyAvailability || !selectedDate || !selectedSlot || !selectedOption}
              >
                <Text style={styles.scheduleButtonText}>Schedule</Text>
              </TouchableOpacity>
            </View>
            {}
            {}
          </BottomSheetScrollView>
            {}
        </LinearGradient>
      </BottomSheetModal>
    )
  }
)

export default ScheduleMeetingBottomSheet

const styles = StyleSheet.create({
  handleIndicator: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: 40,
    height: 4,
  },
  sheetGradient: {
  
    paddingTop: 20,
      },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: 24,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  loadingText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 209, 102, 0.35)",
    backgroundColor: "rgba(255, 209, 102, 0.12)",
    marginBottom: 12,
  },
  warningText: {
    flex: 1,
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  setAvailabilityButton: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  setAvailabilityButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  noSlotsText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontStyle: "italic",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  timeSlot: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(30, 50, 90, 0.4)",
  },
  selectedTimeSlot: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  timeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  selectedTimeText: {
    color: "#1A2B5C",
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(30, 50, 90, 0.4)",
  },
  dropdownText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  dropdownMenu: {
    marginTop: 12,
    backgroundColor: "rgba(30, 50, 90, 0.8)",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  selectedDropdownItem: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
  },
  dropdownItemText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#4A90E2",
    fontSize: 16,
    fontWeight: "700",
  },
  scheduleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#4A5D9E",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "rgba(74, 93, 158, 0.4)",
  },
  scheduleButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
})

