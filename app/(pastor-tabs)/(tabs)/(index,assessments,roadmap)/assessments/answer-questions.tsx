// import SimpleSuccessModal from '@/components/atom/SimpleSuccessModal';
// import ScheduleMeetingBottomSheet, { Mentor } from '@/components/director/ScheduleMeetingBottomSheet';
// import TopBar from '@/components/director/TopBar';
// import { Colors } from '@/constants/Colors';
// import { useAssessment } from '@/context/AssessmentsContext';
// import { dummyRoadMaps } from '@/lib/assessments/mock';
// import { AssessmentQuestion, QuestionGroup } from '@/lib/assessments/types';
// import { getFontSize, getSpacing } from '@/utils/responsive';
// import { Ionicons } from '@expo/vector-icons';
// import { BottomSheetModal } from '@gorhom/bottom-sheet';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//     Alert,
//     Modal,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View
// } from 'react-native';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

// export default function AnswerQuestionPage() {
//     const { assessmentId, viewMode } = useLocalSearchParams();
//     const [showModal, setShowModal] = useState(false);

//     // ✅ Bottom sheet ref
//     const scheduleMeetingBottomSheetRef = useRef<BottomSheetModal>(null);

//     // ✅ Success modal state
//     const [showSuccessModal, setShowSuccessModal] = useState(false);
//     const [successMessage, setSuccessMessage] = useState('');

//     const assessment = dummyRoadMaps.find(a => a.id === assessmentId);

//     if (!assessment) {
//         return (
//             <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//                 <Text style={{ color: 'red' }}>Error: Assessment data not found.</Text>
//             </View>
//         );
//     }

//     const router = useRouter();
//     const { saveResponse, getResponse, completeAssessment } = useAssessment();

//     const isViewMode = viewMode === 'true';

//     const previousResponse = getResponse(assessmentId as string);
//     const [answers, setAnswers] = useState<Record<number, Record<string, any>>>(
//         previousResponse?.sectionAnswers || {}
//     );
//     const [currentSectionIndex, setCurrentSectionIndex] = useState(
//         isViewMode ? 0 : (previousResponse?.currentSectionIndex || 0)
//     );

//     const totalSections = assessment.sections.length;
//     const currentSection = assessment.sections[currentSectionIndex];

//     // ✅ Mock mentors data
//     const mockMentors: Mentor[] = [
//         {
//             id: '1',
//             name: 'John Ross',
//             role: 'Mentor',
//             profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
//         },
//         {
//             id: '2',
//             name: 'Sarah Johnson',
//             role: 'Field Mentor',
//             profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
//         },
//         {
//             id: '3',
//             name: 'Michael Chen',
//             role: 'Mentor',
//             profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
//         },
//         {
//             id: '4',
//             name: 'Emily Davis',
//             role: 'Mentor',
//             profileImage: 'https://randomuser.me/api/portraits/women/4.jpg',
//         },
//         {
//             id: '5',
//             name: 'Robert Wilson',
//             role: 'Field Mentor',
//             profileImage: 'https://randomuser.me/api/portraits/men/5.jpg',
//         },
//         {
//             id: '6',
//             name: 'Lisa Anderson',
//             role: 'Field Mentor',
//             profileImage: 'https://randomuser.me/api/portraits/women/6.jpg',
//         },
//     ];

//     // Auto-save progress whenever answers or section changes (only if not in view mode)
//     useEffect(() => {
//         if (!isViewMode) {
//             saveProgress();
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [answers, currentSectionIndex]);

//     const saveProgress = async () => {
//         await saveResponse(assessmentId as string, {
//             assessmentId: assessmentId as string,
//             assessmentType: assessment.type,
//             assessmentTitle: assessment.title,
//             preSurveyAnswers: previousResponse?.preSurveyAnswers,
//             sectionAnswers: answers,
//             status: 'Submitted',
//             currentSectionIndex,
//         });
//     };

//     const handleAnswer = (questionId: string, value: boolean) => {
//         if (isViewMode) return;
//         setAnswers(prev => ({
//             ...prev,
//             [currentSectionIndex]: {
//                 ...prev[currentSectionIndex],
//                 [questionId]: value,
//             }
//         }));
//     };

//     const handleClearResponses = () => {
//         if (isViewMode) return;
//         Alert.alert(
//             "Clear Responses",
//             "Are you sure you want to clear all responses for this section?",
//             [
//                 { text: "Cancel", style: "cancel" },
//                 {
//                     text: "Clear",
//                     style: "destructive",
//                     onPress: () => {
//                         setAnswers(prev => ({
//                             ...prev,
//                             [currentSectionIndex]: {},
//                         }));
//                     }
//                 }
//             ]
//         );
//     };

//     const handleNextSection = () => {
//         if (isViewMode) {
//             if (currentSectionIndex < totalSections - 1) {
//                 setCurrentSectionIndex(prev => prev + 1);
//             } else {
//                 router.back();
//             }
//             return;
//         }

//         // 1. Check all required questions
//         const allQuestions = currentSection.questionGroups.flatMap(group => group.questions);
//         const unansweredQuestions = allQuestions.filter(q => q.required && !(answers[currentSectionIndex]?.[q.id]));

//         if (unansweredQuestions.length > 0) {
//             Alert.alert("Required Fields", "Please answer all required questions before proceeding.");
//             return;
//         }

//         // 2. Check at least one answer in each group
//         for (const group of currentSection.questionGroups) {
//             const hasAnswered = group.questions.some(q => answers[currentSectionIndex]?.[q.id]);
//             if (!hasAnswered) {
//                 Alert.alert(
//                     "Incomplete Group",
//                     "Please answer at least one question in each group of this section before proceeding."
//                 );
//                 return;
//             }
//         }

//         // If checks pass, navigate or submit
//         if (currentSectionIndex < totalSections - 1) {
//             setCurrentSectionIndex(prev => prev + 1);
//         } else {
//             handleSubmitAssessment();
//         }
//     };

//     const handlePreviousSection = () => {
//         if (currentSectionIndex > 0) {
//             setCurrentSectionIndex(prev => prev - 1);
//         }
//     };

//     const handleSubmitAssessment = () => {
//         Alert.alert(
//             "Submit Assessment",
//             "Are you sure you want to submit your assessment? You won't be able to make changes after submission.",
//             [
//                 { text: "Cancel", style: "cancel" },
//                 {
//                     text: "Submit",
//                     onPress: async () => {
//                         await completeAssessment(assessmentId as string);
//                         setShowModal(true); // Show prompt modal
//                     }
//                 }
//             ]
//         );
//     };

//     // ✅ UPDATED: Opens bottom sheet instead of navigating
//     const handleScheduleMeeting = () => {
//         setShowModal(false); // Close prompt modal

//         setTimeout(() => {
//             scheduleMeetingBottomSheetRef.current?.present(); // Open bottom sheet
//         }, 300);
//     };

//     // ✅ NEW: Handle skip scheduling
//     const handleSkipScheduling = () => {
//         setShowModal(false);

//         setTimeout(() => {
//             router.replace({
//                 pathname: '/assessments/survey-guidelines',
//                 params: { assessmentId: assessmentId as string }
//             })
//         }, 300);
//     };

//     // ✅ NEW: Handle successful scheduling
//     const handleScheduleComplete = (data: any) => {
//         console.log('Meeting scheduled:', data);

//         // Format date for display
//         const formatDate = (dateString: string) => {
//             const date = new Date(dateString);
//             const day = date.getDate();
//             const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
//                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//             const month = monthNames[date.getMonth()];
//             const year = date.getFullYear().toString().slice(-2);
//             return `${day} ${month} ${year}`;
//         };

//         // Show success message
//         setSuccessMessage(
//             `Meeting scheduled with ${data.selectedMentor.name} on ${formatDate(data.selectedDate)} at ${data.selectedTime.label}`
//         );
//         setShowSuccessModal(true);

//         // Navigate back after 2 seconds
//         setTimeout(() => {
//             router.back(); // Goes to survey-guidelines
//         }, 2000);
//     };

//     const renderQuestion = (question: AssessmentQuestion) => {
//         if (question.type === 'checkbox') {
//             const isChecked = answers[currentSectionIndex]?.[question.id] || false;
//             return (
//                 <TouchableOpacity
//                     key={question.id}
//                     style={styles.questionItem}
//                     onPress={() => handleAnswer(question.id, !isChecked)}
//                     activeOpacity={isViewMode ? 1 : 0.7}
//                     disabled={isViewMode}
//                 >
//                     <View style={[
//                         styles.checkbox,
//                         isChecked && styles.checkboxChecked,
//                         isViewMode && styles.checkboxViewMode
//                     ]}>
//                         {isChecked && <Ionicons name="checkmark" size={16} color="#fff" />}
//                     </View>
//                     <Text style={styles.questionText}>
//                         {question.text}
//                         {question.required && <Text style={styles.required}> *</Text>}
//                     </Text>
//                 </TouchableOpacity>
//             );
//         }
//         return null;
//     };

//     const renderQuestionGroup = (group: QuestionGroup) => (
//         <View key={group.id} style={styles.questionGroupCard}>
//             {group.questions.map(renderQuestion)}
//         </View>
//     );

//     return (
//         <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
//             <TopBar showDrawer={false} showNotifications={false} />

//             {!isViewMode && (
//                 <View style={{ alignItems: 'flex-end', margin: 12 }}>
//                     <TouchableOpacity
//                         onPress={() => {
//                             const filledAnswers: Record<string, boolean> = {};
//                             currentSection.questionGroups.forEach(group => {
//                                 group.questions.forEach(q => {
//                                     if (q.type === 'checkbox') {
//                                         filledAnswers[q.id] = true;
//                                     }
//                                 });
//                             });
//                             setAnswers(prev => ({
//                                 ...prev,
//                                 [currentSectionIndex]: {
//                                     ...prev[currentSectionIndex],
//                                     ...filledAnswers
//                                 }
//                             }));
//                         }}
//                         style={{
//                             backgroundColor: '#28C76F',
//                             paddingVertical: 8,
//                             paddingHorizontal: 18,
//                             borderRadius: 8,
//                         }}
//                     >
//                         <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>
//                             Mark All As Answered
//                         </Text>
//                     </TouchableOpacity>
//                 </View>
//             )}

//             {isViewMode && (
//                 <View style={styles.viewModeIndicator}>
//                     <Ionicons name="eye-outline" size={20} color="#14B8A6" />
//                     <Text style={styles.viewModeText}>Viewing Previous Response</Text>
//                 </View>
//             )}

//             <KeyboardAwareScrollView
//                 style={styles.scrollView}
//                 contentContainerStyle={styles.scrollContent}
//                 showsVerticalScrollIndicator={false}
//             >
//                 {/* Progress Indicator */}
//                 <View style={styles.progressContainer}>
//                     {assessment.sections.map((_, index) => (
//                         <React.Fragment key={index}>
//                             <View style={[
//                                 styles.progressDot,
//                                 index <= currentSectionIndex && styles.progressDotActive
//                             ]} />
//                             {index < totalSections - 1 && (
//                                 <View style={[
//                                     styles.progressLine,
//                                     index < currentSectionIndex && styles.progressLineActive
//                                 ]} />
//                             )}
//                         </React.Fragment>
//                     ))}
//                 </View>

//                 {/* Section Header Card */}
//                 <View style={styles.sectionHeaderCard}>
//                     <View style={styles.sectionBadge}>
//                         <Text style={styles.sectionBadgeText}>Section {currentSectionIndex + 1}</Text>
//                     </View>
//                     <Text style={styles.sectionTitle}>{currentSection.title}</Text>
//                 </View>

//                 {/* Instructions */}
//                 {currentSection.subtitle && (
//                     <Text style={styles.instructionText}>
//                         {currentSection.subtitle}
//                     </Text>
//                 )}

//                 {/* Render all question groups */}
//                 {currentSection.questionGroups.map(renderQuestionGroup)}

//                 {/* Action Buttons */}
//                 <View style={styles.buttonContainer}>
//                     {isViewMode ? (
//                         <>
//                             <TouchableOpacity
//                                 style={[styles.clearButton, currentSectionIndex === 0 && styles.buttonDisabled]}
//                                 onPress={handlePreviousSection}
//                                 activeOpacity={0.8}
//                                 disabled={currentSectionIndex === 0}
//                             >
//                                 <Text style={styles.clearButtonText}>
//                                     <Ionicons name="chevron-back" size={16} /> Previous
//                                 </Text>
//                             </TouchableOpacity>
//                             <TouchableOpacity
//                                 style={styles.nextButton}
//                                 onPress={handleNextSection}
//                                 activeOpacity={0.8}
//                             >
//                                 <Text style={styles.nextButtonText}>
//                                     {currentSectionIndex < totalSections - 1 ? 'Next >>' : 'Close'}
//                                 </Text>
//                             </TouchableOpacity>
//                         </>
//                     ) : (
//                         <>
//                             <TouchableOpacity
//                                 style={styles.clearButton}
//                                 onPress={handleClearResponses}
//                                 activeOpacity={0.8}
//                             >
//                                 <Text style={styles.clearButtonText}>Clear Responses</Text>
//                             </TouchableOpacity>
//                             <TouchableOpacity
//                                 style={styles.nextButton}
//                                 onPress={handleNextSection}
//                                 activeOpacity={0.8}
//                             >
//                                 <Text style={styles.nextButtonText}>
//                                     {currentSectionIndex < totalSections - 1 ? 'Next Section >>' : 'Submit Survey'}
//                                 </Text>
//                             </TouchableOpacity>
//                         </>
//                     )}
//                 </View>
//             </KeyboardAwareScrollView>

//             {/* ✅ 1. PROMPT MODAL - Schedule or Skip */}
//             <Modal
//                 visible={showModal}
//                 transparent
//                 animationType="fade"
//                 onRequestClose={() => setShowModal(false)}
//             >
//                 <View style={{
//                     flex: 1,
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     backgroundColor: 'rgba(0,0,0,0.3)',
//                 }}>
//                     <View style={{
//                         backgroundColor: 'white',
//                         borderRadius: 16,
//                         padding: 32,
//                         alignItems: 'center',
//                         elevation: 2,
//                         margin: 20,
//                         maxWidth: 400,
//                     }}>
//                         <Text style={{
//                             textAlign: 'center',
//                             fontSize: 18,
//                             marginBottom: 24,
//                             color: '#176192',
//                             lineHeight: 24,
//                         }}>
//                             On completion of the PMP and CMA assessment tools please schedule a meeting with your mentor.
//                         </Text>

//                         <View style={{ flexDirection: 'row', gap: 12 }}>
//                             <TouchableOpacity
//                                 style={{
//                                     backgroundColor: '#6B7280',
//                                     paddingHorizontal: 24,
//                                     paddingVertical: 16,
//                                     borderRadius: 12,
//                                     shadowColor: '#000',
//                                     shadowOffset: { width: 0, height: 2 },
//                                     shadowOpacity: 0.2,
//                                     shadowRadius: 4,
//                                     elevation: 4,
//                                 }}
//                                 onPress={handleSkipScheduling}
//                             >
//                                 <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
//                                     Skip for Now
//                                 </Text>
//                             </TouchableOpacity>

//                             <TouchableOpacity
//                                 style={{
//                                     backgroundColor: '#223A74',
//                                     paddingHorizontal: 24,
//                                     paddingVertical: 16,
//                                     borderRadius: 12,
//                                     shadowColor: '#000',
//                                     shadowOffset: { width: 0, height: 2 },
//                                     shadowOpacity: 0.2,
//                                     shadowRadius: 4,
//                                     elevation: 4,
//                                 }}
//                                 onPress={handleScheduleMeeting}
//                             >
//                                 <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
//                                     Schedule Meeting
//                                 </Text>
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 </View>
//             </Modal>

//             {/* ✅ 2. SCHEDULE MEETING BOTTOM SHEET */}
//             <ScheduleMeetingBottomSheet
//                 ref={scheduleMeetingBottomSheetRef}
//                 mentors={mockMentors}
//                 mode="schedule"
//                 onClose={() => {
//                     scheduleMeetingBottomSheetRef.current?.dismiss();
//                 }}
//                 onSchedule={handleScheduleComplete}
//                 colorScheme={{
//                     background: Colors.darkBlueGradientOne,
//                     text: '#FFFFFF',
//                     accent: '#FFC107',
//                     cardBackground: 'rgba(255, 255, 255, 0.1)',
//                 }}
//             />

//             {/* ✅ 3. SUCCESS MODAL */}
//             <SimpleSuccessModal
//                 visible={showSuccessModal}
//                 onClose={() => {
//                     setShowSuccessModal(false);
//                     router.back(); // Navigate back to survey-guidelines
//                 }}
//                 title={successMessage}
//             />
//         </LinearGradient>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     viewModeIndicator: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: 'rgba(20, 184, 166, 0.2)',
//         paddingVertical: getSpacing(10),
//         borderBottomWidth: 1,
//         borderBottomColor: 'rgba(20, 184, 166, 0.3)',
//         gap: getSpacing(8),
//     },
//     viewModeText: {
//         color: '#14B8A6',
//         fontSize: getFontSize(14),
//         fontWeight: '600',
//     },
//     progressContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: getSpacing(20),
//         paddingHorizontal: getSpacing(40),
//     },
//     progressDot: {
//         width: 14,
//         height: 14,
//         borderRadius: 7,
//         backgroundColor: 'rgba(255, 255, 255, 0.3)',
//     },
//     progressDotActive: {
//         backgroundColor: '#fff',
//     },
//     progressLine: {
//         flex: 1,
//         height: 2,
//         backgroundColor: 'rgba(255, 255, 255, 0.3)',
//         marginHorizontal: getSpacing(8),
//     },
//     progressLineActive: {
//         backgroundColor: '#fff',
//     },
//     sectionHeaderCard: {
//         marginHorizontal: getSpacing(20),
//         marginBottom: getSpacing(20),
//         backgroundColor: 'rgba(25, 79, 130, 1)',
//         borderRadius: 20,
//         padding: getSpacing(24),
//         alignItems: 'center',
//     },
//     sectionBadge: {
//         backgroundColor: 'transparent',
//         borderWidth: 1,
//         borderColor: 'rgba(255, 255, 255, 0.6)',
//         paddingHorizontal: getSpacing(20),
//         paddingVertical: getSpacing(8),
//         borderRadius: 20,
//         marginBottom: getSpacing(16),
//     },
//     sectionBadgeText: {
//         color: '#fff',
//         fontSize: getFontSize(14),
//         fontWeight: '600',
//     },
//     sectionTitle: {
//         fontSize: getFontSize(20),
//         fontWeight: '700',
//         color: '#fff',
//         textAlign: 'center',
//         lineHeight: getFontSize(28),
//     },
//     instructionText: {
//         fontSize: getFontSize(14),
//         color: 'rgba(255, 255, 255, 0.9)',
//         paddingHorizontal: getSpacing(20),
//         marginBottom: getSpacing(20),
//         lineHeight: getFontSize(21),
//     },
//     scrollView: {
//         flex: 1,
//     },
//     scrollContent: {
//         paddingBottom: getSpacing(100),
//     },
//     questionGroupCard: {
//         marginHorizontal: getSpacing(20),
//         marginBottom: getSpacing(16),
//         borderRadius: 20,
//         padding: getSpacing(20),
//         borderWidth: 1,
//         borderColor: 'rgba(255, 255, 255, 0.15)',
//     },
//     questionItem: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         paddingVertical: getSpacing(16),
//     },
//     checkbox: {
//         width: 24,
//         height: 24,
//         borderRadius: 6,
//         backgroundColor: 'rgba(200, 200, 210, 0.8)',
//         marginRight: getSpacing(16),
//         marginTop: getSpacing(2),
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     checkboxChecked: {
//         backgroundColor: '#5B7BB4',
//     },
//     checkboxViewMode: {
//         opacity: 0.7,
//     },
//     questionText: {
//         flex: 1,
//         fontSize: getFontSize(15),
//         color: '#fff',
//         lineHeight: getFontSize(23),
//         fontWeight: '400',
//     },
//     required: {
//         color: '#EF4444',
//     },
//     buttonContainer: {
//         flexDirection: 'row',
//         justifyContent: 'center',
//         paddingHorizontal: getSpacing(20),
//         paddingTop: getSpacing(32),
//         gap: getSpacing(16),
//     },
//     clearButton: {
//         flex: 1,
//         backgroundColor: '#fff',
//         borderRadius: 25,
//         paddingVertical: getSpacing(16),
//         alignItems: 'center',
//         maxWidth: 180,
//     },
//     clearButtonText: {
//         fontSize: getFontSize(15),
//         fontWeight: '600',
//         color: '#3D5A8C',
//     },
//     nextButton: {
//         flex: 1,
//         backgroundColor: 'rgba(60, 85, 130, 0.8)',
//         borderRadius: 25,
//         paddingVertical: getSpacing(16),
//         alignItems: 'center',
//         borderWidth: 1.5,
//         borderColor: 'rgba(255, 255, 255, 0.4)',
//         maxWidth: 180,
//     },
//     nextButtonText: {
//         fontSize: getFontSize(15),
//         fontWeight: '600',
//         color: '#fff',
//     },
//     buttonDisabled: {
//         opacity: 0.5,
//     },
// });
import AssessmentQuestionsSection from '@/components/AnswerQuestionSection';
import PreSurveySection from '@/components/PreSurveySection';
import SimpleSuccessModal from '@/components/atom/SimpleSuccessModal';
import ScheduleMeetingBottomSheet, { Mentor } from '@/components/director/ScheduleMeetingBottomSheet';
import TopBar from '@/components/director/TopBar';
import { Colors } from '@/constants/Colors';
import { dummyRoadMaps } from '@/lib/assessments/mock';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';


export default function AnswerQuestionPage() {
    const { assessmentId, viewMode, hasPreSurvey } = useLocalSearchParams();
    const router = useRouter();

    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Track if pre-survey is completed
    const [preSurveyCompleted, setPreSurveyCompleted] = useState(
        hasPreSurvey !== 'true' // If no pre-survey, mark as completed
    );

    const scheduleMeetingBottomSheetRef = useRef<BottomSheetModal>(null);

    const assessment = dummyRoadMaps.find(a => a.id === assessmentId);

    if (!assessment) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'red' }}>Error: Assessment data not found.</Text>
            </View>
        );
    }

    const isViewMode = viewMode === 'true';
    const showPreSurvey = hasPreSurvey === 'true' && !preSurveyCompleted && !isViewMode;

    const mockMentors: Mentor[] = [
        {
            id: '1',
            name: 'John Ross',
            role: 'Mentor',
            profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
        },
        {
            id: '2',
            name: 'Sarah Johnson',
            role: 'Field Mentor',
            profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
        },
        {
            id: '3',
            name: 'Michael Chen',
            role: 'Mentor',
            profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
        },
        {
            id: '4',
            name: 'Emily Davis',
            role: 'Mentor',
            profileImage: 'https://randomuser.me/api/portraits/women/4.jpg',
        },
        {
            id: '5',
            name: 'Robert Wilson',
            role: 'Field Mentor',
            profileImage: 'https://randomuser.me/api/portraits/men/5.jpg',
        },
        {
            id: '6',
            name: 'Lisa Anderson',
            role: 'Field Mentor',
            profileImage: 'https://randomuser.me/api/portraits/women/6.jpg',
        },
    ];

    const handlePreSurveyComplete = () => {
        setPreSurveyCompleted(true);
    };

    const handlePreSurveyCancel = () => {
        router.back();
    };

    const handleAssessmentSubmit = () => {
        setShowModal(true);
    };

    const handleScheduleMeeting = () => {
        setShowModal(false);
        setTimeout(() => {
            scheduleMeetingBottomSheetRef.current?.present();
        }, 300);
    };

    const handleSkipScheduling = () => {
        setShowModal(false);
        setTimeout(() => {
            router.back();
        }, 300);
    };

    const handleScheduleComplete = (data: any) => {
        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            const day = date.getDate();
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear().toString().slice(-2);
            return `${day} ${month} ${year}`;
        };

        setSuccessMessage(
            `Meeting scheduled with ${data.selectedMentor.name} on ${formatDate(data.selectedDate)} at ${data.selectedTime.label}`
        );
        setShowSuccessModal(true);

        setTimeout(() => {
            router.back();
        }, 2000);
    };

    return (
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
            {/* Conditionally render TopBar based on which section is shown */}
            {showPreSurvey ? (
                <TopBar
                    userName="John Ross"
                    showUserName={true}
                    showNotifications={true}
                />
            ) : (
                <TopBar showDrawer={false} showNotifications={false} />
            )}

            {/* Conditionally render Pre-Survey or Assessment Questions */}
            {showPreSurvey ? (
                <PreSurveySection
                    assessment={assessment}
                    assessmentId={assessmentId as string}
                    onComplete={handlePreSurveyComplete}
                    onCancel={handlePreSurveyCancel}
                />
            ) : (
                <AssessmentQuestionsSection
                    assessment={assessment}
                    assessmentId={assessmentId as string}
                    isViewMode={isViewMode}
                    onSubmit={handleAssessmentSubmit}
                />
            )}

            {/* Modals */}
            <Modal
                visible={showModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>
                            On completion of the PMP and CMA assessment tools please schedule a meeting with your mentor.
                        </Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.skipButton]}
                                onPress={handleSkipScheduling}
                            >
                                <Text style={styles.modalButtonText}>Skip for Now</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.scheduleButton]}
                                onPress={handleScheduleMeeting}
                            >
                                <Text style={styles.modalButtonText}>Schedule Meeting</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <ScheduleMeetingBottomSheet
                ref={scheduleMeetingBottomSheetRef}
                mentors={mockMentors}
                mode="schedule"
                onClose={() => {
                    scheduleMeetingBottomSheetRef.current?.dismiss();
                }}
                onSchedule={handleScheduleComplete}
                colorScheme={{
                    background: Colors.darkBlueGradientOne,
                    text: '#FFFFFF',
                    accent: '#FFC107',
                    cardBackground: 'rgba(255, 255, 255, 0.1)',
                }}
            />

            <SimpleSuccessModal
                visible={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    router.back();
                }}
                title={successMessage}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        elevation: 2,
        margin: 20,
        maxWidth: 400,
    },
    modalText: {
        textAlign: 'center',
        fontSize: 18,
        marginBottom: 24,
        color: '#176192',
        lineHeight: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    skipButton: {
        backgroundColor: '#6B7280',
    },
    scheduleButton: {
        backgroundColor: '#223A74',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
