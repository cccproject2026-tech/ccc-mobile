import { useAuthStore } from '@/stores/auth.store';
import { logAuthNavigationState } from '@/utils/auth-navigation-debug';
import {
  getInvalidSessionReason,
  recoverStartupToWelcome,
  runPostBootstrapSessionCheck,
} from '@/utils/startup-recovery';
import { getAuthenticatedHomeRoute } from '@/utils/userRole';
import { usePathname, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export function useAuthBootstrap() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const { hasHydrated, isInitialized, isAuthenticated, user, initialize } =
    useAuthStore();
  const sessionNavigatedRef = useRef<string | null>(null);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (!hasHydrated || !isInitialized) {
      return;
    }

    logAuthNavigationState({
      source: 'AuthBootstrap ready',
      pathname,
      segments,
    });

    if (runPostBootstrapSessionCheck(pathname, segments)) {
      sessionNavigatedRef.current = null;
      return;
    }

    if (!isAuthenticated || !user) {
      sessionNavigatedRef.current = null;
      return;
    }

    const invalidSession = getInvalidSessionReason(isAuthenticated, user);
    if (invalidSession) {
      void recoverStartupToWelcome({
        source: 'AuthBootstrap invalid session',
        pathname,
        segments,
        reason: invalidSession,
      });
      return;
    }

    const homeRoute = getAuthenticatedHomeRoute(user.role);
    if (!homeRoute) {
      void recoverStartupToWelcome({
        source: 'AuthBootstrap missing homeRoute',
        pathname,
        segments,
        reason: `no home route for role "${user.role}"`,
      });
      return;
    }

    const sessionKey = user.id || user.email;
    if (sessionNavigatedRef.current === sessionKey) {
      return;
    }

    sessionNavigatedRef.current = sessionKey;

    logAuthNavigationState({
      source: 'AuthBootstrap cold-start navigate',
      pathname,
      segments,
      homeRoute,
      targetRoute: homeRoute,
    });

    requestAnimationFrame(() => {
      router.replace(homeRoute as any);
    });
  }, [
    hasHydrated,
    isInitialized,
    isAuthenticated,
    user,
    user?.id,
    user?.role,
    router,
    pathname,
    segments,
  ]);

  return {
    isReady: hasHydrated && isInitialized,
  };
}

export function AuthBootstrapSplash() {
  return (
    <View style={styles.splash}>
      <ActivityIndicator size="large" color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 59, 92, 0.35)',
  },
});
