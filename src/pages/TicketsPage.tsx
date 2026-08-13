import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Link2, Loader2, Plus, Search, Settings2, UserRound, X } from "lucide-react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { getProject } from "../api/projects";
import { createTicket, listTickets } from "../api/tickets";
import type { Project } from "../types/project";
import type { ProjectMember } from "../types/project";
import type { Ticket, TicketPriority, TicketStatus, TicketType } from "../types/ticket";
import ProjectecLoader from "../components/ui/ProjectecLoader";
import AssigneePicker from "../components/ui/AssigneePicker";
import { listProjectMembers } from "../api/projects";

const types: TicketType[] = ["Feature", "Bug", "Task", "Improvement"];
const priorities: TicketPriority[] = ["P0", "P1", "P2", "P3", "P4"];
const statuses: TicketStatus[] = ["To Do", "In Progress", "In Review", "Testing", "Done", "Closed"];

const priorityConfig: Record<TicketPriority, { label: string; marker: string; dot: string; text: string; border: string; bg: string }> = {
    P0: { label: "Critical", marker: "▲", dot: "bg-red-400", text: "text-red-300", border: "border-red-400/50", bg: "bg-red-950/20" },
    P1: { label: "Urgent", marker: "▲", dot: "bg-orange-300", text: "text-orange-200", border: "border-orange-300/50", bg: "bg-orange-950/20" },
    P2: { label: "High", marker: "●", dot: "bg-amber-300", text: "text-amber-200", border: "border-amber-300/50", bg: "bg-amber-950/20" },
    P3: { label: "Normal", marker: "●", dot: "bg-sky-300", text: "text-sky-200", border: "border-sky-300/50", bg: "bg-sky-950/20" },
    P4: { label: "Low", marker: "▼", dot: "bg-zinc-500", text: "text-zinc-600 dark:text-zinc-300", border: "border-zinc-300 dark:border-zinc-700", bg: "bg-white dark:bg-zinc-950/30" },
};

const statusConfig: Record<TicketStatus, { dot: string; text: string }> = {
    "To Do": { dot: "bg-zinc-500", text: "text-zinc-600 dark:text-zinc-400" },
    "In Progress": { dot: "bg-emerald-400", text: "text-emerald-300" },
    "In Review": { dot: "bg-sky-400", text: "text-sky-300" },
    Testing: { dot: "bg-violet-400", text: "text-violet-300" },
    Done: { dot: "bg-green-400", text: "text-green-300" },
    Closed: { dot: "bg-zinc-200 dark:bg-zinc-700", text: "text-zinc-600 dark:text-zinc-300" },
};

export default function TicketsPage() {
    const { organizationId, projectId } = useParams<{ organizationId: string; projectId: string }>();
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
    const selectedPriority = searchParams.get("priority") as TicketPriority | null;
    const selectedStatus = searchParams.get("status") as TicketStatus | null;

    const load = async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const [nextProject, nextTickets, nextMembers] = await Promise.all([getProject(projectId), listTickets(projectId), listProjectMembers(projectId)]);
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

    const filtered = useMemo(() => tickets.filter((ticket) => `${ticket.ticket_number} ${ticket.title} ${ticket.description ?? ""}`.toLowerCase().includes(query.toLowerCase().trim()) && (!selectedPriority || ticket.priority === selectedPriority) && (!selectedStatus || ticket.status === selectedStatus)), [query, selectedPriority, selectedStatus, tickets]);
    const openCount = tickets.filter((ticket) => !["Done", "Closed"].includes(ticket.status)).length;
    const urgentCount = tickets.filter((ticket) => ["P0", "P1"].includes(ticket.priority)).length;

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!projectId || saving) return;
        setSaving(true);
        setError("");
        try {
            const ticket = await createTicket(projectId, { title: title.trim(), description: description.trim(), type, priority, assigned_to: assignedTo });
            navigate(`/organisations/${organizationId}/projects/${projectId}/tickets/${ticket.id}`);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 font-['Inter',ui-sans-serif,sans-serif]">
            <header className="border-b border-zinc-200 dark:border-zinc-800 pb-7">
                <Link className="text-[11px] uppercase tracking-[.18em] text-zinc-600 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white" to={`/organisations/${organizationId}/projects`}>← Projects</Link>
                <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-[.22em] text-zinc-600 dark:text-zinc-300">{project?.code ?? "Project"} · Work queue</p>
                        <h1 className="mt-3 font-['Instrument_Serif',Georgia,serif] text-5xl leading-none text-zinc-900 dark:text-white">{project?.name ?? "Tickets"}</h1>
                        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">{openCount} open · {urgentCount} urgent · {tickets.length} total</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link className="inline-flex min-h-10 items-center gap-2 border border-zinc-300 dark:border-zinc-700 px-4 text-[11px] uppercase tracking-[.14em] text-zinc-700 dark:text-zinc-300 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:hover:text-white" to={`/organisations/${organizationId}/projects/${projectId}/settings`}><Settings2 className="h-4 w-4" />Project settings</Link>
                        <button className="inline-flex min-h-10 items-center gap-2 border border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white px-4 text-[11px] uppercase tracking-[.14em] text-white dark:text-zinc-900 transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-200" onClick={() => setShowForm((value) => !value)} type="button">{showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{showForm ? "Close" : "New ticket"}</button>                    </div>
                </div>
            </header>

            {showForm && <form className="grid gap-5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950/40 p-5 md:grid-cols-2" onSubmit={submit}>
                <div className="md:col-span-2"><label className="mb-2 block text-[10px] uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-300">Title</label><input autoFocus className="w-full border border-zinc-400 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-3 text-zinc-900 dark:text-white outline-none transition-colors placeholder:text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 focus:border-zinc-900 dark:focus:border-white focus:ring-2 focus:ring-white/15" minLength={3} placeholder="What needs to happen?" required value={title} onChange={(event) => setTitle(event.target.value)} /></div>
                <div className="md:col-span-2"><label className="mb-2 block text-[10px] uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-300">Description <span className="normal-case tracking-normal text-zinc-600 dark:text-zinc-300">Optional</span></label><textarea className="min-h-28 w-full border border-zinc-400 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-3 text-zinc-900 dark:text-white outline-none transition-colors placeholder:text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 focus:border-zinc-900 dark:focus:border-white focus:ring-2 focus:ring-white/15" placeholder="Add the context the team needs" value={description} onChange={(event) => setDescription(event.target.value)} /></div>
                <Select label="Type" value={type} options={types} onChange={(value) => setType(value as TicketType)} />
                <Select label="Priority" value={priority} options={priorities} onChange={(value) => setPriority(value as TicketPriority)} />
                <AssigneePicker label="Assignee" members={members} value={assignedTo} onChange={setAssignedTo} />
                <button className="inline-flex w-fit min-h-10 items-center gap-2 border border-zinc-900 dark:border-white px-4 text-[11px] uppercase tracking-[.14em] text-zinc-900 dark:text-white disabled:opacity-40" disabled={saving} type="submit">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{saving ? "Creating" : "Create ticket"}</button>
            </form>}

            {error && <p className="border-y border-red-400/50 py-3 text-sm text-red-300">{error}</p>}

            <section className="space-y-5">
                <div className="space-y-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative max-w-sm flex-1"><Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600 dark:text-zinc-300" /><input className="w-full border-b border-zinc-300 dark:border-zinc-700 bg-transparent py-2 pl-6 text-sm text-zinc-900 dark:text-white outline-none transition-colors placeholder:text-zinc-600 dark:text-zinc-300 focus:border-zinc-900 dark:focus:border-white" placeholder="Search tickets" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
                        <p className="shrink-0 text-[11px] uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-300">{filtered.length} shown</p>
                    </div>
                    <PriorityLegend selectedPriority={selectedPriority} onSelect={(priority) => { const next = new URLSearchParams(searchParams); if (priority) next.set("priority", priority); else next.delete("priority"); setSearchParams(next); }} />
                    <div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-[10px] uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-300">Status</span>{(["All", ...statuses] as const).map((status) => <button className={`border px-2 py-1 text-[10px] uppercase tracking-[.1em] transition-colors ${(!selectedStatus && status === "All") || selectedStatus === status ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900" : "border-zinc-300 text-zinc-600 hover:border-zinc-500 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-white"}`} key={status} onClick={() => { const next = new URLSearchParams(searchParams); if (status === "All") next.delete("status"); else next.set("status", status); setSearchParams(next); }} type="button">{status}</button>)}</div>
                    {(selectedPriority || selectedStatus) && <button className="text-[10px] uppercase tracking-[.12em] text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-white" onClick={() => setSearchParams({})} type="button">Clear filters</button>}
                </div>
                {loading ? <ProjectecLoader /> : filtered.length ? <div className="border-t border-zinc-200 dark:border-zinc-800">{filtered.map((ticket, index) => <TicketRow index={index} key={ticket.id} members={members} navigate={navigate} parentTicket={tickets.find((item) => item.id === ticket.parent_ticket_id)} ticket={ticket} />)}</div> : <div className="border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center text-sm text-zinc-600 dark:text-zinc-400">{query ? "No tickets match your search." : "No tickets in this project yet."}</div>}
            </section>
        </div>
    );
}

function TicketRow({ index, members, navigate, parentTicket, ticket }: { index: number; members: ProjectMember[]; navigate: ReturnType<typeof useNavigate>; parentTicket?: Ticket; ticket: Ticket }) {
    const priorityTone = priorityConfig[ticket.priority];
    const statusTone = statusConfig[ticket.status];
    const assignee = members.find((member) => member.user_id === ticket.assigned_to);
    return <button className="group grid w-full grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 py-4 text-left transition-all duration-200 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 focus-visible:bg-zinc-50 dark:focus-visible:bg-zinc-900 focus-visible:outline-none sm:gap-4" onClick={() => navigate(`/organisations/${ticket.organization_id}/projects/${ticket.project_id}/tickets/${ticket.id}`)} style={{ animationDelay: `${index * 35}ms` }} type="button">
        <span className={`w-4 text-center text-[11px] ${priorityTone.text}`} title={`${ticket.priority}: ${priorityTone.label}`}>{priorityTone.marker}</span>
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusTone.dot}`} title={ticket.status} />
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-300"><span>{ticket.ticket_number}</span><span>·</span><span>{ticket.type}</span></div><h2 className="mt-1 truncate text-[13px] text-zinc-800 dark:text-zinc-100 transition-colors group-hover:text-zinc-900 dark:group-hover:text-white">{ticket.title}</h2><p className="mt-1 line-clamp-1 text-[11px] text-zinc-600 dark:text-zinc-300">{ticket.description || "No description"}</p></div>
        <div className="flex items-center gap-3"><div className="hidden min-w-40 text-right text-[10px] leading-5 text-zinc-600 dark:text-zinc-400 2xl:block">{assignee && <p className="truncate"><UserRound className="mr-1 inline h-3 w-3" />{assignee.name || assignee.email}</p>}{ticket.difficulty !== null && ticket.difficulty !== undefined && <p>Difficulty {ticket.difficulty}{ticket.hours_logged !== undefined ? ` · ${ticket.hours_logged}h logged` : ""}</p>}{ticket.expected_start_date && <p>Planned {formatShortDate(ticket.expected_start_date)}</p>}{ticket.expected_end_date && <p>Due {formatShortDate(ticket.expected_end_date)}</p>}{ticket.actual_start_date && <p>Started {formatShortDate(ticket.actual_start_date)}</p>}{ticket.actual_end_date && <p>Finished {formatShortDate(ticket.actual_end_date)}</p>}{parentTicket && <p>Parent {parentTicket.ticket_number}</p>}{ticket.milestone_id && <p>Linked to milestone</p>}{ticket.demo_link && <p><Link2 className="mr-1 inline h-3 w-3" />Demo attached</p>}{ticket.reason_for_delay && <p className="truncate text-amber-700 dark:text-amber-300" title={ticket.reason_for_delay}>Delay noted</p>}</div><span className={`hidden border px-2 py-1 text-[10px] uppercase tracking-[.12em] sm:inline-flex ${priorityTone.border} ${priorityTone.text} ${priorityTone.bg}`}>{ticket.priority}</span><span className={`hidden text-[10px] uppercase tracking-[.12em] md:inline-flex ${statusTone.text}`}>{ticket.status}</span><ChevronRight className="h-4 w-4 text-zinc-600 dark:text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-zinc-900 dark:group-hover:text-white" /></div>
    </button>;
}

function PriorityLegend({ selectedPriority, onSelect }: { selectedPriority: TicketPriority | null; onSelect: (priority: TicketPriority | null) => void }) {
    return <div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-[10px] uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-300">Priority</span><button className={`border px-2 py-1 text-[10px] uppercase tracking-[.1em] ${!selectedPriority ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900" : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"}`} onClick={() => onSelect(null)} type="button">All</button>{priorities.map((priority) => <button className={`inline-flex items-center gap-2 border px-2 py-1 text-[10px] uppercase tracking-[.1em] transition-colors ${priorityConfig[priority].border} ${priorityConfig[priority].text} ${priorityConfig[priority].bg} ${selectedPriority === priority ? "ring-1 ring-zinc-900 dark:ring-white" : "hover:brightness-95 dark:hover:brightness-125"}`} key={priority} onClick={() => onSelect(priority)} type="button"><span className={`h-1.5 w-1.5 rounded-full ${priorityConfig[priority].dot}`} />{priority}<span className="hidden sm:inline">{priorityConfig[priority].label}</span></button>)}</div>;
}

function formatShortDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "date unavailable" : date.toLocaleDateString("en-US", { month: "short", day: "numeric" }); }

function Select({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
    return <label className="text-[10px] uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-300">{label}<select className="mt-2 block w-full border border-zinc-400 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-3 text-sm normal-case tracking-normal text-zinc-900 dark:text-white outline-none transition-colors hover:border-zinc-400 focus:border-zinc-900 dark:focus:border-white focus:ring-2 focus:ring-white/15" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
