import { BaseItem } from '@/lib/roadmap/types';
import { ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface Props {
    item: BaseItem;
    children: ReactNode; // The task-specific bottom section
    showTabs?: boolean;
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}

export function TaskLayout({ item, children, showTabs = false, activeTab = 'overview', onTabChange }: Props) {
    return (
        <View style={styles.container}>
            {/* Tabs (only for Jump-start) */}
            {showTabs && (
                <View style={styles.tabBar}>
                    {['overview', 'comments', 'queries'].map(tab => (
                        <Pressable
                            key={tab}
                            onPress={() => onTabChange?.(tab)}
                            style={[styles.tab, activeTab === tab && styles.tabActive]}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                            {tab === 'comments' && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>2</Text>
                                </View>
                            )}
                            {tab === 'queries' && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>3</Text>
                                </View>
                            )}
                        </Pressable>
                    ))}
                </View>
            )}

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Cover Image with title overlay */}
                {item.meta?.coverImage && (
                    <View style={styles.coverContainer}>
                        <Image
                            source={typeof item.meta.coverImage === 'string'
                                ? { uri: item.meta.coverImage }
                                : item.meta.coverImage}
                            style={styles.coverImage}
                        />
                        <View style={styles.coverOverlay}>
                            <Text style={styles.coverTitle}>{item.title}</Text>
                        </View>
                    </View>
                )}

                {/* Completion Time */}
                <Text style={styles.completionTime}>
                    Completion Time Months {item.meta?.completionTimeMonths || '1 - 2'}
                </Text>

                {/* Roadmap Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Roadmap</Text>
                    <View style={styles.box}>
                        <Text style={styles.boxText}>
                            {item.meta?.roadmapText || item.title}
                        </Text>
                    </View>
                </View>

                {/* Description Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <View style={styles.box}>
                        <Text style={styles.descriptionText}>
                            {item.description || 'No description provided'}
                        </Text>
                    </View>
                </View>

                {/* Task-specific interactive content */}
                {children}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0b1e33' },
    tabBar: { flexDirection: 'row', padding: 16, gap: 12, backgroundColor: '#0b1e33' },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    tabActive: { backgroundColor: 'white', borderColor: 'white' },
    tabText: { color: 'white', fontSize: 14, fontWeight: '500' },
    tabTextActive: { color: '#0b2447' },
    badge: {
        backgroundColor: '#1e3a5f',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    badgeText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
    scrollContent: { padding: 16 },
    coverContainer: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        position: 'relative'
    },
    coverImage: { width: '100%', height: '100%' },
    coverOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(11,30,51,0.85)',
        padding: 16
    },
    coverTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    completionTime: { color: '#9cc2ff', fontSize: 14, textAlign: 'center', marginBottom: 20 },
    section: { marginBottom: 20 },
    sectionTitle: { color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 8 },
    box: {
        backgroundColor: '#153f6d',
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#2a5a8a'
    },
    boxText: { color: 'white', fontSize: 15, lineHeight: 22 },
    descriptionText: { color: '#9cc2ff', fontSize: 14, lineHeight: 20 },
});
