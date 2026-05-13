import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useMeetingScheduler } from "../../hooks/appointments/useMeetingScheduler";
import {
    formatTimeSlot,
    useMonthlyAvailability,
    useWeeklyAvailability,
} from "@/hooks/mentors/useMentorsAvailability";
import { appointmentService } from "@/services/appointments.service";
import { useUsersByRole } from "@/hooks/useUsersByRole";
import { useAuthStore } from "@/stores";
import {
    TimeSlot as APITimeSlot,
    Appointment,
    AppointmentPlatform,
} from "@/types/appointment.types";
import { UserRole } from "@/types/auth.types";
import {
    getFontSize,
    getIconSize,
    getSpacing,
    isSmallDevice,
} from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import {
    BottomSheetBackdrop,
    BottomSheetFlatList,
    BottomSheetModal,
    BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GradientCalendar from "../atom/calendar";
import SimpleSuccessModal from "../atom/SimpleSuccessModal";
import SearchBar from "./SearchBar";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
  apiSlot: APITimeSlot;
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  profileImage?: string;
  profilePicture?: string;
}

export interface ScheduleMeetingBottomSheetProps {
  onClose: () => void;
  /**
   * Legacy callback (kept for backward compatibility).
   * Submission is handled inside this component; use this only for side-effects.
   */
  onSchedule?: (data: {
    mentorId: string;
    meetingDate: string;
    platform: string;
    meetingLink?: string;
    notes?: string;
    // Optional fields for rescheduling (not required for initial schedule)
    startTime?: string;
    startPeriod?: "AM" | "PM" | string;
    selectedMentor?: Mentor;
    selectedDate?: string;
    selectedTime?: TimeSlot;
  }) => void;
  /** Called after a successful schedule/reschedule. */
  onCompleted?: (result: { appointmentId: string; mode: "schedule" | "reschedule" }) => void;
  /** Optional prefill to skip step 1. */
  initialPerson?: Mentor | null;
  /** Optional prefill for role tab. */
  initialRole?: UserRole;
  /** Optional override to provide the selectable people list (skips role tabs + users-by-role). */
  peopleOverride?: Mentor[];
  mode?: "schedule" | "reschedule";
  existingAppointment?: Appointment | null;
  colorScheme?: {
    background?: string;
    text?: string;
    accent?: string;
    cardBackground?: string;
  };
  disableOutsideClose?: boolean;
  showCancelButton?: boolean;
  onScheduleComplete?: () => void;
}
const ScheduleMeetingBottomSheet = forwardRef<
  BottomSheetModal,
  ScheduleMeetingBottomSheetProps
>(
  (
    {
      onClose,
      onSchedule,
      onCompleted,
      initialPerson = null,
      initialRole,
      peopleOverride,
      mode = "schedule",
      existingAppointment,
      colorScheme = {
        background: "#1E3A6F",
        text: "#FFFFFF",
        accent: "#FFC107",
        cardBackground: "rgba(255, 255, 255, 0.1)",
      },
      disableOutsideClose = false,
      showCancelButton = true,
      onScheduleComplete,
    },
    ref,
  ) => {
    const { bottom } = useSafeAreaInsets();
    const snapPoints = useMemo(() => ["95%"], []);

    // Get current user and their role
    const { user: currentUser } = useAuthStore();
    const currentUserRole = currentUser?.role || "pastor";

    // Initialize state
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(
      mode === "reschedule" ? 2 : initialPerson?.id ? 2 : 1,
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(initialPerson);
    const [selectedDate, setSelectedDate] = useState<string>(
      mode === "reschedule" && existingAppointment
        ? existingAppointment.meetingDate.split("T")[0]
        : "",
    );
    const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
    const [meetingOption, setMeetingOption] = useState("Zoom");
    const [showMeetingOptions, setShowMeetingOptions] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const submitGuardRef = useRef(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Determine initial role tab based on currentUserRole
    const initialSelectedRole = useMemo(() => {
      if (currentUserRole === "mentor") return "pastor" as UserRole;
      return "mentor" as UserRole;
    }, [currentUserRole]);

    const [selectedRole, setSelectedRole] =
      useState<UserRole>(initialRole || initialSelectedRole);

    const shouldUseOverride = Boolean(peopleOverride && peopleOverride.length > 0);

    // Fetch users based on selectedRole (single page; no infinite scroll to avoid pagination issues)
    const {
      data: usersData,
      isLoading: isLoadingUsers,
    } = useUsersByRole(selectedRole, 200);

    const allUsers = useMemo(() => {
      if (!usersData) {
        return [];
      }
      return usersData.users ?? [];
    }, [usersData]);

    // Format users for the list
    const formattedUsers: Mentor[] = useMemo(() => {
      if (shouldUseOverride) return peopleOverride || [];
      return allUsers.map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName || ""}`.trim(),
        role: user.role,
        profilePicture: user.profilePicture,
      }));
    }, [allUsers, peopleOverride, shouldUseOverride]);

    // Filter users based on search query
    const filteredMentors = useMemo(() => {
      if (!searchQuery) return formattedUsers;
      const query = searchQuery.toLowerCase();
      return formattedUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query),
      );
    }, [formattedUsers, searchQuery]);

    // Get available roles for the current user to schedule with
    const availableRoleTabs = useMemo(() => {
      if (currentUserRole === "pastor") {
        return [
          { label: "Mentors", value: "mentor" as UserRole },
          { label: "Directors", value: "director" as UserRole },
        ];
      } else if (currentUserRole === "mentor") {
        return [
          { label: "Pastor", value: "pastor" as UserRole },
          { label: "Directors", value: "director" as UserRole },
        ];
      } else if (currentUserRole === "director") {
        return [
          { label: "Mentors", value: "mentor" as UserRole },
          { label: "Pastor", value: "pastor" as UserRole },
        ];
      }
      return [{ label: "Mentors", value: "mentor" as UserRole }];
    }, [currentUserRole]);

    // ✅ Initialize mentor if rescheduling
    useEffect(() => {
      if (
        mode === "reschedule" &&
        existingAppointment &&
        formattedUsers.length > 0
      ) {
        const found = formattedUsers.find(
          (m) => m.id === existingAppointment.mentorId,
        );
        if (found) setSelectedMentor(found);
      }
    }, [mode, existingAppointment, formattedUsers]);

    // Prefill (schedule mode) - allows redirecting into this flow with a selected person.
    useEffect(() => {
      if (mode !== "schedule") return;
      if (!initialPerson?.id) return;
      setSelectedMentor(initialPerson);
      setCurrentStep(2);
    }, [initialPerson, mode]);

    // Get current month and year for availability
    const currentDate = new Date();
    const [currentMonth, setCurrentMonth] = useState(
      currentDate.getMonth() + 1,
    );
    const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

    /**
     * The backend models availability under the *mentor* participant.
     * - If the logged-in user is a mentor and they are scheduling with a pastor/director,
     *   availability must be fetched for the logged-in mentor (currentUser.id).
     * - Otherwise (pastor/director scheduling with a mentor), availability belongs to the selected mentor.
     * - Reschedule always uses the appointment's mentorId.
     */
    const mentorIdForAvailability = useMemo(() => {
      if (mode === "reschedule" && existingAppointment) {
        return existingAppointment.mentorId;
      }
      if (currentUserRole === "mentor") {
        return currentUser?.id ?? null;
      }
      return selectedMentor?.id ?? null;
    }, [mode, existingAppointment, currentUserRole, currentUser?.id, selectedMentor?.id]);

    const shouldFetchAvailability = Boolean(mentorIdForAvailability) && isSheetOpen;

    /**
     * IMPORTANT: availability is modeled under the *mentor* participant.
     * The hook uses `role` only to decide whether to generate default slots for
     * pastors/mentees. When the availability owner is a mentor (common case),
     * we must pass "mentor" here — NOT the currently selected role tab.
     */
    const availabilityOwnerRole = useMemo<UserRole>(() => {
      if (mode === "reschedule") return "mentor";
      if (currentUserRole === "mentor") return "mentor";
      // For pastor/director scheduling, availability belongs to the selected mentor/director tab's user.
      // Prefer the selected person's role when present, otherwise fall back to the selected tab.
      return (selectedMentor?.role as UserRole) || selectedRole;
    }, [mode, currentUserRole, selectedMentor?.role, selectedRole]);

    // Fetch availability for selected mentor (only when mentorId is defined)
    const {
      availability: monthlyAvailability,
      isLoading: isLoadingAvailability,
    } = useMonthlyAvailability(
      {
        mentorId: shouldFetchAvailability
          ? (mentorIdForAvailability as string)
          : null,
        month: currentMonth,
        year: currentYear,
        role: availabilityOwnerRole,
      },
      {
        enabled: shouldFetchAvailability,
        allowDefaultForMentee: false,
      },
    );

    // Fetch mentor settings from weekly availability (only when mentorId is defined)
    const { availability: settings } = useWeeklyAvailability(
      mentorIdForAvailability,
      { role: availabilityOwnerRole, enabled: shouldFetchAvailability },
    );

    // Fetch mentor appointments to check max bookings (availability owner)
    const { appointments: mentorAppointments } = useAppointments(
      mentorIdForAvailability ? { mentorId: mentorIdForAvailability } : {},
    );

    // Fetch appointments for the "mentee/user" participant to check overlaps.
    // When a mentor schedules with a pastor/director, the mentee is the selected user.
    const overlapUserId =
      currentUserRole === "mentor"
        ? selectedMentor?.id
        : currentUser?.id;
    const { appointments: userAppointments } = useAppointments({
      userId: overlapUserId || undefined,
    });

    const { submit, isSubmitting: isSchedulerSubmitting } = useMeetingScheduler({
      mode,
      currentUserId: currentUser?.id,
      currentUserRole,
      selectedPerson: selectedMentor
        ? { id: selectedMentor.id, name: selectedMentor.name, role: selectedMentor.role }
        : null,
      existingAppointment,
      selectedDayYmd: selectedDate,
      selectedSlot: selectedTime?.apiSlot ?? null,
      meetingOptionLabel: meetingOption,
      settings,
      mentorAppointments,
      userAppointments,
    });

    // Debug log only after mentorId is available
    useEffect(() => {
      if (!mentorIdForAvailability) return;
      console.log("🔍 Reschedule Debug:", {
        mode,
        mentorId: mentorIdForAvailability,
        enabled: shouldFetchAvailability,
        hasAvailability: !!monthlyAvailability,
        availabilityLength: monthlyAvailability?.length || 0,
      });
    }, [mode, mentorIdForAvailability, shouldFetchAvailability, monthlyAvailability]);

    // Transform API availability to available dates
    const availableDates = useMemo(() => {
      if (!shouldFetchAvailability || !monthlyAvailability) {
        return [];
      }
      const dates = monthlyAvailability
        .filter((day: any) => {
          const raw = Array.isArray(day.rawSlots) ? day.rawSlots : [];
          const slots = Array.isArray(day.slots) ? day.slots : [];
          return raw.length > 0 || slots.length > 0;
        })
        .map((day: any) => {
          const dateValue = day.date;
          if (typeof dateValue === "string" && dateValue.includes("T")) {
            return dateValue.split("T")[0];
          }
          return dateValue;
        });
      return dates;
    }, [shouldFetchAvailability, monthlyAvailability]);

    const ymdToday = useMemo(() => {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }, []);

    const ymdTomorrow = useMemo(() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }, []);

    const hasDate = useCallback((ymd: string) => {
      return availableDates.includes(ymd);
    }, [availableDates]);

    const pickThisWeek = useCallback(() => {
      if (!availableDates.length) return null;
      const start = new Date(`${ymdToday}T00:00:00`);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      const best = availableDates.find((ymd) => {
        const d = new Date(`${ymd}T00:00:00`);
        return d >= start && d <= end;
      });
      return best || null;
    }, [availableDates, ymdToday]);

    // Get days of week that have availability
    const availableDaysOfWeek = useMemo(() => {
      if (!shouldFetchAvailability || !monthlyAvailability) return [];
      const daysSet = new Set(
        monthlyAvailability
          .filter((day: any) => {
            const raw = Array.isArray(day.rawSlots) ? day.rawSlots : [];
            const slots = Array.isArray(day.slots) ? day.slots : [];
            return raw.length > 0 || slots.length > 0;
          })
          .map((day: any) => day.day),
      );
      return Array.from(daysSet);
    }, [shouldFetchAvailability, monthlyAvailability]);

    // Transform API slots for selected date
    const getTimeSlotsForDate = useCallback(
      (dateString: string): TimeSlot[] => {
        if (!shouldFetchAvailability || !dateString || !monthlyAvailability)
          return [];

        const dayData = monthlyAvailability.find((day: any) => {
          const dateValue = day.date;
          if (typeof dateValue === "string" && dateValue.includes("T")) {
            return dateValue.split("T")[0] === dateString;
          }
          return dateValue === dateString;
        }) as any;

        if (!dayData) return [];

        const rawSlots = Array.isArray(dayData.rawSlots)
          ? (dayData.rawSlots as APITimeSlot[])
          : [];
        const slotsFromApi = Array.isArray(dayData.slots)
          ? (dayData.slots as APITimeSlot[])
          : [];
        const slots = rawSlots.length > 0 ? rawSlots : slotsFromApi;

        if (!slots || slots.length === 0) return [];

        return slots.map((slot, index) => ({
          id: slot._id || `${dateString}-${index}`,
          startTime: `${slot.startTime} ${slot.startPeriod}`,
          endTime: `${slot.endTime} ${slot.endPeriod}`,
          label: formatTimeSlot(slot),
          apiSlot: slot,
        }));
      },
      [monthlyAvailability, shouldFetchAvailability],
    );

    const timeSlots = useMemo(
      () => getTimeSlotsForDate(selectedDate),
      [selectedDate, getTimeSlotsForDate],
    );

    const meetingOptions = [
      { id: "zoom", label: "Zoom", icon: "videocam-outline" },
      { id: "google_meet", label: "Google Meet", icon: "videocam-outline" },
      { id: "teams", label: "Microsoft Teams", icon: "videocam-outline" },
      { id: "phone", label: "Phone Call", icon: "call-outline" },
      { id: "in_person", label: "In-Person Meeting", icon: "people-outline" },
    ];

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior={disableOutsideClose ? "none" : "close"}
        />
      ),
      [disableOutsideClose],
    );

    const handleBack = () => {
      if (mode === "reschedule") {
        // Reschedule is typically invoked from an existing meeting context.
        // Closing is the simplest mental model.
        handleClose();
        return;
      }
      if (currentStep === 3) {
        setCurrentStep(2);
        return;
      }
      if (currentStep === 2) {
        setCurrentStep(1);
      }
    };

    const handleReview = () => {
      if (!selectedMentor || !selectedDate || !selectedTime) return;
      setCurrentStep(3);
    };

    const handleSchedule = async () => {
      if (submitGuardRef.current) return;
      submitGuardRef.current = true;
      try {
        const result = await submit();

        // Legacy callback (side-effects only)
        if (onSchedule && selectedMentor && selectedDate && selectedTime) {
          onSchedule({
            mentorId: selectedMentor.id,
            meetingDate: appointmentService.createMeetingDate(
              selectedDate,
              selectedTime.apiSlot,
            ),
            platform: meetingOption,
            meetingLink: undefined,
            notes: `Meeting with ${selectedMentor.name}`,
            ...(mode === "reschedule" && {
              startTime: selectedTime.apiSlot.startTime,
              startPeriod: selectedTime.apiSlot.startPeriod,
            }),
            selectedMentor,
            selectedDate,
            selectedTime,
          });
        }

        onScheduleComplete?.();
        onCompleted?.({ appointmentId: result.appointmentId, mode });

        setShowSuccessModal(true);
        setTimeout(() => {
          onClose();
          resetForm();
        }, 900);
      } catch (e: any) {
        const title = e?.title || "Booking failed";
        const message = e?.message || "Failed to schedule meeting. Please try again.";
        Alert.alert(title, message);
      } finally {
        submitGuardRef.current = false;
      }
    };

    const resetForm = () => {
      setCurrentStep(mode === "reschedule" ? 2 : 1);
      setSelectedMentor(null);
      setSelectedDate("");
      setSelectedTime(null);
      setSearchQuery("");
      setMeetingOption("Zoom");
      setShowMeetingOptions(false);
      setShowSuccessModal(false);
    };

  const handleClose = () => {
    if (!disableOutsideClose) {
      onClose();
      setTimeout(() => {
        resetForm();
      }, 300);
    }
  };

    const isStep2Valid = Boolean(selectedDate && selectedTime);

    const showMentorSelection = mode === "schedule" && currentStep === 1;
    const showDateTimeSelection = currentStep === 2;
    const showConfirm = currentStep === 3;

    const progress = useMemo(() => {
      const steps = [
        { key: "person", label: "Person", done: mode === "reschedule" ? true : Boolean(selectedMentor?.id) },
        { key: "time", label: "Time", done: Boolean(selectedDate && selectedTime) },
        { key: "confirm", label: "Confirm", done: currentStep === 3 },
      ] as const;
      return steps;
    }, [currentStep, mode, selectedDate, selectedMentor?.id, selectedTime]);

    return (
      <>
        <BottomSheetModal
          ref={ref}
          snapPoints={snapPoints}
          enablePanDownToClose={!disableOutsideClose}
          backgroundComponent={() => null}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={styles.handleIndicator}
          onChange={(index) => setIsSheetOpen(index >= 0)}
          onDismiss={handleClose}
        >
          <LinearGradient
            colors={["#264387", "#1D548D", "#176192"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              flex: 1,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 20,
            }}
          >
            <View style={styles.contentContainer}>
              <View style={styles.progressWrap}>
                {progress.map((s, idx) => (
                  <React.Fragment key={s.key}>
                    <View style={styles.progressStep}>
                      <View
                        style={[
                          styles.progressDot,
                          s.done ? styles.progressDotDone : styles.progressDotTodo,
                        ]}
                      >
                        {s.done ? (
                          <Ionicons name="checkmark" size={14} color="#1E3A6F" />
                        ) : (
                          <Text style={styles.progressDotText}>{idx + 1}</Text>
                        )}
                      </View>
                      <Text style={styles.progressLabel} numberOfLines={1}>
                        {s.label}
                      </Text>
                    </View>
                    {idx !== progress.length - 1 ? (
                      <View style={styles.progressLine} />
                    ) : null}
                  </React.Fragment>
                ))}
              </View>
            {showMentorSelection ? (
              // Step 1: Select Mentor
              <View style={{ flex: 1 }}>
                <View style={styles.stepContentNoScroll}>
                  {/* <View */}
                  {/* <View
                    style={[
                      styles.titleContainer,
                      { borderColor: "rgba(255, 255, 255, 0.3)" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepTitleLarge,
                        { color: colorScheme.text },
                      ]}
                    >
                      Select for the Meeting
                    </Text>
                  </View>
                  </View> */}

                  {!shouldUseOverride && (
                    <View style={styles.roleSelectorContainer}>
                      {availableRoleTabs.map((tab) => (
                        <Pressable
                          key={tab.value}
                          style={[
                            styles.roleTab,
                            selectedRole === tab.value && styles.activeRoleTab,
                            selectedRole === tab.value
                              ? styles.activeRoleTab
                              : styles.inactiveRoleTab,
                          ]}
                          onPress={() => setSelectedRole(tab.value)}
                        >
                          <Text
                            style={[
                              styles.roleTabText,
                              selectedRole === tab.value &&
                                styles.activeRoleTabText,
                            ]}
                          >
                            {tab.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  <View style={styles.searchBarContainer}>
                    <SearchBar
                      backgroundColor="rgba(251, 243, 243, 0.75)"
                      placeholderTextColor="rgba(0, 31, 193, 1)"
                      placeholder="Search"
                      value={searchQuery}
                      onChangeValue={setSearchQuery}
                    />
                  </View>
                </View>

                <View
                  style={[
                    styles.mentorListContainer,
                    { borderColor: "rgba(255, 255, 255, 0.3)" },
                  ]}
                >
                  {isLoadingUsers ? (
                    <View style={styles.emptyStateContainer}>
                      <ActivityIndicator color={colorScheme.text} />
                    </View>
                  ) : filteredMentors.length > 0 ? (
                    <BottomSheetFlatList
                      data={filteredMentors}
                      keyExtractor={(item: any) => item.id}
                      // contentContainerStyle={{ backgroundColor: 'red',maxHeight: Dimensions.get('window').height * 0.5}}
                      renderItem={({ item: mentor }: { item: Mentor }) => (
                        <Pressable
                          key={mentor.id}
                          style={styles.mentorItemStep1}
                          onPress={() => {
                            setSelectedMentor(mentor);
                            // Auto-advance to time selection (no extra Next step).
                            setCurrentStep(2);
                          }}
                        >
                          <View
                            style={[
                              styles.radioButtonStep1,
                              {
                                borderColor: "rgba(255, 255, 255, 0.6)",
                                backgroundColor:
                                  selectedMentor?.id === mentor.id
                                    ? "#FFFFFF"
                                    : "transparent",
                              },
                            ]}
                          >
                            {selectedMentor?.id === mentor.id && (
                              <View style={styles.radioInner} />
                            )}
                          </View>

                          {mentor.profilePicture || mentor.profileImage ? (
                            <Image
                              source={{
                                uri:
                                  mentor.profilePicture || mentor.profileImage,
                              }}
                              style={styles.mentorImageStep1}
                            />
                          ) : (
                            <View
                              style={[
                                styles.mentorImagePlaceholderStep1,
                                { backgroundColor: colorScheme.cardBackground },
                              ]}
                            >
                              <Ionicons
                                name="person"
                                size={getIconSize(18)}
                                color={colorScheme.text}
                              />
                            </View>
                          )}

                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.mentorNameStep1,
                                { color: colorScheme.text },
                              ]}
                            >
                              {mentor.name}
                            </Text>
                            <Text
                              style={[
                                styles.mentorRoleStep1,
                                { color: "rgba(255, 255, 255, 0.6)" },
                              ]}
                            >
                              {mentor.role}
                            </Text>
                          </View>
                        </Pressable>
                      )}
                      contentContainerStyle={{ paddingBottom: getSpacing(20) }}
                      onEndReached={undefined}
                      onEndReachedThreshold={0.5}
                    />
                  ) : (
                    <View style={styles.emptyStateContainer}>
                      <Text
                        style={[
                          styles.emptyStateText,
                          { color: "rgba(255, 255, 255, 0.6)" },
                        ]}
                      >
                        No {selectedRole === "mentor" ? "mentors" : selectedRole === "pastor" ? "pastors" : "users"} found
                      </Text>
                    </View>
                  )}
                </View>

                <View style={[styles.step1Footer, { paddingBottom: bottom + getSpacing(12) }]}>
                  {showCancelButton && (
                    <Pressable
                      style={[
                        styles.cancelButton,
                        {
                          borderColor: "rgba(255, 255, 255, 0.5)",
                          backgroundColor: "#FFFFFF",
                        },
                      ]}
                      onPress={handleClose}
                    >
                      <Text
                        style={[styles.cancelButtonText, { color: "#4A5BCC" }]}
                      >
                        Cancel
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ) : showDateTimeSelection ? (
              <View style={{ flex: 1 }}>
                <BottomSheetScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: bottom + getSpacing(120) }}
                >
                  <View style={styles.stepContent}>
                  {mode === "reschedule" && selectedMentor && (
                    <View
                      style={[
                        styles.titleContainer,
                        {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                          marginBottom: 16,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sectionTitle,
                          { color: colorScheme.text },
                        ]}
                      >
                        Rescheduling with {selectedMentor.name}
                      </Text>
                    </View>
                  )}

                  <Text
                    style={[styles.stepTitle, { color: colorScheme.text }]}
                  >
                    Schedule New Meeting
                  </Text>

                  <View style={styles.quickDatesRow}>
                    <Pressable
                      style={[
                        styles.quickDateChip,
                        hasDate(ymdToday) && selectedDate === ymdToday && styles.quickDateChipActive,
                        !hasDate(ymdToday) && styles.quickDateChipDisabled,
                      ]}
                      onPress={() => hasDate(ymdToday) && setSelectedDate(ymdToday)}
                      disabled={!hasDate(ymdToday)}
                    >
                      <Text
                        style={[
                          styles.quickDateChipText,
                          hasDate(ymdToday) && selectedDate === ymdToday && styles.quickDateChipTextActive,
                        ]}
                      >
                        Today
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.quickDateChip,
                        hasDate(ymdTomorrow) && selectedDate === ymdTomorrow && styles.quickDateChipActive,
                        !hasDate(ymdTomorrow) && styles.quickDateChipDisabled,
                      ]}
                      onPress={() => hasDate(ymdTomorrow) && setSelectedDate(ymdTomorrow)}
                      disabled={!hasDate(ymdTomorrow)}
                    >
                      <Text
                        style={[
                          styles.quickDateChipText,
                          hasDate(ymdTomorrow) && selectedDate === ymdTomorrow && styles.quickDateChipTextActive,
                        ]}
                      >
                        Tomorrow
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.quickDateChip,
                        styles.quickDateChipGrow,
                        selectedDate === pickThisWeek() && Boolean(pickThisWeek()) && styles.quickDateChipActive,
                        !pickThisWeek() && styles.quickDateChipDisabled,
                      ]}
                      onPress={() => {
                        const d = pickThisWeek();
                        if (d) setSelectedDate(d);
                      }}
                      disabled={!pickThisWeek()}
                    >
                      <Text
                        style={[
                          styles.quickDateChipText,
                          selectedDate === pickThisWeek() && Boolean(pickThisWeek()) && styles.quickDateChipTextActive,
                        ]}
                      >
                        This week
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.calendarContainer}>
                    <GradientCalendar
                      selected={selectedDate}
                      setSelected={setSelectedDate}
                      onMonthChange={(month, year) => {
                        setCurrentMonth(month);
                        setCurrentYear(year);
                      }}
                      recurringAvailability={{
                        type: "weekly",
                        daysOfWeek: availableDaysOfWeek,
                      }}
                      availableDates={availableDates}
                      showHeader={false}
                      disablePastDates={true}
                      markToday={false}
                    />
                  </View>

                  {selectedDate && (
                    <>
                      <Text
                        style={[
                          styles.sectionTitle,
                          { color: colorScheme.text },
                        ]}
                      >
                        Choose a Time
                      </Text>

                      {isLoadingAvailability ? (
                        <View style={styles.noTimeSlotsContainer}>
                          <ActivityIndicator color={colorScheme.text} />
                        </View>
                      ) : timeSlots.length > 0 ? (
                        <FlatList
                          horizontal
                          data={timeSlots}
                          keyExtractor={(item) => item?.id}
                          renderItem={({ item }) => (
                            <Pressable
                              style={[
                                styles.timeSlotGridItem,
                                {
                                  backgroundColor:
                                    selectedTime?.id === item.id
                                      ? "#FFFFFF"
                                      : "transparent",
                                  borderColor:
                                    selectedTime?.id === item.id
                                      ? "#FFFFFF"
                                      : "rgba(255, 255, 255, 0.6)",
                                },
                              ]}
                              onPress={() => setSelectedTime(item)}
                            >
                              <Text
                                style={[
                                  styles.timeSlotText,
                                  {
                                    color:
                                      selectedTime?.id === item.id
                                        ? colorScheme.background
                                        : colorScheme.text,
                                  },
                                ]}
                              >
                                {item.label}
                              </Text>
                            </Pressable>
                          )}
                          contentContainerStyle={{ gap: 10 }}
                          showsHorizontalScrollIndicator={false}
                        />
                      ) : (
                        <View style={styles.noTimeSlotsContainer}>
                          <Text
                            style={[
                              styles.noTimeSlotsText,
                              { color: `${colorScheme.text}80` },
                            ]}
                          >
                            No available time slots for this date
                          </Text>
                        </View>
                      )}
                    </>
                  )}

                      <Text
                        style={[
                          styles.sectionTitle,
                          { color: colorScheme.text },
                        ]}
                      >
                        Preferred Meeting Option
                      </Text>

                      <Pressable
                        style={[
                          styles.dropdownButton,
                          {
                            backgroundColor: "transparent",
                            borderColor: `${colorScheme.text}50`,
                          },
                        ]}
                        onPress={() =>
                          setShowMeetingOptions(!showMeetingOptions)
                        }
                      >
                        <Text
                          style={[
                            styles.dropdownText,
                            { color: colorScheme.text },
                          ]}
                        >
                          {meetingOption}
                        </Text>
                        <Ionicons
                          name={
                            showMeetingOptions ? "chevron-up" : "chevron-down"
                          }
                          size={getIconSize(16)}
                          color={colorScheme.text}
                        />
                      </Pressable>

                      {showMeetingOptions && (
                        <View
                          style={[
                            styles.dropdownOptions,
                            {
                              backgroundColor: "transparent",
                              borderColor: `${colorScheme.text}30`,
                            },
                          ]}
                        >
                          {meetingOptions.map((option) => (
                            <Pressable
                              key={option.id}
                              style={styles.dropdownOption}
                              onPress={() => {
                                setMeetingOption(option.label);
                                setShowMeetingOptions(false);
                              }}
                            >
                              <Ionicons
                                name={option.icon as any}
                                size={getIconSize(16)}
                                color={colorScheme.text}
                              />
                              <Text
                                style={[
                                  styles.dropdownOptionText,
                                  { color: colorScheme.text },
                                ]}
                              >
                                {option.label}
                              </Text>
                              {meetingOption === option.label && (
                                <Ionicons
                                  name="checkmark"
                                  size={getIconSize(14)}
                                  color={colorScheme.accent}
                                />
                              )}
                            </Pressable>
                          ))}
                        </View>
                      )}

                  </View>
                </BottomSheetScrollView>

                <View style={[styles.stickyFooter, { paddingBottom: bottom + getSpacing(12) }]}>
                  <Pressable
                    style={[
                      styles.cancelButton,
                      {
                        borderColor: `${colorScheme.text}80`,
                        backgroundColor: "#FFFFFF",
                      },
                    ]}
                    onPress={handleBack}
                    disabled={isSchedulerSubmitting}
                  >
                    <Text style={[styles.cancelButtonText, { color: "#4A5BCC" }]}>
                      {mode === "reschedule" ? "Cancel" : "Back"}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.scheduleButton,
                      {
                        backgroundColor: "rgba(30, 54, 111, 1)",
                        borderWidth: 1,
                        borderColor: isStep2Valid ? "#fff" : "rgba(74, 91, 204, 0.5)",
                        opacity: isSchedulerSubmitting ? 0.7 : 1,
                      },
                    ]}
                    onPress={handleReview}
                    disabled={!isStep2Valid || isSchedulerSubmitting}
                  >
                    <Text style={[styles.scheduleButtonText, { color: "#FFFFFF" }]}>
                      Review Meeting
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : showConfirm ? (
              <BottomSheetScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: bottom + getSpacing(24) }}
              >
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: colorScheme.text }]}>
                    Confirm meeting
                  </Text>

                  <View style={styles.reviewCard}>
                    <View style={styles.reviewRow}>
                      <View style={styles.reviewIcon}>
                        <Ionicons name="person-outline" size={18} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.reviewLabel}>Person</Text>
                        <Text style={styles.reviewValue} numberOfLines={1}>
                          {selectedMentor?.name || "Person"}
                        </Text>
                        {!!selectedMentor?.role && (
                          <Text style={styles.reviewSubValue} numberOfLines={1}>
                            {selectedMentor.role}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.reviewDivider} />

                    <View style={styles.reviewRow}>
                      <View style={styles.reviewIcon}>
                        <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.reviewLabel}>When</Text>
                        <Text style={styles.reviewValue} numberOfLines={1}>
                          {selectedDate} · {selectedTime?.label}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.reviewDivider} />

                    <View style={styles.reviewRow}>
                      <View style={styles.reviewIcon}>
                        <Ionicons name="videocam-outline" size={18} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.reviewLabel}>Platform</Text>
                        <Text style={styles.reviewValue} numberOfLines={1}>
                          {meetingOption}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.reviewDivider} />

                    <View style={styles.reviewRow}>
                      <View style={styles.reviewIcon}>
                        <Ionicons name="time-outline" size={18} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.reviewLabel}>Timezone</Text>
                        <Text style={styles.reviewValue} numberOfLines={1}>
                          {Intl.DateTimeFormat().resolvedOptions().timeZone || "Local"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.step2Footer}>
                    <Pressable
                      style={[
                        styles.cancelButton,
                        {
                          borderColor: `${colorScheme.text}80`,
                          backgroundColor: "#FFFFFF",
                        },
                      ]}
                      onPress={handleBack}
                      disabled={isSchedulerSubmitting}
                    >
                      <Text
                        style={[
                          styles.cancelButtonText,
                          { color: "#4A5BCC" },
                        ]}
                      >
                        Back
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.scheduleButton,
                        {
                          backgroundColor: "rgba(30, 54, 111, 1)",
                          borderWidth: 1,
                          borderColor: "#fff",
                          opacity: isSchedulerSubmitting ? 0.7 : 1,
                        },
                      ]}
                      onPress={handleSchedule}
                      disabled={isSchedulerSubmitting}
                    >
                      <Text style={[styles.scheduleButtonText, { color: "#FFFFFF" }]}>
                        {mode === "reschedule" ? "Reschedule meeting" : "Schedule meeting"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </BottomSheetScrollView>
            ) : null}
            </View>
          </LinearGradient>
        </BottomSheetModal>

        {mode !== undefined && (
          <SimpleSuccessModal
            visible={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            title={
              mode === "reschedule"
                ? "Appointment has been Rescheduled"
                : "Appointment has been Scheduled"
            }
          />
        )}
      </>
    );
  },
);

const styles = StyleSheet.create({
  bottomSheetBackground: {
    borderTopLeftRadius: getSpacing(16),
    borderTopRightRadius: getSpacing(16),
  },
  handleIndicator: {
    display: "none",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: getSpacing(16),
  },
  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 6,
    paddingBottom: getSpacing(10),
    marginBottom: getSpacing(6),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.10)",
  },
  progressStep: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  progressDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  progressDotDone: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(255,255,255,0.6)",
  },
  progressDotTodo: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.25)",
  },
  progressDotText: { color: "rgba(255,255,255,0.85)", fontWeight: "800", fontSize: 12 },
  progressLabel: { color: "rgba(255,255,255,0.85)", fontWeight: "700", fontSize: 12, maxWidth: 70 },
  progressLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  quickDatesRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: getSpacing(12),
  },
  quickDateChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  quickDateChipGrow: { flex: 1, alignItems: "center" },
  quickDateChipActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(255,255,255,0.8)",
  },
  quickDateChipDisabled: { opacity: 0.45 },
  quickDateChipText: { color: "rgba(255,255,255,0.9)", fontWeight: "800", fontSize: 12 },
  quickDateChipTextActive: { color: "#1E3A6F" },
  reviewCard: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  reviewRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  reviewIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  reviewDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.10)" },
  reviewLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  reviewValue: { marginTop: 4, color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  reviewSubValue: { marginTop: 2, color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "700" },
  header: {
    paddingTop: getSpacing(12),
    paddingBottom: getSpacing(12),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: getSpacing(16),
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: getSpacing(12),
  },
  headerTitle: {
    fontSize: getFontSize(18),
    fontWeight: "700",
    marginLeft: getSpacing(10),
  },
  stepIndicator: {
    alignItems: "center",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: getSpacing(6),
  },
  stepCircle: {
    width: getSpacing(28),
    height: getSpacing(28),
    borderRadius: getSpacing(14),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  stepNumber: {
    fontSize: getFontSize(12),
    fontWeight: "600",
  },
  stepLine: {
    width: getSpacing(60),
    height: 2,
    marginHorizontal: getSpacing(8),
  },
  stepLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: getSpacing(160),
  },
  stepLabel: {
    fontSize: getFontSize(10),
    fontWeight: "500",
  },
  scrollContent: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
  },
  stepContentNoScroll: {
    flexShrink: 0,
  },
  roleSelectorContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginBottom: getSpacing(12),
    gap: 20,
    paddingHorizontal: 25,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  activeRoleTab: {
    backgroundColor: "#FFFFFF",
  },
  inactiveRoleTab: {
    backgroundColor: "transparent",
    borderColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 1,
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
  },
  activeRoleTabText: {
    color: "#1E3A6F",
  },
  mentorListContainer: {
    maxHeight: Dimensions.get("window").height * 0.5,
    minHeight: Dimensions.get("window").height * 0.3,
    borderWidth: 1.5,
    borderRadius: getSpacing(12),
    padding: getSpacing(isSmallDevice ? 14 : 16),
    marginBottom: getSpacing(isSmallDevice ? 8 : 12),
    overflow: "hidden",
  },
  stepTitle: {
    fontSize: getFontSize(isSmallDevice ? 15 : 16),
    fontWeight: "600",
    marginBottom: getSpacing(isSmallDevice ? 16 : 18),
    textAlign: "center",
  },
  // Step 1 specific styles
  titleContainer: {
    borderWidth: 1.5,
    borderRadius: getSpacing(12),
    paddingVertical: getSpacing(isSmallDevice ? 12 : 14),
    paddingHorizontal: getSpacing(isSmallDevice ? 14 : 16),
    marginBottom: getSpacing(isSmallDevice ? 10 : 12),
    alignItems: "center",
  },
  stepTitleLarge: {
    fontSize: getFontSize(isSmallDevice ? 15 : 16),
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.2,
  },

  searchBarContainer: {
    marginBottom: getSpacing(isSmallDevice ? 10 : 12),
    paddingHorizontal: 30,
  },

  mentorListStep1: {
    borderWidth: 1.5,
    borderRadius: getSpacing(12),
    padding: getSpacing(isSmallDevice ? 14 : 16),
    marginBottom: getSpacing(isSmallDevice ? 16 : 18),
    marginTop: getSpacing(10),
  },
  mentorItemStep1: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: getSpacing(isSmallDevice ? 8 : 10),
  },
  radioButtonStep1: {
    width: getSpacing(isSmallDevice ? 18 : 20),
    height: getSpacing(isSmallDevice ? 18 : 20),
    borderRadius: getSpacing(isSmallDevice ? 9 : 10),
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: getSpacing(isSmallDevice ? 10 : 12),
  },
  radioInner: {
    width: getSpacing(isSmallDevice ? 7 : 8),
    height: getSpacing(isSmallDevice ? 7 : 8),
    borderRadius: getSpacing(isSmallDevice ? 3.5 : 4),
    backgroundColor: "#4A5BCC", // Dark blue inner circle
  },
  mentorImageStep1: {
    width: getSpacing(isSmallDevice ? 28 : 32),
    height: getSpacing(isSmallDevice ? 28 : 32),
    borderRadius: getSpacing(isSmallDevice ? 14 : 16),
    marginRight: getSpacing(isSmallDevice ? 8 : 10),
  },
  mentorImagePlaceholderStep1: {
    width: getSpacing(isSmallDevice ? 28 : 32),
    height: getSpacing(isSmallDevice ? 28 : 32),
    borderRadius: getSpacing(isSmallDevice ? 14 : 16),
    alignItems: "center",
    justifyContent: "center",
    marginRight: getSpacing(isSmallDevice ? 8 : 10),
  },
  mentorNameStep1: {
    fontSize: getFontSize(isSmallDevice ? 13 : 14),
    fontWeight: "600",
  },
  mentorRoleStep1: {
    fontSize: getFontSize(isSmallDevice ? 10 : 11),
    marginTop: 2,
    textTransform: "capitalize",
  },
  step1Footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: getSpacing(isSmallDevice ? 8 : 12),
    marginTop: getSpacing(isSmallDevice ? 16 : 18),
    marginBottom: getSpacing(6),
    width: "100%",
    paddingHorizontal: getSpacing(isSmallDevice ? 6 : 12),
  },
  cancelButton: {
    minWidth: 110,
    paddingVertical: getSpacing(isSmallDevice ? 10 : 12),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  nextButton: {
    minWidth: 110,
    paddingVertical: 14,
    backgroundColor: "rgba(30, 54, 111, 1)",
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  scheduleButton: {
    minWidth: 110,
    paddingVertical: 14,
    backgroundColor: "rgba(30, 54, 111, 1)",
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },

  cancelButtonText: {
    fontSize: getFontSize(isSmallDevice ? 13 : 14),
    fontWeight: "600",
  },

  nextButtonText: {
    fontSize: getFontSize(isSmallDevice ? 13 : 14),
    fontWeight: "600",
  },

  step2Footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: getSpacing(isSmallDevice ? 8 : 12),
    marginTop: getSpacing(isSmallDevice ? 18 : 20),
    width: "100%",
    paddingHorizontal: getSpacing(isSmallDevice ? 6 : 12),
  },
  stickyFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: getSpacing(isSmallDevice ? 8 : 12),
    paddingTop: getSpacing(10),
    paddingHorizontal: getSpacing(isSmallDevice ? 12 : 16),
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(18, 56, 106, 0.55)",
  },

  scheduleButtonText: {
    fontSize: getFontSize(isSmallDevice ? 13 : 14),
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: getSpacing(12),
    paddingVertical: getSpacing(10),
    borderRadius: getSpacing(10),
    marginBottom: getSpacing(16),
  },
  searchInput: {
    flex: 1,
    marginLeft: getSpacing(10),
    fontSize: getFontSize(14),
  },
  mentorList: {
    borderRadius: getSpacing(12),
    padding: getSpacing(12),
  },
  mentorItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: getSpacing(12),
  },
  radioButton: {
    width: getSpacing(18),
    height: getSpacing(18),
    borderRadius: getSpacing(9),
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: getSpacing(12),
  },
  radioButtonInner: {
    width: getSpacing(8),
    height: getSpacing(8),
    borderRadius: getSpacing(4),
  },
  mentorImage: {
    width: getSpacing(40),
    height: getSpacing(40),
    borderRadius: getSpacing(20),
    marginRight: getSpacing(12),
  },
  mentorImagePlaceholder: {
    width: getSpacing(40),
    height: getSpacing(40),
    borderRadius: getSpacing(20),
    alignItems: "center",
    justifyContent: "center",
    marginRight: getSpacing(12),
  },
  mentorName: {
    fontSize: getFontSize(14),
    fontWeight: "500",
    flex: 1,
  },
  calendarContainer: {
    borderRadius: getSpacing(12),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  sectionTitle: {
    fontSize: getFontSize(14),
    fontWeight: "600",
    marginBottom: getSpacing(12),
    marginTop: getSpacing(16),
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: getSpacing(20),
  },
  emptyStateText: {
    fontSize: getFontSize(14),
    fontStyle: "italic",
  },
  timeSlotGridItem: {
    paddingVertical: getSpacing(12),
    paddingHorizontal: getSpacing(8),
    borderRadius: getSpacing(10),
    borderWidth: 1,
    marginBottom: getSpacing(10),
    alignItems: "center",
    justifyContent: "center",
  },
  timeSlotText: {
    fontSize: getFontSize(isSmallDevice ? 11 : 12),
    fontWeight: "600",
    textAlign: "center",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: getSpacing(isSmallDevice ? 12 : 14),
    paddingVertical: getSpacing(isSmallDevice ? 10 : 12),
    borderRadius: getSpacing(isSmallDevice ? 8 : 10),
    borderWidth: 1,
    marginBottom: getSpacing(isSmallDevice ? 4 : 8),
  },
  dropdownText: {
    fontSize: getFontSize(isSmallDevice ? 13 : 14),
    fontWeight: "500",
  },
  dropdownOptions: {
    borderWidth: 1,
    borderRadius: getSpacing(isSmallDevice ? 8 : 10),
    marginTop: getSpacing(isSmallDevice ? 4 : 6),
    overflow: "hidden",
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: getSpacing(isSmallDevice ? 12 : 14),
    paddingVertical: getSpacing(isSmallDevice ? 10 : 12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  dropdownOptionText: {
    fontSize: getFontSize(isSmallDevice ? 13 : 14),
    fontWeight: "500",
    marginLeft: getSpacing(isSmallDevice ? 8 : 10),
    flex: 1,
  },
  noTimeSlotsContainer: {
    paddingVertical: getSpacing(isSmallDevice ? 14 : 16),
    alignItems: "center",
  },
  noTimeSlotsText: {
    fontSize: getFontSize(isSmallDevice ? 11 : 12),
    fontStyle: "italic",
  },
});

export default ScheduleMeetingBottomSheet;
