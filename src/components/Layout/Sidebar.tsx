import { Link } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    FolderKanban,
    LogOut,
    X,
} from "lucide-react";

import { ProjectecLogo } from "../ui/ProjectecLogo";

const navItems = [
    {
        path: "/projects",
        label: "Projects",
        icon: FolderKanban,
    },
];

const iconClass = "h-4 w-4 shrink-0";

interface SidebarProps {
    sidebarOpen: boolean;
    isMobile: boolean;
    pathname: string;
    onToggleSidebar: () => void;
    onCloseSidebar: () => void;
    onLogout: () => void;
    onGoHome: () => void;
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
    const isCollapsed = !isMobile && !sidebarOpen;

    const isActive = (path: string) =>
        pathname === path || pathname.startsWith(`${path}/`);

    return (
        <aside
            aria-label="Primary navigation"
            className={[
                "fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col",
                "border-r border-[#3a3a3a] bg-[#080808]",
                "transition-[transform,width] duration-200 ease-out",
                "lg:sticky lg:top-0 lg:h-screen",
                isMobile
                    ? sidebarOpen
                        ? "w-72 translate-x-0"
                        : "w-72 -translate-x-full"
                    : isCollapsed
                        ? "w-20 translate-x-0"
                        : "w-64 translate-x-0",
            ].join(" ")}
        >
            {/* ── Brand Header ── */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#3a3a3a] px-4">
                <button
                    aria-label="Go to projects"
                    className={[
                        "group flex min-w-0 items-center text-left",
                        "rounded-none border-0 bg-transparent p-0",
                        "transition-colors duration-200",
                        isCollapsed ? "justify-center" : "",
                    ].join(" ")}
                    onClick={() => {
                        onGoHome();
                        onCloseSidebar();
                    }}
                    type="button"
                >
                    <ProjectecLogo
                        size={26}
                        animate
                        enableHover
                        showWordmark={!isCollapsed}
                    />
                </button>

                {/* ── Collapse / Close Controls ── */}
                <div className="flex items-center gap-1">
                    <button
                        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                        className={[
                            "hidden h-8 w-8 items-center justify-center border",
                            "border-transparent bg-transparent",
                            "text-[#b8b8b8]",
                            "transition-all duration-200",
                            "hover:border-[#d8d5ce]",
                            "hover:bg-[#101010]",
                            "hover:text-[#f0ede6]",
                            "lg:inline-flex",
                        ].join(" ")}
                        onClick={onToggleSidebar}
                        type="button"
                    >
                        {isCollapsed ? (
                            <ChevronRight className={iconClass} />
                        ) : (
                            <ChevronLeft className={iconClass} />
                        )}
                    </button>

                    <button
                        aria-label="Close navigation"
                        className={[
                            "inline-flex h-8 w-8 items-center justify-center border",
                            "border-transparent bg-transparent",
                            "text-[#b8b8b8]",
                            "transition-all duration-200",
                            "hover:border-[#d8d5ce]",
                            "hover:bg-[#101010]",
                            "hover:text-[#f0ede6]",
                            "lg:hidden",
                        ].join(" ")}
                        onClick={onCloseSidebar}
                        type="button"
                    >
                        <X className={iconClass} />
                    </button>
                </div>
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 overflow-y-auto px-3 py-5">
                {!isCollapsed ? (
                    <div
                        className={[
                            "mb-4 px-3 font-['DM_Mono','Courier_New',monospace]",
                            "text-[10px] uppercase tracking-[0.24em]",
                            "text-[#8a8a8a]",
                        ].join(" ")}
                    >
                        Workspace
                    </div>
                ) : null}

                <div className="space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        const Icon = item.icon;

                        return (
                            <Link
                                aria-current={active ? "page" : undefined}
                                className={[
                                    "group flex min-h-11 items-center gap-3 border border-l-4 px-3",
                                    "rounded-none font-['DM_Mono','Courier_New',monospace]",
                                    "text-[11px] uppercase tracking-[0.18em]",
                                    "transition-all duration-200",
                                    active
                                        ? [
                                            "border-transparent",
                                            "border-l-4",
                                            "border-l-[#f0ede6]",
                                            "bg-[#101010]",
                                            "text-[#f0ede6]",
                                            "pl-2",
                                        ].join(" ")
                                        : [
                                            "border-transparent",
                                            "text-[#b8b8b8]",
                                            "hover:border-[#5a5a5a]",
                                            "hover:bg-[#101010]",
                                            "hover:text-[#f0ede6]",
                                        ].join(" "),
                                    isCollapsed ? "justify-center" : "",
                                ].join(" ")}
                                key={item.path}
                                onClick={onCloseSidebar}
                                title={isCollapsed ? item.label : undefined}
                                to={item.path}
                            >
                                {/* <Icon
                                    className={[
                                        "h-4 w-4 shrink-0 transition-colors duration-200",
                                        active
                                            ? "text-[#f0ede6]"
                                            : "text-[#b8b8b8] group-hover:text-[#f0ede6]",
                                    ].join(" ")}
                                /> */}

                                {!isCollapsed ? (
                                    <span className="truncate">{item.label}</span>
                                ) : null}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* ── Footer / Logout ── */}
            <div className="shrink-0 border-t border-[#3a3a3a] p-3">
                <button
                    aria-label="Log out"
                    className={[
                        "flex min-h-11 w-full items-center gap-3 border border-transparent px-3",
                        "rounded-none bg-transparent",
                        "font-['DM_Mono','Courier_New',monospace]",
                        "text-[11px] uppercase tracking-[0.18em]",
                        "text-[#b8b8b8]",
                        "transition-all duration-200",
                        "hover:border-[#b53a3a]",
                        "hover:bg-[#120909]",
                        "hover:text-[#f07f7f]",
                        isCollapsed ? "justify-center" : "",
                    ].join(" ")}
                    onClick={onLogout}
                    title={isCollapsed ? "Logout" : undefined}
                    type="button"
                >
                    <LogOut className={iconClass} />

                    {!isCollapsed ? <span>Logout</span> : null}
                </button>
            </div>
        </aside>
    );
}