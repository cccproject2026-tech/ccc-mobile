import TopBar from "@/components/director/TopBar";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { SubmissionHistoryList } from "@/components/roadmaps/SubmissionHistoryList";
import { SubmissionDetailView } from "@/components/roadmaps/SubmissionDetailView";
import { useRoadmapExtrasWithFallback } from "@/hooks/roadmaps/useRoadmaps";
import { useLatestSubmission } from "@/hooks/roadmap/useTaskSubmissions";
import type { TaskSubmission } from "@/lib/roadmap/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MentorSubmissionHistoryScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const { roadmapId, taskId, taskName, menteeId, menteeName } = useLocalSearchParams<{
        roadmapId: string;
        taskId: string;
        taskName?: string;
        menteeId: string;
        menteeName?: string;
    }>();

    const userId = menteeId;

    const { data: latestSubmission } = useLatestSubmission(roadmapId, taskId, userId);
    const { data: existingExtras } = useRoadmapExtrasWithFallback(roadmapId, taskId, userId);

    const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmission | null>(null);

    const handleSelectSubmission = useCallback((sub: TaskSubmission) => {
        setSelectedSubmission(sub);
    }, []);

    const handleBackFromDetail = useCallback(() => {
        setSelectedSubmission(null);
    }, []);

    return (
        <AppGradientBackground style={styles.root}>
            <TopBar role="mentor" showUserName />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[styles.content, { paddingBottom: bottom + 40 }]}
                showsVerticalScrollIndicator={false}
            >
                {}
                <View style={styles.headerRow}>
                    <Pressable
                        onPress={() => {
                            if (selectedSubmission) {
                                handleBackFromDetail();
                            } else {
                                router.back();
                            }
                        }}
                        hitSlop={10}
                        style={styles.backBtn}
                    >
                        <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.92)" />
                    </Pressable>
                    <View style={styles.headerTextWrap}>
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {selectedSubmission
                                ? `Submission #${selectedSubmission.submissionNumber}`
                                : "Submission History"}
                        </Text>
                        {selectedSubmission ? (
                            <Text style={styles.headerSubtitle} numberOfLines={1}>
                                {new Date(selectedSubmission.submittedAt).toLocaleDateString("en-US", {
                                    day: "2-digit", month: "short", year: "numeric",
                                })}
                            </Text>
                        ) : (taskName || menteeName) ? (
                            <Text style={styles.headerSubtitle} numberOfLines={1}>
                                {[taskName, menteeName ? `by ${menteeName}` : ""]
                                    .filter(Boolean)
                                    .join(" — ")}
                            </Text>
                        ) : null}
                    </View>
                </View>

                {selectedSubmission ? (
                    <SubmissionDetailView
                        submission={selectedSubmission}
                        onClose={handleBackFromDetail}
                        hideHeader
                    />
                ) : (
                    roadmapId && taskId && userId && (
                        <SubmissionHistoryList
                            roadMapId={roadmapId}
                            nestedRoadMapItemId={taskId}
                            userId={userId}
                            onSelectSubmission={handleSelectSubmission}
                            latestSubmissionId={latestSubmission?._id}
                            legacyExtras={existingExtras ?? undefined}
                        />
                    )
                )}
            </ScrollView>
        </AppGradientBackground>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 20,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.08)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTextWrap: {
        flex: 1,
        gap: 2,
    },
    headerTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "800",
    },
    headerSubtitle: {
        color: "rgba(255,255,255,0.55)",
        fontSize: 13,
        fontWeight: "600",
    },
});
