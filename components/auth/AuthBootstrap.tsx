import { useAuthStore } from '@/stores/auth.store';
import { getAuthenticatedHomeRoute } from '@/utils/userRole';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export function useAuthBootstrap() {
  const router = useRouter();
  const { isAuthenticated, user, hasHydrated, isInitialized, initialize } =
    useAuthStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (!hasHydrated || !isInitialized) return;
    if (!isAuthenticated || !user) return;

    const homeRoute = getAuthenticatedHomeRoute(user.role);
    if (homeRoute) {
      router.replace(homeRoute as any);
      return;
    }

    router.replace('/(unauthenticated)/login-form');
  }, [hasHydrated, isInitialized, isAuthenticated, user, router]);

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
    backgroundColor: 'transparent',
  },
});
