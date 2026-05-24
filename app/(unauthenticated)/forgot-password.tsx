import TopBar from "@/components/director/TopBar";
import { icons } from "@/constants/images";
import { useResetPassword, useSendOtp } from "@/hooks/auth/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import KeyboardSafeContainer from "@/components/layout/KeyboardSafeContainer";
import { OtpInput } from "react-native-otp-entry";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const accent = {
    gold: "#E8C88A",
    mint: "#6FD4BE",
    mintSoft: "rgba(111, 212, 190, 0.28)",
    tealDeep: "#0E5A62",
};

export default function ForgotPasswordScreen() {
    const { bottom } = useSafeAreaInsets();
    const router = useRouter();

    const sendOtp = useSendOtp();
    const resetPasswordMutation = useResetPassword();

    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const isBusy = sendOtp.isPending || resetPasswordMutation.isPending;
    const stepLabel = step === 1 ? "Step 1 of 2" : "Step 2 of 2";

    const handleVerifyEmail = () => {
        if (!email.trim()) {
            return Alert.alert("Error", "Please enter your email");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return Alert.alert("Error", "Enter a valid email address");
        }

        sendOtp.mutate(
            { email: email.trim(), purpose: "password_reset" },
            {
                onSuccess: () => {
                    Alert.alert("OTP Sent", "A 6-digit OTP has been sent to your email.");
                    setStep(2);
                },
                onError: (error: any) => {
                    Alert.alert("Error", error?.message || "Failed to send OTP");
                },
            }
        );
    };

    const handleResetPassword = () => {
        const otpValue = otp.join("");

        if (otpValue.length !== 6) {
            return Alert.alert("Error", "Enter the 6-digit OTP");
        }
        if (!newPassword || !confirmPassword) {
            return Alert.alert("Error", "All fields are required");
        }
        if (newPassword.length < 6) {
            return Alert.alert("Error", "Password must be at least 6 characters");
        }
        if (newPassword !== confirmPassword) {
            return Alert.alert("Error", "Passwords do not match");
        }

        resetPasswordMutation.mutate(
            {
                email: email.trim(),
                otp: otpValue,
                newPassword,
                confirmPassword,
            },
            {
                onError: (err: any) => {
                    Alert.alert("Error", err?.message || "Password reset failed");
                },
            }
        );
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={["#0D3B6E", "#0A5C8A", "#0B84B0"]}
                locations={[0, 0.5, 1]}
                style={styles.gradient}
            >
                <TopBar showNotifications={false} showDrawer={false} />

                <KeyboardSafeContainer
                    contentContainerStyle={[styles.scroll, { paddingBottom: bottom + 16 }]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.headingBlock}>
                        <Text style={styles.headingTitle}>Reset password</Text>
                        <Text style={styles.headingSubtitle}>
                            {step === 1
                                ? "Enter your email and we'll send you a verification code."
                                : "Enter the OTP and choose a new password."}
                        </Text>
                        <View style={styles.stepPill}>
                            <Text style={styles.stepPillText}>{stepLabel}</Text>
                        </View>
                    </View>

                    <View style={styles.form}>
                        {step === 1 && (
                            <>
                                <View style={styles.fieldWrap}>
                                    <Text style={styles.fieldLabel}>Email</Text>
                                    <View style={styles.inputRow}>
                                        <Ionicons
                                            name="mail-outline"
                                            size={18}
                                            color={accent.mint}
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter your email"
                                            placeholderTextColor="rgba(111, 212, 190, 0.35)"
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            editable={!isBusy}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.primaryBtn, isBusy && styles.primaryBtnDisabled]}
                                    onPress={handleVerifyEmail}
                                    disabled={isBusy}
                                    activeOpacity={0.88}
                                >
                                    {sendOtp.isPending ? (
                                        <ActivityIndicator color={accent.tealDeep} />
                                    ) : (
                                        <>
                                            <Text style={styles.primaryBtnText}>Send verification code</Text>
                                            <View style={styles.primaryBtnArrow}>
                                                <Ionicons name="arrow-forward" size={16} color={accent.tealDeep} />
                                            </View>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <Text style={styles.otpLabel}>
                                    A 6-digit OTP has been sent to {email}.{"\n"}
                                    Enter it below along with your new password.
                                </Text>

                                <OtpInput
                                    numberOfDigits={6}
                                    onTextChange={(value) => setOtp(value.split(""))}
                                    onFilled={(value) => setOtp(value.split(""))}
                                    theme={{
                                        containerStyle: {
                                            width: "100%",
                                            marginBottom: 20,
                                        },
                                        inputsContainerStyle: {
                                            justifyContent: "space-between",
                                        },
                                        pinCodeContainerStyle: {
                                            width: 48,
                                            height: 56,
                                            borderRadius: 10,
                                            borderWidth: 1,
                                            backgroundColor: "rgba(255,255,255,0.08)",
                                            borderColor: "rgba(111, 212, 190, 0.35)",
                                        },
                                        pinCodeTextStyle: {
                                            color: "#fff",
                                            fontSize: 22,
                                            fontWeight: "600",
                                        },
                                    }}
                                />

                                <View style={styles.fieldWrap}>
                                    <Text style={styles.fieldLabel}>New password</Text>
                                    <View style={styles.inputRow}>
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={18}
                                            color={accent.mint}
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter new password"
                                            placeholderTextColor="rgba(111, 212, 190, 0.35)"
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            secureTextEntry={!showNewPassword}
                                            autoCapitalize="none"
                                            editable={!isBusy}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowNewPassword(!showNewPassword)}
                                            disabled={isBusy}
                                            style={styles.eyeBtn}
                                        >
                                            <Ionicons
                                                name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                                                size={18}
                                                color={accent.mint}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.fieldWrap}>
                                    <Text style={styles.fieldLabel}>Confirm password</Text>
                                    <View style={styles.inputRow}>
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={18}
                                            color={accent.mint}
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Confirm new password"
                                            placeholderTextColor="rgba(111, 212, 190, 0.35)"
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry={!showConfirmPassword}
                                            autoCapitalize="none"
                                            editable={!isBusy}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                            disabled={isBusy}
                                            style={styles.eyeBtn}
                                        >
                                            <Ionicons
                                                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                                size={18}
                                                color={accent.mint}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.primaryBtn, isBusy && styles.primaryBtnDisabled]}
                                    onPress={handleResetPassword}
                                    disabled={isBusy}
                                    activeOpacity={0.88}
                                >
                                    {resetPasswordMutation.isPending ? (
                                        <ActivityIndicator color={accent.tealDeep} />
                                    ) : (
                                        <>
                                            <Text style={styles.primaryBtnText}>Reset password</Text>
                                            <View style={styles.primaryBtnArrow}>
                                                <Ionicons name="arrow-forward" size={16} color={accent.tealDeep} />
                                            </View>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setStep(1)}
                                    disabled={isBusy}
                                    style={styles.backLink}
                                >
                                    <Ionicons name="chevron-back" size={14} color={accent.mint} />
                                    <Text style={styles.backLinkText}>Use a different email</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    <View style={styles.orRow}>
                        <View style={styles.orLine} />
                        <Text style={styles.orText}>Remember your password?</Text>
                        <View style={styles.orLine} />
                    </View>

                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={() => router.replace("/(unauthenticated)/login-form")}
                        disabled={isBusy}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.secondaryBtnText}>Back to log in</Text>
                        <Ionicons name="chevron-forward" size={14} color={accent.mint} />
                    </TouchableOpacity>

                    <View style={styles.universityWrap}>
                        <Image
                            source={icons.universityIcon}
                            style={styles.universityLogo}
                            resizeMode="contain"
                        />
                    </View>
                </KeyboardSafeContainer>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    scroll: { flexGrow: 1, paddingHorizontal: 24 },

    headingBlock: { marginBottom: 18, gap: 5, marginTop: 100 },
    headingTitle: { fontSize: 22, fontWeight: "700", color: "#fff", letterSpacing: -0.3 },
    headingSubtitle: { fontSize: 13, fontWeight: "400", color: "rgba(255,255,255,0.5)" },
    stepPill: {
        alignSelf: "flex-start",
        marginTop: 8,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        borderColor: "rgba(232, 200, 138, 0.45)",
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 999,
    },
    stepPillText: { color: accent.gold, fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },

    form: { gap: 14, marginBottom: 18 },

    fieldWrap: { gap: 6 },
    fieldLabel: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: "600", letterSpacing: 0.3 },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(111, 212, 190, 0.22)",
        borderRadius: 10,
        paddingHorizontal: 14,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, paddingVertical: 12, fontSize: 15, color: "#fff" },
    eyeBtn: { paddingLeft: 10, paddingVertical: 14 },

    otpLabel: {
        color: "rgba(255,255,255,0.65)",
        fontSize: 12,
        lineHeight: 18,
        marginBottom: 4,
    },

    primaryBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 18,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 6,
    },
    primaryBtnDisabled: { opacity: 0.6 },
    primaryBtnText: { color: accent.tealDeep, fontSize: 16, fontWeight: "700" },
    primaryBtnArrow: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "rgba(232, 200, 138, 0.35)",
        alignItems: "center",
        justifyContent: "center",
    },

    backLink: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        marginTop: 4,
    },
    backLinkText: { color: accent.mint, fontSize: 12, fontWeight: "600" },

    orRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
    orLine: { flex: 1, height: 1, backgroundColor: "rgba(111, 212, 190, 0.22)" },
    orText: { color: "rgba(232, 200, 138, 0.95)", fontSize: 12, fontWeight: "600" },

    secondaryBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(111, 212, 190, 0.35)",
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 18,
        marginBottom: 28,
    },
    secondaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },

    universityWrap: { alignItems: "center", marginBottom: 6 },
    universityLogo: { width: 200, height: 44, opacity: 0.65 },
});
