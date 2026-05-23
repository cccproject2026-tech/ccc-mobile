import { Stack } from 'expo-router';

export default function MentorsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="[id]" />
            <Stack.Screen name="schedule-meeting" />
        </Stack>
    );
}
