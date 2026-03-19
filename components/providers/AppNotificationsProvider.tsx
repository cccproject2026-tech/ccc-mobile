import { notificationsService } from '@/services/notifications.service';
import { useAuthStore } from '@/stores';
import { UserRole } from '@/types';
import { getNotificationRoute, getRoleNotificationRoute } from '@/utils/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { Alert, AppState, Platform } from 'react-native';

const NOTIFICATION_TOKEN_CACHE_KEY = 'registered-expo-push-token';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

const getProjectId = () =>
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

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

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            return;
        }

        let isMounted = true;

        const invalidateNotifications = async () => {
            await queryClient.invalidateQueries({
                queryKey: ['notifications', user.id],
            });
        };

        const registerForPushNotificationsAsync = async () => {
            console.log('Notifications bootstrap started for user:', user.id);
            console.log('Notification environment:', {
                platform: Platform.OS,
                isDevice: Device.isDevice,
                projectId: getProjectId(),
            });

            if (!Device.isDevice) {
                console.log('Expo push notifications require a physical device.');
                return;
            }

            const projectId = getProjectId();
            if (!projectId) {
                console.warn('Expo projectId is missing. Push token registration skipped.');
                return;
            }

            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#176192',
                });
            }

            const existingPermissions = await Notifications.getPermissionsAsync();
            let permissionStatus = existingPermissions.status;

            console.log('Current notification permission status:', permissionStatus);

            if (permissionStatus !== 'granted') {
                const requestedPermissions = await Notifications.requestPermissionsAsync();
                permissionStatus = requestedPermissions.status;
                console.log('Requested notification permission status:', permissionStatus);

                if (permissionStatus !== 'granted' && !requestedPermissions.canAskAgain) {
                    Alert.alert(
                        'Notifications Disabled',
                        'Please enable notification permission from device settings to receive push updates.'
                    );
                }
            }

            if (permissionStatus !== 'granted') {
                console.warn('Notification permission not granted.');
                return;
            }

            const expoPushToken = (
                await Notifications.getExpoPushTokenAsync({ projectId })
            ).data;

            console.log('Expo push token:', expoPushToken);

            const cacheKey = `${user.id}:${expoPushToken}`;
            const cachedValue = await AsyncStorage.getItem(NOTIFICATION_TOKEN_CACHE_KEY);

            if (cachedValue === cacheKey) {
                return;
            }

            await notificationsService.registerDeviceToken(user.id, expoPushToken);
            console.log('Registered Expo push token with backend for user:', user.id);
            await AsyncStorage.setItem(NOTIFICATION_TOKEN_CACHE_KEY, cacheKey);
        };

        const bootstrapNotifications = async () => {
            try {
                await registerForPushNotificationsAsync();
                await invalidateNotifications();

                const lastResponse = await Notifications.getLastNotificationResponseAsync();
                const responseId = lastResponse?.notification.request.identifier ?? null;
                const moduleName = lastResponse?.notification.request.content.data?.module;

                if (
                    isMounted &&
                    moduleName &&
                    responseId &&
                    lastHandledResponseId.current !== responseId
                ) {
                    lastHandledResponseId.current = responseId;
                    navigateFromNotification(user.role, String(moduleName));
                }
            } catch (error) {
                console.error('Notification bootstrap failed:', error);
            }
        };

        bootstrapNotifications();

        receivedListener.current = Notifications.addNotificationReceivedListener(
            async () => {
                await invalidateNotifications();
            }
        );

        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            async (response: Notifications.NotificationResponse) => {
                await invalidateNotifications();
                lastHandledResponseId.current = response.notification.request.identifier;
                const moduleName = response.notification.request.content.data?.module;
                navigateFromNotification(user.role, String(moduleName || 'notifications'));
            }
        );

        const appStateSubscription = AppState.addEventListener('change', async (state) => {
            if (state === 'active') {
                await bootstrapNotifications();
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
