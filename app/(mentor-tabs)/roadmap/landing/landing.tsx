import React, { useCallback, useMemo } from "react";

import { RoadMapOutcomeModal } from "@/components/atom/RoadMapOutcomeModal";
import { Tab } from "@/components/atom/tab";
import RoadmapCard from "@/components/director/ProgressRoadmapCard";
import TopBar from "@/components/director/TopBar";
import { useAllRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import { getRoadmapCard } from "@/lib/roadmap/mappers";
import { Roadmap } from "@/lib/roadmap/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Landing() {
    const [isRoadmapModalVisible, setIsRoadmapModalVisible] = React.useState(false);
    const [tabs, setTabs] = React.useState("All");

    // Fetch roadmaps
    const { data: roadmaps, isLoading: isLoadingRoadmaps } = useAllRoadmaps();

    // Handle roadmap press navigation
    const handleRoadmapPress = useCallback((roadmap: Roadmap) => {
        if (!roadmap.haveNextedRoadMaps || roadmap.roadmaps.length === 0) {
            console.warn('Roadmap has no tasks');
            return;
        }

        // Navigate to roadmap detail - using dynamic routes
        if (roadmap.roadmaps.length === 1 && !roadmap.haveNextedRoadMaps) {
            // Single task - go directly to task
            router.push(`/(mentor-tabs)/roadmap/${roadmap._id}/${roadmap.roadmaps[0]._id}` as any);
        } else {
            // Multiple tasks - show task list
            router.push(`/(mentor-tabs)/roadmap/${roadmap._id}` as any);
        }
    }, []);

    // Format roadmaps for RoadmapCard component
    const formattedRoadmaps = useMemo(() => {
        if (!roadmaps || roadmaps.length === 0) return [];

        return roadmaps.map((roadmap) => {
            const cardData = getRoadmapCard(roadmap);
            // Ensure showArrow is set for navigation
            return {
                roadmap,
                cardData: {
                    ...cardData,
                    showArrow: true,
                },
            };
        });
    }, [roadmaps]);

    const availableTabs = [
        { tab: "All" },
        { tab: "Due" },
        { tab: "Not Started" },
        { tab: "In Progress" },
        { tab: "Completed" },
        { tab: "Overdue" },
        { tab: "Pending Review" },
        { tab: "On Hold" },
    ];

    const filteredRoadMaps = useMemo(() => {
        if (tabs === "All") return formattedRoadmaps;
        
        // Map tab names to status values
        const statusMap: Record<string, string> = {
            "Due": "due",
            "Not Started": "initial",
            "In Progress": "in-progress",
            "Completed": "completed",
        };
        
        const targetStatus = statusMap[tabs];
        if (!targetStatus) return formattedRoadmaps;
        
        return formattedRoadmaps.filter((item) => item.cardData.status === targetStatus);
    }, [formattedRoadmaps, tabs]);

    return (
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />
            
            <View style={styles.topBarWrapper}>
                <TopBar role="mentor" showUserName />
            </View>

            <View style={styles.headerContainer}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Revitalization Roadmap</Text>
                </View>
                <TouchableOpacity onPress={() => setIsRoadmapModalVisible(true)}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabScrollContent}
            >
                {availableTabs.map((e, i) => (
                    <Tab
                        key={i}
                        data={e}
                        tabs={tabs}
                        setTabs={setTabs}
                        onPress={() => {
                            setTabs(e.tab);
                        }}
                    />
                ))}
            </ScrollView>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {isLoadingRoadmaps ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="white" />
                        <Text style={styles.loadingText}>
                            Loading roadmaps...
                        </Text>
                    </View>
                ) : filteredRoadMaps.length > 0 ? (
                    filteredRoadMaps.map(({ roadmap, cardData }, i) => (
                        <React.Fragment key={roadmap._id || i}>
                            <RoadmapCard
                                data={cardData}
                                onPress={() => handleRoadmapPress(roadmap)}
                            />
                            {i < filteredRoadMaps.length - 1 && (
                                <View style={styles.separator} />
                            )}
                        </React.Fragment>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            No roadmaps available
                        </Text>
                    </View>
                )}
            </ScrollView>

            <RoadMapOutcomeModal
                isMenuVisible={isRoadmapModalVisible}
                closeMenu={() => setIsRoadmapModalVisible(false)}
            />
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    topBarWrapper: { 
        paddingBottom: 10 
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
        marginBottom: 16,
    },
    headerLeft: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        flex: 1 
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        marginLeft: 8,
    },
    tabScrollContent: {
        gap: 8,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 16,
    },
    scrollContent: {
        padding: 16,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: "center",
    },
    loadingText: {
        color: "white",
        marginTop: 16,
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
        paddingHorizontal: 20,
    },
    emptyText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 12,
    },
    separator: {
        height: 0.5,
        backgroundColor: "rgba(255,255,255,0.3)",
        marginVertical: 16,
    },
});