import FilterModal, { FilterOption } from '@/components/director/FilterModal';
import MenteeCard, { Mentee } from '@/components/director/MenteeCard';
import SearchBar from '@/components/director/SearchBar';
import TopBar from '@/components/director/TopBar';
import { STATES } from '@/constants/mockData';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



const mockMentees: Mentee[] = [
    {
        id: '1',
        name: 'John Doe',
        description: 'Pastor interested in revitalization roadmap mentoring',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        lastContacted: '11 / 01 / 2025',
        totalMentors: 0,
    },
    {
        id: '2',
        name: 'John Doe',
        description: 'Pastor interested in revitalization roadmap mentoring',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        lastContacted: '10 / 28 / 2025',
        totalMentors: 2,
    },
    {
        id: '3',
        name: 'John Doe',
        description: 'Pastor interested in revitalization roadmap mentoring',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        lastContacted: '11 / 01 / 2025',
        totalMentors: 2,
    },
    {
        id: '4',
        name: 'John Doe',
        description: 'Pastor interested in revitalization roadmap mentoring',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        lastContacted: '10 / 25 / 2025',
        totalMentors: 0,
    },
    {
        id: '5',
        name: 'John Doe',
        description: 'Pastor interested in revitalization roadmap mentoring',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        lastContacted: '10 / 30 / 2025',
        totalMentors: 0,
    },
    {
        id: '6',
        name: 'John Doe',
        description: 'Pastor interested in revitalization roadmap mentoring',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        lastContacted: '10 / 15 / 2025',
        totalMentors: 0,
    },
    {
        id: '7',
        name: 'John Doe',
        description: 'Pastor interested in revitalization roadmap mentoring',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        lastContacted: '11 / 02 / 2025',
        totalMentors: 0,
    },
];

export default function AssignMenteeScreen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();

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

    const getFilterDisplayText = () => {
        if (STATES.includes(selectedFilter)) {
            return `State : ${selectedFilter}`;
        }
        return selectedFilter || 'Latest Join';
    };

    const filteredMentees = useMemo(() => {
        return mockMentees.filter(mentee =>
            mentee.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    const handleAssign = () => {
        if (selectedMentees.size === 0) {
            Alert.alert('No Selection', 'Please select at least one mentee to assign.');
            return;
        }

        const selectedNames = mockMentees
            .filter(m => selectedMentees.has(m.id))
            .map(m => m.name)
            .join(', ');

        Alert.alert(
            'Assign Mentees',
            `Are you sure you want to assign: ${selectedNames}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Assign',
                    onPress: () => {
                        console.log('Assigned:', Array.from(selectedMentees));
                        // Show success modal
                        setShowSuccessModal(true);
                    },
                },
            ]
        );
    };

    const getSelectedNamesText = () => {
        if (selectedMentees.size === 0) return 'No mentees selected';

        const names = mockMentees
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
                        disabled={selectedMentees.size === 0}
                    >
                        <Text style={styles.assignButtonText}>Assign</Text>
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
});
