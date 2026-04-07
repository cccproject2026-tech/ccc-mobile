import GradientCalendar from "@/components/atom/calendar";
import SimpleSuccessModal from "@/components/atom/SimpleSuccessModal";
import { Header } from "@/components/build-components";
import AppointmentCard from "@/components/director/AppointmentCard";
import ScheduleMeetingBottomSheet from "@/components/director/ScheduleMeetingBottomSheet";
import SearchBar from "@/components/director/SearchBar";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import {
  useAppointments,
  useCancelAppointment,
} from "@/hooks/appointments/useAppointments";
import { useMentees } from "@/hooks/mentees/useMentees";
import { Mentor } from "@/hooks/mentors/useMentors";
import { useAuthStore } from "@/stores/auth.store";
import { getAppointmentJoinUrl } from "@/utils/meetingLinkDetails";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
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

  // When returning from Availability via router.back(), React state is preserved
  // but we were left on activeTab === "availability" — reset highlight on focus.
  useFocusEffect(
    useCallback(() => {
      setActiveTab("appointments");
    }, []),
  );
  const [responseModal, setResponseModal] = React.useState<ResponseModalState>({
    visible: false,
    message: "",
    buttonText: "",
  });
  const { bottom } = useSafeAreaInsets();

  // Bottom sheet ref
  const scheduleMeetingBottomSheetRef = React.useRef<BottomSheetModal>(null);
  const { openSheet, assessmentId } = useLocalSearchParams();

  // Get current user
  const { user } = useAuthStore();

  // Fetch appointments for mentor
  const {
    appointments,
    isLoading: isLoadingAppointments,
    getAppointmentsByDate,
    getUpcomingAppointments,
  } = useAppointments({
    mentorId: user?.id,
  });

  const {
    mutateAsync: cancelAppointmentAsync,
    isPending: isCancelling,
  } = useCancelAppointment();

  // Fetch only mentees assigned to this mentor
  const {
    data: menteesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMentees(10, user?.id);

  // Flatten paginated mentees data
  const allMentees = useMemo(() => {
    return menteesData?.pages.flatMap((page) => page.mentees) || [];
  }, [menteesData]);

  // Format mentors from mentees data
  const mentors: Partial<Mentor>[] = useMemo(() => {
    return allMentees.map((mentee) => ({
      id: mentee.id,
      name:
        `${mentee.firstName || ""} ${mentee.lastName || ""}`.trim() || "Mentee",
      role: mentee.role || "Pastor",
      profileImage:
        mentee.profilePicture ||
        "https://randomuser.me/api/portraits/men/1.jpg",
    }));
  }, [allMentees]);

  React.useEffect(() => {
    if (openSheet === "true" && scheduleMeetingBottomSheetRef.current) {
      setTimeout(() => {
        scheduleMeetingBottomSheetRef.current?.present();
      }, 200); // Ensure sheet presents after mount
    }
  }, [openSheet]);

  // Helper function to format date for display (US format)
  const formatDisplayDate = React.useCallback((dateString: string) => {
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
  }, []);

  // Helper function to format time for display
  const formatTime = React.useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }, []);

  // Helper function to get platform icon
  const getPlatformIcon = React.useCallback((platform: string) => {
    switch (platform) {
      case "zoom":
        return icons.duoMeet;
      case "google_meet":
        return icons.googleMeet;
      case "teams":
        return icons.duoMeet;
      default:
        return icons.duoMeet;
    }
  }, []);

  // Helper function to get mode label
  const getModeLabel = React.useCallback((platform: string) => {
    switch (platform) {
      case "zoom":
        return "Zoom";
      case "google_meet":
        return "Google Meet";
      case "teams":
        return "Teams";
      case "phone":
        return "Phone call";
      case "in_person":
        return "In Person";
      default:
        return "Zoom";
    }
  }, []);

  // Helper function to check if date is today
  const isToday = React.useCallback(
    (dateString: string) => {
      return dateString === today;
    },
    [today],
  );

  // Get mentee name from userId
  const getMenteeName = React.useCallback(
    (userId: string) => {
      const mentee = allMentees?.find((m) => m.id === userId);
      if (mentee) {
        return (
          `${mentee.firstName || ""} ${mentee.lastName || ""}`.trim() ||
          "Mentee"
        );
      }
      return "Mentee";
    },
    [allMentees],
  );

  const isValidISODate = (value: string) => {
    const d = new Date(value);
    return !Number.isNaN(d.getTime());
  };

  useEffect(() => {
    if (searchQuery.length !== 10) return;

    const match = searchQuery.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (!match) return;

    const [, dd, mm, yyyy] = match;
    const iso = `${yyyy}-${mm}-${dd}`;

    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) {
      setSelectedDate(iso); // ✅ YYYY-MM-DD ONLY
    }
  }, [searchQuery]);
  // Format appointments for display
  const formattedAppointments = useMemo(() => {
    if (!appointments || !getAppointmentsByDate) return [];
    const dateAppointments = getAppointmentsByDate(selectedDate);

    const uniqueDateAppointments = dateAppointments.filter(
      (apt, index, self) =>
        index ===
        self.findIndex((a) =>
          a.id
            ? a.id === apt.id
            : a.meetingDate === apt.meetingDate &&
              a.mentorId === apt.mentorId &&
              a.userId === apt.userId,
        ),
    );

    const activeDateAppointments = uniqueDateAppointments.filter(
      (apt) => !String(apt.status ?? "").trim().toLowerCase().startsWith("cancel"),
    );

    return activeDateAppointments.map((apt) => {
      const menteeName = getMenteeName(apt.userId);
      const startTime = formatTime(apt.meetingDate);
      const endTime = formatTime(apt.endTime);

      return {
        id: apt.id,
        date: formatDisplayDate(apt.meetingDate),
        time: `${startTime} - ${endTime}`,
        tz: "EST",
        person: menteeName,
        role: "Mentee",
        mode: getModeLabel(apt.platform),
        icon: getPlatformIcon(apt.platform),
        appointment: apt, // Keep original appointment data for handlers
      };
    });
  }, [
    appointments,
    getAppointmentsByDate,
    selectedDate,
    formatDisplayDate,
    formatTime,
    getModeLabel,
    getPlatformIcon,
    getMenteeName,
    searchQuery,
  ]);

  const selectedDateAppointments = formattedAppointments;

  // Format getUpcomingAppointments appointments for display
  const upcomingAppointments = useMemo(() => {
    if (!appointments || !getUpcomingAppointments) return [];

    const dateAppointments = getUpcomingAppointments();
    const uniqueUpcomingAppointments = dateAppointments.filter(
      (apt, index, self) =>
        index ===
        self.findIndex((a) =>
          a.id
            ? a.id === apt.id
            : a.meetingDate === apt.meetingDate &&
              a.mentorId === apt.mentorId &&
              a.userId === apt.userId,
        ),
    );
    const activeUpcomingAppointments = uniqueUpcomingAppointments.filter(
      (apt) => !String(apt.status ?? "").trim().toLowerCase().startsWith("cancel"),
    );
    return activeUpcomingAppointments.map((apt) => {
      const menteeName = getMenteeName(apt.userId);
      const startTime = formatTime(apt.meetingDate);
      const endTime = formatTime(apt.endTime);
      if (
        formatDisplayDate(apt.meetingDate) !== formatDisplayDate(selectedDate)
      ) {
        return {
          id: apt.id,
          date: formatDisplayDate(apt.meetingDate),
          time: `${startTime} - ${endTime}`,
          tz: "EST",
          person: menteeName,
          role: "Mentee",
          mode: getModeLabel(apt.platform),
          icon: getPlatformIcon(apt.platform),
          appointment: apt, // Keep original appointment data for handlers
        };
      }
    });
  }, [
    appointments,
    getAppointmentsByDate,
    selectedDate,
    formatDisplayDate,
    formatTime,
    getModeLabel,
    getPlatformIcon,
    getMenteeName,
  ]);

  const allUpcomingAppointments = upcomingAppointments;

  const handleViewDetails = (appointment: any) => {
    console.log("View details", appointment);
    // Navigate to appointment details
  };

  const handleReschedule = (appointment: any) => {
    console.log("Reschedule appointment", appointment);
    // Navigate to reschedule screen
  };

  const handleCancel = (appointment: any) => {
    if (appointment?.status !== "scheduled") {
      Alert.alert(
        "Cannot Cancel",
        "Only scheduled meetings can be cancelled.",
      );
      return;
    }

    Alert.alert(
      "Cancel Meeting",
      "Are you sure you want to cancel this meeting?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            if (!appointment?.id) {
              Alert.alert("Error", "Missing appointment id.");
              return;
            }
            try {
              await cancelAppointmentAsync(appointment.id);
              setResponseModal({
                visible: true,
                message: "Meeting has been Canceled",
                buttonText: "OK",
              });
            } catch {
              Alert.alert(
                "Error",
                "Failed to cancel the meeting. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  // Handle new meeting button press
  const handleNewMeeting = () => {
    scheduleMeetingBottomSheetRef.current?.present();
  };

  // Handle schedule meeting
  const handleScheduleMeeting = (data: any) => {
    console.log("Scheduling meetingm:", data);
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

  const handleTabPress = (tab: "appointments" | "availability") => {
    setActiveTab(tab);
    if (tab === "availability") {
      router.push({
        pathname: "/appointments/availability",
      });
    }
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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
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
                      showHeader={false}
                      disablePastDates={false}
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
                              selectedDate,
                            )}`}
                      </Text>
                    </View>
                    <View style={{ gap: 10 }}>
                      {isLoadingAppointments ? (
                        <View
                          style={{ paddingVertical: 20, alignItems: "center" }}
                        >
                          <ActivityIndicator size="small" color="white" />
                          <Text
                            style={{
                              color: "rgba(255,255,255,0.7)",
                              marginTop: 8,
                              fontSize: 14,
                            }}
                          >
                            Loading appointments...
                          </Text>
                        </View>
                      ) : (
                        selectedDateAppointments.map((appointment, i) => {
                          const isScheduled =
                            appointment.appointment?.status === "scheduled";

                          const menuItems = [
                            {
                              key: "reschedule",
                              title: "Reschedule Meeting",
                              icon: {
                                ios: "calendar.badge.clock",
                                android: "ic_event_available",
                              },
                              onSelect: () =>
                                handleReschedule(appointment.appointment),
                            },
                            {
                              key: "change_mode",
                              title: "Change Mode",
                              icon: {
                                ios: "arrow.2.circlepath",
                                android: "ic_sync",
                              },
                              onSelect: () =>
                                handleChangeMode(appointment.appointment),
                            },
                          ];

                          if (isScheduled) {
                            menuItems.push({
                              key: "cancel",
                              title: "Cancel Meeting",
                              destructive: true,
                              icon: {
                                ios: "trash",
                                android: "ic_menu_delete",
                              },
                              onSelect: () =>
                                handleCancel(appointment.appointment),
                            });
                          }

                          return (
                            <AppointmentCard
                              key={appointment.id || i}
                              date={appointment.date}
                              time={appointment.time}
                              tz={appointment.tz}
                              person={appointment.person}
                              role={appointment.role}
                              mode={appointment.mode}
                              platformIcon={appointment.icon}
                              menuItems={menuItems}
                              meetingJoinUrl={getAppointmentJoinUrl(
                                appointment.appointment,
                              )}
                            />
                          );
                        })
                      )}
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
                              selectedDate,
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

                {/* Selected Date Appointments */}
                {allUpcomingAppointments?.length > 0 &&
                  allUpcomingAppointments[0] && (
                    <View style={styles.appointmentsContainer}>
                      <View style={styles.rowBetween}>
                        <Text style={styles.upcomingText}>
                          Next Appointment
                        </Text>
                      </View>
                      <View style={{ gap: 10 }}>
                        {isLoadingAppointments ? (
                          <View
                            style={{
                              paddingVertical: 20,
                              alignItems: "center",
                            }}
                          >
                            <ActivityIndicator size="small" color="white" />
                            <Text
                              style={{
                                color: "rgba(255,255,255,0.7)",
                                marginTop: 8,
                                fontSize: 14,
                              }}
                            >
                              Loading appointments...
                            </Text>
                          </View>
                        ) : (
                          allUpcomingAppointments?.map((appointment, i) => {
                            const isScheduled =
                              appointment?.appointment?.status === "scheduled";

                            const menuItems = [
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
                            ];

                            if (isScheduled) {
                              menuItems.push({
                                key: "cancel",
                                title: "Cancel Meeting",
                                destructive: true,
                                icon: {
                                  ios: "trash",
                                  android: "ic_menu_delete",
                                },
                                onSelect: () => handleCancel(appointment),
                              });
                            }

                            return (
                              <AppointmentCard
                                key={appointment?.id || i}
                                date={appointment?.date}
                                time={appointment?.time}
                                tz={appointment?.tz}
                                person={appointment?.person}
                                role={appointment?.role}
                                mode={appointment?.mode}
                                platformIcon={appointment?.icon}
                                menuItems={menuItems}
                                meetingJoinUrl={getAppointmentJoinUrl(
                                  appointment?.appointment,
                                )}
                              />
                            );
                          })
                        )}
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
