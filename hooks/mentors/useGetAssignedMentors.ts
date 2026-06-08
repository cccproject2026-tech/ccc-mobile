import { mentorsService } from '@/services/mentors.service';
import { AssignedMentorItem } from '@/types/mentors.types';
import { useQuery } from '@tanstack/react-query';

// Transformed mentor type that matches component expectations
export interface Mentor {
    id: string;
    name: string;
    role: string;
    description?: string;
    email?: string;
    username?: string;
    menteesCount?: number;
    profilePicture?: string;
    profileInfo?: string;
    status?: string;
}

// Transform assigned mentor API response to match component expectations
const transformAssignedMentor = (mentor: AssignedMentorItem): Mentor => {
    return {
        id: mentor._id,
        name: `${mentor.firstName} ${mentor.lastName}`.trim(),
        role: mentor.role,
        email: mentor.email,
        description: undefined,
        menteesCount: undefined,
        profilePicture: mentor.profilePicture,
        profileInfo: mentor.profileInfo,
        status: mentor.status,
    };
};

export const useAssignedMentors = (
    menteeId: string | null
): {
    mentors: Mentor[];
    total: number;
    isEmpty: boolean;
    [key: string]: any;
} => {
    const query = useQuery({
        queryKey: ['assigned-mentors', menteeId],
        queryFn: () => mentorsService.getAssignedMentors(menteeId!),
        staleTime: 2000,
        retry: 2,
        enabled: Boolean(menteeId),
    });

    
    const transformedMentors = query.data?.map(transformAssignedMentor) ?? [];

    return {
        ...query,
        mentors: transformedMentors,
        total: transformedMentors.length,
        isEmpty: !query.isLoading && transformedMentors.length === 0,
    };
};
