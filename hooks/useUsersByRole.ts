import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";
import { UserRole } from "@/types/auth.types";

export const useUsersByRole = (role: UserRole, limit: number = 10) => {
  return useQuery({
    queryKey: ["users", role, limit],
    queryFn: async () => {
      const res = await usersService.getUsersByRole(role, 1, limit);

      // Normalize response to avoid undefined fields causing runtime errors
      const users = res.users ?? [];
      const page = typeof res.page === "number" ? res.page : 1;
      const totalPages =
        typeof res.totalPages === "number" && res.totalPages > 0
          ? res.totalPages
          : 1;
      const total =
        typeof res.total === "number" ? res.total : users.length;

      return {
        users,
        page,
        totalPages,
        total,
      };
    },
    staleTime: 2000,
    retry: 1,
  });
};
