
import { authService } from "@/services/auth.service";
import { onboardingService } from "@/services/onboarding.service";
import { profileService } from "@/services/profile.service";
import { useOnboardingStore } from "@/stores/onboarding.store";
import {
    ApprovalStatusResponse,
    CheckOnboardingStatusData,
    InterestFormData,
} from "@/types";
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
  void hydrateApplicationIdsFromEmail(data.email);
}

/** Hydrate userId/applicationId after web submit or Continue Application (email-only). */
async function hydrateApplicationIdsFromEmail(email: string): Promise<string | null> {
  const {
    setUserId,
    setApplicationId,
    setInterestData,
    interestData,
  } = useOnboardingStore.getState();

  try {
    const interest = await profileService.getInterestDetails(
      email.trim().toLowerCase()
    );
    if (interest.userId) setUserId(interest.userId);
    if (interest.id) setApplicationId(interest.id);
    if (interest.email || interest.status) {
      setInterestData({ ...interestData, ...interest });
    }
    return interest.userId || interest.id || null;
  } catch {
    return null;
  }
}

async function fetchApprovalStatus(): Promise<ApprovalStatusResponse> {
  const state = useOnboardingStore.getState();
  let checkId = state.userId || state.applicationId || null;

  if (!checkId) {
    const email = state.email || state.interestData?.email;
    if (email) {
      checkId = await hydrateApplicationIdsFromEmail(email);
    }
  }

  if (checkId) {
    return onboardingService.checkApprovalStatus(checkId);
  }

  const email = state.email || state.interestData?.email;
  if (!email) {
    throw new Error(
      "Unable to check status. Please use Continue Application with your email."
    );
  }

  const response = await authService.checkOnboardingStatus({
    email: email.trim().toLowerCase(),
  });
  if (!response.success || !response.data) {
    throw new Error("Unable to check your application status. Please try again.");
  }

  persistOnboardingStatus(response.data);

  return {
    success: true,
    message: "OK",
    data: {
      email: response.data.email,
      status: response.data.interestStatus,
    },
  };
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

export const useCheckApprovalStatus = (enabled: boolean = false) => {
  const { userId, email, interestData, interestStatus, applicationId } =
    useOnboardingStore();
  const { setInterestStatus } = useOnboardingStore();

  const statusKey = userId || applicationId || email || interestData?.email || "";

  const canCheckStatus =
    interestStatus === "pending" || interestStatus === "new";
  const hasCheckIdentifier =
    !!userId ||
    !!applicationId ||
    !!email ||
    !!interestData?.email;

  const queryResult = useQuery({
    queryKey: onboardingKeys.status(statusKey),
    queryFn: fetchApprovalStatus,
    enabled: enabled && canCheckStatus && hasCheckIdentifier,
    staleTime: 2000,
    refetchInterval: 1000 * 60 * 2,
    refetchIntervalInBackground: false,
    retry: 1,
  });

  useEffect(() => {
    if (queryResult.isSuccess) {
      const newStatus = queryResult.data?.data?.status;
      console.log("✅ Approval status checked:", newStatus);

      if (newStatus && newStatus !== interestStatus) {
        setInterestStatus(newStatus);
        console.log("📊 Status updated from", interestStatus, "to", newStatus);
      }
    }
  }, [
    queryResult.isSuccess,
    queryResult.data,
    interestStatus,
    setInterestStatus,
  ]);

  return queryResult;
};
