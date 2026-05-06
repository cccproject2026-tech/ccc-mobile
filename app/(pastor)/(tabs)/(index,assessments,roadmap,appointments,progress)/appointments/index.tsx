import GradientCalendar from "@/components/atom/calendar";
import SimpleSuccessModal from "@/components/atom/SimpleSuccessModal";
import { Header } from "@/components/build-components";
import AppointmentCard from "@/components/director/AppointmentCard";
// Scheduling now uses full-screen pages under /schedule-meeting
import SearchBar from "@/components/director/SearchBar";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import {
  useAppointments,
  useCancelAppointment,
} from "@/hooks/appointments/useAppointments";
import { useUpdateAppointment } from "@/hooks/appointments/useUpadteAppointment";
import { Mentor, useAssignedMentors } from "@/hooks/mentors/useGetAssignedMentors";
import { useAuthStore } from "@/stores";
import { Appointment, AppointmentPlatform } from "@/types/appointment.types";
import { getAppointmentJoinUrl } from "@/utils/meetingLinkDetails";
import { getDeviceTimezone } from "@/utils/appointments/timezone";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { ActivityIndicator, Alert, Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Appointments = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = React.useState<string>(today);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const deviceTz = useMemo(() => getDeviceTimezone(), []);

  const { openSheet = 'false', assessmentId, mentorData, mode, appointmentId } = useLocalSearchParams<{
    openSheet?: string;
    assessmentId?: string;
    mentorData?: string;
    mode?: "create" | "reschedule";
    appointmentId?: string;
  }>();

  const { user } = useAuthStore();

  // ✅ Move state declaration BEFORE the hook
  const [rescheduleData, setRescheduleData] = React.useState<Appointment | null>(null);

  if (!user?.id) {
    return (
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Text style={{ color: 'white', fontSize: 18 }}>Please log in</Text>
      </LinearGradient>
    );
  }

  // Fetch appointments
  const {
    appointments,
    isLoading,
    isError,
    error,
    refetch,
    getAppointmentsByDate,
    getUpcomingAppointments,
  } = useAppointments({ userId: user.id });

  // Fetch assigned mentors
  const { mentors: assignedMentors, isLoading: isLoadingMentors } = useAssignedMentors(user.id);

  // Update appointment (for change mode)
  const { updateAppointmentAsync, isUpdating } = useUpdateAppointment();
  const { mutateAsync: cancelAppointmentAsync } = useCancelAppointment();
  const scheduleMeetingBottomSheetRef = React.useRef<BottomSheetModal>(null);

  React.useEffect(() => {
    if (openSheet === "true") {
      router.replace({
        pathname: "/schedule-meeting/person",
        params: { mode: "schedule", personData: mentorData },
      });
    }
  }, [mentorData, openSheet, router]);

  // Legacy redirect support: schedule-flow will route into /schedule-meeting directly now.

  const mentorsForBottomSheet = useMemo(() => {
    // Combine assigned mentors and mentors found in existing appointments
    const mentorMap = new Map<string, Mentor>();

    // Add assigned mentors first
    assignedMentors.forEach(mentor => {
      mentorMap.set(mentor.id, mentor);
    });

    // Fallback for mentors in appointments that might not be in the assigned list (though unlikely)
    appointments.forEach(apt => {
      if (!mentorMap.has(apt.mentorId)) {
        mentorMap.set(apt.mentorId, {
          id: apt.mentorId,
          name: 'Unknown Mentor',
          role: 'Mentor',
          profilePicture: undefined,
        });
      }
    });
    return Array.from(mentorMap.values());
  }, [assignedMentors, appointments]);

  const initialPerson = useMemo(() => {
    if (!openSheet || openSheet !== "true") return null;
    const raw = mentorData;
    if (!raw) return null;
    try {
      const parsed = JSON.parse(String(raw));
      if (!parsed?.id) return null;
      return {
        id: parsed.id,
        name: parsed.name || "Mentor",
        role: parsed.role || "Mentor",
        profilePicture: parsed.profilePicture,
        profileImage: parsed.profileImage,
      } as any;
    } catch {
      return null;
    }
  }, [mentorData, openSheet]);

  const formatTimeLocal = useCallback((isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      ...(deviceTz.timeZone ? { timeZone: deviceTz.timeZone } : {}),
    });
  }, [deviceTz.timeZone]);

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    return `${day} ${month} ${year}`;
  };

  const isToday = (dateString: string) => {
    return dateString === today;
  };

  const selectedDateAppointments = getAppointmentsByDate(selectedDate);
  const uniqueSelectedDateAppointments = selectedDateAppointments.filter(
    (apt, index, self) =>
      index ===
      self.findIndex(
        (a) => a.meetingDate === apt.meetingDate && a.mentorId === apt.mentorId,
      ),
  );
  const finalSelectedDateAppointments = uniqueSelectedDateAppointments.filter(
    (apt) => !String(apt.status ?? "").trim().toLowerCase().startsWith("cancel"),
  );

  const nextAppointments = useMemo(() => {
    const upcoming = getUpcomingAppointments()
      .slice()
      .sort(
        (a, b) =>
          new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime(),
      );

    const selectedIds = new Set(finalSelectedDateAppointments.map((a) => a.id));
    return upcoming.filter((a) => !selectedIds.has(a.id)).slice(0, 3);
  }, [getUpcomingAppointments, finalSelectedDateAppointments]);

  // ✅ Removed duplicate declaration (moved to top)

  const handleReschedule = (appointment: Appointment) => {
    router.push({
      pathname: "/schedule-meeting/person",
      params: { mode: "reschedule", appointmentId: String(appointment.id) },
    });
  };

  const handleCancel = (appointment: Appointment) => {
    Alert.alert(
      'Cancel Meeting',
      'Are you sure you want to cancel this meeting?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelAppointmentAsync(appointment.id);
              Alert.alert('Success', 'Meeting cancelled successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel meeting');
            }
          },
        },
      ]
    );
  };

  const handleNewMeeting = () => {
    router.push({ pathname: "/schedule-meeting/person", params: { mode: "schedule" } });
  };

  const handleCloseScheduleBottomSheet = () => {};

  const [changeModeModalVisible, setChangeModeModalVisible] = React.useState(false);
  const [selectedAppointmentForMode, setSelectedAppointmentForMode] = React.useState<Appointment | null>(null);
  const [selectedMode, setSelectedMode] = React.useState<AppointmentPlatform>('zoom');
  const [showModeSuccess, setShowModeSuccess] = React.useState(false);
  const [modeSuccessText, setModeSuccessText] = React.useState('');

  const meetingModes: AppointmentPlatform[] = [
    'zoom',
    'google_meet',
    // 'teams',
    // 'phone',
    // 'in_person',
  ];

  const getModeLabel = (mode: AppointmentPlatform): string => {
    const labels: Record<AppointmentPlatform, string> = {
      zoom: 'Zoom',
      google_meet: 'Google Meet',
      teams: 'Teams',
      phone: 'Phone call',
      in_person: 'In Person',
    };
    return labels[mode];
  };

  const getPlatformIcon = (mode: AppointmentPlatform) => {
    const iconsMap: Record<AppointmentPlatform, any> = {
      zoom: icons.duoMeet,
      google_meet: icons.googleMeet,
      teams: icons.duoMeet,
      phone: icons.phone,
      in_person: icons.profile,
    };
    return iconsMap[mode];
  };

  const handleChangeMode = (appointment: Appointment) => {
    setSelectedAppointmentForMode(appointment);
    setSelectedMode(appointment.platform);
    setChangeModeModalVisible(true);
  };

  const handleChooseMode = async () => {
    if (!selectedAppointmentForMode) return;
    try {
      console.log('Changing mode to:', selectedMode);
      await updateAppointmentAsync({
        id: selectedAppointmentForMode.id,
        payload: { platform: selectedMode }
      });
      setChangeModeModalVisible(false);
      setModeSuccessText(`Meeting Mode has been\nChanged to ${getModeLabel(selectedMode)}`);
      setShowModeSuccess(true);
      setSelectedAppointmentForMode(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to change meeting mode');
    }
  };

  if (isLoading || isLoadingMentors) {
    return (
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Text style={{ color: 'white', fontSize: 18 }}>
          {isLoading ? 'Loading appointments...' : 'Loading mentors...'}
        </Text>
      </LinearGradient>
    );
  }

  if (isError) {
    return (
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <View style={{ alignItems: 'center', gap: 16 }}>
          <Text style={{ color: 'white', fontSize: 18 }}>Error loading appointments</Text>
          <Pressable
            onPress={() => refetch()}
            style={{ backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
          >
            <Text style={{ color: '#1535A8', fontWeight: '600' }}>Retry</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[...Colors.appBgGradient]}
        style={{ flex: 1 }}
      >
        <>
          <View style={{ paddingBottom: 10 }}>
            <TopBar role="pastor" />
          </View>
          <View style={{ flex: 1 }}>
            <Header
              title="Appointments"
              hideSearchBar={true}
              showSettings={false}
              showNewMeeting={true}
              onNewMeetingPress={handleNewMeeting}
            />

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: bottom }}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={styles.screenContent}
              >
                <View style={styles.calendarContainer}>
                  <View style={styles.calendarHeader}>
                    <View style={styles.calendarHeaderLeft}>
                      <View style={styles.calendarIconWrap}>
                        <Image source={icons.calendarIcon} style={{ width: 18, height: 18 }} />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.calendarTitle} numberOfLines={1}>
                          Monthly Meeting Calendar
                        </Text>
                        <Text style={styles.calendarSubtitle} numberOfLines={1}>
                          Select a date to view your meetings
                        </Text>
                      </View>
                    </View>
                    <View style={styles.datePill}>
                      <Text style={styles.datePillText}>{formatDisplayDate(selectedDate)}</Text>
                    </View>
                  </View>

                  <View style={{ minHeight: 400 }}>
                    <GradientCalendar
                      selected={selectedDate}
                      setSelected={setSelectedDate}
                      showHeader={false}
                      disablePastDates={true}
                      markToday={false}
                    />
                  </View>
                </View>

                {finalSelectedDateAppointments.length > 0 && (
                  <View style={styles.appointmentsContainer}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionHeaderLeft}>
                        <Text style={styles.sectionTitle} numberOfLines={1}>
                          {isToday(selectedDate) ? "Appointments" : "Appointments"}
                        </Text>
                        <Text style={styles.sectionSubtitle} numberOfLines={1}>
                          {isToday(selectedDate)
                            ? "Scheduled for today"
                            : `Scheduled for ${formatDisplayDate(selectedDate)}`}
                        </Text>
                      </View>
                      <View style={styles.countPill}>
                        <Text style={styles.countPillText}>{finalSelectedDateAppointments.length}</Text>
                      </View>
                    </View>
                    <View style={{ gap: 10 }}>
                      {finalSelectedDateAppointments.map((appointment) => {
                        const mentor = mentorsForBottomSheet.find(m => m.id === appointment.mentorId);

                        return (
                          <AppointmentCard
                            key={appointment.id}
                            date={appointment.meetingDate.split('T')[0]}
                            time={`${formatTimeLocal(appointment.meetingDate)} - ${formatTimeLocal(appointment.endTime)}`}
                            tz={deviceTz.badge}
                            person={mentor?.name || 'Unknown Mentor'}
                            role={mentor?.role || 'Mentor'}
                            mode={getModeLabel(appointment.platform)}
                            platformIcon={getPlatformIcon(appointment.platform)}
                            meetingJoinUrl={getAppointmentJoinUrl(appointment)}
                            menuItems={[
                              {
                                key: 'reschedule',
                                title: 'Reschedule Meeting',
                                icon: { ios: 'calendar.badge.clock', android: 'ic_event_available' },
                                onSelect: () => handleReschedule(appointment)
                              },
                              {
                                key: 'change_mode',
                                title: 'Change Mode',
                                icon: { ios: 'arrow.2.circlepath', android: 'ic_sync' },
                                onSelect: () => handleChangeMode(appointment)
                              },
                              {
                                key: 'cancel',
                                title: 'Cancel Meeting',
                                destructive: true,
                                icon: { ios: 'trash', android: 'ic_menu_delete' },
                                onSelect: () => handleCancel(appointment)
                              }
                            ]}
                          />
                        );
                      })}
                    </View>
                  </View>
                )}

                {finalSelectedDateAppointments.length === 0 && (
                  <View style={styles.appointmentsContainer}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionHeaderLeft}>
                        <Text style={styles.sectionTitle} numberOfLines={1}>
                          {isToday(selectedDate) ? "No appointments today" : "No appointments"}
                        </Text>
                        <Text style={styles.sectionSubtitle} numberOfLines={2}>
                          {isToday(selectedDate)
                            ? "Try selecting another date or schedule a new meeting."
                            : `No meetings on ${formatDisplayDate(selectedDate)}. Pick a different date or schedule one.`}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.emptyStateIconWrap}>
                      <Ionicons name="calendar-outline" size={26} color="rgba(255,255,255,0.55)" />
                    </View>
                  </View>
                )}

                {nextAppointments.length > 0 && (
                  <View style={styles.appointmentsContainer}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionHeaderLeft}>
                        <Text style={styles.sectionTitle} numberOfLines={1}>
                          Next up
                        </Text>
                        <Text style={styles.sectionSubtitle} numberOfLines={1}>
                          Your upcoming meetings
                        </Text>
                      </View>
                      <View style={styles.countPillMuted}>
                        <Text style={styles.countPillTextMuted}>{Math.min(nextAppointments.length, 3)}</Text>
                      </View>
                    </View>
                    <View style={{ gap: 10 }}>
                      {nextAppointments.map((appointment) => {
                        const mentor = mentorsForBottomSheet.find(
                          (m) => m.id === appointment.mentorId,
                        );

                        return (
                          <AppointmentCard
                            key={appointment.id}
                            date={appointment.meetingDate.split("T")[0]}
                            time={`${formatTimeLocal(appointment.meetingDate)} - ${formatTimeLocal(appointment.endTime)}`}
                            tz={deviceTz.badge}
                            person={mentor?.name || "Unknown Mentor"}
                            role={mentor?.role || "Mentor"}
                            mode={getModeLabel(appointment.platform)}
                            platformIcon={getPlatformIcon(appointment.platform)}
                            meetingJoinUrl={getAppointmentJoinUrl(appointment)}
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
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </>
      </LinearGradient>

      {/* Scheduling moved to /schedule-meeting pages */}

      <Modal
        visible={changeModeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setChangeModeModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <LinearGradient
            colors={['#264387', '#1D548D', '#176192']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              borderRadius: 24,
              width: Math.min(Dimensions.get('window').width * 0.92, 400),
              paddingHorizontal: 20,
              paddingVertical: 28,
              alignSelf: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <Text style={{ color: 'white', fontSize: 22, fontWeight: '700', flex: 1, textAlign: 'center' }}>
                Choose your meeting option
              </Text>
              <Pressable
                onPress={() => {
                  setChangeModeModalVisible(false);
                  setSelectedAppointmentForMode(null);
                }}
                style={{ marginLeft: 8 }}
                disabled={isUpdating}
              >
                <Text style={{ color: 'white', fontSize: 28, fontWeight: '400' }}>×</Text>
              </Pressable>
            </View>

            {meetingModes.map((mode) => (
              <Pressable
                key={mode}
                onPress={() => setSelectedMode(mode)}
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, minHeight: 36 }}
                disabled={isUpdating}
              >
                <View style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  borderWidth: 2,
                  borderColor: selectedMode === mode ? '#3CA1F0' : '#B0B8D1',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                  {selectedMode === mode && (
                    <View style={{ width: 13, height: 13, borderRadius: 6.5, backgroundColor: '#3CA1F0' }} />
                  )}
                </View>
                <Text style={{ color: selectedMode === mode ? '#EAF7FF' : '#B0B8D1', fontSize: 19, fontWeight: '500' }}>
                  {getModeLabel(mode)}
                </Text>
              </Pressable>
            ))}

            <Pressable
              onPress={handleChooseMode}
              style={{
                backgroundColor: isUpdating ? 'rgba(255, 255, 255, 0.5)' : 'white',
                borderRadius: 12,
                paddingVertical: 14,
                marginTop: 10,
                marginBottom: 2
              }}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#1535A8" />
              ) : (
                <Text style={{ color: '#1535A8', fontSize: 19, fontWeight: '700', textAlign: 'center' }}>
                  Choose
                </Text>
              )}
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>

      <SimpleSuccessModal
        visible={showModeSuccess}
        onClose={() => setShowModeSuccess(false)}
        title={modeSuccessText}
      />
    </>
  );
};

export default Appointments;



const styles = StyleSheet.create({
  screenContent: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  // Calendar Container
  calendarContainer: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
  },

  // Calendar Header with Icon
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  calendarHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  calendarIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  calendarTitle: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  calendarSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  datePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  datePillText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "700",
  },

  // Wrapper to control calendar height
  calendarWrapper: {
    maxHeight: 340, // Reduced from default height
    overflow: 'hidden',
  },

  // Appointments Container
  appointmentsContainer: {
    marginTop: 14,
    position: "relative",
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  sectionHeaderLeft: { flex: 1, minWidth: 0 },
  sectionTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  sectionSubtitle: { marginTop: 4, color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "600", lineHeight: 17 },
  countPill: {
    minWidth: 30,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(250, 204, 21, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(250, 204, 21, 0.25)",
  },
  countPillText: { color: "rgba(250, 204, 21, 0.95)", fontSize: 13, fontWeight: "900" },
  countPillMuted: {
    minWidth: 30,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  countPillTextMuted: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "900" },

  emptyStateIconWrap: {
    marginTop: 10,
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignSelf: "flex-start",
  },
});
