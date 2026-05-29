import type { PastorFocusHighlightStatusVariant } from "@/components/pastor/PastorFocusHighlightCard";
import type { PastorFocusSection } from "@/components/sheets/PastorFocusBottomSheet";
import { format } from "date-fns";
import { useMemo } from "react";

export type PastorFocusTileStatus = {
  label: string;
  variant: PastorFocusHighlightStatusVariant;
};

function statusForNewAssignments(
  section?: PastorFocusSection,
): PastorFocusTileStatus {
  const count = section?.items.length ?? 0;
  if (count === 0) return { label: "All clear", variant: "inProgress" };
  if (count === 1) return { label: "1 new", variant: "pending" };
  return { label: `${count} new`, variant: "pending" };
}

function extractTimeFromDescription(description?: string): string {
  if (!description) return "";
  const match = description.match(/(\d{1,2}:\d{2}\s*[AP]M)/i);
  return match ? match[1] : "";
}

function extractDateFromDescription(description?: string): string {
  if (!description) return "";
  const match = description.match(/(\d{1,2}\s+\w{3})/);
  return match ? match[1] : "";
}

function statusForMentorship(
  today?: PastorFocusSection,
  upcoming?: PastorFocusSection,
): PastorFocusTileStatus {
  const todayCount = today?.items.length ?? 0;
  const upcomingCount = upcoming?.items.length ?? 0;
  if (todayCount === 0 && upcomingCount === 0) {
    return { label: "None scheduled", variant: "inProgress" };
  }

  if (todayCount > 0) {
    const time = extractTimeFromDescription(today!.items[0].description);
    return { label: time ? `Today, ${time}` : "Today", variant: "upcoming" };
  }

  const date = extractDateFromDescription(upcoming!.items[0].description);
  return { label: date || "Scheduled", variant: "upcoming" };
}

function statusForOtherMeetings(
  section?: PastorFocusSection,
): PastorFocusTileStatus {
  const count = section?.items.length ?? 0;
  if (count === 0) return { label: "None scheduled", variant: "inProgress" };
  if (count === 1) return { label: "1 upcoming", variant: "upcoming" };
  return { label: `${count} upcoming`, variant: "upcoming" };
}

function statusForRoadmaps(section?: PastorFocusSection): PastorFocusTileStatus {
  const item = section?.items[0];
  if (!item) return { label: "No phase", variant: "inProgress" };
  return { label: "In progress", variant: "inProgress" };
}

function statusForAssessments(
  section?: PastorFocusSection,
): PastorFocusTileStatus {
  const count = section?.items.length ?? 0;
  if (count === 0) return { label: "Completed", variant: "inProgress" };
  if (count === 1) return { label: "1 pending", variant: "pending" };
  return { label: `${count} pending`, variant: "pending" };
}

function statusForFeedback(section?: PastorFocusSection): PastorFocusTileStatus {
  const count = section?.items.length ?? 0;
  if (count === 0) return { label: "All clear", variant: "inProgress" };

  const first = section!.items[0];
  const meta = first.meta ?? "";
  const todayLabel = format(new Date(), "dd MMM");
  if (meta.includes(todayLabel)) {
    return { label: "Due today", variant: "dueToday" };
  }
  if (count === 1) return { label: "1 new", variant: "pending" };
  return { label: `${count} new`, variant: "pending" };
}

function statusForMentorFeedback(
  comments?: PastorFocusSection,
  queryReplies?: PastorFocusSection,
): PastorFocusTileStatus {
  const commentCount = comments?.items.length ?? 0;
  const replyCount = queryReplies?.items.length ?? 0;
  const total = commentCount + replyCount;

  if (total === 0) return { label: "All clear", variant: "inProgress" };

  const parts: string[] = [];
  if (commentCount > 0) {
    parts.push(commentCount === 1 ? "1 comment" : `${commentCount} comments`);
  }
  if (replyCount > 0) {
    parts.push(replyCount === 1 ? "1 reply" : `${replyCount} replies`);
  }
  return { label: parts.join(", "), variant: "pending" };
}

export function usePastorFocusTileStatuses(
  sections: PastorFocusSection[],
): Record<string, PastorFocusTileStatus> {
  return useMemo(() => {
    const byId = new Map(sections.map((section) => [section.id, section]));

    return {
      "new-assignments": statusForNewAssignments(byId.get("new-assignments")),
      "mentorship-sessions": statusForMentorship(
        byId.get("mentorship-sessions"),
        byId.get("mentorship-sessions-upcoming"),
      ),
      "other-meetings": statusForOtherMeetings(byId.get("other-meetings")),
      roadmaps: statusForRoadmaps(byId.get("roadmaps")),
      assessments: statusForAssessments(byId.get("assessments")),
      "mentor-feedback": statusForMentorFeedback(
        byId.get("mentor-comments"),
        byId.get("mentor-query-replies"),
      ),
    };
  }, [sections]);
}
