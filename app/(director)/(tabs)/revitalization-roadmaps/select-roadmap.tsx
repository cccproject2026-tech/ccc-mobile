import SearchBar from '@/components/director/SearchBar';
import TopBar from '@/components/director/TopBar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RoadmapItem {
    id: string;
    title: string;
    description: string;
    completionTime: string;
    image: any;
}

const mockRoadmapItems: RoadmapItem[] = [
    {
        id: '1',
        title: 'Jump-start',
        description: 'Interested in receiving mentor in community engagement',
        completionTime: 'Completion Time Months 1 - 2',
        image: require('@/assets/images/jumpstart.png'),
    },
    {
        id: '2',
        title: 'Self Revitalization Phase',
        description: 'Interested in receiving mentor in community engagement',
        completionTime: 'Completion Time Months 1 - 2',
        image: require('@/assets/images/roadmap.jpg'),
    },
    {
        id: '3',
        title: 'Church Empowerment Phase',
        description: 'Interested in receiving mentor in community engagement',
        completionTime: 'Completion Time Months 3 - 9',
        image: require('@/assets/images/jumpstart.png'),
    },
    {
        id: '4',
        title: 'Community Revitalization and Multiplication Phase',
        description: 'Interested in receiving mentor in community engagement',
        completionTime: 'Completion Time Months 10 - 12',
        image: require('@/assets/images/roadmap.jpg'),
    },
];

export default function SelectRoadmapScreen() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    const filteredRoadmaps = useMemo(() => {
        if (!search) return mockRoadmapItems;

        return mockRoadmapItems.filter((item) =>
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    const handleItemSelect = (itemId: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        setSelectedItems(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedItems.size === filteredRoadmaps.length) {
            // Deselect all
            setSelectedItems(new Set());
        } else {
            // Select all visible items
            const allIds = new Set(filteredRoadmaps.map(item => item.id));
            setSelectedItems(allIds);
        }
    };

    const isAllSelected = selectedItems.size === filteredRoadmaps.length && filteredRoadmaps.length > 0;

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={[styles.container, {}]}
        >
            <View style={styles.content}>
                <TopBar notifications={3} showUserName={true} showNotifications={true} />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity

                        onPress={() => {
                            if (selectedItems.size > 0) {
                                router.push('/(director)/(tabs)/revitalization-roadmaps/assign-mentee');
                            }
                        }}
                        disabled={selectedItems.size === 0}
                    >
                        <Ionicons name="arrow-redo-outline" size={24} color={selectedItems.size === 0 ? 'rgba(255, 255, 255, 0.5)' : '#fff'} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <SearchBar value={search} onChangeValue={setSearch} />
                </View>

                {/* Select All Button */}
                <View style={styles.selectAllContainer}>
                    <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllButton}>
                        <Text style={styles.selectAllText}>
                            {isAllSelected ? 'Deselect All' : 'Select All'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {filteredRoadmaps.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.roadmapItem}
                            onPress={() => handleItemSelect(item.id)}
                            activeOpacity={0.8}
                        >
                            {/* Checkbox */}
                            <View style={styles.checkboxContainer}>
                                <View style={[
                                    styles.checkbox,
                                    selectedItems.has(item.id) && styles.checkboxSelected
                                ]}>
                                    {selectedItems.has(item.id) && (
                                        <Ionicons name="checkmark" size={18} color="#1A4882" />
                                    )}
                                </View>
                            </View>

                            {/* Content */}
                            <View style={styles.itemContent}>
                                {/* Image */}
                                <View style={styles.imageContainer}>
                                    <Image source={item.image} style={styles.roadmapImage} />
                                </View>

                                {/* Text Content */}
                                <View style={styles.textContent}>
                                    <Text style={styles.roadmapTitle} numberOfLines={2}>
                                        {item.title}
                                    </Text>
                                    <Text style={styles.roadmapDescription} numberOfLines={2}>
                                        {item.description}
                                    </Text>
                                    <Text style={styles.completionTime} numberOfLines={1}>
                                        {item.completionTime}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Selected Count */}
                {selectedItems.size > 0 && (
                    <View style={styles.selectedCountContainer}>
                        <Text style={styles.selectedCountText}>
                            {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                        </Text>
                    </View>
                )}
            </View>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    },
    closeButton: {
        padding: 4,
    },

    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    selectAllContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        alignItems: 'flex-end',
    },
    selectAllButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    selectAllText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    roadmapItem: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
    },
    checkboxContainer: {
        marginRight: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    checkboxSelected: {
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    itemContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageContainer: {
        marginRight: 16,
    },
    roadmapImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#2A5080',
    },
    textContent: {
        flex: 1,
    },
    roadmapTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
        lineHeight: 22,
    },
    roadmapDescription: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 8,
        lineHeight: 18,
    },
    completionTime: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    selectedCountContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.3)',
        alignItems: 'center',
    },
    selectedCountText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});