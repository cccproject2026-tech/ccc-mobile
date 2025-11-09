import {
    getDeviceType,
    getFontSize,
    getIconSize,
    getSpacing,
    isAndroid,
    isSmallDevice
} from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientCalendar from '../atom/calendar';
import SimpleSuccessModal from '../atom/SimpleSuccessModal';
import SearchBar from './SearchBar';

export interface Mentor {
    id: string;
    name: string;
    role: string;
    profileImage?: string;
}

export interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
    label: string;
}

export interface ScheduleMeetingBottomSheetProps {
    mentors: Mentor[];
    onClose: () => void;
    onSchedule: (data: {
        selectedMentor: Mentor;
        selectedDate: string;
        selectedTime: TimeSlot;
        meetingOption: string;
    }) => void;
    actionType?: 'scheduled' | 'rescheduled';
    colorScheme?: {
        background?: string;
        text?: string;
        accent?: string;
        cardBackground?: string;
    };


    disableOutsideClose?: boolean; // Prevent closing by clicking outside or swiping down
    showCancelButton?: boolean; // Control whether cancel button is shown in step 1
    onScheduleComplete?: () => void; // Callback after successful scheduling for context updates
}
export interface ScheduleMeetingBottomSheetProps {
    mentors: Mentor[];
    onClose: () => void;
    onSchedule: (data: {
        selectedMentor: Mentor;
        selectedDate: string;
        selectedTime: TimeSlot;
        meetingOption: string;
    }) => void;
    mode?: 'schedule' | 'reschedule'; // NEW: Determine which mode
    existingAppointment?: {
        mentor: Mentor;
        date: string;
        time: TimeSlot;
        meetingOption: string;
    } | null;  // ⬅️ ADD | null

    actionType?: 'scheduled' | 'rescheduled';
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

const ScheduleMeetingBottomSheet = forwardRef<BottomSheetModal, ScheduleMeetingBottomSheetProps>(
    (
        {
            mentors,
            onClose,
            onSchedule,
            mode = 'schedule', // NEW: Default to schedule mode
            existingAppointment, // NEW: Pre-filled data for reschedule
            actionType = 'scheduled',
            colorScheme = {
                background: '#1E3A6F',
                text: '#FFFFFF',
                accent: '#FFC107',
                cardBackground: 'rgba(255, 255, 255, 0.1)',
            },
            disableOutsideClose = false,
            showCancelButton = true,
            onScheduleComplete,
        },
        ref
    ) => {
        const { bottom } = useSafeAreaInsets();
        const deviceType = getDeviceType();
        const snapPoints = useMemo(() => {
            if (deviceType === 'small') {
                return ['88%'];
            } else if (deviceType === 'medium') {
                return ['82%'];
            }
            return ['78%'];
        }, [deviceType]);

        // Determine initial step based on mode
        const [currentStep, setCurrentStep] = useState<1 | 2>(mode === 'reschedule' ? 2 : 1);
        const [searchQuery, setSearchQuery] = useState('');

        // Pre-fill data for reschedule mode
        const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(
            mode === 'reschedule' && existingAppointment ? existingAppointment.mentor : null
        );
        const [selectedDate, setSelectedDate] = useState<string>(
            mode === 'reschedule' && existingAppointment ? existingAppointment.date : ''
        );
        const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(
            mode === 'reschedule' && existingAppointment ? existingAppointment.time : null
        );
        const [meetingOption, setMeetingOption] = useState(
            mode === 'reschedule' && existingAppointment ? existingAppointment.meetingOption : 'Zoom'
        );
        const [showMeetingOptions, setShowMeetingOptions] = useState(false);
        const [showSuccessModal, setShowSuccessModal] = useState(false);

        // Time slots logic remains the same
        const getTimeSlotsForDate = (dateString: string): TimeSlot[] => {
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

        const filteredMentors = useMemo(() => {
            if (!searchQuery) return mentors;
            return mentors.filter(mentor =>
                mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                mentor.role.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }, [mentors, searchQuery]);

        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop
                    {...props}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    opacity={0.5}
                    pressBehavior={disableOutsideClose ? 'none' : 'close'}
                />
            ),
            [disableOutsideClose]
        );

        const handleNext = () => {
            if (currentStep === 1 && selectedMentor) {
                setCurrentStep(2);
            }
        };

        const handleBack = () => {
            // In reschedule mode, close instead of going back
            if (mode === 'reschedule') {
                handleClose();
            } else if (currentStep === 2) {
                setCurrentStep(1);
            }
        };

        const handleSchedule = () => {
            if (selectedMentor && selectedDate && selectedTime) {
                onSchedule({
                    selectedMentor,
                    selectedDate,
                    selectedTime,
                    meetingOption,
                });

                if (onScheduleComplete) {
                    onScheduleComplete();
                }

                setShowSuccessModal(true);

                setTimeout(() => {
                    onClose();
                    resetForm();
                }, 2000);
            }
        };

        const resetForm = () => {
            setCurrentStep(mode === 'reschedule' ? 2 : 1);
            setSelectedMentor(mode === 'reschedule' && existingAppointment ? existingAppointment.mentor : null);
            setSelectedDate(mode === 'reschedule' && existingAppointment ? existingAppointment.date : '');
            setSelectedTime(mode === 'reschedule' && existingAppointment ? existingAppointment.time : null);
            setSearchQuery('');
            setMeetingOption(mode === 'reschedule' && existingAppointment ? existingAppointment.meetingOption : 'Zoom');
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

        const isStep1Valid = selectedMentor !== null;
        const isStep2Valid = selectedDate && selectedTime;

        // Determine which step to show
        const showMentorSelection = mode === 'schedule' && currentStep === 1;
        const showDateTimeSelection = mode === 'reschedule' || currentStep === 2;

        return (
            <>
                <BottomSheetModal
                    ref={ref}
                    snapPoints={snapPoints}
                    enablePanDownToClose={!disableOutsideClose}
                    backgroundComponent={() => null}
                    backdropComponent={renderBackdrop}
                    handleIndicatorStyle={styles.handleIndicator}
                    onDismiss={handleClose}
                >
                    <LinearGradient
                        colors={['#264387', '#1D548D', '#176192']}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={{ flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20 }}
                    >
                        <BottomSheetScrollView
                            style={[styles.contentContainer]}
                            contentContainerStyle={{ paddingBottom: bottom + getSpacing(12), paddingTop: getSpacing(12) }}
                        >
                            <View>
                                {showMentorSelection ? (
                                    // Step 1: Select Mentor (Only in Schedule mode)
                                    <View style={styles.stepContent}>
                                        <View style={[styles.titleContainer, { borderColor: 'rgba(255, 255, 255, 0.3)' }]}>
                                            <Text style={[styles.stepTitleLarge, { color: colorScheme.text }]}>
                                                Select Mentor for the Meeting
                                            </Text>
                                        </View>

                                        <View style={styles.searchBarContainer}>
                                            <SearchBar
                                                backgroundColor='transparent'
                                                placeholder='Search'
                                                value={searchQuery}
                                                onChangeValue={setSearchQuery}
                                            />
                                        </View>

                                        <View style={[styles.mentorListStep1, { borderColor: 'rgba(255, 255, 255, 0.3)' }]}>
                                            {filteredMentors.map((mentor) => (
                                                <Pressable
                                                    key={mentor.id}
                                                    style={styles.mentorItemStep1}
                                                    onPress={() => setSelectedMentor(mentor)}
                                                >
                                                    <View style={[
                                                        styles.radioButtonStep1,
                                                        {
                                                            borderColor: 'rgba(255, 255, 255, 0.6)',
                                                            backgroundColor: selectedMentor?.id === mentor.id ? '#FFFFFF' : 'transparent'
                                                        }
                                                    ]}>
                                                        {selectedMentor?.id === mentor.id && (
                                                            <View style={styles.radioInner} />
                                                        )}
                                                    </View>

                                                    {mentor.profileImage ? (
                                                        <Image source={{ uri: mentor.profileImage }} style={styles.mentorImageStep1} />
                                                    ) : (
                                                        <View style={[styles.mentorImagePlaceholderStep1, { backgroundColor: colorScheme.cardBackground }]}>
                                                            <Ionicons name="person" size={getIconSize(18)} color={colorScheme.text} />
                                                        </View>
                                                    )}

                                                    <Text style={[styles.mentorNameStep1, { color: colorScheme.text }]}>
                                                        {mentor.name} - {mentor.role}
                                                    </Text>
                                                </Pressable>
                                            ))}
                                        </View>

                                        <View style={styles.step1Footer}>
                                            {showCancelButton && (
                                                <Pressable
                                                    style={[styles.cancelButton, { borderColor: 'rgba(255, 255, 255, 0.5)', backgroundColor: '#FFFFFF' }]}
                                                    onPress={handleClose}
                                                >
                                                    <Text style={[styles.cancelButtonText, { color: '#4A5BCC' }]}>
                                                        Cancel
                                                    </Text>
                                                </Pressable>
                                            )}

                                            <Pressable
                                                style={[
                                                    styles.nextButton,
                                                    {
                                                        backgroundColor: isStep1Valid ? 'rgba(30, 54, 111, 1)' : 'rgba(30, 54, 111, 1)',
                                                        borderWidth: 1,
                                                        borderColor: isStep1Valid ? '#fff' : 'rgba(74, 91, 204, 0.5)',
                                                        flex: showCancelButton ? undefined : 1,
                                                    }
                                                ]}
                                                onPress={handleNext}
                                                disabled={!isStep1Valid}
                                            >
                                                <Text style={[styles.nextButtonText, { color: '#FFFFFF' }]}>
                                                    Next
                                                </Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                ) : showDateTimeSelection ? (
                                    // Step 2: Schedule/Reschedule Date & Time
                                    <View style={styles.stepContent}>
                                        {/* Show mentor info for reschedule mode */}
                                        {mode === 'reschedule' && selectedMentor && (
                                            <View style={[styles.titleContainer, { borderColor: 'rgba(255, 255, 255, 0.3)', marginBottom: 16 }]}>
                                                <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
                                                    Rescheduling with {selectedMentor.name}
                                                </Text>
                                            </View>
                                        )}

                                        <Text style={[styles.stepTitle, { color: colorScheme.text }]}>
                                            Select Available Date
                                        </Text>

                                        <View style={styles.calendarContainer}>
                                            <GradientCalendar
                                                selected={selectedDate}
                                                setSelected={setSelectedDate}
                                                recurringAvailability={{
                                                    type: 'weekly',
                                                    daysOfWeek: [1, 2, 3, 4, 5, 6],
                                                }}
                                                availableDates={Array.from({ length: 60 }, (_, i) => {
                                                    const date = new Date();
                                                    date.setDate(date.getDate() + i);
                                                    return date.toISOString().split('T')[0];
                                                })}
                                                showHeader={false}
                                                disablePastDates={true}
                                                markToday={true}
                                            />
                                        </View>

                                        {selectedDate && (
                                            <>
                                                <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
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
                                                                            : `${colorScheme.text}50`,
                                                                    }
                                                                ]}
                                                                onPress={() => setSelectedTime(slot)}
                                                            >
                                                                <Text style={[
                                                                    styles.timeSlotText,
                                                                    {
                                                                        color: selectedTime?.id === slot.id
                                                                            ? colorScheme.background
                                                                            : colorScheme.text
                                                                    }
                                                                ]}>
                                                                    {slot.label}
                                                                </Text>
                                                            </Pressable>
                                                        ))}
                                                    </ScrollView>
                                                ) : (
                                                    <View style={styles.noTimeSlotsContainer}>
                                                        <Text style={[styles.noTimeSlotsText, { color: `${colorScheme.text}80` }]}>
                                                            No available time slots for this date
                                                        </Text>
                                                    </View>
                                                )}
                                            </>
                                        )}

                                        <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
                                            Preferred Meeting Option
                                        </Text>

                                        <Pressable
                                            style={[
                                                styles.dropdownButton,
                                                {
                                                    backgroundColor: 'transparent',
                                                    borderColor: `${colorScheme.text}50`
                                                }
                                            ]}
                                            onPress={() => setShowMeetingOptions(!showMeetingOptions)}
                                        >
                                            <Text style={[styles.dropdownText, { color: colorScheme.text }]}>
                                                {meetingOptions.find(option => option.id === meetingOption.toLowerCase().replace(' ', '-'))?.label || meetingOption}
                                            </Text>
                                            <Ionicons
                                                name={showMeetingOptions ? "chevron-up" : "chevron-down"}
                                                size={getIconSize(16)}
                                                color={colorScheme.text}
                                            />
                                        </Pressable>

                                        {showMeetingOptions && (
                                            <View style={[styles.dropdownOptions, { backgroundColor: 'transparent', borderColor: `${colorScheme.text}30` }]}>
                                                {meetingOptions.map((option) => (
                                                    <Pressable
                                                        key={option.id}
                                                        style={styles.dropdownOption}
                                                        onPress={() => {
                                                            setMeetingOption(option.label);
                                                            setShowMeetingOptions(false);
                                                        }}
                                                    >
                                                        <Ionicons name={option.icon as any} size={getIconSize(16)} color={colorScheme.text} />
                                                        <Text style={[styles.dropdownOptionText, { color: colorScheme.text }]}>
                                                            {option.label}
                                                        </Text>
                                                        {meetingOption === option.label && (
                                                            <Ionicons name="checkmark" size={getIconSize(14)} color={colorScheme.accent} />
                                                        )}
                                                    </Pressable>
                                                ))}
                                            </View>
                                        )}

                                        <View style={styles.step2Footer}>
                                            <Pressable
                                                style={[styles.cancelButton, { borderColor: `${colorScheme.text}80`, backgroundColor: '#FFFFFF' }]}
                                                onPress={handleBack}
                                            >
                                                <Text style={[styles.cancelButtonText, { color: '#4A5BCC' }]}>
                                                    {mode === 'reschedule' ? 'Cancel' : 'Back'}
                                                </Text>
                                            </Pressable>

                                            <Pressable
                                                style={[
                                                    styles.scheduleButton,
                                                    {
                                                        backgroundColor: isStep2Valid ? 'rgba(30, 54, 111, 1)' : 'rgba(30, 54, 111, 1)',
                                                        borderWidth: 1,
                                                        borderColor: isStep2Valid ? '#fff' : 'rgba(74, 91, 204, 0.5)',
                                                    }
                                                ]}
                                                onPress={handleSchedule}
                                                disabled={!isStep2Valid}
                                            >
                                                <Text style={[styles.scheduleButtonText, { color: '#FFFFFF' }]}>
                                                    {mode === 'reschedule' ? 'Reschedule' : 'Schedule'}
                                                </Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                ) : null}
                            </View>
                        </BottomSheetScrollView>
                    </LinearGradient>
                </BottomSheetModal>

                <SimpleSuccessModal
                    visible={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                    title={mode === 'reschedule' ? 'Appointment has been Rescheduled' : 'Appointment has been Scheduled'}
                />
            </>
        );
    }
);


const styles = StyleSheet.create({
    bottomSheetBackground: {
        borderTopLeftRadius: getSpacing(16),
        borderTopRightRadius: getSpacing(16),
    },
    handleIndicator: {
        display: 'none',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: getSpacing(16),
    },
    closeButton: {
        position: 'absolute',
        top: getSpacing(12),
        right: getSpacing(16),
        zIndex: 10,
        width: getSpacing(isAndroid ? 28 : 32),
        height: getSpacing(isAndroid ? 28 : 32),
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        paddingTop: getSpacing(12),
        paddingBottom: getSpacing(12),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: getSpacing(16),
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: getSpacing(12),
    },
    headerTitle: {
        fontSize: getFontSize(18),
        fontWeight: '700',
        marginLeft: getSpacing(10),
    },
    stepIndicator: {
        alignItems: 'center',
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: getSpacing(6),
    },
    stepCircle: {
        width: getSpacing(28),
        height: getSpacing(28),
        borderRadius: getSpacing(14),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    stepNumber: {
        fontSize: getFontSize(12),
        fontWeight: '600',
    },
    stepLine: {
        width: getSpacing(60),
        height: 2,
        marginHorizontal: getSpacing(8),
    },
    stepLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: getSpacing(160),
    },
    stepLabel: {
        fontSize: getFontSize(10),
        fontWeight: '500',
    },
    scrollContent: {
        flex: 1,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: getFontSize(isSmallDevice ? 15 : 16),
        fontWeight: '600',
        marginBottom: getSpacing(isSmallDevice ? 16 : 18),
        textAlign: 'center',
    },
    // Step 1 specific styles
    titleContainer: {
        borderWidth: 1.5,
        borderRadius: getSpacing(12),
        paddingVertical: getSpacing(isSmallDevice ? 12 : 14),
        paddingHorizontal: getSpacing(isSmallDevice ? 14 : 16),
        marginBottom: getSpacing(isSmallDevice ? 10 : 12),
        alignItems: 'center',
    },
    stepTitleLarge: {
        fontSize: getFontSize(isSmallDevice ? 15 : 16),
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 0.2,
    },

    searchBarContainer: {
        marginBottom: getSpacing(isSmallDevice ? 10 : 12),
    },

    mentorListStep1: {
        borderWidth: 1.5,
        borderRadius: getSpacing(12),
        padding: getSpacing(isSmallDevice ? 14 : 16),
        marginBottom: getSpacing(isSmallDevice ? 16 : 18),
    },
    mentorItemStep1: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: getSpacing(isSmallDevice ? 8 : 10),
    },
    radioButtonStep1: {
        width: getSpacing(isSmallDevice ? 18 : 20),
        height: getSpacing(isSmallDevice ? 18 : 20),
        borderRadius: getSpacing(isSmallDevice ? 9 : 10),
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: getSpacing(isSmallDevice ? 10 : 12),
    },
    radioInner: {
        width: getSpacing(isSmallDevice ? 7 : 8),
        height: getSpacing(isSmallDevice ? 7 : 8),
        borderRadius: getSpacing(isSmallDevice ? 3.5 : 4),
        backgroundColor: '#4A5BCC', // Dark blue inner circle
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
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: getSpacing(isSmallDevice ? 8 : 10),
    },
    mentorNameStep1: {
        fontSize: getFontSize(isSmallDevice ? 13 : 14),
        fontWeight: '500',
        flex: 1,
    },
    step1Footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: getSpacing(isSmallDevice ? 8 : 12),
        marginTop: getSpacing(isSmallDevice ? 16 : 18),
        marginBottom: getSpacing(6),
        width: '100%',
        paddingHorizontal: getSpacing(isSmallDevice ? 6 : 12),
    },
    cancelButton: {
        minWidth: 110,
        flexGrow: 1,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButton: {
        minWidth: 110,
        flexGrow: 1,
        paddingVertical: 14,
        backgroundColor: 'rgba(30, 54, 111, 1)',
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
    },
    scheduleButton: {
        minWidth: 110,
        flexGrow: 1,
        paddingVertical: 14,
        backgroundColor: 'rgba(30, 54, 111, 1)',
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
    },

    cancelButtonText: {
        fontSize: getFontSize(isSmallDevice ? 13 : 14),
        fontWeight: '600',
    },

    nextButtonText: {
        fontSize: getFontSize(isSmallDevice ? 13 : 14),
        fontWeight: '600',
    },

    step2Footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: getSpacing(isSmallDevice ? 8 : 12),
        marginTop: getSpacing(isSmallDevice ? 18 : 20),
        width: '100%',
        paddingHorizontal: getSpacing(isSmallDevice ? 6 : 12),
    },
    backButton: {
        minWidth: 110,
        flexGrow: 1,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },

    scheduleButtonText: {
        fontSize: getFontSize(isSmallDevice ? 13 : 14),
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: getSpacing(12),
    },
    radioButton: {
        width: getSpacing(18),
        height: getSpacing(18),
        borderRadius: getSpacing(9),
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
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
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: getSpacing(12),
    },
    mentorName: {
        fontSize: getFontSize(14),
        fontWeight: '500',
        flex: 1,
    },
    calendarContainer: {
        marginBottom: getSpacing(isSmallDevice ? 16 : 18),
    },
    sectionTitle: {
        fontSize: getFontSize(isSmallDevice ? 13 : 14),
        fontWeight: '600',
        marginBottom: getSpacing(isSmallDevice ? 10 : 12),
    },
    timeSlotContainer: {
        marginBottom: getSpacing(isSmallDevice ? 16 : 18),
    },
    timeSlot: {
        paddingHorizontal: getSpacing(isSmallDevice ? 14 : 16),
        paddingVertical: getSpacing(isSmallDevice ? 8 : 10),
        borderRadius: getSpacing(isSmallDevice ? 18 : 20),
        borderWidth: 1,
        marginRight: getSpacing(isSmallDevice ? 8 : 10),
    },
    timeSlotText: {
        fontSize: getFontSize(isSmallDevice ? 11 : 12),
        fontWeight: '500',
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: getSpacing(isSmallDevice ? 12 : 14),
        paddingVertical: getSpacing(isSmallDevice ? 10 : 12),
        borderRadius: getSpacing(isSmallDevice ? 8 : 10),
        borderWidth: 1,
        // marginBottom: getSpacing(isSmallDevice ? 14 : 16),
    },
    dropdownText: {
        fontSize: getFontSize(isSmallDevice ? 13 : 14),
        fontWeight: '500',
    },
    dropdownOptions: {
        borderWidth: 1,
        borderRadius: getSpacing(isSmallDevice ? 8 : 10),
        marginTop: getSpacing(isSmallDevice ? 4 : 6),
        overflow: 'hidden',
    },
    dropdownOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: getSpacing(isSmallDevice ? 12 : 14),
        paddingVertical: getSpacing(isSmallDevice ? 10 : 12),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    dropdownOptionText: {
        fontSize: getFontSize(isSmallDevice ? 13 : 14),
        fontWeight: '500',
        marginLeft: getSpacing(isSmallDevice ? 8 : 10),
        flex: 1,
    },
    noTimeSlotsContainer: {
        paddingVertical: getSpacing(isSmallDevice ? 14 : 16),
        alignItems: 'center',
    },
    noTimeSlotsText: {
        fontSize: getFontSize(isSmallDevice ? 11 : 12),
        fontStyle: 'italic',
    },

});

export default ScheduleMeetingBottomSheet;