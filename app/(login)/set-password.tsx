// app/(login)/set-password.tsx
import TopBar from "@/components/director/TopBar";
import { icons } from "@/constants/images";
import { useAuth } from "@/context/AuthContext";
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
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SetPasswordScreen() {
    const { top, bottom } = useSafeAreaInsets();
    const { setPassword, isLoading, interestData, error, clearError } = useAuth();

    // Step 1: Email, Step 2: OTP + Password
    const [step, setStep] = useState<1 | 2>(1);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [passwordInput, setPasswordInput] = useState("");
    const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Refs for OTP inputs
    const otpRefs = useRef<Array<TextInput | null>>([]);

    // Get email from interest data (auto-populated)
    const email = interestData?.email || "";

    const handleVerifyEmail = () => {
        if (!email) {
            Alert.alert("Error", "No email found. Please submit an interest form first.");
            return;
        }

        // Mock OTP sent
        Alert.alert("OTP Sent", "A 4-digit OTP has been sent to your email.");
        setStep(2);
    };

    const handleOTPChange = (value: string, index: number) => {
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 3) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleSubmit = async () => {
        clearError();

        const otpValue = otp.join("");

        if (otpValue.length !== 4) {
            Alert.alert("Error", "Please enter the 4-digit OTP");
            return;
        }

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

        try {
            // Call setPassword from context
            await setPassword(email, passwordInput);

            Alert.alert(
                "Success!",
                "Your password has been set successfully. You can now login.",
                [
                    {
                        text: "OK",
                        onPress: () => router.replace({
                            pathname: "/(login)/login-form",
                            params: {
                                showProfileSetup: "true"
                            },
                        }),
                    },
                ]
            );
        } catch (err) {
            Alert.alert("Error", error || "Failed to set password. Please try again.");
        }
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={["#176192", "#1D548D", "#264387"]}
                style={[styles.container, { paddingBottom: bottom }]}
            >
                {/* Header */}
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
                        {/* Email (Read-only, from context) */}
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            placeholder="Username (Auto populated) Email ID"
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            value={email}
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

                        {/* Step 2: OTP + Password */}
                        {step === 2 && (
                            <>
                                <Text style={styles.otpLabel}>
                                    An OTP has been sent to your Registered Email ID.{"\n"}
                                    Please fill the OTP to verify Email ID
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
                                        />
                                    ))}
                                </View>

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

                                {/* Error Message from Context */}
                                {error && (
                                    <View style={styles.errorContainer}>
                                        <Text style={styles.errorText}>{error}</Text>
                                    </View>
                                )}

                                {/* Submit Button */}
                                <TouchableOpacity
                                    style={styles.submitButton}
                                    onPress={handleSubmit}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#1A5490" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Submit</Text>
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
