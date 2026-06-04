import { MicrograntApplication, MicrograntApplicationDetail } from '@/types/grant.type';

export const MICROGRANT_QUESTION_LABELS = [
  'Name of the church',
  'Name of the project/program',
  'Who does the project/program serve and why is it important?',
  'Amount requested',
  'Project amount of denominational support (Local Conference, Union, NAD, GC, etc.)',
  'What action steps will you take to achieve your goals?',
  'What resources do you already have?',
  'Who will be leading and overseeing the project/program, and what are their qualifications?',
  'What are the measurable markers of your success?',
] as const;

export type MicrograntQuestionKey = (typeof MICROGRANT_QUESTION_LABELS)[number];

export const MICROGRANT_PAGE_TITLE =
  'The Center for Community Change Micro-Grant Application';

export const MICROGRANT_PAGE_DESCRIPTION =
  'Please keep in mind that the church applying for a grant must become a partner with the CCC by signing a MOU.';

export const MICROGRANT_REPORTING_TEXT = [
  'If approved, you will sign a grant agreement that lays out action steps. CCC may request mid-year updates and a final report upon completion.',
  'Upon completion of this project, the grantee church agrees to submit a general reporting form in light of the goals listed in the application.',
  'Our hope is that you will form valuable stories of connection that can be replicated and shared.',
];

export const MICROGRANT_CONFIRMATION_LABELS = {
  reviewed:
    'I have reviewed the application and filled out each section to the best of my knowledge.',
  uploadsIncluded:
    "I have included all of my uploads, and I realize this ensures it's sent within 4 weeks after receipt.",
};

export function createEmptyMicrograntAnswers(): Record<MicrograntQuestionKey, string> {
  return MICROGRANT_QUESTION_LABELS.reduce(
    (acc, label) => {
      acc[label] = '';
      return acc;
    },
    {} as Record<MicrograntQuestionKey, string>
  );
}

export function unwrapMicrograntApplicationsList(res: { data?: unknown }): MicrograntApplication[] {
  const root = res?.data as Record<string, unknown> | unknown[] | undefined | null;
  if (root == null) return [];
  if (Array.isArray(root)) return root as MicrograntApplication[];
  if (typeof root === 'object') {
    const r = root as Record<string, unknown>;
    const candidates = [r.data, r.applications, r.items, r.records];
    for (const inner of candidates) {
      if (Array.isArray(inner)) return inner as MicrograntApplication[];
    }
  }
  return [];
}

export function unwrapMicrograntWithUser(
  res: { data?: unknown }
): MicrograntApplicationDetail | null {
  const root = res?.data;
  if (root == null || typeof root !== 'object') return null;
  const r = root as Record<string, unknown>;
  const inner = r.data;
  if (inner && typeof inner === 'object') {
    const p = inner as Record<string, unknown>;
    if (p.user && p.application) return inner as MicrograntApplicationDetail;
  }
  if (r.user && r.application) return r as unknown as MicrograntApplicationDetail;
  return null;
}

export function getMicrograntApplicantUserId(app: MicrograntApplication): string | undefined {
  const u = app.userId as unknown;
  if (typeof u === 'string' && u.trim()) return u.trim();
  if (u && typeof u === 'object' && '_id' in (u as object)) {
    const id = (u as { _id?: string })._id;
    if (id != null && String(id).trim() !== '') return String(id);
  }
  return undefined;
}

export function getMicrograntApplicantEmail(app: MicrograntApplication): string | undefined {
  const u = app.userId;
  if (u && typeof u === 'object' && typeof u.email === 'string') {
    return u.email;
  }
  return undefined;
}

export function micrograntListDetailSlug(app: MicrograntApplication): string | undefined {
  return getMicrograntApplicantUserId(app) ?? (app._id ? String(app._id) : undefined);
}

export function applicantDisplayName(app: MicrograntApplication): string {
  const u = app.userId;
  if (u && typeof u === 'object') {
    const fn = u.firstName?.trim();
    const ln = u.lastName?.trim();
    if (fn || ln) return [fn, ln].filter(Boolean).join(' ');
    if (u.email) return u.email;
  }
  return 'Unknown';
}

export function churchLabelFromApplication(app: MicrograntApplication): string {
  const a = app.answers ?? {};
  return (
    (a['Church Name'] as string) ||
    (a['Name of the church'] as string) ||
    (a['name of the church'] as string) ||
    (Object.values(a)[0] as string) ||
    'Not provided'
  );
}

export function normalizeMicrograntSupportingDocs(
  raw: unknown
): { name: string; url: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((doc, idx) => {
    if (typeof doc === 'string') {
      const looksUrl = /^https?:\/\//i.test(doc);
      return {
        name: looksUrl ? `Document ${idx + 1}` : doc,
        url: looksUrl ? doc : '#',
      };
    }
    if (doc && typeof doc === 'object') {
      const o = doc as { name?: string; url?: string };
      const url = typeof o.url === 'string' ? o.url : '#';
      const name =
        typeof o.name === 'string' && o.name ? o.name : `Document ${idx + 1}`;
      return { name, url };
    }
    return { name: `Document ${idx + 1}`, url: '#' };
  });
}

export function formatMicrograntStatus(status?: string): string {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function micrograntStatusColor(status?: string): string {
  const s = (status || '').toLowerCase();
  if (s === 'accepted') return '#41B36E';
  if (s === 'rejected') return '#FF6B6B';
  if (s === 'pending') return '#FFD84E';
  return '#8ec5eb';
}
export function displayNameFromMicrograntDetail(
  detail: MicrograntApplicationDetail,
  profile?: { firstName?: string; lastName?: string } | null,
): string {
  const fn = profile?.firstName?.trim();
  const ln = profile?.lastName?.trim();
  if (fn || ln) return [fn, ln].filter(Boolean).join(' ');
  if (detail.user?.email) return detail.user.email;
  const church = churchLabelFromApplication(detail.application);
  if (church && church !== 'Not provided') return church;
  return applicantDisplayName(detail.application);
}