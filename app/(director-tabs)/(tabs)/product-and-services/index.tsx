import ActionBottomSheet from '@/components/director/ActionSheetModal';
import FilterModal, { FilterOption } from '@/components/director/FilterModal';
import MenteeCard, { Mentee } from '@/components/director/MenteeCard';
import SearchBar from '@/components/director/SearchBar';
import { TabSwitcher } from '@/components/director/TabSwitcher';
import TopBar from '@/components/director/TopBar';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const mockMentees: Mentee[] = [
    // Full Scholarship
    {
        id: '1',
        name: 'John Doe',
        role: 'Pastor',
        description: 'Sub text area write something here. That you can read more about him',
        scholarshipAmount: 500,
        dateOfApproval: '10/06/25',
        status: 'approved',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
        id: '2',
        name: 'Jane Smith',
        role: 'Seminarian',
        description: 'Sub text area write something here. That you can read more about him',
        scholarshipAmount: 500,
        dateOfApproval: '10/06/25',
        status: 'approved',
        profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
        id: '3',
        name: 'John Ross',
        role: 'Pastor',
        description: 'Sub text area write something here. That you can read more about him',
        scholarshipAmount: 500,
        dateOfApproval: '10/06/25',
        status: 'approved',
        profileImage: 'https://randomuser.me/api/portraits/men/33.jpg',
    },

    // Partial Scholarship
    {
        id: '4',
        name: 'Sarah Johnson',
        role: 'Pastor',
        description: 'Sub text area write something here. That you can read more about him',
        scholarshipAmount: 350,
        dateOfApproval: '20/10/24',
        status: 'approved',
        profileImage: 'https://randomuser.me/api/portraits/women/45.jpg',
    },
    {
        id: '5',
        name: 'Michael Brown',
        role: 'Pastor',
        description: 'Sub text area write something here. That you can read more about him',
        scholarshipAmount: 300,
        dateOfApproval: '15/10/24',
        status: 'approved',
        profileImage: 'https://randomuser.me/api/portraits/men/34.jpg',
    },

    // Half Scholarship
    {
        id: '6',
        name: 'David Wilson',
        role: 'Pastor',
        description: 'Sub text area write something here. That you can read more about him',
        scholarshipAmount: 250,
        dateOfApproval: '10/10/24',
        status: 'approved',
        profileImage: 'https://randomuser.me/api/portraits/men/35.jpg',
    },
    {
        id: '7',
        name: 'Emily Davis',
        role: 'Pastor',
        description: 'Sub text area write something here. That you can read more about him',
        scholarshipAmount: 250,
        dateOfApproval: '12/10/24',
        status: 'approved',
        profileImage: 'https://randomuser.me/api/portraits/women/46.jpg',
    },

    // ADRA Discount
    {
        id: '8',
        name: 'Robert Taylor',
        role: 'Pastor',
        description: 'Sub text area write something here. That you can read more about him',
        scholarshipAmount: 150,
        dateOfApproval: '05/10/24',
        status: 'approved',
        profileImage: 'https://randomuser.me/api/portraits/men/36.jpg',
    },
    {
        id: '9',
        name: 'Lisa Anderson',
        role: 'Pastor',
        description: 'Sub text area write something here. That you can read more about him',
        scholarshipAmount: 150,
        dateOfApproval: '08/10/24',
        status: 'approved',
        profileImage: 'https://randomuser.me/api/portraits/women/47.jpg',
    },
];

const STATES = ['North American', 'Canada', 'Mexico', 'Brazil'];

export default function ProductAndServices() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<string>('full-scholarship');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Course Completion : Oldest');
    const { bottom } = useSafeAreaInsets();
    const { height } = Dimensions.get('window');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);

    const tabs = [
        { key: 'full-scholarship', label: 'Full Scholarship' },
        { key: 'partial-scholarship', label: 'Partial Scholarship' },
        { key: 'adra-discount', label: 'ADRA Discount' },
        { key: 'half-scholarship', label: 'Half Scholarship' },
    ];

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
        // The following two items were incorrectly wired to the assign/remove mentor routes.
        // Keep them as placeholders to avoid accidental navigation until proper routes are available.
        { icon: 'person-add-outline', label: 'Assessments', onPress: () => console.log('Assessments') },
        { icon: 'person-remove-outline', label: 'Assignments', onPress: () => console.log('Assignments') },
        { icon: 'clipboard-outline', label: 'Roadmaps of Mentees', onPress: () => console.log('Roadmaps of Mentees') },
        {
            icon: 'checkmark-done-outline', label: 'Mentor Notes', onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push(`/(director-tabs)/(tabs)/mentees/notes`);
                    // router.push(`/(director-tabs)/(tabs)/mentees/${selectedMentee?.id}/mentor-notes`);
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
        // Clear selected mentee after modal closes
        setTimeout(() => {
            setSelectedMentee(null);
        }, 300);
    }, []);


    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
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

        // Filter based on scholarship type based on amount
        if (activeTab === 'full-scholarship') {
            filtered = filtered.filter((mentee) => mentee.scholarshipAmount === 500);
        } else if (activeTab === 'partial-scholarship') {
            filtered = filtered.filter((mentee) => typeof mentee.scholarshipAmount === 'number' && mentee.scholarshipAmount > 250 && mentee.scholarshipAmount < 500);
        } else if (activeTab === 'half-scholarship') {
            filtered = filtered.filter((mentee) => mentee.scholarshipAmount === 250);
        } else if (activeTab === 'adra-discount') {
            filtered = filtered.filter((mentee) => mentee.scholarshipAmount === 150);
        }

        return filtered;
    }, [search, activeTab]);

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
                        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
                            <Ionicons name="chevron-back" size={28} color="#fff" />
                            <Text className="ml-2 text-xl font-semibold text-white">Product and Services</Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                                style={{ padding: 4 }}
                            >
                                <Ionicons name={viewMode === 'card' ? 'list' : 'grid'} size={24} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={{ padding: 4 }} onPress={() => router.push('/(director-tabs)/(tabs)/product-and-services/settings')}>
                                <Ionicons name="settings-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {/* Tabs */}
                    <TabSwitcher
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={handleTabChange}
                    />


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
                                onPress={() => router.push(`/(director-tabs)/(tabs)/mentees/${mentee.id}`)}
                                onCall={() => console.log('Call', mentee.name)}
                                onChat={() => console.log('Chat', mentee.name)}
                                onMail={() => console.log('Mail', mentee.name)}
                                onWhatsApp={() => console.log('WhatsApp', mentee.name)}
                                onMenuPress={() => handleMenuPress(mentee)}
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
