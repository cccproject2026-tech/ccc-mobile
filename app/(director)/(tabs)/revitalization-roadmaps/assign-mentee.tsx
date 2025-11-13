import FilterModal, { FilterOption } from '@/components/director/FilterModal';
import MenteeCard from '@/components/director/MenteeCard';
import SearchBar from '@/components/director/SearchBar';
import TopBar from '@/components/director/TopBar';
import { STATES } from '@/constants/mockData';
import { useMentees } from '@/hooks/mentees/useMentees';
import { useAssignRoadmap } from '@/hooks/progress/useAssignRoadmap';
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



export default function AssignMenteeScreen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();
    const { roadmapId } = useLocalSearchParams<{ roadmapId: string }>();

    // Fetch mentees from API
    const { mentees, isLoading: isLoadingMentees, error: menteesError } = useMentees();
    const assignRoadmap = useAssignRoadmap();

    const [search, setSearch] = useState('');
    const [selectedMentees, setSelectedMentees] = useState<Set<string>>(new Set());
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Latest Join');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Auto-close success modal after 3 seconds
    useEffect(() => {
        if (showSuccessModal) {
            const timer = setTimeout(() => {
                setShowSuccessModal(false);
                router.replace('/revitalization-roadmaps');
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

    const getFilterOptions = (): FilterOption[] => {
        return [
            { label: 'Latest Join' },
            { label: 'Least number of Mentors' },
            {
                label: 'State',
                options: STATES,
                isExpandable: true
            },
            {
                label: 'Conference',
                isExpandable: true
            }
        ];
    };

    const filterOptions = useMemo(() => getFilterOptions(), []);


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

        if (!roadmapId) {
            Alert.alert('Error', 'Roadmap ID is missing. Please go back and try again.');
            return;
        }

        try {
            const userIds = Array.from(selectedMentees);
            const result = await assignRoadmap.mutateAsync({
                userIds,
                roadMapIds: [roadmapId],
            });
            
            console.log('✅ Roadmaps assigned successfully:', result.message);
            setShowSuccessModal(true);
        } catch (error) {
            console.error('❌ Failed to assign roadmap:', error);
            Alert.alert(
                'Assignment Failed',
                error instanceof Error ? error.message : 'Failed to assign roadmap. Please try again.',
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
                <Text style={styles.headerTitle}>Assigned to</Text>
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
                        disabled={selectedMentees.size === 0 || assignRoadmap.isPending}
                    >
                        {assignRoadmap.isPending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.assignButtonText}>Assign</Text>
                        )}
                    </TouchableOpacity>
                </LinearGradient>
            </View>

            <FilterModal
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                selectedFilter={selectedFilter}
                onFilterSelect={(filter) => {
                    setSelectedFilter(filter);
                    setFilterModalVisible(false);
                }}
                filterOptions={filterOptions}
            />

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {
                    setShowSuccessModal(false);
                    router.back()
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            {/* Success Text */}
                            <Text style={styles.successTitle}>Assigned Roadmap</Text>
                            <Text style={styles.successSubtitle}>Successfully</Text>
                        </View>
                    </View>
                </View>
            </Modal>
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
    // Success Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        maxWidth: 320,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 48,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: 'rgba(23, 97, 146, 1)',
        textAlign: 'center',
        marginBottom: 4,
    },
    successSubtitle: {
        fontSize: 22,
        fontWeight: '600',
        color: 'rgba(23, 97, 146, 1)',
        textAlign: 'center',
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
