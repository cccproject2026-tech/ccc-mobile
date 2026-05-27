import { icons } from '@/constants/images';
import { useOnboardingStore } from '@/stores';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import {
    SafeAreaView,
    useSafeAreaInsets,
} from 'react-native-safe-area-context';

    const accent = {
        gold: '#E8C88A',
        mint: '#6FD4BE',
        mintSoft: 'rgba(111, 212, 190, 0.28)',
        tealDeep: '#0E5A62',
    };

    type WelcomeOptionProps = {
        icon: keyof typeof Ionicons.glyphMap;
        title: string;
        description: string;
        onPress: () => void;
        variant?: 'primary' | 'secondary' | 'track';
        isCompact: boolean;
    };

    function WelcomeOption({
        icon,
        title,
        description,
        onPress,
        variant = 'track',
        isCompact,
    }: WelcomeOptionProps) {
    const isPrimary = variant === 'primary';
    const isSecondary = variant === 'secondary';
    const isTrack = variant === 'track';

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.88}
            accessibilityRole="button"
            style={[
                styles.optionCardShell,
                isCompact && styles.optionCardShellCompact,
                isPrimary && styles.optionCardHighlight,
                isSecondary && styles.optionCardSecondary,
                isTrack && styles.optionCardTrack,
            ]}
        >
                <View
                    style={[
                        styles.optionRow,
                        isCompact && styles.optionRowCompact,
                    ]}
                >
                    <View
                        style={[
                            styles.optionIconWrap,
                            isCompact && styles.optionIconWrapCompact,
                    isPrimary && styles.optionIconWrapHighlight,
                    isSecondary && styles.optionIconWrapSecondary,
                    isTrack && styles.optionIconWrapTrack,
                ]}
                    >
                        <Ionicons
                            name={icon}
                            size={20}
                            color={
                                isPrimary
                                    ? accent.gold
                                    : isSecondary
                                      ? '#A8E6CF'
                                      : '#7DD4F8'
                            }
                        />
                    </View>
                    <View style={styles.optionTextWrap}>
                        <Text
                            style={[
                                styles.optionTitle,
                                isCompact && styles.optionTitleCompact,
                            ]}
                            numberOfLines={2}
                        >
                            {title}
                        </Text>
                        <Text
                            style={[
                                styles.optionDesc,
                                isCompact && styles.optionDescCompact,
                            ]}
                            numberOfLines={2}
                        >
                            {description}
                        </Text>
                    </View>
                <View
                    style={[
                        styles.optionChevronWrap,
                        isPrimary && styles.optionChevronWrapHighlight,
                        isSecondary && styles.optionChevronWrapSecondary,
                        isTrack && styles.optionChevronWrapTrack,
                    ]}
                >
                    <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={isPrimary ? accent.tealDeep : accent.mint}
                    />
                </View>
                </View>
            </TouchableOpacity>
        );
    }

    export default function WelcomeScreen() {
        const router = useRouter();
        const { bottom } = useSafeAreaInsets();
        const { width, height } = useWindowDimensions();
        const {
            interestStatus,
            isEmailVerified,
            isPasswordSet,
            userId,
            applicationId,
            email,
            interestData,
            hasHydrated,
        } = useOnboardingStore();
        const hasSubmittedApplication = !!(
            userId ||
            applicationId ||
            email ||
            interestData
        );

        const resumePath = useMemo(() => {
            if (!hasHydrated || !hasSubmittedApplication) return null;
            if (isPasswordSet) return '/(unauthenticated)/login-form';
            if (interestStatus === 'accepted' || isEmailVerified) {
                return '/(unauthenticated)/set-password';
            }
            if (interestStatus === 'rejected') {
                return '/(unauthenticated)/application-rejected';
            }
            return null;
        }, [
            hasHydrated,
            hasSubmittedApplication,
            isPasswordSet,
            interestStatus,
            isEmailVerified,
        ]);

        const layout = useMemo(() => {
            const isNarrow = width < 360;
            const isCompactHeight = height < 700;
            const isVeryCompact = height < 620;
            return {
                horizontalPad: isNarrow ? 16 : width >= 430 ? 28 : 20,
                contentMaxWidth: Math.min(width - 32, 440),
                isCompact: isCompactHeight,
                isVeryCompact,
                titleSize: isVeryCompact ? 24 : isCompactHeight ? 26 : 28,
                brandSize: isVeryCompact ? 76 : 90,
                logoWidth: Math.min(200, width * 0.52),
            };
        }, [width, height]);

        if (resumePath) {
            return <Redirect href={resumePath} />;
        }

        const handleGetStarted = () => {
            router.push('/get-started');
        };

        const handleLogin = () => {
            router.push('/(unauthenticated)/login-form');
        };

        const handleTrackApplication = () => {
            router.push('/(unauthenticated)/continue-application');
        };

        return (
            <LinearGradient
                colors={['#0D3B6E', '#0A5C8A', '#0B84B0']}
                locations={[0, 0.5, 1]}
                style={styles.gradient}
            >
                <View style={styles.bgCircleTop} pointerEvents="none" />
                <View style={styles.bgCircleBottom} pointerEvents="none" />

                <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                    <ScrollView
                        style={styles.scroll}
                        contentContainerStyle={[
                            styles.scrollContent,
                            {
                                paddingHorizontal: layout.horizontalPad,
                                paddingBottom: Math.max(bottom, 16) + 8,
                            },
                        ]}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View
                            style={[
                                styles.page,
                                { maxWidth: layout.contentMaxWidth },
                            ]}
                        >
                            <View
                                style={[
                                    styles.brandMark,
                                    layout.isVeryCompact && styles.brandMarkCompact,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.brandOuter,
                                        {
                                            width: layout.brandSize,
                                            height: layout.brandSize,
                                            borderRadius: layout.brandSize / 2,
                                        },
                                    ]}
                                >
                                    <View style={styles.brandInner}>
                                        <Ionicons
                                            name="leaf-outline"
                                            size={layout.isVeryCompact ? 24 : 28}
                                            color={accent.mint}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.headingBlock}>
                                <Text style={styles.eyebrow}>
                                    Center for Community Change
                                </Text>
                            <Text style={styles.title}>
                                    Welcome to the{' '}
                                    <Text style={styles.titleAccent}>Center</Text>
                                </Text>
                                <Text style={styles.subtitle}>
                                    How would you like to continue today?
                                </Text>
                            </View>

                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Ionicons name="leaf-outline" size={14} color={accent.mint} />
                            <View style={styles.dividerLine} />
                        </View>

                            <View style={styles.options}>
                                <WelcomeOption
                                    icon="rocket-outline"
                                    title="Get started"
                                    description="New here? Submit your interest and start onboarding."
                                    onPress={handleGetStarted}
                                    variant="primary"
                                    isCompact={layout.isCompact}
                                />
                                <WelcomeOption
                                    icon="log-in-outline"
                                    title="Already signed up "
                                    description="Sign in with your email and password."
                                    onPress={handleLogin}
                                    variant="secondary"
                                    isCompact={layout.isCompact}
                                />
                                <WelcomeOption
                                    icon="document-text-outline"
                                    title="Track your application"
                                    description="Already submitted? Continue where you left off."
                                    onPress={handleTrackApplication}
                                    variant="track"
                                    isCompact={layout.isCompact}
                                />
                            </View>

                            <View style={styles.logoContainer}>
                                <Image
                                    source={icons.universityIcon}
                                    style={[
                                        styles.logo,
                                        { width: layout.logoWidth },
                                    ]}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    const styles = StyleSheet.create({
        gradient: {
            flex: 1,
        },
        safeArea: {
            flex: 1,
            width: '100%',
        },
        scroll: {
            flex: 1,
            width: '100%',
        },
        scrollContent: {
            flexGrow: 1,
            alignItems: 'center',
            paddingTop: 8,
        },
        page: {
            width: '100%',
            alignSelf: 'center',
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
        brandMark: {
            alignItems: 'center',
            marginBottom: 20,
        },
        brandMarkCompact: {
            marginBottom: 14,
        },
        brandOuter: {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.06)',
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
            textAlign: 'center',
            letterSpacing: -0.4,
        },
        titleAccent: {
            color: accent.gold,
        },
        subtitle: {
            fontSize: 13,
            fontWeight: '400',
            color: 'rgba(255,255,255,0.55)',
            textAlign: 'center',
        },
        dividerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginBottom: 24,
            width: '100%',
        },
        dividerLine: {
            flex: 1,
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.12)',
        },
    options: {
        width: '100%',
        alignSelf: 'stretch',
        marginBottom: 20,
    },
    optionCardShell: {
        width: '100%',
        alignSelf: 'stretch',
        marginBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.14)',
        borderRadius: 14,
        borderLeftWidth: 3,
        borderLeftColor: accent.mint,
        overflow: 'hidden',
    },
    optionCardShellCompact: {
        marginBottom: 10,
    },
    optionRow: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 16,
        ...(Platform.OS === 'web'
            ? { display: 'flex' as const, flexDirection: 'row' as const }
            : {}),
    },
    optionRowCompact: {
        paddingVertical: 14,
    },
    optionCardHighlight: {
        borderLeftColor: accent.gold,
    },
    optionCardSecondary: {
        borderLeftColor: accent.mint,
    },
    optionCardTrack: {
        borderLeftColor: '#7DD4F8',
    },
    optionIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        marginRight: 14,
    },
    optionIconWrapCompact: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    optionIconWrapHighlight: {
        backgroundColor: 'rgba(232, 200, 138, 0.22)',
    },
    optionIconWrapSecondary: {
        backgroundColor: 'rgba(168, 230, 207, 0.15)',
    },
    optionIconWrapTrack: {
        backgroundColor: 'rgba(125, 212, 248, 0.15)',
    },
    optionTextWrap: {
        flex: 1,
        flexShrink: 1,
        flexGrow: 1,
        minWidth: 0,
        gap: 3,
        marginRight: 10,
    },
    optionTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    optionTitleCompact: {
        fontSize: 15,
    },
    optionDesc: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        lineHeight: 17,
        fontWeight: '400',
    },
    optionDescCompact: {
        fontSize: 12,
        lineHeight: 17,
    },
    optionChevronWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        flexShrink: 0,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionChevronWrapHighlight: {
        backgroundColor: 'rgba(232, 200, 138, 0.35)',
    },
    optionChevronWrapSecondary: {
        backgroundColor: accent.mintSoft,
    },
    optionChevronWrapTrack: {
        backgroundColor: 'rgba(125, 212, 248, 0.2)',
    },
        logoContainer: {
            alignItems: 'center',
            marginTop: 20,
            marginBottom: 8,
            width: '100%',
        },
        logo: {
            height: 44,
            maxWidth: '100%',
        },
    });
