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
    "To Do": { icon: Circle, accent: "text-zinc-400", number: "01" },
    "In Progress": { icon: LoaderCircle, accent: "text-amber-300", number: "02" },
    "In Review": { icon: Eye, accent: "text-sky-300", number: "03" },
    Testing: { icon: ClipboardCheck, accent: "text-violet-300", number: "04" },
    Done: { icon: CheckCircle2, accent: "text-emerald-300", number: "05" },
    Closed: { icon: Archive, accent: "text-zinc-500", number: "06" },
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
        <div className="space-y-7">
            <div className="flex items-end justify-between gap-4 border-b border-zinc-800 pb-6">
                <div>
                    <Link className="text-xs uppercase tracking-[.16em] text-zinc-500 transition-colors hover:text-white" to={`/organisations/${organizationId}/projects/${projectId}/tickets`}>← Tickets</Link>
                    <p className="mt-6 text-[10px] uppercase tracking-[.22em] text-zinc-500">Project workflow</p>
                    <h1 className="mt-3 text-4xl text-white">Kanban board</h1>
                </div>
                <p className="hidden text-right text-xs text-zinc-600 sm:block">{tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}<br />live workflow</p>
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
            className={`h-fit w-full min-w-0 self-start border transition-all duration-200 ${isOver ? "border-white/80 bg-white/[0.07] shadow-[0_0_32px_rgba(255,255,255,.14)]" : "border-zinc-800 bg-zinc-950/45"}`}
        >
            <header className={`flex items-center gap-3 border-b px-4 py-3 ${isOver ? "border-white/40" : "border-zinc-800"}`}>
                <span className="text-[10px] tracking-[.16em] text-zinc-600">{config.number}</span>
                <StatusIcon className={`h-3.5 w-3.5 ${config.accent} ${status === "In Progress" ? "animate-spin" : ""}`} />
                <h2 className="text-[11px] uppercase tracking-[.16em] text-zinc-200">{status}</h2>
                <span className="ml-auto text-[11px] tabular-nums text-zinc-600">{tickets.length}</span>
            </header>
            <div className={`space-y-2 p-2 transition-colors duration-200 ${isOver ? "bg-white/[0.03]" : ""}`}>
                {tickets.map((ticket) => <DraggableTicket key={ticket.id} ticket={ticket} />)}
                {!tickets.length && (
                    <div className={`flex min-h-24 items-center justify-center border border-dashed px-3 text-center text-[10px] uppercase tracking-[.14em] ${isOver ? "border-white/60 text-white" : "border-zinc-800 text-zinc-700"}`}>
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
            className={`cursor-grab border border-zinc-800 bg-[#111] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-500 active:cursor-grabbing ${dragging ? "rotate-1 border-white/70 shadow-[0_0_28px_rgba(255,255,255,.2)]" : ""}`}
            onDoubleClick={() => navigate(`/organisations/${ticket.organization_id}/projects/${ticket.project_id}/tickets/${ticket.id}`)}
        >
            <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] uppercase tracking-[.12em] text-zinc-600">{ticket.ticket_number}</p>
                <span className={`border px-1.5 py-0.5 text-[10px] uppercase tracking-[.12em] ${priorityTone[ticket.priority].border} ${priorityTone[ticket.priority].bg} ${priorityTone[ticket.priority].text}`} title={`${ticket.priority} priority`}>{ticket.priority}</span>
            </div>
            <h3 className="mt-2 text-[13px] leading-5 text-zinc-100">{ticket.title}</h3>
            <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-zinc-500">{ticket.description || "No description"}</p>
        </article>
    );
}

function Metric({ label, value }: { label: string; value: number }) {
    return <section className="border border-zinc-700 p-5"><p className="text-xs uppercase text-zinc-500">{label}</p><p className="mt-3 text-4xl text-white">{value}</p></section>;
}

function DashboardView({ organizationId, projectId, tickets }: { organizationId?: string; projectId?: string; tickets: Ticket[] }) {
    const openTickets = tickets.filter((ticket) => !["Done", "Closed"].includes(ticket.status));
    const completedTickets = tickets.filter((ticket) => ["Done", "Closed"].includes(ticket.status));
    const urgentTickets = tickets.filter((ticket) => ["P0", "P1"].includes(ticket.priority));
    const loggedHours = tickets.reduce((total, ticket) => total + (ticket.hours_logged ?? 0), 0);
    const maxStatusCount = Math.max(...statuses.map((status) => tickets.filter((ticket) => ticket.status === status).length), 1);
    const recentTickets = [...tickets].sort((left, right) => right.updated_at.localeCompare(left.updated_at)).slice(0, 5);

    return (
        <div className="space-y-8">
            <header className="border-b border-zinc-800 pb-7">
                <Link className="text-xs uppercase tracking-[.16em] text-zinc-500 transition-colors hover:text-white" to={`/organisations/${organizationId}/projects/${projectId}/tickets`}>← Tickets</Link>
                <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                    <div><p className="text-[10px] uppercase tracking-[.22em] text-zinc-600">Project intelligence</p><h1 className="mt-3 text-4xl text-white">Project dashboard</h1><p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">A live read of the work moving through this project.</p></div>
                    <div className="text-right text-[10px] uppercase tracking-[.16em] text-zinc-600">{tickets.length} tracked<br />tickets</div>
                </div>
            </header>

            <div className="grid gap-px border border-zinc-800 bg-zinc-800 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardStat label="Open work" value={openTickets.length} detail={`${tickets.length ? Math.round((openTickets.length / tickets.length) * 100) : 0}% of queue`} icon={Circle} tone="text-sky-300" />
                <DashboardStat label="Completed" value={completedTickets.length} detail={`${tickets.length ? Math.round((completedTickets.length / tickets.length) * 100) : 0}% shipped`} icon={CheckCircle2} tone="text-emerald-300" />
                <DashboardStat label="Priority watch" value={urgentTickets.length} detail="P0 / P1 tickets" icon={Flame} tone="text-orange-300" />
                <DashboardStat label="Hours logged" value={loggedHours} detail="across all tickets" icon={Clock3} tone="text-violet-300" />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
                <section className="border border-zinc-800 bg-zinc-950/30 p-5">
                    <div className="flex items-end justify-between border-b border-zinc-800 pb-4"><div><p className="text-[10px] uppercase tracking-[.18em] text-zinc-600">Flow</p><h2 className="mt-2 text-lg text-zinc-100">Work by status</h2></div><span className="text-[10px] uppercase tracking-[.14em] text-zinc-600">{tickets.length} total</span></div>
                    <div className="mt-5 space-y-4">{statuses.map((status) => { const count = tickets.filter((ticket) => ticket.status === status).length; const config = statusConfig[status]; const StatusIcon = config.icon; return <div className="grid grid-cols-[8rem_1fr_2rem] items-center gap-3" key={status}><div className="flex items-center gap-2 text-[10px] uppercase tracking-[.12em] text-zinc-500"><StatusIcon className={`h-3 w-3 ${config.accent}`} />{status}</div><div className="h-1 bg-zinc-900"><div className={`h-full transition-all duration-500 ${statusBar[status]}`} style={{ width: `${(count / maxStatusCount) * 100}%` }} /></div><span className="text-right text-xs tabular-nums text-zinc-400">{count}</span></div>; })}</div>
                </section>
                <section className="border border-zinc-800 bg-zinc-950/30 p-5">
                    <div className="border-b border-zinc-800 pb-4"><p className="text-[10px] uppercase tracking-[.18em] text-zinc-600">Signal</p><h2 className="mt-2 text-lg text-zinc-100">Priority pressure</h2></div>
                    <div className="mt-5 grid grid-cols-5 gap-2">{(["P0", "P1", "P2", "P3", "P4"] as const).map((priority) => { const count = tickets.filter((ticket) => ticket.priority === priority).length; return <div className={`border p-3 ${priorityTone[priority].border} ${priorityTone[priority].bg}`} key={priority}><span className={`text-xs ${priorityTone[priority].text}`}>{priority}</span><p className="mt-4 text-2xl text-white">{count}</p><p className="mt-1 text-[9px] uppercase tracking-[.1em] text-zinc-600">{priorityTone[priority].label}</p></div>; })}</div>
                    <p className="mt-5 text-xs leading-5 text-zinc-600">{urgentTickets.length ? `${urgentTickets.length} ticket${urgentTickets.length === 1 ? "" : "s"} need${urgentTickets.length === 1 ? "s" : ""} priority attention.` : "No urgent tickets in the current queue."}</p>
                </section>
            </div>

            <section className="border border-zinc-800">
                <div className="flex items-end justify-between border-b border-zinc-800 px-5 py-4"><div><p className="text-[10px] uppercase tracking-[.18em] text-zinc-600">Recent activity</p><h2 className="mt-2 text-lg text-zinc-100">Recently updated</h2></div><Link className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[.14em] text-zinc-500 hover:text-white" to={`/organisations/${organizationId}/projects/${projectId}/tickets`}>View queue <ArrowUpRight className="h-3 w-3" /></Link></div>
                {recentTickets.length ? recentTickets.map((ticket) => <Link className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-zinc-800 px-5 py-4 last:border-b-0 hover:bg-zinc-900/50" key={ticket.id} to={`/organisations/${organizationId}/projects/${projectId}/tickets/${ticket.id}`}><span className={`h-1.5 w-1.5 rounded-full ${priorityTone[ticket.priority].dot}`} /><div className="min-w-0"><div className="flex gap-2 text-[10px] uppercase tracking-[.12em] text-zinc-600"><span>{ticket.ticket_number}</span><span>·</span><span>{ticket.type}</span></div><p className="mt-1 truncate text-sm text-zinc-200 group-hover:text-white">{ticket.title}</p></div><div className="text-right"><p className={`text-[10px] uppercase tracking-[.1em] ${statusConfig[ticket.status].accent}`}>{ticket.status}</p><p className="mt-1 text-[10px] text-zinc-700">{formatUpdated(ticket.updated_at)}</p></div></Link>) : <p className="p-8 text-center text-sm text-zinc-600">No ticket activity yet.</p>}
            </section>
        </div>
    );
}

const statusBar: Record<TicketStatus, string> = { "To Do": "bg-zinc-500", "In Progress": "bg-emerald-400", "In Review": "bg-sky-400", Testing: "bg-violet-400", Done: "bg-green-400", Closed: "bg-zinc-700" };
const priorityTone: Record<TicketPriority, { label: string; text: string; border: string; bg: string; dot: string }> = { P0: { label: "Critical", text: "text-red-300", border: "border-red-400/50", bg: "bg-red-950/20", dot: "bg-red-400" }, P1: { label: "Urgent", text: "text-orange-200", border: "border-orange-300/50", bg: "bg-orange-950/20", dot: "bg-orange-300" }, P2: { label: "High", text: "text-amber-200", border: "border-amber-300/50", bg: "bg-amber-950/20", dot: "bg-amber-300" }, P3: { label: "Normal", text: "text-sky-200", border: "border-sky-300/50", bg: "bg-sky-950/20", dot: "bg-sky-300" }, P4: { label: "Low", text: "text-zinc-400", border: "border-zinc-700", bg: "bg-zinc-950/30", dot: "bg-zinc-500" } };

function DashboardStat({ label, value, detail, icon: Icon, tone }: { label: string; value: number; detail: string; icon: typeof Circle; tone: string }) { return <section className="bg-[#0b0b0b] p-5"><div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[.16em] text-zinc-600">{label}</p><Icon className={`h-4 w-4 ${tone}`} /></div><p className="mt-5 text-3xl text-white">{value}</p><p className="mt-2 text-[11px] text-zinc-600">{detail}</p></section>; }
function formatUpdated(value: string) { const date = new Date(value); if (Number.isNaN(date.getTime())) return "Recently"; return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
