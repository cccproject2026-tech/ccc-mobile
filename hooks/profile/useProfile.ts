// hooks/useProfile.ts
import { profileService } from "@/services/profile.service";
import { useAuthStore } from "@/stores/auth.store";
import { CombinedProfile, UpdateProfileData } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useProgress } from "../progress/useProgress";

// Query Keys Factory - centralized management
export const profileKeys = {
    all: ['profile'] as const,
    user: (userId: string) => [...profileKeys.all, 'user', userId] as const,
    interest: (email: string) => [...profileKeys.all, 'interest', email] as const,
    combined: (userId: string) => [...profileKeys.all, 'combined', userId] as const,
};

// ============================================
// INDIVIDUAL QUERY HOOKS
// ============================================
export const useUserProfile = () => {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: profileKeys.user(user?.id || ''),
        queryFn: async () => {
            if (!user?.id) throw new Error("User ID is missing");

            console.log("📤 Fetching user profile for:", user.id);
            const profile = await profileService.getMyProfile(user.id);
            console.log("📥 User profile fetched:", profile);

            return profile;
        },
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        retry: 1,
    });
};

export const useInterests = () => {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: profileKeys.interest(user?.email || ''),
        queryFn: async () => {
            if (!user?.email) throw new Error("User email is missing");

            console.log("📤 Fetching interests for:", user.email);
            const interests = await profileService.getInterestDetails(user.email);
            console.log("📥 Interests fetched:", interests);

            return interests;
        },
        enabled: !!user?.email,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 20, // 20 minutes
        retry: 1,
    });
};

// ============================================
// OPTIMIZED COMBINED PROFILE HOOK
// ============================================
export const useProfile = () => {
    const { user } = useAuthStore();

    // Use individual hooks for parallel queries
    const userQuery = useUserProfile();
    const interestQuery = useInterests();
    const progressQuery = useProgress();

    // Derive combined loading state
    const isLoading = userQuery.isLoading || interestQuery.isLoading || progressQuery.isLoading;

    // Derive combined error state
    const isError = userQuery.isError || interestQuery.isError || progressQuery.isError;
    const error = userQuery.error || interestQuery.error || progressQuery.error;

    // Compute combined profile data
    const data: CombinedProfile | undefined = user?.id ? {
        user: userQuery.data || null,
        interest: interestQuery.data || null,
        progress: progressQuery.data || {
            overallProgress: 0,
            roadmaps: { total: 0, completed: 0, percentage: 0, items: [] },
            assessments: { total: 0, completed: 0, percentage: 0, items: [] }
        }
    } : undefined;

    // Check if all queries are successful
    const isSuccess = userQuery.isSuccess && interestQuery.isSuccess && progressQuery.isSuccess;

    return {
        data,
        isLoading,
        isError,
        error,
        isSuccess,
        // Individual query states for granular control
        userQuery,
        interestQuery,
        progressQuery,
    };
};

// ============================================
// MUTATION HOOK FOR PROFILE UPDATES
// ============================================
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
        onSuccess: async () => {
            console.log("✅ Mutation succeeded, invalidating profile queries...");

            // Invalidate all profile-related queries (user and interest)
            await queryClient.invalidateQueries({
                queryKey: profileKeys.all,
            });

            console.log("✅ Profile cache invalidated successfully");
        },
        onError: (error: any) => {
            console.error("❌ Profile update failed:", error.message || error);
        },
    });
};

// ============================================
// ADDITIONAL HOOKS
// ============================================
export const useGetAllUsers = (role?: string) => {
    return useQuery({
        queryKey: ['users', 'all', role || ''],
        queryFn: () => profileService.getAllUsers(role),
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
};

// ============================================
// PROFILE PICTURE UPLOAD MUTATION
// ============================================
export const useUploadProfilePicture = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: async (file: any) => {
            if (!user?.id) {
                throw new Error("User ID is required");
            }

            console.log("📤 Uploading profile picture for user:", user.id);
            return await profileService.uploadProfilePicture(user.id, file);
        },
        onSuccess: async (updatedUser) => {
            console.log("✅ Profile picture uploaded, invalidating cache...");

            // Invalidate all profile queries to refetch with new picture
            await queryClient.invalidateQueries({
                queryKey: profileKeys.all,
            });

            console.log("✅ Cache invalidated successfully");
        },
        onError: (error: any) => {
            console.error("❌ Profile picture upload failed:", error.message || error);
        },
    });
};

// ============================================
// DOCUMENT MANAGEMENT HOOKS
// ============================================

// Get documents
export const useDocuments = () => {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ['documents', user?.id || ''],
        queryFn: async () => {
            if (!user?.id) throw new Error("User ID is missing");

            console.log("📤 Fetching documents for:", user.id);
            const documents = await profileService.getDocuments(user.id);
            console.log("📥 Documents fetched:", documents);

            return documents;
        },
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 20, // 20 minutes
        retry: 1,
    });
};

// Get documents for a specific user (for mentors viewing mentee documents)
export const useDocumentsByUserId = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['documents', userId || ''],
        queryFn: async () => {
            if (!userId) throw new Error("User ID is missing");

            console.log("📤 Fetching documents for user:", userId);
            const documents = await profileService.getDocuments(userId);
            console.log("📥 Documents fetched:", documents);

            return documents;
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 20, // 20 minutes
        retry: 1,
    });
};

// Upload document
export const useUploadDocument = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: async (file: any) => {
            if (!user?.id) {
                throw new Error("User ID is required");
            }

            console.log("📤 Uploading document...");
            return await profileService.uploadDocument(user.id, file);
        },
        onSuccess: async (newDocument) => {
            console.log("✅ Document uploaded successfully, invalidating cache...");

            // Invalidate documents query to refetch
            await queryClient.invalidateQueries({
                queryKey: ['documents', user?.id || ''],
            });

            console.log("✅ Documents cache invalidated");
        },
        onError: (error: any) => {
            console.error("❌ Document upload failed:", error.message || error);
        },
    });
};

// Delete document
export const useDeleteDocument = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: async (documentUrl: string) => {
            if (!user?.id) {
                throw new Error("User ID is required");
            }

            console.log("📤 Deleting document...");
            return await profileService.deleteDocument(user.id, documentUrl);
        },
        onSuccess: async () => {
            console.log("✅ Document deleted successfully, invalidating cache...");

            // Invalidate documents query to refetch
            await queryClient.invalidateQueries({
                queryKey: ['documents', user?.id || ''],
            });

            console.log("✅ Documents cache invalidated");
        },
        onError: (error: any) => {
            console.error("❌ Document delete failed:", error.message || error);
        },
    });
};