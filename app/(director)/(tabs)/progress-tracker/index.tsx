import ActionBottomSheet from '@/components/director/ActionSheetModal';
import FilterModal, { FilterOption } from '@/components/director/FilterModal';
import MenteeCard, { Mentee } from '@/components/director/MenteeCard';
import MentorCard, { MentorData } from '@/components/director/MentorCard';
import SearchBar from '@/components/director/SearchBar';
import { TabSwitcher } from '@/components/director/TabSwitcher';
import TopBar from '@/components/director/TopBar';
import { mockMentees, STATES } from '@/constants/mockData';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ProgressTracker() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'mentor-wise' | 'in-progress' | 'completed'>('all');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Course Completion : Oldest');
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
        // Use setTimeout to ensure state is updated before opening
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

    const tabs = [
        { key: 'all', label: 'New', badge: 1 },
        { key: 'mentor-wise', label: 'Pending' },
        { key: 'in-progress', label: 'Accepted' },
        { key: 'completed', label: 'Completed' },
    ];

    const mockMentors: MentorData[] = [
        {
            id: 'mentor-1',
            name: 'Pr. John Ross',
            role: 'Lead Mentor',
            menteesCount: 12,
            description: 'Leads multiple church revitalization projects',
            profileImage: 'https://randomuser.me/api/portraits/men/33.jpg',
        },
        {
            id: 'mentor-2',
            name: 'Dr. Sarah Adams',
            role: 'Regional Mentor',
            menteesCount: 8,
            description: 'Focuses on community training and mentoring',
            profileImage: 'https://randomuser.me/api/portraits/women/45.jpg',
        },
        {
            id: 'mentor-3',
            name: 'Pr. Michael Brown',
            role: 'Field Mentor',
            menteesCount: 5,
            description: 'Works with pastors in rural regions',
            profileImage: 'https://randomuser.me/api/portraits/men/34.jpg',
        },
    ];

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={{ flex: 1, }}
        >
            <View className="flex-1">
                <TopBar notifications={3} showUserName={true} showNotifications={true} />

                <View className="flex-1 pt-6">
                    {}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: 'white/30' }}>
                        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="chevron-back" size={28} color="#fff" />
                            <Text style={{ fontSize: 16, fontWeight: 'semibold', color: 'white', marginLeft: 8 }} className="ml-2 text-xl font-semibold text-white">Progress Tracker</Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                                style={{ padding: 4 }}
                            >
                                <Ionicons name={viewMode === 'card' ? 'list' : 'grid'} size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {}
                    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    <TabSwitcher
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={(tabKey) => setActiveTab(tabKey as typeof activeTab)}
                    />

                    {}
                    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                        {activeTab === 'mentor-wise' ? (
                            mockMentors.map((mentor) => (
                                <MentorCard
                                    key={mentor.id}
                                    mentor={mentor}
                                    layout={viewMode}
                                    onCall={() => console.log('Call', mentor.name)}
                                    onChat={() => console.log('Chat', mentor.name)}
                                    onMail={() => console.log('Mail', mentor.name)}
                                    onWhatsApp={() => console.log('WhatsApp', mentor.name)}
                                    onMenuPress={() => console.log('Mentor menu', mentor.name)}
                                />
                            ))
                        ) : (
                            filteredMentees.map((mentee) => (
                                <MenteeCard
                                    key={mentee.id}
                                    data={mentee}
                                    layout={viewMode}
                                    onPress={() => router.push(`/(director)/(tabs)/progress-tracker/[id]`)}
                                    onCall={() => console.log('Call', mentee.name)}
                                    onChat={() => console.log('Chat', mentee.name)}
                                    onMail={() => console.log('Mail', mentee.name)}
                                    onWhatsApp={() => console.log('WhatsApp', mentee.name)}
                                    onMenuPress={() => handleMenuPress(mentee)}
                                    onMarkComplete={() => console.log('Mark complete', mentee.name)}
                                />
                            ))
                        )}
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
