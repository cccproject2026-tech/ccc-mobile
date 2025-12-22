// types/notification.types.ts

export interface Notification {
    name: string;
    details: string;
    module: string;
}

export interface NotificationsData {
    _id: string;
    userId: string;
    role: string | null;
    notifications: Notification[];
    createdAt: string;
    updatedAt: string;
}

export interface NotificationsResponse {
    success: boolean;
    message: string;
    data: NotificationsData;
}

