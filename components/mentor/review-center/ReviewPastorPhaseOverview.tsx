import { useProgressByUserId } from "@/hooks/progress/useProgress";
import { mergeRoadmapWithProgress, useAllRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import type { ReviewItem } from "@/lib/mentor/reviewCenter.types";
import {
  buildAssessmentSummary,
  buildRoadmapPhaseSummaries,
  formatPhaseStatusLabel,
  type ReviewRoadmapPhaseSummary,
} from "@/lib/mentor/reviewCenterPhaseSummary";
import { getSingleNestedTaskId } from "@/lib/roadmap/helpers";
import { appendReturnTo } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  pastorId: string;
  pastorName: string;
  pastorItems: ReviewItem[];
  /** Current review-center screen href — passed to child routes for back navigation. */
  returnTo?: string;
};

function phaseStatusColor(status: ReviewRoadmapPhaseSummary["phaseStatus"]): string {
  switch (status) {
    case "completed":
      return "#22C55E";
    case "in-progress":
      return "#38BDF8";
    default:
      return "rgba(255,255,255,0.45)";
  }
}

function taskBreakdown(summary: ReviewRoadmapPhaseSummary): string {
  const parts: string[] = [];
  const { counts } = summary;
  if (counts.pending_review > 0) parts.push(`${counts.pending_review} to review`);
  if (counts.resubmitted > 0) parts.push(`${counts.resubmitted} resubmitted`);
  if (counts.reviewed > 0) parts.push(`${counts.reviewed} reviewed`);
  if (counts.not_started > 0) parts.push(`${counts.not_started} not started`);
  if (parts.length === 0) return "No tasks tracked";
  return parts.join(" · ");
}

export function ReviewPastorPhaseOverview({
  pastorId,
  pastorName,
  pastorItems,
  returnTo = "",
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAssessmentExpanded, setIsAssessmentExpanded] = useState(false);
  const router = useRouter();
  const { data: allRoadmaps } = useAllRoadmaps();
  const { data: progress } = useProgressByUserId(pastorId);

  const assignedRoadmaps = useMemo(() => {
    if (!allRoadmaps || !progress?.roadmaps?.items) return [];
    const assignedIds = progress.roadmaps.items.map((item) => String(item.roadMapId));
    return assignedIds
      .map((id) => {
        const roadmap = allRoadmaps.find((r) => String(r._id) === id);
        if (!roadmap) return null;
        const progressItem = progress.roadmaps.items.find(
          (p) => String(p.roadMapId) === id,
        );
        return mergeRoadmapWithProgress(roadmap, progressItem);
      })
      .filter((r): r is NonNullable<typeof r> => r != null);
  }, [allRoadmaps, progress]);

  const phaseSummaries = useMemo(
    () => buildRoadmapPhaseSummaries(pastorItems, assignedRoadmaps),
    [pastorItems, assignedRoadmaps],
  );

  const assessmentSummary = useMemo(
    () => buildAssessmentSummary(pastorItems),
    [pastorItems],
  );
  const assignedAssessmentItems = useMemo(
    () =>
      pastorItems
        .filter((item) => item.type === "assessment")
        .sort((a, b) => {
          const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
          const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
          return bTime - aTime;
        }),
    [pastorItems],
  );

  const withReturn = useCallback(
    (params: Record<string, string | undefined>) =>
      returnTo ? appendReturnTo(params, returnTo) : params,
    [returnTo],
  );

  const openFullRoadmap = () => {
    router.push({
      pathname: "/(mentor)/roadmap/landing/landing" as any,
      params: withReturn({ menteeId: pastorId }),
    });
  };

  const openPhaseRoadmap = useCallback(
    (roadmapId: string) => {
      const roadmap = assignedRoadmaps.find((r) => String(r._id) === roadmapId);
      if (!roadmap?._id) return;

      const params = withReturn({
        menteeId: pastorId,
        menteeName: pastorName,
      });

      const singleTaskId = getSingleNestedTaskId(roadmap);
      if (singleTaskId) {
        router.push({
          pathname: `/(mentor)/roadmap/${roadmap._id}/${singleTaskId}` as any,
          params,
        });
        return;
      }

      router.push({
        pathname: `/(mentor)/roadmap/${roadmap._id}` as any,
        params,
      });
    },
    [assignedRoadmaps, pastorId, pastorName, router, withReturn],
  );

  const openFullAssessments = () => {
    router.push({
      pathname: "/(mentor)/assessments-v2" as any,
      params: withReturn({ menteeId: pastorId }),
    });
  };

  const openAssessment = useCallback(
    (item: ReviewItem) => {
      if (!item.assessmentId) return;

      router.push({
        pathname: "/(mentor)/assessments/answer-questions" as any,
        params: withReturn({
          assessmentId: item.assessmentId,
          viewMode: "true",
          targetUserId: pastorId,
          hasPreSurvey: "true",
          scheduleMeeting: "false",
        }),
      });
    },
    [pastorId, router, withReturn],
  );

  if (phaseSummaries.length === 0 && assessmentSummary.total === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Pressable
          style={styles.accordionButton}
          onPress={() => setIsExpanded((prev) => !prev)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Toggle roadmap journey details"
        >
          <View style={styles.accordionIconWrap}>
            <Ionicons name="map-outline" size={16} color="#38BDF8" />
          </View>
          <View style={styles.accordionTextBlock}>
            <Text style={styles.sectionTitle}>Entire Roadmap journey</Text>
            <Text style={styles.accordionSubtitle}>
              {isExpanded
                ? "Hide phase details"
                : `${phaseSummaries.length} phases · tap to expand`}
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={18}
            color="rgba(255,255,255,0.75)"
          />
        </Pressable>
        <Pressable onPress={openFullRoadmap} hitSlop={8}>
          {}
        </Pressable>
      </View>

      {isExpanded ? (
        <>
          {phaseSummaries.map((phase) => (
            <View key={phase.roadmapId} style={styles.phaseCard}>
              <Pressable
                style={styles.phaseCardPressable}
                onPress={() => openPhaseRoadmap(phase.roadmapId)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${phase.roadmapName} roadmap for ${pastorName}`}
              >
                <View style={styles.phaseCardContent}>
                  <View style={styles.phaseTop}>
                    <View style={styles.phaseIcon}>
                      <Ionicons name="map-outline" size={16} color="#38BDF8" />
                    </View>
                    <View style={styles.phaseInfo}>
                      <Text style={styles.phaseName} numberOfLines={2}>
                        {phase.roadmapName}
                      </Text>
                      <View style={styles.phaseMeta}>
                        <View
                          style={[
                            styles.statusPill,
                            { borderColor: phaseStatusColor(phase.phaseStatus) },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              { color: phaseStatusColor(phase.phaseStatus) },
                            ]}
                          >
                            {formatPhaseStatusLabel(phase.phaseStatus)}
                          </Text>
                        </View>
                        <Text style={styles.taskCount}>
                          {phase.counts.total} task{phase.counts.total === 1 ? "" : "s"}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.breakdown} numberOfLines={2}>
                    {taskBreakdown(phase)}
                  </Text>
                </View>
              </Pressable>
            </View>
          ))}
        </>
      ) : null}

      <Pressable style={styles.fullRoadmapBtn} onPress={openFullRoadmap}>
        <Ionicons name="map-outline" size={16} color="#6FD4BE" />
        <Text style={styles.fullRoadmapText}>
          Open {pastorName}&apos;s full roadmap
        </Text>
      </Pressable>

      {assessmentSummary.total > 0 ? (
        <View style={styles.assessmentSection}>
          <Pressable
            style={styles.assessmentAccordionButton}
            onPress={() => setIsAssessmentExpanded((prev) => !prev)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Toggle assessment details"
          >
            <View style={[styles.accordionIconWrap, styles.assessmentIcon]}>
              <Ionicons name="clipboard-outline" size={16} color="#A78BFA" />
            </View>
            <View style={styles.accordionTextBlock}>
              <Text style={styles.sectionTitle}>All Assessments</Text>
              <Text style={styles.accordionSubtitle}>
                {assessmentSummary.total} assigned
              </Text>
            </View>
            <Ionicons
              name={isAssessmentExpanded ? "chevron-up" : "chevron-down"}
              size={18}
              color="rgba(255,255,255,0.75)"
            />
          </Pressable>

          {isAssessmentExpanded ? (
            <View style={styles.assessmentCard}>
              <Text style={styles.breakdown}>
                {[
                  assessmentSummary.pending_review > 0
                    ? `${assessmentSummary.pending_review} to review`
                    : null,
                  assessmentSummary.reviewed > 0
                    ? `${assessmentSummary.reviewed} reviewed`
                    : null,
                  assessmentSummary.not_started > 0
                    ? `${assessmentSummary.not_started} not started`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "No activity yet"}
              </Text>

              {assignedAssessmentItems.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.assessmentItemRow}
                  onPress={() => openAssessment(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${item.title} for ${pastorName}`}
                >
                  <Text style={styles.assessmentItemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.assessmentItemStatus}>
                    {item.category === "pending_review"
                      ? "To review"
                      : item.category === "reviewed"
                        ? "Reviewed"
                        : "Not started"}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Pressable style={styles.fullAssessmentBtn} onPress={openFullAssessments}>
            <Ionicons name="clipboard-outline" size={16} color="#A78BFA" />
            <Text style={styles.fullAssessmentText}>
              Open {pastorName}&apos;s assessments
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  accordionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  accordionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(56,189,248,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  accordionTextBlock: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  accordionSubtitle: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    fontWeight: "500",
  },
  link: {
    color: "#6FD4BE",
    fontSize: 12,
    fontWeight: "600",
  },
  phaseCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  phaseCardPressable: {
    padding: 12,
  },
  phaseCardContent: {
    gap: 8,
  },
  assessmentCard: {
    backgroundColor: "rgba(167,139,250,0.1)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.25)",
    padding: 12,
    gap: 10,
  },
  assessmentSection: {
    gap: 10,
  },
  assessmentAccordionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(167,139,250,0.12)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  assessmentItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  assessmentItemTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  assessmentItemStatus: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    fontWeight: "600",
  },
  phaseTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  phaseIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(56,189,248,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  assessmentIcon: {
    backgroundColor: "rgba(167,139,250,0.2)",
  },
  phaseInfo: {
    flex: 1,
    gap: 4,
  },
  phaseName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  phaseMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  taskCount: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
    fontWeight: "500",
  },
  breakdown: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    lineHeight: 16,
    paddingLeft: 42,
  },
  fullRoadmapBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(111,212,190,0.35)",
    backgroundColor: "rgba(111,212,190,0.08)",
  },
  fullRoadmapText: {
    color: "#6FD4BE",
    fontSize: 13,
    fontWeight: "600",
  },
  fullAssessmentBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.35)",
    backgroundColor: "rgba(167,139,250,0.1)",
  },
  fullAssessmentText: {
    color: "#A78BFA",
    fontSize: 13,
    fontWeight: "600",
  },
});
