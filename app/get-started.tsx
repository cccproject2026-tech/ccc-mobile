import { useAuthStore } from '@/stores/auth.store';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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

export default function GetStartedScreen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();

    const { user, isAuthenticated } = useAuthStore();

    const handleRolePress = useCallback(
        (role: RoleOption) => {
            if (role === 'pastor' && isAuthenticated && user?.role === 'pastor') {
                router.push('/(pastor)/(tabs)');
                return;
            }
            if (role === 'mentor' && isAuthenticated && user?.role === 'mentor') {
                router.push('/(mentor)/(tabs)');
                return;
            }

            router.push({
                pathname: '/(unauthenticated)/role-landing/[role]',
                params: { role },
            });
        },
        [isAuthenticated, router, user?.role]
    );

    return (
        <LinearGradient
            colors={['#0D3B6E', '#0A5C8A', '#0B84B0']}
            locations={[0, 0.5, 1]}
            style={[styles.gradient, { paddingTop: top || 44, paddingBottom: bottom || 24 }]}
        >
            <View style={styles.bgCircleTop} />
            <View style={styles.bgCircleBottom} />

            <Pressable
                onPress={() => router.replace('/')}
                style={[styles.backButton, { top: (top || 44) + 8 }]}
                hitSlop={12}
            >
                <Ionicons name="chevron-back" size={26} color="#fff" />
            </Pressable>

            <View style={styles.content}>

                {}
                <View style={styles.brandMark}>
                    <View style={styles.brandOuter}>
                        <View style={styles.brandInner}>
                            <Ionicons name="people-outline" size={26} color="#fff" />
                        </View>
                    </View>
                </View>

                {}
                <View style={styles.headingBlock}>
                    <Text style={styles.eyebrow}>Center for Community Change</Text>
                    <Text style={styles.title}>
                        Who are <Text style={styles.titleAccent}>you</Text>?
                    </Text>
                    <Text style={styles.subtitle}>
                        Choose your role to <Text style={styles.subtitleAccent}>get started</Text>.
                    </Text>
                </View>

                {}
                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Ionicons name="leaf-outline" size={14} color={accent.mint} />
                    <View style={styles.dividerLine} />
                </View>

                {}
                <View style={styles.cards}>

                    <Pressable
                        style={[
                            styles.roleCard,
                            styles.pastorCard,
                        ]}
                        onPress={() => handleRolePress('pastor')}
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
                                name={'chevron-forward'}
                                size={16}
                                color={accent.tealDeep}
                            />
                        </View>
                    </Pressable>

                    <Pressable
                        style={[
                            styles.roleCard,
                            styles.mentorCard,
                        ]}
                        onPress={() => handleRolePress('mentor')}
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
                                name={'chevron-forward'}
                                size={16}
                                color={accent.mint}
                            />
                        </View>
                    </Pressable>

                </View>

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
    backButton: {
        position: 'absolute',
        left: 18,
        zIndex: 20,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)',
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
    content: {
        flex: 1,
        justifyContent: 'center',
    },
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
    pastorCard: {
        borderLeftColor: accent.gold,
    },
    mentorCard: {
        borderLeftColor: accent.mint,
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
});
