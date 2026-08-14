import { useEffect, useMemo, useState } from "react";
import {
    ChevronRight,
    Link2,
    Loader2,
    Plus,
    Search,
    Settings2,
    UserRound,
    X,
} from "lucide-react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { getProject } from "../api/projects";
import { createTicket, listTickets } from "../api/tickets";
import type { Project, ProjectMember } from "../types/project";
import type {
    Ticket,
    TicketPriority,
    TicketStatus,
    TicketType,
} from "../types/ticket";
import ProjectecLoader from "../components/ui/ProjectecLoader";
import AssigneePicker from "../components/ui/AssigneePicker";
import { listProjectMembers } from "../api/projects";

const types: TicketType[] = ["Feature", "Bug", "Task", "Improvement"];

const priorities: TicketPriority[] = ["P0", "P1", "P2", "P3", "P4"];

const statuses: TicketStatus[] = [
    "To Do",
    "In Progress",
    "In Review",
    "Testing",
    "Done",
    "Closed",
];

const priorityConfig: Record<
    TicketPriority,
    {
        label: string;
        marker: string;
        dot: string;
        text: string;
        border: string;
        bg: string;
    }
> = {
    P0: {
        label: "Critical",
        marker: "▲",
        dot: "bg-red-500",
        text: "text-red-700 dark:text-red-300",
        border: "border-red-500/60",
        bg: "bg-red-50 dark:bg-red-950/20",
    },
    P1: {
        label: "Urgent",
        marker: "▲",
        dot: "bg-orange-500",
        text: "text-orange-700 dark:text-orange-300",
        border: "border-orange-500/60",
        bg: "bg-orange-50 dark:bg-orange-950/20",
    },
    P2: {
        label: "High",
        marker: "●",
        dot: "bg-amber-500",
        text: "text-amber-700 dark:text-amber-300",
        border: "border-amber-500/60",
        bg: "bg-amber-50 dark:bg-amber-950/20",
    },
    P3: {
        label: "Normal",
        marker: "●",
        dot: "bg-sky-500",
        text: "text-sky-700 dark:text-sky-300",
        border: "border-sky-500/60",
        bg: "bg-sky-50 dark:bg-sky-950/20",
    },
    P4: {
        label: "Low",
        marker: "▼",
        dot: "bg-zinc-500",
        text: "text-zinc-700 dark:text-zinc-300",
        border: "border-zinc-400 dark:border-zinc-700",
        bg: "bg-zinc-50 dark:bg-zinc-950/30",
    },
};

const statusConfig: Record<
    TicketStatus,
    {
        dot: string;
        text: string;
    }
> = {
    "To Do": {
        dot: "bg-zinc-500",
        text: "text-zinc-700 dark:text-zinc-300",
    },
    "In Progress": {
        dot: "bg-emerald-500",
        text: "text-emerald-700 dark:text-emerald-300",
    },
    "In Review": {
        dot: "bg-sky-500",
        text: "text-sky-700 dark:text-sky-300",
    },
    Testing: {
        dot: "bg-violet-500",
        text: "text-violet-700 dark:text-violet-300",
    },
    Done: {
        dot: "bg-green-600",
        text: "text-green-700 dark:text-green-300",
    },
    Closed: {
        dot: "bg-zinc-500 dark:bg-zinc-700",
        text: "text-zinc-700 dark:text-zinc-300",
    },
};

export default function TicketsPage() {
    const { organizationId, projectId } = useParams<{
        organizationId: string;
        projectId: string;
    }>();

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [project, setProject] = useState<Project | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [query, setQuery] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<TicketType>("Task");
    const [priority, setPriority] = useState<TicketPriority>("P2");
    const [assignedTo, setAssignedTo] = useState<string | null>(null);

    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const selectedPriority =
        searchParams.get("priority") as TicketPriority | null;

    const selectedStatus =
        searchParams.get("status") as TicketStatus | null;

    const load = async () => {
        if (!projectId) return;

        setLoading(true);

        try {
            const [nextProject, nextTickets, nextMembers] = await Promise.all([
                getProject(projectId),
                listTickets(projectId),
                listProjectMembers(projectId),
            ]);

            setProject(nextProject);
            setTickets(nextTickets);
            setMembers(nextMembers);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, [projectId]);

    const filtered = useMemo(
        () =>
            tickets.filter(
                (ticket) =>
                    `${ticket.ticket_number} ${ticket.title} ${ticket.description ?? ""
                        }`
                        .toLowerCase()
                        .includes(query.toLowerCase().trim()) &&
                    (!selectedPriority ||
                        ticket.priority === selectedPriority) &&
                    (!selectedStatus || ticket.status === selectedStatus)
            ),
        [query, selectedPriority, selectedStatus, tickets]
    );

    const openCount = tickets.filter(
        (ticket) => !["Done", "Closed"].includes(ticket.status)
    ).length;

    const urgentCount = tickets.filter((ticket) =>
        ["P0", "P1"].includes(ticket.priority)
    ).length;

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!projectId || saving) return;

        setSaving(true);
        setError("");

        try {
            const ticket = await createTicket(projectId, {
                title: title.trim(),
                description: description.trim(),
                type,
                priority,
                assigned_to: assignedTo,
            });

            navigate(
                `/organisations/${organizationId}/projects/${projectId}/tickets/${ticket.id}`
            );
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 font-['Inter',ui-sans-serif,sans-serif]">
            {/* Header */}
            <header className="border-b border-zinc-200 pb-7 dark:border-zinc-800">
                <Link
                    className="text-[11px] uppercase tracking-[.18em] text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    to={`/organisations/${organizationId}/projects`}
                >
                    ← Projects
                </Link>

                <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-[.22em] text-zinc-600 dark:text-zinc-300">
                            {project?.code ?? "Project"} · Work queue
                        </p>

                        <h1 className="mt-3 font-['Instrument_Serif',Georgia,serif] text-5xl leading-none text-zinc-900 dark:text-white">
                            {project?.name ?? "Tickets"}
                        </h1>

                        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                            {openCount} open · {urgentCount} urgent ·{" "}
                            {tickets.length} total
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            className="inline-flex min-h-10 items-center gap-2 border border-zinc-300 px-4 text-[11px] uppercase tracking-[.14em] text-zinc-700 transition-colors hover:border-zinc-500 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-white"
                            to={`/organisations/${organizationId}/projects/${projectId}/settings`}
                        >
                            <Settings2 className="h-4 w-4" />
                            Project settings
                        </Link>

                        <button
                            className="inline-flex min-h-10 items-center gap-2 border border-zinc-900 bg-zinc-900 px-4 text-[11px] uppercase tracking-[.14em] text-white transition-colors hover:bg-zinc-700 dark:border-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                            onClick={() => setShowForm((value) => !value)}
                            type="button"
                        >
                            {showForm ? (
                                <X className="h-4 w-4" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}

                            {showForm ? "Close" : "New ticket"}
                        </button>
                    </div>
                </div>
            </header>

            {/* Create ticket */}
            {showForm && (
                <form
                    className="grid gap-5 border border-zinc-300 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950/40 md:grid-cols-2"
                    onSubmit={submit}
                >
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-[10px] uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-300">
                            Title
                        </label>

                        <input
                            autoFocus
                            className="w-full border border-zinc-400 bg-white px-3 py-3 text-zinc-900 outline-none transition-colors placeholder:text-zinc-500 hover:border-zinc-500 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:hover:border-zinc-500 dark:focus:border-white dark:focus:ring-white/15"
                            minLength={3}
                            placeholder="What needs to happen?"
                            required
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-[10px] uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-300">
                            Description{" "}
                            <span className="normal-case tracking-normal text-zinc-500 dark:text-zinc-400">
                                Optional
                            </span>
                        </label>

                        <textarea
                            className="min-h-28 w-full border border-zinc-400 bg-white px-3 py-3 text-zinc-900 outline-none transition-colors placeholder:text-zinc-500 hover:border-zinc-500 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:hover:border-zinc-500 dark:focus:border-white dark:focus:ring-white/15"
                            placeholder="Add the context the team needs"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                        />
                    </div>

                    <Select
                        label="Type"
                        value={type}
                        options={types}
                        onChange={(value) => setType(value as TicketType)}
                    />

                    <Select
                        label="Priority"
                        value={priority}
                        options={priorities}
                        onChange={(value) =>
                            setPriority(value as TicketPriority)
                        }
                    />

                    <AssigneePicker
                        label="Assignee"
                        members={members}
                        value={assignedTo}
                        onChange={setAssignedTo}
                    />

                    <button
                        className="inline-flex w-fit min-h-10 items-center gap-2 border border-zinc-900 px-4 text-[11px] uppercase tracking-[.14em] text-zinc-900 disabled:opacity-40 dark:border-white dark:text-white"
                        disabled={saving}
                        type="submit"
                    >
                        {saving && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}

                        {saving ? "Creating" : "Create ticket"}
                    </button>
                </form>
            )}

            {error && (
                <p className="border-y border-red-400/50 py-3 text-sm text-red-700 dark:text-red-300">
                    {error}
                </p>
            )}

            {/* Ticket list */}
            <section className="space-y-5">
                <div className="space-y-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
                    {/* Search */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative max-w-sm flex-1">
                            <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-300" />

                            <input
                                className="w-full border-b border-zinc-300 bg-transparent py-2 pl-6 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-900 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white"
                                placeholder="Search tickets"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                            />
                        </div>

                        <p className="shrink-0 text-[11px] uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-300">
                            {filtered.length} shown
                        </p>
                    </div>

                    {/* Priority */}
                    <PriorityLegend
                        selectedPriority={selectedPriority}
                        onSelect={(priority) => {
                            const next = new URLSearchParams(searchParams);

                            if (priority) {
                                next.set("priority", priority);
                            } else {
                                next.delete("priority");
                            }

                            setSearchParams(next);
                        }}
                    />

                    {/* Status */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="mr-1 text-[10px] uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-300">
                            Status
                        </span>

                        {(["All", ...statuses] as const).map((status) => {
                            const active =
                                (!selectedStatus && status === "All") ||
                                selectedStatus === status;

                            const tone =
                                status === "All"
                                    ? active
                                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                                        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-900"
                                    : getStatusFilterTone(
                                        status,
                                        active
                                    );

                            return (
                                <button
                                    className={`inline-flex items-center gap-2 border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[.1em] transition-all ${tone}`}
                                    key={status}
                                    onClick={() => {
                                        const next = new URLSearchParams(
                                            searchParams
                                        );

                                        if (status === "All") {
                                            next.delete("status");
                                        } else {
                                            next.set("status", status);
                                        }

                                        setSearchParams(next);
                                    }}
                                    type="button"
                                >
                                    {status !== "All" && (
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${statusConfig[status].dot}`}
                                        />
                                    )}

                                    {status}
                                </button>
                            );
                        })}
                    </div>

                    {/* Clear filters */}
                    {(selectedPriority || selectedStatus) && (
                        <button
                            className="text-[10px] uppercase tracking-[.12em] text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-white"
                            onClick={() => setSearchParams({})}
                            type="button"
                        >
                            Clear filters
                        </button>
                    )}
                </div>

                {loading ? (
                    <ProjectecLoader />
                ) : filtered.length ? (
                    <div className="border-t border-zinc-200 dark:border-zinc-800">
                        {filtered.map((ticket, index) => (
                            <TicketRow
                                index={index}
                                key={ticket.id}
                                members={members}
                                navigate={navigate}
                                parentTicket={tickets.find(
                                    (item) =>
                                        item.id === ticket.parent_ticket_id
                                )}
                                ticket={ticket}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="border border-dashed border-zinc-300 p-12 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                        {query
                            ? "No tickets match your search."
                            : "No tickets in this project yet."}
                    </div>
                )}
            </section>
        </div>
    );
}

function PriorityStatusIndicator({
    priority,
    statusDot,
}: {
    priority: TicketPriority;
    statusDot: string;
}) {
    const ring = priorityConfig[priority].ring;

    return (
        <div className="relative flex h-4 w-4 items-center justify-center">
            {priority === "P0" && (
                <>
                    <span
                        className={`absolute h-7 w-7 rounded-full border ${ring}`}
                    />
                    <span
                        className={`absolute h-5 w-5 rounded-full border ${ring}`}
                    />
                </>
            )}

            {priority === "P1" && (
                <span
                    className={`absolute h-6 w-6 rounded-full border ${ring}`}
                />
            )}

            {priority === "P2" && (
                <span
                    className={`absolute h-5 w-5 rounded-full border ${ring}`}
                />
            )}

            {priority === "P3" && (
                <span
                    className={`absolute h-4 w-4 rounded-full border ${ring}`}
                />
            )}

            <span
                className={`relative h-1.5 w-1.5 rounded-full ${statusDot}`}
            />
        </div>
    );
}

function TicketMeta({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="min-w-[58px]">
            <p className="text-[10px] font-medium text-zinc-800 dark:text-zinc-200">
                {value}
            </p>

            <p className="mt-0.5 text-[9px] uppercase tracking-[.08em] text-zinc-500 dark:text-zinc-500">
                {label}
            </p>
        </div>
    );
}

function TicketRow({
    index,
    members,
    navigate,
    parentTicket,
    ticket,
}: {
    index: number;
    members: ProjectMember[];
    navigate: ReturnType<typeof useNavigate>;
    parentTicket?: Ticket;
    ticket: Ticket;
}) {
    const priorityTone = priorityConfig[ticket.priority];
    const statusTone = statusConfig[ticket.status];

    const assignee = members.find(
        (member) => member.user_id === ticket.assigned_to
    );

    const initials = assignee
        ? (assignee.name || assignee.email || "?")
            .split(/\s+/)
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()
        : null;

    return (
        <button
            className="group w-full border-b border-zinc-200 bg-white text-left transition-colors hover:bg-zinc-50 focus-visible:bg-zinc-50 focus-visible:outline-none dark:border-zinc-800 dark:bg-transparent dark:hover:bg-zinc-900/50 dark:focus-visible:bg-zinc-900"
            onClick={() =>
                navigate(
                    `/organisations/${ticket.organization_id}/projects/${ticket.project_id}/tickets/${ticket.id}`
                )
            }
            style={{
                animationDelay: `${index * 35}ms`,
            }}
            type="button"
        >
            <div className="flex min-w-0 items-start gap-4 px-4 py-5 sm:px-5">
                {/* Priority + status */}
                <div className="flex w-8 shrink-0 flex-col items-center gap-3 pt-1">
                    <span
                        className={`text-base font-semibold leading-none ${priorityTone.text}`}
                        title={`${ticket.priority}: ${priorityTone.label}`}
                    >
                        {priorityTone.marker}
                    </span>

                    <PriorityStatusIndicator
                        priority={ticket.priority}
                        statusDot={statusTone.dot}
                    />
                </div>

                {/* Main content */}
                <div className="min-w-0 flex-1">
                    {/* Ticket identity */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] uppercase tracking-[.14em]">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                            {ticket.ticket_number}
                        </span>

                        <span className="text-zinc-300 dark:text-zinc-700">
                            ·
                        </span>

                        <span className="text-zinc-500 dark:text-zinc-400">
                            {ticket.type}
                        </span>

                        {parentTicket && (
                            <>
                                <span className="text-zinc-300 dark:text-zinc-700">
                                    ·
                                </span>

                                <span className="text-zinc-500 dark:text-zinc-400">
                                    Child of {parentTicket.ticket_number}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Title */}
                    <h2 className="mt-1.5 truncate text-[15px] font-medium leading-6 text-zinc-900 transition-colors group-hover:text-black dark:text-zinc-100 dark:group-hover:text-white">
                        {ticket.title}
                    </h2>

                    {/* Description */}
                    <p className="mt-1 max-w-4xl truncate text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                        {ticket.description || "No description provided"}
                    </p>

                    {/* Metadata */}
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                        {/* Assignee */}
                        {assignee && (
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-zinc-100 text-[8px] font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                                    {initials}
                                </span>

                                <div className="min-w-0">
                                    <p className="max-w-36 truncate text-[10px] font-medium text-zinc-800 dark:text-zinc-200">
                                        {assignee.name || assignee.email}
                                    </p>

                                    <p className="mt-0.5 text-[9px] uppercase tracking-[.08em] text-zinc-500 dark:text-zinc-500">
                                        Assignee
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Hours */}
                        {ticket.hours_logged !== undefined && (
                            <TicketMeta
                                label="Logged"
                                value={`${ticket.hours_logged}h`}
                            />
                        )}

                        {/* Difficulty */}
                        {ticket.difficulty !== null &&
                            ticket.difficulty !== undefined && (
                                <TicketMeta
                                    label="Difficulty"
                                    value={`${ticket.difficulty}/100`}
                                />
                            )}

                        {/* Due date */}
                        {ticket.expected_end_date && (
                            <TicketMeta
                                label="Due"
                                value={formatShortDate(
                                    ticket.expected_end_date
                                )}
                            />
                        )}

                        {/* Milestone */}
                        {ticket.milestone_id && (
                            <TicketMeta
                                label="Milestone"
                                value="Linked"
                            />
                        )}

                        {/* Demo */}
                        {ticket.demo_link && (
                            <div className="flex items-center gap-2">
                                <Link2 className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-500" />

                                <div>
                                    <p className="text-[10px] font-medium text-zinc-800 dark:text-zinc-200">
                                        Demo
                                    </p>

                                    <p className="mt-0.5 text-[9px] uppercase tracking-[.08em] text-zinc-500 dark:text-zinc-500">
                                        Attached
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Delay */}
                        {ticket.reason_for_delay && (
                            <div
                                className="flex items-center gap-2"
                                title={ticket.reason_for_delay}
                            >
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />

                                <div>
                                    <p className="text-[10px] font-medium text-amber-800 dark:text-amber-300">
                                        Delayed
                                    </p>

                                    <p className="mt-0.5 text-[9px] uppercase tracking-[.08em] text-amber-700/70 dark:text-amber-400/70">
                                        Reason available
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status + navigation */}
                <div className="flex shrink-0 flex-col items-end justify-between gap-4 pt-0.5">
                    <span
                        className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[.1em] ${getStatusBadgeTone(
                            ticket.status
                        )}`}
                    >
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${statusTone.dot}`}
                        />

                        {ticket.status}
                    </span>

                    <ChevronRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-zinc-900 dark:text-zinc-600 dark:group-hover:text-white" />
                </div>
            </div>
        </button>
    );
}

function MetaChip({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <span className="inline-flex items-center gap-1.5 border border-zinc-200 bg-zinc-50 px-2 py-1 text-[9px] uppercase tracking-[.06em] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
            {children}
        </span>
    );
}

function getStatusFilterTone(
    status: TicketStatus,
    active: boolean
) {
    if (!active) {
        return "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-900";
    }

    switch (status) {
        case "To Do":
            return "border-zinc-500 bg-zinc-200 text-zinc-950 dark:border-zinc-500 dark:bg-zinc-800 dark:text-white";

        case "In Progress":
            return "border-emerald-600 bg-emerald-100 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-950/50 dark:text-emerald-200";

        case "In Review":
            return "border-sky-600 bg-sky-100 text-sky-900 dark:border-sky-400 dark:bg-sky-950/50 dark:text-sky-200";

        case "Testing":
            return "border-violet-600 bg-violet-100 text-violet-900 dark:border-violet-400 dark:bg-violet-950/50 dark:text-violet-200";

        case "Done":
            return "border-green-600 bg-green-100 text-green-900 dark:border-green-400 dark:bg-green-950/50 dark:text-green-200";

        case "Closed":
            return "border-zinc-500 bg-zinc-200 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
    }
}

function getStatusBadgeTone(status: TicketStatus) {
    switch (status) {
        case "To Do":
            return "border-zinc-400 bg-zinc-100 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300";

        case "In Progress":
            return "border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-400/40 dark:bg-emerald-950/30 dark:text-emerald-300";

        case "In Review":
            return "border-sky-600 bg-sky-50 text-sky-800 dark:border-sky-400/40 dark:bg-sky-950/30 dark:text-sky-300";

        case "Testing":
            return "border-violet-600 bg-violet-50 text-violet-800 dark:border-violet-400/40 dark:bg-violet-950/30 dark:text-violet-300";

        case "Done":
            return "border-green-600 bg-green-50 text-green-800 dark:border-green-400/40 dark:bg-green-950/30 dark:text-green-300";

        case "Closed":
            return "border-zinc-400 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400";
    }
}

function formatShortDate(value: string) {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? "date unavailable"
        : date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
}

function PriorityLegend({
    selectedPriority,
    onSelect,
}: {
    selectedPriority: TicketPriority | null;
    onSelect: (priority: TicketPriority | null) => void;
}) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[10px] uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-300">
                Priority
            </span>

            <button
                className={`border px-3 py-1.5 text-[10px] uppercase tracking-[.1em] transition-colors ${!selectedPriority
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-900"
                    }`}
                onClick={() => onSelect(null)}
                type="button"
            >
                All
            </button>

            {priorities.map((priority) => {
                const config = priorityConfig[priority];
                const active = selectedPriority === priority;

                return (
                    <button
                        className={`
                            inline-flex items-center gap-2 border px-3 py-1.5
                            text-[10px] uppercase tracking-[.1em]
                            transition-all
                            ${config.border}
                            ${active
                                ? `${config.bg} ${config.text} ring-1 ring-zinc-900 dark:ring-white`
                                : "bg-white text-zinc-600 hover:bg-zinc-50 dark:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-900"
                            }
                        `}
                        key={priority}
                        onClick={() => onSelect(priority)}
                        type="button"
                    >
                        {/* Priority shape */}
                        <span
                            className={`text-[12px] font-semibold leading-none ${config.text}`}
                        >
                            {config.marker}
                        </span>

                        {/* Priority name */}
                        <span>{priority}</span>

                        {/* Priority label */}
                        <span className="hidden sm:inline">
                            {config.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

function Select({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: readonly string[];
    onChange: (value: string) => void;
}) {
    return (
        <label className="text-[10px] uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-300">
            {label}

            <select
                className="mt-2 block w-full border border-zinc-400 bg-white px-3 py-3 text-sm normal-case tracking-normal text-zinc-900 outline-none transition-colors hover:border-zinc-500 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white dark:hover:border-zinc-500 dark:focus:border-white dark:focus:ring-white/15"
                value={value}
                onChange={(event) => onChange(event.target.value)}
            >
                {options.map((option) => (
                    <option key={option}>{option}</option>
                ))}
            </select>
        </label>
    );
}