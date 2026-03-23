import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PastorRole = "pastor" | "layleader" | "seminarian";

/** Same accents as role-landing (gold warmth, mint growth) on the blue gradient. */
const accent = {
    gold: "#E8C88A",
    mint: "#6FD4BE",
    mintSoft: "rgba(111, 212, 190, 0.28)",
    tealDeep: "#0E5A62",
};

const mapRoleToLabel = (role?: string): string => {
    switch (role) {
        case "pastor": return "Pastor";
        case "layleader": return "Lay Leader";
        case "seminarian": return "Seminarian";
        default: return "";
    }
};

const STEPS = [
    {
        icon: "search-outline" as const,
        title: "Understand your community",
        description: "Discover the needs and strengths of those around you.",
    },
    {
        icon: "people-outline" as const,
        title: "Build relationships",
        description: "Foster meaningful connections rooted in Christ's love.",
    },
    {
        icon: "leaf-outline" as const,
        title: "Serve with purpose",
        description: "Lead impactful outreach that transforms lives.",
    },
];

export default function PastorStartJourneyScreen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();
    const { role } = useLocalSearchParams<{ role?: PastorRole }>();
    const roleLabel = useMemo(() => mapRoleToLabel(role), [role]);
    const [activeStep, setActiveStep] = useState(0);

    const handleBack = useCallback(() => {
        try { router.back(); } catch { router.replace("/"); }
    }, [router]);

    const handleSkip = useCallback(() => {
        router.push({ pathname: "/(unauthenticated)/interest-form", params: role ? { role } : undefined });
    }, [router, role]);

    const handleContinue = useCallback(() => {
        router.push(
            `/(unauthenticated)/pastor-start-journey/step-2/${role || "pastor"}` as any
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

                {/* Top bar */}
                <View style={styles.topBar}>
                    <Pressable onPress={handleBack} hitSlop={12} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.9)" />
                    </Pressable>

                    {/* Progress dots */}
                    <View style={styles.dotsRow}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    i === activeStep ? styles.dotActive : styles.dotInactive,
                                    i === 1 && i !== activeStep ? styles.dotInactiveMint : null,
                                ]}
                            />
                        ))}
                    </View>

                    <Pressable onPress={handleSkip} hitSlop={12} style={styles.skipBtn}>
                        <Text style={styles.skipText}>Skip</Text>
                    </Pressable>
                </View>

                {/* Content */}
                <View style={styles.content}>

                    {/* Illustration area */}
                    <View style={styles.illustrationArea}>
                        <View style={styles.outerRing}>
                            <View style={styles.innerRing}>
                                <View style={styles.centerIcon}>
                                    <Ionicons
                                        name={STEPS[activeStep].icon}
                                        size={30}
                                        color="#fff"
                                    />
                                </View>
                            </View>
                        </View>
                        <Text style={styles.stepLabel}>
                            Step{" "}
                            <Text style={styles.stepLabelAccent}>{activeStep + 1}</Text>
                            {" "}of 3
                        </Text>
                    </View>

                    {/* Heading */}
                    <View style={styles.headingBlock}>
                        <Text style={styles.headingLight}>We will guide you</Text>
                        <Text style={styles.headingStrong}>
                            step by <Text style={styles.headingAccent}>step</Text>
                        </Text>
                        <Text style={styles.headingLight}>
                            to grow your{" "}
                            <Text style={styles.headingImpact}>impact</Text>.
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
                                    style={[styles.stepCard, isActive && styles.stepCardActive]}
                                >
                                    {/* Step number */}
                                    <View style={[styles.stepNum, isActive && styles.stepNumActive]}>
                                        <Text style={[styles.stepNumText, isActive && styles.stepNumTextActive]}>
                                            {i + 1}
                                        </Text>
                                    </View>

                                    <View style={styles.cardBody}>
                                        <Text style={[styles.cardTitle, isActive && styles.cardTitleActive]}>
                                            {step.title}
                                        </Text>
                                        {isActive && (
                                            <Text style={styles.cardDesc}>{step.description}</Text>
                                        )}
                                    </View>

                                    <Ionicons
                                        name="chevron-forward"
                                        size={14}
                                        color={
                                            isActive
                                                ? accent.mint
                                                : "rgba(255,255,255,0.2)"
                                        }
                                    />
                                </Pressable>
                            );
                        })}
                    </View>

                    {!!roleLabel && <Text style={styles.hiddenRoleText}>{roleLabel}</Text>}
                </View>

                {/* Bottom */}
                <View style={styles.bottomArea}>
                    <Pressable onPress={handleContinue} style={styles.continueBtn}>
                        <Text style={styles.continueText}>Continue</Text>
                        <View style={styles.continueArrowCircle}>
                            <Ionicons name="arrow-forward" size={16} color={accent.tealDeep} />
                        </View>
                    </Pressable>

                    <Text style={styles.disclaimer}>
                        By continuing, you agree to our{" "}
                        <Text style={styles.disclaimerLink}>Terms of Service</Text>
                        {" "}and{" "}
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

    // Top bar
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 32,
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
    dotsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    dotActive: {
        backgroundColor: "#fff",
        width: 24,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: accent.gold,
    },
    dotInactive: {
        backgroundColor: "rgba(255,255,255,0.3)",
    },
    dotInactiveMint: {
        backgroundColor: "rgba(111, 212, 190, 0.35)",
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

    // Content
    content: {
        flex: 1,
    },

    // Illustration
    illustrationArea: {
        alignItems: "center",
        marginBottom: 32,
    },
    outerRing: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(255,255,255,0.06)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(111, 212, 190, 0.35)",
    },
    innerRing: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: "rgba(255,255,255,0.08)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(232, 200, 138, 0.35)",
    },
    centerIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: accent.mintSoft,
        alignItems: "center",
        justifyContent: "center",
    },
    stepLabel: {
        marginTop: 14,
        color: "rgba(255,255,255,0.45)",
        fontSize: 12,
        fontWeight: "500",
        letterSpacing: 0.5,
    },
    stepLabelAccent: {
        color: accent.gold,
        fontWeight: "700",
    },

    // Heading
    headingBlock: {
        marginBottom: 20,
    },
    headingLight: {
        fontSize: 20,
        fontWeight: "400",
        color: "rgba(255,255,255,0.65)",
        lineHeight: 28,
    },
    headingStrong: {
        fontSize: 26,
        fontWeight: "700",
        color: "#fff",
        lineHeight: 32,
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
        marginBottom: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
    },

    // Cards
    cardList: {
        gap: 10,
    },
    stepCard: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.05)",
        gap: 14,
    },
    stepCardActive: {
        backgroundColor: "rgba(255,255,255,0.12)",
        borderColor: "rgba(111, 212, 190, 0.45)",
        borderLeftWidth: 3,
        borderLeftColor: accent.gold,
    },
    stepNum: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    stepNumActive: {
        backgroundColor: "#fff",
    },
    stepNumText: {
        fontSize: 12,
        fontWeight: "700",
        color: "rgba(255,255,255,0.5)",
    },
    stepNumTextActive: {
        color: accent.tealDeep,
    },
    cardBody: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "rgba(255,255,255,0.55)",
    },
    cardTitleActive: {
        color: "#fff",
    },
    cardDesc: {
        fontSize: 12,
        fontWeight: "400",
        color: "rgba(255,255,255,0.45)",
        marginTop: 3,
        lineHeight: 18,
    },

    // Bottom
    bottomArea: {
        gap: 12,
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