import ActionBottomSheet from '@/components/director/ActionSheetModal';
import RoadmapCard, { RoadmapCardData } from '@/components/director/ProgressRoadmapCard';
import SearchBar from '@/components/director/SearchBar';
import { TabSwitcher } from '@/components/director/TabSwitcher';
import TopBar from '@/components/director/TopBar';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface RoadmapItem extends RoadmapCardData {
    id: string;
    filterStatus: 'Completed' | 'Due' | 'In-progress' | 'Not Started';
}

const mockRoadmapData: RoadmapItem[] = [
    {
        id: '1',
        title: 'Jump-start',
        description: 'Join a two-day group revitalization session hosted by CCC',
        image: require('@/assets/images/jumpstart.png'),
        status: 'completed',
        filterStatus: 'Completed',
        completionTime: 'Completion Time Months 1 - 2',
        completedDate: '20 Oct 2024',
    },
    {
        id: '2',
        title: 'Self Revitalization Phase',
        description: 'Interested in receiving mentoring in community engagement',
        image: require('@/assets/images/roadmap.jpg'),
        status: 'due',
        filterStatus: 'Due',
        completionTime: 'Completion Time Months 1 - 2',
        taskProgress: {
            completed: 6,
            total: 8,
        },
    },
    {
        id: '3',
        title: 'Church Empowerment Phase',
        description: 'Interested in receiving mentoring in community engagement',
        image: require('@/assets/images/roadmap.jpg'),
        status: 'in-progress',
        filterStatus: 'In-progress',
        completionTime: 'Completion Time Months 3 - 9',
        taskProgress: {
            completed: 12,
            total: 18,
        },
    },
    {
        id: '4',
        title: 'Community Revitalization and Multiplication Phase',
        description: 'Interested in receiving mentoring in community engagement',
        image: require('@/assets/images/roadmap.jpg'),
        status: 'initial',
        filterStatus: 'Not Started',
        completionTime: 'Completion Time Months 3 - 9',
    },
];

type TabType = 'All' | 'Due' | 'Not Started' | 'Completed';

export default function MenteeRoadmapDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { bottom } = useSafeAreaInsets();
    const { height } = Dimensions.get('window');

    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('All');
    const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapItem | null>(null);

    // Mock mentee name - in real app would fetch from API based on id
    const menteeName = 'John Doe';

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const filteredRoadmaps = useMemo(() => {
        let filtered = mockRoadmapData;

        // Filter by search
        if (search) {
            filtered = filtered.filter((item) =>
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
            );
        }

        // Filter by tab
        if (activeTab !== 'All') {
            filtered = filtered.filter((item) => item.filterStatus === activeTab);
        }

        return filtered;
    }, [search, activeTab]);

    const getStatusCount = (status: TabType) => {
        if (status === 'All') return mockRoadmapData.length;
        return mockRoadmapData.filter(item => item.filterStatus === status).length;
    };

    const tabs = useMemo(() => {
        return [
            { key: 'All', label: 'All', count: getStatusCount('All') },
            { key: 'Due', label: 'Due', count: getStatusCount('Due') },
            { key: 'Not Started', label: 'Not Started', count: getStatusCount('Not Started') },
            { key: 'Completed', label: 'Completed', count: getStatusCount('Completed') },
        ];
    }, []);

    const menuItems = [
        {
            icon: 'person-add-outline',
            label: 'Assign to',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/(director)/(tabs)/revitalization-roadmaps/assign-mentee');
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

    const handleMenuPress = useCallback((roadmap: RoadmapItem) => {
        setSelectedRoadmap(roadmap);
        setTimeout(() => {
            bottomSheetModalRef.current?.present();
        }, 0);
    }, []);

    const handleCloseModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
        setTimeout(() => {
            setSelectedRoadmap(null);
        }, 300);
    }, []);



    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={[styles.container, { paddingBottom: bottom + height * 0.05 }]}
        >
            <View style={styles.content}>
                <TopBar userName="John Doe" notifications={4} showUserName={true} showNotifications={true} />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Revitalization Roadmap</Text>
                        <Text style={styles.headerSubtitle}>Mentee &gt; {menteeName}</Text>
                    </View>

                    <TouchableOpacity style={styles.menuButton}>
                        <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <SearchBar value={search} onChangeValue={setSearch} />
                </View>

                {/* Tab Buttons */}
                <TabSwitcher
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={(key) => setActiveTab(key as TabType)}
                />

                {/* Roadmap List */}
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {filteredRoadmaps.map((item) => (
                        <RoadmapCard
                            key={item.id}
                            data={item}
                            onPress={() => console.log('Navigate to roadmap detail:', item.title)}
                            showMenu={true}
                            onMenuPress={() => handleMenuPress(item)}
                        />
                    ))}
                </ScrollView>
            </View>

            <ActionBottomSheet
                ref={bottomSheetModalRef}
                title={selectedRoadmap?.title || ''}
                subtitle={selectedRoadmap?.filterStatus}
                actions={menuItems}
                onClose={handleCloseModal}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    },
    backButton: {
        marginRight: 12,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    menuButton: {
        padding: 4,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },

    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
});