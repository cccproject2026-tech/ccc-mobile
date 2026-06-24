import { useAuthStore } from '@/stores/auth.store';
import { logAuthNavigationState } from '@/utils/auth-navigation-debug';
import {
  getInvalidSessionReason,
  isValidStartupRoute,
  recoverStartupToWelcome,
  resolveActiveStackGroup,
  STARTUP_RECOVERY_TIMEOUT_MS,
} from '@/utils/startup-recovery';
import { getAuthenticatedHomeRoute } from '@/utils/userRole';
import { usePathname, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';

const ABSOLUTE_STARTUP_TIMEOUT_MS = STARTUP_RECOVERY_TIMEOUT_MS + 1000;

export function useStartupRecovery(isReady: boolean) {
  const pathname = usePathname();
  const segments = useSegments();
  const { isAuthenticated, user, hasHydrated, isInitialized } = useAuthStore();
  const routeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const routeTimeoutStartedRef = useRef(false);

  useEffect(() => {
    const absoluteTimeout = setTimeout(() => {
      const latest = useAuthStore.getState();
      const latestRouteCheck = isValidStartupRoute(
        pathname,
        segments,
        latest.isAuthenticated,
        latest.user,
      );
      const bootstrapStuck = !latest.hasHydrated || !latest.isInitialized;

      if (latestRouteCheck.valid && !bootstrapStuck) {
        return;
      }

      const reason = bootstrapStuck
        ? !latest.hasHydrated
          ? 'bootstrap hydration timeout'
          : 'bootstrap initialization timeout'
        : latestRouteCheck.reason;

      logAuthNavigationState({
        source: 'startup recovery absolute timeout triggered',
        pathname,
        segments,
        homeRoute: getAuthenticatedHomeRoute(latest.user?.role),
        mountedStackGroup: resolveActiveStackGroup(pathname, segments),
        startupTimeoutTriggered: true,
        recoveryReason: reason,
      });

      void recoverStartupToWelcome({
        source: 'startup recovery absolute timeout',
        pathname,
        segments,
        startupTimeoutTriggered: true,
        reason,
      });
    }, ABSOLUTE_STARTUP_TIMEOUT_MS);

    return () => clearTimeout(absoluteTimeout);
  }, [pathname, segments]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const invalidSession = getInvalidSessionReason(isAuthenticated, user);
    if (invalidSession) {
      void recoverStartupToWelcome({
        source: 'startup recovery invalid session',
        pathname,
        segments,
        reason: invalidSession,
      });
      return;
    }

    const routeCheck = isValidStartupRoute(pathname, segments, isAuthenticated, user);
    logAuthNavigationState({
      source: 'useStartupRecovery evaluate',
      pathname,
      segments,
      homeRoute: getAuthenticatedHomeRoute(user?.role),
      mountedStackGroup: routeCheck.activeGroup,
    });

    if (routeCheck.valid) {
      if (routeTimeoutRef.current) {
        clearTimeout(routeTimeoutRef.current);
        routeTimeoutRef.current = null;
      }
      routeTimeoutStartedRef.current = false;
      return;
    }

    if (routeTimeoutStartedRef.current) {
      return;
    }

    routeTimeoutStartedRef.current = true;
    routeTimeoutRef.current = setTimeout(() => {
      const latest = useAuthStore.getState();
      const latestRouteCheck = isValidStartupRoute(
        pathname,
        segments,
        latest.isAuthenticated,
        latest.user,
      );

      if (latestRouteCheck.valid) {
        return;
      }

      logAuthNavigationState({
        source: 'startup recovery timeout triggered',
        pathname,
        segments,
        homeRoute: getAuthenticatedHomeRoute(latest.user?.role),
        mountedStackGroup: resolveActiveStackGroup(pathname, segments),
        startupTimeoutTriggered: true,
        recoveryReason: latestRouteCheck.reason,
      });

      void recoverStartupToWelcome({
        source: 'startup recovery timeout',
        pathname,
        segments,
        startupTimeoutTriggered: true,
        reason: latestRouteCheck.reason,
      });
    }, STARTUP_RECOVERY_TIMEOUT_MS);

    return () => {
      if (routeTimeoutRef.current) {
        clearTimeout(routeTimeoutRef.current);
        routeTimeoutRef.current = null;
      }
    };
  }, [isReady, pathname, segments, isAuthenticated, user, hasHydrated, isInitialized]);
}
