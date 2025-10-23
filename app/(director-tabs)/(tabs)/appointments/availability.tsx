import GradientCalendar from "@/components/atom/calendar";
import SimpleSuccessModal from "@/components/atom/SimpleSuccessModal";
import { Header } from "@/components/build-components";
import SearchBar from "@/components/director/SearchBar";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  Image,
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
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [activeTab, setActiveTab] = React.useState<
    "appointments" | "availability"
  >("availability");

  // Weekly availability state
  const [weeklyAvailability, setWeeklyAvailability] =
    React.useState<WeeklyAvailability>({
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
  const [meetingDuration, setMeetingDuration] = React.useState("60 Minutes");
  const [maxBookingPerDay, setMaxBookingPerDay] = React.useState("5");
  const [minSchedulingNotice, setMinSchedulingNotice] =
    React.useState("2 Days");
  const [preferredMeetingOption, setPreferredMeetingOption] =
    React.useState("Zoom");

  // Dropdown states
  const [showDurationDropdown, setShowDurationDropdown] = React.useState(false);
  const [showMaxBookingDropdown, setShowMaxBookingDropdown] =
    React.useState(false);
  const [showMinNoticeDropdown, setShowMinNoticeDropdown] =
    React.useState(false);
  const [showMeetingOptionDropdown, setShowMeetingOptionDropdown] =
    React.useState(false);

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

  const handleSubmit = () => {
    // Here you would typically save to backend
    console.log("Weekly Availability:", weeklyAvailability);
    console.log("Meeting Duration:", meetingDuration);
    console.log("Max Booking Per Day:", maxBookingPerDay);
    console.log("Min Scheduling Notice:", minSchedulingNotice);
    console.log("Preferred Meeting Option:", preferredMeetingOption);

    setShowSuccessModal(true);
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

  const renderTimeSlotDropdown = (
    value: string,
    onSelect: (value: string) => void
  ) => {
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

    return (
      <View style={styles.timeSlotDropdown}>
        {timeOptions.map((time) => (
          <Pressable
            key={time}
            style={styles.timeOption}
            onPress={() => onSelect(time)}
          >
            <Text style={styles.timeOptionText}>{time}</Text>
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
            <TopBar role="director" />
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
                    Enter a date (dd-mm-yyyy)
                  </Text>
                  <View style={styles.searchContainer}>
                    <SearchBar
                      backgroundColor="transparent"
                      value=""
                      onChangeValue={() => {}}
                      placeholder="Enter a date (dd-mm-yyyy)"
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
                    <Ionicons name="refresh" size={20} color="#FFFFFF" />
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
                                  <Pressable style={styles.timeInput}>
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
                                  <Pressable style={styles.timeInput}>
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
                <Pressable style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.submitButtonText}>Submit</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </>
      </LinearGradient>

      {/* Success Modal */}
      <SimpleSuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
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
  timeSlotDropdown: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
  },
  timeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  timeOptionText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#1E3A6F",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default AvailabilityScreen;









