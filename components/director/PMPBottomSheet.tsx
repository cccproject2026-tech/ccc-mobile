import { getFontSize, getSpacing, isSmallDevice } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DevelopmentPlan {
    id: number;
    text: string;
    completed?: boolean;
}

interface PMPBottomSheetProps {
    title?: string;
    sectionTitle?: string;
    levelText?: string;
    developmentPlans?: DevelopmentPlan[];
    onClose?: () => void;
    onNext?: () => void;
    onPrevious?: () => void;
    onDownload?: () => void;
    showPreviousButton?: boolean;
    currentSection?: number;
    totalSections?: number;
}

const PMPBottomSheet = forwardRef<BottomSheetModal, PMPBottomSheetProps>(
    (
        {
            title = 'Pastoral Ministry Profile (PMP)',
            sectionTitle = 'Section 1 - Personal Well-Being',
            levelText = 'You are at Level 1 !',
            developmentPlans = [],
            onClose,
            onNext,
            onPrevious,
            onDownload,
            showPreviousButton = false,
            currentSection,
            totalSections,
        },
        ref
    ) => {
        const { bottom } = useSafeAreaInsets();
        const snapPoints = useMemo(() => ['85%'], []);

        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop
                    {...props}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    opacity={0.7}
                    pressBehavior="close"
                />
            ),
            []
        );

        const defaultPlans: DevelopmentPlan[] = [
            { id: 1, text: 'Schedule 1-on-1 with a mentor', completed: false },
            { id: 2, text: 'Take trauma survey (via Claritysoft)', completed: false },
            { id: 3, text: 'Identify areas of stress/anxiety', completed: false },
            { id: 4, text: 'Family Wellbeing survey', completed: false },
            { id: 5, text: 'Collaborate on a healing plan', completed: false },
            { id: 6, text: 'Collaborate on a physical Exercise plan', completed: false },
            { id: 7, text: 'Establish a prayer covenant/partnership', completed: false },
            { id: 8, text: 'Finalize a growth plan', completed: false },
        ];

        const plans = developmentPlans.length > 0 ? developmentPlans : defaultPlans;

        return (
            <BottomSheetModal
                ref={ref}
                snapPoints={snapPoints}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                backgroundComponent={() => null}
                handleIndicatorStyle={styles.handleIndicator}
                onDismiss={onClose}
                android_keyboardInputMode="adjustResize"
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore"
            >
                <LinearGradient
                    colors={['#264387', '#1D548D', '#176192']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={[styles.sheetGradient, { paddingBottom: bottom }]}
                >
                    <BottomSheetScrollView
                        style={styles.contentContainer}
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingBottom: Math.max(bottom + getSpacing(20), getSpacing(30)) }
                        ]}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Close Button */}
                        <View style={styles.closeButtonRow}>
                            <Pressable onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={getFontSize(26)} color="#FFFFFF" />
                            </Pressable>
                        </View>

                        {/* Title */}
                        <Text style={styles.mainTitle}>{title}</Text>

                        {/* Section Header with Gradient Border */}
                        <View style={styles.sectionHeaderWrapper}>
                            <LinearGradient
                                colors={['#7B2FF7', '#00D4FF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientBorder}
                            >
                                <View style={styles.sectionHeaderContent}>
                                    <Text style={styles.sectionTitle}>{sectionTitle}</Text>
                                </View>
                            </LinearGradient>
                        </View>

                        {/* Level Text */}
                        <Text style={styles.levelText}>{levelText}</Text>

                        {/* Plans Card */}
                        <View style={styles.plansCard}>
                            <View style={styles.cardTitleWrapper}>
                                <Text style={styles.cardTitle}>Customized Development Plans</Text>
                                <View style={styles.titleUnderline} />
                            </View>

                            <View style={styles.plansList}>
                                {plans.map((plan) => (
                                    <View key={plan.id} style={styles.planItem}>
                                        <Ionicons
                                            name="star"
                                            size={getFontSize(isSmallDevice ? 16 : 18)}
                                            color="#FFD700"
                                            style={styles.starIcon}
                                        />
                                        <Text style={styles.planText}>{plan.text}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Navigation Buttons */}
                        <View style={styles.bottomButtons}>
                            <View style={styles.navigationButtons}>
                                {showPreviousButton && onPrevious && (
                                    <Pressable
                                        onPress={onPrevious}
                                        style={styles.previousButton}
                                    >
                                        <Text style={styles.previousButtonText}>
                                            {'<<'}Previous
                                        </Text>
                                    </Pressable>
                                )}

                                <Pressable
                                    onPress={onNext}
                                    style={[
                                        styles.nextButton,
                                        showPreviousButton && styles.nextButtonWithPrevious
                                    ]}
                                >
                                    <Text style={styles.nextButtonText}>Next {'>>'}</Text>
                                </Pressable>
                            </View>

                            {/* Download Button */}
                            <Pressable onPress={onDownload} style={styles.downloadButton}>
                                <Ionicons
                                    name="download-outline"
                                    size={getFontSize(18)}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.downloadButtonText}>Download</Text>
                            </Pressable>
                        </View>
                    </BottomSheetScrollView>
                </LinearGradient>
            </BottomSheetModal>
        );
    }
);

const styles = StyleSheet.create({
    sheetGradient: {
        flex: 1,
        borderTopLeftRadius: getSpacing(20),
        borderTopRightRadius: getSpacing(20),
    },
    handleIndicator: {
        display: 'none',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: getSpacing(isSmallDevice ? 16 : 20),
    },
    scrollContent: {
        paddingTop: getSpacing(4),
    },
    closeButtonRow: {
        alignItems: 'flex-end',
        paddingTop: getSpacing(8),
        marginBottom: getSpacing(8),
    },
    closeButton: {
        padding: getSpacing(4),
    },
    mainTitle: {
        fontSize: getFontSize(isSmallDevice ? 18 : 20),
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: getSpacing(isSmallDevice ? 14 : 18),
    },
    sectionHeaderWrapper: {
        marginBottom: getSpacing(isSmallDevice ? 14 : 18),
    },
    gradientBorder: {
        padding: 2,
        borderRadius: getSpacing(12),
    },
    sectionHeaderContent: {
        backgroundColor: '#1D548D',
        paddingVertical: getSpacing(isSmallDevice ? 12 : 16),
        paddingHorizontal: getSpacing(isSmallDevice ? 16 : 20),
        borderRadius: getSpacing(10),
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: getFontSize(isSmallDevice ? 15 : 17),
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: getFontSize(isSmallDevice ? 20 : 24),
    },
    levelText: {
        fontSize: getFontSize(isSmallDevice ? 17 : 19),
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: getSpacing(isSmallDevice ? 16 : 20),
    },
    plansCard: {
        backgroundColor: 'rgba(42, 70, 135, 0.5)',
        borderRadius: getSpacing(14),
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        padding: getSpacing(isSmallDevice ? 14 : 18),
        marginBottom: getSpacing(isSmallDevice ? 18 : 24),
    },
    cardTitleWrapper: {
        alignItems: 'center',
        marginBottom: getSpacing(isSmallDevice ? 14 : 18),
    },
    cardTitle: {
        fontSize: getFontSize(isSmallDevice ? 16 : 18),
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: getSpacing(6),
    },
    titleUnderline: {
        width: getSpacing(isSmallDevice ? 160 : 180),
        height: 2,
        backgroundColor: '#FFFFFF',
    },
    plansList: {
        gap: getSpacing(isSmallDevice ? 10 : 12),
    },
    planItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: getSpacing(10),
    },
    starIcon: {
        marginTop: getSpacing(2),
    },
    planText: {
        flex: 1,
        fontSize: getFontSize(isSmallDevice ? 13 : 15),
        fontWeight: '400',
        color: '#FFFFFF',
        lineHeight: getFontSize(isSmallDevice ? 19 : 22),
    },
    bottomButtons: {
        gap: getSpacing(12),
        alignItems: 'center',
        paddingTop: getSpacing(4),
    },
    navigationButtons: {
        flexDirection: 'row',
        gap: getSpacing(10),
        width: '100%',
        justifyContent: 'center',
    },
    previousButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: getSpacing(isSmallDevice ? 10 : 12),
        paddingHorizontal: getSpacing(isSmallDevice ? 20 : 28),
        borderRadius: getSpacing(10),
        flex: 1,
        maxWidth: getSpacing(isSmallDevice ? 140 : 160),
        alignItems: 'center',
    },
    previousButtonText: {
        color: '#1C4ED8',
        fontSize: getFontSize(isSmallDevice ? 14 : 16),
        fontWeight: '700',
    },
    nextButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: getSpacing(isSmallDevice ? 10 : 12),
        paddingHorizontal: getSpacing(isSmallDevice ? 28 : 36),
        borderRadius: getSpacing(10),
        minWidth: getSpacing(isSmallDevice ? 140 : 160),
        alignItems: 'center',
    },
    nextButtonWithPrevious: {
        flex: 1,
        maxWidth: getSpacing(isSmallDevice ? 140 : 160),
        minWidth: 0,
        paddingHorizontal: getSpacing(isSmallDevice ? 20 : 28),
    },
    nextButtonText: {
        color: '#1C4ED8',
        fontSize: getFontSize(isSmallDevice ? 14 : 16),
        fontWeight: '700',
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: getSpacing(6),
        paddingVertical: getSpacing(4),
    },
    downloadButtonText: {
        color: '#FFFFFF',
        fontSize: getFontSize(isSmallDevice ? 13 : 15),
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});

export default PMPBottomSheet;
