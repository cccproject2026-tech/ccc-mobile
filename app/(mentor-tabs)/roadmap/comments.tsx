import TopBar from "@/components/director/TopBar";
import { Button } from "@/components/build-components";
import TextAreaField from "@/components/build-components/text-area";
import { primary_color } from "@/constants/Colors";
import { useAddRoadmapComment, useRoadmapComments } from "@/hooks/roadmaps/useRoadmaps";
import { resolveRoadmapThreadId } from "@/lib/roadmap/helpers";
import { paramToString } from "@/utils/routerParams";
import { RoadmapComment } from "@/lib/roadmap/types";
import { useAuthStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import KeyboardSafeContainer from "@/components/layout/KeyboardSafeContainer";

export default function CommentsScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [commentText, setCommentText] = useState("");
    const commentInputRef = useRef<TextInput>(null);

    const dismissCommentKeyboard = () => {
        commentInputRef.current?.blur();
        Keyboard.dismiss();
    };

    const params = useLocalSearchParams<{
        roadmapId?: string | string[];
        taskId?: string | string[];
        phaseId?: string | string[];
    }>();
    const threadRoadmapId = resolveRoadmapThreadId(
        paramToString(params.taskId) ?? paramToString(params.roadmapId),
        paramToString(params.phaseId),
    );

    const { data, isLoading } = useRoadmapComments(threadRoadmapId, user?.id!);
    const comments = data?.comments ?? [];

    const addCommentMutation = useAddRoadmapComment();

    const formatTimestamp = (timestamp: string): string => {
        const commentDate = new Date(timestamp);
        const now = new Date();
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const commentMidnight = new Date(
            commentDate.getFullYear(),
            commentDate.getMonth(),
            commentDate.getDate()
        );
        const yesterdayMidnight = new Date(todayMidnight);
        yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);

        if (commentMidnight.getTime() === todayMidnight.getTime()) {
            const hours = commentDate.getHours();
            const minutes = commentDate.getMinutes();
            const ampm = hours >= 12 ? "pm" : "am";
            const displayHours = hours % 12 || 12;
            const displayMinutes = minutes.toString().padStart(2, "0");
            return `${displayHours}:${displayMinutes} ${ampm}`;
        }

        if (commentMidnight.getTime() === yesterdayMidnight.getTime()) {
            return "Yesterday";
        }

        const month = (commentDate.getMonth() + 1).toString().padStart(2, "0");
        const day = commentDate.getDate().toString().padStart(2, "0");
        const year = commentDate.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const handleSubmitComment = async () => {
        if (!commentText.trim()) {
            Alert.alert("Error", "Please enter a comment");
            return;
        }

        if (!threadRoadmapId || !user?.id) {
            Alert.alert("Error", "Missing required information");
            return;
        }

        dismissCommentKeyboard();

        try {
            await addCommentMutation.mutateAsync({
                roadmapId: threadRoadmapId,
                payload: {
                    text: commentText.trim(),
                    userId: user.id,
                    mentorId: user.id, // For mentor, mentorId is the same as userId
                },
            });

            setCommentText("");
            dismissCommentKeyboard();
        } catch (error) {
            console.error("Error adding comment:", error);
            Alert.alert("Error", "Failed to add comment. Please try again.");
        }
    };

    const renderComment = ({ item }: { item: RoadmapComment }) => (
        <View style={styles.commentCard}>
            <View style={styles.rowContainer}>
                <Image
                    source={{ uri: item.mentorId.profilePicture || undefined }}
                    style={styles.avatar}
                />
                <View style={styles.contentContainer}>
                    <View style={styles.contentHeader}>
                        <Text style={styles.authorName} numberOfLines={1}>
                            {item.mentorId.firstName} {item.mentorId.lastName} ({item.mentorId.role})
                        </Text>
                    </View>

                    <Text style={styles.commentText}>{item.text}</Text>

                    <View style={styles.footerRow}>
                        <View style={styles.actionIcons}>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="call-outline" size={18} color="#FFFFFF" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="chatbubble-outline" size={18} color="#FFFFFF" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="mail-outline" size={18} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.timestamp}>
                            {formatTimestamp(item.addedDate)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <AppGradientBackground style={{ flex: 1 }}>
            <View style={{ paddingBottom: 10 }}>
                <TopBar role="mentor" showUserName />
            </View>

            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.headerTextWrapper}>
                        <Text style={styles.headerTitle}>Comments</Text>
                        <Text style={styles.headerSubtitle}>Revitalization Roadmap</Text>
                    </View>
                </View>
            </View>

            <KeyboardSafeContainer
                mode="avoid"
                style={{ flex: 1 }}
                keyboardVerticalOffset={100}
            >
                <View style={{ flex: 1 }}>
                    {/* Comment Input Section */}
                    <View style={styles.inputSection}>
                        <TextAreaField
                            ref={commentInputRef}
                            label="Add a comment..."
                            value={commentText}
                            onChangeText={setCommentText}
                            inputClass={{ backgroundColor: primary_color }}
                            numberOfLines={4}
                            blurOnSubmit
                            returnKeyType="done"
                        />
                        <View style={styles.submitButtonContainer}>
                            <Button
                                onPress={handleSubmitComment}
                                wrapperClass="max-w-[200px] w-[200px] mx-auto"
                                buttonClass="!w-[200px] !h-11"
                                variant="secondary"
                                disabled={addCommentMutation.isPending || !commentText.trim()}
                            >
                                {addCommentMutation.isPending ? (
                                    <ActivityIndicator size="small" color="#1A4882" />
                                ) : (
                                    "Submit"
                                )}
                            </Button>
                        </View>
                    </View>

                    {/* Comments List */}
                    <View style={styles.commentsHeader}>
                        <Text style={styles.commentsHeaderText}>All Comments</Text>
                    </View>

                    <FlatList
                        data={comments}
                        renderItem={renderComment}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>
                                    {isLoading ? "Loading..." : "No comments yet"}
                                </Text>
                            </View>
                        }
                    />
                </View>
            </KeyboardSafeContainer>
        </AppGradientBackground>
    );
}

const styles = StyleSheet.create({
    listContainer: {
        padding: 16,
        paddingTop: 0,
    },
    headerContainer: {
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.2)",
        marginBottom: 20,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerTextWrapper: {
        marginLeft: 10,
    },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "700",
        lineHeight: 24,
    },
    headerSubtitle: {
        marginTop: 4,
        color: "rgba(255,255,255,0.8)",
        fontSize: 14,
        lineHeight: 18,
    },
    inputSection: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.2)",
    },
    submitButtonContainer: {
        marginTop: 16,
        alignItems: "center",
    },
    commentsHeader: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    commentsHeaderText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    commentCard: {
        backgroundColor: "rgba(26, 72, 130, 1)",
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: "rgba(255, 255, 255, 0.35)",
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    unreadCard: {
        borderColor: "rgba(255, 255, 255, 0.45)",
    },
    rowContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#E0E0E0",
        marginRight: 12,
        marginTop: 4,
    },
    contentContainer: {
        flex: 1,
    },
    contentHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    authorName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        lineHeight: 20,
        flex: 1,
        marginRight: 8,
    },
    unreadDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#FFD700",
    },
    commentText: {
        fontSize: 14,
        color: "#FFFFFF",
        lineHeight: 20,
        marginTop: 6,
        marginBottom: 8,
        fontWeight: "400",
    },
    footerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    actionIcons: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconButton: {
        marginRight: 12,
        padding: 4,
    },
    timestamp: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.65)",
        fontWeight: "400",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.5)",
        fontWeight: "400",
    },
});
