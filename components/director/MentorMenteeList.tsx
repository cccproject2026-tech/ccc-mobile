import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import MentorMenteeCard from './MentorMenteeCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;

type Mentor = {
    id: string;
    name: string;
    role: string;
    menteeCount: number;
};

type Mentee = {
    id: string;
    name: string;
    role: string;
    lastContactedDays: number;
};

const MentorMenteeList: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'mentors' | 'mentees'>('mentors');

    // Mock data
    const mentors: Mentor[] = [
        { id: '1', name: 'John Doe', role: 'Mentor', menteeCount: 5 },
        { id: '2', name: 'John Doe', role: 'Mentor', menteeCount: 5 },
        { id: '3', name: 'John Doe', role: 'Mentor', menteeCount: 5 },
    ];

    const mentees: Mentee[] = [
        { id: '1', name: 'John Ross', role: 'Pastor', lastContactedDays: 5 },
        { id: '2', name: 'John Ross', role: 'Pastor', lastContactedDays: 5 },
        { id: '3', name: 'John Ross', role: 'Pastor', lastContactedDays: 5 },
    ];

    return (
        <View style={styles.container}>
            {/* Tab Header */}
            <View style={styles.header}>
                <View style={styles.tabs}>
                    <Pressable
                        style={[styles.tab, activeTab === 'mentors' && styles.activeTab]}
                        onPress={() => setActiveTab('mentors')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'mentors' && styles.activeTabText,
                            ]}
                        >
                            Mentors
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.tab, activeTab === 'mentees' && styles.activeTab]}
                        onPress={() => setActiveTab('mentees')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'mentees' && styles.activeTabText,
                            ]}
                        >
                            Mentees
                        </Text>
                    </Pressable>
                </View>

                <Pressable>
                    <Text style={styles.seeAll}>See all</Text>
                </Pressable>
            </View>

            {/* List */}
            <View style={styles.listContainer}>
                {activeTab === 'mentors' &&
                    mentors.map((mentor) => (
                        <MentorMenteeCard
                            key={mentor.id}
                            name={mentor.name}
                            role={mentor.role}
                            metricLabel={`${mentor.menteeCount} Mentees`}
                            onPress={() => console.log('View mentor', mentor.name)}
                        />
                    ))}

                {activeTab === 'mentees' &&
                    mentees.map((mentee) => (
                        <MentorMenteeCard
                            key={mentee.id}
                            name={mentee.name}
                            role={mentee.role}
                            metricLabel="Last Contacted :"
                            metricValue={`${mentee.lastContactedDays} Days Ago`}
                            onPress={() => console.log('View mentee', mentee.name)}
                        />
                    ))}
            </View>
        </View>
    );
};

export default MentorMenteeList;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        marginTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isSmallDevice ? 10 : 12,
    },
    tabs: {
        flexDirection: 'row',
        gap: isSmallDevice ? 6 : 8,
    },
    tab: {
        paddingHorizontal: isSmallDevice ? 16 : 20,
        paddingVertical: isSmallDevice ? 8 : 10,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.4)',
        backgroundColor: 'transparent',
    },
    activeTab: {
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    tabText: {
        fontSize: isSmallDevice ? 14 : 15,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.9)',
    },
    activeTabText: {
        color: '#164d62',
    },
    seeAll: {
        fontSize: isSmallDevice ? 13 : 14,
        fontWeight: '600',
        color: '#EAF7FF',
    },
    listContainer: {
        paddingBottom: 20,
    },
});
