// app/(mentor)/(tabs)/(index,roadmap,assessments,appointments,progress,mentees)/roadmap/select-roadmap.tsx
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useMemo, useState } from 'react';
import AppGradientBackground from '@/components/layout/AppGradientBackground';
import TopBar from '@/components/director/TopBar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '@/components/director/SearchBar';
import { useAllRoadmaps } from '@/hooks/roadmaps/useRoadmaps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoadmapCard } from '@/components/director/ProgressRoadmapCard';
import { RoadmapCardData } from '@/lib/roadmap/types';
import { getRoadmapCard } from '@/lib/roadmap/mappers';

const SelectRoadmaps = () => {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();

    const [search, setSearch] = useState('');
    const [selectedRoadmaps, setSelectedRoadmaps] = useState<Set<string>>(new Set());

    
    const {
        data: roadmaps = [],
        isLoading,
        isError,
    } = useAllRoadmaps();

    
    const roadmapCardsData = useMemo(() => {
        return (roadmaps || [])
            .filter(roadmap => roadmap != null)
            .map(roadmap => {
                try {
                    return {
                        ...getRoadmapCard(roadmap),
                        _id: roadmap._id
                    };
                } catch (error) {
                    console.error('❌ Error transforming roadmap:', roadmap?._id, error);
                    return null;
                }
            })
            .filter(card => card != null) as (RoadmapCardData & { _id: string })[];
    }, [roadmaps]);

    
    const filteredRoadmaps = useMemo(() => {
        if (!search.trim()) return roadmapCardsData;

        const searchLower = search.toLowerCase().trim();
        return roadmapCardsData.filter((roadmap) =>
            roadmap.title?.toLowerCase().includes(searchLower) ||
            roadmap.description?.toLowerCase().includes(searchLower)
        );
    }, [roadmapCardsData, search]);

    const handleToggleSelection = (roadmapId: string) => {
        setSelectedRoadmaps((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(roadmapId)) {
                newSet.delete(roadmapId);
            } else {
                newSet.add(roadmapId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedRoadmaps.size === filteredRoadmaps.length && filteredRoadmaps.length > 0) {
            setSelectedRoadmaps(new Set());
        } else {
            const allIds = new Set(
                filteredRoadmaps
                    .map((r) => r._id)
                    .filter((id): id is string => id != null)
            );
            setSelectedRoadmaps(allIds);
        }
    };

    const handleConfirm = () => {
        if (selectedRoadmaps.size === 0) {
            Alert.alert('No Selection', 'Please select at least one roadmap to assign.');
            return;
        }

        const selected = Array.from(selectedRoadmaps);

        router.push({
            pathname: '/(mentor)/roadmap/assign-roadmaps' as any,
            params: {
                roadmapIds: JSON.stringify(selected)
            }
        });
    };

    return (
        <AppGradientBackground style={styles.container}>
            <View style={{ paddingBottom: 10 }}>
                <TopBar role="mentor" showUserName={true} />
            </View>

            {}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Select Roadmaps</Text>
                    <Text style={styles.headerSubtitle}>
                        {selectedRoadmaps.size} selected
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleConfirm}
                    style={styles.confirmButton}
                    disabled={selectedRoadmaps.size === 0}
                >
                    <Ionicons
                        name="arrow-redo-outline"
                        size={28}
                        color={selectedRoadmaps.size === 0 ? 'rgba(255,255,255,0.3)' : '#fff'}
                    />
                </TouchableOpacity>
            </View>

            {}
            <View style={styles.searchContainer}>
                <SearchBar value={search} onChangeValue={setSearch} placeholder="Search roadmaps" />
            </View>

            {}
            <View style={styles.selectAllContainer}>
                <TouchableOpacity onPress={handleSelectAll}>
                    <Text style={styles.selectAllText}>
                        {selectedRoadmaps.size === filteredRoadmaps.length && filteredRoadmaps.length > 0
                            ? 'Deselect All'
                            : 'Select All'}
                    </Text>
                </TouchableOpacity>
            </View>

            {}
            <View style={styles.content}>
                {isLoading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.centerText}>Loading roadmaps...</Text>
                    </View>
                ) : isError ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
                        <Text style={[styles.centerText, { color: '#ff6b6b' }]}>Failed to load roadmaps</Text>
                    </View>
                ) : filteredRoadmaps.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="map-outline" size={64} color="#fff" style={{ opacity: 0.5 }} />
                        <Text style={styles.centerText}>
                            {search.trim() ? 'No roadmaps found' : 'No roadmaps available'}
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 20 }]}
                        showsVerticalScrollIndicator={false}
                    >
                        {filteredRoadmaps.map((roadmap) => (
                            <RoadmapCard
                                key={roadmap._id}
                                data={roadmap}
                                selectionMode={true}
                                isSelected={selectedRoadmaps.has(roadmap._id)}
                                onToggleSelection={() => handleToggleSelection(roadmap._id)}
                            />
                        ))}
                    </ScrollView>
                )}
            </View>
        </AppGradientBackground>
    );
};

export default SelectRoadmaps;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
        marginBottom: 8,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 13,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 2,
    },
    confirmButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    selectAllContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: 'flex-end',
    },
    selectAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    centerText: {
        color: '#fff',
        marginTop: 12,
        fontSize: 15,
        textAlign: 'center',
    },
});
