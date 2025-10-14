import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import React, { forwardRef, useCallback, useMemo } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
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
    onDownload?: () => void;
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
            onDownload,
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
                        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom * 2 }]}
                        showsVerticalScrollIndicator={false}
                    >

                        <View style={styles.closeButtonRow}>
                            <Pressable onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={32} color="#FFFFFF" />
                            </Pressable>
                        </View>


                        <Text style={styles.mainTitle}>{title}</Text>


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


                        <Text style={styles.levelText}>{levelText}</Text>


                        <View style={styles.plansCard}>

                            <View style={styles.cardTitleWrapper}>
                                <Text style={styles.cardTitle}>Customized Development Plans</Text>
                                <View style={styles.titleUnderline} />
                            </View>


                            <View style={styles.plansList}>
                                {plans.map((plan) => (
                                    <View key={plan.id} style={styles.planItem}>
                                        <Ionicons name="star" size={20} color="#FFD700" />
                                        <Text style={styles.planText}>{plan.text}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>


                        <View style={styles.bottomButtons}>
                            <Pressable
                                onPress={onNext}
                                style={[
                                    styles.nextButton,
                                ]}
                            >
                                <Text style={styles.nextButtonText}>Next {'>>'}</Text>
                            </Pressable>

                            <Pressable
                                onPress={onDownload}
                                style={[
                                    styles.downloadButton,
                                ]}
                            >
                                <Ionicons name="download-outline" size={20} color="#FFFFFF" />
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
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    handleIndicator: {
        display: 'none',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 24,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    closeButtonRow: {
        alignItems: 'flex-end',
        paddingTop: 16,
        marginBottom: 16,
    },
    closeButton: {
        padding: 4,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 24,
    },
    sectionHeaderWrapper: {
        marginBottom: 24,
    },
    gradientBorder: {
        padding: 2.5,
        borderRadius: 16,
    },
    sectionHeaderContent: {
        backgroundColor: '#1D548D',
        paddingVertical: 20,
        paddingHorizontal: 24,
        borderRadius: 13.5,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    levelText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 28,
    },
    plansCard: {
        backgroundColor: 'rgba(42, 70, 135, 0.5)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        padding: 24,
        marginBottom: 32,
    },
    cardTitleWrapper: {
        alignItems: 'center',
        marginBottom: 28,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    titleUnderline: {
        width: 200,
        height: 2,
        backgroundColor: '#FFFFFF',
    },
    plansList: {
        gap: 16,
    },
    planItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    planText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '400',
        color: '#FFFFFF',
        lineHeight: 24,
    },
    bottomButtons: {
        gap: 16,
        alignItems: 'flex-end',
    },
    nextButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 12,
        minWidth: 200,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#1C4ED8',
        fontSize: 18,
        fontWeight: '700',
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        // paddingVertical: 12,
    },
    downloadButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    buttonPressed: {
        opacity: 0.7,
    },
});

export default PMPBottomSheet;
