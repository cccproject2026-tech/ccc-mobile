import { Mentee } from '@/components/director/MenteeCard';
import { MenteeListItem, menteesService } from '@/services/mentees.service';
import { useQuery } from '@tanstack/react-query';

// Transform API response to match component expectations
const transformMentee = (mentee: MenteeListItem): Mentee => {
    return {
        id: mentee.id,
        name: `${mentee.firstName} ${mentee.lastName}`.trim(),
        role: mentee.role,
        description: '', // API doesn't provide description
        lastContacted: undefined, // API doesn't provide lastContacted
        totalMentors: undefined, // API doesn't provide totalMentors
        profileImage: undefined, // API doesn't provide profileImage
        phase: undefined, // API doesn't provide phase
        phaseNumber: undefined, // API doesn't provide phaseNumber
        progress: undefined, // API doesn't provide progress
        isCompleted: undefined, // API doesn't provide isCompleted
        completedOn: undefined, // API doesn't provide completedOn
        hasCertificate: undefined, // API doesn't provide hasCertificate
        isFieldMentor: undefined, // API doesn't provide isFieldMentor
        status: undefined, // API doesn't provide status
        scholarshipAmount: undefined, // API doesn't provide scholarshipAmount
        dateOfApproval: undefined, // API doesn't provide dateOfApproval
    };
};

export const useMentees = () => {
    const query = useQuery({
        queryKey: ['mentees'],
        queryFn: () => menteesService.getMentees(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
    });

    // Transform the data
    const transformedData = query.data
        ? {
              mentees: query.data.mentees.map(transformMentee),
              total: query.data.total,
          }
        : undefined;

    return {
        ...query,
        data: transformedData,
        mentees: transformedData?.mentees ?? [],
        total: transformedData?.total ?? 0,
    };
};

