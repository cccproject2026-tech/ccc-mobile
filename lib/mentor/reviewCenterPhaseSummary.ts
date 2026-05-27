import type { ReviewItem } from "@/lib/mentor/reviewCenter.types";
import { comparePastorPhasesForHome } from "@/lib/roadmap/helpers";
import type { Roadmap } from "@/lib/roadmap/types";

export interface ReviewRoadmapPhaseSummary {
  roadmapId: string;
  roadmapName: string;
  phaseStatus: "not started" | "in-progress" | "completed";
  counts: {
    pending_review: number;
    resubmitted: number;
    reviewed: number;
    not_started: number;
    total: number;
  };
}

export interface ReviewAssessmentSummary {
  pending_review: number;
  reviewed: number;
  not_started: number;
  total: number;
}

export function buildRoadmapPhaseSummaries(
  pastorItems: ReviewItem[],
  assignedRoadmaps: Roadmap[],
): ReviewRoadmapPhaseSummary[] {
  const sorted = [...assignedRoadmaps].sort(comparePastorPhasesForHome);

  return sorted.map((roadmap) => {
    const roadmapId = String(roadmap._id ?? "");
    const phaseItems = pastorItems.filter(
      (item) => item.type === "roadmap" && String(item.roadmapId) === roadmapId,
    );

    const counts = {
      pending_review: 0,
      resubmitted: 0,
      reviewed: 0,
      not_started: 0,
      total: phaseItems.length,
    };

    for (const item of phaseItems) {
      if (item.category in counts) {
        counts[item.category as keyof typeof counts]++;
      }
    }

    const status = String(roadmap.status ?? "not started").toLowerCase();
    let phaseStatus: ReviewRoadmapPhaseSummary["phaseStatus"] = "not started";
    if (status === "completed") phaseStatus = "completed";
    else if (status === "in-progress" || status === "in progress") {
      phaseStatus = "in-progress";
    }

    return {
      roadmapId,
      roadmapName: String(roadmap.name ?? roadmap.phase ?? "Roadmap").trim(),
      phaseStatus,
      counts,
    };
  });
}

export function buildAssessmentSummary(
  pastorItems: ReviewItem[],
): ReviewAssessmentSummary {
  const items = pastorItems.filter((item) => item.type === "assessment");
  const summary: ReviewAssessmentSummary = {
    pending_review: 0,
    reviewed: 0,
    not_started: 0,
    total: items.length,
  };

  for (const item of items) {
    if (item.category === "pending_review") summary.pending_review++;
    else if (item.category === "reviewed") summary.reviewed++;
    else summary.not_started++;
  }

  return summary;
}

export function formatPhaseStatusLabel(
  status: ReviewRoadmapPhaseSummary["phaseStatus"],
): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "in-progress":
      return "In progress";
    default:
      return "Not started";
  }
}
