import type { FC, ReactNode } from "react";

/* --------------------------------------------------------------------------
   Tokens lifted directly from src/index.css.

   The marketing site runs on paper and the product runs on ink, but every
   signal means the same thing in both: lime = state / intent / positive,
   yellow = attention, red = failure.
   -------------------------------------------------------------------------- */
export const LIME = "#d8ff58";
export const INK = "#11110f";
export const PAPER = "#f3f1ea";
export const PAPER_DEEP = "#eeece5";

export const APP = {
    bg: "#090a08",
    panel: "#12140f",
    raised: "#181b15",
    muted: "#1e221b",
    hover: "#171a14",
    text: "#f2f0e7",
    dim: "#aeb0a6",
    faint: "#858980",
    line: "rgba(244,242,233,.13)",
    lineStrong: "rgba(244,242,233,.24)",
    limeLine: "rgba(216,255,88,.34)",
    limeTint: "rgba(216,255,88,.11)",
    yellow: "#f1d75b",
    red: "#ff8278",
};

export type TabId =
    | "dashboard"
    | "tickets"
    | "board"
    | "milestones"
    | "standup"
    | "members"
    | "settings";

const SELECTABLE: TabId[] = [
    "dashboard",
    "tickets",
    "board",
    "milestones",
    "standup",
    "members",
    "settings",
];

/* Line icons echoing the lucide set used in the real sidebar. */
const NavIcon: FC<{ name: string }> = ({ name }) => {
    const paths: Record<string, ReactNode> = {
        building: (
            <>
                <rect x="4" y="3" width="10" height="14" />
                <path d="M14 8h4v9h-4M7 6h1M7 9h1M7 12h1M11 6h1M11 9h1M11 12h1" />
            </>
        ),
        folder: (
            <>
                <path d="M3 6a1 1 0 0 1 1-1h4l2 2h6a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
                <path d="M7 9v6M13 9v6" />
            </>
        ),
        users: (
            <>
                <circle cx="8" cy="7" r="2.5" />
                <path d="M3.5 16c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
                <path d="M14 7.5a2 2 0 1 0 0-1M16.5 16c0-1.8-.8-3-2-3.6" />
            </>
        ),
        dashboard: (
            <>
                <rect x="3" y="3" width="6" height="7" />
                <rect x="11" y="3" width="6" height="4" />
                <rect x="3" y="12" width="6" height="5" />
                <rect x="11" y="9" width="6" height="8" />
            </>
        ),
        ticket: (
            <>
                <path d="M3 7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1.5 1.5 0 0 0 0 3v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1.5 1.5 0 0 0 0-3Z" />
                <path d="M11 6v9" />
            </>
        ),
        board: (
            <>
                <rect x="3" y="3" width="4.5" height="14" />
                <rect x="8" y="3" width="4.5" height="9" />
                <rect x="13" y="3" width="4" height="12" />
            </>
        ),
        milestone: (
            <>
                <path d="M5 3v15" />
                <path d="M5 4h10l-2.2 3L15 10H5" />
            </>
        ),
        standup: (
            <>
                <rect x="4" y="3" width="12" height="14" />
                <path d="M7 7h6M7 10h6M7 13h3" />
            </>
        ),
        settings: (
            <>
                <circle cx="10" cy="10" r="2.6" />
                <path d="M10 2.6v2M10 15.4v2M17.4 10h-2M4.6 10h-2M15.2 4.8l-1.4 1.4M6.2 13.8l-1.4 1.4M15.2 15.2l-1.4-1.4M6.2 6.2 4.8 4.8" />
            </>
        ),
    };

    return (
        <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="h-3.5 w-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {paths[name]}
        </svg>
    );
};

const SIDEBAR_GROUPS: {
    label: string;
    items: { id: string; label: string; icon: string }[];
}[] = [
        { label: "Workspace", items: [{ id: "organisations", label: "Organisations", icon: "building" }] },
        {
            label: "Organisation",
            items: [
                { id: "projects", label: "Projects", icon: "folder" },
                { id: "org-members", label: "Members", icon: "users" },
            ],
        },
        {
            label: "Project",
            items: [
                { id: "dashboard", label: "Dashboard", icon: "dashboard" },
                { id: "tickets", label: "Tickets", icon: "ticket" },
                { id: "board", label: "Board", icon: "board" },
                { id: "milestones", label: "Milestones", icon: "milestone" },
                { id: "standup", label: "Standup", icon: "standup" },
            ],
        },
        {
            label: "Administration",
            items: [
                { id: "members", label: "Project members", icon: "users" },
                { id: "settings", label: "Settings", icon: "settings" },
            ],
        },
    ];

/* ==========================================================================
   THE APP FRAME
   A faithful reproduction of the product chrome: the same sidebar sections,
   the same header breadcrumb, and the same active-state language — a 2px
   lime rail, a raised tinted surface, a lime icon and a trailing marker.
   ========================================================================== */
export const AppFrame: FC<{
    active: TabId;
    breadcrumb: string;
    onNavigate?: (id: TabId) => void;
    children: ReactNode;
    minHeight?: number;
}> = ({ active, breadcrumb, onNavigate, children, minHeight = 560 }) => (
    <div
        className="w-full overflow-hidden border"
        style={{ borderColor: APP.line, background: APP.bg, color: APP.text }}
    >
        <div
            className="flex h-[40px] items-center gap-3.5 border-b px-[15px] font-mono text-[9px]"
            style={{ borderColor: APP.line, background: APP.muted, color: APP.faint }}
        >
            <div className="flex gap-[5px]">
                <span className="h-[7px] w-[7px] rounded-full" style={{ background: "#55584e" }} />
                <span className="h-[7px] w-[7px] rounded-full" style={{ background: "#55584e" }} />
                <span className="h-[7px] w-[7px] rounded-full" style={{ background: "#55584e" }} />
            </div>

            <span className="flex-1 truncate">workorbit.app / engineering</span>

            <span className="inline-flex items-center gap-1.5" style={{ color: LIME }}>
                <i
                    className="inline-block h-[5px] w-[5px]"
                    style={{ background: LIME, boxShadow: "0 0 0 3px rgba(216,255,88,.16)" }}
                />
                LIVE
            </span>
        </div>

        <div className="grid grid-cols-[206px_minmax(0,1fr)] max-[880px]:grid-cols-1" style={{ minHeight }}>
            {/* Sidebar — mirrors components/Layout/Sidebar.tsx */}
            <aside
                className="border-r py-3 max-[880px]:hidden"
                style={{ borderColor: APP.line, background: APP.panel }}
            >
                <div className="mb-3 flex h-[52px] items-center gap-2.5 border-b px-4" style={{ borderColor: APP.line }}>
                    <span
                        className="grid h-[24px] w-[24px] place-items-center border font-mono text-[9px]"
                        style={{ borderColor: APP.limeLine, color: LIME }}
                    >
                        FB
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[.18em]" style={{ color: APP.dim }}>
                        WorkOrbit
                    </span>
                </div>

                {SIDEBAR_GROUPS.map((group) => (
                    <div key={group.label} className="mb-5">
                        <p
                            className="mb-1.5 px-4 font-mono text-[8px] uppercase tracking-[.24em]"
                            style={{ color: APP.faint }}
                        >
                            {group.label}
                        </p>

                        {group.label === "Project" && (
                            <div className="mb-1.5 flex items-center gap-2 px-4">
                                <span
                                    className="h-[5px] w-[5px] shrink-0"
                                    style={{ background: LIME, boxShadow: "0 0 0 3px rgba(216,255,88,.16)" }}
                                />
                                <span className="truncate text-[10px] font-medium" style={{ color: APP.text }}>
                                    Engineering
                                </span>
                            </div>
                        )}

                        {group.items.map((item) => {
                            const isActive = item.id === active;
                            const interactive = Boolean(onNavigate) && SELECTABLE.includes(item.id as TabId);

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    disabled={!interactive}
                                    onClick={() => interactive && onNavigate?.(item.id as TabId)}
                                    className={[
                                        "relative flex w-full items-center gap-2.5 px-4 py-[7px] text-left",
                                        "font-mono text-[9px] uppercase tracking-[.13em] transition-colors duration-200",
                                        interactive ? "cursor-pointer" : "cursor-default",
                                    ].join(" ")}
                                    style={{
                                        color: isActive ? APP.text : APP.faint,
                                        fontWeight: isActive ? 600 : 400,
                                        background: isActive
                                            ? `linear-gradient(${APP.limeTint}, ${APP.limeTint}), ${APP.raised}`
                                            : "transparent",
                                    }}
                                    onMouseEnter={(event) => {
                                        if (isActive || !interactive) return;
                                        event.currentTarget.style.background = APP.hover;
                                        event.currentTarget.style.color = APP.text;
                                    }}
                                    onMouseLeave={(event) => {
                                        if (isActive) return;
                                        event.currentTarget.style.background = "transparent";
                                        event.currentTarget.style.color = APP.faint;
                                    }}
                                >
                                    <span
                                        aria-hidden="true"
                                        className="absolute bottom-0 left-0 top-0 w-[2px] origin-center transition-transform duration-300"
                                        style={{ background: LIME, transform: isActive ? "scaleY(1)" : "scaleY(0)" }}
                                    />

                                    <span style={{ color: isActive ? LIME : "inherit" }}>
                                        <NavIcon name={item.icon} />
                                    </span>

                                    <span className="truncate">{item.label}</span>

                                    {isActive && (
                                        <span
                                            aria-hidden="true"
                                            className="ml-auto h-[4px] w-[4px] shrink-0"
                                            style={{ background: LIME }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </aside>

            <div className="min-w-0">
                {/* Header — mirrors components/Layout/Header.tsx */}
                <div
                    className="flex h-[48px] items-center justify-between border-b px-5 font-mono text-[9px] uppercase tracking-[.2em]"
                    style={{ borderColor: APP.line, color: APP.dim }}
                >
                    <span className="truncate">
                        WorkOrbit <span style={{ color: APP.faint }}>/</span> {breadcrumb}
                    </span>

                    <span className="flex items-center gap-3">
                        <span style={{ color: APP.faint }}>⌘K</span>
                        <span
                            className="grid h-[22px] w-[22px] place-items-center border text-[8px]"
                            style={{ borderColor: APP.lineStrong, color: APP.dim }}
                        >
                            AK
                        </span>
                    </span>
                </div>

                <div className="p-6 max-[880px]:p-4">{children}</div>
            </div>
        </div>
    </div>
);

/* --------------------------------------------------------------------------
   Shared pieces used inside the screen mocks
   -------------------------------------------------------------------------- */
const ScreenHead: FC<{ eyebrow: string; title: string; action?: string }> = ({ eyebrow, title, action }) => (
    <div className="flex items-end justify-between gap-4 border-b pb-4" style={{ borderColor: APP.line }}>
        <div>
            <span className="font-mono text-[8px] uppercase tracking-[.2em]" style={{ color: LIME }}>
                {eyebrow}
            </span>
            <h3 className="mt-1.5 font-serif text-[30px] font-normal leading-none max-[880px]:text-[24px]">
                {title}
            </h3>
        </div>

        {action && (
            <span
                className="shrink-0 px-2.5 py-2 font-mono text-[8px] uppercase tracking-[.14em]"
                style={{ background: LIME, color: INK }}
            >
                {action}
            </span>
        )}
    </div>
);

const Stat: FC<{ label: string; value: string; tone?: "lime" | "yellow" | "plain" }> = ({
    label,
    value,
    tone = "plain",
}) => (
    <div className="border-r px-3 py-3 last:border-r-0" style={{ borderColor: APP.line }}>
        <p className="font-mono text-[8px] uppercase tracking-[.2em]" style={{ color: APP.faint }}>
            {label}
        </p>
        <p
            className="mt-1 font-serif text-[30px] leading-none"
            style={{ color: tone === "lime" ? LIME : tone === "yellow" ? APP.yellow : APP.text }}
        >
            {value}
        </p>
    </div>
);

const priorityTone = (priority: string) =>
    priority === "P0" ? APP.red : priority === "P1" || priority === "P2" ? APP.yellow : APP.dim;

/* ==========================================================================
   SCREEN MOCKS — one per project tab
   ========================================================================== */
export const DashboardScreen = () => (
    <div>
        <ScreenHead eyebrow="Project overview" title="Where the work stands." />

        <div className="mt-5 grid grid-cols-4 border-y max-[880px]:grid-cols-2" style={{ borderColor: APP.line }}>
            <Stat label="Open" value="29" />
            <Stat label="Active" value="11" tone="lime" />
            <Stat label="In review" value="4" />
            <Stat label="Attention" value="3" tone="yellow" />
        </div>

        <div className="mt-5 grid grid-cols-[1.4fr_1fr] gap-5 max-[880px]:grid-cols-1">
            <div>
                <p className="font-mono text-[8px] uppercase tracking-[.2em]" style={{ color: APP.faint }}>
                    Status distribution
                </p>

                <div className="mt-3 space-y-2">
                    {([
                        ["To Do", 9, 31],
                        ["In Progress", 7, 24],
                        ["In Review", 4, 14],
                        ["Testing", 3, 10],
                        ["Done", 6, 21],
                    ] as [string, number, number][]).map(([label, count, pct]) => (
                        <div key={label} className="flex items-center gap-3 font-mono text-[9px]">
                            <span className="w-[62px] shrink-0" style={{ color: APP.dim }}>
                                {label}
                            </span>
                            <span className="h-[3px] flex-1" style={{ background: APP.muted }}>
                                <i
                                    className="block h-full"
                                    style={{ width: `${pct}%`, background: label === "Done" ? LIME : "#5d6650" }}
                                />
                            </span>
                            <span className="w-4 text-right" style={{ color: APP.faint }}>
                                {count}
                            </span>
                        </div>
                    ))}
                </div>

                <p className="mt-6 font-mono text-[8px] uppercase tracking-[.2em]" style={{ color: APP.faint }}>
                    Needs attention
                </p>

                <div className="mt-2.5 space-y-1.5">
                    {([
                        ["P0", "BE-14", "Webhook delivery retry queue"],
                        ["P1", "FE-42", "Auth token refresh race"],
                    ] as [string, string, string][]).map(([priority, id, title]) => (
                        <div
                            key={id}
                            className="flex items-center gap-2.5 border-l-2 px-3 py-2.5 font-mono text-[9px]"
                            style={{ borderColor: APP.yellow, background: APP.panel }}
                        >
                            <span style={{ color: priorityTone(priority) }}>{priority}</span>
                            <span style={{ color: APP.faint }}>{id}</span>
                            <span className="min-w-0 flex-1 truncate" style={{ color: APP.dim }}>
                                {title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-l pl-5 max-[880px]:border-l-0 max-[880px]:pl-0" style={{ borderColor: APP.line }}>
                <p className="font-mono text-[8px] uppercase tracking-[.2em]" style={{ color: APP.faint }}>
                    Closed per week
                </p>

                <div className="mt-3 flex h-[76px] items-end gap-1">
                    {[32, 48, 40, 67, 54, 80, 92].map((height, index) => (
                        <i
                            key={index}
                            className="block flex-1"
                            style={{ height: `${height}%`, background: index === 6 ? LIME : "#34382f" }}
                        />
                    ))}
                </div>

                <div className="my-5 h-px" style={{ background: APP.line }} />

                <p className="font-mono text-[8px] uppercase tracking-[.2em]" style={{ color: APP.faint }}>
                    Workload by assignee
                </p>

                {([
                    ["AK", 72],
                    ["ML", 44],
                    ["JP", 86],
                ] as [string, number][]).map(([name, value]) => (
                    <div
                        key={name}
                        className="mt-2.5 flex items-center gap-2 font-mono text-[8px]"
                        style={{ color: APP.faint }}
                    >
                        <span className="w-4">{name}</span>
                        <span className="h-[3px] flex-1" style={{ background: APP.muted }}>
                            <i
                                className="block h-full"
                                style={{ width: `${value}%`, background: value > 80 ? APP.yellow : "#767e69" }}
                            />
                        </span>
                        <span>{value}%</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const TicketsScreen = () => (
    <div>
        <ScreenHead eyebrow="Ticket queue" title="Everything on the table." action="+ New ticket" />

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {([
                ["ALL", true],
                ["P0", false],
                ["P1", false],
                ["IN PROGRESS", false],
                ["IN REVIEW", false],
                ["UNASSIGNED", false],
            ] as [string, boolean][]).map(([label, isActive]) => (
                <span
                    key={label}
                    className="inline-flex min-h-[26px] items-center gap-1.5 border px-2.5 font-mono text-[8px] tracking-[.14em]"
                    style={
                        isActive
                            ? { borderColor: LIME, background: APP.limeTint, color: LIME }
                            : { borderColor: APP.line, color: APP.faint }
                    }
                >
                    {isActive && <i className="h-[4px] w-[4px]" style={{ background: LIME }} />}
                    {label}
                </span>
            ))}
        </div>

        <div className="mt-4 border-t" style={{ borderColor: APP.line }}>
            {([
                ["FE-42", "Fix auth token refresh race condition", "P1", "In Review", "AK", "Release 1.4"],
                ["BE-14", "Webhook delivery retry queue", "P0", "In Progress", "—", "Release 1.4"],
                ["FE-38", "Implement kanban drag-and-drop", "P2", "In Progress", "ML", "Release 1.4"],
                ["FE-35", "Custom field renderer component", "P3", "To Do", "JP", "Release 1.5"],
                ["BE-09", "Audit trail for ticket activity", "P2", "Done", "AK", "Release 1.3"],
            ] as [string, string, string, string, string, string][]).map(
                ([id, title, priority, status, owner, milestone], index) => {
                    const hovered = index === 0;

                    return (
                        <div
                            key={id}
                            className="relative border-b py-3.5 transition-all duration-200"
                            style={{
                                borderColor: APP.line,
                                background: hovered ? APP.hover : "transparent",
                                paddingLeft: hovered ? 22 : 12,
                                paddingRight: 12,
                            }}
                        >
                            {hovered && (
                                <span className="absolute bottom-0 left-0 top-0 w-[2px]" style={{ background: LIME }} />
                            )}

                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[9px]" style={{ color: priorityTone(priority) }}>
                                    {priority}
                                </span>
                                <span className="w-[40px] shrink-0 font-mono text-[9px]" style={{ color: APP.faint }}>
                                    {id}
                                </span>
                                <span
                                    className="min-w-0 flex-1 truncate text-[11px] font-semibold"
                                    style={{ color: APP.text }}
                                >
                                    {title}
                                </span>
                                <span
                                    className="shrink-0 font-mono text-[8px] uppercase tracking-[.12em] max-[880px]:hidden"
                                    style={{ color: APP.dim }}
                                >
                                    {status}
                                </span>
                            </div>

                            <div
                                className="mt-1.5 flex gap-3 pl-[52px] font-mono text-[8px] uppercase tracking-[.12em] max-[880px]:pl-0"
                                style={{ color: APP.faint }}
                            >
                                <span>Owner {owner}</span>
                                <span>·</span>
                                <span style={{ color: hovered ? LIME : APP.faint }}>{milestone}</span>
                            </div>
                        </div>
                    );
                }
            )}
        </div>
    </div>
);

export const BoardScreen = () => (
    <div>
        <ScreenHead eyebrow="Project workflow" title="Move work forward." />

        <div className="mt-5 grid grid-cols-6 max-[880px]:grid-cols-3">
            {([
                ["01", "To Do", 9, null, false],
                ["02", "In Progress", 7, 6, true],
                ["03", "In Review", 4, 4, false],
                ["04", "Testing", 3, 5, false],
                ["05", "Done", 6, null, false],
                ["06", "Closed", 12, null, false],
            ] as [string, string, number, number | null, boolean][]).map(
                ([number, label, count, limit, over], index) => {
                    const isDropTarget = index === 1;

                    return (
                        <div
                            key={label}
                            className="min-h-[220px] border-l p-2 last:border-r"
                            style={{
                                borderColor: isDropTarget ? LIME : APP.line,
                                background: isDropTarget ? APP.raised : APP.panel,
                                boxShadow: isDropTarget ? `inset 0 0 0 1px ${APP.limeLine}` : undefined,
                            }}
                        >
                            <div className="border-b pb-2" style={{ borderColor: APP.line }}>
                                <div className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[.14em]">
                                    <span style={{ color: APP.faint }}>{number}</span>
                                    <span className="truncate" style={{ color: APP.text }}>
                                        {label}
                                    </span>
                                    <span className="ml-auto" style={{ color: APP.dim }}>
                                        {count}
                                    </span>
                                </div>

                                {limit !== null && (
                                    <>
                                        <div
                                            className="mt-1.5 flex justify-between font-mono text-[7px]"
                                            style={{ color: over ? APP.yellow : APP.faint }}
                                        >
                                            <span>WIP</span>
                                            <span>
                                                {count} / {limit}
                                            </span>
                                        </div>
                                        <div className="mt-1 h-[2px]" style={{ background: APP.muted }}>
                                            <i
                                                className="block h-full"
                                                style={{
                                                    width: `${Math.min((count / limit) * 100, 100)}%`,
                                                    background: over ? APP.yellow : LIME,
                                                }}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="mt-2 space-y-1.5">
                                {Array.from({ length: Math.min(count, isDropTarget ? 3 : 2) }).map((_, cardIndex) => (
                                    <div
                                        key={cardIndex}
                                        className="border p-2"
                                        style={{
                                            borderColor: isDropTarget && cardIndex === 0 ? LIME : APP.line,
                                            background: APP.raised,
                                        }}
                                    >
                                        <span className="font-mono text-[7px]" style={{ color: APP.faint }}>
                                            {["FE", "BE"][cardIndex % 2]}-{30 + cardIndex + index * 3}
                                        </span>
                                        <p className="mt-1 text-[8px] leading-[1.4]" style={{ color: APP.dim }}>
                                            {["Auth token refresh", "Retry queue", "Field renderer"][cardIndex % 3]}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }
            )}
        </div>

        <p className="mt-3 font-mono text-[8px] uppercase tracking-[.16em]" style={{ color: APP.faint }}>
            Drag a ticket between columns to change its status
        </p>
    </div>
);

export const MilestonesScreen = () => (
    <div>
        <ScreenHead eyebrow="Delivery roadmap" title="What ships, and when." action="+ New milestone" />

        <div className="mt-5 grid grid-cols-4 border-y max-[880px]:grid-cols-2" style={{ borderColor: APP.line }}>
            <Stat label="Milestones" value="4" />
            <Stat label="Delivered" value="18" tone="lime" />
            <Stat label="At risk" value="1" tone="yellow" />
            <Stat label="Days left" value="6" />
        </div>

        <div className="mt-5 space-y-px">
            {([
                ["01", "Release 1.4", "ON TRACK", 65, "18 / 29", "6 days left"],
                ["02", "Release 1.5", "PLANNED", 12, "3 / 24", "28 days left"],
                ["03", "Data migration", "AT RISK", 40, "8 / 20", "4 days left"],
                ["04", "Release 1.3", "DELIVERED", 100, "31 / 31", "Shipped Mar 2"],
            ] as [string, string, string, number, string, string][]).map(
                ([number, name, health, pct, ratio, when]) => {
                    const tone = health === "AT RISK" ? APP.yellow : health === "PLANNED" ? APP.dim : LIME;

                    return (
                        <div key={name} className="px-3 py-3.5" style={{ background: APP.panel }}>
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[9px]" style={{ color: APP.faint }}>
                                    {number}
                                </span>
                                <span className="font-serif text-[20px]" style={{ color: APP.text }}>
                                    {name}
                                </span>
                                <span
                                    className="ml-auto font-mono text-[8px] uppercase tracking-[.14em]"
                                    style={{ color: tone }}
                                >
                                    {health}
                                </span>
                            </div>

                            <div className="mt-2.5 flex items-center gap-3">
                                <span className="h-[3px] flex-1" style={{ background: APP.muted }}>
                                    <i className="block h-full" style={{ width: `${pct}%`, background: tone }} />
                                </span>
                                <span
                                    className="w-[52px] shrink-0 text-right font-mono text-[8px]"
                                    style={{ color: APP.dim }}
                                >
                                    {ratio}
                                </span>
                                <span
                                    className="w-[80px] shrink-0 text-right font-mono text-[8px] max-[880px]:hidden"
                                    style={{ color: APP.faint }}
                                >
                                    {when}
                                </span>
                            </div>
                        </div>
                    );
                }
            )}
        </div>

        <p className="mt-4 font-mono text-[8px] uppercase tracking-[.16em]" style={{ color: APP.faint }}>
            Expected vs actual progress is charted per milestone
        </p>
    </div>
);

export const StandupScreen = () => (
    <div>
        <ScreenHead eyebrow="Daily standup" title="What moved yesterday." action="Export XLSX" />

        <div className="mt-5 grid grid-cols-[150px_minmax(0,1fr)] gap-5 max-[880px]:grid-cols-1">
            <aside className="border-r pr-4 max-[880px]:border-r-0 max-[880px]:pr-0" style={{ borderColor: APP.line }}>
                <p className="mb-2.5 font-mono text-[8px] uppercase tracking-[.2em]" style={{ color: APP.faint }}>
                    Team
                </p>

                {([
                    ["AK", "Aditya K.", true],
                    ["ML", "Maya L.", false],
                    ["JP", "Jonas P.", false],
                ] as [string, string, boolean][]).map(([initials, name, selected]) => (
                    <div
                        key={initials}
                        className="mb-1 flex items-center gap-2.5 px-2.5 py-2"
                        style={{
                            background: selected ? LIME : "transparent",
                            color: selected ? INK : APP.dim,
                            boxShadow: selected ? `inset 4px 0 0 ${INK}` : undefined,
                        }}
                    >
                        <span
                            className="grid h-[20px] w-[20px] shrink-0 place-items-center font-mono text-[8px]"
                            style={{ background: selected ? INK : APP.muted, color: selected ? LIME : APP.text }}
                        >
                            {initials}
                        </span>
                        <span className="truncate text-[10px]">{name}</span>
                    </div>
                ))}
            </aside>

            <section>
                <div className="grid grid-cols-4 border-y max-[880px]:grid-cols-2" style={{ borderColor: APP.line }}>
                    <Stat label="Assigned" value="8" />
                    <Stat label="Moved" value="5" tone="lime" />
                    <Stat label="Finished" value="2" tone="lime" />
                    <Stat label="Attention" value="1" tone="yellow" />
                </div>

                <div className="mt-4 space-y-1.5">
                    {([
                        ["FE-42", "Fix auth token refresh race condition", "In Progress → In Review", true],
                        ["FE-38", "Implement kanban drag-and-drop", "To Do → In Progress", false],
                        ["BE-09", "Audit trail for ticket activity", "Testing → Done", true],
                    ] as [string, string, string, boolean][]).map(([id, title, movement, finished]) => (
                        <article key={id} className="px-3 py-3" style={{ background: APP.panel }}>
                            <div className="flex items-center gap-2.5">
                                <span className="font-mono text-[9px]" style={{ color: APP.faint }}>
                                    {id}
                                </span>
                                <span className="min-w-0 flex-1 truncate text-[11px]" style={{ color: APP.text }}>
                                    {title}
                                </span>
                                {finished && (
                                    <span
                                        className="shrink-0 font-mono text-[8px] uppercase tracking-[.12em]"
                                        style={{ color: LIME }}
                                    >
                                        ✓ Finished
                                    </span>
                                )}
                            </div>

                            <p
                                className="mt-1.5 font-mono text-[8px] uppercase tracking-[.12em]"
                                style={{ color: APP.dim }}
                            >
                                {movement}
                            </p>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    </div>
);

export const MembersScreen = () => (
    <div>
        <ScreenHead eyebrow="Project members" title="Who is on this." action="+ Add member" />

        <div className="mt-5 space-y-1.5">
            {([
                ["AK", "Aditya Kulkarni", "aditya@workorbit.app", "Owner", true],
                ["ML", "Maya Lindqvist", "maya@workorbit.app", "Maintainer", true],
                ["JP", "Jonas Peeters", "jonas@workorbit.app", "Contributor", true],
                ["RS", "Riya Sharma", "riya@workorbit.app", "Viewer", false],
            ] as [string, string, string, string, boolean][]).map(([initials, name, email, role, isActive]) => (
                <div
                    key={email}
                    className="flex items-center gap-3.5 border px-4 py-3"
                    style={{ borderColor: APP.line, background: APP.panel }}
                >
                    <span
                        className="grid h-[28px] w-[28px] shrink-0 place-items-center border font-mono text-[9px]"
                        style={{ borderColor: APP.lineStrong, background: APP.muted, color: APP.text }}
                    >
                        {initials}
                    </span>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-medium" style={{ color: APP.text }}>
                            {name}
                        </p>
                        <p className="mt-0.5 truncate font-mono text-[8px]" style={{ color: APP.faint }}>
                            {email}
                        </p>
                    </div>

                    <span
                        className="shrink-0 border px-2 py-1 font-mono text-[8px] uppercase tracking-[.12em]"
                        style={{ borderColor: APP.line, color: APP.dim }}
                    >
                        {role}
                    </span>

                    <span
                        className="shrink-0 font-mono text-[8px] uppercase tracking-[.12em] max-[880px]:hidden"
                        style={{ color: isActive ? LIME : APP.faint }}
                    >
                        ● {isActive ? "Active" : "Invited"}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

export const SettingsScreen = () => (
    <div>
        <ScreenHead eyebrow="Project settings" title="The control room." />

        <div className="mt-5 grid grid-cols-2 gap-5 max-[880px]:grid-cols-1">
            <div className="border p-4" style={{ borderColor: APP.lineStrong, background: APP.panel }}>
                <p className="font-mono text-[8px] uppercase tracking-[.16em]" style={{ color: APP.faint }}>
                    Project name
                </p>
                <div
                    className="mt-2 border px-3 py-2.5 text-[11px]"
                    style={{
                        borderColor: LIME,
                        background: APP.raised,
                        color: APP.text,
                        boxShadow: `inset 0 0 0 1px ${LIME}`,
                    }}
                >
                    Engineering
                </div>

                <p className="mt-4 font-mono text-[8px] uppercase tracking-[.16em]" style={{ color: APP.faint }}>
                    Description
                </p>
                <div
                    className="mt-2 border px-3 py-2.5 text-[11px] leading-[1.6]"
                    style={{ borderColor: APP.lineStrong, background: APP.raised, color: APP.dim }}
                >
                    Core platform and delivery workstream.
                </div>

                <span
                    className="mt-4 inline-flex items-center px-3 py-2 font-mono text-[8px] uppercase tracking-[.14em]"
                    style={{ background: LIME, color: INK }}
                >
                    Save changes
                </span>
            </div>

            <div>
                <div className="border p-4" style={{ borderColor: APP.line, background: APP.panel }}>
                    <p className="font-mono text-[8px] uppercase tracking-[.16em]" style={{ color: APP.faint }}>
                        Project key
                    </p>
                    <p className="mt-1.5 font-mono text-[13px]" style={{ color: APP.text }}>
                        FE
                    </p>
                    <p className="mt-1 font-mono text-[8px]" style={{ color: APP.faint }}>
                        Used as the ticket number prefix
                    </p>
                </div>

                <div
                    className="mt-3 border p-4"
                    style={{ borderColor: "rgba(255,130,120,.42)", background: "rgba(255,130,120,.04)" }}
                >
                    <p className="font-mono text-[8px] uppercase tracking-[.16em]" style={{ color: APP.red }}>
                        Danger zone
                    </p>
                    <p className="mt-2 text-[10px] leading-[1.6]" style={{ color: APP.dim }}>
                        Deleting a project removes its tickets, milestones and activity permanently.
                    </p>
                    <span
                        className="mt-3 inline-flex items-center border px-3 py-2 font-mono text-[8px] uppercase tracking-[.13em]"
                        style={{ borderColor: "rgba(255,130,120,.58)", color: APP.red }}
                    >
                        Delete project
                    </span>
                </div>
            </div>
        </div>
    </div>
);
