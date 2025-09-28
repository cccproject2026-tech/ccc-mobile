import { ProgressCard } from "@/components/atom/cards"
import { Tab } from "@/components/atom/tab"
import { PastorNavigationHeader } from "@/components/pastor/Header"
import { Colors } from "@/constants/Colors"
import { icons } from "@/constants/images"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { Stack, router } from "expo-router"
import React from "react"
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function ProgressScreen() {
    const [roadmapTabs, setRoadmapTabs] = React.useState("All")
    const [assessmentTabs, setAssessmentTabs] = React.useState("All")

    const dummyRoadMaps = [
        {
            title: "Self Revitalizaiton Phase",
            time: "Completion Time Months 1 - 2",
            status: "Due",
            image: require("@/assets/images/jumpstart.png"),
            progress: "1",
            taskStatus: {
                notStarted: true,
                started: false,
                inProgress: 0,
                toComplete: 0,
                completed: false,
            },
        },
        {
            title: "Church Empowerment Phase",
            time: "Completion Time Months 3 - 9",
            status: "In Progress",
            image: require("@/assets/images/roadmap.jpg"),
            progress: "1",
            taskStatus: {
                notStarted: true,
                started: false,
                inProgress: 0,
                toComplete: 0,
                completed: false,
            },
        },
        {
            title: " Community Revitalization and Multiplication Phase",
            time: "Completion Time Months 3 - 9",
            type: "assignment",
            read: true,
            status: "Not Started Yet",
            image: require("@/assets/images/roadmap.jpg"),
            progress: "0",
            taskStatus: {
                notStarted: true,
                started: false,
                inProgress: 0,
                toComplete: 0,
                completed: false,
            },
        },
        {
            title: "Jump-start",
            description: "Interested in receiving mentoring in community engagement",
            time: "Completion Time Months 3 - 9",
            type: "assignment",
            read: true,
            status: "Completed",
            image: require("@/assets/images/roadmap.jpg"),
            progress: "0",
            taskStatus: {
                notStarted: true,
                started: false,
                inProgress: 0,
                toComplete: 0,
                completed: false,
            },
            completedTime: "20 Oct 2024"
        },
    ]

    const dummyAssessment = [
        {
            title: "Church Assessment Evaluation(CMA)",
            description: "Interested in receiving mentoring in community engagement   ",
            image: require("@/assets/images/jumpstart.png"),
            progress: "0",
            taskStatus: {
                notStarted: true,
                started: false,
                inProgress: 0,
                toComplete: 0,
                completed: false,
            },
            dueDate: "20 Oct 2024",
            status: "Completed",
            type: "assessment",
        },
        {
            title: "Church Assessment Evaluation(CMA)",
            description: "Interested in receiving mentoring in community engagement   ",
            image: require("@/assets/images/jumpstart.png"),
            progress: "0",
            taskStatus: {
                notStarted: true,
                started: false,
                inProgress: 0,
                toComplete: 0,
                completed: false,
            },
            submittedDate: "20 Oct 2024",
            status: "due",
            type: "assessment",
            completed: "Customized Development Plans"
        },
    ]

    const availableTabs = [
        { tab: "All" },
        { tab: "Completed" },
        { tab: "Remaining" },
    ]

    const filteredRoadMaps = dummyRoadMaps.filter((item) => {
        if (roadmapTabs === "All") {
            return true
        } else if (roadmapTabs === "Completed") {
            return item.status === "Completed"
        } else {
            return item.status !== "Completed"
        }
    })

    const filteredAssessments = dummyAssessment.filter((item) => {
        if (assessmentTabs === "All") {
            return true
        } else if (assessmentTabs === "Completed") {
            return item.status === "Completed"
        } else {
            return item.status !== "Completed"
        }
    })

    return (
        <>
            <LinearGradient
                colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
                style={{ flex: 1 }}
            >
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={styles.scrollContainer}>
                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingBottom: 40,
                        }}
                    >
                        <PastorNavigationHeader />

                        {/* Header Section */}
                        <View
                            style={{
                                width: "100%",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                paddingHorizontal: 20,
                                paddingTop: 20,
                                alignItems: "center",
                            }}
                        >
                            <TouchableOpacity onPress={() => router.back()}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                >
                                    <Image
                                        source={icons.forward}
                                        style={{
                                            width: 18,
                                            height: 18,
                                            transform: [{ scaleX: -1 }],
                                        }}
                                    />
                                    <Text className="text-white font-semibold text-[17px]">
                                        My Progress
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity>
                                <Ionicons name="ellipsis-vertical" size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                        <View className="flex flex-col gap-5 mt-5" style={{ marginTop: 20 }}>
                            <Text className="text-white px-4" style={{ fontWeight: 600, fontSize: 16 }}>
                                Revitalization Roadmap Progress
                            </Text>
                            {/* Tabs Section */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{
                                    paddingHorizontal: 16,
                                    gap: 8,
                                    marginTop: 15,
                                    paddingBottom: 5,
                                }}
                                style={{ maxHeight: 50 }}
                            >
                                {availableTabs.map((e, i) => (
                                    <Tab
                                        key={i}
                                        data={e}
                                        tabs={roadmapTabs}
                                        setTabs={setRoadmapTabs}
                                        onPress={() => {
                                            setRoadmapTabs(e.tab)
                                        }}
                                        className=" flex-1 w-full"

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
                                        <ProgressCard data={e} navigation={router} />
                                        {i < filteredRoadMaps.length - 1 && (
                                            <View className="h-[0.5px] bg-white/30 my-4" />
                                        )}
                                    </React.Fragment>
                                ))}
                            </View>
                        </View>


                        {/* Assessment Progress */}
                        <View className="flex flex-col gap-5 mt-5" style={{ marginTop: 20 }}>
                            <Text className="text-white px-4" style={{ fontWeight: 600, fontSize: 16 }}>
                                Assessment Progress
                            </Text>
                            {/* Tabs Section */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{
                                    paddingHorizontal: 16,
                                    gap: 8,
                                    marginTop: 15,
                                    paddingBottom: 5,
                                }}
                                style={{ maxHeight: 50 }}
                            >
                                {availableTabs.map((e, i) => (
                                    <Tab
                                        key={i}
                                        data={e}
                                        tabs={assessmentTabs}
                                        setTabs={setAssessmentTabs}
                                        onPress={() => {
                                            setAssessmentTabs(e.tab)
                                        }}
                                        className=" flex-1 w-full"
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
                                {filteredAssessments.map((e, i) => (
                                    <React.Fragment key={i}>
                                        <ProgressCard data={e} navigation={router} />
                                        {i < filteredAssessments.length - 1 && (
                                            <View className="h-[0.5px] bg-white/30 my-4" />
                                        )}
                                    </React.Fragment>
                                ))}
                            </View>
                        </View>

                    </ScrollView>
                </SafeAreaView>

            </LinearGradient>
        </>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },
    searchContainer: {
        marginHorizontal: 16,
        marginTop: 16,
    },
    separator: {
        height: 2,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        marginVertical: 18,
    },
})