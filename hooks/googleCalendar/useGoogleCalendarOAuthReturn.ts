import {
  invalidateAfterGoogleCalendarOAuth,
  refreshGoogleCalendarStatus,
} from '@/hooks/googleCalendar/useGoogleCalendarStatus';
import {
  parseGoogleCalendarOAuthReturnUrl,
} from '@/services/googleCalendar.service';
import { useAuthStore } from '@/stores/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { useCallback, useEffect, useRef } from 'react';
import Toast from 'react-native-toast-message';

const handledUrls = new Set<string>();

function shouldHandleGoogleCalendarUrl(url: string): boolean {
  if (!url.includes('googleCalendar=')) return false;
  return true;
}

async function processOAuthReturnUrl(
  url: string,
  userId: string,
  queryClient: ReturnType<typeof useQueryClient>,
  onConnectionSynced?: () => void,
) {
  if (!shouldHandleGoogleCalendarUrl(url)) return;
  if (handledUrls.has(url)) return;
  handledUrls.add(url);

  const parsed = parseGoogleCalendarOAuthReturnUrl(url);
  if (parsed.outcome === 'unknown') return;

  if (parsed.outcome === 'linked') {
    try {
      await invalidateAfterGoogleCalendarOAuth(queryClient, userId);
      onConnectionSynced?.();
    } catch {
      // Keep UI usable if refresh fails.
    }
    Toast.show({
      type: 'floating',
      text1: 'Google Calendar connected.',
      visibilityTime: 4500,
    });
    return;
  }

  if (parsed.outcome === 'error') {
    Toast.show({
      type: 'floating',
      text1: parsed.reason ? `Google Calendar: ${parsed.reason}` : 'Google Calendar linking failed.',
      visibilityTime: 6000,
    });
  }
}

/**
 * Listens for OAuth return URLs (cold start, background, foreground).
 * Matches ccc-web post-OAuth invalidation + toast behavior.
 */
export function useGoogleCalendarOAuthReturn(options?: { onConnectionSynced?: () => void }) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id)?.trim() ?? '';
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onConnectionSyncedRef = useRef(options?.onConnectionSynced);
  onConnectionSyncedRef.current = options?.onConnectionSynced;

  const handleUrl = useCallback(
    async (url: string | null) => {
      if (!url || !isAuthenticated || !userId) return;
      await processOAuthReturnUrl(url, userId, queryClient, () =>
        onConnectionSyncedRef.current?.(),
      );
    },
    [isAuthenticated, queryClient, userId],
  );

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    void Linking.getInitialURL().then(handleUrl);

    const subscription = Linking.addEventListener('url', (event) => {
      void handleUrl(event.url);
    });

    return () => subscription.remove();
  }, [handleUrl, isAuthenticated, userId]);
}

/** Call after WebBrowser.openAuthSessionAsync returns success. */
export async function handleGoogleCalendarOAuthSessionResult(
  resultUrl: string,
  userId: string,
  queryClient: ReturnType<typeof useQueryClient>,
  onConnectionSynced?: () => void,
) {
  await processOAuthReturnUrl(resultUrl, userId, queryClient, onConnectionSynced);
}

export { refreshGoogleCalendarStatus, invalidateAfterGoogleCalendarOAuth };
