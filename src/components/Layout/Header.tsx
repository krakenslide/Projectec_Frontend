import { Bell, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { WorkOrbitLogo } from "../ui/WorkOrbitLogo";
import ThemeOptionsMenu from "../ui/ThemeOptionsMenu";
import ThemeToggle from "../ui/ThemeToggle";
import { useNotifications, type ProjectNotification } from "../../context/notification";
import { getTicket } from "../../api/tickets";
import type { Ticket } from "../../types/ticket";

interface HeaderProps {
    pageLabel: string;
    onLogout: () => void;
    loading: boolean;
}

export default function Header({
    pageLabel,
    onLogout,
    loading,
}: HeaderProps) {
    const navigate = useNavigate();
    const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const iconButtonBaseClass = [
        "inline-flex h-9 w-9 items-center justify-center",
        "border border-zinc-300 dark:border-white/10 bg-zinc-100 dark:bg-[#111111]",
        "text-zinc-600 dark:text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        "transition-all duration-200",
    ].join(" ");

    const monoBaseClass = [
        "font-['Inter',ui-sans-serif,sans-serif]",
        "text-[11px] uppercase tracking-[0.2em]",
    ].join(" ");

    return (
        <header className="pj-header sticky top-0 z-30 h-16 shrink-0 border-b border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-[#080808]/95 backdrop-blur-xl">
            <div className="relative flex h-full items-center justify-between gap-4 px-4 sm:px-6">
                <div className={`pj-header-progress pointer-events-none absolute bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--pj-lime)]/80 to-transparent transition-[left,width,opacity] duration-500 ${loading ? "left-0 w-1/3 animate-[pj-header-sweep_1.2s_ease-in-out_infinite]" : "left-1/4 w-1/2 opacity-60"}`} />

                <div className="flex min-w-0 items-center gap-3">

                    <div className="flex min-w-0 items-center gap-3">
                        <WorkOrbitLogo
                            size={26}
                            delay={100}
                            animate
                            enableHover
                            showWordmark={false}
                        />

                        <div className="min-w-0">
                            <div className="hidden items-center gap-2 sm:flex">
                                <span
                                    className={[
                                        monoBaseClass,
                                        "text-[10px] tracking-[0.22em] text-zinc-600 dark:text-zinc-300",
                                    ].join(" ")}
                                >
                                    WorkOrbit
                                </span>

                                <span
                                    aria-hidden="true"
                                    className="text-[11px] text-zinc-600 dark:text-zinc-300"
                                >
                                    /
                                </span>

                                <span
                                    className={[
                                        monoBaseClass,
                                        "truncate text-zinc-700 dark:text-zinc-300",
                                    ].join(" ")}
                                >
                                    {pageLabel}
                                </span>
                            </div>

                            <div
                                className={[
                                    monoBaseClass,
                                    "truncate text-zinc-700 dark:text-zinc-200 sm:hidden",
                                ].join(" ")}
                            >
                                {pageLabel}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button aria-expanded={notificationsOpen} aria-haspopup="true" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} className="relative inline-flex h-9 w-9 items-center justify-center bg-transparent text-[var(--pj-muted)] transition-colors hover:bg-[var(--pj-lime-soft)] hover:text-[var(--pj-accent-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pj-focus)]" onClick={() => setNotificationsOpen((open) => !open)} type="button"><Bell className="h-4 w-4" />{unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--pj-lime)] px-1 text-[9px] font-semibold text-[var(--pj-on-lime)]">{unreadCount > 9 ? "9+" : unreadCount}</span>}</button>
                        {notificationsOpen && <div className="pj-notification-menu absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950"><div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800"><div><p className="text-xs font-medium text-zinc-900 dark:text-white">Notifications</p><p className="mt-0.5 text-[11px] text-zinc-600 dark:text-zinc-400">Live project activity</p></div>{unreadCount > 0 && <button className="text-[10px] uppercase tracking-[.12em] text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white" onClick={markAllRead} type="button">Mark all read</button>}</div><div className="max-h-96 overflow-y-auto">{notifications.length ? notifications.map((notification) => <NotificationItem key={notification.id} notification={notification} onOpen={() => { markRead(notification.id); setNotificationsOpen(false); openNotification(navigate, notification); }} />) : <p className="px-4 py-10 text-center text-sm text-zinc-600 dark:text-zinc-400">You’re all caught up.</p>}</div></div>}
                    </div>
                    <ThemeToggle />
                    <ThemeOptionsMenu />

                    <button
                        aria-label="Log out"
                        className={[
                            iconButtonBaseClass,
                            "hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300",
                            "lg:hidden",
                        ].join(" ")}
                        onClick={onLogout}
                        type="button"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </header>
    );
}

function NotificationItem({ notification, onOpen }: { notification: ProjectNotification; onOpen: () => void }) {
    const [ticket, setTicket] = useState<Ticket | null>(null);
    useEffect(() => {
        if (!notification.ticket_id) return;
        void getTicket(notification.ticket_id).then(setTicket).catch(() => setTicket(null));
    }, [notification.ticket_id]);
    const isMention = notification.notification_type === "MENTION";
    return <button className={`block w-full border-b border-[var(--pj-border)] px-4 py-3 text-left transition-colors focus-visible:outline-none ${notification.is_read ? "" : "bg-[var(--pj-lime-soft)]"}`} onClick={onOpen} type="button"><div className="flex gap-2"><span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${notification.is_read ? "bg-transparent" : "bg-[var(--pj-lime)]"}`} /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{isMention ? "Mentioned in a comment" : notification.title}</p><span className="shrink-0 text-[10px] uppercase tracking-[.1em] text-[var(--pj-accent-text)]">{isMention ? "Open comment" : "Open"}</span></div>{ticket ? <><p className="mt-1 text-xs font-medium text-zinc-700 dark:text-zinc-200">{ticket.ticket_number} · {ticket.title}</p><p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">A teammate mentioned you on this ticket.</p></> : <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{notification.message}</p>}<p className="mt-1.5 text-[10px] uppercase tracking-[.1em] text-zinc-500 dark:text-zinc-500">{formatNotificationDate(notification.created_at)}</p></div></div></button>;
}

function openNotification(navigate: ReturnType<typeof useNavigate>, notification: ProjectNotification) {
    if (notification.action_url) { navigate(notification.action_url); return; }
    if (!notification.ticket_id || !notification.project_id || !notification.organization_id) return;
    const commentId = notification.payload?.comment_id;
    navigate(`/organisations/${notification.organization_id}/projects/${notification.project_id}/tickets/${notification.ticket_id}${commentId ? `#comment-${commentId}` : ""}`);
}

function formatNotificationDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "Just now" : date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }
