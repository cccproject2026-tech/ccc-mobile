import { MentorListItem, mentorsService } from '@/services/mentors.service';
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
}

// Transform API response to match component expectations
const transformMentor = (mentor: MentorListItem): Mentor => {
    return {
        id: mentor.id,
        name: `${mentor.firstName} ${mentor.lastName}`.trim(),
        role: mentor.role,
        email: mentor.email,
        username: mentor.username,
        description: undefined, // API doesn't provide description
        menteesCount: undefined, // API doesn't provide menteesCount
        profileImage: undefined, // API doesn't provide profileImage
    };
};

export const useMentors = () => {
    const query = useQuery({
        queryKey: ['mentors'],
        queryFn: () => mentorsService.getMentors(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
    });

    // Transform the data
    const transformedData = query.data
        ? {
              mentors: query.data.mentors.map(transformMentor),
              total: query.data.total,
          }
        : undefined;

    return {
        ...query,
        data: transformedData,
        mentors: transformedData?.mentors ?? [],
        total: transformedData?.total ?? 0,
    };
};

