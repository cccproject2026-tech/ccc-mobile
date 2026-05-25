import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import type { NestedRoadmap } from "@/lib/roadmap/types";
import { normalizeNestedTaskStatus } from "@/lib/roadmap/helpers";
import { getRelativeDueDate } from "@/utils/date";
import { DueDateIndicator } from "./DueDateIndicator";
import { ResubmittedBadge } from "./ResubmittedBadge";

interface Props {
    task: NestedRoadmap;
    variant?: "pastor" | "mentor";
}

export const TaskStatusBadges = memo(function TaskStatusBadges({
    task,
    variant = "pastor",
}: Props) {
    const isCompleted = normalizeNestedTaskStatus(task.status) === "completed";
    const effectiveDueDate = task.dueDate ?? task.endDate;
    const dueDateStatus = getRelativeDueDate(effectiveDueDate, isCompleted);
    const showDueDate = dueDateStatus.status !== "none";
    const showResubmitted = !!task.isResubmitted;

    if (!showDueDate && !showResubmitted) return null;

    return (
        <View style={styles.row}>
            {showResubmitted && (
                <ResubmittedBadge
                    isResubmitted={task.isResubmitted}
                    resubmittedAt={task.resubmittedAt}
                    variant={variant}
                />
            )}
            {showDueDate && (
                <DueDateIndicator dueDateStatus={dueDateStatus} compact />
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 8,
    },
});
