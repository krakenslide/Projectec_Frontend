import { useEffect, useMemo, useState } from "react";
import {
    ChevronRight,
    Link2,
    Loader2,
    Plus,
    Search,
    Settings2,
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
import WorkOrbitLoader from "../components/ui/WorkOrbitLoader";
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
        ring: string;
    }
> = {
    P0: {
        label: "Critical",
        marker: "▲",
        dot: "bg-red-500",
        text: "text-red-700 dark:text-red-300",
        border: "border-red-500/60",
        bg: "bg-red-200 dark:bg-red-950/20",
        ring: "border-red-500/60",
    },
    P1: {
        label: "Urgent",
        marker: "▲",
        dot: "bg-orange-500",
        text: "text-orange-700 dark:text-orange-300",
        border: "border-orange-500/60",
        bg: "bg-orange-100 dark:bg-orange-950/20",
        ring: "border-orange-500/60",
    },
    P2: {
        label: "High",
        marker: "●",
        dot: "bg-amber-500",
        text: "text-amber-700 dark:text-amber-300",
        border: "border-amber-500/60",
        bg: "bg-amber-100 dark:bg-amber-950/20",
        ring: "border-amber-500/60",
    },
    P3: {
        label: "Normal",
        marker: "●",
        dot: "bg-sky-500",
        text: "text-sky-700 dark:text-sky-300",
        border: "border-sky-500/60",
        bg: "bg-sky-100 dark:bg-sky-950/20",
        ring: "border-sky-500/60",
    },
    P4: {
        label: "Low",
        marker: "▼",
        dot: "bg-zinc-500",
        text: "text-zinc-700 dark:text-zinc-300",
        border: "border-zinc-400 dark:border-zinc-700",
        bg: "bg-zinc-100 dark:bg-zinc-950/30",
        ring: "border-zinc-400 dark:border-zinc-700",
    },
};
// const priorityConfig: Record<
//     TicketPriority,
//     {
//         label: string;
//         marker: string;
//         dot: string;
//         text: string;
//         border: string;
//         bg: string;
//     }
// > = {
//     P0: {
//         label: "Critical",
//         marker: "▲",
//         dot: "bg-red-500",
//         text: "text-red-700 dark:text-red-300",
//         border: "border-red-500/60",
//         bg: "bg-red-200 dark:bg-red-950/20",
//     },
//     P1: {
//         label: "Urgent",
//         marker: "▲",
//         dot: "bg-orange-500",
//         text: "text-orange-700 dark:text-orange-300",
//         border: "border-orange-500/60",
//         bg: "bg-orange-100 dark:bg-orange-950/20",
//     },
//     P2: {
//         label: "High",
//         marker: "●",
//         dot: "bg-amber-500",
//         text: "text-amber-700 dark:text-amber-300",
//         border: "border-amber-500/60",
//         bg: "bg-amber-100 dark:bg-amber-950/20",
//     },
//     P3: {
//         label: "Normal",
//         marker: "●",
//         dot: "bg-sky-500",
//         text: "text-sky-700 dark:text-sky-300",
//         border: "border-sky-500/60",
//         bg: "bg-sky-100 dark:bg-sky-950/20",
//     },
//     P4: {
//         label: "Low",
//         marker: "▼",
//         dot: "bg-zinc-500",
//         text: "text-zinc-700 dark:text-zinc-300",
//         border: "border-zinc-400 dark:border-zinc-700",
//         bg: "bg-zinc-100 dark:bg-zinc-950/30",
//     },
// };

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

    const attentionTickets = tickets
        .filter((ticket) => !["Done", "Closed"].includes(ticket.status) && ["P0", "P1"].includes(ticket.priority))
        .slice(0, 4);

    const activeFilterCount = Number(Boolean(selectedPriority)) + Number(Boolean(selectedStatus));

    return (
        <div className="pj-app-page space-y-8 font-['Inter',ui-sans-serif,sans-serif]">
            <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
                <Link className="text-[10px] uppercase tracking-[.2em] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white" to={`/organisations/${organizationId}/projects`}>
                    ← Projects
                </Link>
                <div className="mt-7 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-pj-lime">{project?.code ?? "PROJECT"} / WORK QUEUE</p>
                        <h1 className="mt-3 font-['Instrument_Serif',Georgia,serif] text-5xl leading-[.92] tracking-tight text-zinc-900 dark:text-white sm:text-6xl">Everything that needs movement.</h1>
                        <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">Triage the queue, find the work that matters, and move tickets forward.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link className="inline-flex min-h-10 items-center gap-2 border border-zinc-300 px-4 text-[10px] font-semibold uppercase tracking-[.14em] text-zinc-700 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500" to={`/organisations/${organizationId}/projects/${projectId}/settings`}><Settings2 className="h-4 w-4" /> Settings</Link>
                        <button className="inline-flex min-h-10 items-center gap-2 border border-zinc-900 bg-zinc-900 px-4 text-[10px] font-semibold uppercase tracking-[.14em] text-white hover:bg-zinc-700 dark:border-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200" onClick={() => setShowForm((value) => !value)} type="button">{showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{showForm ? "Close" : "New ticket"}</button>
                    </div>
                </div>
                <div className="mt-8 grid grid-cols-2 border-t border-zinc-200 pt-5 dark:border-zinc-800 sm:grid-cols-4">
                    <QueueStat label="Open" value={openCount} />
                    <QueueStat label="Attention" value={urgentCount} accent={urgentCount > 0 ? "yellow" : "lime"} />
                    <QueueStat label="Showing" value={filtered.length} />
                    <QueueStat label="Total" value={tickets.length} />
                </div>
            </header>

            {showForm && (
                <form className="border-y border-zinc-300 bg-white py-6 dark:border-zinc-700 dark:bg-zinc-950/40" onSubmit={submit}>
                    <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.2em] text-pj-lime">NEW TICKET</p><h2 className="mt-2 text-xl font-medium text-zinc-900 dark:text-white">What needs to happen?</h2></div><span className="text-[10px] uppercase tracking-[.14em] text-zinc-500">Required: title</span></div>
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="md:col-span-2"><label className="mb-2 block text-[10px] uppercase tracking-[.16em] text-zinc-500">Title</label><input autoFocus className="w-full border-b border-zinc-300 bg-transparent px-0 py-3 text-lg text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:text-white dark:focus:border-white" minLength={3} placeholder="Describe the outcome, not just the problem" required value={title} onChange={(event) => setTitle(event.target.value)} /></div>
                        <div className="md:col-span-2"><label className="mb-2 block text-[10px] uppercase tracking-[.16em] text-zinc-500">Context <span className="normal-case tracking-normal">Optional</span></label><textarea className="min-h-24 w-full border border-zinc-300 bg-transparent p-3 text-sm leading-6 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:text-white dark:focus:border-white" placeholder="Add the context the team needs" value={description} onChange={(event) => setDescription(event.target.value)} /></div>
                        <Select label="Type" value={type} options={types} onChange={(value) => setType(value as TicketType)} />
                        <Select label="Priority" value={priority} options={priorities} onChange={(value) => setPriority(value as TicketPriority)} />
                        <AssigneePicker label="Assignee" members={members} value={assignedTo} onChange={setAssignedTo} />
                    </div>
                    <button className="mt-6 inline-flex min-h-10 items-center gap-2 border border-zinc-900 bg-zinc-900 px-4 text-[10px] font-semibold uppercase tracking-[.14em] text-white hover:bg-zinc-700 dark:border-white dark:bg-white dark:text-zinc-900" disabled={saving} type="submit">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{saving ? "Creating" : "Create ticket"}</button>
                </form>
            )}

            {error && <p className="border-y border-red-400/50 py-3 text-sm text-red-700 dark:text-red-300">{error}</p>}

            {attentionTickets.length > 0 && !selectedPriority && !selectedStatus && !query && (
                <section className="border-y border-zinc-200 py-5 dark:border-zinc-800">
                    <div className="mb-4 flex items-baseline justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-pj-yellow">NEEDS ATTENTION</p><h2 className="mt-1 text-lg font-medium text-zinc-900 dark:text-white">Priority work is waiting.</h2></div><span className="text-[10px] uppercase tracking-[.14em] text-zinc-500">{urgentCount} urgent</span></div>
                    <div className="grid gap-px bg-zinc-200 dark:bg-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
                        {attentionTickets.map((ticket) => <button key={ticket.id} className="pj-attention-card group min-w-0 p-4 text-left" onClick={() => navigate(`/organisations/${ticket.organization_id}/projects/${ticket.project_id}/tickets/${ticket.id}`)} type="button"><div className="flex items-center justify-between"><span className="text-[10px] font-bold tracking-[.14em] text-pj-yellow">{ticket.priority}</span><ChevronRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-1" /></div><p className="mt-4 line-clamp-2 text-sm font-medium leading-5 text-zinc-900 dark:text-white">{ticket.title}</p><p className="mt-4 text-[9px] uppercase tracking-[.12em] text-zinc-500">{ticket.ticket_number} · {ticket.status}</p></button>)}
                    </div>
                </section>
            )}

            <section>
                <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="relative w-full max-w-xl"><Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" /><input className="w-full border-b border-zinc-300 bg-transparent py-3 pl-7 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-900 dark:border-zinc-700 dark:text-white dark:focus:border-white" placeholder="Search by ticket, title, or description  /" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[.14em] text-zinc-500"><span>{filtered.length} shown</span>{activeFilterCount > 0 && <button className="text-pj-lime hover:underline" onClick={() => setSearchParams({})} type="button">Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}</button>}</div>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3"><span className="text-[10px] font-semibold uppercase tracking-[.16em] text-zinc-500">Priority</span><PriorityLegend selectedPriority={selectedPriority} onSelect={(nextPriority) => { const next = new URLSearchParams(searchParams); if (nextPriority) next.set("priority", nextPriority); else next.delete("priority"); setSearchParams(next); }} /></div>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5"><span className="mr-2 text-[10px] font-semibold uppercase tracking-[.16em] text-zinc-500">Status</span>{(["All", ...statuses] as const).map((status) => { const active = (!selectedStatus && status === "All") || selectedStatus === status; return <button className={`pj-filter-status ${active ? "pj-filter-status-active" : ""} border px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[.1em] transition-colors`} data-status={status} key={status} onClick={() => { const next = new URLSearchParams(searchParams); if (status === "All") next.delete("status"); else next.set("status", status); setSearchParams(next); }} type="button">{status}</button>; })}</div>
                </div>

                {loading ? <WorkOrbitLoader /> : filtered.length ? <div className="mt-1">{filtered.map((ticket, index) => <TicketRow index={index} key={ticket.id} members={members} navigate={navigate} parentTicket={tickets.find((item) => item.id === ticket.parent_ticket_id)} ticket={ticket} />)}</div> : <div className="border-y border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-zinc-500">Nothing here</p><p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{query ? "No tickets match your search." : "This queue is clear."}</p></div>}
            </section>
        </div>
    );
}

function QueueStat({ label, value, accent }: { label: string; value: number; accent?: "lime" | "yellow" }) {
    return <div className="border-r border-zinc-200 px-4 first:pl-0 last:border-r-0 dark:border-zinc-800"><p className={`text-2xl font-semibold tracking-tight ${accent === "yellow" ? "text-pj-yellow" : accent === "lime" ? "text-pj-lime" : "text-zinc-900 dark:text-white"}`}>{value}</p><p className="mt-1 text-[9px] uppercase tracking-[.16em] text-zinc-500">{label}</p></div>;
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

            <p className="mt-0.5 text-[9px] uppercase tracking-[.08em] text-zinc-500 dark:text-zinc-400">
                {label}
            </p>
        </div>
    );
}

function TicketRow({ index, members, navigate, parentTicket, ticket }: { index: number; members: ProjectMember[]; navigate: ReturnType<typeof useNavigate>; parentTicket?: Ticket; ticket: Ticket }) {
    const priority = priorityConfig[ticket.priority];
    const status = statusConfig[ticket.status];
    const assignee = members.find((member) => member.user_id === ticket.assigned_to);
    const initials = assignee ? (assignee.name || assignee.email || "?").split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase() : null;
    const isAttention = ["P0", "P1"].includes(ticket.priority) && !["Done", "Closed"].includes(ticket.status);

    return <button className="pj-ticket-row group relative w-full border-b border-zinc-200 py-5 text-left transition-colors hover:bg-[var(--pj-hover-surface)] focus-visible:outline-none dark:border-zinc-800 dark:hover:bg-[var(--pj-hover-surface)]" onClick={() => navigate(`/organisations/${ticket.organization_id}/projects/${ticket.project_id}/tickets/${ticket.id}`)} style={{ animationDelay: `${index * 35}ms` }} type="button">
        {isAttention && <span className="absolute inset-y-0 left-0 w-0.5 bg-pj-yellow" />}
        <div className="grid gap-4 px-2 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-center sm:px-3">
            <div className="flex items-center gap-3"><span className={`text-[11px] font-bold tracking-[.12em] ${priority.text}`}>{ticket.priority}</span><span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} /></div>
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[.16em] text-zinc-500"><span className="font-semibold text-zinc-700 dark:text-zinc-300">{ticket.ticket_number}</span><span>·</span><span>{ticket.type}</span>{parentTicket && <><span>·</span><span>Child of {parentTicket.ticket_number}</span></>}</div><h2 className="mt-1 truncate text-[15px] font-medium leading-6 text-zinc-900 dark:text-zinc-100">{ticket.title}</h2><p className="mt-1 truncate text-xs leading-5 text-zinc-500 dark:text-zinc-400">{ticket.description || "No description provided"}</p><div className="ticket-bottom-meta mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9px] uppercase tracking-[.1em] text-zinc-500"><span className="meta-accent">{assignee ? `${assignee.name || assignee.email}` : "Unassigned"}</span>{ticket.hours_logged !== undefined && <span className="meta-accent">{ticket.hours_logged}h logged</span>}{ticket.expected_end_date && <span>Due {formatShortDate(ticket.expected_end_date)}</span>}{ticket.reason_for_delay && <span className="meta-warning">Delayed</span>}{ticket.demo_link && <span className="meta-accent inline-flex items-center gap-1"><Link2 className="h-3 w-3" /> Demo</span>}</div></div>
            <div className="flex items-center justify-between gap-4 sm:justify-end"><span className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[.1em] ${getStatusBadgeTone(ticket.status)}`}><span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />{ticket.status}</span><ChevronRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-1" /></div>
        </div>
    </button>;
}

// function MetaChip({
//     children,
// }: {
//     children: React.ReactNode;
// }) {
//     return (
//         <span className="inline-flex items-center gap-1.5 border border-zinc-200 bg-zinc-50 px-2 py-1 text-[9px] uppercase tracking-[.06em] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
//             {children}
//         </span>
//     );
// }

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
            return "border-emerald-600 bg-[var(--pj-panel-muted)] text-emerald-900 dark:border-emerald-400 dark:bg-[var(--pj-panel-muted)] dark:text-emerald-200";

        case "In Review":
            return "border-sky-600 bg-[var(--pj-panel-muted)] text-sky-900 dark:border-sky-400 dark:bg-[var(--pj-panel-muted)] dark:text-sky-200";

        case "Testing":
            return "border-violet-600 bg-[var(--pj-panel-muted)] text-violet-900 dark:border-violet-400 dark:bg-[var(--pj-panel-muted)] dark:text-violet-200";

        case "Done":
            return "border-green-600 bg-[var(--pj-panel-muted)] text-green-900 dark:border-green-400 dark:bg-[var(--pj-panel-muted)] dark:text-green-200";

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
                    ? "border-[var(--pj-border-strong)] bg-[var(--pj-panel-muted)] text-[var(--pj-text)]"
                    : "border-[var(--pj-border)] bg-transparent text-[var(--pj-muted)] hover:border-[var(--pj-border-strong)] hover:bg-[var(--pj-hover-surface)]"
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
                        className={`pj-filter-priority ${active ? "pj-filter-priority-active" : ""}` + `
                            inline-flex items-center gap-2 border px-3 py-1.5
                            text-[10px] uppercase tracking-[.1em]
                            transition-all
                            ${config.border}
                            ${active
                                ? `${config.bg} ${config.text}`
                                : `bg-white text-zinc-600 hover:bg-zinc-50 dark:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-900`
                            }
                        `}
                        key={priority}
                        data-priority={priority}
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
                        <span className="font-bold">{priority}</span>

                        {/* Priority label */}
                        <span className="hidden font-bold sm:inline">
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