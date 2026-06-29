import { useAuthStore } from '@/stores/auth.store';
import { useOnboardingStore } from '@/stores/onboarding.store';
import {
  getAuthenticatedHomeRoute,
  isMentorRole,
  isPastorRole,
  normalizeUserRole,
} from '@/utils/userRole';

const TAG = '[AuthNav]';

export type MountedStackGroup =
  | 'index'
  | 'unauthenticated'
  | 'pastor'
  | 'mentor'
  | 'director'
  | 'oauth'
  | 'schedule-meeting'
  | 'appointments'
  | 'not-found'
  | 'none';

export type AuthStackGuardState = {
  showIndex: boolean;
  isUnauthenticated: boolean;
  isPastor: boolean;
  isMentor: boolean;
  isDirector: boolean;
  anyStackMounted: boolean;
};

export function getAuthStackGuardState(
  isAuthenticated: boolean,
  user: { role?: string | null } | null,
): AuthStackGuardState {
  const role = normalizeUserRole(user?.role);
  const showIndex = !isAuthenticated && !user;
  const isUnauthenticated = !isAuthenticated;
  const isPastor = isAuthenticated && isPastorRole(role);
  const isMentor = isAuthenticated && isMentorRole(role);
  const isDirector = isAuthenticated && role === 'director';

  return {
    showIndex,
    isUnauthenticated,
    isPastor,
    isMentor,
    isDirector,
    anyStackMounted:
      showIndex || isUnauthenticated || isPastor || isMentor || isDirector,
  };
}

type AuthNavigationLogContext = {
  source: string;
  pathname?: string | null;
  segments?: readonly string[];
  homeRoute?: string | null;
  targetRoute?: string | null;
  startupTimeoutTriggered?: boolean;
  recoveryReason?: string | null;
  mountedStackGroup?: MountedStackGroup;
};

export function logAuthNavigationState({
  source,
  pathname,
  segments,
  homeRoute,
  targetRoute,
  startupTimeoutTriggered,
  recoveryReason,
  mountedStackGroup,
}: AuthNavigationLogContext) {
  const { isAuthenticated, user, hasHydrated, isInitialized } =
    useAuthStore.getState();
  const { hasProfilePicture } = useOnboardingStore.getState();
  const role = normalizeUserRole(user?.role);
  const resolvedHomeRoute = homeRoute ?? getAuthenticatedHomeRoute(user?.role);
  const guards = getAuthStackGuardState(isAuthenticated, user);

  console.log(TAG, source, {
    isAuthenticated,
    hasHydrated,
    isInitialized,
    user: user
      ? {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      : null,
    userRole: user?.role ?? null,
    normalizedRole: role,
    hasProfilePicture,
    userProfilePicture: !!user?.profilePicture,
    homeRoute: resolvedHomeRoute,
    targetRoute: targetRoute ?? null,
    pathname: pathname ?? null,
    segments: segments ? [...segments] : null,
    guards,
    mountedStackGroup: mountedStackGroup ?? null,
    deadZone: isAuthenticated && !guards.anyStackMounted,
    startupTimeoutTriggered: startupTimeoutTriggered ?? false,
    recoveryReason: recoveryReason ?? null,
  });

  if (isAuthenticated && !guards.anyStackMounted) {
    console.warn(
      TAG,
      'DEAD ZONE: authenticated but no Stack.Protected group is mounted',
      { role, user: user?.email },
    );
  }
}
