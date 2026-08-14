import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Building2, ChevronDown, ChevronLeft, ChevronRight, FolderKanban, LayoutDashboard, ListTodo, LogOut, Settings, Users, X, ClipboardList, Flag, type LucideIcon } from "lucide-react";
import { ProjectecLogo } from "../ui/ProjectecLogo";
import { listOrganisations } from "../../api/organisation";
import { getProject } from "../../api/projects";
import { getMe } from "../../api/auth";
import type { User } from "../../types/auth";
const iconClass = "h-4 w-4 shrink-0";
interface SidebarProps { sidebarOpen: boolean; isMobile: boolean; pathname: string; onToggleSidebar: () => void; onCloseSidebar: () => void; onLogout: () => void; onGoHome: () => void }

function SidebarItem({
    to,
    label,
    icon: Icon,
    collapsed,
    pathname,
    onCloseSidebar,
    exact = false,
}: {
    to: string;
    label: string;
    icon: LucideIcon;
    collapsed: boolean;
    pathname: string;
    onCloseSidebar: () => void;
    exact?: boolean;
}) {
    const active = exact
        ? pathname === to || pathname === `${to}/`
        : pathname === to || pathname.startsWith(`${to}/`);

    return (
        <Link
            aria-current={active ? "page" : undefined}
            className={[
                "flex min-h-11 items-center gap-3 border-l-2 px-3 text-[11px] uppercase tracking-[.14em] transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white",
                active
                    ? "border-l-zinc-900 bg-zinc-200 text-zinc-950 dark:border-l-white dark:bg-zinc-900/90 dark:text-white"
                    : "border-l-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:text-zinc-800 dark:hover:text-zinc-100",
                collapsed ? "justify-center" : "",
            ].join(" ")}
            onClick={onCloseSidebar}
            title={collapsed ? label : undefined}
            to={to}
        >
            <Icon aria-hidden="true" className={iconClass} />
            {!collapsed && <span className="truncate">{label}</span>}
        </Link>
    );
}

export default function Sidebar({
    sidebarOpen,
    isMobile,
    pathname,
    onToggleSidebar,
    onCloseSidebar,
    onLogout,
    onGoHome,
}: SidebarProps) {
    const collapsed = !isMobile && !sidebarOpen;
    const match = pathname.match(
        /^\/organisations\/([^/]+)(?:\/projects(?:\/([^/]+))?)?/
    );
    const routeOrgId = match?.[1];
    const storedOrgId = localStorage.getItem("activeOrgId");
    const orgId = routeOrgId ?? storedOrgId ?? undefined;
    const projectId = match?.[2] ?? (storedOrgId === orgId ? localStorage.getItem("activeProjectId") ?? undefined : undefined);
    const orgBase = orgId ? `/organisations/${orgId}` : "";
    const projectBase = projectId
        ? `${orgBase}/projects/${projectId}`
        : "";
    const [orgName, setOrgName] = useState(localStorage.getItem("activeOrgName") || "Current organisation");
    const [projectName, setProjectName] = useState(localStorage.getItem("activeProjectName") || "Current project");
    const [user, setUser] = useState<User | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);

    useEffect(() => {
        void getMe().then(setUser).catch(() => undefined);
    }, []);

    useEffect(() => {
        if (!orgId) return;
        void listOrganisations()
            .then((organisations) => {
                const organisation = organisations.find((item) => item.id === orgId);
                if (organisation) {
                    setOrgName(organisation.name);
                    localStorage.setItem("activeOrgName", organisation.name);
                }
            })
            .catch(() => undefined);
    }, [orgId]);

    useEffect(() => {
        if (!projectId) return;
        void getProject(projectId)
            .then((project) => {
                setProjectName(project.name);
                localStorage.setItem("activeProjectName", project.name);
                localStorage.setItem("activeProjectId", project.id);
            })
            .catch(() => undefined);
    }, [projectId]);

    return (
        <aside
            aria-label="Primary navigation"
            className={[
                "fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-zinc-200 dark:border-zinc-800 bg-[#fafafa] dark:bg-[#0b0b0b] transition-[transform,width] duration-200 lg:sticky",
                isMobile
                    ? sidebarOpen
                        ? "w-72 translate-x-0"
                        : "w-72 -translate-x-full"
                    : collapsed
                        ? "w-16"
                        : "w-60",
            ].join(" ")}
        >
            <div className="flex h-20 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-5">
                <button
                    aria-label="Go to organisations"
                    className="rounded-sm bg-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                    onClick={() => {
                        onGoHome();
                        onCloseSidebar();
                    }}
                    type="button"
                >
                    <ProjectecLogo size={26} showWordmark={!collapsed} />
                </button>

                <div className="flex items-center">
                    <button
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        aria-expanded={!collapsed}
                        className="hidden rounded-sm p-1 text-zinc-600 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white lg:block"
                        onClick={onToggleSidebar}
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        type="button"
                    >
                        {collapsed ? (
                            <ChevronRight aria-hidden="true" className={iconClass} />
                        ) : (
                            <ChevronLeft aria-hidden="true" className={iconClass} />
                        )}
                    </button>
                    <button
                        aria-label="Close navigation"
                        className="rounded-sm p-1 text-zinc-600 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white lg:hidden"
                        onClick={onCloseSidebar}
                        type="button"
                    >
                        <X aria-hidden="true" className={iconClass} />
                    </button>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-7">
                <p
                    className={`mb-3 px-3 text-[10px] uppercase tracking-[.2em] text-zinc-700 dark:text-zinc-200 ${collapsed ? "hidden" : ""}`}
                >
                    Workspace
                </p>
                <div className="space-y-1">
                    <SidebarItem collapsed={collapsed} exact onCloseSidebar={onCloseSidebar} pathname={pathname} to="/organisations" label="Organisations" icon={Building2} />
                </div>

                {orgId && (
                    <>
                        <p
                            className={`mb-3 mt-8 truncate px-3 text-[10px] font-medium uppercase tracking-[.2em] text-zinc-700 dark:text-zinc-200 ${collapsed ? "hidden" : ""}`}
                        >
                            {orgName}
                        </p>
                        <div className="space-y-1">
                            <SidebarItem collapsed={collapsed} exact onCloseSidebar={onCloseSidebar} pathname={pathname} to={`${orgBase}/projects`} label="Projects" icon={FolderKanban} />
                            <SidebarItem collapsed={collapsed} onCloseSidebar={onCloseSidebar} pathname={pathname} to={`${orgBase}/members`} label="Members" icon={Users} />
                            <SidebarItem collapsed={collapsed} onCloseSidebar={onCloseSidebar} pathname={pathname} to={`${projectBase}/standup`} label="Standup" icon={ClipboardList} />
                        </div>
                    </>
                )}

                {projectId && (
                    <>
                        <p
                            className={`mb-3 mt-8 truncate px-3 text-[10px] font-medium uppercase tracking-[.2em] text-zinc-700 dark:text-zinc-200 ${collapsed ? "hidden" : ""}`}
                        >
                            {projectName}
                        </p>
                        <div className="space-y-1">
                            <SidebarItem collapsed={collapsed} onCloseSidebar={onCloseSidebar} pathname={pathname} to={`${projectBase}/dashboard`} label="Dashboard" icon={LayoutDashboard} />
                            <SidebarItem collapsed={collapsed} onCloseSidebar={onCloseSidebar} pathname={pathname} to={`${projectBase}/tickets`} label="Tickets" icon={ListTodo} />
                            <SidebarItem collapsed={collapsed} onCloseSidebar={onCloseSidebar} pathname={pathname} to={`${projectBase}/board`} label="Kanban board" icon={BarChart3} />
                            <SidebarItem collapsed={collapsed} onCloseSidebar={onCloseSidebar} pathname={pathname} to={`${projectBase}/milestones`} label="Milestones" icon={Flag} />
                            <SidebarItem collapsed={collapsed} onCloseSidebar={onCloseSidebar} pathname={pathname} to={`${projectBase}/members`} label="Project members" icon={Users} />
                            <SidebarItem collapsed={collapsed} onCloseSidebar={onCloseSidebar} pathname={pathname} to={`${projectBase}/settings`} label="Project settings" icon={Settings} />
                        </div>
                    </>
                )}
            </nav>

            <div className="relative border-t border-zinc-200 dark:border-zinc-800 p-4">
                {profileOpen && <div className={`absolute bottom-full z-20 mb-2 border border-zinc-300 dark:border-zinc-700 bg-[#f4f4f5] dark:bg-[#101010] p-2 shadow-[0_12px_35px_rgba(0,0,0,.4)] ${collapsed ? "left-2 w-48" : "left-4 right-4"}`}>
                    <button className="flex min-h-10 w-full items-center gap-3 rounded-sm px-3 text-xs uppercase tracking-[.14em] text-red-300 transition-colors hover:bg-red-950/20 hover:text-red-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-300" onClick={onLogout} type="button"><LogOut aria-hidden="true" className={iconClass} />Log out</button>
                </div>}
                <button
                    aria-expanded={profileOpen}
                    aria-label="Open account details"
                    className={`flex min-h-11 w-full items-center gap-3 rounded-sm px-3 text-left text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/70 hover:text-zinc-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${collapsed ? "justify-center" : ""}`}
                    onClick={() => setProfileOpen((open) => !open)}
                    title={collapsed ? (user?.name ?? "Account") : undefined}
                    type="button"
                >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-[10px] uppercase text-zinc-700 dark:text-zinc-300">
                        {user?.name
                            ?.trim()
                            .split(/\s+/)
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("") ?? "?"}
                    </span>                    {!collapsed && <span className="min-w-0 flex-1"><span className="block truncate text-xs text-zinc-700 dark:text-zinc-200">{user?.name ?? "Account"}</span><span className="mt-1 block truncate text-[10px] text-zinc-600 dark:text-zinc-300">{user?.email ?? "Loading account"}</span></span>}
                    {!collapsed && <ChevronDown aria-hidden="true" className={`h-3.5 w-3.5 shrink-0 transition-transform ${profileOpen ? "rotate-180" : ""}`} />}
                </button>
            </div>
        </aside>
    );
}