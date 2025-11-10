import { Stack } from 'expo-router';

export default function AssessmentsV2Layout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="assign-to" />
            <Stack.Screen name="select-assessment" />
            <Stack.Screen name="create-assessment" />
            <Stack.Screen name="edit-instructions" />
        </Stack>
    );
}

