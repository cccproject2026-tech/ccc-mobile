import { mapApiToFrontend } from "@/lib/assessments/mappers";
import {
  completionDatesFromAnswers,
  resolveAssessmentDisplayStatus,
} from "@/lib/assessments/status";
import { useAuthStore } from "@/stores/auth.store";
import type { Assessment } from "@/types/assessment.types";
import { useMemo } from "react";
import { useAssessmentProgress } from "../progress/useProgress";
import { useAssessmentAnswersMap } from "./useAssessmentAnswersMap";
import { useAssessments } from "./useAssessments";

/**
 * Hook to get only assessments assigned to the current user with progress status
 */
export const useAssignedAssessments = (userId?: string) => {
  const { user } = useAuthStore();
  const targetUserId = userId || user?.id;

  const {
    data: allAssessments,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useAssessments();

  const { data: assessmentProgress, isLoading: isLoadingProgress } =
    useAssessmentProgress(userId);

  const progressMap = useMemo(() => {
    const map = new Map();
    assessmentProgress?.items?.forEach((item) => {
      map.set(item.assessmentId, item);
    });
    return map;
  }, [assessmentProgress]);

  const assignedAssessmentIds = useMemo(() => {
    if (!allAssessments || !targetUserId) return [];
    return allAssessments
      .filter((assessment) => {
        if (progressMap.has(assessment._id)) return true;
        return assessment.assignments?.some((a) => a.userId === targetUserId);
      })
      .map((a) => a._id);
  }, [allAssessments, progressMap, targetUserId]);

  const { answersMap, isLoadingAnswers } = useAssessmentAnswersMap(
    assignedAssessmentIds,
    targetUserId,
    !!targetUserId && assignedAssessmentIds.length > 0,
  );

  const assignedAssessments = useMemo(() => {
    if (!allAssessments) return [];

    const filtered = allAssessments.filter((assessment) =>
      assignedAssessmentIds.includes(assessment._id),
    );

    return filtered.map((apiAssessment) => {
      const frontendAssessment = mapApiToFrontend(apiAssessment);
      const progress = progressMap.get(apiAssessment._id);
      const answerDoc = answersMap.get(apiAssessment._id);
      const userAssignment = targetUserId
        ? apiAssessment.assignments?.find((a) => a.userId === targetUserId)
        : apiAssessment.assignments?.[0];
      const assignedAt = userAssignment?.assignedAt;
      const expectedSections =
        progress?.totalSections ?? apiAssessment.sections?.length ?? 0;

      const { status, isInProgress } = resolveAssessmentDisplayStatus({
        progressStatus: progress?.status,
        answerSections: answerDoc?.sections,
        expectedSectionCount: expectedSections,
        completedSections: progress?.completedSections,
        totalSections: progress?.totalSections,
      });

      const dates =
        status === "Submitted" || status === "Completed"
          ? completionDatesFromAnswers(answerDoc)
          : {};

      return {
        ...frontendAssessment,
        assignedAt: assignedAt ?? frontendAssessment.assignedAt,
        updatedAt: apiAssessment.updatedAt,
        status,
        isInProgress,
        progressPercentage: progress?.progressPercentage,
        completedSections: progress?.completedSections,
        totalSections: progress?.totalSections,
        ...dates,
      } satisfies Assessment;
    });
  }, [
    allAssessments,
    assignedAssessmentIds,
    progressMap,
    targetUserId,
    answersMap,
  ]);

  return {
    data: assignedAssessments,
    isLoading: isLoading || isLoadingProgress || isLoadingAnswers,
    error,
    refetch,
    isRefetching,
    assignedCount: assignedAssessments.length,
  };
};
