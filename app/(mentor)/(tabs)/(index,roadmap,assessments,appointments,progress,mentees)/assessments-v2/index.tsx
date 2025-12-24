import AssessmentDeletedSuccessModal from "@/components/build-components/AssessmentDeletedSuccessModal";
import AssessmentMenuBottomSheet from "@/components/build-components/AssessmentMenuBottomSheet";
import AssessmentCard from "@/components/build-components/cards/assessment-card";
import DeleteConfirmationModal from "@/components/build-components/DeleteConfirmationModal";
import SearchBar from "@/components/director/SearchBar";
import { TabSwitcher } from "@/components/director/TabSwitcher";
import TopBar from "@/components/director/TopBar";
import { icons } from "@/constants/images";
import { useDeleteAssessment } from "@/hooks/assessments";
import { useMenteeAssessments } from "@/hooks/assessments/useMenteeAssessments";
import { useMentees } from "@/hooks/mentees/useMentees";
import { Assessment } from "@/lib/assessments/types";
import { useAuthStore } from "@/stores/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MentorAssessmentsLibrary() {
    const { bottom } = useSafeAreaInsets();
    const router = useRouter();

    const [search, setSearch] = useState("");
    const [selectedMentee, setSelectedMentee] = useState<string | null>(null);
    const [tabs, setTabs] = useState("All");
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
    const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
    const [assessmentToDelete, setAssessmentToDelete] = useState<Assessment | null>(null);
    const bottomSheetRef = useRef<BottomSheetModal>(null);

    // Get current user for TopBar
    const { user } = useAuthStore();

    // Fetch mentees for avatars
    const { data: menteesData } = useMentees();
    
    // Format mentees for display
    const mentees = useMemo(() => {
        if (!menteesData?.mentees) return [];
        return menteesData.mentees.map((mentee) => ({
            id: mentee.id,
            name: `${mentee.firstName || ""} ${mentee.lastName || ""}`.trim() || "Mentee",
            avatar: mentee.profilePicture ? { uri: mentee.profilePicture } : icons.myProfile,
        }));
    }, [menteesData]);

    // Use mentee assessments hook (shows library when no mentee selected)
    const {
        data: assessments,
        isLoading,
        error,
        refetch,
        isRefetching,
        assignedCount
    } = useMenteeAssessments(selectedMentee);

    const deleteAssessmentMutation = useDeleteAssessment();

    // Handle pull to refresh
    const handleRefresh = () => {
        refetch();
    };

    // Apply search filter
    const searchedAssessments = useMemo(() => {
        if (!search.trim()) return assessments;

        const query = search.toLowerCase();
        return assessments.filter(
            (item) =>
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
        );
    }, [assessments, search]);

    // Status keys for tabs
    const statusKeys = [
        { key: "Not Started", label: "Not Started" },
        { key: "Submitted", label: "Submitted" },
        { key: "Completed", label: "Completed" },
    ];

    // Calculate available tabs with counts
    const availableTabs = useMemo(() => {
        return [
            { key: "All", label: "All", badge: assignedCount },
            ...statusKeys.map(tab => {
                const count = searchedAssessments.filter(
                    item => item.status === tab.label
                ).length;
                return count > 0 ? { ...tab, badge: count } : tab;
            })
        ];
    }, [searchedAssessments, assignedCount]);

    // Filter by selected tab
    const filteredAssessments = useMemo(() => {
        if (tabs === "All") return searchedAssessments;
        return searchedAssessments.filter((item) => item.status === tabs);
    }, [searchedAssessments, tabs]);

    const handleOpenAssessment = (assessment: Assessment) => {
        if (assessment.type === "CMA") {
            router.push({
                pathname: "/(mentor)/assessments/cma-survey-page" as any,
                params: { assessmentId: assessment.id },
            });
        } else {
            router.push({
                pathname: "/(mentor)/assessments/(pmp)/pmp-survey-page" as any,
                params: { assessmentId: assessment.id },
            });
        }
    };

    const handleMenuPress = (assessment: Assessment) => {
        console.log("Menu pressed:", assessment);
        setSelectedAssessment(assessment);
        bottomSheetRef.current?.present();
    };

    const handleAssignTo = (assessment: Assessment) => {
        bottomSheetRef.current?.dismiss();
        router.push({
            pathname: "/(mentor)/assessments-v2/assign-to" as any,
            params: { assessmentId: assessment.id },
        });
    };

    const handleEditSurvey = (assessment: Assessment) => {
        bottomSheetRef.current?.dismiss();
        router.push({
            pathname: "/(mentor)/assessments-v2/edit-instructions" as any,
            params: { assessmentId: assessment.id },
        });
    };

    const handleDeleteSurvey = (assessment: Assessment) => {
        setAssessmentToDelete(assessment);
        setShowDeleteConfirmationModal(true);
    };

    const handleConfirmDelete = () => {
        if (!assessmentToDelete) return;
        
        setShowDeleteConfirmationModal(false);
        bottomSheetRef.current?.dismiss();
        
        deleteAssessmentMutation.mutate(assessmentToDelete.id, {
            onSuccess: () => {
                setShowDeleteSuccessModal(true);
                setAssessmentToDelete(null);
            },
            onError: (error) => {
                console.error('Failed to delete assessment:', error);
                setAssessmentToDelete(null);
                // You can add an Alert here if needed
            },
        });
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirmationModal(false);
        setAssessmentToDelete(null);
    };

    const handleDeleteSuccessModalClose = () => {
        setShowDeleteSuccessModal(false);
    };

    return (
        <LinearGradient colors={["#155C93", "#1B2B60"]} style={{ flex: 1 }}>
            <TopBar
                showUserName
                notifications={3}
                role="mentor"
            />

            <View style={{ paddingHorizontal: 16 }}>
                <View
                    style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
                >
                    <Pressable
                        onPress={() => router.back()}
                        hitSlop={10}
                        style={{ paddingRight: 8 }}
                    >
                        <Ionicons name="arrow-back" size={24} color="#E2E8F0" />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: "#E2E8F0", fontSize: 20, fontWeight: "700" }}>
                            Assessment
                        </Text>
                        <Text style={{ color: "#CFE7F5", fontSize: 12, marginTop: 2 }}>
                            Library
                        </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                        <View className="w-[30px] h-[30px] rounded-md justify-center items-center border-2 border-white/40">
                            <Pressable
                                hitSlop={8}
                                onPress={() =>
                                    router.push(
                                        "/(mentor)/assessments-v2/select-assessment" as any
                                    )
                                }
                            >
                                <Ionicons name="checkmark-outline" size={22} color="#E2E8F0" />
                            </Pressable>
                        </View>
                        <Pressable
                            className="p-1"
                            onPress={() =>
                                router.push("/(mentor)/assessments-v2/create-assessment" as any)
                            }
                        >
                            <View className="w-[30px] h-[30px] rounded-md justify-center items-center border-2 border-white/40">
                                <Ionicons name="add-outline" size={24} color="white" />
                            </View>
                        </Pressable>
                    </View>
                </View>

                <View style={{ marginTop: 14 }}>
                    <SearchBar
                        value={search}
                        onChangeValue={setSearch}
                        placeholder="Search"
                    />
                </View>

                {/* Avatars Row */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 14, gap: 14 }}
                >
                    {/* Library pill */}
                    <Pressable
                        onPress={() => setSelectedMentee(null)}
                        style={{ alignItems: "center", gap: 8 }}
                    >
                        <View
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                borderWidth: 3,
                                borderColor: "#8BD6FF",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#0D4C78",
                            }}
                        >
                            <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
                                Library
                            </Text>
                        </View>
                        <Text style={{ color: "#E2E8F0", fontSize: 12 }}>Library</Text>
                    </Pressable>

                    {mentees.map((m) => (
                        <Pressable
                            key={m.id}
                            onPress={() => setSelectedMentee(m.id)}
                            style={{ alignItems: "center", gap: 8 }}
                        >
                            <View
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 32,
                                    borderWidth: selectedMentee === m.id ? 3 : 0,
                                    borderColor: "#8BD6FF",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden",
                                    backgroundColor: "#0D4C78",
                                }}
                            >
                                <Image
                                    source={m.avatar}
                                    style={{ width: 64, height: 64, resizeMode: "cover" }}
                                />
                            </View>
                            <Text
                                style={{ color: "#E2E8F0", fontSize: 12 }}
                                numberOfLines={1}
                            >
                                {m.name}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Status Tabs - Only show when a mentee is selected */}
            {selectedMentee && (
                <View style={{ marginTop: 10, paddingHorizontal: 16 }}>
                    <TabSwitcher
                        tabs={availableTabs}
                        activeTab={tabs}
                        onChange={setTabs}
                    />
                </View>
            )}

            {/* Cards List */}
            <View style={{ flex: 1 }}>
                {isLoading && !isRefetching ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#E2E8F0" />
                        <Text style={styles.loadingText}>
                            Loading assessments...
                        </Text>
                    </View>
                ) : error && !assessments.length ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="alert-circle-outline" size={64} color="#E2E8F0" />
                        <Text style={styles.errorText}>Failed to load assessments</Text>
                        <Text style={styles.errorSubtext}>Pull down to retry</Text>
                    </View>
                ) : filteredAssessments.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons
                            name="document-text-outline"
                            size={64}
                            color="rgba(255,255,255,0.3)"
                        />
                        <Text style={styles.emptyText}>
                            {selectedMentee
                                ? assignedCount === 0
                                    ? "No assessments assigned to this mentee"
                                    : "No assessments found"
                                : search.trim()
                                    ? "No assessments found matching your search"
                                    : "No assessments available"}
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {search
                                ? "Try adjusting your search"
                                : selectedMentee
                                    ? assignedCount === 0
                                        ? "Assign assessments to view them here"
                                        : "Pull down to refresh"
                                    : "Create a new assessment to get started"}
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingHorizontal: 16,
                            paddingBottom: bottom + 20,
                        }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefetching}
                                onRefresh={handleRefresh}
                                tintColor="#fff"
                                colors={["#fff"]}
                                progressBackgroundColor="rgba(255,255,255,0.2)"
                                title="Pull to refresh"
                                titleColor="#fff"
                            />
                        }
                    >
                        {filteredAssessments.map((item, index) => (
                            <React.Fragment key={item.id}>
                                <AssessmentCard
                                    data={item}
                                    onPress={handleOpenAssessment}
                                    onMeetingPress={() => { }}
                                    onMeetingIconPress={() => { }}
                                    onCustomizedPress={() => { }}
                                    onMenuPress={() => handleMenuPress(item)}
                                />
                                {index < filteredAssessments.length - 1 && (
                                    <View style={styles.dividerWithMargin} />
                                )}
                            </React.Fragment>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Assessment Menu Bottom Sheet */}
            <AssessmentMenuBottomSheet
                ref={bottomSheetRef}
                assessment={selectedAssessment}
                onClose={() => setSelectedAssessment(null)}
                onAssignTo={handleAssignTo}
                onEditSurvey={handleEditSurvey}
                onDeleteSurvey={handleDeleteSurvey}
            />

            <DeleteConfirmationModal
                visible={showDeleteConfirmationModal}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
            />

            <AssessmentDeletedSuccessModal
                visible={showDeleteSuccessModal}
                onClose={handleDeleteSuccessModalClose}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    loadingText: {
        color: '#E2E8F0',
        fontSize: 16,
        marginTop: 12,
    },
    errorText: {
        color: '#E2E8F0',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    errorSubtext: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginTop: 8,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 60,
    },
    emptyText: {
        color: '#E2E8F0',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtext: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    dividerWithMargin: {
        height: 0.5,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginVertical: 16,
    },
});
