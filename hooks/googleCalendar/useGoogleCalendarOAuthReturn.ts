import { parseOAuthParamsFromUrl } from '@/services/googleCalendar.service';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';

const handledUrls = new Set<string>();

/** True while WebBrowser.openAuthSessionAsync is in flight — deep links are handled in the button. */
let webBrowserOAuthSessionActive = false;

function shouldHandleGoogleCalendarUrl(url: string): boolean {
  return url.includes('googleCalendar=');
}

export function beginWebBrowserGoogleCalendarOAuth(): void {
  webBrowserOAuthSessionActive = true;
}

export function endWebBrowserGoogleCalendarOAuth(): void {
  webBrowserOAuthSessionActive = false;
}

export function isWebBrowserGoogleCalendarOAuthActive(): boolean {
  return webBrowserOAuthSessionActive;
}

/** Mark an OAuth return URL as already handled (in-app WebBrowser flow). */
export function markGoogleCalendarOAuthUrlHandled(url: string): void {
  if (url) handledUrls.add(url);
}

/** Route OAuth deep links to the dedicated handler screen (avoids +not-found flash). */
export function routeGoogleCalendarOAuthReturn(url: string): boolean {
  if (!shouldHandleGoogleCalendarUrl(url)) return false;

  // WebBrowser will resolve with the same URL — skip routing to the loading screen.
  if (webBrowserOAuthSessionActive) {
    markGoogleCalendarOAuthUrlHandled(url);
    return true;
  }

  if (handledUrls.has(url)) return true;
  handledUrls.add(url);

  router.replace({
    pathname: '/oauth/google-calendar',
    params: parseOAuthParamsFromUrl(url),
  } as any);
  return true;
}

/**
 * Listens for OAuth return deep links (cold start, background, foreground)
 * and routes them to `/oauth/google-calendar` for processing.
 */
export function useGoogleCalendarOAuthReturn() {
  const handleUrl = useCallback((url: string | null) => {
    if (!url) return;
    routeGoogleCalendarOAuthReturn(url);
  }, []);

  useEffect(() => {
    void Linking.getInitialURL().then(handleUrl);

    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    return () => subscription.remove();
  }, [handleUrl]);
}

export {
  invalidateAfterGoogleCalendarOAuth,
  refreshGoogleCalendarStatus,
} from '@/hooks/googleCalendar/useGoogleCalendarStatus';
