import { useEffect, useState } from "react";
import {
    ArrowUpRight,
    Archive,
    CheckCircle2,
    Circle,
    ClipboardCheck,
    Clock3,
    Eye,
    Flame,
    LoaderCircle,
} from "lucide-react";
import {
    closestCorners,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { listTickets, updateTicket } from "../api/tickets";
import type { Ticket, TicketPriority, TicketStatus } from "../types/ticket";

const statuses: TicketStatus[] = ["To Do", "In Progress", "In Review", "Testing", "Done", "Closed"];

const statusConfig: Record<TicketStatus, { icon: typeof Circle; accent: string; number: string }> = {
    "To Do": { icon: Circle, accent: "text-zinc-600 dark:text-zinc-300", number: "01" },
    "In Progress": { icon: LoaderCircle, accent: "text-amber-700 dark:text-amber-300", number: "02" },
    "In Review": { icon: Eye, accent: "text-sky-700 dark:text-sky-300", number: "03" },
    Testing: { icon: ClipboardCheck, accent: "text-violet-700 dark:text-violet-300", number: "04" },
    Done: { icon: CheckCircle2, accent: "text-emerald-700 dark:text-emerald-300", number: "05" },
    Closed: { icon: Archive, accent: "text-zinc-600 dark:text-zinc-400", number: "06" },
};

export default function ProjectInsightsPage({ mode }: { mode: "dashboard" | "board" }) {
    const { organizationId, projectId } = useParams<{ organizationId: string; projectId: string }>();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
    const [overStatus, setOverStatus] = useState<TicketStatus | null>(null);
    const [error, setError] = useState("");
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor),
    );

    useEffect(() => {
        if (!projectId) return;
        void listTickets(projectId)
            .then(setTickets)
            .catch((err: unknown) => setError(getErrorMessage(err)));
    }, [projectId]);

    const grouped = (status: TicketStatus) => tickets.filter((ticket) => ticket.status === status);

    const moveTicket = async (ticket: Ticket, status: TicketStatus) => {
        if (ticket.status === status) return;
        const previousTickets = tickets;
        setError("");
        setTickets((items) => items.map((item) => item.id === ticket.id ? { ...item, status } : item));
        try {
            await updateTicket(ticket.id, { status });
        } catch (err: unknown) {
            setTickets(previousTickets);
            setError(`Could not move ${ticket.ticket_number}: ${getErrorMessage(err)}`);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveTicket(tickets.find((ticket) => ticket.id === event.active.id) ?? null);
    };

    const handleDragOver = (event: DragOverEvent) => {
        setOverStatus(statuses.find((status) => status === event.over?.id) ?? null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const ticket = tickets.find((item) => item.id === event.active.id);
        const status = statuses.find((item) => item === event.over?.id);
        setActiveTicket(null);
        setOverStatus(null);
        if (ticket && status) void moveTicket(ticket, status);
    };

    if (mode === "dashboard") {
        return <DashboardView organizationId={organizationId} projectId={projectId} tickets={tickets} />;
    }

    return (
        <div className="space-y-7 font-['Inter',ui-sans-serif,sans-serif]">
            <div className="flex items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                <div>
                    <Link className="text-xs uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white" to={`/organisations/${organizationId}/projects/${projectId}/tickets`}>← Tickets</Link>
                    <p className="mt-6 text-[10px] uppercase tracking-[.22em] text-zinc-600 dark:text-zinc-400">Project workflow</p>
                    <h1 className="mt-3 font-['Instrument_Serif',Georgia,serif] text-5xl leading-none text-zinc-900 dark:text-white">Kanban board</h1>
                </div>
                <p className="hidden text-right text-xs text-zinc-600 dark:text-zinc-300 sm:block">{tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}<br />live workflow</p>
            </div>
            {error && <p className="border-y border-red-400/50 py-3 text-sm text-red-300">{error}</p>}
            <DndContext
                collisionDetection={closestCorners}
                onDragCancel={() => { setActiveTicket(null); setOverStatus(null); }}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragStart={handleDragStart}
                sensors={sensors}
            >
                <div className="pj-scrollbar w-full min-w-0 overflow-x-auto overflow-y-visible pb-6">
                    <div className="grid min-w-[900px] grid-cols-[repeat(6,minmax(0,1fr))] items-start gap-3">
                        {statuses.map((status) => (
                            <KanbanColumn key={status} status={status} tickets={grouped(status)} isOver={overStatus === status} />
                        ))}
                    </div>
                </div>
                <DragOverlay dropAnimation={null}>
                    {activeTicket ? <TicketCard dragging ticket={activeTicket} /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

function KanbanColumn({ status, tickets, isOver }: { status: TicketStatus; tickets: Ticket[]; isOver: boolean }) {
    const { setNodeRef } = useDroppable({ id: status });
    const config = statusConfig[status];
    const StatusIcon = config.icon;

    return (
        <section
            ref={setNodeRef}
            className={`h-fit w-full min-w-0 self-start border transition-all duration-200 ${isOver ? "border-zinc-900 dark:border-white/80 bg-white dark:bg-zinc-900/[0.07] shadow-[0_0_32px_rgba(255,255,255,.14)]" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/45"}`}
        >
            <header className={`flex items-center gap-3 border-b px-4 py-3 ${isOver ? "border-zinc-900 dark:border-white/40" : "border-zinc-200 dark:border-zinc-800"}`}>
                <span className="text-[10px] tracking-[.16em] text-zinc-600 dark:text-zinc-300">{config.number}</span>
                <StatusIcon className={`h-3.5 w-3.5 ${config.accent} ${status === "In Progress" ? "animate-spin" : ""}`} />
                <h2 className="text-[11px] uppercase tracking-[.16em] text-zinc-700 dark:text-zinc-200">{status}</h2>
                <span className="ml-auto text-[11px] tabular-nums text-zinc-600 dark:text-zinc-300">{tickets.length}</span>
            </header>
            <div className={`space-y-2 p-2 transition-colors duration-200 ${isOver ? "bg-white dark:bg-zinc-900/[0.03]" : ""}`}>
                {tickets.map((ticket) => <DraggableTicket key={ticket.id} ticket={ticket} />)}
                {!tickets.length && (
                    <div className={`flex min-h-24 items-center justify-center border border-dashed px-3 text-center text-[10px] uppercase tracking-[.14em] ${isOver ? "border-zinc-900 dark:border-white/60 text-zinc-900 dark:text-white" : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300"}`}>
                        {isOver ? "Drop ticket here" : "No tickets"}
                    </div>
                )}
            </div>
        </section>
    );
}

function DraggableTicket({ ticket }: { ticket: Ticket }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: ticket.id });
    return (
        <div ref={setNodeRef} {...listeners} {...attributes} style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }} className={isDragging ? "opacity-25" : ""}>
            <TicketCard ticket={ticket} />
        </div>
    );
}

function TicketCard({ ticket, dragging = false }: { ticket: Ticket; dragging?: boolean }) {
    const navigate = useNavigate();
    return (
        <article
            className={`cursor-grab border border-zinc-200 dark:border-zinc-800 bg-[#f4f4f5] dark:bg-[#111] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-400 dark:hover:border-zinc-500 active:cursor-grabbing ${dragging ? "rotate-1 border-zinc-900 dark:border-white/70 shadow-[0_0_28px_rgba(255,255,255,.2)]" : ""}`}
            onDoubleClick={() => navigate(`/organisations/${ticket.organization_id}/projects/${ticket.project_id}/tickets/${ticket.id}`)}
        >
            <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] uppercase tracking-[.12em] text-zinc-600 dark:text-zinc-300">{ticket.ticket_number}</p>
                <span className={`border px-1.5 py-0.5 text-[10px] uppercase tracking-[.12em] ${priorityTone[ticket.priority].border} ${priorityTone[ticket.priority].bg} ${priorityTone[ticket.priority].text}`} title={`${ticket.priority} priority`}>{ticket.priority}</span>
            </div>
            <h3 className="mt-2 text-[13px] leading-5 text-zinc-800 dark:text-zinc-100">{ticket.title}</h3>
            <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-zinc-600 dark:text-zinc-400">{ticket.description || "No description"}</p>
        </article>
    );
}

function DashboardView({ organizationId, projectId, tickets }: { organizationId?: string; projectId?: string; tickets: Ticket[] }) {
    const navigate = useNavigate();
    const openTickets = tickets.filter((ticket) => !["Done", "Closed"].includes(ticket.status));
    const completedTickets = tickets.filter((ticket) => ["Done", "Closed"].includes(ticket.status));
    const urgentTickets = tickets.filter((ticket) => ["P0", "P1"].includes(ticket.priority));
    const loggedHours = tickets.reduce((total, ticket) => total + (ticket.hours_logged ?? 0), 0);
    const maxStatusCount = Math.max(...statuses.map((status) => tickets.filter((ticket) => ticket.status === status).length), 1);
    const recentTickets = [...tickets].sort((left, right) => right.updated_at.localeCompare(left.updated_at)).slice(0, 5);

    return (
        <div className="pj-dashboard space-y-8 font-['Inter',ui-sans-serif,sans-serif]">
            <header className="border-b border-zinc-200 dark:border-zinc-800 pb-7">
                <Link className="text-xs uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white" to={`/organisations/${organizationId}/projects/${projectId}/tickets`}>← Tickets</Link>
                <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                    <div><p className="text-[10px] uppercase tracking-[.22em] text-zinc-600 dark:text-zinc-300">Project intelligence</p><h1 className="mt-3 font-['Instrument_Serif',Georgia,serif] text-5xl leading-none text-zinc-900 dark:text-white">Project dashboard</h1><p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">A live read of the work moving through this project.</p></div>
                    <div className="text-right text-[10px] uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-300">{tickets.length} tracked<br />tickets</div>
                </div>
            </header>

            <div className="grid gap-px border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardStat label="Open work" value={openTickets.length} detail={`${tickets.length ? Math.round((openTickets.length / tickets.length) * 100) : 0}% of queue`} icon={Circle} onClick={() => navigate(`/organisations/${organizationId}/projects/${projectId}/tickets?status=To%20Do`)} tone="text-sky-700 dark:text-sky-300" />
                <DashboardStat label="Completed" value={completedTickets.length} detail={`${tickets.length ? Math.round((completedTickets.length / tickets.length) * 100) : 0}% shipped`} icon={CheckCircle2} onClick={() => navigate(`/organisations/${organizationId}/projects/${projectId}/tickets?status=Done`)} tone="text-emerald-700 dark:text-emerald-300" />
                <DashboardStat label="Priority watch" value={urgentTickets.length} detail="P0 / P1 tickets" icon={Flame} onClick={() => navigate(`/organisations/${organizationId}/projects/${projectId}/tickets?priority=P0`)} tone="pj-stat-accent text-red-700 dark:text-red-300" />
                <DashboardStat label="Hours logged" value={loggedHours} detail="across all tickets" icon={Clock3} onClick={() => navigate(`/organisations/${organizationId}/projects/${projectId}/tickets`)} tone="text-violet-700 dark:text-violet-300" />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
                <section className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/30 p-5">
                    <div className="flex items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4"><div><p className="text-[10px] uppercase tracking-[.18em] text-zinc-600 dark:text-zinc-300">Flow</p><h2 className="mt-2 text-lg text-zinc-800 dark:text-zinc-100">Work by status</h2></div><span className="text-[10px] uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-300">{tickets.length} total</span></div>
                    <div className="mt-5 space-y-2">{statuses.map((status) => { const count = tickets.filter((ticket) => ticket.status === status).length; const config = statusConfig[status]; const StatusIcon = config.icon; return <button className="grid w-full grid-cols-[8rem_1fr_2rem] items-center gap-3 px-1 py-2 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900/30 dark:hover:bg-zinc-900/50 dark:focus-visible:ring-white/30" key={status} onClick={() => navigate(`/organisations/${organizationId}/projects/${projectId}/tickets?status=${encodeURIComponent(status)}`)} type="button"><div className="flex items-center gap-2 text-[10px] uppercase tracking-[.12em] text-zinc-600 dark:text-zinc-400"><StatusIcon className={`h-3 w-3 ${config.accent}`} />{status}</div><div className="h-1 bg-zinc-100 dark:bg-zinc-900"><div className={`h-full transition-all duration-500 ${statusBar[status]}`} style={{ width: `${(count / maxStatusCount) * 100}%` }} /></div><span className="text-right text-xs tabular-nums text-zinc-600 dark:text-zinc-300">{count}</span></button>; })}</div>
                </section>
                <section className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/30 p-5">
                    <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4"><p className="text-[10px] uppercase tracking-[.18em] text-zinc-600 dark:text-zinc-300">Signal</p><h2 className="mt-2 text-lg text-zinc-800 dark:text-zinc-100">Priority pressure</h2></div>
                    <div className="mt-5 grid grid-cols-5 gap-2">{(["P0", "P1", "P2", "P3", "P4"] as const).map((priority) => { const count = tickets.filter((ticket) => ticket.priority === priority).length; return <div className={`border p-3 ${priorityTone[priority].border} ${priorityTone[priority].bg}`} key={priority}><span className={`text-xs ${priorityTone[priority].text}`}>{priority}</span><p className="mt-4 text-2xl text-zinc-900 dark:text-white">{count}</p><p className="mt-1 text-[9px] uppercase tracking-[.1em] text-zinc-600 dark:text-zinc-300">{priorityTone[priority].label}</p></div>; })}</div>
                    <p className="mt-5 text-xs leading-5 text-zinc-600 dark:text-zinc-300">{urgentTickets.length ? `${urgentTickets.length} ticket${urgentTickets.length === 1 ? "" : "s"} need${urgentTickets.length === 1 ? "s" : ""} priority attention.` : "No urgent tickets in the current queue."}</p>
                </section>
            </div>

            <section className="border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-end justify-between border-b border-zinc-200 dark:border-zinc-800 px-5 py-4"><div><p className="text-[10px] uppercase tracking-[.18em] text-zinc-600 dark:text-zinc-300">Recent activity</p><h2 className="mt-2 text-lg text-zinc-800 dark:text-zinc-100">Recently updated</h2></div><Link className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white" to={`/organisations/${organizationId}/projects/${projectId}/tickets`}>View queue <ArrowUpRight className="h-3 w-3" /></Link></div>
                {recentTickets.length ? recentTickets.map((ticket) => <Link className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 px-5 py-4 last:border-b-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/50" key={ticket.id} to={`/organisations/${organizationId}/projects/${projectId}/tickets/${ticket.id}`}><span className={`h-1.5 w-1.5 rounded-full ${priorityTone[ticket.priority].dot}`} /><div className="min-w-0"><div className="flex gap-2 text-[10px] uppercase tracking-[.12em] text-zinc-600 dark:text-zinc-300"><span>{ticket.ticket_number}</span><span>·</span><span>{ticket.type}</span></div><p className="mt-1 truncate text-sm text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white">{ticket.title}</p></div><div className="text-right"><p className={`text-[10px] uppercase tracking-[.1em] ${statusConfig[ticket.status].accent}`}>{ticket.status}</p><p className="mt-1 text-[10px] text-zinc-600 dark:text-zinc-300">{formatUpdated(ticket.updated_at)}</p></div></Link>) : <p className="p-8 text-center text-sm text-zinc-600 dark:text-zinc-300">No ticket activity yet.</p>}
            </section>
        </div>
    );
}

const statusBar: Record<TicketStatus, string> = { "To Do": "bg-zinc-500", "In Progress": "bg-emerald-600 dark:bg-emerald-400", "In Review": "bg-sky-600 dark:bg-sky-400", Testing: "bg-violet-600 dark:bg-violet-400", Done: "bg-green-600 dark:bg-green-400", Closed: "bg-zinc-300 dark:bg-zinc-700" };
const priorityTone: Record<TicketPriority, { label: string; text: string; border: string; bg: string; dot: string }> = { P0: { label: "Critical", text: "pj-priority-p0", border: "pj-priority-p0", bg: "pj-priority-p0", dot: "bg-red-600 dark:bg-red-400" }, P1: { label: "Urgent", text: "pj-priority-p1", border: "pj-priority-p1", bg: "pj-priority-p1", dot: "bg-orange-600 dark:bg-orange-300" }, P2: { label: "High", text: "pj-priority-p2", border: "pj-priority-p2", bg: "pj-priority-p2", dot: "bg-amber-600 dark:bg-amber-300" }, P3: { label: "Normal", text: "pj-priority-p3", border: "pj-priority-p3", bg: "pj-priority-p3", dot: "bg-sky-600 dark:bg-sky-300" }, P4: { label: "Low", text: "pj-priority-p4", border: "pj-priority-p4", bg: "pj-priority-p4", dot: "bg-zinc-500" } };

function DashboardStat({ label, value, detail, icon: Icon, onClick, tone }: { label: string; value: number; detail: string; icon: typeof Circle; onClick: () => void; tone: string }) { return <button className="bg-[#fafafa] p-5 text-left transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/30 dark:bg-[#0b0b0b] dark:hover:bg-zinc-900 dark:focus-visible:ring-white/30" onClick={onClick} type="button"><div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-300">{label}</p><Icon className={`h-4 w-4 ${tone}`} /></div><p className="mt-5 text-3xl text-zinc-900 dark:text-white">{value}</p><p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-300">{detail}</p></button>; }
function formatUpdated(value: string) { const date = new Date(value); if (Number.isNaN(date.getTime())) return "Recently"; return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
