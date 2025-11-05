import ActionBottomSheet from '@/components/director/ActionSheetModal';
import InterestCard, { Interest } from '@/components/director/InterestCard';
import SearchBar from '@/components/director/SearchBar';
import TopBar from '@/components/director/TopBar';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

    const styles = StyleSheet.create({
        tabsContainer: {
            flexDirection: 'row',
            gap: 8,
            paddingHorizontal: 16,
            marginBottom: 16,
            paddingVertical: 8,
        },
        tabButton: {
            flex: 1,
            paddingVertical: 12,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'white/50',
            alignItems: 'center',
            justifyContent: 'center',
        },
        tabButtonActive: {
            backgroundColor: 'white',
        },
        tabButtonInactive: {
            backgroundColor: '#14517D',
        },
        tabButtonText: {
            fontSize: 16,
            fontWeight: 'semibold',
            color: 'white',
            textAlign: 'center',
        },
        tabButtonTextActive: {
            color: '#1a5b77',
        },
        tabButtonTextInactive: {
            color: 'white',
        },
    });
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
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.3)' }}>
                        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="chevron-back" size={28} color="#fff" />
                            <Text style={{ fontSize: 16, fontWeight: 'semibold', color: 'white', marginLeft: 8 }} className="ml-2 text-lg font-semibold text-white">
                                Micro Grant - Application Received
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabsContainer}>
                        <Pressable
                            onPress={() => handleTabChange('new')}
                            style={[
                                styles.tabButton,
                                activeTab === 'new' ? styles.tabButtonActive : styles.tabButtonInactive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabButtonText,
                                    activeTab === 'new' ? styles.tabButtonTextActive : styles.tabButtonTextInactive,
                                ]}
                            >
                                New
                            </Text>
                            {newCount > 0 && (
                                <View style={{ position: 'absolute', top: -8, right: -8, backgroundColor: '#1C4ED8', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'white' }} >
                                        {newCount}
                                    </Text>
                                </View>
                            )}
                        </Pressable>

                        <Pressable
                            onPress={() => handleTabChange('pending')}
                            style={[
                                styles.tabButton,
                                activeTab === 'pending' ? styles.tabButtonActive : styles.tabButtonInactive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabButtonText,
                                    activeTab === 'pending' ? styles.tabButtonTextActive : styles.tabButtonTextInactive,
                                ]}
                            >
                                Pending
                            </Text>
                            {pendingCount > 0 && (
                                <View style={{ position: 'absolute', top: -8, right: -8, backgroundColor: '#1C4ED8', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'white' }} >
                                        {pendingCount}
                                    </Text>
                                </View>
                            )}
                        </Pressable>

                        <Pressable
                            onPress={() => handleTabChange('approved')}
                            style={[
                                styles.tabButton,
                                activeTab === 'approved' ? styles.tabButtonActive : styles.tabButtonInactive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabButtonText,
                                    activeTab === 'approved' ? styles.tabButtonTextActive : styles.tabButtonTextInactive,
                                ]}
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
                                onPress={() => router.push(`/(director)/(tabs)/micro-grant/micro-grand-application`)}
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
