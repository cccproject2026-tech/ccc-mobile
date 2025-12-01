import GradientCalendar from "@/components/atom/calendar"
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
  onSchedule?: (date: Date, time: string, option: string) => void
}

const ScheduleMeetingBottomSheet = forwardRef<ScheduleMeetingBottomSheetRef, ScheduleMeetingBottomSheetProps>(
  ({ mentee, onClose, onSchedule }, ref) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null)
    const { bottom } = useSafeAreaInsets()
    const [selectedDate, setSelectedDate] = useState<string>("")
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [showMeetingOptions, setShowMeetingOptions] = useState(false)

    const snapPoints = useMemo(() => ["90%"], [])

    useImperativeHandle(ref, () => ({
      present: () => bottomSheetRef.current?.present(),
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
      setSelectedOption(null)
      setShowMeetingOptions(false)
      onClose?.()
    }

    const timeSlots = [
      "09:00 am - 10:00 am",
      "11:00 am - 12:00 pm",
      "01:00 pm - 02:00 pm",
      "03:00 pm - 04:00 pm",
    ]

    const meetingOptions = [
      { id: "zoom", label: "Zoom Meeting", icon: "videocam" },
      { id: "google-meet", label: "Google Meet", icon: "logo-google" },
      { id: "teams", label: "Microsoft Teams", icon: "people" },
      { id: "in-person", label: "In Person", icon: "person" },
    ]

    const handleSchedule = () => {
      if (selectedDate && selectedTime && selectedOption && onSchedule) {
        const date = new Date(selectedDate)
        onSchedule(date, selectedTime, selectedOption)
      }
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
            {/* Header */}
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

            {/* Date Picker using GradientCalendar */}
            <View style={styles.section}>
              <GradientCalendar
                selected={selectedDate}
                setSelected={setSelectedDate}
                showHeader={true}
                disablePastDates={true}
                markToday={true}
                gradientColors={["#176192", "#1D548D", "#0d2847"]}
              />
            </View>

            {/* Time Picker */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose a Time</Text>
              <View style={styles.timeGrid}>
                {timeSlots.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      selectedTime === time && styles.selectedTimeSlot,
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text
                      style={[
                        styles.timeText,
                        selectedTime === time && styles.selectedTimeText,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Meeting Option Dropdown */}
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

            {/* Action Buttons */}
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
                  (!selectedDate || !selectedTime || !selectedOption) &&
                    styles.disabledButton,
                ]}
                onPress={handleSchedule}
                disabled={!selectedDate || !selectedTime || !selectedOption}
              >
                <Text style={styles.scheduleButtonText}>Schedule</Text>
              </TouchableOpacity>
            </View>
          </BottomSheetScrollView>
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
    flex: 1,
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

