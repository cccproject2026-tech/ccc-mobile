import ActionBottomSheet from '@/components/director/ActionSheetModal';
import FilterModal, { FilterOption } from '@/components/director/FilterModal';
import MenteeCard, { Mentee } from '@/components/director/MenteeCard';
import MentorProfileSwiper from '@/components/director/MentorProfileSwiper';
import SearchBar from '@/components/director/SearchBar';
import { TabSwitcher } from '@/components/director/TabSwitcher';
import TopBar from '@/components/director/TopBar';
import { mockMentees, STATES } from '@/constants/mockData';
import { getFontSize, getIconSize, getSpacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';




export default function Mentees() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'in-progress' | 'completed'>('in-progress');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Course Completion : Oldest');
    const { bottom } = useSafeAreaInsets();
    const { height } = Dimensions.get('window');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);

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

        { icon: 'person-add-outline', label: 'Assessments', onPress: () => console.log('Assessments') },
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
        if (key === 'all' || key === 'in-progress' || key === 'completed') {
            setActiveTab(key);
        }
    };

    const getFilterDisplayText = () => {
        if (STATES.includes(selectedFilter)) {
            return `State: ${selectedFilter}`;
        }
        return selectedFilter || `Course Completion : ${selectedFilter}`;
    };

    const filterOptions = useMemo(() => getFilterOptions(), []);

    const filteredMentees = useMemo(() => {
        let filtered = mockMentees;

        if (search) {
            filtered = filtered.filter((mentee) =>
                mentee.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (activeTab === 'completed') {
            filtered = filtered.filter((mentee) => mentee.isCompleted);
        } else if (activeTab === 'in-progress') {
            filtered = filtered.filter((mentee) => !mentee.isCompleted);
        }

        return filtered;
    }, [search, activeTab]);

    const inProgressCount = mockMentees.filter((m) => !m.isCompleted).length;

    const tabs = [
        { key: 'all', label: 'All' },
        { key: 'in-progress', label: 'In-progress', badge: inProgressCount },
        { key: 'completed', label: 'Completed' }
    ];

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={[styles.container,]}
        >
            <View style={styles.innerContainer}>
                <TopBar userName="David Roe" notifications={3} showUserName={true} showNotifications={true} />

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

                    <View style={styles.sortContainer}>
                        <Text style={styles.sortLabel}>Sort by</Text>
                        <Pressable
                            onPress={() => setFilterModalVisible(true)}
                            style={styles.sortButton}
                        >
                            <Text style={styles.sortButtonText} numberOfLines={1}>
                                {getFilterDisplayText()}
                            </Text>
                            <Ionicons name="chevron-down" size={getIconSize(18)} color="#fff" />
                        </Pressable>
                    </View>

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

                <ActionBottomSheet
                    ref={bottomSheetModalRef}
                    title={selectedMentee?.name || ''}
                    image={selectedMentee?.profileImage}
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
