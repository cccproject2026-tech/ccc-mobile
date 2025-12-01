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
                    Alert.alert(
                        'OTP Sent',
                        `A 6-digit OTP has been sent to ${userEmail}.`,
                        [{ text: 'OK', onPress: () => setStep(2) }]
                    );
                },
                onError: (error: any) => {
                    Alert.alert('Error', error.message || 'Failed to send OTP');
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

                        Alert.alert('Success', 'OTP verified successfully. Please set your password.');
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
                colors={['#176192', '#1D548D', '#264387']}
                style={[styles.container, { paddingBottom: bottom }]}
            >
                <TopBar showDrawer={false} showNotifications={false} />

                <KeyboardAwareScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 20 }]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.welcomeBanner}>
                        <Text style={styles.welcomeTitle}>WELCOME !</Text>
                        <Text style={styles.welcomeSubtitle}>
                            You are now enrolled in the CCC mentoring program at Andrews University Seminary
                        </Text>
                    </View>

                    <View style={styles.cccLogoContainer}>
                        <Image source={icons.communityImage} style={styles.cccLogo} resizeMode="contain" />
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
                                    colors={['#7C3AED', '#3B82F6']}
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
                                            backgroundColor: "rgba(255,255,255,0.15)",
                                            borderColor: "rgba(255,255,255,0.3)",
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
                                        <ActivityIndicator color="#1A5490" />
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
                                        <ActivityIndicator color="#1A5490" />
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
    container: { flex: 1 },
    scrollContent: { flexGrow: 1 },
    cccLogoContainer: {
        alignItems: "center",
        marginTop: 40,
        marginBottom: 40,
        backgroundColor: "#fff",
        marginHorizontal: 35,
        paddingVertical: 35,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
    cccLogo: { width: "100%", height: 90 },
    welcomeBanner: {
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 20,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 12,
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: "#FFD700",
        textAlign: "center",
        lineHeight: 20,
    },
    formContainer: { paddingHorizontal: 20 },
    input: {
        backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        color: "#fff",
        marginBottom: 16,
    },
    inputDisabled: { opacity: 0.7 },
    verifyButton: { marginTop: 20, marginBottom: 40 },
    gradientButton: {
        padding: 16, borderRadius: 10, alignItems: "center",
    },
    buttonText: {
        color: "#fff", fontSize: 16, fontWeight: "600",
    },
    otpLabel: {
        color: "#fff",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 20,
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
        backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.3)",
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
        backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
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
        padding: 16,
        borderRadius: 10,
        alignItems: "center",
    },
    submitButtonText: {
        color: "#1A5490",
        fontSize: 16,
        fontWeight: "600",
    },
    universityLogoContainer: {
        alignItems: "center",
        marginBottom: 30,
        marginTop: 40,
    },
    universityLogo: { width: 220, height: 50 },
});
