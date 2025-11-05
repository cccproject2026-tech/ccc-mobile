import GradientCalendar from "@/components/atom/calendar";
import SuccessModal from "@/components/atom/SuccessModal";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useCallback, useMemo } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
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

const BASE_TIME_SLOTS: TimeSlot[] = [
  { id: '1', startTime: '09:00', endTime: '10:00', label: '09:00 am - 10:00 am' },
  { id: '2', startTime: '11:00', endTime: '12:00', label: '11:00 am - 12:00 pm' },
  { id: '3', startTime: '01:00', endTime: '02:00', label: '01:00 pm - 02:00 pm' },
  { id: '4', startTime: '03:00', endTime: '04:00', label: '03:00 pm - 04:00 pm' },
];

const AVAILABLE_DATES = [
  '2025-10-20', '2025-10-21', '2025-10-22', '2025-10-23', '2025-10-24',
  '2025-10-27', '2025-10-28', '2025-10-29', '2025-10-30',
];

const ScheduleMeeting = () => {
  const params = useLocalSearchParams();
  const { bottom } = useSafeAreaInsets();
  const mentorData = params.mentorData ? JSON.parse(params.mentorData as string) : null;

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [meetingOption, setMeetingOption] = useState('Zoom');
  const [showMeetingOptions, setShowMeetingOptions] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const getTimeSlotsForDate = useCallback((dateString: string): TimeSlot[] => {
    if (!dateString) return [];

    const date = new Date(dateString);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 1 || dayOfWeek === 3) {
      return BASE_TIME_SLOTS.slice(0, 2);
    } else if (dayOfWeek === 2 || dayOfWeek === 4) {
      return BASE_TIME_SLOTS.slice(1, 4);
    }
    return BASE_TIME_SLOTS;
  }, []);

  const timeSlots = useMemo(() => getTimeSlotsForDate(selectedDate), [selectedDate, getTimeSlotsForDate]);
  const isScheduleValid = selectedDate && selectedTime;

  const handleSchedule = useCallback(() => {
    if (isScheduleValid) {
      setShowSuccessModal(true);
    }
  }, [isScheduleValid]);

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
              <Image source={icons.dummyUser} style={styles.avatarImg} />
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

                  <View style={styles.calendarContainer}>
                    <GradientCalendar
                      selected={selectedDate}
                      setSelected={setSelectedDate}
                      recurringAvailability={{
                        type: 'weekly',
                        daysOfWeek: [1, 2, 3, 4, 5, 6],
                      }}
                      availableDates={AVAILABLE_DATES}
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

export default ScheduleMeeting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
