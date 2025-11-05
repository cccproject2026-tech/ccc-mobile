import TopBar from "@/components/director/TopBar";
import { icons } from "@/constants/images";
import { useSendOtp } from "@/hooks/auth/useSendOtp";
import { useSetPassword } from "@/hooks/auth/useSetPassword";
import { useVerifyOtp } from "@/hooks/auth/useVerifyOtp";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import React, { useRef, useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useSendOtp, useVerifyOtp, useSetPassword } from "@/hooks"; // ✅ Commented for now


export default function VerifyEmailScreen() {
    const { bottom } = useSafeAreaInsets();

    const { interestData, email, setOtpToken, setEmailVerified, setPasswordSet } = useOnboardingStore();

    const { mutate: sendOtp, isPending: isSending } = useSendOtp();
    const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();
    const { mutate: setPassword, isPending: isSettingPassword } = useSetPassword();

    // ✅ UPDATED: Track OTP verification status
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP, 3: Password
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [passwordInput, setPasswordInput] = useState("");
    const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false); // ✅ ADDED: Track OTP verification

    const otpRefs = useRef<Array<TextInput | null>>([]);

    const userEmail = email || interestData?.email || "";

    // ✅ UPDATED: Send OTP
    const handleVerifyEmail = () => {
        if (!userEmail) {
            Alert.alert("Error", "No email found. Please submit an interest form first.");
            return;
        }

        sendOtp(
            { email: userEmail },
            {
                onSuccess: () => {
                    Alert.alert(
                        "OTP Sent",
                        `A 4-digit OTP has been sent to ${userEmail}\n\n🧪 For testing, use: 1234`,
                        [
                            {
                                text: "OK",
                                onPress: () => setStep(2), // Move to OTP entry
                            },
                        ]
                    );
                },
                onError: (error: any) => {
                    Alert.alert("Error", error.message || "Failed to send OTP");
                },
            }
        );
    };

    const handleOTPChange = (value: string, index: number) => {
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 3) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    // ✅ UPDATED: Verify OTP first, then move to password
    const handleVerifyOtp = () => {
        const otpValue = otp.join("");

        if (otpValue.length !== 4) {
            Alert.alert("Error", "Please enter the 4-digit OTP");
            return;
        }

        verifyOtp(
            { email: userEmail, otp: otpValue },
            {
                onSuccess: (response) => {
                    if (response.data.isValid) {
                        // ✅ OTP verified - store token and move to password
                        setOtpToken(response.data.token);
                        setEmailVerified(true);
                        setIsOtpVerified(true);
                        setStep(3); // Move to password entry

                        Alert.alert("Success", "OTP verified successfully. Please set your password.");
                    } else {
                        Alert.alert("Error", "Invalid OTP. Please try again.");
                    }
                },
                onError: (error: any) => {
                    Alert.alert("Error", error.message || "OTP verification failed");
                },
            }
        );
    };

    // ✅ UPDATED: Set password only after OTP verification
    const handleSetPassword = () => {
        if (!passwordInput || !confirmPasswordInput) {
            Alert.alert("Error", "Please fill in all password fields");
            return;
        }

        if (passwordInput.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        if (passwordInput !== confirmPasswordInput) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setPassword(
            {
                email: userEmail,
                password: passwordInput,
                confirmPassword: confirmPasswordInput
            },
            {
                onSuccess: () => {
                    setPasswordSet(true);

                    Alert.alert(
                        "Success!",
                        "Your password has been set successfully. You can now complete your profile.",
                        [
                            {
                                text: "OK",
                                onPress: () => router.replace("/(unauthenticated)"),
                            },
                        ]
                    );
                },
                onError: (error: any) => {
                    Alert.alert("Error", error.message || "Failed to set password");
                },
            }
        );
    };

    const isLoading = isSending || isVerifying || isSettingPassword;

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={["#176192", "#1D548D", "#264387"]}
                style={[styles.container, { paddingBottom: bottom }]}
            >
                <TopBar showDrawer={false} showNotifications={false} />
                <KeyboardAwareScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 20 }]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Welcome Banner */}
                    <View style={styles.welcomeBanner}>
                        <Text style={styles.welcomeTitle}>WELCOME !</Text>
                        <Text style={styles.welcomeSubtitle}>
                            You are now enrolled in the CCC mentoring program at Andrews University Seminary
                        </Text>
                    </View>

                    {/* Logo */}
                    <View style={styles.cccLogoContainer}>
                        <Image source={icons.communityImage} style={styles.cccLogo} resizeMode="contain" />
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        {/* Email (Read-only) */}
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            placeholder="Username (Auto populated) Email ID"
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            value={userEmail}
                            editable={false}
                        />

                        {/* Step 1: Verify Email Button */}
                        {step === 1 && (
                            <TouchableOpacity
                                style={styles.verifyButton}
                                onPress={handleVerifyEmail}
                                disabled={isLoading}
                            >
                                <LinearGradient
                                    colors={["#7C3AED", "#3B82F6"]}
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

                        {/* Step 2: OTP Entry (Only shown after email verification) */}
                        {step === 2 && (
                            <>
                                <Text style={styles.otpLabel}>
                                    An OTP has been sent to your Registered Email ID.{"\n"}
                                    Please fill the OTP to verify Email ID
                                    {"\n\n"}
                                    <Text style={{
                                        color: '#FFD700',
                                        fontSize: 14,
                                        fontWeight: '600',
                                    }}>
                                        🧪 For testing, use: 1234
                                    </Text>
                                </Text>

                                {/* OTP Inputs */}
                                <View style={styles.otpContainer}>
                                    {otp.map((digit, index) => (
                                        <TextInput
                                            key={index}
                                            ref={(ref) => { otpRefs.current[index] = ref; }}
                                            style={[styles.otpInput, digit && styles.otpInputFilled]}
                                            value={digit}
                                            onChangeText={(value) => handleOTPChange(value, index)}
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            selectTextOnFocus
                                            editable={!isLoading}
                                        />
                                    ))}
                                </View>

                                {/* Verify OTP Button */}
                                <TouchableOpacity
                                    style={styles.submitButton}
                                    onPress={handleVerifyOtp}
                                    disabled={isLoading || otp.join("").length !== 4}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#1A5490" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Verify OTP</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Step 3: Password Entry (Only shown after OTP verification) */}
                        {step === 3 && isOtpVerified && (
                            <>
                                <Text style={{
                                    color: 'rgba(255,255,255,0.9)',
                                    fontSize: 16,
                                    marginBottom: 16,
                                    textAlign: 'center',
                                    fontWeight: '600',
                                }}>
                                    Create your account password
                                </Text>

                                {/* Password Inputs */}
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
                                                name={showPassword ? "eye-off-outline" : "eye-outline"}
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
                                                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                                size={24}
                                                color="rgba(255,255,255,0.6)"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Set Password Button */}
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

                    {/* Andrews University Logo */}
                    <View style={styles.universityLogoContainer}>
                        <Image source={icons.universityIcon} style={styles.universityLogo} resizeMode="contain" />
                    </View>
                </KeyboardAwareScrollView>
            </LinearGradient>
        </>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
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
    cccLogo: {
        width: "100%",
        height: 90,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    shareButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
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
    formContainer: {
        paddingHorizontal: 20,
    },
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
    inputDisabled: {
        opacity: 0.7,
    },
    verifyButton: {
        marginTop: 20,
        marginBottom: 40,
    },
    gradientButton: {
        padding: 16,
        borderRadius: 10,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
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
        justifyContent: "center",
        gap: 12,
        marginBottom: 24,
    },
    otpInput: {
        width: 60,
        height: 60,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.3)",
        borderRadius: 10,
        textAlign: "center",
        fontSize: 24,
        color: "#fff",
        fontWeight: "bold",
    },
    otpInputFilled: {
        borderColor: "#FFD700",
    },
    passwordInputs: {
        marginBottom: 16,
    },
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
    errorContainer: {
        backgroundColor: "rgba(255,0,0,0.1)",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: "#FFB4B4",
        fontSize: 14,
        textAlign: "center",
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
    bottomLogo: {
        alignItems: "center",
        paddingBottom: 20,
    },
    universityLogoContainer: {
        alignItems: "center",
        marginBottom: 30,
        marginTop: 40,
    },
    universityLogo: {
        width: 220,
        height: 50,
    },
});
