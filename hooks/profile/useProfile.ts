// hooks/useProfile.ts
import { apiClient } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import { profileService } from "@/services/profile.service";
import { useAuthStore } from "@/stores/auth.store";
import { CombinedProfile, UpdateProfileData } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query Keys Factory - centralized management
export const profileKeys = {
    all: ['profile'] as const,
    user: (userId: string) => [...profileKeys.all, 'user', userId] as const,
    interest: (email: string) => [...profileKeys.all, 'interest', email] as const,
    progress: (userId: string) => [...profileKeys.all, 'progress', userId] as const,
    combined: (userId: string) => [...profileKeys.all, 'combined', userId] as const,
};

export const useProfile = () => {
    const { user } = useAuthStore();

    return useQuery<CombinedProfile>({
        queryKey: profileKeys.combined(user?.id || ''),
        queryFn: async () => {
            if (!user?.id) throw new Error("User ID is missing");

            console.log("📤 Fetching profile overview for:", user.id);

            const [userRes, interestRes, progressRes] = await Promise.allSettled([
                profileService.getMyProfile(user.id),
                profileService.getInterestDetails(user.email),
                apiClient.get(
                    ENDPOINTS.USERS.GET_PROGRESS(user.id)
                ),
            ]);

            const userData = userRes.status === "fulfilled" ? userRes.value : null;
            const interestData = interestRes.status === "fulfilled" ? interestRes.value : null;

            let progressData = {
                completed: 0,
                total: 0,
                percentage: 0,
            };

            if (progressRes.status === "fulfilled" && progressRes.value?.data?.success) {
                const data = progressRes.value.data.data;
                progressData = {
                    completed: data.completed ?? 0,
                    total: data.total ?? 0,
                    percentage:
                        data.total && data.completed
                            ? Math.round((data.completed / data.total) * 100)
                            : 0,
                };
            }

            const combinedProfile: CombinedProfile = {
                user: userData,
                interest: interestData,
                progress: progressData,
            };

            console.log("📥 Combined Profile Data:", combinedProfile);
            return combinedProfile;
        },
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes cache retention
        retry: 1,
    });
};

// Individual hooks for granular access
export const useUserProfile = () => {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: profileKeys.user(user?.id || ''),
        queryFn: () => {
            if (!user?.id) throw new Error("User ID is missing");
            return profileService.getMyProfile(user.id);
        },
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 10,
    });
};

export const useInterests = () => {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: profileKeys.interest(user?.email || ''),
        queryFn: () => {
            if (!user?.email) throw new Error("User email is missing");
            return profileService.getInterestDetails(user.email);
        },
        enabled: !!user?.email,
        staleTime: 1000 * 60 * 5,
    });
};

export const useProgress = () => {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: profileKeys.progress(user?.id || ''),
        queryFn: async () => {
            if (!user?.id) throw new Error("User ID is missing");
            const res = await apiClient.get(
                ENDPOINTS.USERS.GET_PROGRESS(user.id)
            );
            const data = res.data.data;
            return {
                completed: data.completed ?? 0,
                total: data.total ?? 0,
                percentage: data.total ? Math.round((data.completed / data.total) * 100) : 0,
            };
        },
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 2,
    });
};

// Mutation hook for profile updates with automatic refetch
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: async (updates: UpdateProfileData) => {
            if (!user?.id || !user?.email) {
                throw new Error("User ID and email are required");
            }

            console.log("📤 Starting profile update with data:", updates);

            // Separate user fields from interest fields
            const userUpdates: Partial<any> = {};
            const interestUpdates: Partial<any> = {};

            // Map UpdateProfileData fields to their correct endpoints
            if (updates.firstName !== undefined) userUpdates.firstName = updates.firstName;
            if (updates.lastName !== undefined) userUpdates.lastName = updates.lastName;
            if (updates.avatar !== undefined) userUpdates.profilePicture = updates.avatar;

            // Everything else goes to interests
            if (updates.phoneNumber !== undefined) interestUpdates.phoneNumber = updates.phoneNumber;
            if (updates.churches !== undefined) interestUpdates.churchDetails = updates.churches;
            if (updates.title !== undefined) interestUpdates.title = updates.title;
            if (updates.yearsInMinistry !== undefined) interestUpdates.yearsInMinistry = updates.yearsInMinistry;
            if (updates.conference !== undefined) interestUpdates.conference = updates.conference;
            if (updates.currentCommunityServiceProjects !== undefined) {
                interestUpdates.currentCommunityProjects = updates.currentCommunityServiceProjects;
            }
            if (updates.interests !== undefined) interestUpdates.interests = updates.interests;
            if (updates.comments !== undefined) interestUpdates.comments = updates.comments;
            if (updates.bio !== undefined) interestUpdates.profileInfo = updates.bio;

            // Execute both updates in parallel
            const [userRes, interestRes] = await Promise.allSettled([
                Object.keys(userUpdates).length > 0
                    ? profileService.updateUserProfile(user.id, userUpdates)
                    : Promise.resolve(null),
                Object.keys(interestUpdates).length > 0
                    ? profileService.updateInterestDetails(user.email, interestUpdates)
                    : Promise.resolve(null),
            ]);

            // Handle errors
            if (userRes.status === "rejected") {
                console.error("❌ User profile update failed:", userRes.reason);
                throw userRes.reason;
            }

            if (interestRes.status === "rejected") {
                console.error("❌ Interest details update failed:", interestRes.reason);
                throw interestRes.reason;
            }

            console.log("✅ Profile updates completed successfully");

            return {
                user: userRes.status === "fulfilled" ? userRes.value : null,
                interest: interestRes.status === "fulfilled" ? interestRes.value : null,
            };
        },
        onSuccess: async (data) => {
            console.log("✅ Mutation succeeded, starting cache updates...");

            // Step 1: Invalidate all profile queries
            await queryClient.invalidateQueries({
                queryKey: profileKeys.all,
            });

            // Step 2: Immediately refetch the combined profile query to get fresh data
            await queryClient.refetchQueries({
                queryKey: profileKeys.combined(user?.id || ''),
                type: 'active',
            });

            console.log("✅ Profile cache invalidated and refetched successfully");
        },
        onError: (error: any) => {
            console.error("❌ Profile update failed:", error.message || error);

            // Optionally: Show error toast/alert to user
            // Alert.alert('Update Failed', error.message);
        },
    });
};
