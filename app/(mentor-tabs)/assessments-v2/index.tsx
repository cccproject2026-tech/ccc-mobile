import AssessmentDeletedSuccessModal from "@/components/build-components/AssessmentDeletedSuccessModal";
import AssessmentMenuBottomSheet from "@/components/build-components/AssessmentMenuBottomSheet";
import AssessmentCard from "@/components/build-components/cards/assessment-card";
import DeleteConfirmationModal from "@/components/build-components/DeleteConfirmationModal";
import SearchBar from "@/components/director/SearchBar";
import TopBar from "@/components/director/TopBar";
import { menteeProfiles } from "@/constants/mockMentees";
import { useAssessments, useDeleteAssessment } from "@/hooks/assessments";
import { ApiAssessment, Assessment } from "@/lib/assessments/types";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Helper function to map API assessment to component Assessment type
const mapApiAssessmentToAssessment = (apiAssessment: ApiAssessment): Assessment => {
    // Infer type from name or default to 'PMP'
    const inferType = (name: string): 'CMA' | 'PMP' => {
        const nameLower = name.toLowerCase();
        if (nameLower.includes('cma') || nameLower.includes('church')) {
            return 'CMA';
        }
        return 'PMP';
    };

    return {
        id: apiAssessment._id,
        type: inferType(apiAssessment.name),
        title: apiAssessment.name,
        description: apiAssessment.description,
        status: 'Not Started' as const,
        guidelines: apiAssessment.instructions,
        sections: apiAssessment.sections.map((section) => ({
            title: section.title,
            subtitle: section.description,
            questionGroups: section.layers.map((layer) => ({
                id: layer._id,
                questions: [
                    {
                        id: layer._id,
                        text: layer.title, // Layer title is the question
                        type: 'radio' as const,
                        options: layer.choices.map((c) => ({
                            label: c.text,
                            value: c._id,
                        })),
                        required: false,
                    },
                ],
            })),
        })),
    };
};

export default function MentorAssessmentsLibrary() {
    const { bottom } = useSafeAreaInsets();
    const router = useRouter();

    const [search, setSearch] = React.useState("");
    const [selectedMentee, setSelectedMentee] = React.useState<string | null>(
        null
    );
    const [selectedAssessment, setSelectedAssessment] =
        React.useState<Assessment | null>(null);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = React.useState(false);
    const [showDeleteSuccessModal, setShowDeleteSuccessModal] = React.useState(false);
    const [assessmentToDelete, setAssessmentToDelete] = React.useState<Assessment | null>(null);
    const bottomSheetRef = React.useRef<BottomSheetModal>(null);

    const mentees = React.useMemo(() => Object.values(menteeProfiles), []);

    // Use TanStack Query hooks
    const { data: apiAssessments, isLoading: loading, error: queryError, refetch } = useAssessments();
    const deleteAssessmentMutation = useDeleteAssessment();

    // Refetch when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    // Map API assessments to component Assessment type
    const assessments = useMemo(() => {
        if (!apiAssessments) return [];
        return apiAssessments.map(mapApiAssessmentToAssessment);
    }, [apiAssessments]);

    const error = queryError ? 'Failed to load assessments. Please try again.' : null;

    const filteredAssessments = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        if (q.length === 0) return assessments;
        return assessments.filter(
            (a) =>
                a.title.toLowerCase().includes(q) ||
                a.description.toLowerCase().includes(q)
        );
    }, [search, assessments]);

    const handleOpenAssessment = (assessment: Assessment) => {
        if (assessment.type === "CMA") {
            router.push({
                pathname: "/(mentor-tabs)/assessments/cma-survey-page",
                params: { assessmentId: assessment.id },
            });
        } else {
            router.push({
                pathname: "/(mentor-tabs)/assessments/(pmp)/pmp-survey-page",
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
            pathname: "/(mentor-tabs)/assessments-v2/assign-to",
            params: { assessmentId: assessment.id },
        });
    };

    const handleEditSurvey = (assessment: Assessment) => {
        bottomSheetRef.current?.dismiss();
        router.push({
            pathname: "/(mentor-tabs)/assessments-v2/edit-instructions" as any,
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
                userName="John Doe"
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
                                        "/(mentor-tabs)/assessments-v2/select-assessment"
                                    )
                                }
                            >
                                <Ionicons name="checkmark-outline" size={22} color="#E2E8F0" />
                            </Pressable>
                        </View>
                        <Pressable
                            className="p-1"
                            onPress={() =>
                                router.push("/(mentor-tabs)/assessments-v2/create-assessment")
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

            {/* Cards List */}
            <View style={{ flex: 1 }}>
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#E2E8F0" />
                        <Text style={{ color: '#E2E8F0', marginTop: 12 }}>
                            Loading assessments...
                        </Text>
                    </View>
                ) : error ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
                        <Text style={{ color: '#FF6B6B', fontSize: 16, textAlign: 'center', marginBottom: 12 }}>
                            {error}
                        </Text>
                        <Pressable
                            onPress={() => refetch()}
                            style={{
                                backgroundColor: '#5EB3D1',
                                paddingHorizontal: 24,
                                paddingVertical: 12,
                                borderRadius: 8,
                            }}
                        >
                            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                                Retry
                            </Text>
                        </Pressable>
                    </View>
                ) : filteredAssessments.length === 0 ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
                        <Text style={{ color: '#E2E8F0', fontSize: 16, textAlign: 'center' }}>
                            {search.trim() ? 'No assessments found matching your search.' : 'No assessments available.'}
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
                    >
                        {filteredAssessments.map((item) => (
                            <View key={item.id} style={{ marginBottom: 16 }}>
                                <AssessmentCard
                                    data={item}
                                    onPress={handleOpenAssessment}
                                    onMeetingPress={() => { }}
                                    onMeetingIconPress={() => { }}
                                    onCustomizedPress={() => { }}
                                    onMenuPress={() => handleMenuPress(item)}
                                />
                            </View>
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
