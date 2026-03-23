import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useAssignedAssessments } from "@/hooks/assessments/useAssignedAssessments";
import { useAssignedMentors } from "@/hooks/mentors/useGetAssignedMentors";
import { useRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import { roadmapService } from "@/services/roadmap.service";
import { useAuthStore } from "@/stores";
import { Assessment } from "@/types/assessment.types";
import { Appointment } from "@/types/appointment.types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useMemo } from "react";
import {
  MentorInfo,
  NestedRoadmap,
  Roadmap,
  RoadmapComment,
  RoadmapCommentAuthor,
  RoadmapQuery,
} from "@/lib/roadmap/types";
import type {
  PastorFocusItem,
  PastorFocusSection,
} from "@/components/sheets/PastorFocusBottomSheet";

const UPCOMING_MEETING_WINDOW_HOURS = 24;
const UPCOMING_DUE_WINDOW_DAYS = 7;
const MAX_ITEMS_PER_SECTION = 3;

type TaskWithRoadmap = NestedRoadmap & {
  roadmapId: string;
  roadmapName: string;
};

const toTimestamp = (value?: string | null) => {
  if (!value) return Number.POSITIVE_INFINITY;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
};

const isWithinHours = (value: string | undefined, hours: number) => {
  const timestamp = toTimestamp(value);
  const now = Date.now();
  return timestamp >= now && timestamp <= now + hours * 60 * 60 * 1000;
};

const isUpcomingInCurrentMonth = (value: string | undefined) => {
  const timestamp = toTimestamp(value);
  if (!Number.isFinite(timestamp)) return false;
  const now = new Date();
  const target = new Date(timestamp);
  if (target.getTime() < now.getTime()) return false;
  return (
    target.getFullYear() === now.getFullYear() &&
    target.getMonth() === now.getMonth()
  );
};

const isWithinDays = (value: string | undefined, days: number) => {
  const timestamp = toTimestamp(value);
  const now = Date.now();
  return timestamp >= now && timestamp <= now + days * 24 * 60 * 60 * 1000;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "dd MMM, h:mm a");
};

const isTaskActionable = (task: NestedRoadmap) =>
  task.status === "in-progress" ||
  (task.status !== "completed" && isWithinDays(task.endDate, UPCOMING_DUE_WINDOW_DAYS));

const getMentorName = (mentor?: MentorInfo | string) => {
  if (!mentor || typeof mentor === "string") {
    return "Mentor";
  }
  return `${mentor.firstName} ${mentor.lastName}`.trim();
};

/** Exported for query invalidation when roadmap comments change. */
export const PASTOR_FOCUS_FEEDBACK_QUERY_KEY = "pastor-focus-feedback" as const;

/**
 * Show roadmap thread items that are mentor feedback for the pastor.
 * API sometimes sets mentorId._id equal to thread userId while role is still "mentor" — trust role in that case.
 */
const isCommentMentorFeedbackForPastor = (
  comment: RoadmapComment,
  pastorUserId?: string | null,
) => {
  const author = comment.mentorId as RoadmapCommentAuthor | string | null | undefined;

  if (author == null) return false;

  if (typeof author === "string") {
    const id = author.trim();
    if (!id) return false;
    if (pastorUserId && id === pastorUserId) return false;
    return true;
  }

  if (typeof author !== "object") return false;

  const r = String(author.role ?? "").toLowerCase().trim();
  if (r === "pastor" || r === "director") return false;

  const isMentorRole =
    r === "mentor" ||
    r === "field mentor" ||
    (r.length > 0 && /\bmentor\b/.test(r));
  if (isMentorRole) return true;

  const aid = String(author._id ?? "").trim();
  if (pastorUserId && aid === pastorUserId) return false;
  return true;
};

const toTitleCase = (value: string) =>
  value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const getSchedulerLabel = (
  appointment: Appointment,
  userId?: string,
  mentorNameById?: Map<string, string>,
): string => {
  const apt = appointment as Appointment & Record<string, any>;
  const source =
    apt.scheduledBy ??
    apt.createdBy ??
    apt.scheduler ??
    apt.bookedBy ??
    apt.createdByUser ??
    null;

  const roleRaw =
    apt.scheduledByRole ??
    apt.createdByRole ??
    (typeof source === "object" ? source?.role : source) ??
    "";

  const nameRaw =
    apt.scheduledByName ??
    apt.createdByName ??
    (typeof source === "object"
      ? source?.name ??
        `${source?.firstName ?? ""} ${source?.lastName ?? ""}`.trim()
      : "");

  const role = String(roleRaw || "").trim();
  const name = String(nameRaw || "").trim();
  if (!role && !name) {
    if (userId && appointment.userId === userId) {
      return "Scheduled by Pastor (You)";
    }
    const mentorName = mentorNameById?.get(appointment.mentorId);
    if (mentorName) {
      return `Scheduled by Mentor ${mentorName}`;
    }
    return "Scheduled by Mentor";
  }

  if (role && name) return `Scheduled by ${toTitleCase(role)} ${name}`;
  if (role) return `Scheduled by ${toTitleCase(role)}`;
  return `Scheduled by ${name}`;
};

const getWithWhomLabel = (
  appointment: Appointment,
  mentorNameById?: Map<string, string>,
): string => {
  const mentorName = mentorNameById?.get(appointment.mentorId);
  if (mentorName) return `With Mentor ${mentorName}`;
  return "With Mentor";
};

export const usePastorFocusItems = () => {
  const { user } = useAuthStore();
  const { appointments, isLoading: isAppointmentsLoading } = useAppointments({
    userId: user?.id,
  });
  const { mentors } = useAssignedMentors(user?.id ?? null);
  const { data: roadmaps = [], isLoading: isRoadmapsLoading } = useRoadmaps(
    "pastor",
    user?.id,
  );
  const { data: assessments = [], isLoading: isAssessmentsLoading } =
    useAssignedAssessments(user?.id);

  const feedbackQuery = useQuery({
    queryKey: [PASTOR_FOCUS_FEEDBACK_QUERY_KEY, user?.id, roadmaps.map((r) => r._id).join(",")],
    enabled: !!user?.id && roadmaps.length > 0,
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: async () => {
      const uid = user!.id;
      const feedback = await Promise.all(
        roadmaps.map(async (roadmap) => {
          try {
            const [commentsThread, queries] = await Promise.all([
              roadmapService.getRoadmapComments(roadmap._id, uid),
              roadmapService.getRoadmapQueries(roadmap._id, uid),
            ]);

            const raw = commentsThread as { comments?: RoadmapComment[]; Comments?: RoadmapComment[] };
            const comments =
              (Array.isArray(raw.comments) && raw.comments) ||
              (Array.isArray(raw.Comments) && raw.Comments) ||
              [];

            const flatQueries = (Array.isArray(queries) ? queries : []).flatMap((thread) =>
              (thread.queries || []).map((query) => ({
                ...query,
                roadmapId: roadmap._id,
                roadmapName: roadmap.name,
              })),
            );

            return {
              roadmapId: roadmap._id,
              roadmapName: roadmap.name,
              comments,
              queries: flatQueries,
            };
          } catch {
            return {
              roadmapId: roadmap._id,
              roadmapName: roadmap.name,
              comments: [] as RoadmapComment[],
              queries: [] as (RoadmapQuery & { roadmapId: string; roadmapName: string })[],
            };
          }
        }),
      );

      return feedback;
    },
  });

  const sections = useMemo<PastorFocusSection[]>(() => {
    const mentorNameById = new Map(
      (mentors || []).map((mentor) => [mentor.id, mentor.name]),
    );

    const flattenedTasks: TaskWithRoadmap[] = roadmaps.flatMap((roadmap: Roadmap) =>
      (roadmap.roadmaps || []).map((task) => ({
        ...task,
        roadmapId: roadmap._id,
        roadmapName: roadmap.name,
      })),
    );

    const roadmapItems: PastorFocusItem[] = flattenedTasks
      .filter((task) => isTaskActionable(task))
      .sort((a, b) => toTimestamp(a.endDate) - toTimestamp(b.endDate))
      .slice(0, MAX_ITEMS_PER_SECTION)
      .map((task) => ({
        id: `roadmap-${task.roadmapId}-${task._id}`,
        title: task.name,
        description: `${task.roadmapName} needs attention${task.endDate ? ` by ${formatDateTime(task.endDate)}` : ""}.`,
        meta: task.status === "in-progress" ? "In progress" : "Due soon",
        accentColor: "#22C55E",
        route: {
          pathname: `/roadmap/${task.roadmapId}/${task._id}`,
        },
      }));

    const meetingItems: PastorFocusItem[] = (appointments || [])
      .filter((appointment: Appointment) =>
        isWithinHours(appointment.meetingDate, UPCOMING_MEETING_WINDOW_HOURS),
      )
      .sort(
        (a: Appointment, b: Appointment) =>
          toTimestamp(a.meetingDate) - toTimestamp(b.meetingDate),
      )
      .slice(0, MAX_ITEMS_PER_SECTION)
      .map((appointment: Appointment) => {
        const scheduler = getSchedulerLabel(appointment, user?.id, mentorNameById);
        const withWhom = getWithWhomLabel(appointment, mentorNameById);
        return {
          id: `meeting-${appointment.id}`,
          title: "Upcoming meeting",
          description: `Meeting starts ${formatDateTime(appointment.meetingDate)}.`,
          meta: `${scheduler} • ${withWhom} • Within ${UPCOMING_MEETING_WINDOW_HOURS} hours`,
          accentColor: "#38BDF8",
          route: {
            pathname: "/appointments",
          },
        };
      });

    const monthlyMeetingItems: PastorFocusItem[] = (appointments || [])
      .filter((appointment: Appointment) => {
        const in24Hours = isWithinHours(
          appointment.meetingDate,
          UPCOMING_MEETING_WINDOW_HOURS,
        );
        return !in24Hours && isUpcomingInCurrentMonth(appointment.meetingDate);
      })
      .sort(
        (a: Appointment, b: Appointment) =>
          toTimestamp(a.meetingDate) - toTimestamp(b.meetingDate),
      )
      .slice(0, MAX_ITEMS_PER_SECTION)
      .map((appointment: Appointment) => {
        const scheduler = getSchedulerLabel(appointment, user?.id, mentorNameById);
        const withWhom = getWithWhomLabel(appointment, mentorNameById);
        return {
          id: `meeting-month-${appointment.id}`,
          title: "Upcoming meeting this month",
          description: `Meeting starts ${formatDateTime(appointment.meetingDate)}.`,
          meta: `${scheduler} • ${withWhom} • This month`,
          accentColor: "#22D3EE",
          route: {
            pathname: "/appointments",
          },
        };
      });

    const assessmentItems: PastorFocusItem[] = (assessments || [])
      .filter(
        (assessment: Assessment) =>
          assessment.status !== "Completed" &&
          isWithinDays(assessment.dueDate, UPCOMING_DUE_WINDOW_DAYS),
      )
      .sort(
        (a: Assessment, b: Assessment) =>
          toTimestamp(a.dueDate) - toTimestamp(b.dueDate),
      )
      .slice(0, MAX_ITEMS_PER_SECTION)
      .map((assessment: Assessment) => ({
        id: `assessment-${assessment.id}`,
        title: assessment.title,
        description: assessment.description,
        meta: assessment.dueDate
          ? `Due ${formatDateTime(assessment.dueDate)}`
          : "Assessment pending",
        accentColor: "#A78BFA",
        route: {
          pathname: "/assessments/survey-guidelines",
          params: { assessmentId: assessment.id },
        },
      }));

    const mentorFeedbackItems: PastorFocusItem[] = (feedbackQuery.data || [])
      .flatMap((entry) => {
        const commentItems = (entry.comments || [])
          .filter((comment: RoadmapComment) =>
            isCommentMentorFeedbackForPastor(comment, user?.id),
          )
          .map((comment: RoadmapComment) => {
            const author = comment.mentorId as RoadmapCommentAuthor | string | undefined;
            const title =
              typeof author === "object" && author
                ? `${author.firstName?.trim() || "Mentor"} commented`
                : "Mentor commented";
            return {
              id: `comment-${comment._id}`,
              title,
              description: comment.text,
              meta: `${entry.roadmapName} • ${formatDateTime(comment.addedDate)}`,
              accentColor: "#F472B6",
              sortKey: comment.addedDate,
              route: {
                pathname: "/roadmap/comments",
                params: { roadmapId: entry.roadmapId },
              },
            };
          });

        const replyItems = (entry.queries || [])
          .filter((query: RoadmapQuery & { roadmapId: string; roadmapName: string }) => query.status === "answered" && !!query.repliedAnswer)
          .map((query: RoadmapQuery & { roadmapId: string; roadmapName: string }) => ({
            id: `query-${query._id}`,
            title: `${getMentorName(query.repliedMentorId)} replied`,
            description: query.repliedAnswer || query.actualQueryText,
            meta: `${query.roadmapName} • ${formatDateTime(query.repliedDate || query.createdDate)}`,
            accentColor: "#FB7185",
            sortKey: query.repliedDate || query.createdDate,
            route: {
              pathname: "/roadmap/queries",
              params: {
                roadmapId: query.roadmapId,
              },
            },
          }));

        return [...commentItems, ...replyItems];
      })
      .sort((a: any, b: any) => toTimestamp(b.sortKey) - toTimestamp(a.sortKey))
      .slice(0, MAX_ITEMS_PER_SECTION);

    return [
      {
        id: "roadmaps",
        title: "Ongoing and near due roadmap tasks",
        emptyMessage: "No roadmap tasks need immediate attention right now.",
        items: roadmapItems,
      },
      {
        id: "meetings",
        title: `Upcoming meetings within ${UPCOMING_MEETING_WINDOW_HOURS} hours`,
        emptyMessage: "No meetings are coming up in the next 24 hours.",
        items: meetingItems,
      },
      {
        id: "meetings-month",
        title: "Upcoming meetings this month",
        emptyMessage: "No more meetings are scheduled for this month.",
        items: monthlyMeetingItems,
      },
      {
        id: "assessments",
        title: "Upcoming assessment submission",
        emptyMessage: "No assessments are currently near due.",
        items: assessmentItems,
      },
      {
        id: "mentor-feedback",
        title: "Comments and query replies from Mentor",
        emptyMessage:
          "No mentor comments yet. This list shows your mentor's roadmap comments (not your own). When your mentor comments, it will appear here.",
        items: mentorFeedbackItems,
      },
    ];
  }, [appointments, assessments, feedbackQuery.data, mentors, roadmaps, user?.id]);

  return {
    sections,
    isLoading:
      isAppointmentsLoading ||
      isRoadmapsLoading ||
      isAssessmentsLoading ||
      feedbackQuery.isLoading,
  };
};
