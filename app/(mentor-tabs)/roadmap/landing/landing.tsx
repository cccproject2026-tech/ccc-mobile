import React from "react";

import { router, Stack } from "expo-router";
import { ScrollView, View } from "react-native";

import { RoadMapOutcomeModal } from "@/components/atom/RoadMapOutcomeModal";
import { Tab } from "@/components/atom/tab";
import { RoadmapCard, ScreenLayout } from "@/components/build-components";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Landing() {
    const [activeTab, setActiveTab] = React.useState("New");
    const [isRoadmapModalVisible, setIsRoadmapModalVisible] = React.useState(false);
    const [tabs, setTabs] = React.useState("All");

    const handleTabPress = (tabName: string) => {
        setActiveTab(tabName);
    };

    const dummyRoadMaps = [
        {
            title: "Self Revitalization Phase",
            description:
                "Take a deeper look into your ministry to bring conflict resolution and theory of change.",
            time: "Completion Time Months 1 - 2",
            type: "assignment",
            read: true,
            status: "Not Started",
            taskStatus: {
                notStarted: true,
                started: true,
                inProgress: 0,
                toComplete: 18,
                completed: false,
            },
            image: require("@/assets/images/roadmap.jpg"),
        },
        {
            id: 2,
            title: "Self Revitalization Phase",
            description:
                "Take a deeper look into your ministry to bring conflict resolution and theory of change.",
            time: "Completion Time Months 1 - 2",
            type: "note",
            read: false,
            subPhase: true,
            status: "Not Started",
            taskStatus: {
                notStarted: true,
                started: false,
                inProgress: 0,
                toComplete: 8,
                completed: false,
            },
            image: require("@/assets/images/roadmap.jpg"),
            phase: "Phase 1",
        },
        {
            id: 3,
            title: "Church Empowerment Phase",
            description:
                "Create community to empower your church and make a long-term impact on coordinated community service programs.",
            time: "Completion Time Months 3 - 9",
            type: "assignment",
            read: true,
            status: "Not Started",
            taskStatus: {
                notStarted: true,
                started: false,
                inProgress: 0,
                toComplete: 18,
                completed: false,
            },
            image: require("@/assets/images/roadmap.jpg"),
            phase: "Phase 2",
        },
        {
            id: 4,
            title: "Community Revitalization and Multiplication Phase",
            description:
                "Review community service outcomes and empower others as you explore opportunities for further growth.",
            time: "Completion Time Months 10 - 12",
            type: "profile",
            read: true,
            status: "Not Started",
            taskStatus: {
                notStarted: true,
                started: false,
                inProgress: 0,
                toComplete: 0,
                completed: false,
            },
            image: require("@/assets/images/roadmap.jpg"),
            phase: "Phase 3",
        },
    ];

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

    const filteredRoadMaps = dummyRoadMaps.filter((item) => {
        if (tabs === "All") return true;
        return item.status === tabs;
    });

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
                    {filteredRoadMaps.map((e, i) => (
                        <React.Fragment key={i}>
                            <RoadmapCard data={e} navigation={router} />
                            {i < filteredRoadMaps.length - 1 && (
                                <View className="h-[0.5px] bg-white/30 my-4" />
                            )}
                        </React.Fragment>
                    ))}

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