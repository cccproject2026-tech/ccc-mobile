import { Stack } from "expo-router";
import React from "react";

export default function ReviewCenterLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="list" />
    </Stack>
  );
}
