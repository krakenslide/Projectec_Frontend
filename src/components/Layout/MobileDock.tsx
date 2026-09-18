import { NavLink, useLocation, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Ticket,
  MoreHorizontal,
  X,
  Milestone,
  Users,
  Settings,
  Building2,
  ClipboardCheck,
  KanbanSquare,
} from "lucide-react";
import { useState } from "react";

type DockItem = {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  active: (pathname: string) => boolean;
};

const clean = (path: string) => path.replace(/\/+$/, "") || "/";

export function MobileDock() {
  const location = useLocation();
  const params = useParams();
  const [moreOpen, setMoreOpen] = useState(false);

  const pathname = clean(location.pathname);

  /*
   * Actual application hierarchy:
   *
   * /organisations
   * /organisations/:organizationId/...
   * /organisations/:organizationId/projects/:projectId/...
   *
   * Therefore the dock is shown only once an organisationId exists.
   */
  const organizationId =
    (params as Record<string, string | undefined>).organizationId ??
    pathname.match(/^\/organisations\/([^/]+)/)?.[1];

  const projectId =
    (params as Record<string, string | undefined>).projectId ??
    pathname.match(/^\/organisations\/[^/]+\/projects\/([^/]+)/)?.[1];

  // Organisation selection/list page: no selected organisation => no dock.
  if (!organizationId) {
    return null;
  }

  const organisationBase = `/organisations/${organizationId}`;
  const projectsBase = `${organisationBase}/projects`;
  const projectBase = projectId
    ? `${projectsBase}/${projectId}`
    : undefined;

  const isProjectScope = Boolean(projectId);

  const organisationItems: DockItem[] = [
    {
      label: "Dashboard",
      to: projectsBase,
      icon: LayoutDashboard,
      active: (p) =>
        p === projectsBase || p === `${organisationBase}/projects`,
    },
    {
      label: "Projects",
      to: projectsBase,
      icon: FolderKanban,
      active: (p) => p === projectsBase,
    },
    {
      label: "Members",
      to: `${organisationBase}/members`,
      icon: Users,
      active: (p) =>
        p === `${organisationBase}/members` ||
        p.startsWith(`${organisationBase}/members/`),
    },
  ];

  const organisationMore: DockItem[] = [
    {
      label: "Projects",
      to: projectsBase,
      icon: FolderKanban,
      active: (p) =>
        p === projectsBase || p.startsWith(`${projectsBase}/`),
    },
    {
      label: "Members",
      to: `${organisationBase}/members`,
      icon: Users,
      active: (p) =>
        p === `${organisationBase}/members` ||
        p.startsWith(`${organisationBase}/members/`),
    },
  ];

  const projectItems: DockItem[] = projectBase
    ? [
        {
          label: "Dashboard",
          to: `${projectBase}/dashboard`,
          icon: LayoutDashboard,
          active: (p) => p === `${projectBase}/dashboard`,
        },
        {
          label: "Board",
          to: `${projectBase}/board`,
          icon: KanbanSquare,
          active: (p) =>
            p === `${projectBase}/board` ||
            p.startsWith(`${projectBase}/board/`),
        },
        {
          label: "Tickets",
          to: `${projectBase}/tickets`,
          icon: Ticket,
          active: (p) =>
            p === `${projectBase}/tickets` ||
            p.startsWith(`${projectBase}/tickets/`),
        },
      ]
    : [];

  const projectMore: DockItem[] = projectBase
    ? [
        {
          label: "Organisation",
          to: organisationBase,
          icon: Building2,
          active: (p) =>
            p === organisationBase || p.startsWith(`${organisationBase}/`),
        },
        {
          label: "Projects",
          to: projectsBase,
          icon: FolderKanban,
          active: (p) => p === projectsBase,
        },
        {
          label: "Milestones",
          to: `${projectBase}/milestones`,
          icon: Milestone,
          active: (p) =>
            p === `${projectBase}/milestones` ||
            p.startsWith(`${projectBase}/milestones/`),
        },
        {
          label: "Standup",
          to: `${projectBase}/standup`,
          icon: ClipboardCheck,
          active: (p) =>
            p === `${projectBase}/standup` ||
            p.startsWith(`${projectBase}/standup/`),
        },
        {
          label: "Tickets",
          to: `${projectBase}/tickets`,
          icon: Ticket,
          active: (p) =>
            p === `${projectBase}/tickets` ||
            p.startsWith(`${projectBase}/tickets/`),
        },
        {
          label: "Members",
          to: `${projectBase}/members`,
          icon: Users,
          active: (p) =>
            p === `${projectBase}/members` ||
            p.startsWith(`${projectBase}/members/`),
        },
        {
          label: "Settings",
          to: `${projectBase}/settings`,
          icon: Settings,
          active: (p) =>
            p === `${projectBase}/settings` ||
            p.startsWith(`${projectBase}/settings/`),
        },
      ]
    : [];

  const primary = isProjectScope ? projectItems : organisationItems;
  const more = isProjectScope ? projectMore : organisationMore;
  const moreActive = more.some((item) => item.active(pathname));

  return (
    <>
      {moreOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMoreOpen(false)}
          className="fixed inset-0 z-[70] bg-black/30 sm:hidden"
        />
      )}

      {moreOpen && (
        <div
          role="dialog"
          aria-label={isProjectScope ? "Project navigation" : "Organisation navigation"}
          className="fixed inset-x-3 bottom-[calc(78px+env(safe-area-inset-bottom))] z-[80] max-h-[70dvh] overflow-y-auto rounded-2xl border border-[var(--pj-border)] bg-[var(--pj-panel)] p-2 shadow-2xl sm:hidden"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-semibold text-[var(--pj-text)]">
              {isProjectScope ? "Project" : "Organisation"}
            </span>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-lg text-[var(--pj-muted)] hover:bg-[var(--pj-bg)]"
              aria-label="Close navigation"
            >
              <X size={17} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1">
            {more.map(({ label, to, icon: Icon, active }) => (
              <NavLink
                key={`${label}-${to}`}
                to={to}
                onClick={() => setMoreOpen(false)}
                className={`flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-sm ${
                  active(pathname)
                    ? "bg-[var(--pj-accent)]/10 text-[var(--pj-accent)]"
                    : "text-[var(--pj-muted)] hover:bg-[var(--pj-bg)] hover:text-[var(--pj-text)]"
                }`}
              >
                <Icon size={18} />
                <span className="truncate">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      <nav
        aria-label={isProjectScope ? "Project navigation" : "Organisation navigation"}
        className="fixed inset-x-3 bottom-3 z-[60] rounded-2xl border border-[var(--pj-border)] bg-[var(--pj-panel)]/95 px-2 pt-2 shadow-lg backdrop-blur-xl sm:hidden"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="grid grid-cols-4 gap-1">
          {primary.map(({ label, to, icon: Icon, active }) => (
            <NavLink
              key={`${label}-${to}`}
              to={to}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[11px] font-medium ${
                active(pathname)
                  ? "bg-[var(--pj-accent)]/10 text-[var(--pj-accent)]"
                  : "text-[var(--pj-muted)]"
              }`}
            >
              <Icon size={19} strokeWidth={active(pathname) ? 2.2 : 1.8} />
              <span>{label}</span>
            </NavLink>
          ))}

          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
            className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[11px] font-medium ${
              moreOpen || moreActive
                ? "bg-[var(--pj-accent)]/10 text-[var(--pj-accent)]"
                : "text-[var(--pj-muted)]"
            }`}
          >
            {moreOpen ? <X size={19} /> : <MoreHorizontal size={19} />}
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
