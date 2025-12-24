import GradientCalendar from "@/components/atom/calendar";
import SimpleSuccessModal from "@/components/atom/SimpleSuccessModal";
import { Header } from "@/components/build-components";
import SearchBar from "@/components/director/SearchBar";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { useSetAvailability } from "@/hooks/mentors/useMentorsAvailability";
import { useAuthStore } from "@/stores/auth.store";
import { SetAvailabilityPayload } from "@/types/appointment.types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
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

interface TimeSlot {
  id: string;
  start: string;
  end: string;
}

interface DayAvailability {
  enabled: boolean;
  slots: TimeSlot[];
}

interface WeeklyAvailability {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}

const AvailabilityScreen = () => {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [activeTab, setActiveTab] = useState<
    "appointments" | "availability"
  >("availability");

  // Reset active tab when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setActiveTab("availability");
    }, [])
  );

  // Weekly availability state
  const [weeklyAvailability, setWeeklyAvailability] =
    useState<WeeklyAvailability>({
      monday: {
        enabled: true,
        slots: [
          { id: "1", start: "10:00 AM", end: "03:00 PM" },
          { id: "2", start: "05:00 PM", end: "07:00 PM" },
        ],
      },
      tuesday: {
        enabled: true,
        slots: [{ id: "1", start: "10:00 AM", end: "07:00 PM" }],
      },
      wednesday: {
        enabled: true,
        slots: [{ id: "1", start: "10:00 AM", end: "07:00 PM" }],
      },
      thursday: {
        enabled: true,
        slots: [{ id: "1", start: "10:00 AM", end: "07:00 PM" }],
      },
      friday: {
        enabled: true,
        slots: [{ id: "1", start: "10:00 AM", end: "07:00 PM" }],
      },
      saturday: { enabled: false, slots: [] },
      sunday: { enabled: false, slots: [] },
    });

  // Meeting preferences state
  const [meetingDuration, setMeetingDuration] = useState("60 Minutes");
  const [maxBookingPerDay, setMaxBookingPerDay] = useState("5");
  const [minSchedulingNotice, setMinSchedulingNotice] =
    useState("2 Days");
  const [preferredMeetingOption, setPreferredMeetingOption] =
    useState("Zoom");

  // Dropdown states
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [showMaxBookingDropdown, setShowMaxBookingDropdown] =
    useState(false);
  const [showMinNoticeDropdown, setShowMinNoticeDropdown] =
    useState(false);
  const [showMeetingOptionDropdown, setShowMeetingOptionDropdown] =
    useState(false);

  // Time picker states
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    day: keyof WeeklyAvailability;
    slotId: string;
    field: "start" | "end";
  } | null>(null);

  const durationOptions = ["30 Minutes", "60 Minutes", "90 Minutes"];
  const maxBookingOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  const minNoticeOptions = ["Same day", "1 Day", "2 Days", "3 Days", "1 Week"];
  const meetingOptions = [
    "Zoom",
    "Google Meet",
    "Phone call",
    "Microsoft Teams",
    "WhatsApp",
  ];

  const timeOptions = [
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
  ];

  // API Integration
  const { setAvailabilityAsync, isSettingAvailability } = useSetAvailability({
    onSuccess: () => {
      setShowSuccessModal(true);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error.message || "Failed to set availability. Please try again."
      );
    },
  });

  const handleTabPress = (tab: "appointments" | "availability") => {
    setActiveTab(tab);
    if (tab === "appointments") {
      router.back();
    }
  };

  const toggleDayEnabled = (day: keyof WeeklyAvailability) => {
    setWeeklyAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const addTimeSlot = (day: keyof WeeklyAvailability) => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      start: "10:00 AM",
      end: "12:00 PM",
    };

    setWeeklyAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, newSlot],
      },
    }));
  };

  const removeTimeSlot = (day: keyof WeeklyAvailability, slotId: string) => {
    setWeeklyAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((slot) => slot.id !== slotId),
      },
    }));
  };

  const openTimePicker = (
    day: keyof WeeklyAvailability,
    slotId: string,
    field: "start" | "end"
  ) => {
    setSelectedTimeSlot({ day, slotId, field });
    setShowTimePicker(true);
  };

  const selectTime = (time: string) => {
    if (selectedTimeSlot) {
      updateTimeSlot(
        selectedTimeSlot.day,
        selectedTimeSlot.slotId,
        selectedTimeSlot.field,
        time
      );
    }
    setShowTimePicker(false);
    setSelectedTimeSlot(null);
  };

  const updateTimeSlot = (
    day: keyof WeeklyAvailability,
    slotId: string,
    field: "start" | "end",
    value: string
  ) => {
    setWeeklyAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot) =>
          slot.id === slotId ? { ...slot, [field]: value } : slot
        ),
      },
    }));
  };

  // Helper function to parse time from "10:00 AM" to { time: "10", period: "AM" }
  const parseTime = (timeString: string): { time: string; period: "AM" | "PM" } => {
    const [timePart, period] = timeString.split(" ");
    const [hour] = timePart.split(":");
    return {
      time: hour,
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

  // Helper function to get week dates starting from selected date
  const getWeekDates = (startDate: string): string[] => {
    const date = new Date(startDate);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Get Monday of the week
    const monday = new Date(date);
    monday.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);
      weekDates.push(currentDate.toISOString().split("T")[0]);
    }
    
    return weekDates;
  };

  // Helper function to map day name to day number (0 = Sunday, 1 = Monday, etc.)
  const getDayNumber = (dayName: keyof WeeklyAvailability): number => {
    const dayMap: Record<keyof WeeklyAvailability, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
    return dayMap[dayName];
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User ID not found. Please log in again.");
      return;
    }

    try {
      // Get week dates
      const weekDates = getWeekDates(selectedDate);

      // Transform UI state to API payload
      const weeklySlots: SetAvailabilityPayload["weeklySlots"] = [];

      const dayNames: (keyof WeeklyAvailability)[] = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];

      dayNames.forEach((dayName, index) => {
        const dayAvailability = weeklyAvailability[dayName];
        const dayNumber = getDayNumber(dayName);
        const date = weekDates[index];

        const slots = dayAvailability.enabled
          ? dayAvailability.slots.map((slot) => {
              const startTime = parseTime(slot.start);
              const endTime = parseTime(slot.end);

              return {
                startTime: startTime.time,
                startPeriod: startTime.period,
                endTime: endTime.time,
                endPeriod: endTime.period,
              };
            })
          : [];

        weeklySlots.push({
          day: dayNumber,
          date: date,
          slots: slots,
        });
      });

      const payload: SetAvailabilityPayload = {
        mentorId: user.id,
        weeklySlots: weeklySlots,
        meetingDuration: convertDurationToMinutes(meetingDuration),
        minSchedulingNoticeHours: convertNoticeToHours(minSchedulingNotice),
        maxBookingsPerDay: parseInt(maxBookingPerDay, 10),
      };

      await setAvailabilityAsync(payload);
    } catch (error) {
      console.error("Error submitting availability:", error);
      Alert.alert(
        "Error",
        "Failed to submit availability. Please try again."
      );
    }
  };

  const renderDropdown = (
    visible: boolean,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void,
    onClose: () => void
  ) => {
    if (!visible) return null;

    return (
      <View style={styles.dropdownOptions}>
        {options.map((option) => (
          <Pressable
            key={option}
            style={styles.dropdownOption}
            onPress={() => {
              onSelect(option);
              onClose();
            }}
          >
            <Text style={styles.dropdownOptionText}>{option}</Text>
            {selectedValue === option && (
              <Ionicons name="checkmark" size={16} color="#FFC107" />
            )}
          </Pressable>
        ))}
      </View>
    );
  };

  const dayNames = [
    { key: "monday" as keyof WeeklyAvailability, label: "Mon" },
    { key: "tuesday" as keyof WeeklyAvailability, label: "Tue" },
    { key: "wednesday" as keyof WeeklyAvailability, label: "Wed" },
    { key: "thursday" as keyof WeeklyAvailability, label: "Thu" },
    { key: "friday" as keyof WeeklyAvailability, label: "Fri" },
    { key: "saturday" as keyof WeeklyAvailability, label: "Sat" },
    { key: "sunday" as keyof WeeklyAvailability, label: "Sun" },
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <>
          <View style={{ paddingBottom: 10 }}>
            <TopBar role="mentor" />
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
              contentContainerStyle={{ paddingBottom: bottom + 20 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.contentContainer}>
                {/* Date Input */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>
                    Select Week Start Date
                  </Text>
                  <View style={styles.searchContainer}>
                    <SearchBar
                      backgroundColor="transparent"
                      value={selectedDate}
                      onChangeValue={setSelectedDate}
                      placeholder="Select a date"
                    />
                  </View>
                </View>

                {/* My Weekly Availability */}
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <Image
                      source={icons.calendarIcon}
                      style={{ width: 24, height: 24 }}
                    />
                    <Text style={styles.sectionTitle}>
                      My Weekly Availability
                    </Text>
                  </View>

                  <View style={styles.calendarContainer}>
                    <GradientCalendar
                      selected={selectedDate}
                      setSelected={setSelectedDate}
                      showHeader={true}
                      disablePastDates={false}
                      markToday={true}
                    />
                  </View>
                </View>

                {/* Available Hours */}
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Available Hours</Text>
                  </View>

                  <View style={styles.hoursContainer}>
                    {dayNames.map(({ key, label }) => (
                      <View key={key} style={styles.dayContainer}>
                        <View style={styles.dayHeader}>
                          <Pressable
                            style={styles.checkbox}
                            onPress={() => toggleDayEnabled(key)}
                          >
                            {weeklyAvailability[key].enabled && (
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color="#1E3A6F"
                              />
                            )}
                          </Pressable>
                          <Text style={styles.dayLabel}>{label}</Text>
                        </View>

                        {weeklyAvailability[key].enabled && (
                          <View style={styles.timeSlotsContainer}>
                            {weeklyAvailability[key].slots.map((slot) => (
                              <View key={slot.id} style={styles.timeSlotRow}>
                                <View style={styles.timeSlotInputs}>
                                  <Pressable
                                    style={styles.timeInput}
                                    onPress={() =>
                                      openTimePicker(key, slot.id, "start")
                                    }
                                  >
                                    <Text style={styles.timeInputText}>
                                      {slot.start}
                                    </Text>
                                    <Ionicons
                                      name="chevron-down"
                                      size={16}
                                      color="#FFFFFF"
                                    />
                                  </Pressable>
                                  <Text style={styles.timeSeparator}>to</Text>
                                  <Pressable
                                    style={styles.timeInput}
                                    onPress={() =>
                                      openTimePicker(key, slot.id, "end")
                                    }
                                  >
                                    <Text style={styles.timeInputText}>
                                      {slot.end}
                                    </Text>
                                    <Ionicons
                                      name="chevron-down"
                                      size={16}
                                      color="#FFFFFF"
                                    />
                                  </Pressable>
                                </View>
                                {weeklyAvailability[key].slots.length > 1 && (
                                  <Pressable
                                    style={styles.removeSlotButton}
                                    onPress={() => removeTimeSlot(key, slot.id)}
                                  >
                                    <Ionicons
                                      name="close"
                                      size={16}
                                      color="#FF6B6B"
                                    />
                                  </Pressable>
                                )}
                              </View>
                            ))}
                            <Pressable
                              style={styles.addSlotButton}
                              onPress={() => addTimeSlot(key)}
                            >
                              <Text style={styles.addSlotText}>+ Add</Text>
                            </Pressable>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>

                {/* Meeting Settings */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Meeting Duration</Text>
                  <Pressable
                    style={styles.dropdownButton}
                    onPress={() =>
                      setShowDurationDropdown(!showDurationDropdown)
                    }
                  >
                    <Text style={styles.dropdownText}>{meetingDuration}</Text>
                    <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
                  </Pressable>
                  {renderDropdown(
                    showDurationDropdown,
                    durationOptions,
                    meetingDuration,
                    setMeetingDuration,
                    () => setShowDurationDropdown(false)
                  )}
                </View>

                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Max. Booking per Day</Text>
                  <Pressable
                    style={styles.dropdownButton}
                    onPress={() =>
                      setShowMaxBookingDropdown(!showMaxBookingDropdown)
                    }
                  >
                    <Text style={styles.dropdownText}>{maxBookingPerDay}</Text>
                    <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
                  </Pressable>
                  {renderDropdown(
                    showMaxBookingDropdown,
                    maxBookingOptions,
                    maxBookingPerDay,
                    setMaxBookingPerDay,
                    () => setShowMaxBookingDropdown(false)
                  )}
                </View>

                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>
                    Min. Scheduling Notice
                  </Text>
                  <Pressable
                    style={styles.dropdownButton}
                    onPress={() =>
                      setShowMinNoticeDropdown(!showMinNoticeDropdown)
                    }
                  >
                    <Text style={styles.dropdownText}>
                      {minSchedulingNotice}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
                  </Pressable>
                  {renderDropdown(
                    showMinNoticeDropdown,
                    minNoticeOptions,
                    minSchedulingNotice,
                    setMinSchedulingNotice,
                    () => setShowMinNoticeDropdown(false)
                  )}
                </View>

                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>
                    Preferred Meeting Option
                  </Text>
                  <Pressable
                    style={styles.dropdownButton}
                    onPress={() =>
                      setShowMeetingOptionDropdown(!showMeetingOptionDropdown)
                    }
                  >
                    <Text style={styles.dropdownText}>
                      {preferredMeetingOption}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
                  </Pressable>
                  {renderDropdown(
                    showMeetingOptionDropdown,
                    meetingOptions,
                    preferredMeetingOption,
                    setPreferredMeetingOption,
                    () => setShowMeetingOptionDropdown(false)
                  )}
                </View>

                {/* Submit Button */}
                <Pressable
                  style={[
                    styles.submitButton,
                    isSettingAvailability && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={isSettingAvailability}
                >
                  {isSettingAvailability ? (
                    <ActivityIndicator color="#1E3A6F" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </>
      </LinearGradient>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowTimePicker(false);
          setSelectedTimeSlot(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <Pressable
                onPress={() => {
                  setShowTimePicker(false);
                  setSelectedTimeSlot(null);
                }}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </Pressable>
            </View>
            <ScrollView style={styles.timePickerList}>
              {timeOptions.map((time) => (
                <Pressable
                  key={time}
                  style={styles.timePickerOption}
                  onPress={() => selectTime(time)}
                >
                  <Text style={styles.timePickerOptionText}>{time}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <SimpleSuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.back();
        }}
        title="Availability Submitted"
      />
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
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  searchContainer: {
    marginTop: 8,
  },
  calendarContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
  },
  hoursContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
  },
  dayContainer: {
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dayLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  timeSlotsContainer: {
    marginLeft: 32,
  },
  timeSlotRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeSlotInputs: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  timeInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  timeInputText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginRight: 4,
  },
  timeSeparator: {
    color: "#FFFFFF",
    fontSize: 12,
    marginHorizontal: 8,
  },
  removeSlotButton: {
    padding: 4,
  },
  addSlotButton: {
    marginTop: 8,
  },
  addSlotText: {
    color: "#FFC107",
    fontSize: 12,
    fontWeight: "500",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  dropdownText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  dropdownOptions: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    marginTop: 4,
    overflow: "hidden",
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  dropdownOptionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#1E3A6F",
    fontSize: 16,
    fontWeight: "700",
  },
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
