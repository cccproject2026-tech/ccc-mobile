// app/assessments/pmp-report.tsx
import { getFontSize, getSpacing, isSmallDevice } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DevelopmentPlan {
    id: number;
    text: string;
}

interface Section {
    title: string;
    plans: DevelopmentPlan[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PMPReportScreen() {
    const { bottom, top } = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams();

    const userName = "John Ross";
    const completedDate = "20 Sep 2024";
    const assessmentTitle = "Pastoral Ministry Profile (PMP)";

    const sections: Section[] = [
        {
            title: "Section 1 - Personal Well-Being",
            plans: [
                { id: 1, text: "Schedule 1-on-1 with a mentor" },
                { id: 2, text: "Take trauma survey (via Claritysoft)" },
                { id: 3, text: "Identify areas of stress/anxiety" },
                { id: 4, text: "Family Wellbeing survey" },
                { id: 5, text: "Collaborate on a healing plan" },
                { id: 6, text: "Collaborate on a physical Exercise plan" },
                { id: 7, text: "Establish a prayer" },
                { id: 8, text: "covenant/partnership" },
                { id: 9, text: "Finalize a growth plan" },
            ]
        },
        {
            title: "Section 2 - Professional Development",
            plans: [
                { id: 1, text: "Schedule 1-on-1 with a mentor" },
                { id: 2, text: "Take trauma survey (via Claritysoft)" },
                { id: 3, text: "Identify areas of stress/anxiety" },
                { id: 4, text: "Family Wellbeing survey" },
                { id: 5, text: "Collaborate on a healing plan" },
                { id: 6, text: "Collaborate on a physical Exercise plan" },
                { id: 7, text: "Establish a prayer" },
                { id: 8, text: "covenant/partnership" },
                { id: 9, text: "Finalize a growth plan" },
            ]
        },
        {
            title: "Section 3 - Community Engagement (CE) Experience",
            plans: [
                { id: 1, text: "Schedule 1-on-1 with a mentor" },
                { id: 2, text: "Take trauma survey (via Claritysoft)" },
                { id: 3, text: "Identify areas of stress/anxiety" },
                { id: 4, text: "Family Wellbeing survey" },
                { id: 5, text: "Collaborate on a healing plan" },
                { id: 6, text: "Collaborate on a physical Exercise plan" },
                { id: 7, text: "Establish a prayer" },
                { id: 8, text: "covenant/partnership" },
                { id: 9, text: "Finalize a growth plan" },
            ]
        },
        {
            title: "Section 4 - Congregational Health",
            plans: [
                { id: 1, text: "Schedule 1-on-1 with a mentor" },
                { id: 2, text: "Take trauma survey (via Claritysoft)" },
                { id: 3, text: "Identify areas of stress/anxiety" },
                { id: 4, text: "Family Wellbeing survey" },
                { id: 5, text: "Collaborate on a healing plan" },
                { id: 6, text: "Collaborate on a physical Exercise plan" },
                { id: 7, text: "Establish a prayer" },
                { id: 8, text: "covenant/partnership" },
                { id: 9, text: "Finalize a growth plan" },
            ]
        },
        {
            title: "Section 5 - Continuing Education",
            plans: [
                { id: 1, text: "Schedule 1-on-1 with a mentor" },
                { id: 2, text: "Take trauma survey (via Claritysoft)" },
                { id: 3, text: "Identify areas of stress/anxiety" },
                { id: 4, text: "Family Wellbeing survey" },
                { id: 5, text: "Collaborate on a healing plan" },
                { id: 6, text: "Collaborate on a physical Exercise plan" },
                { id: 7, text: "Establish a prayer" },
                { id: 8, text: "covenant/partnership" },
                { id: 9, text: "Finalize a growth plan" },
            ]
        }
    ];

    const handleSavePDF = () => {
        console.log('Save PDF clicked');
        // Implement PDF generation logic here
    };

    const handleClose = () => {
        router.back();
    };

    return (
        <View style={[styles.container, { paddingTop: top }]}>
            {/* Close Button */}

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: bottom + getSpacing(100) }
                ]}
                showsVerticalScrollIndicator={false}
            >
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <Ionicons name="close" size={getFontSize(28)} color="#1E3A8A" />
                </TouchableOpacity>
                {/* Header with Logo */}
                <View style={styles.header}>
                    <Image
                        source={require('@/assets/images/ccc-logo-1.jpg')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* User Info */}
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.completedDate}>Completed on: {completedDate}</Text>

                {/* Survey Name */}
                <View style={styles.surveyNameContainer}>
                    <Text style={styles.surveyNameLabel}>Survey Name :</Text>
                    <Text style={styles.surveyNameValue}>{assessmentTitle}</Text>
                </View>

                {/* Sections */}
                {sections.map((section, index) => (
                    <View key={index} style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                        </View>

                        <View style={styles.plansContainer}>
                            <Text style={styles.plansTitle}>Customized Development Plans :</Text>

                            {section.plans.map((plan) => (
                                <View key={plan.id} style={styles.planItem}>
                                    <Text style={styles.starIcon}>⭐</Text>
                                    <Text style={styles.planText}>{plan.text}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
                <View style={[styles.footer,]}>
                    <TouchableOpacity style={styles.savePDFButton} onPress={handleSavePDF}>
                        <Ionicons name="download-outline" size={getFontSize(20)} color="#1E3A8A" />
                        <Text style={styles.savePDFText}>Save PDF</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Save PDF Button - Fixed at bottom */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    closeButton: {
        position: 'relative',
        // top: getSpacing(20),
        // right: getSpacing(20),
        alignSelf: 'flex-end',
        zIndex: 10,
        padding: getSpacing(8),
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: getSpacing(isSmallDevice ? 20 : 24),
        // paddingTop: getSpacing(12),
    },
    header: {
        alignItems: 'center',
        // marginBottom: getSpacing(24),
        // paddingTop: getSpacing(24),
    },
    logo: {
        width: SCREEN_WIDTH * 1.5,
        height: getSpacing(150),
    },
    userName: {
        fontSize: getFontSize(isSmallDevice ? 22 : 26),
        fontWeight: '700',
        color: '#1E3A8A',
        textAlign: 'center',
        marginBottom: getSpacing(10),
    },
    completedDate: {
        fontSize: getFontSize(isSmallDevice ? 14 : 15),
        color: '#64748B',
        textAlign: 'center',
        marginBottom: getSpacing(28),
    },
    surveyNameContainer: {
        marginBottom: getSpacing(32),
    },
    surveyNameLabel: {
        fontSize: getFontSize(isSmallDevice ? 16 : 17),
        color: '#1E3A8A',
        fontWeight: '600',
        marginBottom: getSpacing(6),
    },
    surveyNameValue: {
        fontSize: getFontSize(isSmallDevice ? 18 : 20),
        color: '#1E3A8A',
        fontWeight: '700',
    },
    sectionContainer: {
        marginBottom: getSpacing(32),
    },
    sectionHeader: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 2,
        borderBottomColor: '#1E3A8A',
        paddingBottom: getSpacing(10),
        marginBottom: getSpacing(18),
    },
    sectionTitle: {
        fontSize: getFontSize(isSmallDevice ? 17 : 19),
        fontWeight: '700',
        color: '#1E3A8A',
        lineHeight: getFontSize(isSmallDevice ? 24 : 26),
    },
    plansContainer: {
        backgroundColor: '#FFFFFF',
    },
    plansTitle: {
        fontSize: getFontSize(isSmallDevice ? 16 : 17),
        fontWeight: '600',
        color: '#1E3A8A',
        marginBottom: getSpacing(14),
    },
    planItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: getSpacing(12),
        paddingLeft: getSpacing(4),
    },
    starIcon: {
        fontSize: getFontSize(isSmallDevice ? 16 : 18),
        marginRight: getSpacing(10),
        marginTop: getSpacing(1),
    },
    planText: {
        flex: 1,
        fontSize: getFontSize(isSmallDevice ? 15 : 16),
        color: '#334155',
        lineHeight: getFontSize(isSmallDevice ? 22 : 24),
    },
    footer: {
        position: 'relative',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: getSpacing(24),
        alignItems: 'flex-end',

    },
    savePDFButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: getSpacing(8),
        paddingVertical: getSpacing(8),
    },
    savePDFText: {
        fontSize: getFontSize(isSmallDevice ? 16 : 17),
        fontWeight: '600',
        color: '#1E3A8A',
        textDecorationLine: 'underline',
    },
});
