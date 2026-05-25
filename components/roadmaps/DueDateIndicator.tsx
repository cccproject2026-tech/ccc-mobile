import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { RelativeDueDate } from "@/utils/date";

interface Props {
    dueDateStatus: RelativeDueDate;
    compact?: boolean;
}

const statusColors = {
    upcoming: { bg: "rgba(126, 200, 255, 0.12)", text: "#7EC8FF", icon: "#7EC8FF" },
    "due-soon": { bg: "rgba(251, 191, 36, 0.14)", text: "#FCD34D", icon: "#FBBF24" },
    overdue: { bg: "rgba(248, 113, 113, 0.14)", text: "#FCA5A5", icon: "#F87171" },
    none: { bg: "rgba(255,255,255,0.07)", text: "rgba(255,255,255,0.55)", icon: "rgba(255,255,255,0.4)" },
} as const;

export const DueDateIndicator = memo(function DueDateIndicator({
    dueDateStatus,
    compact = false,
}: Props) {
    const palette = statusColors[dueDateStatus.status];

    if (compact) {
        return (
            <View style={[styles.compactBadge, { backgroundColor: palette.bg }]}>
                <Ionicons name="time-outline" size={12} color={palette.icon} />
                <Text style={[styles.compactText, { color: palette.text }]} numberOfLines={1}>
                    {dueDateStatus.label}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.cell}>
            <View style={[styles.iconWrap, { backgroundColor: palette.bg }]}>
                <Ionicons name="time-outline" size={14} color={palette.icon} />
            </View>
            <Text style={styles.label}>Due Date</Text>
            <Text style={[styles.value, { color: palette.text }]} numberOfLines={1}>
                {dueDateStatus.label}
            </Text>
        </View>
    );
});

const styles = StyleSheet.create({
    cell: {
        gap: 4,
    },
    iconWrap: {
        width: 28,
        height: 28,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    label: {
        color: "rgba(255,255,255,0.55)",
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 0.3,
        textTransform: "uppercase",
    },
    value: {
        fontSize: 14,
        fontWeight: "700",
    },
    compactBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    compactText: {
        fontSize: 12,
        fontWeight: "700",
    },
});
