import type {
  EmotionalTrendPoint,
  MentorshipInsightsPayload,
} from "@/types/mentorshipInsights.types";
import type {
  MentorshipAiSummary,
  MentorshipSession,
  MentorshipTranscriptLine,
} from "@/types/session.types";

export function parseTranscriptFromApi(
  raw: unknown,
): MentorshipTranscriptLine[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: MentorshipTranscriptLine[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const role = r.role === "pastor" ? "pastor" : "mentor";
    const text = String(r.text ?? r.content ?? "").trim();
    if (text) out.push({ role, text });
  }
  return out.length ? out : undefined;
}

export function parseAiSummaryFromApi(
  raw: unknown,
): MentorshipAiSummary | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const overview = String(o.overview ?? "");
  const keyDiscussionPoints = String(
    o.keyDiscussionPoints ?? o.keyDiscussion ?? "",
  );
  const adviceGiven = String(o.adviceGiven ?? "");
  const actionItems = String(o.actionItems ?? "");
  const nextSessionFocus = String(o.nextSessionFocus ?? "");
  const has =
    [overview, keyDiscussionPoints, adviceGiven, actionItems, nextSessionFocus].some(
      (s) => s.trim().length > 0,
    );
  if (!has) return undefined;
  return {
    overview,
    keyDiscussionPoints,
    adviceGiven,
    actionItems,
    nextSessionFocus,
  };
}

export function parseMentorshipInsightsFromApi(
  raw: unknown,
): MentorshipInsightsPayload | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const challenges = Array.isArray(o.challenges)
    ? o.challenges.map((x) => String(x))
    : [];
  const growthSignals = Array.isArray(o.growthSignals)
    ? o.growthSignals.map((x) => String(x))
    : [];
  const emotionalTrend: EmotionalTrendPoint[] = Array.isArray(o.emotionalTrend)
    ? o.emotionalTrend
        .map((row: unknown) => {
          if (!row || typeof row !== "object") return null;
          const t = row as Record<string, unknown>;
          const label = String(t.label ?? "").trim();
          const value = Number(t.value);
          if (!label) return null;
          return {
            label,
            value: Number.isFinite(value) ? value : 0,
          };
        })
        .filter((x): x is EmotionalTrendPoint => x != null)
    : [];
  return { challenges, emotionalTrend, growthSignals };
}

/** Merge insights from all sessions (unique strings; trend values averaged by label). */
export function aggregateMentorshipInsights(
  sessions: MentorshipSession[],
): MentorshipInsightsPayload {
  const challengeSet = new Set<string>();
  const growthSet = new Set<string>();
  const trendBuckets = new Map<string, number[]>();

  for (const s of sessions) {
    const m = s.mentorshipInsights;
    if (!m) continue;
    m.challenges.forEach((c) => {
      const t = c.trim();
      if (t) challengeSet.add(t);
    });
    m.growthSignals.forEach((g) => {
      const t = g.trim();
      if (t) growthSet.add(t);
    });
    m.emotionalTrend.forEach((pt) => {
      const label = pt.label.trim();
      if (!label) return;
      const arr = trendBuckets.get(label) ?? [];
      arr.push(pt.value);
      trendBuckets.set(label, arr);
    });
  }

  const emotionalTrend: EmotionalTrendPoint[] = [...trendBuckets.entries()].map(
    ([label, values]) => ({
      label,
      value:
        values.length > 0
          ? values.reduce((a, b) => a + b, 0) / values.length
          : 0,
    }),
  );

  return {
    challenges: [...challengeSet],
    emotionalTrend,
    growthSignals: [...growthSet],
  };
}

export function hasMentorshipInsightsData(
  data: MentorshipInsightsPayload,
): boolean {
  return (
    data.challenges.length > 0 ||
    data.emotionalTrend.length > 0 ||
    data.growthSignals.length > 0
  );
}
