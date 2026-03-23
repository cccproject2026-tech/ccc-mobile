import TopBar from "@/components/director/TopBar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import { useRoadmapComments } from "@/hooks/roadmaps/useRoadmaps";
import { RoadmapComment } from "@/lib/roadmap/types";
import { useAuthStore } from "@/stores";
import { icons } from "@/constants/images";
import { paramToString } from "@/utils/routerParams";


export default function CommentsScreen() {
    const router = useRouter();
    const { user } = useAuthStore();

    const params = useLocalSearchParams<{ roadmapId?: string | string[] }>();
    const phaseId = paramToString(params.roadmapId);
    const userId = user?.id;

    const { data, isLoading, isError, error, refetch, isFetching } = useRoadmapComments(
        phaseId,
        userId,
    );
    const comments = Array.isArray(data?.comments) ? data!.comments : [];

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

    const renderComment = ({ item }: { item: RoadmapComment }) => {
        const author = item.mentorId;
        const pic = author?.profilePicture?.trim();
        return (
        <View style={styles.commentCard}>
            <View style={styles.rowContainer}>
                <Image
                    source={pic ? { uri: pic } : icons.myProfile}
                    style={styles.avatar}
                />
                <View style={styles.contentContainer}>
                    <View style={styles.contentHeader}>
                        <Text style={styles.authorName} numberOfLines={1}>
                            {author
                                ? `${[author.firstName, author.lastName].filter(Boolean).join(" ")}${author.role ? ` (${author.role})` : ""}`.trim() || "Mentor"
                                : "Mentor"}
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
    };

    return (
        <LinearGradient colors={["#176192", "#1D548D", "#264387"]} style={{ flex: 1 }}>
            <View style={{ paddingBottom: 10 }}>
                <TopBar role="pastor" showUserName />
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

            <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching}
                        onRefresh={() => refetch()}
                        tintColor="#fff"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {!phaseId || !userId
                                ? "Missing roadmap or user. Go back and open Comments from a roadmap task."
                                : isLoading || isFetching
                                  ? "Loading..."
                                  : isError
                                    ? ((error as Error)?.message || "Could not load comments. Pull to refresh.")
                                    : "No comments yet"}
                        </Text>
                    </View>
                }
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    listContainer: {
        padding: 16,
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
