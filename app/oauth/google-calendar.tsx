import AppGradientBackground from '@/components/layout/AppGradientBackground';
import { invalidateAfterGoogleCalendarOAuth } from '@/hooks/googleCalendar/useGoogleCalendarStatus';
import { parseGoogleCalendarOAuthReturnUrl } from '@/services/googleCalendar.service';
import { useAuthStore } from '@/stores/auth.store';
import {
  GOOGLE_CALENDAR_COPY,
  shortenGoogleCalendarMessage,
} from '@/utils/google-calendar/display-messages';
import { isWebBrowserGoogleCalendarOAuthActive } from '@/hooks/googleCalendar/useGoogleCalendarOAuthReturn';
import { leaveGoogleCalendarOAuthScreen } from '@/utils/google-calendar/oauthNavigation';
import { consumeGoogleCalendarOAuthReturnPath } from '@/utils/google-calendar/oauthReturnPath';
import { useQueryClient } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import Toast from 'react-native-toast-message';

function parseOutcomeFromParams(params: {
  googleCalendar?: string;
  reason?: string;
}): ReturnType<typeof parseGoogleCalendarOAuthReturnUrl> {
  if (!params.googleCalendar) {
    return { outcome: 'unknown' };
  }
  const qs = new URLSearchParams();
  qs.set('googleCalendar', String(params.googleCalendar));
  if (params.reason) qs.set('reason', String(params.reason));
  return parseGoogleCalendarOAuthReturnUrl(`dummy://cb?${qs.toString()}`);
}

/**
 * OAuth return landing route — cold-start / background deep links only.
 * In-app WebBrowser returns are handled inline in GoogleCalendarConnectButton.
 */
export default function GoogleCalendarOAuthReturnScreen() {
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ googleCalendar?: string; reason?: string }>();
  const finishedRef = useRef(false);

  useEffect(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    void (async () => {
      // In-app WebBrowser flow already handled on the schedule screen — go back, do not redirect.
      if (isWebBrowserGoogleCalendarOAuthActive()) {
        if (router.canGoBack()) router.back();
        return;
      }

      const authUser = useAuthStore.getState().user;
      const authed = useAuthStore.getState().isAuthenticated;

      if (!authed || !authUser?.id) {
        leaveGoogleCalendarOAuthScreen('/', authUser?.role);
        return;
      }

      let outcome = parseOutcomeFromParams(params);

      if (outcome.outcome === 'unknown') {
        try {
          const initialUrl = await Linking.getInitialURL();
          if (initialUrl?.includes('googleCalendar=')) {
            outcome = parseGoogleCalendarOAuthReturnUrl(initialUrl);
          }
        } catch {
          // fall through
        }
      }

      let returnPath: string | null = null;
      try {
        returnPath = await consumeGoogleCalendarOAuthReturnPath(authUser.role);
      } catch {
        returnPath = null;
      }

      if (outcome.outcome === 'linked') {
        invalidateAfterGoogleCalendarOAuth(queryClient, authUser.id);
        Toast.show({
          type: 'floating',
          text1: GOOGLE_CALENDAR_COPY.connected,
          visibilityTime: 4500,
        });
      } else if (outcome.outcome === 'error') {
        Toast.show({
          type: 'floating',
          text1: outcome.reason
            ? shortenGoogleCalendarMessage(outcome.reason)
            : GOOGLE_CALENDAR_COPY.connectFailed,
          visibilityTime: 6000,
        });
      }

      leaveGoogleCalendarOAuthScreen(returnPath, authUser.role);
    })();
  }, [params.googleCalendar, params.reason, queryClient]);

  // No loading UI — navigate away immediately (connection already succeeded).
  return <AppGradientBackground style={{ flex: 1 }} />;
}
