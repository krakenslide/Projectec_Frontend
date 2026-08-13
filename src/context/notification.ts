import { createContext, useContext } from "react";

export interface ProjectNotification {
    id: string;
    notification_type: string;
    title: string;
    message: string;
    ticket_id: string | null;
    project_id: string | null;
    organization_id: string | null;
    action_url: string | null;
    payload: { comment_id?: string } | null;
    is_read: boolean;
    created_at: string;
}

export interface NotificationContextValue {
    notifications: ProjectNotification[];
    unreadCount: number;
    markRead: (notificationId: string) => void;
    markAllRead: () => void;
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotifications must be used inside NotificationProvider");
    return context;
}
