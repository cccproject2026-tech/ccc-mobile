/** AI mentorship insights payload (optional on session or merged client-side). */
export type EmotionalTrendPoint = {
  label: string;
  /** Typically -100..100 or 0..100; UI normalizes for bars. */
  value: number;
};

export type MentorshipInsightsPayload = {
  challenges: string[];
  emotionalTrend: EmotionalTrendPoint[];
  growthSignals: string[];
};
