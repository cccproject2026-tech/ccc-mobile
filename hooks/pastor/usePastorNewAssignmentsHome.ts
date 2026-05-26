import {
  formatAssignmentDateTime,
  getAssessmentAssignmentSortTs,
  getRoadmapAssignmentSortTs,
  isNewlyAssignedAssessment,
  isNewlyAssignedRoadmapCandidate,
  NewAssignmentHomeItem,
} from "@/lib/pastor/newAssignments";
import type { Roadmap } from "@/lib/roadmap/types";
import type { Assessment } from "@/types/assessment.types";
import {
  loadNewAssignmentViews,
  markNewAssignmentViewed,
  shouldShowNewAssignmentOnHome,
} from "@/utils/pastorNewAssignmentViews";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

export function usePastorNewAssignmentsHome(
  userId: string | undefined,
  roadmaps: Roadmap[] | undefined,
  assessments: Assessment[],
) {
  const [viewedAtByKey, setViewedAtByKey] = useState<Record<string, number>>({});

  const refreshViews = useCallback(async () => {
    if (!userId) {
      setViewedAtByKey({});
      return;
    }
    const map = await loadNewAssignmentViews(userId);
    setViewedAtByKey(map);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      refreshViews();
    }, [refreshViews]),
  );

  const candidates = useMemo<NewAssignmentHomeItem[]>(() => {
    const items: NewAssignmentHomeItem[] = [];

    for (const roadmap of roadmaps ?? []) {
      if (!isNewlyAssignedRoadmapCandidate(roadmap)) continue;
      const sortTs = getRoadmapAssignmentSortTs(roadmap);
      items.push({
        kind: "roadmap",
        id: String(roadmap._id),
        title: roadmap.name || "Roadmap phase",
        sortTs,
        assignedLabel: formatAssignmentDateTime(sortTs),
        roadmap,
      });
    }

    for (const assessment of assessments) {
      if (!isNewlyAssignedAssessment(assessment)) continue;
      const sortTs = getAssessmentAssignmentSortTs(assessment);
      items.push({
        kind: "assessment",
        id: assessment.id,
        title: assessment.title,
        sortTs,
        assignedLabel: formatAssignmentDateTime(sortTs),
        assessment,
      });
    }

    return items.sort((a, b) => b.sortTs - a.sortTs);
  }, [roadmaps, assessments]);

  const visibleItems = useMemo(
    () =>
      candidates.filter((item) => {
        const viewedAt = viewedAtByKey[`${item.kind}:${item.id}`];
        return shouldShowNewAssignmentOnHome(viewedAt);
      }),
    [candidates, viewedAtByKey],
  );

  const dismissAll = useCallback(async () => {
    if (!userId || visibleItems.length === 0) return;
    for (const item of visibleItems) {
      await markNewAssignmentViewed(userId, item.kind, item.id);
    }
    await refreshViews();
  }, [userId, visibleItems, refreshViews]);

  return {
    visibleItems,
    hasNewAssignments: visibleItems.length > 0,
    refreshViews,
    dismissAll,
  };
}