

export interface Notification {
    _id?: string;
    name: string;
    details: string;
    module: string;
    /** Entity id for deep links (e.g. appointment id when module is APPOINTMENT). */
    referenceId?: string;
    read?: boolean;
    createdAt?: string;
    updatedAt?: string;
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



