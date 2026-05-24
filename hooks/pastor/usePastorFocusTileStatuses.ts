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

function statusForMentorship(
  today?: PastorFocusSection,
  upcoming?: PastorFocusSection,
): PastorFocusTileStatus {
  const todayCount = today?.items.length ?? 0;
  const upcomingCount = upcoming?.items.length ?? 0;
  if (todayCount === 0 && upcomingCount === 0) {
    return { label: "None scheduled", variant: "inProgress" };
  }

  const items = [...(today?.items ?? []), ...(upcoming?.items ?? [])];
  const linkPending = items.some((item) => item.meta?.includes("Link pending"));

  if (todayCount > 0) {
    return {
      label: linkPending ? "Link pending" : "Today",
      variant: linkPending ? "pending" : "upcoming",
    };
  }

  return {
    label: linkPending ? "Link pending" : "Scheduled",
    variant: linkPending ? "pending" : "upcoming",
  };
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

  const meta = item.meta ?? "";
  if (meta.includes("Newly assigned")) {
    return { label: "New phase", variant: "pending" };
  }
  if (meta.includes("Blocked")) {
    return { label: "Blocked", variant: "dueToday" };
  }
  if (meta.includes("Due soon")) {
    return { label: "Due soon", variant: "dueToday" };
  }
  if (meta.includes("In progress")) {
    return { label: "In progress", variant: "inProgress" };
  }
  return { label: "Get started", variant: "pending" };
}

function statusForAssessments(
  section?: PastorFocusSection,
): PastorFocusTileStatus {
  const count = section?.items.length ?? 0;
  if (count === 0) return { label: "Up to date", variant: "inProgress" };

  const first = section!.items[0];
  const meta = first.meta ?? "";
  if (meta.includes("Newly assigned")) {
    return { label: "New", variant: "pending" };
  }
  if (/due/i.test(meta)) {
    return { label: "Due", variant: "dueToday" };
  }
  return { label: "Pending", variant: "pending" };
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
      "mentor-feedback": statusForFeedback(byId.get("mentor-feedback")),
    };
  }, [sections]);
}
