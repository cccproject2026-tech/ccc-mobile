import { Colors } from "@/constants/Colors";
import { sessionTopicSubtitle } from "@/constants/sessionTitles";
import { MentorshipSession } from "@/types/session.types";
import { formatClock } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

export const sessionGradientColors = [
  Colors.lightBlueGradientOne,
  Colors.darkBlueGradientOne,
] as const;

export function formatSessionTime(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return formatClock(d);
}

/** Next session to focus: first upcoming SCHEDULED (from today), else first SCHEDULED. */
export function getNextSessionId(
  sorted: MentorshipSession[],
): string | undefined {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const upcoming = sorted.find(
    (s) =>
      s.status === "SCHEDULED" &&
      !Number.isNaN(new Date(s.scheduledDate).getTime()) &&
      new Date(s.scheduledDate) >= start,
  );
  return (
    upcoming?.id ??
    sorted.find((s) => s.status === "SCHEDULED")?.id ??
    undefined
  );
}

export function SessionProgressHeader({
  sessions,
  nextSessionId,
}: {
  sessions: MentorshipSession[];
  nextSessionId?: string;
}) {
  const total = sessions.length;
  const completed = sessions.filter((s) => s.status === "COMPLETED").length;
  const progress = total > 0 ? Math.min(1, completed / total) : 0;
  const next = nextSessionId
    ? sessions.find((s) => s.id === nextSessionId)
    : undefined;

  const headline =
    total === 0
      ? "No sessions yet"
      : completed >= total
        ? `All ${total} sessions complete`
        : next
          ? `Session ${next.sessionNumber} of ${total}`
          : `Session ${completed + 1} of ${total}`;

  const incomplete = sessions.filter((s) => s.status !== "COMPLETED");
  const sortedIncomplete = [...incomplete].sort(
    (a, b) => a.sessionNumber - b.sessionNumber,
  );
  const focusSessionNumber =
    total === 0 || completed >= total
      ? undefined
      : (next?.sessionNumber ?? sortedIncomplete[0]?.sessionNumber);
  const progressTopicLine = sessionTopicSubtitle(focusSessionNumber);

  return (
    <View style={progressStyles.wrap}>
      <View style={progressStyles.row}>
        <View style={progressStyles.titleCol}>
          {progressTopicLine ? (
            <>
              <Text style={progressStyles.headlineTopic} numberOfLines={3}>
                {progressTopicLine}
              </Text>
              <Text style={progressStyles.titleUnderTopic}>{headline}</Text>
            </>
          ) : (
            <Text style={progressStyles.title}>{headline}</Text>
          )}
        </View>
        <Text style={progressStyles.count}>
          {completed}/{total}
        </Text>
      </View>
      <View style={progressStyles.track}>
        <View
          style={[progressStyles.fill, { width: `${progress * 100}%` }]}
        />
      </View>
      <Text style={progressStyles.caption}>Mentorship journey progress</Text>
    </View>
  );
}

export function SessionStatusBadge({
  status,
  compact,
}: {
  status: MentorshipSession["status"];
  compact?: boolean;
}) {
  const isDone = status === "COMPLETED";
  return (
    <View
      style={[
        progressStyles.badge,
        isDone ? progressStyles.badgeDone : progressStyles.badgeOpen,
        compact && progressStyles.badgeCompact,
      ]}
    >
      <Text style={progressStyles.badgeText}>{status}</Text>
    </View>
  );
}

export function SessionListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <View style={progressStyles.skeletonWrap}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={progressStyles.skeletonCard}>
          <View style={progressStyles.skeletonLineLg} />
          <View style={progressStyles.skeletonLineSm} />
          <View style={progressStyles.skeletonLineMd} />
        </View>
      ))}
    </View>
  );
}

export function SessionMetaRow({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={detailStyles.metaRow}>
      <Ionicons name={icon} size={16} color="rgba(255,255,255,0.75)" />
      <Text style={detailStyles.metaText}>{label}</Text>
    </View>
  );
}

export function NotesSection({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View style={detailStyles.section}>
      <Text style={detailStyles.sectionTitle}>Notes</Text>
      {children}
    </View>
  );
}

export function NoteCard({
  title,
  value,
}: {
  title: string;
  value?: string;
}) {
  const has = value && value.trim().length > 0;
  return (
    <View style={detailStyles.noteCard}>
      <Text style={detailStyles.noteTitle}>{title}</Text>
      <Text style={[detailStyles.noteBody, !has && detailStyles.noteEmpty]}>
        {has ? value : "No note yet."}
      </Text>
    </View>
  );
}

export function ActionsSection({
  children,
}: {
  children: React.ReactNode;
}) {
  return <View style={detailStyles.actionsSection}>{children}</View>;
}

type ConfirmKind = "complete" | "redo";

export function SessionConfirmModal({
  visible,
  kind,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  kind: ConfirmKind | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const title =
    kind === "redo" ? "Redo this session?" : "Complete this session?";
  const body =
    kind === "redo"
      ? "This marks the session for redo. You can continue when ready."
      : "Mark this session as completed? This cannot be undone from here.";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={detailStyles.modalOverlay}>
        <View style={detailStyles.modalCard}>
          <Text style={detailStyles.modalTitle}>{title}</Text>
          <Text style={detailStyles.modalBody}>{body}</Text>
          <View style={detailStyles.modalActions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                detailStyles.modalBtnGhost,
                pressed && detailStyles.pressed,
              ]}
            >
              <Text style={detailStyles.modalBtnGhostText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                kind === "redo"
                  ? detailStyles.modalBtnWarn
                  : detailStyles.modalBtnPrimary,
                pressed && detailStyles.pressed,
              ]}
            >
              <Text style={detailStyles.modalBtnPrimaryText}>
                {kind === "redo" ? "Redo" : "Complete"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function DetailScreenSkeleton() {
  return (
    <View style={detailStyles.detailSkeleton}>
      <View style={detailStyles.skelBlock} />
      <View style={detailStyles.skelBlockSm} />
      <View style={detailStyles.skelBlock} />
      <View style={detailStyles.skelBlock} />
    </View>
  );
}

const progressStyles = StyleSheet.create({
  wrap: {
    marginBottom: 18,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleCol: {
    flex: 1,
    marginRight: 12,
    minWidth: 0,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  titleUnderTopic: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    marginTop: 5,
  },
  headlineTopic: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  count: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontWeight: "600",
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#38BDF8",
  },
  caption: {
    marginTop: 6,
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontWeight: "500",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeCompact: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeOpen: {
    backgroundColor: "rgba(56, 189, 248, 0.28)",
  },
  badgeDone: {
    backgroundColor: "rgba(34, 197, 94, 0.3)",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  skeletonWrap: { gap: 12, paddingBottom: 8 },
  skeletonCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    gap: 10,
  },
  skeletonLineLg: {
    height: 16,
    borderRadius: 6,
    width: "72%",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  skeletonLineMd: {
    height: 13,
    borderRadius: 6,
    width: "55%",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  skeletonLineSm: {
    height: 13,
    borderRadius: 6,
    width: "40%",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});

const detailStyles = StyleSheet.create({
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  metaText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    flex: 1,
  },
  section: {
    marginTop: 4,
  },
  sectionTitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  noteCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    marginBottom: 10,
  },
  noteTitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  noteBody: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 22,
  },
  noteEmpty: {
    color: "rgba(255,255,255,0.45)",
    fontStyle: "italic",
  },
  actionsSection: {
    marginTop: 8,
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#1A3F66",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalBody: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalBtnGhost: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  modalBtnGhostText: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "700",
    fontSize: 15,
  },
  modalBtnPrimary: {
    backgroundColor: "#22C55E",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  modalBtnWarn: {
    backgroundColor: "#CA8A04",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  modalBtnPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  pressed: { opacity: 0.85 },
  detailSkeleton: { gap: 14, paddingTop: 8 },
  skelBlock: {
    height: 88,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  skelBlockSm: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});

export function sessionCardHighlightStyle(isCurrent: boolean): ViewStyle {
  return isCurrent
    ? {
        borderColor: "rgba(250, 204, 21, 0.65)",
        borderWidth: 2,
        backgroundColor: "rgba(250, 204, 21, 0.12)",
      }
    : {};
}

export { MentorSessionEnrichmentSection } from "./mentor/MentorSessionEnrichmentSection";

