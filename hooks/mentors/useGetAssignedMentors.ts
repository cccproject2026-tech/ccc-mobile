import { AssignedMentorItem, mentorsService } from '@/services/mentors.service';
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
    profileImage?: string;
    status?: string;
}

// Transform assigned mentor API response to match component expectations
const transformAssignedMentor = (mentor: AssignedMentorItem): Mentor => {
    return {
        id: mentor._id,
        name: `${mentor.firstName} ${mentor.lastName}`.trim(),
        role: mentor.role,
        email: mentor.email,
        username: undefined,
        description: undefined,
        menteesCount: undefined,
        profileImage: undefined,
        status: mentor.status,
    };
};

export const useAssignedMentors = (menteeId: string | null) => {
    const query = useQuery({
        queryKey: ['assigned-mentors', menteeId],
        queryFn: () => mentorsService.getAssignedMentors(menteeId!),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
        enabled: Boolean(menteeId), // Only run query if menteeId exists
    });

    // Transform the data
    const transformedMentors = query.data?.map(transformAssignedMentor) ?? [];

    return {
        ...query,
        mentors: transformedMentors,
        total: transformedMentors.length,
        isEmpty: !query.isLoading && transformedMentors.length === 0,
    };
};
