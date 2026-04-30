import { FloatingToast } from '@/components/atom/toast';
import AppNotificationsProvider from '@/components/providers/AppNotificationsProvider';
import { DataProvider } from '@/dataContext';
import "@/global.css";
import '@/services/api/interceptors';
import { useAuthStore } from '@/stores/auth.store';
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from "react-native-keyboard-controller";
import Toast from 'react-native-toast-message';
import AppGradientBackground from "@/components/layout/AppGradientBackground";


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

function RootLayoutNav() {
  const { isAuthenticated, user } = useAuthStore();

  // Guard conditions
  const isPastor = isAuthenticated && (user?.role === 'pastor');
  const isMentor = isAuthenticated && user?.role === 'mentor';
  const isDirector = isAuthenticated && user?.role === 'director';
  const showIndex = !isAuthenticated && !user;
  const isUnauthenticated = !isAuthenticated;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      {/* ✅ ADDED: Root index - Always accessible for role selection */}
      <Stack.Protected guard={showIndex}>
        <Stack.Screen name="index" />
      </Stack.Protected>

      {/* Unauthenticated Routes */}
      <Stack.Protected guard={isUnauthenticated}>
        <Stack.Screen name="(unauthenticated)" />
      </Stack.Protected>

      {/* Pastor Routes */}
      <Stack.Protected guard={isPastor}>
        <Stack.Screen name="(pastor)" />
      </Stack.Protected>

      {/* Mentor Routes */}
      <Stack.Protected guard={isMentor}>
        <Stack.Screen name="(mentor)" />
      </Stack.Protected>

      {/* Director Routes - protected so logout from mentor doesn't land here as "Guest User" */}
      <Stack.Protected guard={isDirector}>
        <Stack.Screen name="(director)" />
      </Stack.Protected>

      <Stack.Screen name="+not-found" />
    </Stack>
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
