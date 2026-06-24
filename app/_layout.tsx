import { FloatingToast } from '@/components/atom/toast';
import AppNotificationsProvider from '@/components/providers/AppNotificationsProvider';
import { DataProvider } from '@/dataContext';
import "@/global.css";
import { useGoogleCalendarOAuthReturn } from '@/hooks/googleCalendar/useGoogleCalendarOAuthReturn';
import '@/services/api/interceptors';
import { useAuthStore } from '@/stores/auth.store';
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, usePathname, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from "react-native-keyboard-controller";
import Toast from 'react-native-toast-message';
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { AuthBootstrapSplash, useAuthBootstrap } from '@/components/auth/AuthBootstrap';
import { useStartupRecovery } from '@/hooks/auth/useStartupRecovery';
import {
  getAuthStackGuardState,
  logAuthNavigationState,
} from '@/utils/auth-navigation-debug';
import {
  recoverStartupToWelcome,
  resolveActiveStackGroup,
} from '@/utils/startup-recovery';
import {
  getAuthenticatedHomeRoute,
  isMentorRole,
  isPastorRole,
  normalizeUserRole,
} from '@/utils/userRole';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const toastConfig = {
  floating: (props: any) => <FloatingToast {...props} />,
};

const TransparentNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent",
  },
};

function GoogleCalendarOAuthListener() {
  useGoogleCalendarOAuthReturn();
  return null;
}

function RootLayoutNav() {
  const { isAuthenticated, user } = useAuthStore();
  const { isReady } = useAuthBootstrap();
  const pathname = usePathname();
  const segments = useSegments();
  useStartupRecovery(isReady);
  const role = normalizeUserRole(user?.role);

  const isPastor = isAuthenticated && isPastorRole(role);
  const isMentor = isAuthenticated && isMentorRole(role);
  const isDirector = isAuthenticated && role === 'director';
  const showIndex = !isAuthenticated && !user;
  const isUnauthenticated = !isAuthenticated;
  const canUseScheduleMeeting =
    isAuthenticated &&
    !!user &&
    (isPastorRole(role) || isMentorRole(role) || role === 'director');

  const prevAuthRef = useRef(isAuthenticated);
  useEffect(() => {
    const authChanged = prevAuthRef.current !== isAuthenticated;
    prevAuthRef.current = isAuthenticated;

    if (authChanged || isAuthenticated) {
      const guards = getAuthStackGuardState(isAuthenticated, user);
      logAuthNavigationState({
        source: authChanged
          ? 'RootLayoutNav auth transition'
          : 'RootLayoutNav route change',
        pathname,
        segments,
        homeRoute: getAuthenticatedHomeRoute(user?.role),
        mountedStackGroup: resolveActiveStackGroup(pathname, segments),
      });

      if (isAuthenticated && !guards.anyStackMounted) {
        console.error(
          '[AuthNav] Authenticated screen not mounted — no guard is true',
          guards,
        );
        void recoverStartupToWelcome({
          source: 'RootLayoutNav dead zone',
          pathname,
          segments,
          reason: 'no Stack.Protected group mounted',
        });
      }
    }
  }, [isAuthenticated, user, user?.role, pathname, segments]);

  return (
    <>
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      {}
      <Stack.Protected guard={showIndex}>
        <Stack.Screen name="index" />
        <Stack.Screen name="get-started" />
      </Stack.Protected>

      {}
      <Stack.Protected guard={isUnauthenticated}>
        <Stack.Screen name="(unauthenticated)" />
      </Stack.Protected>

      {}
      <Stack.Protected guard={isPastor}>
        <Stack.Screen name="(pastor)" />
      </Stack.Protected>

      {}
      <Stack.Protected guard={isMentor}>
        <Stack.Screen name="(mentor)" />
      </Stack.Protected>

      {}
      <Stack.Protected guard={isDirector}>
        <Stack.Screen name="(director)" />
      </Stack.Protected>

      <Stack.Protected guard={canUseScheduleMeeting}>
        <Stack.Screen name="schedule-meeting" />
      </Stack.Protected>

      <Stack.Screen
        name="oauth"
        options={{ headerShown: false, animation: "none" }}
      />

      <Stack.Screen name="+not-found" />
    </Stack>
    {!isReady && <AuthBootstrapSplash />}
    </>
  );
}

export default function RootLayout() {
  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <DataProvider>
            <KeyboardProvider>
              <BottomSheetModalProvider>
                <AppNotificationsProvider>
                  <ThemeProvider value={TransparentNavTheme}>
                    <AppGradientBackground>
                      <GoogleCalendarOAuthListener />
                      <RootLayoutNav />
                    </AppGradientBackground>
                  </ThemeProvider>
                </AppNotificationsProvider>
                <Toast config={toastConfig} topOffset={60} />
              </BottomSheetModalProvider>
            </KeyboardProvider>
          </DataProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </>
  );
}
