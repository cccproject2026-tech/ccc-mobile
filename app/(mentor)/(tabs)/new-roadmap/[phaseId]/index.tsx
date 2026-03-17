import { mockRevitalization } from '@/lib/roadmap/mock';
import { selectItems, selectPhase } from '@/lib/roadmap/selectors';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';


// components/roadmap/ItemCard.tsx
import { BaseItem } from '@/lib/roadmap/types';
import { Image, StyleSheet } from 'react-native';

interface Props {
    item: BaseItem;
}

export const ItemCard = ({ item }: Props) => {
    const getStatusColor = () => {
        switch (item.status) {
            case 'COMPLETED': return '#34d399';
            case 'IN_PROGRESS': return '#fbbf24';
            case 'BLOCKED': return '#f87171';
            default: return '#93c5fd';
        }
    };

    const getStatusText = () => {
        if (item.status === 'NOT_STARTED') return 'Not Started Yet';
        return item.status.replace('_', ' ');
    };

    return (
        <View style={styles.card}>
            {/* Left - Image */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: 'https://via.placeholder.com/80' }}
                    style={styles.image}
                />
            </View>

            {/* Right - Content */}
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                </Text>
                {item.description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}

                {/* Completion time */}
                <Text style={styles.completionTime}>
                    Completion Time{'\n'}Months {item}
                </Text>

                {/* Status badge */}
                <View style={styles.statusRow}>
                    <View style={[styles.statusPill, { borderColor: getStatusColor() }]}>
                        <Text style={[styles.statusText, { color: getStatusColor() }]}>
                            Status • {getStatusText()}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#153f6d',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        flexDirection: 'row',
        gap: 12,
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    content: {
        flex: 1,
    },
    title: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
    },
    description: {
        color: '#9cc2ff',
        fontSize: 13,
        marginBottom: 8,
        lineHeight: 18,
    },
    completionTime: {
        color: '#9cc2ff',
        fontSize: 12,
        marginBottom: 10,
    },
    statusRow: {
        flexDirection: 'row',
    },
    statusPill: {
        borderWidth: 1,
        borderRadius: 16,
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
});


export default function PhaseDetail() {
    const { phaseId } = useLocalSearchParams<{ phaseId: string }>();
    const phase = selectPhase(mockRevitalization, phaseId!);
    const items = selectItems(mockRevitalization, phase.items);
    const [activeTab, setActiveTab] = useState<'ALL' | 'DUE' | 'NOT_STARTED' | 'COMPLETED'>('ALL');

    // Filter items based on tab
    const filteredItems = items.filter(item => {
        if (activeTab === 'ALL') return true;
        if (activeTab === 'DUE') {
            // Treat "DUE" as items that have a dueDate within the next 14 days (if present).
            // Use a safe any-cast so this works even if BaseItem doesn't declare dueDate.
            const dueRaw = (item as any).dueDate;
            if (!dueRaw) return false;
            const due = new Date(dueRaw);
            if (isNaN(due.getTime())) return false;
            const now = new Date();
            const inTwoWeeks = new Date(now);
            inTwoWeeks.setDate(now.getDate() + 14);
            return due >= now && due <= inTwoWeeks;
        }
        if (activeTab === 'NOT_STARTED') return item.status === 'NOT_STARTED';
        if (activeTab === 'COMPLETED') return item.status === 'COMPLETED';
        return true;
    });

    return (
        <View style={{ flex: 1, backgroundColor: '#0b1e33' }}>
            {/* Header */}
            <View style={{ padding: 16 }}>
                <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>
                    {phase.title}
                </Text>
                <Text style={{ color: '#9cc2ff', marginTop: 4 }}>
                    {phase.subtitle}
                </Text>
            </View>

            {/* Search bar - optional for now */}
            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                <View style={{
                    backgroundColor: '#153f6d',
                    padding: 12,
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <Text style={{ color: '#9cc2ff' }}>Search</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 16 }}>
                {['ALL', 'DUE', 'NOT_STARTED', 'COMPLETED'].map(tab => (
                    <Pressable
                        key={tab}
                        onPress={() => setActiveTab(tab as any)}
                        style={{
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            borderRadius: 20,
                            backgroundColor: activeTab === tab ? 'white' : '#153f6d',
                        }}
                    >
                        <Text style={{
                            color: activeTab === tab ? '#0b2447' : 'white',
                            fontSize: 14
                        }}>
                            {tab === 'NOT_STARTED' ? 'Not Started' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Task list */}
            <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
                {filteredItems.map(item => (
                    <Pressable
                        key={item.id}
                        onPress={() => router.push(`/new-roadmap/${phaseId}/${item.id}`)}
                    >
                        <ItemCard item={item} />
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}
