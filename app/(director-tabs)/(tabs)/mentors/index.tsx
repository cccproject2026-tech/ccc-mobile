import ActionBottomSheet from '@/components/director/ActionSheetModal';
import FilterModal, { FilterOption } from '@/components/director/FilterModal';
import MentorCard, { MentorData } from '@/components/director/MentorCard';
import MentorProfileSwiper from '@/components/director/MentorProfileSwiper';
import SearchBar from '@/components/director/SearchBar';
import { TabSwitcher } from '@/components/director/TabSwitcher';
import TopBar from '@/components/director/TopBar';
import { STATES } from '@/constants/mockData';
import {
    getFontSize,
    getIconSize,
    getSpacing,
    isAndroid
} from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export const mockMentors: MentorData[] = [
    {
        id: '1',
        name: 'John Doe',
        role: 'Mentor',
        menteesCount: 5,
        description: 'Sub text area write something here. That you can read more about him',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
        id: '2',
        name: 'John Doe',
        role: 'Field Mentor',
        menteesCount: 5,
        description: 'Sub text area write something here. That you can read more about him',
        profileImage: 'https://randomuser.me/api/portraits/men/33.jpg',
    },
    {
        id: '3',
        name: 'John Doe',
        role: 'Mentor',
        menteesCount: 5,
        description: 'Sub text area write something here. That you can read more about him',
        profileImage: 'https://randomuser.me/api/portraits/men/34.jpg',
    },
    {
        id: '1',
        name: 'John Doe',
        role: 'Mentor',
        menteesCount: 5,
        description: 'Sub text area write something here. That you can read more about him',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
        id: '2',
        name: 'John Doe',
        role: 'Field Mentor',
        menteesCount: 5,
        description: 'Sub text area write something here. That you can read more about him',
        profileImage: 'https://randomuser.me/api/portraits/men/33.jpg',
    },
    {
        id: '3',
        name: 'John Doe',
        role: 'Mentor',
        menteesCount: 5,
        description: 'Sub text area write something here. That you can read more about him',
        profileImage: 'https://randomuser.me/api/portraits/men/34.jpg',
    },
    {
        id: '1',
        name: 'John Doe',
        role: 'Mentor',
        menteesCount: 5,
        description: 'Sub text area write something here. That you can read more about him',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
        id: '2',
        name: 'John Doe',
        role: 'Field Mentor',
        menteesCount: 5,
        description: 'Sub text area write something here. That you can read more about him',
        profileImage: 'https://randomuser.me/api/portraits/men/33.jpg',
    },
    {
        id: '3',
        name: 'John Doe',
        role: 'Mentor',
        menteesCount: 5,
        description: 'Sub text area write something here. That you can read more about him',
        profileImage: 'https://randomuser.me/api/portraits/men/34.jpg',
    },
];




export default function Mentors() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'mentor' | 'field_mentor'>('all');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Least number of Mentees');
    const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
    const [selectedMentor, setSelectedMentor] = useState<MentorData | null>(null);
    const { bottom } = useSafeAreaInsets();

    // Memoize screen dimensions to avoid recalculation
    const screenDimensions = useMemo(() => Dimensions.get('window'), []);

    const menuItemsMentor = [
        { icon: 'people-outline', label: 'List of Mentees', onPress: router.push.bind(router, '/(director-tabs)/(tabs)/mentors/mentor-mentees') },
        { icon: 'person-add-outline', label: 'Assign New Mentee', onPress: router.push.bind(router, '/(director-tabs)/(tabs)/mentors/assign-mentee') },
        { icon: 'person-remove-outline', label: 'Remove a Mentee', onPress: router.push.bind(router, '/(director-tabs)/(tabs)/mentors/remove-mentee') },
        { icon: 'clipboard-outline', label: 'Roadmaps of Mentees', onPress: () => console.log('Roadmaps of Mentees') },
        { icon: 'checkmark-done-outline', label: 'Assessments of Mentees', onPress: () => console.log('Assessments of Mentees') },
        { icon: 'book-outline', label: 'Assignments of Mentees', onPress: () => console.log('Assignments of Mentees') },
        { icon: 'stats-chart-outline', label: 'Progress of Mentees', onPress: () => console.log('Progress of Mentees') },
        { icon: 'calendar-outline', label: 'Schedule a Meeting', onPress: () => console.log('Schedule a Meeting') },
        { icon: 'create-outline', label: 'Edit Profile', onPress: () => console.log('Edit Profile') },
    ];
    const menuItemsFieldMentor = [
        { icon: 'people-outline', label: 'List of Mentees', onPress: router.push.bind(router, '/(director-tabs)/(tabs)/mentors/mentor-mentees') },
        { icon: 'person-add-outline', label: 'Assign New Mentee', onPress: router.push.bind(router, '/(director-tabs)/(tabs)/mentors/assign-mentee') },
        { icon: 'person-remove-outline', label: 'Remove a Mentee', onPress: router.push.bind(router, '/(director-tabs)/(tabs)/mentors/remove-mentee') },
        { icon: 'calendar-outline', label: 'Schedule a Meeting', onPress: () => console.log('Schedule a Meeting') },
        { icon: 'create-outline', label: 'Edit Profile', onPress: () => console.log('Edit Profile') },
        { icon: 'person-remove-outline', label: 'Remove as Field Mentor', onPress: () => console.log('Remove as Field Mentor') },
    ];

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const handleMenuPress = useCallback((mentor: MentorData) => {
        setSelectedMentor(mentor);
        setTimeout(() => {
            bottomSheetModalRef.current?.present();
        }, 0);
    }, []);

    const handleCloseModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
    }, []);

    const renderMentorItem = useCallback(({ item: mentor }: { item: MentorData }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(director-tabs)/(tabs)/mentors/${mentor.id}`)}
            activeOpacity={0.8}
        >
            <MentorCard
                mentor={mentor}
                layout={viewMode}
                onCall={() => console.log('Call', mentor.name)}
                onChat={() => console.log('Chat', mentor.name)}
                onMail={() => console.log('Mail', mentor.name)}
                onWhatsApp={() => console.log('WhatsApp', mentor.name)}
                onMenuPress={() => handleMenuPress(mentor)}
            />
        </TouchableOpacity>
    ), [viewMode, router, handleMenuPress]);

    const getItemLayout = useCallback((data: any, index: number) => {
        const itemHeight = viewMode === 'list' ?
            (isAndroid ? getSpacing(78) : getSpacing(88)) :
            (isAndroid ? getSpacing(180) : getSpacing(200));

        return {
            length: itemHeight,
            offset: itemHeight * index,
            index,
        };
    }, [viewMode]);

    const keyExtractor = useCallback((item: MentorData, index: number) => `${item.id}-${index}`, []);

    const tabItems = useMemo(() => [
        { key: 'all', label: 'All' },
        { key: 'mentor', label: 'Mentor' },
        { key: 'field_mentor', label: 'Field Mentor' },
    ], []);

    const handleTabChange = useCallback((tab: string) => {
        setActiveTab(tab as 'all' | 'mentor' | 'field_mentor');
    }, []);

    const getFilterOptions = (): FilterOption[] => {
        return [
            { label: 'Least number of Mentees' },
            {
                label: 'State',
                options: STATES,
                isExpandable: true
            }
        ];
    };

    const getFilterDisplayText = () => {
        if (STATES.includes(selectedFilter)) {
            return `State : ${selectedFilter}`;
        }
        return selectedFilter || 'Least number of Mentees';
    };

    const filterOptions = useMemo(() => getFilterOptions(), []);

    const filteredMentors = useMemo(() => {
        let filtered = mockMentors;

        if (search) {
            filtered = filtered.filter(mentor =>
                mentor.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (activeTab === 'mentor') {
            filtered = filtered.filter(mentor => mentor.role === 'Mentor');
        } else if (activeTab === 'field_mentor') {
            filtered = filtered.filter(mentor => mentor.role === 'Field Mentor');
        }

        return filtered;
    }, [search, activeTab]);

    return (
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
            <View className="flex-1">
                <TopBar userName="David Roe" notifications={3} showUserName={true} showNotifications={true} />

                <View className="flex-1 pt-6">
                    <View style={styles.headerContainer}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={getIconSize(28)} color="#fff" />
                            <Text style={styles.headerTitle}>Mentors</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                            style={styles.viewToggle}
                        >
                            <Ionicons
                                name={viewMode === 'card' ? 'list' : 'grid'}
                                size={getIconSize(24)}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    <View style={styles.swiperContainer}>
                        <MentorProfileSwiper />
                    </View>

                    <TabSwitcher
                        tabs={tabItems}
                        activeTab={activeTab}
                        onChange={handleTabChange}
                    />

                    <View style={styles.filterContainer}>
                        <Text style={styles.sortByText}>Sort By</Text>
                        <Pressable
                            onPress={() => setFilterModalVisible(true)}
                            style={styles.filterButton}
                        >
                            <Text style={styles.filterText} numberOfLines={1}>
                                {getFilterDisplayText()}
                            </Text>
                            <Ionicons name="chevron-down" size={getIconSize(18)} color="#fff" />
                        </Pressable>
                    </View>

                    <FlatList
                        data={filteredMentors}
                        renderItem={renderMentorItem}
                        keyExtractor={keyExtractor}
                        getItemLayout={getItemLayout}
                        showsVerticalScrollIndicator={false}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={10}
                        windowSize={10}
                        initialNumToRender={5}
                        contentContainerStyle={styles.flatListContent}
                        style={styles.flatList}
                    />
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

                {/* Bottom Sheet Modal - Outside ScrollView */}
                {selectedMentor && (
                    <ActionBottomSheet
                        ref={bottomSheetModalRef}
                        title={selectedMentor.name}
                        subtitle={`${selectedMentor.menteesCount} Mentees`}
                        image={selectedMentor.profileImage}
                        actions={selectedMentor.role === 'Mentor' ? menuItemsMentor : menuItemsFieldMentor}
                        onClose={handleCloseModal}
                    />
                )}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
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
        fontSize: getFontSize(20),
        fontWeight: '600',
        color: '#fff',
    },
    viewToggle: {
        padding: getSpacing(8),
    },
    searchContainer: {
        paddingHorizontal: getSpacing(16),
        marginBottom: getSpacing(16),
    },
    swiperContainer: {
        marginBottom: getSpacing(16),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
        borderBottomLeftRadius: getSpacing(20),
        borderBottomRightRadius: getSpacing(20),
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: getSpacing(8),
        paddingHorizontal: getSpacing(16),
        marginBottom: getSpacing(16),
    },
    sortByText: {
        fontSize: getFontSize(16),
        color: '#fff',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: getSpacing(8),
        paddingHorizontal: getSpacing(16),
        paddingVertical: getSpacing(8),
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: getSpacing(25),
    },
    filterText: {
        fontSize: getFontSize(16),
        fontWeight: '500',
        color: '#fff',
    },
    flatList: {
        flex: 1,
    },
    flatListContent: {
        paddingHorizontal: getSpacing(16),
        paddingBottom: getSpacing(16),
    },
});
