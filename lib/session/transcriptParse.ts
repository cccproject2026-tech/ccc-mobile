import type { MentorshipTranscriptLine } from "@/types/session.types";

export type TranscriptLine = MentorshipTranscriptLine & { speaker?: string };

export type TranscriptParseOptions = {
  mentorName?: string;
  pastorName?: string;
};

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

function aliasesFor(name: string): string[] {
  const n = norm(name);
  if (!n) return [];
  const parts = n.split(" ").filter(Boolean);
  const first = parts[0] ?? "";
  const last = parts[parts.length - 1] ?? "";
  const out: string[] = [];
  if (n.length >= 2) out.push(n);
  if (first.length >= 2) out.push(first);
  if (first && last) out.push(`${first} ${last[0]}`);
  return Array.from(new Set(out));
}

function speakerMatchesAliases(speaker: string, aliases: string[]): boolean {
  const sNorm = norm(speaker);
  if (!sNorm) return false;
  const sFirst = sNorm.split(" ")[0] ?? "";

  return aliases.some((alias) => {
    if (!alias) return false;
    if (sNorm === alias) return true;
    if (sNorm.startsWith(`${alias} `)) return true;
    if (sNorm.endsWith(` ${alias}`)) return true;
    const aliasFirst = alias.split(" ")[0] ?? "";
    if (sFirst.length >= 2 && aliasFirst.length >= 2 && sFirst === aliasFirst) return true;
    return false;
  });
}

function roleFromSpeaker(
  speaker: string,
  mentorAliases: string[],
  pastorAliases: string[],
): MentorshipTranscriptLine["role"] | null {
  const mentorMatch = speakerMatchesAliases(speaker, mentorAliases);
  const pastorMatch = speakerMatchesAliases(speaker, pastorAliases);
  if (mentorMatch && pastorMatch) return null;
  if (mentorMatch) return "mentor";
  if (pastorMatch) return "pastor";
  return null;
}

function createRoleResolver(opts?: TranscriptParseOptions) {
  const mentorAliases = aliasesFor(opts?.mentorName ?? "");
  const pastorAliases = aliasesFor(opts?.pastorName ?? "");
  const speakerRoleMap = new Map<string, MentorshipTranscriptLine["role"]>();
  const speakerOrder: string[] = [];

  const rememberSpeaker = (speaker: string) => {
    const key = norm(speaker);
    if (!key || speakerOrder.includes(key)) return;
    speakerOrder.push(key);
  };

  const assignRoleForUnknownSpeaker = (speaker: string): MentorshipTranscriptLine["role"] => {
    const key = norm(speaker);
    const existing = speakerRoleMap.get(key);
    if (existing) return existing;

    const detected = roleFromSpeaker(speaker, mentorAliases, pastorAliases);
    if (detected) {
      speakerRoleMap.set(key, detected);
      return detected;
    }

    rememberSpeaker(speaker);

    // Two speakers, one name configured: the other participant gets the opposite role.
    if (speakerOrder.length === 2) {
      const [firstKey, secondKey] = speakerOrder;
      if (mentorAliases.length > 0 && pastorAliases.length === 0) {
        const firstRole = roleFromSpeaker(
          speakerOrder[0] === key ? speaker : speakerOrder[0],
          mentorAliases,
          pastorAliases,
        );
        if (firstKey === key && firstRole === "mentor") {
          speakerRoleMap.set(key, "mentor");
          return "mentor";
        }
        if (secondKey === key) {
          speakerRoleMap.set(key, "pastor");
          return "pastor";
        }
      }
    }

    // Default: first distinct speaker = mentor, second = pastor (mentorship session).
    const usedRoles = new Set(speakerRoleMap.values());
    const orderIndex = speakerOrder.indexOf(key);
    let nextRole: MentorshipTranscriptLine["role"];
    if (orderIndex === 0) {
      nextRole = "mentor";
    } else if (orderIndex === 1) {
      nextRole = "pastor";
    } else if (!usedRoles.has("mentor")) {
      nextRole = "mentor";
    } else if (!usedRoles.has("pastor")) {
      nextRole = "pastor";
    } else {
      nextRole = "mentor";
    }

    speakerRoleMap.set(key, nextRole);
    return nextRole;
  };

  return { assignRoleForUnknownSpeaker, rememberSpeaker };
}

export function parseTranscriptStringToLines(
  transcript: string,
  opts?: TranscriptParseOptions,
): TranscriptLine[] {
  const raw = (transcript ?? "").replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  let currentRole: MentorshipTranscriptLine["role"] = "mentor";
  let currentSpeaker: string | undefined;
  const out: TranscriptLine[] = [];
  const { assignRoleForUnknownSpeaker } = createRoleResolver(opts);

  for (const line of lines) {
    const match =
      /^(.+?)\b(mentor|pastor)\b\s*(?::|-)\s*(.*)$/i.exec(line) ||
      /^(mentor|pastor)\b\s*(?::|-)?\s*(.*)$/i.exec(line);
    if (match) {
      const roleToken = (match.length === 4 ? match[2] : match[1])!;
      const role = roleToken.toLowerCase() as MentorshipTranscriptLine["role"];
      currentRole = role;
      const speaker =
        match.length === 4
          ? `${match[1] ?? ""}${match[2] ?? ""}`.replace(/\s+/g, " ").trim()
          : role === "mentor"
            ? "Mentor"
            : "Pastor";
      currentSpeaker = speaker || currentSpeaker;
      const text = (match.length === 4 ? match[3] : match[2] ?? "").trim();
      if (text) out.push({ role, speaker: currentSpeaker, text });
      continue;
    }

    const speakerMatch = /^([^:]{1,40})\s*:\s*(.+)$/.exec(line);
    if (speakerMatch) {
      const speaker = (speakerMatch[1] ?? "").trim();
      const text = (speakerMatch[2] ?? "").trim();
      const role = assignRoleForUnknownSpeaker(speaker);
      currentRole = role;
      currentSpeaker = speaker || currentSpeaker;
      if (text) out.push({ role, speaker: currentSpeaker, text });
      continue;
    }

    out.push({ role: currentRole, speaker: currentSpeaker, text: line });
  }

  return reconcileTranscriptRoles(out, opts);
}

export function normalizeTranscriptLineArray(
  lines: (TranscriptLine | { role?: string; text?: string; speaker?: string })[],
  opts?: TranscriptParseOptions,
): TranscriptLine[] {
  const mentorAliases = aliasesFor(opts?.mentorName ?? "");
  const pastorAliases = aliasesFor(opts?.pastorName ?? "");
  const { assignRoleForUnknownSpeaker } = createRoleResolver(opts);

  const mapped = lines
    .map((line) => {
      const rawText = (line?.text ?? "").trim();
      if (!rawText) return null;
      const speakerMatch = /^([^:]{1,40})\s*:\s*(.+)$/.exec(rawText);
      const speaker = (line?.speaker ?? speakerMatch?.[1] ?? "").trim() || undefined;
      const text = (speakerMatch?.[2] ?? rawText).trim();
      const detectedRole = speaker
        ? roleFromSpeaker(speaker, mentorAliases, pastorAliases)
        : null;
      const rawRole = line?.role === "pastor" || line?.role === "mentor" ? line.role : null;
      const role =
        detectedRole ??
        (speaker ? assignRoleForUnknownSpeaker(speaker) : rawRole ?? "mentor");
      return { role, text, speaker };
    })
    .filter((line): line is TranscriptLine => !!line);

  return reconcileTranscriptRoles(mapped, opts);
}

/** Re-assign roles using speaker names when API lines all share the same role. */
function reconcileTranscriptRoles(
  lines: TranscriptLine[],
  opts?: TranscriptParseOptions,
): TranscriptLine[] {
  const mentorAliases = aliasesFor(opts?.mentorName ?? "");
  const pastorAliases = aliasesFor(opts?.pastorName ?? "");
  if (!mentorAliases.length && !pastorAliases.length) return lines;

  const speakers = Array.from(
    new Set(
      lines
        .map((l) => l.speaker?.trim())
        .filter((s): s is string => !!s && !/^(mentor|pastor)$/i.test(s)),
    ),
  );

  if (speakers.length === 0) return lines;

  const speakerRoleMap = new Map<string, MentorshipTranscriptLine["role"]>();
  for (const speaker of speakers) {
    const detected = roleFromSpeaker(speaker, mentorAliases, pastorAliases);
    if (detected) speakerRoleMap.set(norm(speaker), detected);
  }

  if (speakers.length === 2) {
    const [a, b] = speakers;
    const aKey = norm(a);
    const bKey = norm(b);
    if (!speakerRoleMap.has(aKey) && speakerRoleMap.has(bKey)) {
      speakerRoleMap.set(aKey, speakerRoleMap.get(bKey) === "mentor" ? "pastor" : "mentor");
    } else if (!speakerRoleMap.has(bKey) && speakerRoleMap.has(aKey)) {
      speakerRoleMap.set(bKey, speakerRoleMap.get(aKey) === "mentor" ? "pastor" : "mentor");
    } else if (!speakerRoleMap.has(aKey) && !speakerRoleMap.has(bKey)) {
      speakerRoleMap.set(aKey, "mentor");
      speakerRoleMap.set(bKey, "pastor");
    }
  }

  speakers.forEach((speaker, index) => {
    const key = norm(speaker);
    if (speakerRoleMap.has(key)) return;
    speakerRoleMap.set(key, index === 0 ? "mentor" : "pastor");
  });

  return lines.map((line) => {
    const speaker = line.speaker?.trim();
    if (!speaker || /^(mentor|pastor)$/i.test(speaker)) return line;
    const role = speakerRoleMap.get(norm(speaker));
    return role ? { ...line, role } : line;
  });
}

export function messageBodyForTranscriptLine(line: TranscriptLine): string {
  const base = line.text.trim();
  const speaker = line.speaker?.trim();
  if (!speaker || /^(mentor|pastor)$/i.test(speaker)) return base;
  const prefix = `${speaker}: `;
  if (base.toLowerCase().startsWith(prefix.toLowerCase())) {
    return base.slice(prefix.length).trim();
  }
  return base;
}
