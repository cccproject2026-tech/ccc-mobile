// app/(mentor)/(tabs)/(index,roadmap,assessments,appointments,progress,mentees)/roadmap/assign-roadmaps.tsx
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useMemo, useState } from 'react';
import AppGradientBackground from '@/components/layout/AppGradientBackground';
import TopBar from '@/components/director/TopBar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '@/components/director/SearchBar';
import { useAuthStore } from '@/stores/auth.store';
import { useMentees } from '@/hooks/mentees/useMentees';
import { useAssignRoadmaps } from '@/hooks/roadmaps/useAssignRoadmaps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MenteeCard from '@/components/director/MenteeCard';

const AssignRoadmaps = () => {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const { user } = useAuthStore();

    
    const selectedRoadmapIds = useMemo(() => {
        console.log("params:----->>>>>>>>>>>>>>", params);
        const ids = params.roadmapIds;
        if (typeof ids === 'string') {
            try {
                return JSON.parse(ids);
            } catch (e) {
                console.error("Error parsing roadmapIds:", e);
                return [];
            }
        }
        return [];
    }, [params.roadmapIds]);

    const [search, setSearch] = useState('');
    const [selectedMentees, setSelectedMentees] = useState<Set<string>>(new Set());

    
    const { 
        data, 
        isLoading, 
        isError, 
        hasNextPage, 
        fetchNextPage, 
        isFetchingNextPage 
    } = useMentees(10, user?.id, { includeProgress: false });
    
    const mentees = useMemo(() => data?.pages.flatMap((page) => page.mentees) ?? [], [data]);

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    
    const assignMutation = useAssignRoadmaps();

    
    const filteredMentees = useMemo(() => {
        if (!search.trim()) return mentees;

        const searchLower = search.toLowerCase().trim();
        return mentees.filter((mentee) =>
            `${mentee.firstName} ${mentee.lastName || ''}`.toLowerCase().includes(searchLower) ||
            mentee.username?.toLowerCase().includes(searchLower) ||
            mentee.email?.toLowerCase().includes(searchLower)
        );
    }, [mentees, search]);

    const selectableMentees = useMemo(() => {
        return filteredMentees.filter((m) =>
            !selectedRoadmapIds.every((id: string) => m.assignedRoadmapIds?.includes(id))
        );
    }, [filteredMentees, selectedRoadmapIds]);

    const alreadyAssignedMentees = useMemo(() => {
        return filteredMentees.filter((m) =>
            selectedRoadmapIds.length > 0 &&
            selectedRoadmapIds.every((id: string) => m.assignedRoadmapIds?.includes(id))
        );
    }, [filteredMentees, selectedRoadmapIds]);

    const areAllSelectableSelected = useMemo(() => {
        return selectableMentees.length > 0 && selectableMentees.every(m => selectedMentees.has(m.id));
    }, [selectableMentees, selectedMentees]);

    const handleToggleSelection = (menteeId: string) => {
        setSelectedMentees((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(menteeId)) {
                newSet.delete(menteeId);
            } else {
                newSet.add(menteeId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        setSelectedMentees((prev) => {
            const newSet = new Set(prev);
            if (areAllSelectableSelected) {
                
                selectableMentees.forEach((m) => newSet.delete(m.id));
            } else {
                
                selectableMentees.forEach((m) => newSet.add(m.id));
            }
            return newSet;
        });
    };

    const handleAssign = async () => {
        if (selectedMentees.size === 0) {
            Alert.alert('No Selection', 'Please select at least one mentee.');
            return;
        }

        if (selectedRoadmapIds.length === 0) {
            Alert.alert('No Roadmaps', 'No roadmaps selected to assign.');
            return;
        }

        try {
            const menteeIdArray = Array.from(selectedMentees);
            await assignMutation.mutateAsync({
                userIds: menteeIdArray,
                roadMapIds: selectedRoadmapIds,
            });
            
            Alert.alert(
                'Success',
                `Roadmaps assigned to ${selectedMentees.size} mentee(s) successfully.`,
                [
                    {
                        text: 'OK',
                        onPress: () => router.dismissTo('/(mentor)/roadmap/landing/landing' as any),
                    },
                ]
            );
        } catch (err) {
            console.error('Failed to assign roadmaps:', err);
            Alert.alert('Error', 'Failed to assign roadmaps. Please try again.');
        }
    };

    
    const selectedMenteeNames = useMemo(() => {
        const names = Array.from(selectedMentees)
            .slice(0, 3)
            .map((id) => {
                const mentee = mentees.find((m) => m.id === id);
                return `${mentee?.firstName || ''} ${mentee?.lastName || ''}`.trim() || mentee?.username || 'Unknown';
            });

        if (selectedMentees.size > 3) {
            return `${names.join(', ')} +${selectedMentees.size - 3} more`;
        }
        return names.join(', ');
    }, [selectedMentees, mentees]);

    const renderFooter = () => {
        return (
            <View>
                 {isFetchingNextPage && (
                    <View style={styles.footerLoading}>
                        <ActivityIndicator size="small" color="#fff" />
                    </View>
                 )}
                 {alreadyAssignedMentees.length > 0 && (
                    <View style={styles.assignedSection}>
                        <View style={styles.assignedSectionHeader}>
                            <Ionicons name="checkmark-circle" size={16} color="rgba(255,255,255,0.5)" />
                            <Text style={styles.assignedSectionTitle}>
                                Already Assigned ({alreadyAssignedMentees.length})
                            </Text>
                        </View>
                        {alreadyAssignedMentees.map((item) => (
                            <View key={item.id} style={styles.assignedCard} pointerEvents="none">
                                <MenteeCard
                                    data={item}
                                    layout="card"
                                    isSelected={false}
                                    disabled={true}
                                    onToggleSelect={() => {}}
                                />
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
      };

    return (
        <AppGradientBackground style={styles.container}>
            <View style={{ paddingBottom: 10 }}>
                <TopBar role="mentor" showUserName={true} />
            </View>

            {}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                    <Text style={styles.headerTitle}>Assign to</Text>
                </TouchableOpacity>
            </View>

            {}
            <View style={styles.searchContainer}>
                <SearchBar value={search} onChangeValue={setSearch} placeholder="Search mentees" />
            </View>

            {}
            <View style={styles.selectAllContainer}>
                <TouchableOpacity onPress={handleSelectAll}>
                    <Text style={styles.selectAllText}>
                        {areAllSelectableSelected
                            ? 'Deselect All'
                            : 'Select All'}
                    </Text>
                </TouchableOpacity>
            </View>

            {}
            <View style={styles.content}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.loadingText}>Loading mentees...</Text>
                    </View>
                ) : isError ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
                        <Text style={styles.errorText}>Failed to load mentees</Text>
                    </View>
                ) : filteredMentees.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color="#fff" style={{ opacity: 0.5 }} />
                        <Text style={styles.emptyText}>
                            {search.trim() ? 'No mentees found' : 'No mentees available'}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={selectableMentees}
                        renderItem={({ item }) => (
                            <View style={styles.cardWrapper}>
                                <MenteeCard
                                    data={item}
                                    layout="card"
                                    isSelected={selectedMentees.has(item.id)}
                                    onToggleSelect={() => handleToggleSelection(item.id)}
                                />
                            </View>
                        )}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 120 }]}
                        showsVerticalScrollIndicator={false}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={renderFooter}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="checkmark-done-circle-outline" size={56} color="#fff" style={{ opacity: 0.5 }} />
                                <Text style={styles.emptyText}>All mentees already have this roadmap assigned</Text>
                            </View>
                        }
                    />
                )}
            </View>

            {}
            {selectedMentees.size > 0 && (
                <View style={[styles.footer, { paddingBottom: bottom + 16 }]}>
                    <View style={styles.footerContent}>
                        <Text style={styles.footerText} numberOfLines={1}>
                            {selectedMenteeNames}
                        </Text>
                        <TouchableOpacity
                            style={styles.assignButton}
                            onPress={handleAssign}
                            disabled={assignMutation.isPending}
                        >
                            {assignMutation.isPending ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.assignButtonText}>Assign</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </AppGradientBackground>
    );
};

export default AssignRoadmaps;

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
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        marginLeft: 12,
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
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
    cardWrapper: {
        marginBottom: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(21, 35, 96, 0.95)',
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    footerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    footerText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: '#fff',
        marginRight: 16,
    },
    assignButton: {
        backgroundColor: '#7B3FF2',
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        minWidth: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    assignButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        color: '#fff',
        marginTop: 12,
        fontSize: 15,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    errorText: {
        color: '#ff6b6b',
        marginTop: 12,
        fontSize: 15,
        textAlign: 'center',
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyText: {
        color: '#fff',
        marginTop: 12,
        fontSize: 15,
        textAlign: 'center',
        opacity: 0.7,
    },
    footerLoading: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    assignedSection: {
        marginTop: 8,
    },
    assignedSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 4,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.15)',
        marginBottom: 4,
    },
    assignedSectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    assignedCard: {
        opacity: 0.45,
    },
});
