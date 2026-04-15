import { useAuthStore } from '@/stores';
import { UserRole } from '@/types';
import { getNotificationRoute, getRoleNotificationRoute } from '@/utils/notifications';
import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { setupNotifications } from '@/services/notifications';

const navigateFromNotification = (
    role: UserRole | string | undefined,
    moduleName?: string | null
) => {
    const route = role === 'director'
        ? getRoleNotificationRoute(role)
        : getNotificationRoute(moduleName);

    router.push(route as any);
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

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            return;
        }

        let isMounted = true;

        const invalidateNotifications = async () => {
            try {
                await queryClient.invalidateQueries({
                    queryKey: ['notifications', user.id],
                });
            } catch (error) {
                console.warn('[notifications] invalidate failed', error);
            }
        };

        const bootstrapNotifications = async () => {
            const now = Date.now();
            if (bootstrapInFlight.current) {
                console.log('[notifications] bootstrap deduped: in-flight');
                return bootstrapInFlight.current;
            }
            if (now - lastBootstrapAt.current < BOOTSTRAP_COOLDOWN_MS) {
                console.log('[notifications] bootstrap throttled: cooldown active');
                return;
            }
            lastBootstrapAt.current = now;

            bootstrapInFlight.current = (async () => {
            try {
                await setupNotifications({ userId: user.id, enabled: !!isAuthenticated });
                await invalidateNotifications();

                let lastResponse: Notifications.NotificationResponse | null = null;
                try {
                    lastResponse = await Notifications.getLastNotificationResponseAsync();
                } catch (error) {
                    console.warn('[notifications] getLastNotificationResponseAsync failed', error);
                }

                const responseId =
                    lastResponse?.notification.request.identifier ?? null;
                const moduleName =
                    lastResponse?.notification.request.content.data?.module;

                if (
                    isMounted &&
                    moduleName &&
                    responseId &&
                    lastHandledResponseId.current !== responseId
                ) {
                    lastHandledResponseId.current = responseId;
                    try {
                        navigateFromNotification(user.role, String(moduleName));
                    } catch (error) {
                        console.warn('[notifications] navigation from last response failed', error);
                    }
                }
            } catch (error) {
                console.error('Notification bootstrap failed:', error);
            } finally {
                bootstrapInFlight.current = null;
            }
            })();

            return bootstrapInFlight.current;
        };

        bootstrapNotifications();

        try {
            receivedListener.current = Notifications.addNotificationReceivedListener(
                async () => {
                    await invalidateNotifications();
                }
            );
        } catch (error) {
            console.warn('[notifications] addNotificationReceivedListener failed', error);
        }

        try {
            responseListener.current = Notifications.addNotificationResponseReceivedListener(
                async (response: Notifications.NotificationResponse) => {
                    await invalidateNotifications();
                    lastHandledResponseId.current =
                        response.notification.request.identifier;
                    const moduleName =
                        response.notification.request.content.data?.module;
                    try {
                        navigateFromNotification(
                            user.role,
                            String(moduleName || 'notifications')
                        );
                    } catch (error) {
                        console.warn('[notifications] navigation from response failed', error);
                    }
                }
            );
        } catch (error) {
            console.warn('[notifications] addNotificationResponseReceivedListener failed', error);
        }

        const appStateSubscription = AppState.addEventListener('change', async (state) => {
            if (state === 'active') {
                try {
                    await bootstrapNotifications();
                } catch (error) {
                    console.warn('[notifications] bootstrap on active failed', error);
                }
            }
        });

        return () => {
            isMounted = false;
            appStateSubscription.remove();
            receivedListener.current?.remove();
            responseListener.current?.remove();
            receivedListener.current = null;
            responseListener.current = null;
        };
    }, [isAuthenticated, queryClient, user?.id, user?.role]);

    return <>{children}</>;
}
