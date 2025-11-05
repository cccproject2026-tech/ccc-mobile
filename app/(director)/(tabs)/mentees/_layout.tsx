import { Stack } from 'expo-router';

export default function MenteesLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="[id]" />
            <Stack.Screen name="mentees-location" />

            <Stack.Screen
                name="assign-mentor"

            />
            <Stack.Screen
                name="remove-mentor"

            />
        </Stack>
    );
}
