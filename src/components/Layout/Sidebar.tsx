import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FolderKanban,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Milestone,
  Settings,
  Ticket,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { WorkOrbitLogo } from "../ui/WorkOrbitLogo";
import { listOrganisations } from "../../api/organisation";
import { getProject } from "../../api/projects";
import { getMe } from "../../api/auth";
import type { User } from "../../types/auth";

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

type SidebarItemProps = {
  to: string;
  label: string;
  icon: LucideIcon;
  collapsed: boolean;
  pathname: string;
  onCloseSidebar: () => void;
  exact?: boolean;
};

function SidebarItem({
  to,
  label,
  icon: Icon,
  collapsed,
  pathname,
  onCloseSidebar,
  exact = false,
}: SidebarItemProps) {
  const active = exact
    ? pathname === to || pathname === `${to}/`
    : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={[
        "pj-sidebar-item group flex min-h-11 items-center gap-3 px-3",
        "text-[11px] uppercase tracking-[.13em]",
        active ? "is-active" : "",
        collapsed ? "is-collapsed" : "",
      ].join(" ")}
      onClick={onCloseSidebar}
      title={collapsed ? label : undefined}
      to={to}
    >
      <Icon aria-hidden="true" className={iconClass} />
      {!collapsed && <span className="pj-sidebar-label truncate">{label}</span>}
      {!collapsed && <span aria-hidden="true" className="pj-sidebar-marker" />}
    </Link>
  );
}

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) {
    return <div aria-hidden="true" className="mx-3 mb-3 h-px bg-[var(--pj-border)]" />;
  }
  return <p className="pj-sidebar-section-label mb-2 px-3">{label}</p>;
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
  const match = pathname.match(/^\/organisations\/([^/]+)(?:\/projects(?:\/([^/]+))?)?/);
  const routeOrgId = match?.[1];
  const routeProjectId = match?.[2];
  const storedOrgId = localStorage.getItem("activeOrgId");
  const orgId = routeOrgId ?? storedOrgId ?? undefined;
  const projectId = routeProjectId ?? (routeOrgId === storedOrgId ? localStorage.getItem("activeProjectId") ?? undefined : undefined);
  const orgBase = orgId ? `/organisations/${orgId}` : "";
  const projectsBase = orgId ? `${orgBase}/projects` : "";
  const projectBase = projectId ? `${projectsBase}/${projectId}` : "";

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
      className={`pj-sidebar fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r transition-[transform,width] duration-200 lg:sticky ${
        isMobile
          ? sidebarOpen
            ? "w-[286px] translate-x-0"
            : "w-[286px] -translate-x-full"
          : collapsed
            ? "w-[68px]"
            : "w-[252px]"
      }`}
    >
      <div className="flex h-[76px] shrink-0 items-center justify-between border-b px-5">
        <button
          aria-label="Go to organisations"
          className="rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--pj-lime)]"
          onClick={() => {
            onGoHome();
            onCloseSidebar();
          }}
          type="button"
        >
          <WorkOrbitLogo size={26} showWordmark={!collapsed} />
        </button>

        <div className="flex items-center">
          <button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="hidden rounded-none p-1 text-[var(--pj-muted)] transition-colors hover:text-[var(--pj-text)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--pj-lime)] lg:block"
            onClick={onToggleSidebar}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            type="button"
          >
            {collapsed ? <ChevronRight className={iconClass} /> : <ChevronLeft className={iconClass} />}
          </button>
          <button
            aria-label="Close navigation"
            className="rounded-none p-1 text-[var(--pj-muted)] transition-colors hover:text-[var(--pj-text)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--pj-lime)] lg:hidden"
            onClick={onCloseSidebar}
            type="button"
          >
            <X className={iconClass} />
          </button>
        </div>
      </div>

      <nav className="pj-sidebar-nav flex-1 overflow-y-auto px-3 py-6">
        <div className="mb-7">
          <SectionLabel collapsed={collapsed} label="Workspace" />
          <SidebarItem collapsed={collapsed} exact onCloseSidebar={onCloseSidebar} pathname={pathname} to="/organisations" label="Organisations" icon={Building2} />
        </div>

        {orgId && (
          <div className="mb-7">
            <SectionLabel collapsed={collapsed} label="Organisation" />
            {!collapsed && <div className="pj-sidebar-context mb-2 truncate px-3">{orgName}</div>}
            <SidebarItem collapsed={collapsed} exact onCloseSidebar={onCloseSidebar} pathname={pathname} to={projectsBase} label="Projects" icon={FolderKanban} />
            <SidebarItem collapsed={collapsed} onCloseSidebar={onCloseSidebar} pathname={pathname} to={`${orgBase}/members`} label="Members" icon={Users} />
            {/* Standup reads across the whole organisation's activity, not
                a single project, so it lives here rather than under a
                project that happens to be open. */}
            <SidebarItem collapsed={collapsed} onCloseSidebar={onCloseSidebar} pathname={pathname} to={`${orgBase}/standup`} label="Standup" icon={ClipboardCheck} />
          </div>
        )}

        {projectId && (
          <div className="mb-7">
            <SectionLabel collapsed={collapsed} label="Project" />
            {!collapsed && (
              <div className="mb-2 flex min-w-0 items-center gap-2 px-3">
                <span aria-hidden="true" className="pj-dot" />
                <span className="pj-sidebar-context truncate">{projectName}</span>
              </div>
            )}
            <SidebarItem collapsed={collapsed} onCloseSidebar={onCloseSidebar} pathname={pathname} to={`${projectBase}/dashboard`} label="Dashboard" icon={LayoutDashboard} />
            <SidebarItem collapsed={collapsed} onCloseSidebar={onCloseSidebar} pathname={pathname} to={`${projectBase}/tickets`} label="Tickets" icon={Ticket} />
            <SidebarItem collapsed={collapsed} onCloseSidebar={onCloseSidebar} pathname={pathname} to={`${projectBase}/board`} label="Board" icon={KanbanSquare} />
            <SidebarItem collapsed={collapsed} onCloseSidebar={onCloseSidebar} pathname={pathname} to={`${projectBase}/milestones`} label="Milestones" icon={Milestone} />
          </div>
        )}

        {projectId && (
          <div>
            <SectionLabel collapsed={collapsed} label="Administration" />
            <SidebarItem collapsed={collapsed} onCloseSidebar={onCloseSidebar} pathname={pathname} to={`${projectBase}/members`} label="Project members" icon={Users} />
            <SidebarItem collapsed={collapsed} onCloseSidebar={onCloseSidebar} pathname={pathname} to={`${projectBase}/settings`} label="Settings" icon={Settings} />
          </div>
        )}
      </nav>

      <div className="relative shrink-0 border-t p-3">
        {profileOpen && (
          <div className={`pj-account-menu absolute bottom-full z-20 mb-2 border bg-[var(--pj-panel)] p-2 shadow-[0_18px_45px_rgba(0,0,0,.35)] ${collapsed ? "left-2 w-52" : "left-3 right-3"}`}>
            <button
              className="flex min-h-10 w-full items-center gap-3 rounded-none px-3 text-[10px] uppercase tracking-[.16em] text-red-400 transition-colors hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
              onClick={onLogout}
              type="button"
            >
              <LogOut className={iconClass} />
              Log out
            </button>
          </div>
        )}
        <button
          aria-expanded={profileOpen}
          aria-label="Open account details"
          className={`flex min-h-12 w-full items-center gap-3 rounded-none border border-transparent px-3 text-left transition-colors hover:border-[var(--pj-lime-line)] hover:bg-[var(--pj-hover-surface)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--pj-lime)] ${collapsed ? "justify-center" : ""}`}
          onClick={() => setProfileOpen((open) => !open)}
          title={collapsed ? user?.name ?? "Account" : undefined}
          type="button"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center border border-[var(--pj-border-strong)] bg-[var(--pj-panel-muted)] text-[10px] uppercase text-[var(--pj-text)]">
            {user?.name?.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join("") ?? "?"}
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium text-[var(--pj-text)]">{user?.name ?? "Account"}</span>
              <span className="mt-1 block truncate text-[10px] text-[var(--pj-muted)]">{user?.email ?? "Loading account"}</span>
            </span>
          )}
          {!collapsed && <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-[var(--pj-muted)] transition-transform ${profileOpen ? "rotate-180" : ""}`} />}
        </button>
      </div>
    </aside>
  );
}
