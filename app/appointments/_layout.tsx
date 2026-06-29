import { Stack } from "expo-router";

export default function AppointmentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="meeting-details" />
    </Stack>
  );
}
