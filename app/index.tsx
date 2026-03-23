import { useOnboardingStore } from '@/stores';
import { useAuthStore } from '@/stores/auth.store';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PastorRole = 'pastor';
type MentorRole = 'mentor';
type RoleOption = PastorRole | MentorRole;

const accent = {
    gold: '#E8C88A',
    mint: '#6FD4BE',
    mintSoft: 'rgba(111, 212, 190, 0.28)',
    tealDeep: '#0E5A62',
};

export default function RoleSelectionScreen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();
    const [isClearing, setIsClearing] = useState(false);
    const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);

    const { user, isAuthenticated, logout } = useAuthStore();
    const { reset: resetOnboarding } = useOnboardingStore();

    const handleClearStorage = useCallback(async () => {
        Alert.alert('Clear All Data', 'This will log you out and clear all stored data. Continue?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Clear', style: 'destructive',
                onPress: async () => {
                    setIsClearing(true);
                    try {
                        await logout();
                        resetOnboarding();
                        await AsyncStorage.clear();
                        Alert.alert('Success', 'All data cleared.');
                    } catch (e) {
                        console.error(e);
                        Alert.alert('Error', 'Failed to clear data');
                    } finally {
                        setIsClearing(false);
                    }
                },
            },
        ]);
    }, []);

    const handleContinue = useCallback(() => {
        if (!selectedRole) return;

        if (selectedRole === 'pastor') {
            if (isAuthenticated && user?.role === 'pastor') {
                router.push('/(pastor)/(tabs)');
            } else {
                router.push({ pathname: '/(unauthenticated)/role-landing/[role]', params: { role: 'pastor' } });
            }
            return;
        }

        if (isAuthenticated && user?.role === 'mentor') {
            router.push('/(mentor)/(tabs)');
        } else {
            router.push({ pathname: '/(unauthenticated)', params: { role: 'mentor' } });
        }
    }, [isAuthenticated, router, selectedRole, user?.role]);

    const handlePastorRoleSelect = (role: PastorRole) => {
        setSelectedRole(role);
    };

    const handleMentorRoleSelect = (role: MentorRole) => {
        setSelectedRole(role);
    };

    const isPastorSelected = selectedRole === 'pastor';
    const isMentorSelected = selectedRole === 'mentor';
    
    return (
        <LinearGradient
            colors={["#0D3B6E", "#0A5C8A", "#0B84B0"]}
            locations={[0, 0.5, 1]}
            style={[styles.gradient, { paddingTop: top || 44, paddingBottom: bottom || 24 }]}
        >
            <View style={styles.bgCircleTop} />
            <View style={styles.bgCircleBottom} />

            {/* DEV — Clear data */}
            {/* {__DEV__ && (
                <Pressable
                    style={[styles.clearBtn, { top: (top || 44) + 8 }]}
                    onPress={handleClearStorage}
                    disabled={isClearing}
                >
                    {isClearing
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <>
                            <Ionicons name="trash-outline" size={16} color="#fff" />
                            <Text style={styles.clearBtnText}>Clear Data</Text>
                          </>
                    }
                </Pressable>
            )} */}

            <View style={styles.content}>

                {/* Brand mark */}
                <View style={styles.brandMark}>
                    <View style={styles.brandOuter}>
                        <View style={styles.brandInner}>
                            <Ionicons name="people-outline" size={26} color="#fff" />
                        </View>
                    </View>
                </View>

                {/* Heading */}
                <View style={styles.headingBlock}>
                    <Text style={styles.eyebrow}>Center for Community Change</Text>
                    <Text style={styles.title}>
                        Who are <Text style={styles.titleAccent}>you</Text>?
                    </Text>
                    <Text style={styles.subtitle}>
                        Choose your role to <Text style={styles.subtitleAccent}>get started</Text>.
                    </Text>
                </View>

                {/* Divider */}
                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Ionicons name="leaf-outline" size={14} color={accent.mint} />
                    <View style={styles.dividerLine} />
                </View>

                {/* Role cards */}
                <View style={styles.cards}>

                    <Pressable
                        style={[
                            styles.roleCard,
                            styles.pastorCard,
                            isPastorSelected && styles.roleCardSelected,
                            isPastorSelected && styles.pastorCardSelected,
                        ]}
                        onPress={() => handlePastorRoleSelect('pastor')}
                    >
                        <View style={styles.roleCardLeft}>
                            <View style={[styles.roleIconWrap, { backgroundColor: 'rgba(125,212,248,0.15)' }]}>
                                <Ionicons name="book-outline" size={20} color="#7DD4F8" />
                            </View>
                            <View style={styles.roleCardText}>
                                <Text style={styles.roleTitle}>Pastor</Text>
                                <Text style={styles.roleDesc}>Guide your church in meaningful community impact.</Text>
                            </View>
                        </View>
                        <View style={[styles.roleArrow, styles.pastorArrow]}>
                            <Ionicons
                                name={isPastorSelected ? 'checkmark' : 'chevron-forward'}
                                size={16}
                                color={accent.tealDeep}
                            />
                        </View>
                    </Pressable>

                    <Pressable
                        style={[
                            styles.roleCard,
                            styles.mentorCard,
                            isMentorSelected && styles.roleCardSelected,
                            isMentorSelected && styles.mentorCardSelected,
                        ]}
                        onPress={() => handleMentorRoleSelect('mentor')}
                    >
                        <View style={styles.roleCardLeft}>
                            <View style={[styles.roleIconWrap, { backgroundColor: 'rgba(168,230,207,0.15)' }]}>
                                <Ionicons name="person-outline" size={20} color="#A8E6CF" />
                            </View>
                            <View style={styles.roleCardText}>
                                <Text style={styles.roleTitle}>Mentor</Text>
                                <Text style={styles.roleDesc}>Coach and support leaders as they grow.</Text>
                            </View>
                        </View>
                        <View style={[styles.roleArrow, styles.mentorArrow]}>
                            <Ionicons
                                name={isMentorSelected ? 'checkmark' : 'chevron-forward'}
                                size={16}
                                color={accent.mint}
                            />
                        </View>
                    </Pressable>

                </View>

                {!!selectedRole && (
                    <Pressable style={styles.continueBtn} onPress={handleContinue}>
                        <Text style={styles.continueText}>Continue</Text>
                        <View style={styles.continueArrowCircle}>
                            <Ionicons name="arrow-forward" size={16} color={accent.tealDeep} />
                        </View>
                    </Pressable>
                )}

            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
        paddingHorizontal: 24,
        overflow: 'hidden',
    },
    bgCircleTop: {
        position: 'absolute',
        top: -130,
        right: -100,
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    bgCircleBottom: {
        position: 'absolute',
        bottom: -90,
        left: -80,
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },

    // DEV button
    clearBtn: {
        position: 'absolute',
        right: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(220,50,40,0.85)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        zIndex: 20,
    },
    clearBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },

    // Layout
    content: {
        flex: 1,
        justifyContent: 'center',
    },

    // Brand mark
    brandMark: {
        alignItems: 'center',
        marginBottom: 28,
    },
    brandOuter: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(111, 212, 190, 0.35)',
    },
    brandInner: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: accent.mintSoft,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(232, 200, 138, 0.35)',
    },

    // Heading
    headingBlock: {
        alignItems: 'center',
        marginBottom: 24,
        gap: 6,
    },
    eyebrow: {
        fontSize: 11,
        fontWeight: '600',
        color: accent.mint,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: -0.4,
    },
    titleAccent: {
        color: accent.gold,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '400',
        color: 'rgba(255,255,255,0.55)',
    },
    subtitleAccent: {
        color: accent.gold,
        fontWeight: '600',
    },

    // Divider
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },

    // Role cards
    cards: {
        gap: 12,
        marginBottom: 20,
    },
    roleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.14)',
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderLeftWidth: 3,
    },
    roleCardSelected: {
        borderWidth: 1.5,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    pastorCard: {
        borderLeftColor: accent.gold,
    },
    pastorCardSelected: {
        borderColor: 'rgba(232, 200, 138, 0.55)',
    },
    mentorCard: {
        borderLeftColor: accent.mint,
    },
    mentorCardSelected: {
        borderColor: 'rgba(111, 212, 190, 0.55)',
    },
    roleCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
    },
    roleIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    roleCardText: {
        flex: 1,
        gap: 3,
    },
    roleTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    roleDesc: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        lineHeight: 17,
    },
    roleArrow: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pastorArrow: {
        backgroundColor: 'rgba(232, 200, 138, 0.35)',
    },
    mentorArrow: {
        backgroundColor: accent.mintSoft,
    },
    continueBtn: {
        width: '100%',
        borderRadius: 999,
        paddingVertical: 16,
        paddingHorizontal: 22,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.24,
        shadowRadius: 14,
        elevation: 8,
    },
    continueText: {
        color: '#0A3F6B',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.2,
    },
    continueArrowCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(232, 200, 138, 0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Footer
    footerNote: {
        color: 'rgba(255,255,255,0.28)',
        fontSize: 11,
        textAlign: 'center',
        lineHeight: 16,
    },
});