import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { RoadmapMetaInfo } from "@/hooks/roadmap/useRoadmapMeta";

interface Props {
    meta: RoadmapMetaInfo;
}

export const RoadmapMetaCard = memo(function RoadmapMetaCard({ meta }: Props) {
    if (!meta.hasMetadata) return null;

    const hasDueDate = meta.dueDateStatus.status !== "none";
    const thirdLabel = hasDueDate ? "Due Date" : "Completion Time";
    const thirdValue = hasDueDate ? meta.dueDateLabel : (meta.completionTime ?? "\u2014");
    const thirdIcon: keyof typeof Ionicons.glyphMap = hasDueDate ? "time-outline" : "hourglass-outline";

    return (
        <View style={styles.card}>
            <View style={styles.row}>
                {meta.hasAssignedBy && (
                    <MetaCell
                        icon="person-outline"
                        label="Assigned By"
                        value={meta.assignedByName}
                        style={styles.cellFlex}
                    />
                )}
                <MetaCell
                    icon="calendar-outline"
                    label="Assigned On"
                    value={meta.assignedOnLabel}
                    style={styles.cellFlex}
                />
                <MetaCell
                    icon={thirdIcon}
                    label={thirdLabel}
                    value={thirdValue}
                    style={styles.cellFlex}
                />
            </View>
        </View>
    );
});

function MetaCell({
    icon,
    label,
    value,
    style,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    style?: object;
}) {
    return (
        <View style={[styles.cell, style]}>
            <View style={styles.iconWrap}>
                <Ionicons name={icon} size={14} color="#7EC8FF" />
            </View>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value} numberOfLines={1}>
                {value}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "rgba(255,255,255,0.07)",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        paddingVertical: 12,
        paddingHorizontal: 14,
        gap: 8,
        marginBottom: 12,
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    cellFlex: {
        flex: 1,
    },
    cell: {
        gap: 3,
    },
    iconWrap: {
        width: 26,
        height: 26,
        borderRadius: 9,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(126, 200, 255, 0.12)",
        marginBottom: 1,
    },
    label: {
        color: "rgba(255,255,255,0.55)",
        fontSize: 10,
        fontWeight: "600",
        letterSpacing: 0.3,
        textTransform: "uppercase",
    },
    value: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700",
    },
});
