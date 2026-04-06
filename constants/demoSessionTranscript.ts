import type { MentorshipTranscriptLine } from "@/types/session.types";

/**
 * Demo transcript for sessions when the API has not returned transcript lines yet.
 * David = mentor, Samuel = pastor (mentee) in the sample dialogue.
 */
export const DEMO_SESSION_TRANSCRIPT_LINES: MentorshipTranscriptLine[] = [
  {
    role: "mentor",
    text:
      "Session Title: Session 1—Building Trust, Self-Awareness & Resources. Zoom Session Title: Building Trust, Self-Awareness & Resources. Participants: David Jones (Mentor/Pastor), Samuel Adams (Mentee). [00:00 – Session Begins]",
  },
  {
    role: "mentor",
    text:
      "Samuel, good to see you today. Can you hear me clearly?",
  },
  {
    role: "pastor",
    text:
      "Pastor David, loud and clear. Good to see you too.",
  },
  {
    role: "mentor",
    text: "Let's open in prayer before we begin.",
  },
  { role: "pastor", text: "Please." },
  {
    role: "mentor",
    text:
      "Father, we thank You for this time together. We invite Your presence into this conversation. Teach us to grow in trust, deepen our self-awareness, and steward the resources You've given us well. In Jesus' name, amen.",
  },
  {
    role: "pastor",
    text: "Amen.",
  },
  {
    role: "mentor",
    text:
      "[03:00 – Building Trust] Let's start with trust. When you hear the word \"trust,\" what comes to mind?",
  },
  {
    role: "pastor",
    text:
      "Consistency. People doing what they say they'll do. And I guess… feeling safe.",
  },
  {
    role: "mentor",
    text:
      "Good. Trust is built on both character and consistency. How would you say your trust is with God right now?",
  },
  {
    role: "pastor",
    text:
      "I believe in Him, but sometimes I struggle to trust His timing.",
  },
  {
    role: "mentor",
    text:
      "Very honest. Many people feel that way. Trust grows when we remember God's past faithfulness. Can you think of a time He came through for you?",
  },
  {
    role: "pastor",
    text:
      "… last year when I was struggling with work, something opened up unexpectedly.",
  },
  {
    role: "mentor",
    text:
      "Those moments are anchors. When doubt comes, we return to what we know God has done.",
  },
  {
    role: "mentor",
    text:
      "[08:00 – Trust in Relationships] What about trust with others? Is there anyone you find it hard to trust?",
  },
  {
    role: "pastor",
    text:
      "Actually. A colleague. I feel like I have to be guarded around them.",
  },
  {
    role: "mentor",
    text:
      "Understandable. Trust doesn't mean blind openness—it means wisdom. Scripture teaches us to be \"wise as serpents and innocent as doves.\" Are you setting healthy boundaries?",
  },
  {
    role: "pastor",
    text: "I really do. I either shut down or overshare.",
  },
  {
    role: "mentor",
    text:
      "A common pattern. Let's work toward balanced trust—where you're honest but also discerning.",
  },
  {
    role: "mentor",
    text:
      "[12:00 – Self-Awareness] How well do you feel you understand your own emotions?",
  },
  {
    role: "pastor",
    text:
      "I think I'm still learning. Sometimes I react before I even realize what I'm feeling.",
  },
  {
    role: "mentor",
    text:
      "Key insight. Self-awareness begins with slowing down. When you feel triggered, ask: \"What am I feeling? Why?\"",
  },
  {
    role: "pastor",
    text: "That makes sense. I usually just push through.",
  },
  {
    role: "mentor",
    text:
      "Pushing through can ignore what God is trying to show you. Even Jesus paused, withdrew, and reflected. What are some emotions you've felt strongly this week?",
  },
  {
    role: "pastor",
    text: "… and a bit of frustration.",
  },
  {
    role: "mentor",
    text:
      "What do you think is underneath that frustration?",
  },
  {
    role: "pastor",
    text: "Feeling out of control.",
  },
  {
    role: "mentor",
    text:
      "Powerful awareness. Often, our surface emotions hide deeper truths.",
  },
  {
    role: "mentor",
    text:
      "[17:00 – Identity & Reflection] How do you currently see yourself?",
  },
  {
    role: "pastor",
    text:
      "I'd say… someone trying to grow, but still unsure.",
  },
  {
    role: "mentor",
    text:
      "That's honest, but I want to remind you—your identity is not in uncertainty. It's in Christ. Growth is part of the journey, not a sign of failure.",
  },
  {
    role: "pastor",
    text: "I needed to hear that.",
  },
  {
    role: "mentor",
    text:
      "Try journaling this week. Write down your thoughts, prayers, and reactions. It helps you see patterns.",
  },
  {
    role: "mentor",
    text:
      "[20:00 – Resources: Spiritual & Practical] What resources has God already placed in your life?",
  },
  {
    role: "pastor",
    text:
      "… my church, my family, and mentors like you.",
  },
  {
    role: "mentor",
    text:
      "Those are significant. Often we overlook what we already have. What about spiritual resources?",
  },
  {
    role: "pastor",
    text: "… the Bible… worship.",
  },
  {
    role: "mentor",
    text:
      "Those are not just routines—they are lifelines. How consistent are you with them?",
  },
  {
    role: "pastor",
    text: "I've been a bit inconsistent lately.",
  },
  {
    role: "mentor",
    text:
      "No condemnation—just an invitation to reconnect. Even 10–15 minutes daily can realign your heart.",
  },
  {
    role: "mentor",
    text:
      "[24:00 – Practical Application] What's one step you can take this week to build trust with God?",
  },
  {
    role: "pastor",
    text: "Intentional time in prayer daily.",
  },
  {
    role: "mentor",
    text: "Good. And for self-awareness?",
  },
  {
    role: "pastor",
    text: "Notice my thoughts and emotions.",
  },
  {
    role: "mentor",
    text: "And resources?",
  },
  {
    role: "pastor",
    text:
      "Reach out to someone in my church for accountability.",
  },
  {
    role: "mentor",
    text: "That's a strong plan.",
  },
  {
    role: "mentor",
    text:
      "[27:00 – Encouragement & Closing] Samuel, I want you to remember—you're not alone in this. Growth takes time, but God is patient and faithful.",
  },
  {
    role: "pastor",
    text:
      "Thank you, Pastor David. This really helped me reflect.",
  },
  {
    role: "mentor",
    text:
      "I'm glad. Let's check in next week and see how these steps are going.",
  },
  {
    role: "pastor", text: "Sounds good." },
  {
    role: "mentor",
    text:
      "Let's close in prayer. Father, thank You for Samuel. Strengthen his trust, deepen his awareness, and help him steward every resource You've given him. Guide him this week. In Jesus' name, amen.",
  },
  {
    role: "pastor",
    text: "Thank you again.",
  },
  {
    role: "mentor",
    text: "You're welcome. Take care—see you next time. [30:00 – Session Ends]",
  },
];
