import React, { useMemo } from "react";

import { router, Stack } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { RoadMapOutcomeModal } from "@/components/atom/RoadMapOutcomeModal";
import { Tab } from "@/components/atom/tab";
import { RoadmapCard, ScreenLayout } from "@/components/build-components";
import { Colors } from "@/constants/Colors";
import { useAllRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import { getRoadmapCard } from "@/lib/roadmap/mappers";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Landing() {
    const [activeTab, setActiveTab] = React.useState("New");
    const [isRoadmapModalVisible, setIsRoadmapModalVisible] = React.useState(false);
    const [tabs, setTabs] = React.useState("All");

    const handleTabPress = (tabName: string) => {
        setActiveTab(tabName);
    };

    // Fetch roadmaps
    const { data: roadmaps, isLoading: isLoadingRoadmaps } = useAllRoadmaps();

    // Format roadmaps for RoadmapCard component
    const formattedRoadmaps = useMemo(() => {
        if (!roadmaps || roadmaps.length === 0) return [];

        return roadmaps.map((roadmap) => {
            const roadmapCard = getRoadmapCard(roadmap);

            // Map status to display format
            let status = "Not Started";
            if (roadmapCard.status === "completed") {
                status = "Completed";
            } else if (roadmapCard.status === "due") {
                status = "Due";
            } else if (roadmapCard.status === "in-progress") {
                status = "In Progress";
            } else if (roadmapCard.status === "initial") {
                status = "Not Started";
            }

            return {
                id: roadmap._id,
                title: roadmapCard.title,
                description: roadmapCard.description,
                time: roadmapCard.completionTime,
                type: "assignment",
                read: true,
                status,
                taskStatus: {
                    notStarted: roadmapCard.status === "initial",
                    started: roadmapCard.status !== "initial",
                    inProgress: roadmapCard.taskProgress?.completed || 0,
                    toComplete: roadmapCard.taskProgress?.total || 0,
                    completed: roadmapCard.status === "completed",
                },
                image: roadmapCard.image ? { uri: roadmapCard.image } : require("@/assets/images/roadmap.jpg"),
                phase: roadmap.phase || roadmapCard.phaseNumber ? `Phase ${roadmapCard.phaseNumber}` : undefined,
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
        return formattedRoadmaps.filter((item) => item.status === tabs);
    }, [formattedRoadmaps, tabs]);

    return (
         <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{flex: 1}}>
        <ScreenLayout
            enablePastorHeader={true}
            showNameTag={true}
            tagName="John Doe"
            enableHeader={true}
            headerTitle="Revitalization Roadmap"
            headerSubTitle="My Mentee > John Doe"
            showSettings={true}
            paddingX={0}
        >
            <View className="">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        gap: 8,
                        marginTop: 16,
                        paddingHorizontal: 16,
                    }}
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
                <View
                    style={{
                        marginVertical: 10,
                        paddingHorizontal: 16,
                        width: "100%",
                    }}
                >
                    {isLoadingRoadmaps ? (
                        <View style={{ paddingVertical: 40, alignItems: "center" }}>
                            <ActivityIndicator size="large" color="white" />
                            <Text style={{ color: "white", marginTop: 16, fontSize: 14 }}>
                                Loading roadmaps...
                            </Text>
                        </View>
                    ) : filteredRoadMaps.length > 0 ? (
                        filteredRoadMaps.map((e, i) => (
                            <React.Fragment key={e.id || i}>
                                <RoadmapCard data={e} navigation={router} />
                                {i < filteredRoadMaps.length - 1 && (
                                    <View className="h-[0.5px] bg-white/30 my-4" />
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        <View style={{ paddingVertical: 40, alignItems: "center" }}>
                            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                                No roadmaps available
                            </Text>
                        </View>
                    )}
                </View>
            </View>
            <RoadMapOutcomeModal
                isMenuVisible={isRoadmapModalVisible}
                closeMenu={() => setIsRoadmapModalVisible(false)}
            />
        </ScreenLayout>
        </SafeAreaView>
        </LinearGradient>
    )
}