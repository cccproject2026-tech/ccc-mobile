import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatRelativeTimestamp } from "@/utils/date";

interface Props {
    isResubmitted?: boolean;
    resubmittedAt?: string | null;
    variant?: "pastor" | "mentor";
}

export const ResubmittedBadge = memo(function ResubmittedBadge({
    isResubmitted,
    resubmittedAt,
    variant = "pastor",
}: Props) {
    if (!isResubmitted) return null;

    const relativeLabel = variant === "mentor"
        ? formatRelativeTimestamp(resubmittedAt, "Recently updated")
        : null;

    return (
        <View style={styles.container}>
            <View style={styles.badge}>
                <Ionicons name="refresh-outline" size={13} color="#D97706" />
                <Text style={styles.badgeText}>Resubmitted</Text>
            </View>
            {relativeLabel ? (
                <Text style={styles.timestamp}>{relativeLabel}</Text>
            ) : null}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        backgroundColor: "rgba(251, 191, 36, 0.14)",
    },
    badgeText: {
        color: "#FBBF24",
        fontSize: 12,
        fontWeight: "700",
    },
    timestamp: {
        color: "rgba(255,255,255,0.55)",
        fontSize: 11,
        fontWeight: "600",
    },
});
