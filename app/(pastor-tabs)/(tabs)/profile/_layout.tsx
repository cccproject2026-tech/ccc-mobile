import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right', // or 'none' to disable
        animationDuration: 200,
      }}
      initialRouteName="index" // Set initial route
    />
  );
}