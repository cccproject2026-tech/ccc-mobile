import AppGradientBackground from '@/components/layout/AppGradientBackground';
import { invalidateAfterGoogleCalendarOAuth } from '@/hooks/googleCalendar/useGoogleCalendarStatus';
import { parseGoogleCalendarOAuthReturnUrl } from '@/services/googleCalendar.service';
import { useAuthStore } from '@/stores/auth.store';
import { consumeGoogleCalendarOAuthReturnPath } from '@/utils/google-calendar/oauthReturnPath';
import { useQueryClient } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

/**
 * OAuth return landing route — matches deep link `cccpastormentor://oauth/google-calendar`.
 * Replaces the brief "+not-found" flash with a loading screen, then returns to schedule.
 */
export default function GoogleCalendarOAuthReturnScreen() {
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ googleCalendar?: string; reason?: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const [statusText, setStatusText] = useState('Finishing Google Calendar connection…');
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;

    const timer = setTimeout(() => {
      if (startedRef.current) return;
      startedRef.current = true;

      void (async () => {
        const authUser = useAuthStore.getState().user;
        const authed = useAuthStore.getState().isAuthenticated;

        if (!authed || !authUser?.id) {
          setStatusText('Sign in required. Returning…');
          router.replace('/');
          return;
        }

        let outcome: ReturnType<typeof parseGoogleCalendarOAuthReturnUrl> = {
          outcome: 'unknown',
        };

        if (params.googleCalendar) {
          const qs = new URLSearchParams();
          qs.set('googleCalendar', String(params.googleCalendar));
          if (params.reason) qs.set('reason', String(params.reason));
          outcome = parseGoogleCalendarOAuthReturnUrl(`dummy://cb?${qs.toString()}`);
        } else {
          const initialUrl = await Linking.getInitialURL();
          if (initialUrl?.includes('googleCalendar=')) {
            outcome = parseGoogleCalendarOAuthReturnUrl(initialUrl);
          }
        }

        const returnPath = await consumeGoogleCalendarOAuthReturnPath(authUser.role);

        if (outcome.outcome === 'linked') {
          setStatusText('Google Calendar connected. Opening schedule…');
          try {
            await invalidateAfterGoogleCalendarOAuth(queryClient, authUser.id);
          } catch {
            // Non-blocking.
          }
          Toast.show({
            type: 'floating',
            text1: 'Google Calendar connected.',
            visibilityTime: 4500,
          });
        } else if (outcome.outcome === 'error') {
          setStatusText('Could not connect Google Calendar. Returning…');
          Toast.show({
            type: 'floating',
            text1: outcome.reason
              ? `Google Calendar: ${outcome.reason}`
              : 'Google Calendar linking failed.',
            visibilityTime: 6000,
          });
        } else {
          setStatusText('Returning to schedule…');
        }

        router.replace(returnPath as any);
      })();
    }, 80);

    return () => clearTimeout(timer);
  }, [params.googleCalendar, params.reason, queryClient, isAuthenticated, user?.id]);

  return (
    <AppGradientBackground style={styles.root}>
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.title}>{statusText}</Text>
        <Text style={styles.subtitle}>Please wait a moment</Text>
      </View>
    </AppGradientBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
