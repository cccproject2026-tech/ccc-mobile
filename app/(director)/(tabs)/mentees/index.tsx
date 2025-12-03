import ActionBottomSheet from '@/components/director/ActionSheetModal';
import FilterModal, { FilterOption } from '@/components/director/FilterModal';
import MenteeCard from '@/components/director/MenteeCard';
import MentorProfileSwiper from '@/components/director/MentorProfileSwiper';
import SearchBar from '@/components/director/SearchBar';
import { TabSwitcher } from '@/components/director/TabSwitcher';
import TopBar from '@/components/director/TopBar';
import { STATES } from '@/constants/mockData';
import { useMentees } from '@/hooks/mentees/useMentees';
import { Mentee } from '@/types/mentee.types';
import { getFontSize, getIconSize, getSpacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



export default function Mentees() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'not-started' | 'in-progress' | 'completed'>('in-progress');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Course Completion : Oldest');
    const { bottom } = useSafeAreaInsets();
    const { height } = Dimensions.get('window');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
    const { data: mentees, isLoading, isError, error } = useMentees();

    if (isError) {
        console.log('Error : ', error)
    }
    const getFilterOptions = (): FilterOption[] => {
        return [
            {
                label: 'Course Completion',
                options: ['Latest', 'Oldest'],
                isExpandable: true
            },
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

    const menuItems = [
        {
            icon: 'people-outline',
            label: 'Revitalization Roadmaps',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/(director)/(tabs)/mentors/mentor-mentees');
                }, 300);
            }
        },
        {
            icon: 'person-add-outline',
            label: 'Assign Mentor',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/(director)/(tabs)/mentees/assign-mentor');
                }, 300);
            }
        },
        {
            icon: 'person-remove-outline',
            label: 'Remove Mentor',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/(director)/(tabs)/mentees/remove-mentor');
                }, 300);
            }
        },

        { icon: 'person-add-outline', label: 'Assessments', onPress: () => router.push('/(director)/(tabs)/assessments') },
        { icon: 'person-remove-outline', label: 'Assignments', onPress: () => console.log('Assignments') },
        { icon: 'clipboard-outline', label: 'Roadmaps of Mentees', onPress: () => console.log('Roadmaps of Mentees') },
        {
            icon: 'checkmark-done-outline', label: 'Mentor Notes', onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push(`/(director)/(tabs)/mentees/notes`);
                }, 300);
            }
        },
        { icon: 'book-outline', label: 'View Progress Report', onPress: () => console.log('Assignments of Mentees') },
        { icon: 'stats-chart-outline', label: 'Micro Grant', onPress: () => console.log('Progress of Mentees') },
        { icon: 'calendar-outline', label: 'Product and Services', onPress: () => console.log('Schedule a Meeting') },
    ];


    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const handleMenuPress = useCallback((mentee: Mentee) => {
        setSelectedMentee(mentee);
        setTimeout(() => {
            bottomSheetModalRef.current?.present();
        }, 0);
    }, []);

    const handleCloseModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
        setTimeout(() => {
            setSelectedMentee(null);
        }, 300);
    }, []);

    const handleTabChange = (key: string) => {
        if (key === 'all' || key === 'not-started' || key === 'in-progress' || key === 'completed') {
            setActiveTab(key);
        }
    };

    const filterOptions = useMemo(() => getFilterOptions(), []);

    // ============================
    // TAB + SEARCH FILTERING
    // ============================
    const filteredMentees = useMemo(() => {
        const menteeList = Array.isArray(mentees) ? mentees : mentees?.mentees || [];
        let filtered = menteeList;

        // Search filter
        if (search) {
            filtered = filtered.filter((mentee) =>
                mentee.name.toLowerCase().includes(search.toLowerCase()) ||
                mentee.role?.toLowerCase().includes(search.toLowerCase()) ||
                mentee.description?.toLowerCase().includes(search.toLowerCase())
            );
        }

        // TAB FILTERING BASED ON PROGRESS
        if (activeTab === 'not-started') {
            filtered = filtered.filter(
                (mentee) => (mentee.progress ?? 0) === 0
            );
        }
        else if (activeTab === 'in-progress') {
            filtered = filtered.filter(
                (mentee) =>
                    (mentee.progress ?? 0) > 0 &&
                    (mentee.progress ?? 0) < 100
            );
        }
        else if (activeTab === 'completed') {
            filtered = filtered.filter(
                (mentee) =>
                    mentee.progress === 100 ||
                    mentee.hasCompleted === true
            );
        }

        return filtered;
    }, [mentees, search, activeTab]);

    // ============================
    // TAB BADGE COUNTS
    // ============================
    const menteeList = Array.isArray(mentees) ? mentees : mentees?.mentees || [];

    const notStartedCount = useMemo(
        () => menteeList.filter((m) => (m.progress ?? 0) === 0).length,
        [mentees]
    );

    const inProgressCount = useMemo(
        () =>
            menteeList.filter(
                (m) =>
                    (m.progress ?? 0) > 0 &&
                    (m.progress ?? 0) < 100
            ).length,
        [mentees]
    );

    const completedCount = useMemo(
        () =>
            menteeList.filter(
                (m) => m.progress === 100 || m.hasCompleted === true
            ).length,
        [mentees]
    );

    const tabs = [
        { key: 'all', label: 'All' },
        { key: 'not-started', label: 'Not Started', badge: notStartedCount },
        { key: 'in-progress', label: 'In-progress', badge: inProgressCount },
        { key: 'completed', label: 'Completed', badge: completedCount }
    ];


    // ============================
    // LOADING / ERROR STATES
    // ============================
    if (isLoading) {
        return (
            <LinearGradient
                colors={['#176192', '#1D548D', '#264387']}
                style={[styles.container]}
            >
                <View style={styles.innerContainer}>
                    <TopBar notifications={3} showUserName={true} showNotifications={true} />
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#fff" />
                    </View>
                </View>
            </LinearGradient>
        );
    }

    if (isError) {
        return (
            <LinearGradient
                colors={['#176192', '#1D548D', '#264387']}
                style={[styles.container]}
            >
                <View style={styles.innerContainer}>
                    <TopBar notifications={3} showUserName={true} showNotifications={true} />
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: getSpacing(16) }}>
                        <Text style={{ color: '#fff', textAlign: 'center', fontSize: getFontSize(16) }}>
                            Failed to load mentees. Please try again.
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        );
    }

    // ============================
    // MAIN UI
    // ============================
    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={[styles.container]}
        >
            <View style={styles.innerContainer}>
                <TopBar notifications={3} showUserName={true} showNotifications={true} />

                <View style={styles.contentContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={getIconSize(28)} color="#fff" />
                            <Text style={styles.headerTitle}>Mentees</Text>
                        </TouchableOpacity>

                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                onPress={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                                style={styles.actionButton}
                            >
                                <Ionicons name={viewMode === 'card' ? 'list' : 'grid'} size={getIconSize(24)} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => router.push('/(director)/(tabs)/mentees/mentees-location')}
                            >
                                <Ionicons name="location-outline" size={getIconSize(24)} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {/* TabSwitcher */}
                    <TabSwitcher
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={handleTabChange}
                    />

                    <View style={styles.profileSwiperContainer}>
                        <MentorProfileSwiper />
                    </View>

                    {/* Sort */}
                    <View style={styles.sortContainer}>
                        <Text style={styles.sortLabel}>Sort by</Text>
                        <Pressable
                            onPress={() => setFilterModalVisible(true)}
                            style={styles.sortButton}
                        >
                            <Text style={styles.sortButtonText} numberOfLines={1}>
                                {selectedFilter}
                            </Text>
                            <Ionicons name="chevron-down" size={getIconSize(18)} color="#fff" />
                        </Pressable>
                    </View>

                    {/* Mentee List */}
                    <FlatList
                        style={styles.flatList}
                        data={filteredMentees}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item: mentee }) => (
                            <MenteeCard
                                data={mentee}
                                layout={viewMode}
                                onPress={() => router.push(`/(director)/(tabs)/mentees/${mentee.id}`)}
                                onCall={() => console.log('Call', mentee.name)}
                                onChat={() => console.log('Chat', mentee.name)}
                                onMail={() => console.log('Mail', mentee.name)}
                                onWhatsApp={() => console.log('WhatsApp', mentee.name)}
                                onMenuPress={() => handleMenuPress(mentee)}
                                onMarkComplete={() => console.log('Mark complete', mentee.name)}
                                onIssueCertificate={() => console.log('Issue certificate', mentee.name)}
                                onInviteAsFieldMentor={() => console.log('Invite as field mentor', mentee.name)}
                            />
                        )}
                        contentContainerStyle={styles.flatListContent}
                        showsVerticalScrollIndicator={false}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={10}
                        updateCellsBatchingPeriod={50}
                        initialNumToRender={5}
                        windowSize={10}
                        getItemLayout={(data, index) => ({
                            length: viewMode === 'list' ? 68 : 280,
                            offset: (viewMode === 'list' ? 68 : 280) * index,
                            index,
                        })}
                    />
                </View>

                {/* MODALS */}
                <ActionBottomSheet
                    ref={bottomSheetModalRef}
                    title={selectedMentee?.username || selectedMentee?.firstName || ''}
                    image={selectedMentee?.profilePicture}
                    actions={menuItems}
                    onClose={handleCloseModal}
                />

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
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        paddingTop: getSpacing(24),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: getSpacing(16),
        paddingBottom: getSpacing(12),
        marginBottom: getSpacing(16),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        marginLeft: getSpacing(8),
        fontSize: getFontSize(18),
        fontWeight: '600',
        color: '#fff',
    },
    headerActions: {
        flexDirection: 'row',
        gap: getSpacing(12),
    },
    actionButton: {
        padding: getSpacing(4),
    },
    searchContainer: {
        paddingHorizontal: getSpacing(16),
        marginBottom: getSpacing(16),
    },
    profileSwiperContainer: {
        marginBottom: getSpacing(16),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
        borderBottomLeftRadius: getSpacing(20),
        borderBottomRightRadius: getSpacing(20),
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: getSpacing(8),
        paddingHorizontal: getSpacing(16),
        marginBottom: getSpacing(16),
    },
    sortLabel: {
        fontSize: getFontSize(14),
        color: '#fff',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: getSpacing(8),
        paddingHorizontal: getSpacing(16),
        paddingVertical: getSpacing(8),
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: getSpacing(20),
    },
    sortButtonText: {
        fontSize: getFontSize(14),
        fontWeight: '500',
        color: '#fff',
    },
    flatList: {
        flex: 1,
    },
    flatListContent: {
        paddingHorizontal: getSpacing(16),
    },
});
