import ActionBottomSheet from '@/components/director/ActionSheetModal';
import FilterModal, { FilterOption } from '@/components/director/FilterModal';
import MenteeCard, { Mentee } from '@/components/director/MenteeCard';
import MentorProfileSwiper from '@/components/director/MentorProfileSwiper';
import SearchBar from '@/components/director/SearchBar';
import TopBar from '@/components/director/TopBar';
import { mockMentees } from '@/constants/mockData';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PHASES = ['All Phases', 'Phase 1', 'Phase 2', 'Phase 3'];

export default function MentorMentees() {
    const router = useRouter();
    const { id } = useLocalSearchParams(); // Mentor ID from route
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'in-progress' | 'completed'>('in-progress');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Course Completion : Latest');
    const { bottom } = useSafeAreaInsets();
    const { height } = Dimensions.get('window');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
    const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
    // Mock mentor name - in real app, fetch from API using id
    const mentorName = 'John Doe';


    const bottomSheetModalRef = useRef<BottomSheetModal>(null);


    const handleMenuPress = useCallback((mentee: Mentee) => {
        setSelectedMentee(mentee);
        // Use setTimeout to ensure state is updated before opening
        setTimeout(() => {
            bottomSheetModalRef.current?.present();
        }, 0);
    }, []);

    const getFilterOptions = (): FilterOption[] => {
        return [
            { label: 'Last Contact : Oldest' },
            { label: 'Last Contact : Newest' },
            { label: 'Course Completion : Latest' },
            {
                label: 'Phase',
                options: PHASES,
                isExpandable: true,
            },
        ];
    };

    const handleCloseModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
    }, []);

    const handleTabChange = (tab: 'all' | 'in-progress' | 'completed') => {
        setActiveTab(tab);
    };

    const menuItems = [
        { icon: 'people-outline', label: 'Revitalization Roadmaps', onPress: router.push.bind(router, '/(director)/(tabs)/mentors/mentor-mentees') },
        { icon: 'person-add-outline', label: 'Assessments', onPress: router.push.bind(router, '/(director)/(tabs)/mentors/assign-mentee') },
        { icon: 'person-remove-outline', label: 'Assignments', onPress: router.push.bind(router, '/(director)/(tabs)/mentors/remove-mentee') },
        { icon: 'clipboard-outline', label: 'Roadmaps of Mentees', onPress: () => console.log('Roadmaps of Mentees') },
        { icon: 'checkmark-done-outline', label: 'Mentor Notes', onPress: () => console.log('Assessments of Mentees') },
        { icon: 'book-outline', label: 'View Progress Report', onPress: () => console.log('Assignments of Mentees') },
        { icon: 'stats-chart-outline', label: 'Micro Grant', onPress: () => console.log('Progress of Mentees') },
        { icon: 'calendar-outline', label: 'Product and Services', onPress: () => console.log('Schedule a Meeting') },
    ];

    const getFilterDisplayText = () => {
        if (PHASES.includes(selectedFilter)) {
            return selectedFilter;
        }
        return selectedFilter || 'Course Completion : Latest';
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

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={{ flex: 1, paddingBottom: bottom + height * 0.05 }}
        >
            <View className="flex-1">
                <TopBar userName="David Roe" notifications={3} showUserName={true} showNotifications={true} />

                <View className="flex-1 pt-6">
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-4 pb-3 mb-4 border-b border-white/30">
                        <TouchableOpacity onPress={() => router.back()}>
                            <View className="flex-row items-center">
                                <Ionicons name="chevron-back" size={28} color="#fff" />
                                <View className="ml-2">
                                    <Text className="text-xl font-semibold text-white">Mentees</Text>
                                    <Text className="text-sm text-white/80">Mentor &gt; {mentorName}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', gap: 12 }}>

                            <TouchableOpacity
                                onPress={() => router.push('/(director)/(tabs)/mentors/assign-mentee')}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 4,
                                    paddingVertical: 8,
                                    paddingHorizontal: 12,
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.5)',
                                    borderRadius: 8,
                                }}
                            >
                                <Ionicons name="add" size={18} color="#fff" />
                                <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
                                    Assign
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                                style={{ padding: 4 }}
                            >
                                <Ionicons name={viewMode === 'card' ? 'list' : 'grid'} size={24} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={{ padding: 4 }} onPress={() => router.push(`/(director)/(tabs)/mentors/mentor-mentee-locations`)}>
                                <Ionicons name="location-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {/* Tabs */}
                    <View className="flex-row gap-3 px-4 mb-4">
                        <Pressable
                            onPress={() => handleTabChange('all')}
                            className={`flex-1 py-3 rounded-2xl border border-white/50 ${activeTab === 'all' ? 'bg-white' : 'bg-[#14517D]'
                                }`}
                        >
                            <Text
                                className={`text-center text-base font-semibold ${activeTab === 'all' ? 'text-[#1a5b77]' : 'text-white'
                                    }`}
                            >
                                All
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => handleTabChange('in-progress')}
                            className={`flex-1 py-3 rounded-2xl border border-white/50 ${activeTab === 'in-progress' ? 'bg-white' : 'bg-[#14517D]'
                                }`}
                        >
                            <Text
                                className={`text-center text-base font-semibold ${activeTab === 'in-progress' ? 'text-[#1a5b77]' : 'text-white'
                                    }`}
                            >
                                In-progress ({inProgressCount})
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => handleTabChange('completed')}
                            className={`flex-1 py-3 rounded-2xl border border-white/50 ${activeTab === 'completed' ? 'bg-white' : 'bg-[#14517D]'
                                }`}
                        >
                            <Text
                                className={`text-center text-base font-semibold ${activeTab === 'completed' ? 'text-[#1a5b77]' : 'text-white'
                                    }`}
                            >
                                Completed
                            </Text>
                        </Pressable>
                    </View>

                    <View
                        className="mb-4 border-b border-white/30"
                        style={{
                            borderBottomLeftRadius: 20,
                            borderBottomRightRadius: 20,
                        }}
                    >
                        <MentorProfileSwiper />
                    </View>

                    {/* Sort By */}
                    <View className="flex-row items-center justify-end gap-2 px-4 mb-4">
                        <Text className="text-base text-white">Sort by</Text>
                        <Pressable
                            onPress={() => setFilterModalVisible(true)}
                            className="flex-row items-center gap-2 px-4 py-2 bg-transparent border rounded-full border-white/50"
                        >
                            <Text className="text-base font-medium text-white" numberOfLines={1}>
                                {getFilterDisplayText()}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#fff" />
                        </Pressable>
                    </View>

                    {/* Mentees List */}
                    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                        {filteredMentees.map((mentee) => (
                            <MenteeCard
                                key={mentee.id}
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
                        ))}
                    </ScrollView>
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
