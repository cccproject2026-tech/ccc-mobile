import FilterModal, { FilterOption } from '@/components/director/FilterModal';
import MentorCard from '@/components/director/MentorCard';
import SearchBar from '@/components/director/SearchBar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockMentors } from '../mentors';


interface Pastor {
    id: string;
    name: string;
    role: string;
    mentorsAssigned: boolean;
    mentors: number;
    hasLoggedIn: boolean;
    loginDate?: string;
    profileImage?: string;
}

const STATES = ['North American', 'Canada', 'Mexico', 'Brazil'];


const mockPastors: Pastor[] = [
    {
        id: '1',
        name: 'John Doe',
        role: 'Pastor',
        mentorsAssigned: false,
        mentors: 0,
        hasLoggedIn: false,
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
        id: '2',
        name: 'John Doe',
        role: 'Pastor',
        mentorsAssigned: true,
        mentors: 2,
        hasLoggedIn: false,
    },
    {
        id: '3',
        name: 'John Doe',
        role: 'Pastor',
        mentorsAssigned: true,
        mentors: 2,
        hasLoggedIn: true,
        loginDate: '11 / 01 / 2025',
        profileImage: 'https://randomuser.me/api/portraits/men/33.jpg',
    },
    {
        id: '4',
        name: 'John Doe',
        role: 'Pastor',
        mentorsAssigned: false,
        mentors: 0,
        hasLoggedIn: false,
    },
];

export default function AssignNewPastorsScreen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();

    const [search, setSearch] = useState('');
    const [selectedPastors, setSelectedPastors] = useState<string[]>([]);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Latest Join');
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

    const toggleSelectPastor = (id: string) => {
        setSelectedPastors(prev =>
            prev.includes(id)
                ? prev.filter(pastorId => pastorId !== id)
                : [...prev, id]
        );
    };


    const getFilterOptions = (): FilterOption[] => {
        return [
            { label: 'Latest Join' },
            { label: 'Least number of Mentors' },
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
    const filterOptions = useMemo(() => getFilterOptions(), []);




    const getFilterDisplayText = () => {
        if (STATES.includes(selectedFilter)) {
            return `State : ${selectedFilter}`;
        }
        return selectedFilter || 'Latest Join';
    };

    const filteredPastors = useMemo(() => {
        return mockMentors.filter(pastor =>
            pastor.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    const handleAssign = () => {
        if (selectedPastors.length === 0) {
            Alert.alert('No Selection', 'Please select at least one pastor to assign.');
            return;
        }

        const selectedNames = mockMentors
            .filter(p => selectedPastors.includes(p.id))
            .map(p => p.name)
            .join(', ');

        Alert.alert(
            'Assign Pastors',
            `Are you sure you want to assign: ${selectedNames}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Assign',
                    onPress: () => {
                        console.log('Assigned:', selectedPastors);
                        router.back();
                    },
                },
            ]
        );
    };

    const getSelectedNamesText = () => {
        if (selectedPastors.length === 0) return 'No pastors selected';

        const names = mockMentors
            .filter(p => selectedPastors.includes(p.id))
            .map(p => p.name);

        return names.join(', ');
    };

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={[styles.container, { paddingTop: Platform.OS === 'ios' ? top : top + 10 }]}
        >
            {}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Assign Mentors</Text>
                <TouchableOpacity
                    onPress={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                    style={{
                        marginLeft: 'auto',
                    }}
                >
                    <Ionicons name={viewMode === 'card' ? 'list' : 'grid'} size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {}
            <View style={styles.searchContainer}>
                <SearchBar value={search} onChangeValue={setSearch} />
            </View>

            {}
            <View style={styles.sortContainer}>
                <Text style={styles.sortLabel}>Sort by</Text>
                <Pressable style={styles.sortButton} onPress={() => setFilterModalVisible(true)}>
                    <Text style={styles.sortText}>{getFilterDisplayText()}</Text>
                    <Ionicons name="chevron-down" size={18} color="#fff" />
                </Pressable>
            </View>

            {}
            <FlatList
                data={filteredPastors}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <MentorCard
                        mentor={item}
                        layout={viewMode}
                        onToggleSelect={() => toggleSelectPastor(item.id)}
                        isSelected={selectedPastors.includes(item.id)}
                    />
                )}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: 100 + bottom },
                ]}
                showsVerticalScrollIndicator={false}
            />

            {}
            <View style={[styles.bottomContainer, { paddingBottom: bottom + 16 }]}>
                <View style={styles.selectedNamesContainer}>
                    <Text style={styles.selectedNamesText} numberOfLines={1}>
                        {getSelectedNamesText()}
                    </Text>
                </View>
                <View style={[styles.bottomContainer, { paddingBottom: bottom + 16 }]}>
                    <View style={styles.selectedNamesContainer}>
                        <Text style={styles.selectedNamesText} numberOfLines={1}>
                            {getSelectedNamesText()}
                        </Text>
                    </View>

                    <LinearGradient
                        colors={["#7C3AED", "#38BDF8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                            styles.gradientBorder,
                            selectedPastors.length === 0 && styles.gradientBorderDisabled,
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.assignButtonInner}
                            onPress={handleAssign}
                            disabled={selectedPastors.length === 0}
                        >
                            <Text style={styles.assignButtonText}>Assign</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
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

        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
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
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 12,
    },
    sortLabel: {
        fontSize: 15,
        color: '#fff',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 20,
    },
    sortText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    listContent: {
        paddingHorizontal: 16,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1E366F',
        paddingHorizontal: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    selectedNamesContainer: {
        flex: 1,
    },
    selectedNamesText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    gradientBorder: {
        padding: 2,
        borderRadius: 13,
    },
    gradientBorderDisabled: {
        opacity: 0.5,
    },
    assignButtonInner: {
        backgroundColor: '#1E366F',
        borderRadius: 11,
        paddingVertical: 12,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    assignButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
