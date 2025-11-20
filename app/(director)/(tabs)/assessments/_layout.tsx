import { Stack } from 'expo-router';

export default function AssessmentsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="assign-mentee" />
            <Stack.Screen name="create-assessment" />
        </Stack>
    );
}


