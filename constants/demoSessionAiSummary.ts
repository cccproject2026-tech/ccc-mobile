import type { MentorshipAiSummary } from "@/types/session.types";

/** Demo AI summary when the API has not returned summary sections yet. */
export const DEMO_SESSION_AI_SUMMARY: MentorshipAiSummary = {
  overview:
    "This session (Session 1: Building Trust, Self-Awareness and Resources) centered on growing trust in God and others, deepening self-awareness, and stewarding spiritual and relational resources. The conversation moved from honest reflection into practical next steps for the week ahead.",

  keyDiscussionPoints: [
    "Trust was explored in two dimensions: trust in God (especially His timing) and trust in relationships (balanced with wisdom and boundaries).",
    "Self-awareness focused on recognizing emotions, identifying underlying causes (e.g., frustration masking lack of control), and slowing down before reacting.",
    "Identity in Christ was emphasized as the foundation for confidence and growth, rather than uncertainty.",
    "Resources included both spiritual (prayer, Scripture, worship) and relational (church, mentors, accountability).",
    "The importance of consistency in spiritual practices and recognizing already-available support systems was highlighted.",
  ].join("\n\n"),

  adviceGiven: [
    "Reflect on God's past faithfulness to strengthen present trust.",
    "Practice balanced trust in relationships—neither shutting down nor oversharing.",
    "Develop emotional awareness by pausing and asking reflective questions (What am I feeling? Why?).",
    "Use journaling as a tool for identifying patterns in thoughts and emotions.",
    "Reframe identity through a Christ-centered perspective, not circumstances.",
    "Re-engage with spiritual disciplines consistently, even in small daily increments.",
  ].join("\n"),

  actionItems: [
    "Commit to daily intentional prayer time (10–15 minutes).",
    "Begin journaling thoughts, emotions, and reflections throughout the week.",
    "Reach out to a trusted person in church for accountability.",
    "Practice pausing before reacting to better understand emotional triggers.",
  ].join("\n"),

  nextSessionFocus: [
    "Review progress on daily prayer and journaling habits.",
    "Discuss any challenges in building trust (with God or others).",
    "Explore deeper emotional patterns and self-awareness insights discovered during the week.",
    "Strengthen accountability structures and use of spiritual resources.",
  ].join("\n"),
};