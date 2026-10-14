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
  FolderKanban,
  KanbanSquare,
  LayoutDashboard,
  Milestone,
  MoreHorizontal,
  Settings,
  Ticket,
  Users,
  X,
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

  const organizationId =
    (params as Record<string, string | undefined>).organizationId ??
    pathname.match(/^\/organisations\/([^/]+)/)?.[1];
  const projectId =
    (params as Record<string, string | undefined>).projectId ??
    pathname.match(/^\/organisations\/[^/]+\/projects\/([^/]+)/)?.[1];

  if (!organizationId) return null;

  const organisationBase = `/organisations/${organizationId}`;
  const projectsBase = `${organisationBase}/projects`;
  const projectBase = projectId ? `${projectsBase}/${projectId}` : undefined;
  const isProjectScope = Boolean(projectBase);

  const organisationItems: DockItem[] = [
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
      active: (p) => p === `${organisationBase}/members` || p.startsWith(`${organisationBase}/members/`),
    },
    {
      label: "Standup",
      to: `${organisationBase}/standup`,
      icon: ClipboardCheck,
      active: (p) => p === `${organisationBase}/standup` || p.startsWith(`${organisationBase}/standup/`),
    },
  ];

  const organisationMore: DockItem[] = [
    {
      label: "Organisations",
      to: "/organisations",
      icon: Building2,
      active: (p) => p === "/organisations",
    },
    ...organisationItems,
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
          active: (p) => p === `${projectBase}/board` || p.startsWith(`${projectBase}/board/`),
        },
        {
          label: "Tickets",
          to: `${projectBase}/tickets`,
          icon: Ticket,
          active: (p) => p === `${projectBase}/tickets` || p.startsWith(`${projectBase}/tickets/`),
        },
      ]
    : [];

  const projectMore: DockItem[] = projectBase
    ? [
        {
          label: "Milestones",
          to: `${projectBase}/milestones`,
          icon: Milestone,
          active: (p) => p === `${projectBase}/milestones` || p.startsWith(`${projectBase}/milestones/`),
        },
        {
          label: "Project members",
          to: `${projectBase}/members`,
          icon: Users,
          active: (p) => p === `${projectBase}/members` || p.startsWith(`${projectBase}/members/`),
        },
        {
          label: "Settings",
          to: `${projectBase}/settings`,
          icon: Settings,
          active: (p) => p === `${projectBase}/settings` || p.startsWith(`${projectBase}/settings/`),
        },
        {
          label: "Organisation",
          to: organisationBase,
          icon: Building2,
          active: (p) => p === organisationBase,
        },
        {
          label: "Projects",
          to: projectsBase,
          icon: FolderKanban,
          active: (p) => p === projectsBase,
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
          className="fixed inset-0 z-[70] bg-black/45 sm:hidden"
        />
      )}

      {moreOpen && (
        <div
          role="dialog"
          aria-label={isProjectScope ? "Project navigation" : "Organisation navigation"}
          className="pj-more-sheet fixed inset-x-0 bottom-[calc(62px+env(safe-area-inset-bottom))] z-[80] max-h-[72dvh] overflow-y-auto border-t bg-[var(--pj-panel)] p-4 shadow-[0_-18px_50px_rgba(0,0,0,.35)] sm:hidden"
        >
          <div className="mb-4 flex items-end justify-between border-b border-[var(--pj-border)] pb-3">
            <div>
              <p className="text-[9px] uppercase tracking-[.24em] text-[var(--pj-dim)]">Navigation</p>
              <h2 className="mt-1 text-base font-medium text-[var(--pj-text)]">
                {isProjectScope ? "Project" : "Organisation"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-none text-[var(--pj-muted)] hover:bg-[var(--pj-hover-surface)] hover:text-[var(--pj-text)]"
              aria-label="Close navigation"
            >
              <X size={17} />
            </button>
          </div>

          <div className="space-y-1">
            {more.map(({ label, to, icon: Icon, active }) => {
              const selected = active(pathname);
              return (
                <NavLink
                  key={`${label}-${to}`}
                  to={to}
                  onClick={() => setMoreOpen(false)}
                  className={`flex min-h-12 items-center gap-3 border-l-2 px-3 text-sm transition-colors ${
                    selected
                      ? "border-l-[var(--pj-lime)] bg-[var(--pj-active-surface)] font-semibold text-[var(--pj-text)]"
                      : "border-l-transparent text-[var(--pj-muted)] hover:border-l-[var(--pj-lime-line)] hover:bg-[var(--pj-hover-surface)] hover:text-[var(--pj-text)]"
                  }`}
                >
                  <Icon size={18} className={selected ? "text-[var(--pj-lime)]" : ""} />
                  <span>{label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}

      <nav
        aria-label={isProjectScope ? "Project navigation" : "Organisation navigation"}
        className="pj-mobile-dock fixed inset-x-0 bottom-0 z-[60] border-t bg-[var(--pj-panel)]/96 backdrop-blur-xl sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className={`grid ${primary.length === 3 ? "grid-cols-4" : "grid-cols-3"}`}>
          {primary.map(({ label, to, icon: Icon, active }) => {
            const selected = active(pathname);
            return (
              <NavLink
                key={`${label}-${to}`}
                to={to}
                className={`relative flex min-h-[62px] flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-medium uppercase tracking-[.06em] transition-colors ${
                  selected ? "text-[var(--pj-text)]" : "text-[var(--pj-muted)]"
                }`}
              >
                {selected && <span className="absolute inset-x-7 top-0 h-0.5 bg-[var(--pj-lime)]" />}
                <Icon size={19} strokeWidth={selected ? 2.2 : 1.7} className={selected ? "text-[var(--pj-lime)]" : ""} />
                <span>{label}</span>
              </NavLink>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
            className={`relative flex min-h-[62px] flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-medium uppercase tracking-[.06em] transition-colors ${
              moreOpen || moreActive ? "text-[var(--pj-text)]" : "text-[var(--pj-muted)]"
            }`}
          >
            {(moreOpen || moreActive) && <span className="absolute inset-x-7 top-0 h-0.5 bg-[var(--pj-lime)]" />}
            {moreOpen ? <X size={19} /> : <MoreHorizontal size={19} className={moreActive ? "text-[var(--pj-lime)]" : ""} />}
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
