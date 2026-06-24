import { useAuthStore } from '@/stores/auth.store';
import { User } from '@/types/auth.types';
import { WELCOME_ROUTE } from '@/utils/auth-navigation';
import {
  AuthStackGuardState,
  getAuthStackGuardState,
  logAuthNavigationState,
  type MountedStackGroup,
} from '@/utils/auth-navigation-debug';
import { storage } from '@/utils/storage';
import { getAuthenticatedHomeRoute, normalizeUserRole } from '@/utils/userRole';
import { router } from 'expo-router';

const TAG = '[AuthNav]';

export const STARTUP_RECOVERY_TIMEOUT_MS = 4000;

export type StartupRouteValidation = {
  valid: boolean;
  reason: string | null;
  mountedGroups: MountedStackGroup[];
  activeGroup: MountedStackGroup;
};

let recoveryInFlight: Promise<void> | null = null;
let hasRecoveredThisSession = false;

export function getMountedStackGroups(
  guards: AuthStackGuardState,
): MountedStackGroup[] {
  const groups: MountedStackGroup[] = [];
  if (guards.showIndex) groups.push('index');
  if (guards.isUnauthenticated) groups.push('unauthenticated');
  if (guards.isPastor) groups.push('pastor');
  if (guards.isMentor) groups.push('mentor');
  if (guards.isDirector) groups.push('director');
  if (!groups.length) groups.push('none');
  return groups;
}

export function resolveActiveStackGroup(
  pathname: string | null | undefined,
  segments: readonly string[],
): MountedStackGroup {
  const root = segments[0] ?? '';
  if (root === '(unauthenticated)') return 'unauthenticated';
  if (root === '(pastor)') return 'pastor';
  if (root === '(mentor)') return 'mentor';
  if (root === '(director)') return 'director';
  if (root === 'oauth' || pathname?.startsWith('/oauth')) return 'oauth';
  if (root === 'schedule-meeting') return 'schedule-meeting';
  if (pathname === '/+not-found') return 'not-found';

  const normalizedPath = pathname ?? '';
  if (
    normalizedPath === '/' ||
    normalizedPath === '' ||
    root === 'index' ||
    normalizedPath === '/get-started' ||
    root === 'get-started'
  ) {
    return 'index';
  }

  return 'none';
}

export function isValidStartupRoute(
  pathname: string | null | undefined,
  segments: readonly string[],
  isAuthenticated: boolean,
  user: User | null,
): StartupRouteValidation {
  const guards = getAuthStackGuardState(isAuthenticated, user);
  const mountedGroups = getMountedStackGroups(guards);
  const activeGroup = resolveActiveStackGroup(pathname, segments);

  if (!guards.anyStackMounted) {
    return {
      valid: false,
      reason: 'no Stack.Protected group mounted',
      mountedGroups,
      activeGroup,
    };
  }

  if (activeGroup === 'oauth' || activeGroup === 'schedule-meeting') {
    return { valid: true, reason: null, mountedGroups, activeGroup };
  }

  if (!isAuthenticated) {
    if (activeGroup === 'index' || activeGroup === 'unauthenticated') {
      return { valid: true, reason: null, mountedGroups, activeGroup };
    }
    return {
      valid: false,
      reason: 'unauthenticated user on protected route',
      mountedGroups,
      activeGroup,
    };
  }

  const homeRoute = getAuthenticatedHomeRoute(user?.role);
  if (!homeRoute) {
    return {
      valid: false,
      reason: 'authenticated user has no home route',
      mountedGroups,
      activeGroup,
    };
  }

  if (activeGroup === 'none') {
    return {
      valid: false,
      reason: 'route could not be resolved',
      mountedGroups,
      activeGroup,
    };
  }

  if (!mountedGroups.includes(activeGroup)) {
    // Navigation may still be in-flight right after cold start.
    if (activeGroup === 'index') {
      return {
        valid: false,
        reason: 'authenticated user still on welcome route',
        mountedGroups,
        activeGroup,
      };
    }

    return {
      valid: false,
      reason: `active group "${activeGroup}" is not mounted`,
      mountedGroups,
      activeGroup,
    };
  }

  return { valid: true, reason: null, mountedGroups, activeGroup };
}

export function getInvalidSessionReason(
  isAuthenticated: boolean,
  user: User | null,
): string | null {
  if (!isAuthenticated) {
    return null;
  }

  if (!user) {
    return 'authenticated without user';
  }

  const role = normalizeUserRole(user.role);
  if (!user.role || role === 'pending') {
    return 'authenticated without valid role';
  }

  if (!getAuthenticatedHomeRoute(user.role)) {
    return `unsupported role "${user.role}"`;
  }

  return null;
}

type RecoverContext = {
  source: string;
  pathname?: string | null;
  segments?: readonly string[];
  startupTimeoutTriggered?: boolean;
  reason?: string | null;
};

export async function recoverStartupToWelcome(
  context: RecoverContext,
): Promise<void> {
  if (recoveryInFlight || hasRecoveredThisSession) {
    return recoveryInFlight ?? Promise.resolve();
  }

  hasRecoveredThisSession = true;

  recoveryInFlight = (async () => {
    logAuthNavigationState({
      source: context.source,
      pathname: context.pathname,
      segments: context.segments,
      startupTimeoutTriggered: context.startupTimeoutTriggered ?? false,
      recoveryReason: context.reason ?? null,
      mountedStackGroup: resolveActiveStackGroup(
        context.pathname,
        context.segments ?? [],
      ),
    });

    console.warn(TAG, 'startup recovery → welcome', context);

    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
      hasHydrated: true,
    });

    try {
      await storage.clearAll();
    } catch (error) {
      console.warn(TAG, 'startup recovery SecureStore clear failed', error);
    }

    requestAnimationFrame(() => {
      try {
        router.replace(WELCOME_ROUTE);
      } catch (error) {
        console.error(TAG, 'startup recovery navigation failed', error);
      }
    });

    logAuthNavigationState({
      source: `${context.source} (after recovery)`,
      pathname: WELCOME_ROUTE,
      segments: [],
      recoveryReason: context.reason ?? null,
      startupTimeoutTriggered: context.startupTimeoutTriggered ?? false,
      mountedStackGroup: 'index',
    });
  })().finally(() => {
    recoveryInFlight = null;
  });

  return recoveryInFlight;
}

export function runPostBootstrapSessionCheck(
  pathname: string | null | undefined,
  segments: readonly string[],
): boolean {
  const { isAuthenticated, user, hasHydrated, isInitialized } =
    useAuthStore.getState();

  if (!hasHydrated || !isInitialized) {
    return false;
  }

  const invalidSession = getInvalidSessionReason(isAuthenticated, user);
  if (invalidSession) {
    void recoverStartupToWelcome({
      source: 'post-bootstrap invalid session',
      pathname,
      segments,
      reason: invalidSession,
    });
    return true;
  }

  const guards = getAuthStackGuardState(isAuthenticated, user);
  if (!guards.anyStackMounted) {
    void recoverStartupToWelcome({
      source: 'post-bootstrap dead zone',
      pathname,
      segments,
      reason: 'no Stack.Protected group mounted',
    });
    return true;
  }

  return false;
}

export function resetStartupRecoveryForTests() {
  hasRecoveredThisSession = false;
  recoveryInFlight = null;
}
