import { Stack } from 'expo-router';

export default function CreationStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    />
  );
}


