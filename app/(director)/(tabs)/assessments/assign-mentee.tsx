import AssessmentAssignedSuccessModal from '@/components/build-components/AssessmentAssignedSuccessModal';
import MenteeCard from '@/components/director/MenteeCard';
import SearchBar from '@/components/director/SearchBar';
import TopBar from '@/components/director/TopBar';
import { useAssignAssessment } from '@/hooks/assessments';
import { useMentees } from '@/hooks/mentees/useMentees';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AssignAssessmentMenteeScreen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();
    const { assessmentId } = useLocalSearchParams<{ assessmentId: string }>();

    // Fetch mentees from API
    const { mentees, isLoading: isLoadingMentees, error: menteesError } = useMentees();
    const assignAssessment = useAssignAssessment();

    const [search, setSearch] = useState('');
    const [selectedMentees, setSelectedMentees] = useState<Set<string>>(new Set());
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Auto-close success modal after 3 seconds
    useEffect(() => {
        if (showSuccessModal) {
            const timer = setTimeout(() => {
                setShowSuccessModal(false);
                router.back();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [showSuccessModal, router]);

    const toggleSelectMentee = (id: string) => {
        setSelectedMentees(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedMentees.size === filteredMentees.length) {
            setSelectedMentees(new Set());
        } else {
            setSelectedMentees(new Set(filteredMentees.map(m => m.id)));
        }
    };

    const filteredMentees = useMemo(() => {
        if (!mentees) return [];
        return mentees.filter(mentee =>
            mentee.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [mentees, search]);

    const handleAssign = async () => {
        if (selectedMentees.size === 0) {
            Alert.alert('No Selection', 'Please select at least one mentee to assign.');
            return;
        }

        if (!assessmentId) {
            Alert.alert('Error', 'Assessment ID is missing. Please go back and try again.');
            return;
        }

        try {
            const userIds = Array.from(selectedMentees);
            await assignAssessment.mutateAsync({
                assessmentId,
                userIds,
            });
            
            setShowSuccessModal(true);
        } catch (error) {
            console.error('❌ Failed to assign assessment:', error);
            Alert.alert(
                'Assignment Failed',
                error instanceof Error ? error.message : 'Failed to assign assessment. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    const getSelectedNamesText = () => {
        if (selectedMentees.size === 0) return 'No mentees selected';

        const names = mentees
            .filter(m => selectedMentees.has(m.id))
            .map(m => m.name);

        return names.join(', ');
    };

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={[styles.container]}
        >
            {/* Top Bar */}
            <TopBar userName="David Roe" notifications={3} showUserName={true} showNotifications={true} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Assign Assessment</Text>
                <TouchableOpacity style={styles.viewToggle}>
                    <Ionicons name="grid-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <SearchBar value={search} onChangeValue={setSearch} />
            </View>

            {/* Select All */}
            <View style={styles.selectAllContainer}>
                <TouchableOpacity style={styles.selectAllButton} onPress={handleSelectAll}>
                    <Text style={styles.selectAllText}>Select All</Text>
                </TouchableOpacity>
            </View>

            {/* Mentees List */}
            {isLoadingMentees ? (
                <View style={[styles.loadingContainer, { paddingBottom: 100 + bottom }]}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Loading mentees...</Text>
                </View>
            ) : menteesError ? (
                <View style={[styles.errorContainer, { paddingBottom: 100 + bottom }]}>
                    <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
                    <Text style={styles.errorText}>Failed to load mentees</Text>
                    <Text style={styles.errorSubtext}>
                        {menteesError instanceof Error ? menteesError.message : 'An unexpected error occurred'}
                    </Text>
                </View>
            ) : filteredMentees.length === 0 ? (
                <View style={[styles.emptyContainer, { paddingBottom: 100 + bottom }]}>
                    <Ionicons name="people-outline" size={48} color="#fff" style={{ opacity: 0.5 }} />
                    <Text style={styles.emptyText}>No mentees found</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredMentees}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <MenteeCard
                            data={item}
                            layout="list"
                            isSelected={selectedMentees.has(item.id)}
                            onToggleSelect={() => toggleSelectMentee(item.id)}
                            onPress={() => toggleSelectMentee(item.id)}
                        />
                    )}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: 100 + bottom },
                    ]}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Sticky Bottom Assign Container */}
            <View style={[styles.bottomContainer, { paddingBottom: bottom + 16 }]}>
                <View style={styles.selectedNamesContainer}>
                    <Text style={styles.selectedNamesText} numberOfLines={1}>
                        {getSelectedNamesText()}
                    </Text>
                </View>

                <LinearGradient
                    colors={["#7C3AED", "#38BDF8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                        styles.gradientBorder,
                        selectedMentees.size === 0 && styles.gradientBorderDisabled,
                    ]}
                >
                    <TouchableOpacity
                        style={styles.assignButtonInner}
                        onPress={handleAssign}
                        disabled={selectedMentees.size === 0 || assignAssessment.isPending}
                    >
                        {assignAssessment.isPending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.assignButtonText}>Assign</Text>
                        )}
                    </TouchableOpacity>
                </LinearGradient>
            </View>

            {/* Success Modal */}
            <AssessmentAssignedSuccessModal
                visible={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    router.back();
                }}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'space-between',
    },
    backButton: {
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        flex: 1,
    },
    viewToggle: {
        padding: 4,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    selectAllContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    selectAllButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    selectAllText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: 16,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1E366F',
        paddingHorizontal: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    selectedNamesContainer: {
        flex: 1,
    },
    selectedNamesText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    gradientBorder: {
        padding: 2,
        borderRadius: 13,
    },
    gradientBorderDisabled: {
        opacity: 0.5,
    },
    assignButtonInner: {
        backgroundColor: '#1E366F',
        borderRadius: 11,
        paddingVertical: 12,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    assignButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
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
    },
    emptyText: {
        color: '#fff',
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.7,
    },
});


