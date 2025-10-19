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
}

const ScheduleMeetingBottomSheet = forwardRef<BottomSheetModal, ScheduleMeetingBottomSheetProps>(
    (
        {
            mentors,
            onClose,
            onSchedule,
            actionType = 'scheduled',
            colorScheme = {
                background: '#1E3A6F',
                text: '#FFFFFF',
                accent: '#FFC107',
                cardBackground: 'rgba(255, 255, 255, 0.1)',
            },
        },
        ref
    ) => {
        const { bottom } = useSafeAreaInsets();
        const deviceType = getDeviceType();
        const snapPoints = useMemo(() => {
            // Adjust bottom sheet height based on device size
            if (deviceType === 'small') {
                return ['88%']; // Larger percentage for small devices
            } else if (deviceType === 'medium') {
                return ['82%'];
            }
            return ['78%']; // Smaller percentage for large devices
        }, [deviceType]);
        const [currentStep, setCurrentStep] = useState<1 | 2>(1);
        const [searchQuery, setSearchQuery] = useState('');
        const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
        const [selectedDate, setSelectedDate] = useState<string>('');
        const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
        const [meetingOption, setMeetingOption] = useState('Zoom');
        const [showMeetingOptions, setShowMeetingOptions] = useState(false);
        const [showSuccessModal, setShowSuccessModal] = useState(false);

        // Time slots based on selected date (simulating API response)
        const getTimeSlotsForDate = (dateString: string): TimeSlot[] => {
            if (!dateString) return [];

            // Simulate different time slots for different dates
            const baseSlots = [
                { id: '1', startTime: '09:00', endTime: '10:00', label: '09:00 am - 10:00 am' },
                { id: '2', startTime: '11:00', endTime: '12:00', label: '11:00 am - 12:00 pm' },
                { id: '3', startTime: '01:00', endTime: '02:00', label: '01:00 pm - 02:00 pm' },
                { id: '4', startTime: '03:00', endTime: '04:00', label: '03:00 pm - 04:00 pm' },
            ];

            // Different available slots for different dates
            const date = new Date(dateString);
            const dayOfWeek = date.getDay();

            if (dayOfWeek === 1 || dayOfWeek === 3) { // Monday or Wednesday
                return baseSlots.slice(0, 2); // Morning slots only
            } else if (dayOfWeek === 2 || dayOfWeek === 4) { // Tuesday or Thursday
                return baseSlots.slice(1, 4); // Afternoon slots
            } else {
                return baseSlots; // All slots
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
                    pressBehavior="close"
                />
            ),
            []
        );

        const handleNext = () => {
            if (currentStep === 1 && selectedMentor) {
                setCurrentStep(2);
            }
        };

        const handleBack = () => {
            if (currentStep === 2) {
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

                // Show success modal
                setShowSuccessModal(true);

                // Close bottom sheet after modal shows
                setTimeout(() => {
                    onClose();
                    resetForm();
                }, 2000);
            }
        };

        const resetForm = () => {
            setCurrentStep(1);
            setSelectedMentor(null);
            setSelectedDate('');
            setSelectedTime(null);
            setSearchQuery('');
            setMeetingOption('Zoom');
            setShowMeetingOptions(false);
            setShowSuccessModal(false);
        };

        const handleClose = () => {
            onClose();
            setTimeout(() => {
                resetForm();
            }, 300);
        };

        const isStep1Valid = selectedMentor !== null;
        const isStep2Valid = selectedDate && selectedTime;

        return (
            <>
                <BottomSheetModal
                    ref={ref}
                    snapPoints={snapPoints}
                    enablePanDownToClose
                    backgroundComponent={() => null}
                    backdropComponent={renderBackdrop}
                    // backgroundStyle={[styles.bottomSheetBackground, { backgroundColor: colorScheme.background }]}
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


                            {/* Content */}
                            <View>
                                {currentStep === 1 ? (
                                    // Step 1: Select Mentor
                                    <View style={styles.stepContent}>
                                        {/* Title Container */}
                                        <View style={[styles.titleContainer, { borderColor: 'rgba(255, 255, 255, 0.3)' }]}>
                                            <Text style={[styles.stepTitleLarge, { color: colorScheme.text }]}>
                                                Select Mentor for the  Meeting
                                            </Text>
                                        </View>

                                        {/* Search Bar */}
                                        <View style={styles.searchBarContainer}>
                                            <SearchBar
                                                backgroundColor='transparent'
                                                placeholder='Search'
                                                value={searchQuery}
                                                onChangeValue={setSearchQuery}
                                            />
                                        </View>

                                        {/* Mentor List */}
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

                                        {/* Footer Buttons for Step 1 */}
                                        <View style={styles.step1Footer}>
                                            <Pressable
                                                style={[styles.cancelButton, { borderColor: 'rgba(255, 255, 255, 0.5)', backgroundColor: '#FFFFFF' }]}
                                                onPress={handleClose}
                                            >
                                                <Text style={[styles.cancelButtonText, { color: '#4A5BCC' }]}>
                                                    Cancel
                                                </Text>
                                            </Pressable>

                                            <Pressable
                                                style={[
                                                    styles.nextButton,
                                                    {
                                                        backgroundColor: isStep1Valid ? 'rgba(30, 54, 111, 1)' : 'rgba(30, 54, 111, 1)',
                                                        borderWidth: 1,
                                                        borderColor: isStep1Valid ? '#fff' : 'rgba(74, 91, 204, 0.5)',
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
                                ) : (
                                    // Step 2: Schedule Meeting
                                    <View style={styles.stepContent}>
                                        <Text style={[styles.stepTitle, { color: colorScheme.text }]}>
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

                                        {/* Meeting Options */}
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

                                        {/* Meeting Options Dropdown */}
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

                                        {/* Footer Buttons for Step 2 */}
                                        <View style={styles.step2Footer}>
                                            <Pressable
                                                style={[styles.cancelButton, { borderColor: `${colorScheme.text}80` }]}
                                                onPress={handleBack}
                                            >
                                                <Text style={[styles.cancelButtonText, { color: colorScheme.text }]}>
                                                    Cancel
                                                </Text>
                                            </Pressable>

                                            <Pressable
                                                style={[
                                                    styles.scheduleButton,
                                                    {
                                                        backgroundColor: isStep2Valid ? 'rgba(30, 54, 111, 1)' : 'rgba(30, 54, 111, 1)',
                                                        borderWidth: 1,
                                                        borderColor: isStep1Valid ? '#fff' : 'rgba(74, 91, 204, 0.5)',
                                                    }
                                                ]}
                                                onPress={handleSchedule}
                                                disabled={!isStep2Valid}
                                            >
                                                <Text style={[styles.scheduleButtonText, { color: '#FFFFFF' }]}>
                                                    Schedule
                                                </Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </BottomSheetScrollView>
                    </LinearGradient>

                </BottomSheetModal>

                <SimpleSuccessModal
                    visible={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                    actionType={actionType}
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
        gap: getSpacing(isSmallDevice ? 10 : 12),
        marginTop: getSpacing(isSmallDevice ? 16 : 18),
        marginBottom: getSpacing(6),
    },
    cancelButton: {
        flex: 1,
        paddingVertical: getSpacing(isSmallDevice ? 10 : 12),
        borderRadius: getSpacing(isSmallDevice ? 8 : 10),
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: getFontSize(isSmallDevice ? 13 : 14),
        fontWeight: '600',
    },
    nextButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: 'rgba(30, 54, 111, 1)',
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
    },
    nextButtonText: {
        fontSize: getFontSize(isSmallDevice ? 13 : 14),
        fontWeight: '600',
    },
    step2Footer: {
        flexDirection: 'row',
        gap: getSpacing(isSmallDevice ? 10 : 12),
        marginTop: getSpacing(isSmallDevice ? 18 : 20),
    },
    scheduleButton: {
        flex: 1,
        paddingVertical: getSpacing(isSmallDevice ? 10 : 12),
        borderRadius: getSpacing(isSmallDevice ? 8 : 10),
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