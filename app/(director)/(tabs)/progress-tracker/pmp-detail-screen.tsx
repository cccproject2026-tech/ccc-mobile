import { icons } from '@/constants/images';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DevelopmentPlan {
    id: number;
    text: string;
}

interface Section {
    id: number;
    title: string;
    plans: DevelopmentPlan[];
}

export default function PMPDetailsScreen() {
    const router = useRouter();

    const sections: Section[] = [
        {
            id: 1,
            title: 'Section 1 - Personal Well-Being',
            plans: [
                { id: 1, text: 'Schedule 1-on-1 with a mentor' },
                { id: 2, text: 'Take trauma survey (via Claritysoft)' },
                { id: 3, text: 'Identify areas of stress/anxiety' },
                { id: 4, text: 'Family Wellbeing survey' },
                { id: 5, text: 'Collaborate on a healing plan' },
                { id: 6, text: 'Collaborate on a physical Exercise plan' },
                { id: 7, text: 'Establish a prayer covenant/partnership' },
                { id: 8, text: 'Finalize a growth plan' },
            ],
        },
        {
            id: 2,
            title: 'Section 2 - Professional Development',
            plans: [
                { id: 1, text: 'Schedule 1-on-1 with a mentor' },
                { id: 2, text: 'Take trauma survey (via Claritysoft)' },
                { id: 3, text: 'Identify areas of stress/anxiety' },
                { id: 4, text: 'Family Wellbeing survey' },
                { id: 5, text: 'Collaborate on a healing plan' },
                { id: 6, text: 'Collaborate on a physical Exercise plan' },
                { id: 7, text: 'Establish a prayer covenant/partnership' },
                { id: 8, text: 'Finalize a growth plan' },
            ],
        },
        {
            id: 3,
            title: 'Section 3 - Continuing Education',
            plans: [
                { id: 1, text: 'Schedule 1-on-1 with a mentor' },
                { id: 2, text: 'Take trauma survey (via Claritysoft)' },
                { id: 3, text: 'Identify areas of stress/anxiety' },
                { id: 4, text: 'Family Wellbeing survey' },
                { id: 5, text: 'Collaborate on a healing plan' },
                { id: 6, text: 'Collaborate on a physical Exercise plan' },
                { id: 7, text: 'Establish a prayer covenant/partnership' },
                { id: 8, text: 'Finalize a growth plan' },
            ],
        },
        {
            id: 4,
            title: 'Section 4 - Continuing Education',
            plans: [
                { id: 1, text: 'Schedule 1-on-1 with a mentor' },
                { id: 2, text: 'Take trauma survey (via Claritysoft)' },
                { id: 3, text: 'Identify areas of stress/anxiety' },
                { id: 4, text: 'Family Wellbeing survey' },
                { id: 5, text: 'Collaborate on a healing plan' },
                { id: 6, text: 'Collaborate on a physical Exercise plan' },
                { id: 7, text: 'Establish a prayer covenant/partnership' },
                { id: 8, text: 'Finalize a growth plan' },
            ],
        },
    ];

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {}
                    <View style={styles.header}>
                        <Pressable onPress={() => router.back()} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color="#1C4ED8" />
                        </Pressable>
                        <Pressable style={styles.downloadButton}>
                            <Ionicons name="download-outline" size={20} color="#1C4ED8" />
                            <Text style={styles.downloadText}>Download</Text>
                        </Pressable>
                    </View>

                    {}
                    <View style={styles.profileSection}>
                        <Image
                            source={icons.myProfile}
                            style={styles.avatar}
                            resizeMode="cover"
                        />
                        <Text style={styles.userName}>John Ross</Text>
                    </View>

                    {}
                    <View style={styles.surveyNameSection}>
                        <Text style={styles.surveyLabel}>Survey Name :</Text>
                        <Text style={styles.surveyValue}>Self Assessment Survey</Text>
                    </View>

                    {}
                    {sections.map((section) => (
                        <View key={section.id} style={styles.sectionCard}>
                            {}
                            <View style={styles.sectionTitleWrapper}>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                <View style={styles.titleUnderline} />
                            </View>

                            {}
                            <Text style={styles.plansLabel}>
                                Customized Development Plans :
                            </Text>

                            {}
                            <View style={styles.plansList}>
                                {section.plans.map((plan) => (
                                    <View key={plan.id} style={styles.planItem}>
                                        <Ionicons name="star" size={18} color="#FFD700" />
                                        <Text style={styles.planText}>{plan.text}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    closeButton: {
        padding: 4,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    downloadText: {
        color: '#1C4ED8',
        fontSize: 15,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 12,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    surveyNameSection: {
        flexDirection: 'row',
        paddingVertical: 20,
        paddingHorizontal: 16,
        gap: 8,
        backgroundColor: '#FFFFFF',
    },
    surveyLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1C4ED8',
    },
    surveyValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1C4ED8',
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        padding: 24,
        marginHorizontal: 16,
        marginBottom: 20,
    },
    sectionTitleWrapper: {
        alignItems: 'center',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1C4ED8',
        marginBottom: 8,
    },
    titleUnderline: {
        width: '100%',
        height: 2,
        backgroundColor: '#1C4ED8',
    },
    plansLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1C4ED8',
        marginBottom: 16,
    },
    plansList: {
        gap: 14,
    },
    planItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    planText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '400',
        color: '#374151',
        lineHeight: 22,
    },
});
