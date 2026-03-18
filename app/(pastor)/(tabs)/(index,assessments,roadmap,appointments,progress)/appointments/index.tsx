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
import { useCreateAppointment } from "@/hooks/appointments/useCreateAppointment";
import { useUpdateAppointment } from "@/hooks/appointments/useUpadteAppointment";
import { Mentor, useAssignedMentors } from "@/hooks/mentors/useGetAssignedMentors";
import { useAuthStore } from "@/stores";
import { Appointment, AppointmentPlatform } from "@/types/appointment.types";
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

  const { openSheet = 'false', assessmentId } = useLocalSearchParams<{
    openSheet?: string;
    assessmentId?: string;
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
  } = useAppointments({ userId: user.id });

  // Fetch assigned mentors
  const { mentors: assignedMentors, isLoading: isLoadingMentors } = useAssignedMentors(user.id);

  // Create/Reschedule appointment hook
  const {
    createAppointmentAsync,
    rescheduleAppointmentAsync,
    isCreating,
    isRescheduling
  } = useCreateAppointment({
    onSuccess: () => {
      scheduleMeetingBottomSheetRef.current?.dismiss();
      setRescheduleData(null);
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to schedule meeting');
    },
  });

  // Update appointment (for change mode)
  const { updateAppointmentAsync, isUpdating } = useUpdateAppointment();
  const { mutateAsync: cancelAppointmentAsync } = useCancelAppointment();
  const scheduleMeetingBottomSheetRef = React.useRef<BottomSheetModal>(null);

  React.useEffect(() => {
    if (openSheet === 'true' && scheduleMeetingBottomSheetRef.current) {
      setTimeout(() => {
        scheduleMeetingBottomSheetRef.current?.present();
      }, 200);
    }
  }, [openSheet]);

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

  const formatTimeIST = useCallback((isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata'
    });
  }, []);

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

  // ✅ Removed duplicate declaration (moved to top)

  const handleReschedule = (appointment: Appointment) => {
    setRescheduleData(appointment);
    scheduleMeetingBottomSheetRef.current?.present();
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
    setRescheduleData(null);
    scheduleMeetingBottomSheetRef.current?.present();
  };

  const handleScheduleMeeting = async (data: {
    mentorId: string;
    meetingDate: string;
    // startTime/startPeriod are only required when rescheduling; make them optional here
    startTime?: string;
    startPeriod?: 'AM' | 'PM' | string;
    platform: string;
    meetingLink?: string;
    notes?: string;
  }) => {
    try {
      if (rescheduleData) {
        // Reschedule existing appointment - ensure startTime/startPeriod present
        if (!data.startTime || !data.startPeriod) {
          Alert.alert('Error', 'Start time or period missing for reschedule');
          return;
        }

        await rescheduleAppointmentAsync({
          appointmentId: rescheduleData.id,
          newDate: data.meetingDate,
          startTime: data.startTime,
          startPeriod: data.startPeriod as 'AM' | 'PM',
        });
      } else {
        // Create new appointment
        await createAppointmentAsync({
          userId: user.id,
          mentorId: data.mentorId,
          meetingDate: data.meetingDate,
          platform: data.platform as AppointmentPlatform,
          meetingLink: data.meetingLink,
          notes: data.notes,
        });
      }

      if (openSheet === 'true') {
        router.replace({
          pathname: '/assessments',
        });
      }
    } catch (error) {
      console.error('Schedule error:', error);
      // Error already handled by hook
    }
  };

  const handleCloseScheduleBottomSheet = () => {
    scheduleMeetingBottomSheetRef.current?.dismiss();
    setRescheduleData(null);
  };

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
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
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
                style={{
                  width: "100%",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingTop: 20,
                }}
              >
                <View style={styles.calendarContainer}>
                  <View style={styles.calendarHeader}>
                    <Image source={icons.calendarIcon} style={{ width: 24, height: 24 }} />
                    <Text style={styles.calendarTitle}>
                      Monthly Meeting Calendar
                    </Text>
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
                    <View style={styles.rowBetween}>
                      <Text style={styles.upcomingText}>
                        {isToday(selectedDate)
                          ? `You have ${finalSelectedDateAppointments.length} Appointments Today`
                          : `You have ${finalSelectedDateAppointments.length} Appointments on ${formatDisplayDate(selectedDate)}`
                        }
                      </Text>
                    </View>
                    <View style={{ gap: 10 }}>
                      {finalSelectedDateAppointments.map((appointment) => {
                        const mentor = mentorsForBottomSheet.find(m => m.id === appointment.mentorId);

                        return (
                          <AppointmentCard
                            key={appointment.id}
                            date={appointment.meetingDate.split('T')[0]}
                            time={`${formatTimeIST(appointment.meetingDate)} - ${formatTimeIST(appointment.endTime)}`}
                            tz="IST"
                            person={mentor?.name || 'Unknown Mentor'}
                            role={mentor?.role || 'Mentor'}
                            mode={getModeLabel(appointment.platform)}
                            platformIcon={getPlatformIcon(appointment.platform)}
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
                    <View style={styles.rowBetween}>
                      <Text style={styles.upcomingText}>
                        {isToday(selectedDate)
                          ? "No Appointments Today"
                          : `No Appointments on ${formatDisplayDate(selectedDate)}`
                        }
                      </Text>
                    </View>
                    <View style={styles.noAppointmentsContainer}>
                      <Text style={styles.noAppointmentsText}>
                        Select a different date to view appointments or schedule a new meeting.
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </>
      </LinearGradient>

      <ScheduleMeetingBottomSheet
        ref={scheduleMeetingBottomSheetRef}
        mode={rescheduleData ? 'reschedule' : 'schedule'}
        existingAppointment={rescheduleData}
        onClose={handleCloseScheduleBottomSheet}
        onSchedule={handleScheduleMeeting}
        colorScheme={{
          background: Colors.darkBlueGradientOne,
          text: '#FFFFFF',
          accent: '#FFC107',
          cardBackground: 'rgba(255, 255, 255, 0.1)',
        }}
      />

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
    overflow: 'hidden',
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
