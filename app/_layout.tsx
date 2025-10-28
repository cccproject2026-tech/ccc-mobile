// app/_layout.tsx
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider"
import { AuthProvider, useAuth } from "@/context/AuthContext"
import { DataProvider } from "@/dataContext"
import "@/global.css"
import { useColorScheme } from "@/hooks/useColorScheme"
import {
  AlbertSans_300Light,
  AlbertSans_400Regular,
  AlbertSans_500Medium,
  AlbertSans_600SemiBold,
  AlbertSans_700Bold,
  useFonts,
} from "@expo-google-fonts/albert-sans"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native"
import { Stack, useRouter, useSegments } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { KeyboardProvider } from 'react-native-keyboard-controller'
import "react-native-reanimated"

// Navigation Guard Component - handles auth-based redirects
function NavigationGuard() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      console.log('NavigationGuard: Loading...');
      return;
    }

    const inAuthGroup = segments[0] === '(login)';
    const inPastorGroup = segments[0] === '(pastor-tabs)';

    console.log('NavigationGuard:', {
      isAuthenticated,
      user: user?.email,
      currentRoute: segments.join('/'),
      inAuthGroup,
      inPastorGroup
    });

    // ONLY protect pastor-tabs with authentication
    if (!isAuthenticated && inPastorGroup) {
      console.log('❌ Not authenticated, redirecting to home from pastor-tabs');
      setTimeout(() => {
        router.replace('/');
      }, 0);
    }
    // If authenticated and in login, redirect to pastor dashboard
    else if (isAuthenticated && inAuthGroup) {
      console.log('✅ Already authenticated, redirecting to pastor dashboard');
      router.replace('/(pastor-tabs)/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading, user, router]);

  return null;
}

// Main Layout Component
function LayoutContent() {
  const colorScheme = useColorScheme();

  return (
    <>
      <NavigationGuard />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <BottomSheetModalProvider>
            <GluestackUIProvider mode="light">
              <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                <Stack>
                  <Stack.Screen name="(pastor-tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="(mentor-tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="(director-tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="(login)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                </Stack>
                <StatusBar style="auto" />
              </ThemeProvider>
            </GluestackUIProvider>
          </BottomSheetModalProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </>
  );
}

// Root Layout - wraps everything with providers
export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const [fontsLoaded, fontError] = useFonts({
    AlbertSans_300Light,
    AlbertSans_400Regular,
    AlbertSans_500Medium,
    AlbertSans_600SemiBold,
    AlbertSans_700Bold,
  });

  if (!loaded || !fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <DataProvider>
        <LayoutContent />
      </DataProvider>
    </AuthProvider>
  );
}
