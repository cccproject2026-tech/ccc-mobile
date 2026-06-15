import { useAuthStore } from '@/stores/auth.store';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export function useAuthBootstrap() {
  const { hasHydrated, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

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
