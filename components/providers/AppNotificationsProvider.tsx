import { isWebBrowserGoogleCalendarOAuthActive } from '@/hooks/googleCalendar/useGoogleCalendarOAuthReturn';
import { useAuthStore } from '@/stores';
import { UserRole } from '@/types';
import {
    getRoleNotificationRoute,
    resolveNotificationNavigation,
    type NotificationPushData,
} from '@/utils/notifications';
import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { setupNotifications } from '@/services/notifications';

const TAG = '[notifications]';

const navigateFromNotification = (
    role: UserRole | string | undefined,
    moduleName?: string | null,
    pushData?: NotificationPushData | null,
) => {
    if (role === 'director') {
        router.push(getRoleNotificationRoute(role) as any);
        return;
    }

    router.push(resolveNotificationNavigation(moduleName, pushData) as any);
};

export default function AppNotificationsProvider({
    children,
}: PropsWithChildren) {
    const queryClient = useQueryClient();
    const { isAuthenticated, user } = useAuthStore();
    const receivedListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);
    const lastHandledResponseId = useRef<string | null>(null);
    const bootstrapInFlight = useRef<Promise<void> | null>(null);
    const lastBootstrapAt = useRef<number>(0);
    const BOOTSTRAP_COOLDOWN_MS = 15000;
    const LOGIN_DELAY_MS = 600;

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            return;
        }

        let isMounted = true;
        let loginDelayTimer: ReturnType<typeof setTimeout> | null = null;

        const invalidateNotifications = async () => {
            try {
                if (!isMounted) return;
                await queryClient.invalidateQueries({
                    queryKey: ['notifications', user.id],
                });
            } catch (error) {
                console.warn(`${TAG} invalidate failed`, error);
            }
        };

        const bootstrapNotifications = async () => {
            const now = Date.now();
            if (bootstrapInFlight.current) {
                console.log(`${TAG} bootstrap deduped: in-flight`);
                return bootstrapInFlight.current;
            }
            if (now - lastBootstrapAt.current < BOOTSTRAP_COOLDOWN_MS) {
                console.log(`${TAG} bootstrap throttled: cooldown active`);
                return;
            }
            lastBootstrapAt.current = now;

            bootstrapInFlight.current = (async () => {
            try {
                if (!isMounted) return;
                console.log(`${TAG} bootstrap start`, { userId: user.id, role: user.role });
                await setupNotifications({ userId: user.id, enabled: !!isAuthenticated });
                await invalidateNotifications();

                let lastResponse: Notifications.NotificationResponse | null = null;
                try {
                    lastResponse = await Notifications.getLastNotificationResponseAsync();
                } catch (error) {
                    console.warn(`${TAG} getLastNotificationResponseAsync failed`, error);
                }

                const responseId =
                    lastResponse?.notification.request.identifier ?? null;
                const pushData = lastResponse?.notification.request.content
                    .data as NotificationPushData | undefined;
                const moduleName = pushData?.module;

                if (
                    isMounted &&
                    !isWebBrowserGoogleCalendarOAuthActive() &&
                    moduleName &&
                    responseId &&
                    lastHandledResponseId.current !== responseId
                ) {
                    lastHandledResponseId.current = responseId;
                    try {
                        navigateFromNotification(user.role, String(moduleName), pushData);
                    } catch (error) {
                        console.warn(`${TAG} navigation from last response failed`, error);
                    }
                }
            } catch (error) {
                console.error(`${TAG} bootstrap failed`, error);
            } finally {
                bootstrapInFlight.current = null;
            }
            })();

            return bootstrapInFlight.current;
        };

        // Delay slightly after login to avoid auth/navigation/provider race conditions in dev/preview builds.
        loginDelayTimer = setTimeout(() => {
            if (!isMounted) return;
            void bootstrapNotifications();
        }, LOGIN_DELAY_MS);

        try {
            receivedListener.current = Notifications.addNotificationReceivedListener(
                async () => {
                    try {
                        await invalidateNotifications();
                    } catch (error) {
                        console.warn(`${TAG} receivedListener handler failed`, error);
                    }
                }
            );
        } catch (error) {
            console.warn(`${TAG} addNotificationReceivedListener failed`, error);
        }

        try {
            responseListener.current = Notifications.addNotificationResponseReceivedListener(
                async (response: Notifications.NotificationResponse) => {
                    try {
                        if (!isMounted || isWebBrowserGoogleCalendarOAuthActive()) return;
                        await invalidateNotifications();
                        lastHandledResponseId.current =
                            response.notification.request.identifier;
                        const pushData = response.notification.request.content
                            .data as NotificationPushData | undefined;
                        const moduleName = pushData?.module;
                        try {
                            navigateFromNotification(
                                user.role,
                                String(moduleName || 'notifications'),
                                pushData,
                            );
                        } catch (error) {
                            console.warn(`${TAG} navigation from response failed`, error);
                        }
                    } catch (error) {
                        console.warn(`${TAG} responseListener handler failed`, error);
                    }
                }
            );
        } catch (error) {
            console.warn(`${TAG} addNotificationResponseReceivedListener failed`, error);
        }

        const appStateSubscription = AppState.addEventListener('change', async (state) => {
            if (state === 'active') {
                try {
                    // Refresh badge only — do not re-run last-tap navigation (e.g. after Google OAuth browser).
                    await invalidateNotifications();
                } catch (error) {
                    console.warn(`${TAG} invalidate on active failed`, error);
                }
            }
        });

        return () => {
            isMounted = false;
            if (loginDelayTimer) {
                clearTimeout(loginDelayTimer);
                loginDelayTimer = null;
            }
            appStateSubscription.remove();
            receivedListener.current?.remove();
            responseListener.current?.remove();
            receivedListener.current = null;
            responseListener.current = null;
        };
    }, [isAuthenticated, queryClient, user?.id, user?.role]);

    return <>{children}</>;
}
