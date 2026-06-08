import AssessmentCard from '@/components/build-components/cards/assessment-card';
import SearchBar from '@/components/director/SearchBar';
import TopBar from '@/components/director/TopBar';
import { useAssessments } from '@/hooks/assessments';
import { ApiAssessment, Assessment } from '@/lib/assessments/types';
import { Ionicons } from '@expo/vector-icons';
import AppGradientBackground from '@/components/layout/AppGradientBackground';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Helper function to map API assessment to component Assessment type
const mapApiAssessmentToAssessment = (apiAssessment: ApiAssessment): Assessment => {
    
    const inferType = (name: string): 'CMA' | 'PMP' => {
        const nameLower = name.toLowerCase();
        if (nameLower.includes('cma') || nameLower.includes('church')) {
            return 'CMA';
        }
        return 'PMP';
    };

    return {
        id: apiAssessment._id,
        type: inferType(apiAssessment.name),
        title: apiAssessment.name,
        description: apiAssessment.description,
        status: 'Not Started' as const,
        guidelines: apiAssessment.instructions,
        sections: apiAssessment.sections.map((section) => ({
            title: section.title,
            subtitle: section.description,
            questionGroups: section.layers.map((layer) => ({
                id: layer._id,
                questions: [
                    {
                        id: layer._id,
                        text: layer.title,
                        type: 'radio' as const,
                        options: layer.choices.map((c) => ({
                            label: c.text,
                            value: c._id,
                        })),
                        required: false,
                    },
                ],
            })),
        })),
    };
};

export default function AssessmentsScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const [search, setSearch] = useState('');

    // Fetch assessments from API
    const { data: apiAssessments, isLoading, error, refetch } = useAssessments();

    
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    // Map API assessments to component Assessment type
    const assessments = useMemo(() => {
        if (!apiAssessments) return [];
        return apiAssessments.map(mapApiAssessmentToAssessment);
    }, [apiAssessments]);

    const filteredAssessments = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (q.length === 0) return assessments;
        return assessments.filter(
            (a) =>
                a.title.toLowerCase().includes(q) ||
                a.description.toLowerCase().includes(q)
        );
    }, [search, assessments]);

    const handleAssessmentPress = (assessment: Assessment) => {
        router.push({
            pathname: '/(director)/(tabs)/assessments/assign-mentee',
            params: { assessmentId: assessment.id },
        });
    };

    return (
        <AppGradientBackground style={styles.container}>
            <TopBar notifications={3} showUserName={true} showNotifications={true} />

            {}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Assessments</Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => router.push('/(director)/(tabs)/assessments/create-assessment')}
                >
                    <Ionicons name="add-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {}
            <View style={styles.searchContainer}>
                <SearchBar value={search} onChangeValue={setSearch} placeholder="Search assessments..." />
            </View>

            {}
            <View style={styles.content}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.loadingText}>Loading assessments...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
                        <Text style={styles.errorText}>Failed to load assessments</Text>
                        <Text style={styles.errorSubtext}>
                            {error instanceof Error ? error.message : 'An unexpected error occurred'}
                        </Text>
                    </View>
                ) : filteredAssessments.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={48} color="#fff" style={{ opacity: 0.5 }} />
                        <Text style={styles.emptyText}>
                            {search.trim() ? 'No assessments found matching your search.' : 'No assessments available.'}
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingBottom: bottom + 20 },
                        ]}
                        showsVerticalScrollIndicator={false}
                    >
                        {filteredAssessments.map((assessment) => (
                            <View key={assessment.id} style={styles.cardWrapper}>
                                <AssessmentCard
                                    data={assessment}
                                    onPress={() => handleAssessmentPress(assessment)}
                                    onMeetingPress={() => {}}
                                    onMeetingIconPress={() => {}}
                                    onCustomizedPress={() => {}}
                                />
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>
        </AppGradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    },
    backButton: {
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        flex: 1,
    },
    createButton: {
        width: 40,
        height: 40,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    cardWrapper: {
        marginBottom: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        color: '#fff',
        marginTop: 16,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    errorText: {
        color: '#ff6b6b',
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
    },
    errorSubtext: {
        color: '#fff',
        marginTop: 8,
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyText: {
        color: '#fff',
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.7,
    },
});

