import GradientCalendar from "@/components/atom/calendar";
import SuccessModal from "@/components/atom/SuccessModal";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCreateAppointment } from "@/hooks/appointments/useCreateAppointment";
import { formatTimeSlot, useMonthlyAvailability } from "@/hooks/mentors/useMentorsAvailability";
import { appointmentService } from "@/services/appointments.service";
import { useAuthStore } from "@/stores";
import { TimeSlot as APITimeSlot } from "@/types/appointment.types";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
  apiSlot: APITimeSlot; // Reference to original API slot
}

interface MeetingOption {
  id: string;
  label: string;
  icon: string;
}

const MEETING_OPTIONS: MeetingOption[] = [
  { id: 'zoom', label: 'Zoom', icon: 'videocam-outline' },
  { id: 'google-meet', label: 'Google Meet', icon: 'videocam-outline' },
  { id: 'teams', label: 'Microsoft Teams', icon: 'videocam-outline' },
  { id: 'phone', label: 'Phone Call', icon: 'call-outline' },
  { id: 'in-person', label: 'In-Person Meeting', icon: 'people-outline' },
];

const ScheduleMeeting = () => {
  const params = useLocalSearchParams();
  const { bottom } = useSafeAreaInsets();
  const mentorData = params.mentorData ? JSON.parse(params.mentorData as string) : null;
  const { user } = useAuthStore();
  const { createAppointmentAsync: createAppointment, isCreating } = useCreateAppointment({
    onSuccess: (appointment) => {
      console.log('✅ Appointment created successfully!', appointment);
      setShowSuccessModal(true);
    },
    onError: (error) => {
      console.error('❌ Appointment creation failed:', error);
      Alert.alert(
        'Booking Failed',
        error.message || 'Failed to schedule appointment. Please try again.',
        [{ text: 'OK' }]
      );
    },
  });


  const currentDate = new Date();
  const [currentMonth] = useState(currentDate.getMonth() + 1);
  const [currentYear] = useState(currentDate.getFullYear());

  // Fetch monthly availability from API
  const {
    availability: monthlyAvailability,
    isLoading,
    isError
  } = useMonthlyAvailability({
    mentorId: mentorData?.id || null,
    month: currentMonth,
    year: currentYear,
  });

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [meetingOption, setMeetingOption] = useState('Zoom');
  const [showMeetingOptions, setShowMeetingOptions] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Transform API availability to available dates array
  const availableDates = useMemo(() => {
    if (!monthlyAvailability) return [];
    return monthlyAvailability
      .filter(day => day.slots.length > 0)
      .map(day => day.date);
  }, [monthlyAvailability]);

  // Get days of week that have availability for recurring pattern
  const availableDaysOfWeek = useMemo(() => {
    if (!monthlyAvailability) return [];
    const daysSet = new Set(
      monthlyAvailability
        .filter(day => day.slots.length > 0)
        .map(day => day.day)
    );
    return Array.from(daysSet);
  }, [monthlyAvailability]);

  // Transform API slots for selected date
  const getTimeSlotsForDate = useCallback((dateString: string): TimeSlot[] => {
    if (!dateString || !monthlyAvailability) return [];

    const dayData = monthlyAvailability.find(day => day.date === dateString);
    if (!dayData || dayData.slots.length === 0) return [];

    // ✅ This is correct - you're using the API slots directly
    return dayData.slots.map((slot, index) => ({
      id: slot._id || `${dateString}-${index}`,
      startTime: `${slot.startTime} ${slot.startPeriod}`,
      endTime: `${slot.endTime} ${slot.endPeriod}`,
      label: formatTimeSlot(slot),
      apiSlot: slot,  // ✅ Keep the original slot
    }));
  }, [monthlyAvailability]);

  const timeSlots = useMemo(() =>
    getTimeSlotsForDate(selectedDate),
    [selectedDate, getTimeSlotsForDate]
  );

  const isScheduleValid = selectedDate && selectedTime;

  // Reset selected time when date changes
  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDate]);

  const handleSchedule = useCallback(async () => {
    if (!isScheduleValid || !selectedTime || !user?.id || !mentorData?.id) {
      return;
    }

    try {
      console.log('🎯 Selected slot:', selectedTime.apiSlot);
      console.log('📅 Selected date:', selectedDate);

      const meetingDate = appointmentService.createMeetingDate(
        selectedDate,
        selectedTime.apiSlot
      );

      console.log('⏰ Meeting date (UTC):', meetingDate);
      console.log('⏰ Meeting date (IST):', new Date(meetingDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

      const platform = appointmentService.mapPlatformToApiValue(meetingOption);

      let meetingLink: string | undefined;
      if (platform === 'zoom') {
        meetingLink = 'https://zoom.us/j/123456789';
      } else if (platform === 'google_meet') {
        meetingLink = 'https://meet.google.com/abc-defg-hij';
      } else if (platform === 'teams') {
        meetingLink = 'https://teams.microsoft.com/l/meetup-join/...';
      }

      const appointmentPayload = appointmentService.buildCreatePayload(
        user.id,
        mentorData.id,
        meetingDate,
        platform,
        meetingLink,
        `Meeting with ${mentorData.name}`
      );

      console.log('📤 Appointment Payload:', appointmentPayload);

      // This will trigger onCreateSuccess when successful
      await createAppointment(appointmentPayload);

      console.log('🎉 Create appointment call completed');
    } catch (error) {
      console.error('💥 Error in handleSchedule:', error);
      // Error is already handled by onCreateError callback
    }
  }, [isScheduleValid, selectedTime, user?.id, mentorData?.id, selectedDate, meetingOption, createAppointment]);

  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    router.back();
  }, []);

  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  const handleMeetingOptionSelect = useCallback((option: MeetingOption) => {
    setMeetingOption(option.label);
    setShowMeetingOptions(false);
  }, []);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => router.back()}>
        <View style={styles.headerContent}>
          <Image source={icons.forward} style={styles.backIcon} />
          <Text style={styles.headerTitle}>
            {mentorData?.name || "John Doe"}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderMentorCard = () => (
    <View style={styles.mentorCard}>
      <View style={styles.mentorContent}>
        <View style={styles.mentorInfo}>
          <LinearGradient
            colors={["#7C3AED", "#38BDF8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBorder}
          >
            <View style={styles.avatarInner}>
              {mentorData?.profileImage ? (
                <Image
                  source={{ uri: mentorData.profileImage }}
                  style={styles.avatarImg}
                />
              ) : (
                <Image source={icons.dummyUser} style={styles.avatarImg} />
              )}
            </View>
          </LinearGradient>
          <View style={styles.mentorDetails}>
            <Text style={styles.mentorName}>
              {mentorData?.name || "John Doe"}
            </Text>
            <Text style={styles.mentorRole}>
              {mentorData?.role || "Field Mentor"}
            </Text>
            <View style={styles.mentorIconContainer}>
              <Image source={icons.phone} style={styles.mentorIcon} />
              <Image source={icons.message} style={styles.mentorIcon} />
              <Image source={icons.mail} style={styles.mentorIcon} />
              <Image source={icons.whatsapp} style={styles.mentorIcon} />
            </View>
          </View>
        </View>
        <Text style={styles.profileLabel}>Profile Information :</Text>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            {mentorData?.description ||
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit ex ea commodo consequat. Duis"}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderTimeSlots = () => {
    if (timeSlots.length === 0) {
      return (
        <View style={styles.noTimeSlotsContainer}>
          <Text style={styles.noTimeSlotsText}>
            No available time slots for this date
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.timeSlotContainer}
      >
        {timeSlots.map((slot) => (
          <Pressable
            key={slot.id}
            style={[
              styles.timeSlot,
              {
                backgroundColor: selectedTime?.id === slot.id ? '#FFFFFF' : 'rgba(30, 54, 111, 1)',
                borderColor: selectedTime?.id === slot.id ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
              }
            ]}
            onPress={() => setSelectedTime(slot)}
          >
            <Text
              style={[
                styles.timeSlotText,
                { color: selectedTime?.id === slot.id ? '#1A4882' : '#FFFFFF' }
              ]}
            >
              {slot.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    );
  };

  const renderMeetingOptions = () => (
    <>
      <Pressable
        style={styles.dropdownButton}
        onPress={() => setShowMeetingOptions(!showMeetingOptions)}
      >
        <Text style={styles.dropdownText}>{meetingOption}</Text>
        <Ionicons
          name={showMeetingOptions ? "chevron-up" : "chevron-down"}
          size={16}
          color="#FFFFFF"
        />
      </Pressable>

      {showMeetingOptions && (
        <View style={styles.dropdownOptions}>
          {MEETING_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              style={styles.dropdownOption}
              onPress={() => handleMeetingOptionSelect(option)}
            >
              <Ionicons name={option.icon as any} size={16} color="#FFFFFF" />
              <Text style={styles.dropdownOptionText}>{option.label}</Text>
              {meetingOption === option.label && (
                <Ionicons name="checkmark" size={14} color="#FFC107" />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </>
  );

  const renderActionButtons = () => (
    <View style={styles.buttonContainer}>
      <Pressable style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </Pressable>

      <Pressable
        style={[
          styles.button,
          styles.scheduleButton,
          {
            backgroundColor: isScheduleValid ? '#1A4882' : 'rgba(26, 72, 130, 0.5)',
            borderColor: isScheduleValid ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)',
          }
        ]}
        onPress={handleSchedule}
        disabled={!isScheduleValid}
      >
        <Text
          style={[
            styles.scheduleButtonText,
            { opacity: isScheduleValid ? 1 : 0.6 }
          ]}
        >
          Schedule
        </Text>
      </Pressable>
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={styles.container}
      >
        <TopBar role="pastor" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading availability...</Text>
        </View>
      </LinearGradient>
    );
  }

  // Error state
  if (isError) {
    return (
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={styles.container}
      >
        <TopBar role="pastor" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="rgba(255, 255, 255, 0.5)" />
          <Text style={styles.errorText}>Failed to load mentor availability</Text>
          <Text style={styles.errorSubText}>Please try again later</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }



  return (
    <>
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={styles.container}
      >
        <TopBar role="pastor" />
        <View style={styles.scrollContainer}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: bottom * 1.5,
            }}
            showsVerticalScrollIndicator={false}
          >
            {renderHeader()}
            <View style={styles.divider} />

            <View style={styles.contentContainer}>
              {renderMentorCard()}

              <View style={styles.schedulingSection}>
                <View style={styles.schedulingHeader}>
                  <Image source={icons.calendarIcon} style={styles.calendarIcon} />
                  <Text style={styles.schedulingTitle}>Schedule a Meeting</Text>
                </View>

                <View style={styles.schedulingCard}>
                  <Text style={styles.sectionTitle}>Select Available Date</Text>

                  {availableDates.length === 0 ? (
                    <View style={styles.noAvailabilityContainer}>
                      <Ionicons name="calendar-outline" size={48} color="rgba(255, 255, 255, 0.3)" />
                      <Text style={styles.noAvailabilityText}>
                        No availability for this month
                      </Text>
                      <Text style={styles.noAvailabilitySubText}>
                        Please check back later or contact the mentor
                      </Text>
                    </View>
                  ) : (
                    <>
                      <View style={styles.calendarContainer}>
                        <GradientCalendar
                          selected={selectedDate}
                          setSelected={setSelectedDate}
                          recurringAvailability={{
                            type: 'weekly',
                            daysOfWeek: availableDaysOfWeek,
                          }}
                          availableDates={availableDates}
                          showHeader={false}
                          disablePastDates={true}
                          markToday={true}
                        />
                      </View>

                      {selectedDate && (
                        <>
                          <Text style={styles.sectionSubtitle}>Select a Time</Text>
                          {renderTimeSlots()}

                          <Text style={styles.sectionSubtitle}>
                            Preferred Meeting Option
                          </Text>
                          {renderMeetingOptions()}
                          {renderActionButtons()}
                        </>
                      )}
                    </>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </LinearGradient>

      <SuccessModal
        visible={showSuccessModal}
        message="Appointment scheduled Successfully."
        subtitle="Check your email for further info."
        onClose={handleSuccessModalClose}
      />
    </>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  scrollContainer: {
    flex: 1,
  },
  headerContainer: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backIcon: {
    width: 18,
    height: 18,
    transform: [{ scaleX: -1 }],
  },
  headerTitle: {
    color: "white",
    fontWeight: "600",
    fontSize: 17,
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginTop: 12,
  },
  contentContainer: {
    marginVertical: 10,
    paddingHorizontal: 16,
    width: "100%",
  },
  mentorCard: {
    borderWidth: 1,
    borderColor: "#FFFFFF73",
    borderRadius: 8,
    width: "100%",
  },
  mentorContent: {
    padding: 15,
  },
  mentorInfo: {
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  mentorDetails: {
    alignItems: "flex-start",
  },
  mentorName: {
    fontSize: 18,
    color: "white",
    fontWeight: "600",
    marginBottom: 4,
  },
  mentorRole: {
    fontSize: 16,
    color: "white",
    fontWeight: "400",
    marginBottom: 8,
  },
  noAvailabilityContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noAvailabilityText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  noAvailabilitySubText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  mentorIconContainer: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 10,
  },
  mentorIcon: {
    width: 18,
    height: 18,
  },
  profileLabel: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
    marginTop: 16,
  },
  summaryContainer: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FFFFFF73",
    marginTop: 8,
  },
  summaryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  gradientBorder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    backgroundColor: "#EFEFEF",
    width: 78,
    height: 78,
    borderRadius: 39,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 39,
  },
  schedulingSection: {
    marginTop: 20,
  },
  schedulingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  calendarIcon: {
    width: 16,
    height: 16,
  },
  schedulingTitle: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  schedulingCard: {
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: "white",
    fontWeight: "500",
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  calendarContainer: {
    marginBottom: 18,
  },
  timeSlotContainer: {
    marginBottom: 18,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 10,
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: '500',
  },
  noTimeSlotsContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  noTimeSlotsText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'transparent',
    marginBottom: 6,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  dropdownOptions: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 18,
    overflow: 'hidden',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'transparent',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  scheduleButton: {
    backgroundColor: "#1A4882",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  scheduleButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ScheduleMeeting;