import { menteesService } from '@/services/mentees.service';
import { profileService } from '@/services/profile.service';
import type { MenteeDetail } from '@/types/mentee.types';
import { useQuery } from '@tanstack/react-query';

export const useMenteeByEmail = (email: string | undefined) => {
    return useQuery<MenteeDetail>({
        queryKey: ['mentee', 'email', email],
        queryFn: async () => {
            const mentee = await menteesService.getMenteeByEmail(email!);
            const interestResult = await profileService
                .getInterestDetails(email!)
                .catch(() => null);

            if (!interestResult) return mentee;

            const interestChurches = Array.isArray(interestResult.churchDetails)
                ? interestResult.churchDetails
                : [];
            const menteeChurches = Array.isArray(mentee.churchDetails)
                ? mentee.churchDetails
                : [];

            return {
                ...mentee,
                firstName: interestResult.firstName || mentee.firstName,
                lastName: interestResult.lastName || mentee.lastName,
                email: interestResult.email || mentee.email,
                profilePicture: interestResult.profilePicture || mentee.profilePicture,
                profileInfo: interestResult.profileInfo || mentee.profileInfo,
                phoneNumber: interestResult.phoneNumber,
                title: interestResult.title,
                yearsInMinistry: interestResult.yearsInMinistry,
                conference: interestResult.conference || mentee.conference,
                currentCommunityProjects: interestResult.currentCommunityProjects,
                interests: interestResult.interests,
                comments: interestResult.comments,
                churchDetails: interestChurches.length > 0 ? interestChurches : menteeChurches,
                userId: interestResult.userId || mentee.userId,
            };
        },
        enabled: !!email,
        staleTime: 2000,
        retry: 2,
    });
};

