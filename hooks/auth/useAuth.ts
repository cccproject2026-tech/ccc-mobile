// hooks/useAuth.ts
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { useOnboardingStore } from "@/stores/onboarding.store";
import {
    LoginCredentials,
    ResetPasswordRequest,
    SendOtpRequest,
    SetPasswordRequest,
    VerifyOtpRequest,
} from "@/types/auth.types";
import { markPastorMentorIntroStart } from "@/utils/pastorMentorIntro";
import { storage } from "@/utils/storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  login: ["auth", "login"] as const,
  logout: ["auth", "logout"] as const,
  otp: ["auth", "otp"] as const,
  verifyOtp: ["auth", "verifyOtp"] as const,
  setPassword: ["auth", "setPassword"] as const,
  forgotPassword: ["auth", "forgotPassword"] as const,
  resetPassword: ["auth", "resetPassword"] as const,
};

// ============= LOGIN MUTATION =============
export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const setHasProfilePicture = useOnboardingStore(
    (state) => state.setHasProfilePicture,
  );

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: async (response) => {
      console.log("✅ Login successful");

      try {
        // Extract user and tokens from response.data
        const { user, accessToken, refreshToken } = response.data;

        // Store tokens in secure storage
        await storage.setTokens(accessToken, refreshToken);

        // Store user data in secure storage
        await storage.setUserData(user);

        // Update auth store
        setUser(user);

        // ✅ NEW: Check if user has profile picture
        if (user.profilePicture) {
          setHasProfilePicture(true);
          console.log("📷 User has profile picture");
        } else {
          setHasProfilePicture(false);
          console.log("❌ User missing profile picture");
        }

        // Invalidate all queries
        await queryClient.invalidateQueries({
          queryKey: authKeys.all,
        });

        console.log("✅ Logged in as:", user.email);
        console.log("👤 User role:", user.role);

        // Navigate based on user role
        if (user.role === "pastor") {
          router.replace("/(pastor)/(tabs)");
        } else if (user.role === "mentor") {
          router.replace("/(mentor)/(tabs)");
        } else if (user.role === "director") {
          router.replace("/(director)/(tabs)");
        }
      } catch (error) {
        console.error("❌ Error in login onSuccess:", error);
      }
    },
    onError: (error: any) => {
      return error;
    },
  });
};

// ============= SEND OTP MUTATION =============
export const useSendOtp = () => {
  return useMutation({
    mutationFn: (data: SendOtpRequest) => authService.sendOtp(data),
    onSuccess: (response) => {
      console.log("✅ OTP sent successfully");
    },
    onError: (error: any) => {
      console.error("❌ Send OTP failed:", error.message);
    },
  });
};

// ============= VERIFY OTP MUTATION =============
export const useVerifyOtp = () => {
  const { setEmailVerified } = useOnboardingStore();

  return useMutation({
    mutationFn: (data: VerifyOtpRequest) => authService.verifyOtp(data),
    onSuccess: (response) => {
      console.log("✅ OTP verified successfully");

      if (response.success) {
        // Store OTP token temporarily (will be used for password setting)
        console.log("🔐 OTP token received (valid)");
        setEmailVerified(true);
      } else {
        console.error("❌ OTP is invalid");
      }
    },
    onError: (error: any) => {
      console.error("❌ OTP verification failed:", error.message);
    },
  });
};

// ============= SET PASSWORD MUTATION =============
export const useSetPassword = () => {
  const { setPasswordSet, setCurrentStep } = useOnboardingStore();

  return useMutation({
    mutationFn: (data: SetPasswordRequest) => authService.setPassword(data),
    onSuccess: async (response) => {
      console.log("✅ Password set successfully");

      try {
        const { data: userData, message } = response;

        // If response contains user data, store it
        if (userData) {
          await storage.setUserData(userData);
          if (userData.role === "pastor" && userData.id) {
            await markPastorMentorIntroStart(userData.id);
          }
        }

        // Mark password as set in store
        setPasswordSet(true);
        setCurrentStep("password");

        console.log("✅ Account ready for login");
        console.log("📝 Message:", message);
      } catch (error) {
        console.error("❌ Error in setPassword onSuccess:", error);
      }
    },
    onError: (error: any) => {
      console.error("❌ Set password failed:", {
        message: error.message,
        statusCode: error.statusCode,
        errors: error.errors,
      });
    },
  });
};

// ============= FORGOT PASSWORD MUTATION =============
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: (response) => {
      console.log("✅ Password reset email sent");
      console.log("📧 Check your email for reset instructions");
      console.log("📝 Message:", response.message);
    },
    onError: (error: any) => {
      console.error("❌ Forgot password failed:", error.message);
    },
  });
};

// ============= RESET PASSWORD MUTATION =============
export const useResetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data), // send full object
    onSuccess: (response) => {
      console.log("✅ Password reset successful");
      router.replace("/(unauthenticated)/login-form");
    },
    onError: (error: any) => {
      console.error("❌ Reset password failed:", error.message);
    },
  });
};

// ============= LOGOUT MUTATION =============
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: async () => {
      console.log("🔓 Logging out");

      try {
        // Clear auth store
        await logout();

        // Clear secure storage
        await storage.clearAll();

        // Clear all queries
        await queryClient.clear();

        console.log("✅ Logout complete");

        // Navigate to landing
        router.replace("/(unauthenticated)");
      } catch (error) {
        console.error("❌ Error in logout onSuccess:", error);
      }
    },
    onError: (error: any) => {
      console.error("❌ Logout failed:", error.message);
    },
  });
};

// ============= REFRESH TOKEN MUTATION =============
export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (refreshToken: string) =>
      authService.refreshToken({ refreshToken }),
    onSuccess: async (response) => {
      console.log("✅ Token refreshed successfully");

      try {
        const { accessToken, refreshToken } = response;

        // Store new tokens in secure storage
        await storage.setTokens(accessToken, refreshToken);

        // Invalidate queries to refetch with new token
        await queryClient.invalidateQueries({
          queryKey: authKeys.all,
        });

        console.log("🔄 All tokens updated");
      } catch (error) {
        console.error("❌ Error storing refreshed tokens:", error);
      }
    },
    onError: (error: any) => {
      console.error("❌ Token refresh failed:", error.message);

      // Clear all data on token failure
      queryClient.clear();
    },
  });
};
