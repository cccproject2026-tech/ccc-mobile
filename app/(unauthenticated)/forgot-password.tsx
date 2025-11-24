import TopBar from "@/components/director/TopBar";
import { icons } from "@/constants/images";
import { useResetPassword, useSendOtp } from "@/hooks/auth/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
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
import { OtpInput } from "react-native-otp-entry";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function ForgotPasswordScreen() {
    const { bottom } = useSafeAreaInsets();

    const sendOtp = useSendOtp();
    const resetPasswordMutation = useResetPassword();

    // Step 1 → Email input, Step 2 → OTP + New pw
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');

    // ⭐ Updated to 6-digit OTP
    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const otpRefs = useRef<Array<TextInput | null>>([]);

    const isBusy = sendOtp.isPending || resetPasswordMutation.isPending;

    // STEP 1: SEND OTP
    const handleVerifyEmail = () => {
        if (!email) {
            return Alert.alert("Error", "Please enter your email");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return Alert.alert("Error", "Enter a valid email address");
        }

        sendOtp.mutate(
            { email, purpose: "password_reset" },
            {
                onSuccess: () => {
                    Alert.alert("OTP Sent", "A 6-digit OTP has been sent to your email.");
                    setStep(2);
                },
                onError: (error: any) => {
                    Alert.alert("Error", error?.message || "Failed to send OTP");
                }
            }
        );
    };

    // HANDLE 6-digit OTP input
    const handleOTPChange = (value: string, index: number) => {
        if (value.length > 1) return;

        const newArr = [...otp];
        newArr[index] = value;
        setOtp(newArr);

        // Auto move to next (index < 5)
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    // STEP 2: RESET PASSWORD
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
                email,
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
                colors={["#176192", "#1D548D", "#264387"]}
                style={styles.container}
            >
                <KeyboardAwareScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 20 }]}
                    showsVerticalScrollIndicator={false}
                >
                    <TopBar showNotifications={false} showDrawer={false} />

                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <Image source={icons.communityImage} style={styles.logo} resizeMode="contain" />
                    </View>

                    <View style={styles.formContainer}>
                        {/* STEP 1 */}
                        {step === 1 && (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!isBusy}
                                />

                                <TouchableOpacity
                                    style={styles.verifyButton}
                                    onPress={handleVerifyEmail}
                                    disabled={isBusy}
                                >
                                    <LinearGradient
                                        colors={["#7C3AED", "#3B82F6"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.gradientButton}
                                    >
                                        {sendOtp.isPending ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.buttonText}>Verify Email ID</Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <>
                                <Text style={styles.otpLabel}>Enter the OTP sent to your email</Text>

                                <OtpInput
                                    numberOfDigits={6}
                                    onTextChange={(value) => setOtp(value.split(""))}
                                    onFilled={(value) => setOtp(value.split(""))}
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

                                {/* PASSWORD */}
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Enter New Password"
                                        placeholderTextColor="rgba(255,255,255,0.6)"
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        secureTextEntry={!showNewPassword}
                                        autoCapitalize="none"
                                        editable={!isBusy}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowNewPassword(!showNewPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        <Ionicons
                                            name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                                            size={24}
                                            color="rgba(255,255,255,0.6)"
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* CONFIRM PASSWORD */}
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Confirm New Password"
                                        placeholderTextColor="rgba(255,255,255,0.6)"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showConfirmPassword}
                                        autoCapitalize="none"
                                        editable={!isBusy}
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

                                {/* RESET PASSWORD */}
                                <TouchableOpacity
                                    style={styles.resetButton}
                                    onPress={handleResetPassword}
                                    disabled={isBusy}
                                >
                                    {resetPasswordMutation.isPending ? (
                                        <ActivityIndicator color="#1A5490" />
                                    ) : (
                                        <Text style={styles.resetButtonText}>Reset Password</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    {/* Bottom Logo */}
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
    logoContainer: {
        alignItems: "center",
        marginTop: 40,
        marginBottom: 40,
        backgroundColor: "#fff",
        marginHorizontal: 35,
        paddingVertical: 35,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
    logo: {
        width: "100%",
        height: 90,
    },
    formContainer: {
        paddingHorizontal: 35,
        marginBottom: 60,
    },
    input: {
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.8)",
        borderRadius: 10,
        padding: 16,
        fontSize: 16,
        color: "#fff",
        marginBottom: 24,
    },
    verifyButton: {
        marginTop: 20,
    },
    gradientButton: {
        padding: 18,
        borderRadius: 30,
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
        marginBottom: 30,
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

    otpInputFilled: {
        borderColor: "#FFD700",
    },
    passwordContainer: {
        position: "relative",
        marginBottom: 20,
    },
    passwordInput: {
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.8)",
        borderRadius: 10,
        padding: 16,
        paddingRight: 50,
        fontSize: 16,
        color: "#fff",
    },
    eyeIcon: {
        position: "absolute",
        right: 14,
        top: 16,
    },
    resetButton: {
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 30,
        alignItems: "center",
        marginTop: 20,
    },
    resetButtonText: {
        color: "#1A5490",
        fontSize: 16,
        fontWeight: "600",
    },
    universityLogoContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    universityLogo: {
        width: 220,
        height: 50,
    },
});
