import { useEffect, useMemo, useState } from "react";
import { NotificationContext, type ProjectNotification } from "./notification";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<ProjectNotification[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        let socket: WebSocket | null = null;
        let reconnectTimer: number | undefined;
        let attempts = 0;
        let stopped = false;

        const connect = () => {
            if (stopped) return;
            const url = new URL("ws://127.0.0.1:8000/ws/notifications");
            url.searchParams.set("token", token);
            socket = new WebSocket(url);
            socket.onopen = () => { attempts = 0; };
            socket.onmessage = (event) => {
                try {
                    const notification = JSON.parse(event.data) as ProjectNotification;
                    if (!notification.id || !notification.title) return;
                    setNotifications((current) => [notification, ...current.filter((item) => item.id !== notification.id)].slice(0, 30));
                } catch {
                    // Ignore non-notification frames, such as server keep-alives.
                }
            };
            socket.onclose = () => {
                if (stopped) return;
                const delay = Math.min(1000 * 2 ** attempts, 15000);
                attempts += 1;
                reconnectTimer = window.setTimeout(connect, delay);
            };
        };

        connect();
        return () => { stopped = true; if (reconnectTimer) window.clearTimeout(reconnectTimer); socket?.close(); };
    }, []);

    const value = useMemo(() => ({
        notifications,
        unreadCount: notifications.filter((notification) => !notification.is_read).length,
        markRead: (notificationId: string) => setNotifications((current) => current.map((notification) => notification.id === notificationId ? { ...notification, is_read: true } : notification)),
        markAllRead: () => setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true }))),
    }), [notifications]);

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
