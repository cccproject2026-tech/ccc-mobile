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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function usePastorNewAssignmentsHome(
  userId: string | undefined,
  roadmaps: Roadmap[] | undefined,
  assessments: Assessment[],
) {
  const [viewedAtByKey, setViewedAtByKey] = useState<Record<string, number>>({});
  const markedThisSessionRef = useRef<Set<string>>(new Set());

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

  const visibleIdsKey = useMemo(
    () => visibleItems.map((i) => `${i.kind}:${i.id}`).join(","),
    [visibleItems],
  );

  useEffect(() => {
    if (!userId || visibleItems.length === 0) return;

    let cancelled = false;
    const markSeen = async () => {
      for (const item of visibleItems) {
        const sessionKey = `${item.kind}:${item.id}`;
        if (markedThisSessionRef.current.has(sessionKey)) continue;
        markedThisSessionRef.current.add(sessionKey);
        await markNewAssignmentViewed(userId, item.kind, item.id);
      }
      if (!cancelled) await refreshViews();
    };

    markSeen().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId, visibleIdsKey, visibleItems, refreshViews]);

  return {
    visibleItems,
    hasNewAssignments: visibleItems.length > 0,
    refreshViews,
  };
}