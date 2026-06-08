














































import AcceptedUserCard from '@/components/director/AcceptUserCard';
import FilterModal, { FilterOption } from '@/components/director/FilterModal';
import InterestCard from '@/components/director/InterestCard';
import SearchBar from '@/components/director/SearchBar';
import { TabSwitcher } from '@/components/director/TabSwitcher';
import TopBar from '@/components/director/TopBar';
import { useInterests } from '@/hooks/interests/useInterests';
import { InterestItem } from '@/types/interest.types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;

type InterestTab = 'new' | 'pending' | 'accepted';

export type Interest = {
    id: string;
    name: string;
    role: string;
    time: string;
    state: string;
    mentors?: number;
    mentorsAssigned?: boolean;
    hasLoggedIn?: boolean;
    loginDate?: string;
    profileImage?: string;
};


const COUNTRIES = ['All', 'USA', 'Canada', 'Mexico', 'Brazil'];

export default function InterestReceivedScreen() {
    const [activeTab, setActiveTab] = useState<InterestTab>('new');
    const [search, setSearch] = useState('');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All');
    const router = useRouter();

    const { data: interestsData, isLoading, error } = useInterests();
    console.log('📥 Fetched Interests Data:', interestsData);

    const mapInterestItem = (item: InterestItem): Interest => {
        const churchDetail = item.churchDetails?.[0];

        
        const formatDate = (dateString?: string) => {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        };

        return {
            id: item._id,
            name: `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'N/A',
            role: item.title || 'N/A',
            time: formatDate(item.createdAt),
            state: churchDetail?.country || 'Unknown',
        };
    };

    
    const groupedInterests = useMemo(() => {
        if (!interestsData) {
            return { new: [], pending: [], accepted: [] };
        }

        const mapped = interestsData.map(mapInterestItem);

        
        // You can add status filtering here when backend supports it
        return {
            new: mapped,
            pending: [],
            accepted: [],
        };
    }, [interestsData]);

    
    const getFilterOptions = (): FilterOption[] => {
        if (activeTab === 'new') {
            return [
                {
                    label: 'Country',
                    options: COUNTRIES,
                    isExpandable: true
                }
            ];
        } else if (activeTab === 'pending') {
            return [
                { label: 'Least number of Mentees' },
                { label: 'Most number of Mentees' }
            ];
        } else if (activeTab === 'accepted') {
            return [
                { label: 'Latest Join' },
                { label: 'Least number of Mentors' },
                {
                    label: 'Country',
                    options: COUNTRIES,
                    isExpandable: true
                },
                { label: 'Conference' }
            ];
        }
        return [];
    };

    const getFilterDisplayText = () => {
        if (activeTab === 'new') {
            return selectedFilter === 'All' ? 'All Countries' : `Country: ${selectedFilter}`;
        } else if (activeTab === 'pending') {
            return selectedFilter || 'Least number of Mentees';
        } else if (activeTab === 'accepted') {
            if (COUNTRIES.includes(selectedFilter) && selectedFilter !== 'All') {
                return `Country: ${selectedFilter}`;
            } else if (selectedFilter === 'All') {
                return 'All Countries';
            }
            return selectedFilter || 'Sort By';
        }
        return 'Filters';
    };

    const filteredInterests = useMemo(() => {
        let interests = groupedInterests[activeTab];

        
        if (search) {
            interests = interests.filter(interest =>
                interest.name.toLowerCase().includes(search.toLowerCase()) ||
                interest.role.toLowerCase().includes(search.toLowerCase()) ||
                interest.state.toLowerCase().includes(search.toLowerCase())
            );
        }

        
        if (selectedFilter && selectedFilter !== 'All') {
            interests = interests.filter(interest => interest.state === selectedFilter);
        }

        return interests;
    }, [groupedInterests, activeTab, search, selectedFilter]);

    const handleTabChange = (tab: InterestTab) => {
        setActiveTab(tab);

        
        if (tab === 'new') {
            setSelectedFilter('All');
        } else if (tab === 'pending') {
            setSelectedFilter('Least number of Mentees');
        } else if (tab === 'accepted') {
            setSelectedFilter('Latest Join');
        }
    };

    const filterOptions = useMemo(() => getFilterOptions(), [activeTab]);

    
    const tabs = [
        {
            key: 'new' as InterestTab,
            label: 'New',
            badge: groupedInterests.new.length
        },
        {
            key: 'pending' as InterestTab,
            label: 'Pending',
            badge: groupedInterests.pending.length
        },
        {
            key: 'accepted' as InterestTab,
            label: 'Accepted'
        },
    ];

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={{ flex: 1 }}
        >
            <View className="flex-1">
                <TopBar notifications={3} showUserName={true} showNotifications={true} />

                <View className="flex-1 pt-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex-row items-center px-4 pb-3 mb-4 border-b border-white/30"
                    >
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                        <Text className="ml-2 text-xl font-semibold text-white">Interest Received</Text>
                    </TouchableOpacity>

                    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    <TabSwitcher
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={(key) => handleTabChange(key as InterestTab)}
                    />

                    <View className="flex-row items-center justify-end gap-2 px-4 mb-4">
                        <Text className="text-base text-white">Filters</Text>
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

                    {isLoading ? (
                        <View className="items-center justify-center flex-1">
                            <ActivityIndicator size="large" color="#fff" />
                            <Text className="mt-4 text-white">Loading interests...</Text>
                        </View>
                    ) : error ? (
                        <View className="items-center justify-center flex-1 px-4">
                            <Text className="text-center text-red-300">
                                Error loading interests: {error.message}
                            </Text>
                        </View>
                    ) : (
                        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                            <View className="gap-3 pb-6">
                                {filteredInterests.length > 0 ? (
                                    filteredInterests.map(interest => (
                                        activeTab === 'accepted' ? (
                                            <AcceptedUserCard key={interest.id} data={interest} />
                                        ) : (
                                            <InterestCard
                                                key={interest.id}
                                                data={interest}
                                                onCall={() => console.log('Call', interest.id)}
                                                onChat={() => console.log('Chat', interest.id)}
                                                onMail={() => console.log('Mail', interest.id)}
                                                onWhatsApp={() => console.log('WhatsApp', interest.id)}
                                            />
                                        )
                                    ))
                                ) : (
                                    <Text className="text-center text-white/70">
                                        No interests found{search ? ` for "${search}"` : ''}.
                                    </Text>
                                )}
                            </View>
                        </ScrollView>
                    )}
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
            </View>
        </LinearGradient>
    );
}
