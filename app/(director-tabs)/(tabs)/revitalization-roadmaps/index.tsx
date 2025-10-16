import ActionBottomSheet from '@/components/director/ActionSheetModal';
import ContextMenu, { MenuItem } from '@/components/director/ContextMenu';
import CreateRoadmapModal, { RoadmapFormData } from '@/components/director/CreateRoadmapModal';
import ExpectedOutcomeModal from '@/components/director/ExpectedOutcomeModal';
import FilterModal, { FilterOption } from '@/components/director/FilterModal';
import MenteeCard, { Mentee } from '@/components/director/MenteeCard';
import MentorCard, { MentorData } from '@/components/director/MentorCard';
import MentorProfileSwiper from '@/components/director/MentorProfileSwiper';
import RoadmapCard, { RoadmapCardData } from '@/components/director/ProgressRoadmapCard';
import SearchBar from '@/components/director/SearchBar';
import { TabSwitcher } from '@/components/director/TabSwitcher';
import TopBar from '@/components/director/TopBar';
import { mockMentees, STATES } from '@/constants/mockData';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



// Mock data for Mentors
const mockMentors: MentorData[] = [
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
        name: 'Jane Smith',
        role: 'Field Mentor',
        menteesCount: 8,
        description: 'Experienced field mentor with expertise in community engagement',
        profileImage: 'https://randomuser.me/api/portraits/women/33.jpg',
    },
    {
        id: '3',
        name: 'Mike Johnson',
        role: 'Mentor',
        menteesCount: 3,
        description: 'Specializes in leadership development and ministry skills',
        profileImage: 'https://randomuser.me/api/portraits/men/34.jpg',
    },
];

// Mock data for Roadmap Library
const mockRoadmapLibrary: RoadmapCardData[] = [
    {
        image: require('@/assets/images/jumpstart.png'),
        title: 'Jump-start',
        description: 'Interested in receiving mentoring in community engagement',
        completionTime: 'Completion Time Months 1 - 2',
        showArrow: true,
    },
    {
        image: require('@/assets/images/roadmap.jpg'),
        title: 'Self Revitalization Phase',
        description: 'Develop personal leadership and ministry skills',
        completionTime: 'Completion Time Months 3 - 6',
        showArrow: true,
    },
    {
        image: require('@/assets/images/roadmap.jpg'),
        title: 'Church Empowerment Phase',
        description: 'Build church capacity and community engagement',
        completionTime: 'Completion Time Months 7 - 12',
        showArrow: true,
    },
    {
        image: require('@/assets/images/jumpstart.png'),
        title: 'Community Revitalization and Multiplication',
        description: 'Expand ministry impact and multiply efforts',
        completionTime: 'Completion Time Months 13 - 18',
        showArrow: true,
    },
    {
        image: require('@/assets/images/roadmap.jpg'),
        title: 'Leadership Development',
        description: 'Advanced leadership training and mentorship',
        completionTime: 'Completion Time Months 19 - 24',
        showArrow: true,
    },
];

export default function RevitalizationRoadmap() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'roadmap-library' | 'mentors' | 'mentees'>('roadmap-library');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Course Completion : Oldest');
    const { bottom } = useSafeAreaInsets();
    const { height } = Dimensions.get('window');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
    const [selectedMentor, setSelectedMentor] = useState<MentorData | null>(null);
    const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapCardData | null>(null);
    const [showOutcomeMenu, setShowOutcomeMenu] = useState(false);
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState<string>('');
    const [showCreateRoadmapModal, setShowCreateRoadmapModal] = useState(false);

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



    // Menu items for mentees
    const menteeMenuItems = [
        {
            icon: 'people-outline',
            label: 'Revitalization Roadmaps',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/(director-tabs)/(tabs)/mentors/mentor-mentees');
                }, 300);
            }
        },
        {
            icon: 'person-add-outline',
            label: 'Assign Mentor',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/(director-tabs)/(tabs)/mentees/assign-mentor');
                }, 300);
            }
        },
        {
            icon: 'person-remove-outline',
            label: 'Remove Mentor',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/(director-tabs)/(tabs)/mentees/remove-mentor');
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
                    router.push(`/(director-tabs)/(tabs)/mentees/notes`);
                }, 300);
            }
        },
        { icon: 'book-outline', label: 'View Progress Report', onPress: () => console.log('Assignments of Mentees') },
        { icon: 'stats-chart-outline', label: 'Micro Grant', onPress: () => console.log('Progress of Mentees') },
        { icon: 'calendar-outline', label: 'Product and Services', onPress: () => console.log('Schedule a Meeting') },
    ];

    // Menu items for mentors
    const mentorMenuItems = [
        { icon: 'people-outline', label: 'List of Mentees', onPress: () => router.push('/(director-tabs)/(tabs)/mentors/mentor-mentees') },
        { icon: 'person-add-outline', label: 'Assign New Mentee', onPress: () => router.push('/(director-tabs)/(tabs)/mentors/assign-mentee') },
        { icon: 'person-remove-outline', label: 'Remove a Mentee', onPress: () => router.push('/(director-tabs)/(tabs)/mentors/remove-mentee') },
        { icon: 'clipboard-outline', label: 'Roadmaps of Mentees', onPress: () => console.log('Roadmaps of Mentees') },
        { icon: 'checkmark-done-outline', label: 'Assessments of Mentees', onPress: () => console.log('Assessments of Mentees') },
        { icon: 'book-outline', label: 'Assignments of Mentees', onPress: () => console.log('Assignments of Mentees') },
        { icon: 'stats-chart-outline', label: 'Progress of Mentees', onPress: () => console.log('Progress of Mentees') },
        { icon: 'calendar-outline', label: 'Schedule a Meeting', onPress: () => console.log('Schedule a Meeting') },
        { icon: 'create-outline', label: 'Edit Profile', onPress: () => console.log('Edit Profile') },
    ];

    const fieldMentorMenuItems = [
        { icon: 'people-outline', label: 'List of Mentees', onPress: () => router.push('/(director-tabs)/(tabs)/mentors/mentor-mentees') },
        { icon: 'person-add-outline', label: 'Assign New Mentee', onPress: () => router.push('/(director-tabs)/(tabs)/mentors/assign-mentee') },
        { icon: 'person-remove-outline', label: 'Remove a Mentee', onPress: () => router.push('/(director-tabs)/(tabs)/mentors/remove-mentee') },
        { icon: 'calendar-outline', label: 'Schedule a Meeting', onPress: () => console.log('Schedule a Meeting') },
        { icon: 'create-outline', label: 'Edit Profile', onPress: () => console.log('Edit Profile') },
        { icon: 'person-remove-outline', label: 'Remove as Field Mentor', onPress: () => console.log('Remove as Field Mentor') },
    ];

    // Menu items for roadmaps
    const roadmapMenuItems = [
        {
            icon: 'person-add-outline',
            label: 'Assign to',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/(director-tabs)/(tabs)/revitalization-roadmaps/assign-mentee');
                }, 300);
            }
        },
        {
            icon: 'create-outline',
            label: 'Edit Roadmap',
            onPress: () => {
                handleCloseModal();
                console.log('Edit Roadmap:', selectedRoadmap?.title);
            }
        },
        {
            icon: 'trash-outline',
            label: 'Delete Roadmap',
            onPress: () => {
                handleCloseModal();
                console.log('Delete Roadmap:', selectedRoadmap?.title);
            }
        },
    ];

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const createRoadmapModalRef = useRef<BottomSheetModal>(null);



    const handleMenuPress = useCallback((mentee: Mentee) => {
        setSelectedMentee(mentee);
        setSelectedMentor(null);
        setSelectedRoadmap(null);
        setTimeout(() => {
            bottomSheetModalRef.current?.present();
        }, 0);
    }, []);

    const handleMentorMenuPress = useCallback((mentor: MentorData) => {
        setSelectedMentor(mentor);
        setSelectedMentee(null);
        setSelectedRoadmap(null);
        setTimeout(() => {
            bottomSheetModalRef.current?.present();
        }, 0);
    }, []);

    const handleRoadmapMenuPress = useCallback((roadmap: RoadmapCardData) => {
        setSelectedRoadmap(roadmap);
        setSelectedMentee(null);
        setSelectedMentor(null);
        setTimeout(() => {
            bottomSheetModalRef.current?.present();
        }, 0);
    }, []);



    const handleCloseModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
        setTimeout(() => {
            setSelectedMentee(null);
            setSelectedMentor(null);
            setSelectedRoadmap(null);
        }, 300);
    }, []);

    // Create Roadmap Modal Handlers
    const handleOpenCreateRoadmapModal = useCallback(() => {
        createRoadmapModalRef.current?.present();
    }, []);

    const handleCloseCreateRoadmapModal = useCallback(() => {
        createRoadmapModalRef.current?.dismiss();
    }, []);

    const handleCreateRoadmapNext = useCallback((data: RoadmapFormData) => {
        console.log('Create Roadmap Data:', data);
        // Here you would typically save the roadmap data
        handleCloseCreateRoadmapModal();
        // Show success message or navigate to next step
    }, []);

    const handleCreateRoadmapCancel = useCallback(() => {
        handleCloseCreateRoadmapModal();
    }, []);

    const handleTabChange = (tab: 'roadmap-library' | 'mentors' | 'mentees') => {
        setActiveTab(tab);
    };

    const getOutcomeMenuItems = (): MenuItem[] => [
        {
            id: 'outcome-4-months',
            label: 'Expected Outcome - 4 Months',
            onPress: () => {
                setSelectedOutcome('Expected Outcome - First Four Months');
                setShowOutcomeMenu(false);
                setShowOutcomeModal(true);
            },
        },
        {
            id: 'outcome-6-months',
            label: 'Expected Outcome - 6 Months',
            onPress: () => {
                setSelectedOutcome('Expected Outcome - Six Months');
                setShowOutcomeMenu(false);
                setShowOutcomeModal(true);
            },
        },
        {
            id: 'outcome-9-months',
            label: 'Expected Outcome - 9 Months',
            onPress: () => {
                setSelectedOutcome('Expected Outcome - Nine Months');
                setShowOutcomeMenu(false);
                setShowOutcomeModal(true);
            },
        },
        {
            id: 'outcome-end-year',
            label: 'Expected Outcome - End of Year',
            onPress: () => {
                setSelectedOutcome('Expected Outcome - End of Year');
                setShowOutcomeMenu(false);
                setShowOutcomeModal(true);
            },
        },
    ];

    const getOutcomeData = (title: string) => {
        // This is the data from your screenshot - you can customize for different periods
        const fourMonthsData = [
            {
                id: '1',
                text: 'The church is committed to the revitalization process.',
            },
            {
                id: '2',
                text: 'The Church is praying consistently and intentionally for revitalization.',
            },
            {
                id: '3',
                text: 'The church understands its current health and is committed to making improvements.',
            },
            {
                id: '4',
                text: 'The church is beginning to feel like a warm and welcoming place for new attendees.',
            },
            {
                id: '5',
                text: 'Church members have begun to build new relationships with people who have attended a community engagement event and its follow-up event.',
            },
            {
                id: '6',
                text: 'Church members will begin to feel a sense of hope for the future and begin expecting God to do something exciting in their church.',
            },
        ];

        // For now, return the same data for all periods
        // You can customize this based on the title parameter
        return fourMonthsData;
    };

    const getFilterDisplayText = () => {
        if (STATES.includes(selectedFilter)) {
            return `State: ${selectedFilter}`;
        }
        return selectedFilter || `Course Completion : ${selectedFilter}`;
    };

    const filterOptions = useMemo(() => getFilterOptions(), []);

    const filteredMentors = useMemo(() => {
        let filtered = mockMentors;

        if (search) {
            filtered = filtered.filter((mentor) =>
                mentor.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        return filtered;
    }, [search]);

    const filteredMentees = useMemo(() => {
        let filtered = mockMentees;

        if (search) {
            filtered = filtered.filter((mentee) =>
                mentee.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        return filtered;
    }, [search]);

    const filteredRoadmaps = useMemo(() => {
        let filtered = mockRoadmapLibrary;

        if (search) {
            filtered = filtered.filter((roadmap) =>
                roadmap.title.toLowerCase().includes(search.toLowerCase()) ||
                roadmap.description?.toLowerCase().includes(search.toLowerCase())
            );
        }

        return filtered;
    }, [search]);

    const tabData = [
        { key: 'roadmap-library', label: 'Roadmap Library' },
        { key: 'mentors', label: "Mentor's" },
        { key: 'mentees', label: 'Mentees' }
    ];

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={{ flex: 1, }}
        >
            <View className="flex-1">
                <TopBar userName="David Roe" notifications={3} showUserName={true} showNotifications={true} />

                <View className="flex-1 pt-6">
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-1 py-4 mb-4 border-b border-white/20">
                        {/* Left Section - Back Button + Title with Subtitle */}
                        <View className="flex-row items-center flex-1">
                            <TouchableOpacity onPress={() => router.back()}>
                                <Ionicons name="chevron-back" size={28} color="#fff" />
                            </TouchableOpacity>
                            <View className="ml-1">
                                <Text className="text-xl font-bold leading-6 text-white">R.Roadmap</Text>
                                <Text className="text-sm text-white/70 mt-0.5">Library</Text>
                            </View>
                        </View>

                        {/* Right Section - Pill Buttons + Menu */}
                        <View className="flex-row items-center gap-1">
                            {/* Select Button - Only show for roadmap library tab */}
                            {activeTab === 'roadmap-library' && (
                                <TouchableOpacity
                                    className="flex-row items-center px-4 py-2.5 border-[1.5px] border-white/80 rounded-xl"
                                    onPress={() => router.push('/(director-tabs)/(tabs)/revitalization-roadmaps/select-roadmap')}
                                >
                                    <Ionicons name="checkmark" size={20} color="#fff" />
                                    <Text className="ml-1.5 text-[15px] font-semibold text-white">Select</Text>
                                </TouchableOpacity>
                            )}

                            {/* Roadmap Button */}
                            <TouchableOpacity
                                className="flex-row items-center px-4 py-2.5 border-[1.5px] border-white/80 rounded-xl"
                                onPress={handleOpenCreateRoadmapModal}
                            >
                                <Ionicons name="add" size={20} color="#fff" />
                                <Text className="ml-1.5 text-[15px] font-semibold text-white">Roadmap</Text>
                            </TouchableOpacity>

                            {/* Three Dots Menu */}
                            <TouchableOpacity
                                className="p-1"
                                onPress={() => setShowOutcomeMenu(!showOutcomeMenu)}
                            >
                                <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* Outcome Context Menu */}
                        <ContextMenu
                            visible={showOutcomeMenu}
                            items={getOutcomeMenuItems()}
                            onClose={() => setShowOutcomeMenu(false)}
                            position={{ top: 60, right: 16 }}
                            minWidth={280}
                            showIcons={false}
                            itemTextStyle={{
                                fontSize: 15,
                                fontWeight: '500',
                                color: '#1A4882'
                            }}
                        />
                    </View>


                    {/* Search Bar */}
                    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                        <SearchBar value={search} onChangeValue={setSearch} />
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
                    {/* Tabs */}
                    <TabSwitcher
                        tabs={tabData}
                        activeTab={activeTab}
                        onChange={(key) => handleTabChange(key as 'roadmap-library' | 'mentors' | 'mentees')}
                    />

                    {/* Profile Swiper */}


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

                    {/* Content List */}
                    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                        {activeTab === 'roadmap-library' && (
                            /* Roadmap Library */
                            filteredRoadmaps.map((roadmap, index) => (
                                <RoadmapCard
                                    key={`roadmap-${index}`}
                                    data={roadmap}
                                    showMenu={true}
                                    onMenuPress={() => handleRoadmapMenuPress(roadmap)}
                                    onPress={() => console.log('Roadmap pressed:', roadmap.title)}
                                />
                            ))
                        )}

                        {activeTab === 'mentors' && (
                            /* Mentors List */
                            filteredMentors.map((mentor) => (
                                <TouchableOpacity
                                    key={mentor.id}
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
                                        onMenuPress={() => handleMentorMenuPress(mentor)}
                                    />
                                </TouchableOpacity>
                            ))
                        )}

                        {activeTab === 'mentees' && (
                            /* Mentees List */
                            filteredMentees.map((mentee) => (
                                <MenteeCard
                                    key={mentee.id}
                                    data={mentee}
                                    layout={viewMode}
                                    onPress={() => router.push(`/(director-tabs)/(tabs)/revitalization-roadmaps/${mentee.id}`)}
                                    onCall={() => console.log('Call', mentee.name)}
                                    onChat={() => console.log('Chat', mentee.name)}
                                    onMail={() => console.log('Mail', mentee.name)}
                                    onWhatsApp={() => console.log('WhatsApp', mentee.name)}
                                    onMenuPress={() => handleMenuPress(mentee)}
                                    onMarkComplete={() => console.log('Mark complete', mentee.name)}
                                    onIssueCertificate={() => console.log('Issue certificate', mentee.name)}
                                    onInviteAsFieldMentor={() => console.log('Invite as field mentor', mentee.name)}
                                />
                            ))
                        )}
                    </ScrollView>
                </View>

                <ActionBottomSheet
                    ref={bottomSheetModalRef}
                    title={selectedMentee?.name || selectedMentor?.name || selectedRoadmap?.title || ''}
                    subtitle={
                        selectedMentor
                            ? `${selectedMentor.menteesCount} Mentees`
                            : selectedRoadmap
                                ? selectedRoadmap.completionTime
                                : undefined
                    }
                    image={selectedMentee?.profileImage || selectedMentor?.profileImage}
                    actions={
                        selectedRoadmap
                            ? roadmapMenuItems
                            : selectedMentor
                                ? selectedMentor.role === 'Field Mentor'
                                    ? fieldMentorMenuItems
                                    : mentorMenuItems
                                : menteeMenuItems
                    }
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

                <ExpectedOutcomeModal
                    visible={showOutcomeModal}
                    onClose={() => setShowOutcomeModal(false)}
                    title={selectedOutcome}
                    outcomes={getOutcomeData(selectedOutcome)}
                    onSelect={() => {
                        console.log('Select outcome');
                        setShowOutcomeModal(false);
                    }}
                    onEdit={() => {
                        console.log('Edit outcome');
                        setShowOutcomeModal(false);
                    }}
                    onDownload={() => {
                        console.log('Download outcome');
                    }}
                />

                <CreateRoadmapModal
                    ref={createRoadmapModalRef}
                    onClose={handleCloseCreateRoadmapModal}
                    onNext={handleCreateRoadmapNext}
                    onCancel={handleCreateRoadmapCancel}
                />
            </View>
        </LinearGradient>
    );
}
