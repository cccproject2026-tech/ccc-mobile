// hooks/useOnboarding.ts
import { authService } from "@/services/auth.service";
import { onboardingService } from "@/services/onboarding.service";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { CheckOnboardingStatusData, InterestFormData } from "@/types";
import { navigateByOnboardingStep } from "@/utils/onboarding-navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export const onboardingKeys = {
  all: ["onboarding"] as const,
  status: (userId: string) =>
    [...onboardingKeys.all, "status", userId] as const,
  checkStatus: (email: string) =>
    [...onboardingKeys.all, "check-status", email] as const,
};

function persistOnboardingStatus(data: CheckOnboardingStatusData) {
  const {
    setEmail,
    setInterestStatus,
    setEmailVerified,
    setPasswordSet,
  } = useOnboardingStore.getState();

  setEmail(data.email);
  setInterestStatus(data.interestStatus);
  setEmailVerified(data.isEmailVerified);
  setPasswordSet(data.isPasswordSet);
}

export const useCheckOnboardingStatus = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (email: string) =>
      authService.checkOnboardingStatus({ email: email.trim().toLowerCase() }),
    onSuccess: (response) => {
      if (!response.success || !response.data) {
        throw new Error("Unable to check your application status. Please try again.");
      }
      persistOnboardingStatus(response.data);
      navigateByOnboardingStep(router, response.data.nextStep);
    },
  });
};

// Submit interest mutation
// Submit interest mutation
export const useSubmitInterest = () => {
  const router = useRouter();
  const { setUserId, setApplicationId, setInterestStatus, setInterestData } =
    useOnboardingStore();

  return useMutation({
    mutationFn: (data: InterestFormData) =>
      onboardingService.submitInterest(data),

    onSuccess: (response, variables) => {
      console.log("✅ Interest form submitted successfully");

      const userId = response.data?.userId;
      const applicationId = response.data?.id;

      // Save to store
      if (userId) setUserId(userId);
      if (applicationId) setApplicationId(applicationId);
      setInterestStatus("pending");
      setInterestData(variables);

      router.replace("/(unauthenticated)");
    },

    onError: (error: any) => {
      console.error("❌ Submit interest failed:", error?.message);
    },
  });
};

// Check approval status query
export const useCheckApprovalStatus = (enabled: boolean = false) => {
  const { userId, interestStatus } = useOnboardingStore();
  const { setInterestStatus } = useOnboardingStore();

  const queryResult = useQuery({
    queryKey: onboardingKeys.status(userId || ""),
    queryFn: async () => {
      if (!userId) throw new Error("User ID not found");
      return onboardingService.checkApprovalStatus(userId);
    },
    enabled:
      enabled &&
      !!userId &&
      (interestStatus === "pending" || interestStatus === "new"),
    staleTime: 2000, // 2 seconds (was 1 second)
    refetchInterval: 1000 * 60 * 2, // Poll every 2 minutes
    refetchIntervalInBackground: false, // Don't poll in background
  });

  // Handle side effects in useEffect
  useEffect(() => {
    if (queryResult.isSuccess) {
      const newStatus = queryResult.data?.data?.status;
      console.log("✅ Approval status checked:", newStatus);

      if (newStatus && newStatus !== interestStatus) {
        setInterestStatus(newStatus);
        console.log("📊 Status updated from", interestStatus, "to", newStatus);
      }
    }
    if (queryResult.isError) {
      // @ts-ignore
      console.error(
        "❌ Check approval status failed:",
        queryResult.error?.message,
      );
    }
  }, [
    queryResult.isSuccess,
    queryResult.isError,
    queryResult.data,
    interestStatus,
    setInterestStatus,
  ]);

  return queryResult;
};
