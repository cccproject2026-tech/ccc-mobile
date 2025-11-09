import { AssessmentCard } from "@/components/build-components";
import PMPBottomSheet from "@/components/director/PMPBottomSheet";
import SearchBar from "@/components/director/SearchBar";
import { TabSwitcher } from "@/components/director/TabSwitcher";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { useAssessment } from "@/context/AssessmentsContext";
import { dummyRoadMaps } from "@/lib/assessments/mock";
import { Assessment } from "@/lib/assessments/types";
import { getFontSize, getIconSize, getSpacing } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet"; // Import BottomSheetModal type
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react"; // Add useRef and useState
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Survey() {
    const [search, setSearch] = React.useState("");
    const [tabs, setTabs] = React.useState("All");
    const { bottom } = useSafeAreaInsets();
    const { responses } = useAssessment();

    // PMP Bottom Sheet ref and state
    const pmpBottomSheetRef = useRef<BottomSheetModal>(null);
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
    const [currentSection, setCurrentSection] = useState(0);

    // Mock sections data - you can replace this with actual data from your assessment
    const sections = [
        {
            title: "Section 1 - Personal Well-Being",
            level: "Level 1",
            plans: [
                { id: 1, text: "Schedule 1-on-1 with a mentor" },
                { id: 2, text: "Take trauma survey (via Claritysoft)" },
                { id: 3, text: "Identify areas of stress/anxiety" },
                { id: 4, text: "Family Wellbeing survey" },
                { id: 5, text: "Collaborate on a healing plan" },
                { id: 6, text: "Collaborate on a physical Exercise plan" },
                { id: 7, text: "Establish a prayer covenant/partnership" },
                { id: 8, text: "Finalize a growth plan" },
            ]
        },
        {
            title: "Section 2 - Professional Development/Leadership style",
            level: "Level 1",
            plans: [
                { id: 1, text: "Schedule 1-on-1 with a mentor" },
                { id: 2, text: "Take trauma survey (via Claritysoft)" },
                { id: 3, text: "Identify areas of stress/anxiety" },
                { id: 4, text: "Family Wellbeing survey" },
                { id: 5, text: "Collaborate on a healing plan" },
                { id: 6, text: "Collaborate on a physical Exercise plan" },
                { id: 7, text: "Establish a prayer covenant/partnership" },
                { id: 8, text: "Finalize a growth plan" },
            ]
        },
        // Add more sections as needed
    ];

    // Merge context responses with dummyRoadMaps
    const mergedAssessments = dummyRoadMaps.map((item) => {
        const response = responses[item.id];
        if (response) {
            let status: Assessment["status"] = item.status;
            let completionDate = item.completionDate;
            if (response.status === "Completed") {
                status = "Completed";
                completionDate = response.completedAt
                    ? new Date(response.completedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    })
                    : undefined;
            } else if (response.status === "Submitted") {
                status = "Submitted";
            }
            return {
                ...item,
                status,
                completionDate,
            };
        }
        return item;
    });

    const statusKeys = [
        { key: "Due", label: "Due" },
        { key: "Not Started", label: "Not Started" },
        { key: "In Progress", label: "In Progress" },
        { key: "Completed", label: "Completed" },
        { key: "Overdue", label: "Overdue" },
        { key: "Pending Review", label: "Pending Review" },
        { key: "On Hold", label: "On Hold" },
    ];

    const availableTabs = [
        { key: "All", label: "All" },
        ...statusKeys.map(tab => {
            const count = mergedAssessments.filter(item => item.status === tab.label).length;
            return count > 0 ? { ...tab, badge: count } : tab;
        })
    ];

    const filteredRoadMaps = mergedAssessments.filter((item) => {
        if (tabs === "All") return true;
        return item.status === tabs;
    });

    const handleCardPress = (assessment: Assessment) => {
        router.push({
            pathname: "/assessments/survey-guidelines",
            params: { assessmentId: assessment.id as string },
        });
    };

    // Handle opening PMP bottom sheet
    const handleCustomizedPress = (assessment: Assessment) => {
        setSelectedAssessment(assessment);
        setCurrentSection(0); // Start with first section
        pmpBottomSheetRef.current?.present();
    };

    // Handle section navigation
    const handleNextSection = () => {
        if (currentSection < sections.length - 1) {
            setCurrentSection(prev => prev + 1);
        } else {
            // Last section - close sheet or perform final action
            pmpBottomSheetRef.current?.dismiss();
        }
    };

    const handlePreviousSection = () => {
        if (currentSection > 0) {
            setCurrentSection(prev => prev - 1);
        }
    };

    const handleDownload = () => {
        pmpBottomSheetRef.current?.dismiss();
        router.push({
            pathname: '/assessments/report',
            params: {
                assessmentId: selectedAssessment?.id,
                userName: 'John Ross',
                completedDate: new Date().toLocaleDateString('en-GB'),
            }
        });
    };


    const handleCloseSheet = () => {
        pmpBottomSheetRef.current?.dismiss();
    };

    const currentSectionData = sections[currentSection];

    return (
        <>
            <LinearGradient
                colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
                style={{ flex: 1 }}
            >
                <View style={styles.scrollContainer}>
                    <TopBar role="pastor" userName="John Doe" showUserName />

                    {/* Header Section */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={getIconSize(28)} color="#fff" />
                            <Text style={styles.headerTitle}>Assessment</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {/* Tabs Section */}
                    <View style={{ marginTop: 10 }}>
                        <TabSwitcher
                            tabs={availableTabs}
                            activeTab={tabs}
                            onChange={setTabs}
                        />
                    </View>

                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingBottom: bottom + 20,
                        }}
                    >
                        <View
                            style={{
                                paddingHorizontal: 16,
                                width: "100%",
                            }}
                        >
                            {filteredRoadMaps.map((e, i) => (
                                <React.Fragment key={i}>
                                    <AssessmentCard
                                        data={e}
                                        onPress={() => handleCardPress(e)}
                                        onMeetingPress={() => {
                                            console.log("Meeting pressed for:", e.title);
                                        }}
                                        onMeetingIconPress={() => {
                                            console.log("Meeting icon pressed for:", e.title);
                                        }}
                                        onCustomizedPress={() => handleCustomizedPress(e)} // Open PMP sheet
                                    />
                                    {i < filteredRoadMaps.length - 1 && (
                                        <View style={styles.dividerWithMargin} />
                                    )}
                                </React.Fragment>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </LinearGradient>

            {/* PMP Bottom Sheet */}
            <PMPBottomSheet
                ref={pmpBottomSheetRef}
                title={selectedAssessment?.title || "Pastoral Ministry Profile (PMP)"}
                sectionTitle={currentSectionData?.title}
                levelText={`You are at ${currentSectionData?.level}!`}
                developmentPlans={currentSectionData?.plans}
                showPreviousButton={currentSection > 0}
                onPrevious={handlePreviousSection}
                onNext={handleNextSection}
                onDownload={handleDownload}
                onClose={handleCloseSheet}
                currentSection={currentSection + 1}
                totalSections={sections.length}
            />
        </>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },
    searchContainer: {
        marginHorizontal: 16,
    },
    separator: {
        height: 2,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        marginVertical: 18,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: getSpacing(16),
        paddingBottom: getSpacing(12),
        marginVertical: getSpacing(16),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        marginLeft: getSpacing(8),
        fontSize: getFontSize(18),
        fontWeight: '600',
        color: '#fff',
    },
    dividerWithMargin: {
        height: 0.5,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginVertical: 16,
    }
});
