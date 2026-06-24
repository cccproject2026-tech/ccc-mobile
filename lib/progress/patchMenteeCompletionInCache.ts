import { Mentee } from '@/types/mentee.types';
import { InfiniteData, QueryClient } from '@tanstack/react-query';

type MenteesPage = {
    mentees: Mentee[];
    total: number;
    nextPage?: number;
};

export function patchMenteeHasCompleted(
    queryClient: QueryClient,
    userId: string,
    hasCompleted: boolean,
    completedOn?: string,
) {
    queryClient.setQueriesData<InfiniteData<MenteesPage>>(
        { queryKey: ['mentees'] },
        (old) => {
            if (!old) return old;

            return {
                ...old,
                pages: old.pages.map((page) => ({
                    ...page,
                    mentees: page.mentees.map((mentee) =>
                        mentee.id === userId
                            ? {
                                  ...mentee,
                                  hasCompleted,
                                  completedOn:
                                      completedOn ??
                                      mentee.completedOn ??
                                      new Date().toISOString(),
                              }
                            : mentee,
                    ),
                })),
            };
        },
    );
}
