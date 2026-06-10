import {
  appendReturnTo,
  buildReturnTo,
  getReturnToParam,
  safeGoBack,
} from "@/utils/navigation";
import { useAuthStore } from "@/stores/auth.store";
import type { Href } from "expo-router";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useCallback, useMemo } from "react";

type PushTarget = {
  pathname: string;
  params?: Record<string, string | undefined>;
};

/**
 * Consistent back navigation: stack history first, then `returnTo`, then `fallback`.
 * `currentReturnTo` / `appendReturnToParams` — pass when opening roadmap/assessment from review center.
 */
export function useNavigationBack(fallback?: Href) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams();
  const { user } = useAuthStore();

  const returnToFromRoute = useMemo(
    () => getReturnToParam(params as { returnTo?: string | string[] }),
    [params],
  );

  const currentReturnTo = useMemo(
    () =>
      buildReturnTo(
        pathname,
        params as Record<string, string | string[] | undefined>,
        user?.role,
      ),
    [pathname, params, user?.role],
  );

  const handleBack = useCallback(() => {
    safeGoBack(router, { returnTo: returnToFromRoute, fallback, role: user?.role });
  }, [router, returnToFromRoute, fallback, user?.role]);

  const appendReturnToParams = useCallback(
    (nextParams: Record<string, string | undefined>) =>
      appendReturnTo(nextParams, currentReturnTo),
    [currentReturnTo],
  );

  const pushWithReturn = useCallback(
    (target: PushTarget) => {
      router.push({
        pathname: target.pathname,
        params: appendReturnTo(target.params ?? {}, currentReturnTo),
      } as never);
    },
    [router, currentReturnTo],
  );

  return {
    handleBack,
    returnToFromRoute,
    currentReturnTo,
    appendReturnToParams,
    pushWithReturn,
  };
}
