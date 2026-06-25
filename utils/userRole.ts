import { User, UserRole } from '@/types/auth.types';

const MENTOR_ROLES: UserRole[] = ['mentor', 'field-mentor'];
const PASTOR_STACK_ROLES: UserRole[] = ['pastor', 'lay-leader', 'seminarian'];

export function normalizeUserRole(role?: string | null): UserRole | string {
  const value = String(role ?? '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-');

  if (!value) return 'pending';
  if (
    value === 'field-mentor' ||
    value === 'fieldmentor' ||
    value === 'field-mentors'
  ) {
    return 'field-mentor';
  }
  if (value === 'layleader' || value === 'lay-leader' || value === 'lay-leaders') {
    return 'lay-leader';
  }
  if (value === 'seminarian' || value === 'seminarians') {
    return 'seminarian';
  }
  if (value === 'mentor') return 'mentor';
  if (value === 'pastor') return 'pastor';
  if (value === 'director') return 'director';

  return value;
}

export function isMentorRole(role?: string | null): boolean {
  return MENTOR_ROLES.includes(normalizeUserRole(role) as UserRole);
}

export function isPastorRole(role?: string | null): boolean {
  return PASTOR_STACK_ROLES.includes(normalizeUserRole(role) as UserRole);
}

export function normalizeApiUser(raw: Record<string, unknown> | User): User {
  const id = String(raw.id ?? raw._id ?? '');
  const { _id, ...rest } = raw as User & { _id?: string };
  const role = normalizeUserRole((rest as User).role) as User['role'];

  return {
    ...(rest as User),
    id,
    role,
    fieldMentorInvitation: (rest as User).fieldMentorInvitation,
  };
}

export function getAuthenticatedHomeRoute(role?: string | null): string | null {
  const normalized = normalizeUserRole(role);

  if (isPastorRole(normalized)) return '/(pastor)/(tabs)';
  if (isMentorRole(normalized)) return '/(mentor)/(tabs)';
  if (normalized === 'director') return '/(director)/(tabs)';

  return null;
}
