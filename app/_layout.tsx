import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider"
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
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { KeyboardProvider } from 'react-native-keyboard-controller'
import "react-native-reanimated"

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  })

  const [fontsLoaded, fontError] = useFonts({
    AlbertSans_300Light,
    AlbertSans_400Regular,
    AlbertSans_500Medium,
    AlbertSans_600SemiBold,
    AlbertSans_700Bold,
  })

  if (!loaded || !fontsLoaded) {
    // Async font loading only occurs in development.
    return null
  }

  return (
    <DataProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <BottomSheetModalProvider>
            <GluestackUIProvider mode="light">
              <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                <Stack>
                  <Stack.Screen name="(pastor-tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="(mentor-tabs)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="(director-tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="+not-found" />
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                </Stack>
                <StatusBar style="auto" />
              </ThemeProvider>
            </GluestackUIProvider>
          </BottomSheetModalProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </DataProvider>
  )
}
