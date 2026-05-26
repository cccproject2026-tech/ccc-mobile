import { mapApiToFrontend } from "@/lib/assessments/mappers";
import { useAuthStore } from "@/stores/auth.store";
import type { Assessment } from "@/types/assessment.types";
import { useMemo } from "react";
import { useAssessmentProgress } from "../progress/useProgress";
import { useAssessments } from "./useAssessments";

/**
 * Hook to get only assessments assigned to the current user with progress status
 */
export const useAssignedAssessments = (userId?: string) => {
  const { user } = useAuthStore();
  const targetUserId = userId || user?.id;

  // Fetch all assessments
  const {
    data: allAssessments,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useAssessments();

  // Fetch user's progress data
  const { data: assessmentProgress, isLoading: isLoadingProgress } =
    useAssessmentProgress(userId);

  // Get array of assigned assessment progress items
  const progressMap = useMemo(() => {
    const map = new Map();
    assessmentProgress?.items?.forEach((item) => {
      map.set(item.assessmentId, item);
    });
    return map;
  }, [assessmentProgress]);

  // Get array of assigned assessment IDs
  const assignedAssessmentIds = useMemo(() => {
    return Array.from(progressMap.keys());
  }, [progressMap]);

  // Map progress status to frontend status
  const mapProgressToStatus = (
    progressStatus?: string,
  ): Assessment["status"] => {
    switch (progressStatus) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "Submitted"; // Or 'In Progress' if you want to add that status
      case "not_started":
      default:
        return "Not Started";
    }
  };

  // Filter and map assessments with progress data
  const assignedAssessments = useMemo(() => {
    if (!allAssessments) return [];

    // Filter assessments assigned to this user (by progress record OR assignments array)
    const filtered = allAssessments.filter((assessment) => {
      if (assignedAssessmentIds.includes(assessment._id)) return true;
      if (targetUserId && assessment.assignments?.some((a) => a.userId === targetUserId)) return true;
      return false;
    });

    // Map to frontend format and merge with progress data
    return filtered.map((apiAssessment) => {
      const frontendAssessment = mapApiToFrontend(apiAssessment);
      const progress = progressMap.get(apiAssessment._id);
      const userAssignment = targetUserId
        ? apiAssessment.assignments?.find((a) => a.userId === targetUserId)
        : apiAssessment.assignments?.[0];
      const assignedAt = userAssignment?.assignedAt;
      const withDates = {
        ...frontendAssessment,
        assignedAt: assignedAt ?? frontendAssessment.assignedAt,
        updatedAt: apiAssessment.updatedAt,
      };

      // Override status with progress data
      if (progress) {
        return {
          ...withDates,
          status: mapProgressToStatus(progress.status),
          progressPercentage: progress.progressPercentage,
          completedSections: progress.completedSections,
          totalSections: progress.totalSections,
        };
      }

      return withDates;
    });
  }, [allAssessments, assignedAssessmentIds, progressMap, targetUserId]);

  return {
    data: assignedAssessments,
    isLoading: isLoading || isLoadingProgress,
    error,
    refetch,
    isRefetching,
    assignedCount: assignedAssessments.length,
  };
};
