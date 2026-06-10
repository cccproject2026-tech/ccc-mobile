import { getScheduleMeetingBase } from '@/lib/scheduling/scheduleMeetingNavigation';
import { router, type Href } from 'expo-router';

function defaultReturnPathForRole(role?: string | null): string {
  const roleKey = String(role || '').toLowerCase();
  if (roleKey === 'mentor') return '/(mentor)/(tabs)/appointments';
  if (roleKey === 'director') return '/(director)/(tabs)/appointments';
  return '/(pastor)/(tabs)/appointments';
}

/** Map stored pathname values to valid Expo Router hrefs. */
export function normalizeGoogleCalendarOAuthReturnPath(
  path: string | null | undefined,
  role?: string | null,
): string {
  const raw = String(path || '').trim();
  if (!raw || raw.startsWith('/oauth/')) {
    return defaultReturnPathForRole(role);
  }

  if (
    raw.startsWith('/(pastor)') ||
    raw.startsWith('/(mentor)') ||
    raw.startsWith('/(director)')
  ) {
    return raw;
  }

  if (raw.startsWith('/schedule-meeting')) {
    const base = getScheduleMeetingBase(undefined, role);
    const suffix = raw.slice('/schedule-meeting'.length);
    return `${base}${suffix}`;
  }

  if (raw === '/appointments' || raw.endsWith('/appointments')) {
    return defaultReturnPathForRole(role);
  }

  if (raw === '/notifications' || raw.endsWith('/notifications')) {
    return defaultReturnPathForRole(role);
  }

  return raw;
}

/** Leave the OAuth loading route and return to schedule / appointments. */
export function leaveGoogleCalendarOAuthScreen(
  returnPath: string | null | undefined,
  role?: string | null,
): void {
  const primary = normalizeGoogleCalendarOAuthReturnPath(returnPath, role);
  const fallbacks = [
    primary,
    defaultReturnPathForRole(role),
    '/(pastor)/(tabs)/appointments',
  ];

  const unique = [...new Set(fallbacks)];

  for (const href of unique) {
    try {
      router.replace(href as Href);
      return;
    } catch {
      // try next candidate
    }
  }

  try {
    if (typeof router.canGoBack === 'function' && router.canGoBack()) {
      router.back();
    }
  } catch {
    // no-op
  }
}
