import GradientCalendar from "@/components/atom/calendar"
import SimpleSuccessModal from "@/components/atom/SimpleSuccessModal"
import TopBar from "@/components/director/TopBar"
import { Colors } from "@/constants/Colors"
import { icons } from "@/constants/images"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { router, useLocalSearchParams } from "expo-router"
import React, { useState } from "react"
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
const ScheduleMeeting = () => {
  const params = useLocalSearchParams()
  const { bottom } = useSafeAreaInsets();
  const mentorData = params.mentorData
    ? JSON.parse(params.mentorData as string)
    : null

  // Schedule meeting states
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<any>(null)
  const [meetingOption, setMeetingOption] = useState('Zoom')
  const [showMeetingOptions, setShowMeetingOptions] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Time slots based on selected date
  const getTimeSlotsForDate = (dateString: string) => {
    if (!dateString) return [];

    const baseSlots = [
      { id: '1', startTime: '09:00', endTime: '10:00', label: '09:00 am - 10:00 am' },
      { id: '2', startTime: '11:00', endTime: '12:00', label: '11:00 am - 12:00 pm' },
      { id: '3', startTime: '01:00', endTime: '02:00', label: '01:00 pm - 02:00 pm' },
      { id: '4', startTime: '03:00', endTime: '04:00', label: '03:00 pm - 04:00 pm' },
    ];

    const date = new Date(dateString);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 1 || dayOfWeek === 3) {
      return baseSlots.slice(0, 2);
    } else if (dayOfWeek === 2 || dayOfWeek === 4) {
      return baseSlots.slice(1, 4);
    } else {
      return baseSlots;
    }
  };

  const timeSlots = getTimeSlotsForDate(selectedDate);

  const meetingOptions = [
    { id: 'zoom', label: 'Zoom', icon: 'videocam-outline' },
    { id: 'google-meet', label: 'Google Meet', icon: 'videocam-outline' },
    { id: 'teams', label: 'Microsoft Teams', icon: 'videocam-outline' },
    { id: 'phone', label: 'Phone Call', icon: 'call-outline' },
    { id: 'in-person', label: 'In-Person Meeting', icon: 'people-outline' },
  ];

  const handleSchedule = () => {
    if (selectedDate && selectedTime) {
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        router.back();
      }, 2000);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const isScheduleValid = selectedDate && selectedTime;

  return (
    <>
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <TopBar role="pastor" />
        <View style={styles.scrollContainer}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: bottom * 1.5,
            }}
          >
            {/* <PastorNavigationHeader showNameTag /> */}
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingTop: 20,
              }}
            >
              <TouchableOpacity onPress={() => router.back()}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Image
                    source={icons.forward}
                    style={{
                      width: 18,
                      height: 18,
                      transform: [{ scaleX: -1 }],
                    }}
                  />
                  <Text className="text-white font-semibold text-[17px]">
                    {mentorData?.name || "John Doe"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ width: "100%" }}>
              <View className="h-[0.5px] bg-white/30 mt-3" />
            </View>
            <View
              style={{
                marginVertical: 10,
                paddingHorizontal: 16,
                width: "100%",
              }}
            >
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#FFFFFF73",
                  borderRadius: 8,
                  width: "100%",
                }}
              >
                <View
                  style={{
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: 15,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 20,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LinearGradient
                      colors={["#7C3AED", "#38BDF8"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientBorder}
                    >
                      <View style={styles.avatarInner}>
                        <Image
                          source={icons.dummyUser}
                          style={styles.avatarImg}
                        />
                      </View>
                    </LinearGradient>
                    <View
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          color: "white",
                          fontWeight: "600",
                          marginBottom: 4,
                        }}
                      >
                        {mentorData?.name || "John Doe"}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          color: "white",
                          fontWeight: "400",
                          marginBottom: 8,
                        }}
                      >
                        {mentorData?.role || "Field Mentor"}
                      </Text>
                      <View
                        style={[styles.mentorIconContainer, { paddingTop: 10 }]}
                      >
                        <Image source={icons.phone} style={styles.MentorIcon} />
                        <Image
                          source={icons.message}
                          style={styles.MentorIcon}
                        />
                        <Image source={icons.mail} style={styles.MentorIcon} />
                        <Image
                          source={icons.whatsapp}
                          style={styles.MentorIcon}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={styles.sectionMargin}>
                    <Text className="text-white font-medium text-[16px] mt-4">
                      Profile Information :
                    </Text>
                  </View>

                  {/* Intro Summary */}
                  <View style={styles.summaryContainer}>
                    <Text style={styles.whiteText}>
                      {mentorData?.description ||
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit ex ea commodo consequat. Duis"}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={{
                  marginTop: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  <View className="flex flex-row items-center gap-2">
                    <Ionicons name="calendar-outline" size={24} color="white" />
                    <Text className="text-white font-semibold text-[16px] flex flex-row items-center gap-2">
                      Schedule a Meeting
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    borderWidth: 2,
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: 8,
                    padding: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: "white",
                      fontWeight: "500",
                      marginBottom: 12,
                    }}
                  >
                    Select Available Date
                  </Text>

                  {/* Calendar */}
                  <View style={styles.calendarContainer}>
                    <GradientCalendar
                      selected={selectedDate}
                      setSelected={setSelectedDate}
                      recurringAvailability={{
                        type: 'weekly',
                        daysOfWeek: [1, 2, 3, 4, 5, 6],
                      }}
                      availableDates={[
                        '2025-10-20',
                        '2025-10-21',
                        '2025-10-22',
                        '2025-10-23',
                        '2025-10-24',
                        '2025-10-27',
                        '2025-10-28',
                        '2025-10-29',
                        '2025-10-30',
                      ]}
                      showHeader={false}
                      disablePastDates={true}
                      markToday={true}
                    />
                  </View>

                  {/* Time Selection - Only show if date is selected */}
                  {selectedDate && (
                    <>
                      <Text style={styles.sectionTitle}>
                        Select a Time
                      </Text>

                      {timeSlots.length > 0 ? (
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
                                  backgroundColor: selectedTime?.id === slot.id
                                    ? '#FFFFFF'
                                    : 'transparent',
                                  borderColor: selectedTime?.id === slot.id
                                    ? '#FFFFFF'
                                    : 'rgba(255, 255, 255, 0.5)',
                                }
                              ]}
                              onPress={() => setSelectedTime(slot)}
                            >
                              <Text style={[
                                styles.timeSlotText,
                                {
                                  color: selectedTime?.id === slot.id
                                    ? '#1A4882'
                                    : '#FFFFFF'
                                }
                              ]}>
                                {slot.label}
                              </Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                      ) : (
                        <View style={styles.noTimeSlotsContainer}>
                          <Text style={styles.noTimeSlotsText}>
                            No available time slots for this date
                          </Text>
                        </View>
                      )}

                      {/* Meeting Options */}
                      <Text style={styles.sectionTitle}>
                        Preferred Meeting Option
                      </Text>

                      <Pressable
                        style={styles.dropdownButton}
                        onPress={() => setShowMeetingOptions(!showMeetingOptions)}
                      >
                        <Text style={styles.dropdownText}>
                          {meetingOptions.find(option => option.id === meetingOption.toLowerCase().replace(' ', '-'))?.label || meetingOption}
                        </Text>
                        <Ionicons
                          name={showMeetingOptions ? "chevron-up" : "chevron-down"}
                          size={16}
                          color="#FFFFFF"
                        />
                      </Pressable>

                      {/* Meeting Options Dropdown */}
                      {showMeetingOptions && (
                        <View style={styles.dropdownOptions}>
                          {meetingOptions.map((option) => (
                            <Pressable
                              key={option.id}
                              style={styles.dropdownOption}
                              onPress={() => {
                                setMeetingOption(option.label);
                                setShowMeetingOptions(false);
                              }}
                            >
                              <Ionicons name={option.icon as any} size={16} color="#FFFFFF" />
                              <Text style={styles.dropdownOptionText}>
                                {option.label}
                              </Text>
                              {meetingOption === option.label && (
                                <Ionicons name="checkmark" size={14} color="#FFC107" />
                              )}
                            </Pressable>
                          ))}
                        </View>
                      )}

                      {/* Action Buttons */}
                      <View style={styles.buttonContainer}>
                        <Pressable
                          style={[styles.button, styles.cancelButton]}
                          onPress={handleCancel}
                        >
                          <Text style={styles.cancelButtonText}>
                            Cancel
                          </Text>
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
                          <Text style={[
                            styles.scheduleButtonText,
                            { opacity: isScheduleValid ? 1 : 0.6 }
                          ]}>
                            Schedule
                          </Text>
                        </Pressable>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </LinearGradient>

      <SimpleSuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        actionType="scheduled"
      />
    </>
  )
}

export default ScheduleMeeting

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 18,
  },
  sectionMargin: {
    marginVertical: 10,
  },
  whiteText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  summaryContainer: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FFFFFF73",
  },
  mentorIconContainer: {
    flexDirection: "row",
    gap: 10,
  },
  MentorIcon: {
    width: 18,
    height: 18,
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
    resizeMode: 'cover',
  },
  // Schedule meeting styles
  calendarContainer: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  timeSlotContainer: {
    marginBottom: 18,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
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
})
