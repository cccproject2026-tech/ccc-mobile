import TopBar from "@/components/director/TopBar";
import { icons } from "@/constants/images";
import { useSendOtp, useSetPassword, useVerifyOtp } from "@/hooks/auth/useAuth";

import { useOnboardingStore } from "@/stores/onboarding.store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { OtpInput } from "react-native-otp-entry";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const accent = {
    gold: "#E8C88A",
    mint: "#6FD4BE",
    mintSoft: "rgba(111, 212, 190, 0.25)",
    tealDeep: "#0E5A62",
};

export default function VerifyEmailScreen() {
    const { bottom } = useSafeAreaInsets();
    const router = useRouter();
    const { email: interestEmail } = useLocalSearchParams<{ email?: string }>();
    const {
        interestData,
        email,
        setEmail,
        setEmailVerified,
        setPasswordSet,
    } = useOnboardingStore();

    const { mutate: sendOtp, isPending: isSending } = useSendOtp();
    const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();
    const { mutate: setPassword, isPending: isSettingPassword } = useSetPassword();

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [passwordInput, setPasswordInput] = useState('');
    const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);


    const userEmail = interestEmail || email || interestData?.email || '';
    const isLoading = isSending || isVerifying || isSettingPassword;

    const handleVerifyEmail = () => {
        if (!userEmail) {
            Alert.alert('Error', 'No email found. Please submit an interest form first.');
            return;
        }

        sendOtp(
            { email: userEmail, purpose: 'email_verification' },
            {
                onSuccess: () => {
                    Toast.show({
                        type: 'floating',
                        text1: 'OTP Sent',
                        position: 'top',
                        text2: `A 6-digit OTP has been sent to ${userEmail}. Please check your email and enter the OTP to verify your account.`,
                    });
                    setStep(2);
                },
                onError: (error: any) => {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: error.message || 'Failed to send OTP',
                        position: 'top',
                    });
                },
            }
        );
    };

    const handleVerifyOtp = () => {
        const otpValue = otp.join('');

        if (otpValue.length !== 6) {
            Alert.alert('Error', 'Please enter the 6-digit OTP');
            return;
        }

        verifyOtp(
            { email: userEmail, otp: otpValue },
            {
                onSuccess: (response) => {
                    if (response.success) {
                        setEmailVerified(true);
                        setIsOtpVerified(true);
                        setStep(3);

                        Toast.show({
                            type: 'success',
                            text1: 'OTP Verified',
                            text2: 'Your email has been verified successfully. Please set your account password.',
                            position: 'top',
                        });
                    } else {
                        Alert.alert('Error', 'Invalid OTP. Please try again.');
                    }
                },
                onError: (error: any) => {
                    Alert.alert('Error', error.message || 'OTP verification failed');
                },
            }
        );
    };

    const handleSetPassword = () => {
        if (!passwordInput || !confirmPasswordInput) {
            Alert.alert('Error', 'Please fill in all password fields');
            return;
        }

        if (passwordInput.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        if (passwordInput !== confirmPasswordInput) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setPassword(
            {
                email: userEmail,
                password: passwordInput,
                confirmPassword: confirmPasswordInput,
            },
            {
                onSuccess: () => {
                    setPasswordSet(true);

                    Alert.alert(
                        'Success!',
                        'Your password has been set successfully. You can now log in and complete your profile.',
                        [{ text: 'OK', onPress: () => router.replace('/(unauthenticated)/login-form') }]
                    );
                },
                onError: (error: any) => {
                    Alert.alert('Error', error.message || 'Failed to set password');
                },
            }
        );
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={["#0D3B6E", "#0A5C8A", "#0B84B0"]}
                style={[styles.container, { paddingBottom: bottom }]}
            >
                <View style={styles.bgCircleTop} />
                <View style={styles.bgCircleBottom} />
                <TopBar showDrawer={false} showNotifications={false} />

                <KeyboardAwareScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 20 }]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.welcomeBanner}>
                        <View style={styles.welcomeIconWrap}>
                            <Ionicons name="shield-checkmark-outline" size={26} color={accent.mint} />
                        </View>
                        <Text style={styles.welcomeTitle}>Your Application Is Approved</Text>
                        <Text style={styles.welcomeSubtitle}>
                            {"Please verify your email to secure your account\nand continue to login."}
                        </Text>
                        <View style={styles.stepPill}>
                            <Text style={styles.stepPillText}>Step {step} of 3</Text>
                        </View>
                    </View>

                    <View style={styles.formContainer}>
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            placeholder="Username (Auto populated) Email ID"
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            value={userEmail}
                            editable={false}
                        />

                        {step === 1 && (
                            <TouchableOpacity
                                style={styles.verifyButton}
                                onPress={handleVerifyEmail}
                                disabled={isLoading}
                            >
                                <LinearGradient
                                    colors={["rgba(111, 212, 190, 0.95)", "rgba(14, 90, 98, 0.95)"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.gradientButton}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>Verify Email ID</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        {step === 2 && (
                            <>
                                <Text style={styles.otpLabel}>
                                    A 6-digit OTP has been sent to your email.{'\n'}
                                    Please enter it to verify your Email ID.
                                </Text>

                                {/* NEW OTP INPUT USING react-native-otp-entry */}
                                <OtpInput
                                    numberOfDigits={6}
                                    onTextChange={(value) => setOtp(value.split(""))}
                                    onFilled={(value) => {
                                        setOtp(value.split(""));
                                    }}
                                    theme={{
                                        containerStyle: {
                                            width: "85%",
                                            alignSelf: "center",
                                            marginBottom: 24,
                                        },
                                        inputsContainerStyle: {
                                            justifyContent: "space-between",
                                        },
                                        pinCodeContainerStyle: {
                                            width: 48,
                                            height: 56,
                                            borderRadius: 10,
                                            borderWidth: 2,
                                            backgroundColor: "rgba(255,255,255,0.14)",
                                            borderColor: "rgba(111, 212, 190, 0.35)",
                                        },
                                        pinCodeTextStyle: {
                                            color: "#fff",
                                            fontSize: 22,
                                            fontWeight: "600",
                                        },
                                    }}
                                />

                                <TouchableOpacity
                                    style={styles.submitButton}
                                    onPress={handleVerifyOtp}
                                    disabled={isLoading || otp.join('').length !== 6}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color={accent.tealDeep} />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Verify OTP</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}


                        {step === 3 && isOtpVerified && (
                            <>
                                <Text
                                    style={{
                                        color: 'rgba(255,255,255,0.9)',
                                        fontSize: 16,
                                        marginBottom: 16,
                                        textAlign: 'center',
                                        fontWeight: '600',
                                    }}
                                >
                                    Create your account password
                                </Text>

                                <View style={styles.passwordInputs}>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.passwordInput}
                                            placeholder="Create Password"
                                            placeholderTextColor="rgba(255,255,255,0.6)"
                                            value={passwordInput}
                                            onChangeText={setPasswordInput}
                                            secureTextEntry={!showPassword}
                                            autoCapitalize="none"
                                            editable={!isLoading}

                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowPassword(!showPassword)}
                                            style={styles.eyeIcon}
                                        >
                                            <Ionicons
                                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                                size={24}
                                                color="rgba(255,255,255,0.6)"
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.passwordInput}
                                            placeholder="Confirm Password"
                                            placeholderTextColor="rgba(255,255,255,0.6)"
                                            value={confirmPasswordInput}
                                            onChangeText={setConfirmPasswordInput}
                                            secureTextEntry={!showConfirmPassword}
                                            autoCapitalize="none"
                                            editable={!isLoading}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={styles.eyeIcon}
                                        >
                                            <Ionicons
                                                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                                size={24}
                                                color="rgba(255,255,255,0.6)"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.submitButton}
                                    onPress={handleSetPassword}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color={accent.tealDeep} />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Set Password</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    <View style={styles.universityLogoContainer}>
                        <Image
                            source={icons.universityIcon}
                            style={styles.universityLogo}
                            resizeMode="contain"
                        />
                    </View>
                </KeyboardAwareScrollView>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, overflow: "hidden" },
    bgCircleTop: {
        position: "absolute",
        top: -120,
        right: -100,
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: "rgba(255,255,255,0.05)",
    },
    bgCircleBottom: {
        position: "absolute",
        bottom: -90,
        left: -80,
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: "rgba(255,255,255,0.04)",
    },
    scrollContent: { flexGrow: 1, paddingHorizontal: 20 },
    welcomeBanner: {
        alignItems: "center",
        paddingHorizontal: 6,
        marginTop: 16,
        marginBottom: 14,
    },
    welcomeIconWrap: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: accent.mintSoft,
        borderWidth: 1,
        borderColor: "rgba(111, 212, 190, 0.35)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    welcomeTitle: {
        fontSize: 23,
        fontWeight: "800",
        color: "#fff",
        marginBottom: 8,
        textAlign: "center",
    },
    welcomeSubtitle: {
        fontSize: 13,
        color: "rgba(255,255,255,0.82)",
        textAlign: "center",
        lineHeight: 19,
    },
    stepPill: {
        marginTop: 12,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        borderColor: "rgba(232, 200, 138, 0.45)",
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 999,
    },
    stepPillText: {
        color: accent.gold,
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
    formContainer: {
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.16)",
        padding: 14,
    },
    input: {
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        borderColor: "rgba(111, 212, 190, 0.3)",
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        color: "#fff",
        marginBottom: 16,
    },
    inputDisabled: { opacity: 0.7 },
    verifyButton: { marginTop: 8, marginBottom: 20 },
    gradientButton: {
        padding: 15, borderRadius: 12, alignItems: "center",
    },
    buttonText: {
        color: "#fff", fontSize: 16, fontWeight: "600",
    },
    otpLabel: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 13,
        textAlign: "center",
        marginBottom: 14,
        lineHeight: 19,
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignSelf: "center",
        width: "85%",
        marginBottom: 24,
    },
    otpInput: {
        width: 48,
        height: 56,
        backgroundColor: "rgba(255,255,255,0.14)",
        borderWidth: 2,
        borderColor: "rgba(111, 212, 190, 0.35)",
        borderRadius: 10,
        textAlign: "center",
        fontSize: 22,
        color: "#fff",
        fontWeight: "600",
    },
    otpInputFilled: { borderColor: "#FFD700" },
    passwordInputs: { marginBottom: 16 },
    passwordContainer: {
        position: "relative",
        marginBottom: 16,
    },
    passwordInput: {
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        borderColor: "rgba(111, 212, 190, 0.3)",
        borderRadius: 10,
        padding: 14,
        paddingRight: 50,
        fontSize: 15,
        color: "#fff",
    },
    eyeIcon: {
        position: "absolute",
        right: 14,
        top: 14,
    },
    submitButton: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
    },
    submitButtonText: {
        color: accent.tealDeep,
        fontSize: 16,
        fontWeight: "700",
    },
    universityLogoContainer: {
        alignItems: "center",
        marginBottom: 24,
        marginTop: 26,
    },
    universityLogo: { width: 220, height: 50 },
});
