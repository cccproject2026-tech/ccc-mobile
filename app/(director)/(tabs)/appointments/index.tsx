import GradientCalendar from "@/components/atom/calendar";
import SimpleSuccessModal from "@/components/atom/SimpleSuccessModal";
import { Header } from "@/components/build-components";
import AppointmentCard from "@/components/director/AppointmentCard";
import ScheduleMeetingBottomSheet, {
  Mentor,
} from "@/components/director/ScheduleMeetingBottomSheet";
import SearchBar from "@/components/director/SearchBar";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { appointments } from "@/constants/mockData";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import React, { useCallback } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ResponseModalState {
  visible: boolean;
  message: string;
  buttonText: string;
}

const Appointments: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = React.useState<string>(today);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [activeTab, setActiveTab] = React.useState<
    "appointments" | "availability"
  >("appointments");
  const router = useRouter();
  const [responseModal, setResponseModal] = React.useState<ResponseModalState>({
    visible: false,
    message: "",
    buttonText: "",
  });
  const { bottom } = useSafeAreaInsets();

  // Reset active tab when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setActiveTab("appointments");
    }, [])
  );

  // Bottom sheet ref
  const scheduleMeetingBottomSheetRef = React.useRef<BottomSheetModal>(null);
  const { openSheet, assessmentId } = useLocalSearchParams();

  React.useEffect(() => {
    if (openSheet === "true" && scheduleMeetingBottomSheetRef.current) {
      setTimeout(() => {
        scheduleMeetingBottomSheetRef.current?.present();
      }, 200); // Ensure sheet presents after mount
    }
  }, [openSheet]);

  // Mock mentors data
  const mockMentors: Mentor[] = [
    {
      id: "1",
      name: "John Ross",
      role: "Mentor",
      profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      id: "2",
      name: "John Ross",
      role: "Field Mentor",
      profileImage: "https://randomuser.me/api/portraits/men/2.jpg",
    },
    {
      id: "3",
      name: "John Ross",
      role: "Mentor",
      profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    {
      id: "4",
      name: "John Ross",
      role: "Mentor",
      profileImage: "https://randomuser.me/api/portraits/men/4.jpg",
    },
    {
      id: "5",
      name: "John Ross",
      role: "Field Mentor",
      profileImage: "https://randomuser.me/api/portraits/men/5.jpg",
    },
    {
      id: "6",
      name: "John Ross",
      role: "Field Mentor",
      profileImage: "https://randomuser.me/api/portraits/men/6.jpg",
    },
  ];

  // Helper function to format date for display
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);

    return `${day} ${month} ${year}`;
  };

  // Helper function to check if date is today
  const isToday = (dateString: string) => {
    return dateString === today;
  };

  // Filter appointments based on selected date
  const getAppointmentsForDate = (dateString: string) => {
    // For demo purposes, we'll show appointments on specific dates
    // In real app, you'd filter based on actual appointment dates
    if (dateString === today) {
      return appointments; // Show real appointments for today
    } else if (
      dateString === "2025-10-20" ||
      dateString === "2025-10-23" ||
      dateString === "2025-10-21"
    ) {
      // Show some appointments for these demo dates
      return appointments.slice(0, 2);
    }
    return []; // No appointments for other dates
  };

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  const handleViewDetails = (appointment: any) => {
    console.log("View details", appointment);
    // Navigate to appointment details
  };

  const handleReschedule = (appointment: any) => {
    console.log("Reschedule appointment", appointment);
    // Navigate to reschedule screen
  };

  const handleCancel = (appointment: any) => {
    Alert.alert(
      "Cancel Meeting",
      "Are you sure you want to cancel this meeting?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => {
            // Place your cancel logic here
            console.log("Meeting cancelled:", appointment);
            // Optionally show a success message or update state
            setResponseModal({
              visible: true,
              message: "Meeting has been Canceled",
              buttonText: "OK",
            });
          },
        },
      ]
    );
  };

  // Handle new meeting button press
  const handleNewMeeting = () => {
    scheduleMeetingBottomSheetRef.current?.present();
  };

  // Handle schedule meeting
  const handleScheduleMeeting = (data: any) => {
    console.log("Scheduling meeting:", data);
    setResponseModal({
      visible: true,
      message: `Meeting scheduled with ${
        data.selectedMentor.name
      } on ${formatDisplayDate(data.selectedDate)} at ${
        data.selectedTime.label
      }`,
      buttonText: "OK",
    });
    if (openSheet === "true") {
      router.push({
        pathname: "/assessments/survey-guidelines",
        params: { assessmentId },
      });
    }
  };

  // Handle close bottom sheet
  const handleCloseScheduleBottomSheet = () => {
    scheduleMeetingBottomSheetRef.current?.dismiss();
  };

  const [changeModeModalVisible, setChangeModeModalVisible] =
    React.useState(false);
  const [selectedMode, setSelectedMode] = React.useState("Zoom");
  const [showModeSuccess, setShowModeSuccess] = React.useState(false);
  const [modeSuccessText, setModeSuccessText] = React.useState("");
  const meetingModes = [
    "Zoom",
    "Google Meet",
    "Teams",
    "Whatsapp",
    "Phone call",
  ];

  const handleChangeMode = (appointment: any) => {
    setChangeModeModalVisible(true);
  };

  const handleChooseMode = () => {
    setChangeModeModalVisible(false);
    setModeSuccessText(`Meeting Mode has been\nChanged to ${selectedMode}`);
    setShowModeSuccess(true);
  };

  const handleTabPress = (tab: "appointments" | "availability") => {
    setActiveTab(tab);
    if (tab === "availability") {
      router.push("/appointments/availability");
    }
  };

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
              showNewMeeting={true}
              onNewMeetingPress={handleNewMeeting}
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

            <View style={{ paddingHorizontal: 16, marginVertical: 10 }}>
              <SearchBar
                backgroundColor="transparent"
                value={searchQuery}
                onChangeValue={setSearchQuery}
                placeholder="Enter a date (dd-mm-yyyy)"
              />
            </View>

            {/* Main content */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: bottom }}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={{
                  width: "100%",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingTop: 20,
                }}
              >
                {/* Calendar */}
                <View style={styles.calendarContainer}>
                  {/* Heading with Icon */}
                  <View style={styles.calendarHeader}>
                    <Image
                      source={icons.calendarIcon}
                      style={{ width: 24, height: 24 }}
                    />
                    <Text style={styles.calendarTitle}>
                      Monthly Meeting Calendar
                    </Text>
                  </View>

                  {/* Calendar Component */}
                  <View
                    style={{
                      minHeight: 400,
                    }}
                  >
                    <GradientCalendar
                      selected={selectedDate}
                      setSelected={setSelectedDate}
                      recurringAvailability={{
                        type: "weekly",
                        daysOfWeek: [1, 2, 3, 4, 5, 6],
                      }}
                      unavailableDates={[
                        "2025-10-30",
                        "2025-10-22",
                        "2025-10-25",
                      ]}
                      availableDates={[
                        today,
                        "2025-10-20",
                        "2025-10-21",
                        "2025-10-23",
                        "2025-10-24",
                        "2025-10-27",
                        "2025-10-28",
                        "2025-10-29",
                      ]}
                      showHeader={false}
                      disablePastDates={true}
                      markToday={false}
                    />
                  </View>
                </View>

                {/* Selected Date Appointments */}
                {selectedDateAppointments.length > 0 && (
                  <View style={styles.appointmentsContainer}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.upcomingText}>
                        {isToday(selectedDate)
                          ? `You have ${selectedDateAppointments.length} Appointments Today`
                          : `You have ${
                              selectedDateAppointments.length
                            } Appointments on ${formatDisplayDate(
                              selectedDate
                            )}`}
                      </Text>
                    </View>
                    <View style={{ gap: 10 }}>
                      {selectedDateAppointments.map((appointment, i) => (
                        <AppointmentCard
                          key={i}
                          date={appointment.date}
                          time={appointment.time}
                          tz={appointment.tz}
                          person={appointment.person}
                          role={appointment.role}
                          mode={appointment.mode}
                          platformIcon={appointment.icon}
                          menuItems={[
                            {
                              key: "reschedule",
                              title: "Reschedule Meeting",
                              icon: {
                                ios: "calendar.badge.clock",
                                android: "ic_event_available",
                              },
                              onSelect: () => handleReschedule(appointment),
                            },
                            {
                              key: "change_mode",
                              title: "Change Mode",
                              icon: {
                                ios: "arrow.2.circlepath",
                                android: "ic_sync",
                              },
                              onSelect: () => handleChangeMode(appointment),
                            },
                            {
                              key: "cancel",
                              title: "Cancel Meeting",
                              destructive: true,
                              icon: { ios: "trash", android: "ic_menu_delete" },
                              onSelect: () => handleCancel(appointment),
                            },
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {/* No appointments message */}
                {selectedDateAppointments.length === 0 && (
                  <View style={styles.appointmentsContainer}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.upcomingText}>
                        {isToday(selectedDate)
                          ? "No Appointments Today"
                          : `No Appointments on ${formatDisplayDate(
                              selectedDate
                            )}`}
                      </Text>
                    </View>
                    <View style={styles.noAppointmentsContainer}>
                      <Text style={styles.noAppointmentsText}>
                        Select a different date to view appointments or schedule
                        a new meeting.
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </>
      </LinearGradient>

      {/* Schedule Meeting Bottom Sheet */}
      <ScheduleMeetingBottomSheet
        ref={scheduleMeetingBottomSheetRef}
        onClose={handleCloseScheduleBottomSheet}
        onSchedule={handleScheduleMeeting}
        colorScheme={{
          background: Colors.darkBlueGradientOne,
          text: "#FFFFFF",
          accent: "#FFC107",
          cardBackground: "rgba(255, 255, 255, 0.1)",
        }}
      />

      {/* Change Meeting Mode Modal */}
      <Modal
        visible={changeModeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setChangeModeModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LinearGradient
            colors={["#264387", "#1D548D", "#176192"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              borderRadius: 24,
              width: Math.min(Dimensions.get("window").width * 0.92, 400),
              paddingHorizontal: 20,
              paddingVertical: 28,
              alignSelf: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 22,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 22,
                  fontWeight: "700",
                  flex: 1,
                  textAlign: "center",
                }}
              >
                Choose your meeting option
              </Text>
              <Pressable
                onPress={() => setChangeModeModalVisible(false)}
                style={{ marginLeft: 8 }}
              >
                <Text
                  style={{ color: "white", fontSize: 28, fontWeight: "400" }}
                >
                  ×
                </Text>
              </Pressable>
            </View>
            {meetingModes.map((mode) => (
              <Pressable
                key={mode}
                onPress={() => setSelectedMode(mode)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 20,
                  minHeight: 36,
                }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    borderWidth: 2,
                    borderColor: selectedMode === mode ? "#3CA1F0" : "#B0B8D1",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  {selectedMode === mode && (
                    <View
                      style={{
                        width: 13,
                        height: 13,
                        borderRadius: 6.5,
                        backgroundColor: "#3CA1F0",
                      }}
                    />
                  )}
                </View>
                <Text
                  style={{
                    color: selectedMode === mode ? "#EAF7FF" : "#B0B8D1",
                    fontSize: 19,
                    fontWeight: "500",
                  }}
                >
                  {mode}
                </Text>
              </Pressable>
            ))}
            <Pressable
              onPress={handleChooseMode}
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                paddingVertical: 14,
                marginTop: 10,
                marginBottom: 2,
              }}
            >
              <Text
                style={{
                  color: "#1535A8",
                  fontSize: 19,
                  fontWeight: "700",
                  textAlign: "center",
                }}
              >
                Choose
              </Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>
      {/* Success Modal for Meeting Mode Change */}
      <SimpleSuccessModal
        visible={showModeSuccess}
        onClose={() => setShowModeSuccess(false)}
        title={modeSuccessText}
      />
      {/* General Success Modal */}
      <SimpleSuccessModal
        visible={responseModal.visible}
        onClose={() => setResponseModal({ ...responseModal, visible: false })}
        title={responseModal.message}
      />
    </>
  );
};

export default Appointments;
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
  // Calendar Container
  calendarContainer: {
    width: "100%",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },

  // Calendar Header with Icon
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  calendarTitle: {
    fontSize: 16,
    color: "white",
    fontWeight: "500",
  },

  // Wrapper to control calendar height
  calendarWrapper: {
    maxHeight: 340, // Reduced from default height
    overflow: "hidden",
  },

  // Appointments Container
  appointmentsContainer: {
    marginTop: 16,
    position: "relative",
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.09)",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  rowBetween: {
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  upcomingText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "AlbertSans-Bold",
    textAlign: "center",
  },

  noAppointmentsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
  },

  noAppointmentsText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
