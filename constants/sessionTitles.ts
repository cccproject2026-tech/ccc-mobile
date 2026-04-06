// Client-side display names for mentorship session numbers (UI only; not from API).

export const SESSION_TITLES: Record<number, string> = {
  1: "Building Trust, Self-Awareness & Resources",
  2: "Creating a Life of Prayer, Vision, & Family Balance",
  3: "Empowering Disciples & Addressing Resistance",
  4: "Fostering a Culture of Hospitality & Generosity",
  5: "Building Social Bridges",
  6: "Creating Community Engagement Frameworks",
  7: "Training & Equipping for Community Engagement",
  8: "Transforming Community through Active Presence",
  9: "Celebrating & Envisioning Growth",
  10: "Expanding Mentoring Networks",
};

export function sessionOrdinalLabel(
  sessionNumber: number | undefined,
): string {
  if (
    sessionNumber == null ||
    !Number.isFinite(sessionNumber) ||
    sessionNumber < 1
  ) {
    return "Session X";
  }
  return `Session ${sessionNumber}`;
}

export function sessionTopicLine(sessionNumber: number | undefined): string {
  if (
    sessionNumber == null ||
    !Number.isFinite(sessionNumber) ||
    sessionNumber < 1
  ) {
    return "Session X";
  }
  return SESSION_TITLES[sessionNumber] ?? `Session ${sessionNumber}`;
}

export function sessionTopicSubtitle(
  sessionNumber: number | undefined,
): string | null {
  const ord = sessionOrdinalLabel(sessionNumber);
  const topic = sessionTopicLine(sessionNumber);
  return topic === ord ? null : topic;
}