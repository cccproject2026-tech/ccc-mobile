import { useOnboardingStore } from '@/stores';
import { useAuthStore } from '@/stores/auth.store';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type PastorRole = 'pastor';
type MentorRole = 'mentor';

export default function RoleSelectionScreen() {
    const router = useRouter();
    const [isClearing, setIsClearing] = useState(false);

    const { user, isAuthenticated, logout } = useAuthStore();
    const { reset: resetOnboarding } = useOnboardingStore();

    // --------------------------
    // CLEAR STORAGE (DEV ONLY)
    // --------------------------
    const handleClearStorage = useCallback(async () => {
        Alert.alert(
            'Clear All Data',
            'This will log you out and clear all stored data. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        setIsClearing(true);
                        try {
                            await logout();
                            resetOnboarding();
                            await AsyncStorage.clear();
                            Alert.alert('Success', 'All data cleared.');
                        } catch (error) {
                            console.error(error);
                            Alert.alert('Error', 'Failed to clear data');
                        } finally {
                            setIsClearing(false);
                        }
                    },
                },
            ]
        );
    }, []);

    // --------------------------
    // ROLE SELECTION REDIRECT
    // --------------------------
    const handlePastorRoleSelect = (role: PastorRole) => {
        if (isAuthenticated && user?.role === 'pastor') {
            router.push('/(pastor)/(tabs)');
        } else {
            router.push({
                pathname: `/(unauthenticated)/role-landing/${role}`,
            });
        }
    };

    const handleMentorRoleSelect = (role: MentorRole) => {
        if (isAuthenticated && user?.role === 'mentor') {
            router.push('/(mentor)/(tabs)');
        } else {
            router.push({
                pathname: '/(unauthenticated)',
                params: { role },
            });
        }
    };

    // --------------------------
    // RENDER
    // --------------------------

    return (
        <SafeAreaView style={styles.container}>
            {/* CLEAR DATA BUTTON — DEV ONLY */}
            {__DEV__ && (
                <Pressable
                    style={styles.clearButton}
                    onPress={handleClearStorage}
                    disabled={isClearing}
                >
                    {isClearing ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Ionicons name="trash-outline" size={20} color="#fff" />
                            <Text style={styles.clearButtonText}>Clear Data</Text>
                        </>
                    )}
                </Pressable>
            )}

            <View style={styles.content}>
                <Text style={styles.title}>Who Are You?</Text>
                <Text style={styles.subtitle}>Choose how you want to continue</Text>

                <View style={styles.buttonContainer}>
                    <Pressable style={[styles.roleButton, styles.activeButton]}
                        onPress={() => handlePastorRoleSelect('pastor')}>
                        <Text style={styles.roleButtonText}>Pastor</Text>
                        <Text style={styles.roleDescription}>
                            For pastors, lay leaders and seminarians.
                        </Text>
                    </Pressable>

                    <Pressable style={[styles.roleButton, styles.activeButton]}
                        onPress={() => handleMentorRoleSelect('mentor')}>
                        <Text style={styles.roleButtonText}>Mentor</Text>
                        <Text style={styles.roleDescription}>
                            For mentors and field mentors.
                        </Text>
                    </Pressable>
                </View>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#176192' },

    /* DEV ONLY — Clear data */
    clearButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 8,
        zIndex: 20,
    },
    clearButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },

    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
    subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 20 },

    buttonContainer: { width: '100%', maxWidth: 400, gap: 16 },

    roleButton: {
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
    },
    activeButton: { backgroundColor: '#fff', borderColor: '#fff' },

    roleButtonText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1A5490',
        marginBottom: 4,
    },
    roleDescription: { fontSize: 14, color: '#666', textAlign: 'center' },
});
