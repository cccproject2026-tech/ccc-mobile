import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useAssignedAssessments } from "@/hooks/assessments/useAssignedAssessments";
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

export const usePastorFocusItems = () => {
  const { user } = useAuthStore();
  const { appointments, isLoading: isAppointmentsLoading } = useAppointments({
    userId: user?.id,
  });
  const { data: roadmaps = [], isLoading: isRoadmapsLoading } = useRoadmaps(
    "pastor",
    user?.id,
  );
  const { data: assessments = [], isLoading: isAssessmentsLoading } =
    useAssignedAssessments(user?.id);

  const feedbackQuery = useQuery({
    queryKey: ["pastor-focus-feedback", user?.id, roadmaps.map((r) => r._id).join(",")],
    enabled: !!user?.id && roadmaps.length > 0,
    queryFn: async () => {
      const feedback = await Promise.all(
        roadmaps.map(async (roadmap) => {
          const [commentsThread, queries] = await Promise.all([
            roadmapService.getRoadmapComments(roadmap._id, user!.id),
            roadmapService.getRoadmapQueries(roadmap._id, user!.id),
          ]);

          const flatQueries = queries.flatMap((thread) =>
            thread.queries.map((query) => ({
              ...query,
              roadmapId: roadmap._id,
              roadmapName: roadmap.name,
            })),
          );

          return {
            roadmapId: roadmap._id,
            roadmapName: roadmap.name,
            comments: commentsThread.comments || [],
            queries: flatQueries,
          };
        }),
      );

      return feedback;
    },
  });

  const sections = useMemo<PastorFocusSection[]>(() => {
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
      .map((appointment: Appointment) => ({
        id: `meeting-${appointment.id}`,
        title: "Upcoming meeting",
        description: `Meeting starts ${formatDateTime(appointment.meetingDate)}.`,
        meta: `Within ${UPCOMING_MEETING_WINDOW_HOURS} hours`,
        accentColor: "#38BDF8",
        route: {
          pathname: "/appointments",
        },
      }));

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
      .map((appointment: Appointment) => ({
        id: `meeting-month-${appointment.id}`,
        title: "Upcoming meeting this month",
        description: `Meeting starts ${formatDateTime(appointment.meetingDate)}.`,
        meta: "This month",
        accentColor: "#22D3EE",
        route: {
          pathname: "/appointments",
        },
      }));

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
          .filter((comment: RoadmapComment) => comment.mentorId?.role === "mentor")
          .map((comment: RoadmapComment) => ({
            id: `comment-${comment._id}`,
            title: `${comment.mentorId.firstName} commented`,
            description: comment.text,
            meta: `${entry.roadmapName} • ${formatDateTime(comment.addedDate)}`,
            accentColor: "#F472B6",
            sortKey: comment.addedDate,
            route: {
              pathname: `/roadmap/${entry.roadmapId}/comments`,
              params: { roadmapId: entry.roadmapId },
            },
          }));

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
              pathname: `/roadmap/${query.roadmapId}/queries`,
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
        emptyMessage: "No new mentor feedback is waiting right now.",
        items: mentorFeedbackItems,
      },
    ];
  }, [appointments, assessments, feedbackQuery.data, roadmaps]);

  return {
    sections,
    isLoading:
      isAppointmentsLoading ||
      isRoadmapsLoading ||
      isAssessmentsLoading ||
      feedbackQuery.isLoading,
  };
};
