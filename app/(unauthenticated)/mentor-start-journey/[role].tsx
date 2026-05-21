import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MentorRole = "mentor";

/** Same accents as role-landing (gold warmth, mint growth) on the blue gradient. */
const accent = {
    gold: "#E8C88A",
    mint: "#6FD4BE",
    mintSoft: "rgba(111, 212, 190, 0.28)",
    tealDeep: "#0E5A62",
};

const mapRoleToLabel = (role?: string): string => {
    switch (role) {
        case "mentor":
            return "Mentor";
        default:
            return "";
    }
};

const STEPS = [
    {
        icon: "search-outline" as const,
        number: "01",
        title: "Understand your calling",
        description: "Learn how mentoring helps mentees grow through support and faith.",
    },
    {
        icon: "people-outline" as const,
        number: "02",
        title: "Build supportive relationships",
        description: "Foster meaningful connections rooted in Christ’s love.",
    },
    {
        icon: "leaf-outline" as const,
        number: "03",
        title: "Guide action in community",
        description: "Help mentees take practical steps and track progress over time.",
    },
];

export default function MentorStartJourneyScreen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();
    const { role } = useLocalSearchParams<{ role?: MentorRole }>();
    const roleLabel = useMemo(() => mapRoleToLabel(role), [role]);
    const [activeStep, setActiveStep] = useState(0);

    const handleBack = useCallback(() => {
        try {
            router.back();
        } catch {
            router.replace("/");
        }
    }, [router]);

    const handleSkip = useCallback(() => {
        router.push({
            pathname: "/(unauthenticated)/interest-form",
            params: role ? { role } : undefined,
        });
    }, [router, role]);

    const handleContinue = useCallback(() => {
        router.push(
            `/(unauthenticated)/mentor-start-journey/step-2/${role || "mentor"}` as any
        );
    }, [router, role]);

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={["#0D3B6E", "#0A5C8A", "#0B84B0"]}
                locations={[0, 0.5, 1]}
                style={[styles.gradient, { paddingTop: top || 44, paddingBottom: bottom || 24 }]}
            >
                <View style={styles.bgCircleTop} />
                <View style={styles.bgCircleBottom} />

                <View style={styles.topBar}>
                    <Pressable onPress={handleBack} hitSlop={12} style={styles.backBtn}>
                        <Ionicons
                            name="chevron-back"
                            size={20}
                            color="rgba(255,255,255,0.9)"
                        />
                    </Pressable>

                    <Pressable onPress={handleSkip} hitSlop={12} style={styles.skipBtn}>
                        <Text style={styles.skipText}>Skip</Text>
                    </Pressable>
                </View>

                <View style={styles.content}>
                    {/* Illustration area */}
                    <View style={styles.illustrationArea}>
                        <View style={styles.outerRing}>
                            <View style={styles.innerRing}>
                                <View style={styles.centerIcon}>
                                    <Ionicons
                                        name={STEPS[activeStep].icon}
                                        size={24}
                                        color="#fff"
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.headingBlock}>
                        <Text style={styles.headingLight}>We will guide you</Text>
                        <Text style={styles.headingStrong}>
                            to lead with <Text style={styles.headingAccent}>care</Text>
                        </Text>
                        <Text style={styles.headingLight}>
                            and grow your <Text style={styles.headingImpact}>impact</Text>.
                        </Text>
                    </View>

                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Ionicons name="leaf-outline" size={14} color={accent.mint} />
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Step cards */}
                    <View style={styles.cardList}>
                        {STEPS.map((step, i) => {
                            const isActive = i === activeStep;
                            return (
                                <Pressable
                                    key={i}
                                    onPress={() => setActiveStep(i)}
                                    style={[
                                        styles.card,
                                        i % 2 === 0 ? styles.cardStripeGold : styles.cardStripeMint,
                                        isActive && styles.cardActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.cardNumber,
                                            i % 2 === 0
                                                ? styles.cardNumberGold
                                                : styles.cardNumberMint,
                                        ]}
                                    >
                                        {step.number}
                                    </Text>

                                    <View style={styles.cardBody}>
                                        <Text
                                            style={[
                                                styles.cardTitle,
                                                isActive && styles.cardTitleActive,
                                            ]}
                                        >
                                            {step.title}
                                        </Text>
                                        <Text style={styles.cardDesc}>{step.description}</Text>
                                    </View>

                                    <View style={styles.cardIcon}>
                                        <Ionicons name={step.icon} size={20} color="#fff" />
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>

                    {!!roleLabel && <Text style={styles.hiddenRoleText}>{roleLabel}</Text>}
                </View>

                <View style={styles.bottomArea}>
                    <Pressable onPress={handleContinue} style={styles.continueBtn}>
                        <Text style={styles.continueText}>Continue</Text>
                        <View style={styles.continueArrowCircle}>
                            <Ionicons
                                name="arrow-forward"
                                size={16}
                                color={accent.tealDeep}
                            />
                        </View>
                    </Pressable>

                    <Text style={styles.disclaimer}>
                        By continuing, you agree to our{" "}
                        <Text style={styles.disclaimerLink}>Terms of Service</Text> and{" "}
                        <Text style={styles.disclaimerLink}>Privacy Policy</Text>.
                    </Text>
                </View>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
        paddingHorizontal: 24,
        overflow: "hidden",
    },
    bgCircleTop: {
        position: "absolute",
        top: -140,
        right: -110,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: "rgba(255,255,255,0.04)",
    },
    bgCircleBottom: {
        position: "absolute",
        bottom: -100,
        left: -90,
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: "rgba(255,255,255,0.04)",
    },

    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 18,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.14)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
    },
    skipBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    skipText: {
        color: "rgba(255,255,255,0.55)",
        fontSize: 13,
        fontWeight: "500",
    },

    content: {
        flex: 1,
    },
    illustrationArea: {
        alignItems: "center",
        marginBottom: 16,
    },
    outerRing: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(255,255,255,0.06)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(111, 212, 190, 0.35)",
    },
    innerRing: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "rgba(255,255,255,0.08)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(232, 200, 138, 0.35)",
    },
    centerIcon: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: accent.mintSoft,
        alignItems: "center",
        justifyContent: "center",
    },

    headingBlock: {
        marginBottom: 12,
    },
    headingLight: {
        fontSize: 18,
        fontWeight: "400",
        color: "rgba(255,255,255,0.65)",
        lineHeight: 24,
    },
    headingStrong: {
        fontSize: 24,
        fontWeight: "700",
        color: "#fff",
        lineHeight: 30,
    },
    headingAccent: {
        color: accent.gold,
        fontWeight: "700",
    },
    headingImpact: {
        color: accent.gold,
        fontWeight: "600",
    },

    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
    },

    cardList: {
        gap: 16,
        marginBottom: 8,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderLeftWidth: 3,
    },
    cardStripeGold: {
        borderLeftColor: accent.gold,
        borderColor: "rgba(111, 212, 190, 0.25)",
    },
    cardStripeMint: {
        borderLeftColor: accent.mint,
        borderColor: "rgba(255,255,255,0.14)",
    },
    cardActive: {
        backgroundColor: "rgba(255,255,255,0.12)",
        borderColor: "rgba(111, 212, 190, 0.45)",
    },
    cardNumber: {
        fontSize: 20,
        fontWeight: "800",
        width: 28,
        letterSpacing: -0.5,
    },
    cardNumberGold: {
        color: accent.gold,
    },
    cardNumberMint: {
        color: accent.mint,
    },
    cardBody: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 2,
        lineHeight: 18,
    },
    cardTitleActive: {
        color: "#fff",
    },
    cardDesc: {
        fontSize: 11,
        fontWeight: "400",
        color: "rgba(255,255,255,0.5)",
        lineHeight: 16,
    },
    cardIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: accent.mintSoft,
        alignItems: "center",
        justifyContent: "center",
    },

    bottomArea: {
        gap: 8,
        paddingTop: 6,
        paddingBottom: 4,
    },
    continueBtn: {
        width: "100%",
        borderRadius: 999,
        paddingVertical: 16,
        paddingHorizontal: 24,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
        elevation: 8,
    },
    continueText: {
        color: "#0A3F6B",
        fontWeight: "700",
        fontSize: 16,
        letterSpacing: 0.2,
    },
    continueArrowCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(232, 200, 138, 0.35)",
        alignItems: "center",
        justifyContent: "center",
    },
    disclaimer: {
        color: "rgba(255,255,255,0.3)",
        fontSize: 11,
        lineHeight: 16,
        textAlign: "center",
    },
    disclaimerLink: {
        color: accent.mint,
        textDecorationLine: "underline",
    },
    hiddenRoleText: {
        position: "absolute",
        left: -9999,
        top: -9999,
    },
});

