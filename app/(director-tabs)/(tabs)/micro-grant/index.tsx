import ActionBottomSheet from '@/components/director/ActionSheetModal';
import InterestCard, { Interest } from '@/components/director/InterestCard';
import SearchBar from '@/components/director/SearchBar';
import TopBar from '@/components/director/TopBar';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const mockInterests: (Interest & { status: 'new' | 'pending' | 'approved' })[] = [
    {
        id: '1',
        name: 'John Doe',
        role: 'Pastor',
        time: '5 Days Ago',
        status: 'new',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
        id: '2',
        name: 'Jane Smith',
        role: 'Pastor',
        time: '3 Days Ago',
        status: 'pending',
        profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
        id: '3',
        name: 'John Ross',
        role: 'Pastor',
        time: '5 Days Ago',
        status: 'new',
        profileImage: 'https://randomuser.me/api/portraits/men/33.jpg',
    },
    {
        id: '4',
        name: 'Sarah Johnson',
        role: 'Pastor',
        time: '1 Week Ago',
        status: 'approved',
        profileImage: 'https://randomuser.me/api/portraits/women/45.jpg',
    },
    {
        id: '5',
        name: 'Michael Brown',
        role: 'Pastor',
        time: '2 Days Ago',
        status: 'pending',
        profileImage: 'https://randomuser.me/api/portraits/men/34.jpg',
    },
    {
        id: '6',
        name: 'David Wilson',
        role: 'Pastor',
        time: '4 Days Ago',
        status: 'approved',
        profileImage: 'https://randomuser.me/api/portraits/men/35.jpg',
    },
    {
        id: '7',
        name: 'Emily Davis',
        role: 'Pastor',
        time: '6 Days Ago',
        status: 'new',
        profileImage: 'https://randomuser.me/api/portraits/women/46.jpg',
    },
    {
        id: '8',
        name: 'Robert Taylor',
        role: 'Pastor',
        time: '1 Week Ago',
        status: 'pending',
        profileImage: 'https://randomuser.me/api/portraits/men/36.jpg',
    },
    {
        id: '9',
        name: 'Lisa Anderson',
        role: 'Pastor',
        time: '3 Days Ago',
        status: 'approved',
        profileImage: 'https://randomuser.me/api/portraits/women/47.jpg',
    },
];

export default function MicroGrant() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'new' | 'pending' | 'approved'>('new');
    const { bottom } = useSafeAreaInsets();
    const { height } = Dimensions.get('window');
    const [selectedInterest, setSelectedInterest] = useState<Interest | null>(null);

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

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const handleMenuPress = useCallback((interest: Interest) => {
        setSelectedInterest(interest);
        setTimeout(() => {
            bottomSheetModalRef.current?.present();
        }, 0);
    }, []);

    const handleCloseModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
        setTimeout(() => {
            setSelectedInterest(null);
        }, 300);
    }, []);

    const handleTabChange = (tab: 'new' | 'pending' | 'approved') => {
        setActiveTab(tab);
    };

    const filteredInterests = useMemo(() => {
        let filtered = mockInterests;

        if (search) {
            filtered = filtered.filter((interest) =>
                interest.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Filter by status
        filtered = filtered.filter((interest) => interest.status === activeTab);

        return filtered;
    }, [search, activeTab]);

    const newCount = mockInterests.filter((m) => m.status === 'new').length;
    const pendingCount = mockInterests.filter((m) => m.status === 'pending').length;

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={{ flex: 1, paddingBottom: bottom + height * 0.05 }}
        >
            <View className="flex-1">
                <TopBar userName="David Roe" notifications={3} showUserName={true} showNotifications={true} />

                <View className="flex-1 pt-6">
                    {/* Header */}
                    <View className="px-4 pb-3 mb-4 border-b border-white/30">
                        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
                            <Ionicons name="chevron-back" size={28} color="#fff" />
                            <Text className="ml-2 text-lg font-semibold text-white">
                                Micro Grant - Application Received
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View className="px-4 mb-4">
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {/* Tabs */}
                    <View className="flex-row gap-3 px-4 mb-4">
                        <Pressable
                            onPress={() => handleTabChange('new')}
                            className={`flex-1 py-3 rounded-2xl border border-white/50 relative ${activeTab === 'new' ? 'bg-white' : 'bg-[#14517D]'
                                }`}
                        >
                            <Text
                                className={`text-center text-base font-semibold ${activeTab === 'new' ? 'text-[#1a5b77]' : 'text-white'
                                    }`}
                            >
                                New
                            </Text>
                            {newCount > 0 && (
                                <View className="absolute -top-2 -right-2 bg-[#1C4ED8] rounded-full w-6 h-6 items-center justify-center">
                                    <Text className="text-xs font-bold text-white">
                                        {newCount}
                                    </Text>
                                </View>
                            )}
                        </Pressable>

                        <Pressable
                            onPress={() => handleTabChange('pending')}
                            className={`flex-1 py-3 rounded-2xl border border-white/50 relative ${activeTab === 'pending' ? 'bg-white' : 'bg-[#14517D]'
                                }`}
                        >
                            <Text
                                className={`text-center text-base font-semibold ${activeTab === 'pending' ? 'text-[#1a5b77]' : 'text-white'
                                    }`}
                            >
                                Pending
                            </Text>
                            {pendingCount > 0 && (
                                <View className="absolute -top-2 -right-2 bg-[#1C4ED8] rounded-full w-6 h-6 items-center justify-center">
                                    <Text className="text-xs font-bold text-white">
                                        {pendingCount}
                                    </Text>
                                </View>
                            )}
                        </Pressable>

                        <Pressable
                            onPress={() => handleTabChange('approved')}
                            className={`flex-1 py-3 rounded-2xl border border-white/50 relative ${activeTab === 'approved' ? 'bg-white' : 'bg-[#14517D]'
                                }`}
                        >
                            <Text
                                className={`text-center text-base font-semibold ${activeTab === 'approved' ? 'text-[#1a5b77]' : 'text-white'
                                    }`}
                            >
                                Approved
                            </Text>
                        </Pressable>
                    </View>

                    {/* Interests List */}
                    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                        {filteredInterests.map((interest) => (
                            <InterestCard
                                key={interest.id}
                                data={interest}
                                onPress={() => router.push(`/(director-tabs)/(tabs)/micro-grant/micro-grand-application`)}
                                onCall={() => console.log('Call', interest.name)}
                                onChat={() => console.log('Chat', interest.name)}
                                onMail={() => console.log('Mail', interest.name)}
                                onWhatsApp={() => console.log('WhatsApp', interest.name)}
                            />
                        ))}
                    </ScrollView>
                </View>

                <ActionBottomSheet
                    ref={bottomSheetModalRef}
                    title={selectedInterest?.name || ''}
                    image={undefined}
                    actions={menuItems}
                    onClose={handleCloseModal}
                />
            </View>
        </LinearGradient>
    );
}
