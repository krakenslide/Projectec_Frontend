import { useEffect, useState } from "react";
import {
    ArrowUpRight,
    Archive,
    CheckCircle2,
    Circle,
    ClipboardCheck,
    Eye,
    LoaderCircle,
} from "lucide-react";
import {
    pointerWithin,
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
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
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
        setOverStatus(event.over ? statuses.find((status) => status === event.over?.id) ?? null : null);
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

    const openCount = tickets.filter((ticket) => !["Done", "Closed"].includes(ticket.status)).length;
    const activeCount = tickets.filter((ticket) => ["In Progress", "In Review", "Testing"].includes(ticket.status)).length;
    const reviewCount = tickets.filter((ticket) => ticket.status === "In Review").length;
    const attentionCount = tickets.filter((ticket) => !["Done", "Closed"].includes(ticket.status) && ["P0", "P1"].includes(ticket.priority)).length;

    return (
        <div className="pj-app-page pj-board space-y-0 font-['Inter',ui-sans-serif,sans-serif">
            <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
                <Link className="text-[10px] uppercase tracking-[.2em] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white" to={`/organisations/${organizationId}/projects/${projectId}/tickets`}>← Tickets</Link>
                <div className="mt-7 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-pj-lime">PROJECT WORKFLOW</p>
                        <h1 className="mt-3 font-['Instrument_Serif',Georgia,serif] text-5xl leading-[.92] tracking-tight text-zinc-900 dark:text-white sm:text-6xl">Move work forward.</h1>
                        <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">A live view of the queue — where work is waiting, moving, being reviewed, and shipped.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-7 gap-y-3 sm:grid-cols-4 lg:text-right">
                        <BoardStat label="Open" value={openCount} />
                        <BoardStat label="Active" value={activeCount} accent="lime" />
                        <BoardStat label="Review" value={reviewCount} />
                        <BoardStat label="Attention" value={attentionCount} accent={attentionCount ? "yellow" : "lime"} />
                    </div>
                </div>
            </header>

            {error && <p className="border-y border-red-400/50 py-3 text-sm text-red-500 dark:text-red-300">{error}</p>}

            <div className="border-b border-zinc-200 py-5 dark:border-zinc-800">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="pj-board-chip pj-board-chip-active">ALL WORK</span>
                    <span className="pj-board-chip">MY WORK</span>
                    <span className="pj-board-chip">P1 / P2</span>
                    <span className="pj-board-chip">UNASSIGNED</span>
                </div>
                <p className="mt-3 text-[10px] uppercase tracking-[.16em] text-zinc-500 dark:text-zinc-500">Drag a ticket between columns to change its status</p>
            </div>

            <DndContext
                collisionDetection={pointerWithin}
                onDragCancel={() => { setActiveTicket(null); setOverStatus(null); }}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragStart={handleDragStart}
                sensors={sensors}
            >
                <div className="pj-scrollbar w-full min-w-0 overflow-x-auto overflow-y-visible pb-8 pt-7">
                    <div className="grid min-w-[1180px] grid-cols-6 items-start gap-3">
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
    const wipLimit: Partial<Record<TicketStatus, number>> = { "In Progress": 6, "In Review": 4, Testing: 5 };
    const limit = wipLimit[status];
    const overLimit = Boolean(limit && tickets.length > limit);

    return (
        <section ref={setNodeRef} className={`pj-board-column ${isOver ? "pj-board-column-over" : ""}`}>
            <header className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] tracking-[.16em] text-zinc-500">{config.number}</span>
                    <StatusIcon className={`h-3.5 w-3.5 ${config.accent} ${status === "In Progress" ? "animate-spin" : ""}`} />
                    <h2 className="text-[10px] font-semibold uppercase tracking-[.16em] text-zinc-800 dark:text-zinc-100">{status}</h2>
                    <span className="ml-auto text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">{tickets.length}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                    <p className="text-[9px] uppercase tracking-[.12em] text-zinc-500">{columnSubtitle(status)}</p>
                    {limit && <span className={`text-[9px] uppercase tracking-[.1em] ${overLimit ? "text-pj-yellow" : "text-zinc-500"}`}>{tickets.length} / {limit}</span>}
                </div>
                {limit && <div className="mt-2 h-0.5 bg-zinc-200 dark:bg-zinc-800"><div className={`h-full ${overLimit ? "bg-pj-yellow" : "bg-pj-lime"}`} style={{ width: `${Math.min((tickets.length / limit) * 100, 100)}%` }} /></div>}
            </header>
            <div className={`space-y-2 p-2.5 transition-colors duration-200 ${isOver ? "bg-pj-panel-raised" : ""}`}>
                {tickets.map((ticket) => <DraggableTicket key={ticket.id} ticket={ticket} />)}
                {!tickets.length && (
                    <div className={`flex min-h-24 items-center justify-center border border-dashed px-3 text-center text-[9px] uppercase tracking-[.14em] ${isOver ? "border-pj-lime text-pj-lime" : "border-zinc-200 text-zinc-500 dark:border-zinc-800"}`}>
                        {isOver ? "Drop ticket here" : "Clear"}
                    </div>
                )}
            </div>
        </section>
    );
}

function columnSubtitle(status: TicketStatus) {
    const labels: Record<TicketStatus, string> = {
        "To Do": "Ready to start",
        "In Progress": "Currently moving",
        "In Review": "Waiting for validation",
        Testing: "Being verified",
        Done: "Delivered",
        Closed: "Archived",
    };
    return labels[status];
}

function DashboardView({ organizationId, projectId, tickets }: { organizationId?: string; projectId?: string; tickets: Ticket[] }) {
    const navigate = useNavigate();
    const openTickets = tickets.filter((ticket) => !["Done", "Closed"].includes(ticket.status));
    const completedTickets = tickets.filter((ticket) => ["Done", "Closed"].includes(ticket.status));
    const activeTickets = tickets.filter((ticket) => ["In Progress", "In Review", "Testing"].includes(ticket.status));
    const urgentTickets = tickets.filter((ticket) => !["Done", "Closed"].includes(ticket.status) && ["P0", "P1"].includes(ticket.priority));
    const delayedTickets = tickets.filter((ticket) => ticket.expected_end_date && !["Done", "Closed"].includes(ticket.status) && new Date(ticket.expected_end_date).getTime() < Date.now());
    const loggedHours = tickets.reduce((total, ticket) => total + (ticket.hours_logged ?? 0), 0);
    const recentTickets = [...tickets].sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()).slice(0, 6);
    const completedPercent = tickets.length ? Math.round((completedTickets.length / tickets.length) * 100) : 0;
    const activePercent = tickets.length ? Math.round((activeTickets.length / tickets.length) * 100) : 0;
    const health = tickets.length === 0 ? "NO DATA" : urgentTickets.length === 0 && delayedTickets.length === 0 ? "HEALTHY" : urgentTickets.length + delayedTickets.length <= 2 ? "WATCH" : "AT RISK";
    const healthTone = health === "HEALTHY" ? "pj-dashboard-lime" : health === "WATCH" ? "pj-dashboard-yellow" : health === "AT RISK" ? "pj-dashboard-red" : "pj-dashboard-muted";
    const maxStatusCount = Math.max(...statuses.map((status) => tickets.filter((ticket) => ticket.status === status).length), 1);
    const totalHours = Number(loggedHours.toFixed(1));
    const statusData = statuses.map((status) => ({ status, count: tickets.filter((ticket) => ticket.status === status).length }));
    const priorityData = (["P0", "P1", "P2", "P3", "P4"] as TicketPriority[]).map((priority) => ({ priority, count: tickets.filter((ticket) => ticket.priority === priority).length }));
    const maxPriorityCount = Math.max(...priorityData.map((item) => item.count), 1);

    const goTickets = (query = "") => navigate(`/organisations/${organizationId}/projects/${projectId}/tickets${query}`);
    const projectMessage = !tickets.length
        ? "There is no ticket activity in this project yet. Create the first piece of work to start the flow."
        : delayedTickets.length
            ? `${delayedTickets.length} open item${delayedTickets.length === 1 ? " is" : "s are"} past the expected end date${urgentTickets.length ? `, and ${urgentTickets.length} high-priority item${urgentTickets.length === 1 ? " needs" : "s need"} attention.` : "."}`
            : urgentTickets.length
                ? `${urgentTickets.length} high-priority item${urgentTickets.length === 1 ? " is" : "s are"} currently shaping the queue.`
                : activeTickets.length
                    ? `${activeTickets.length} item${activeTickets.length === 1 ? " is" : "s are"} actively moving through the workflow.`
                    : `${completedTickets.length} of ${tickets.length} tracked item${tickets.length === 1 ? " has" : "s have"} been delivered or closed.`;

    return (
        <div className="pj-app-page pj-dashboard space-y-0 font-['Inter',ui-sans-serif,sans-serif">
            <header className="border-b border-pj pb-9">
                <div className="flex items-start justify-between gap-6">
                    <div>
                        <Link className="pj-dashboard-eyebrow transition-colors hover:text-pj" to={`/organisations/${organizationId}/projects/${projectId}/tickets`}>LIVE PROJECT VIEW</Link>
                        <h1 className="mt-5 max-w-3xl font-pj-serif text-6xl leading-[.88] tracking-[-.025em] text-pj sm:text-7xl">{tickets.length ? `${openTickets.length} items still moving.` : "Start the flow."}</h1>
                        <p className="mt-5 max-w-xl text-sm leading-7 text-pj-muted">{projectMessage}</p>
                    </div>
                    <div className="hidden text-right sm:block">
                        <p className="pj-dashboard-eyebrow">LIVE HEALTH</p>
                        <p className={`mt-3 text-xs font-semibold tracking-[.16em] ${healthTone}`}>● {health}</p>
                    </div>
                </div>

                <div className="mt-10 grid grid-cols-2 border-y border-pj sm:grid-cols-4">
                    <DashboardMetric label="Open" value={openTickets.length} detail={`${activePercent}% actively moving`} accent="lime" onClick={() => goTickets()} />
                    <DashboardMetric label="Delivered" value={`${completedPercent}%`} detail={`${completedTickets.length} completed / closed`} accent="lime" onClick={() => goTickets("?status=Done")} />
                    <DashboardMetric label="Attention" value={urgentTickets.length} detail={`${delayedTickets.length} delayed`} accent="yellow" onClick={() => goTickets("?priority=P0")} />
                    <DashboardMetric label="Logged" value={`${totalHours}h`} detail={`${tickets.length} tracked tickets`} accent="neutral" onClick={() => goTickets()} />
                </div>
            </header>

            <section className="border-b border-pj py-9">
                <div className="flex items-end justify-between gap-4">
                    <div><p className="pj-dashboard-eyebrow">01 / FLOW</p><h2 className="mt-3 font-pj-serif text-4xl leading-none text-pj">Where work is now.</h2></div>
                    <span className="text-[10px] uppercase tracking-[.14em] text-pj-dim">{tickets.length} total · {openTickets.length} open</span>
                </div>
                <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
                    <div className="space-y-5">
                        {statusData.map(({ status, count }) => {
                            const config = statusConfig[status];
                            const StatusIcon = config.icon;
                            return <button key={status} type="button" onClick={() => goTickets(`?status=${encodeURIComponent(status)}`)} className="group grid w-full grid-cols-[7rem_1fr_2.5rem] items-center gap-4 text-left sm:grid-cols-[9rem_1fr_3rem]">
                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.14em] text-pj-muted"><StatusIcon className={`h-3 w-3 ${config.accent}`} />{status}</div>
                                <div className="h-2 bg-pj-panel-muted"><div className={`h-full ${statusBar[status]} transition-all duration-700`} style={{ width: `${(count / maxStatusCount) * 100}%` }} /></div>
                                <span className="text-right font-pj-mono text-xs tabular-nums text-pj-muted group-hover:text-pj">{count}</span>
                            </button>;
                        })}
                    </div>
                    <div className="border border-pj bg-pj-panel p-6">
                        <div className="flex items-end justify-between"><div><p className="pj-dashboard-eyebrow">PRIORITY MIX</p><p className="mt-2 text-xs text-pj-muted">Current ticket distribution</p></div><span className="font-pj-mono text-[10px] text-pj-dim">{tickets.length} TOTAL</span></div>
                        <div className="mt-7 space-y-4">
                            {priorityData.map(({ priority, count }) => <button key={priority} type="button" onClick={() => goTickets(`?priority=${priority}`)} className="group grid w-full grid-cols-[2rem_1fr_2rem] items-center gap-3 text-left"><span className={`font-pj-mono text-[10px] ${priority === "P0" ? "text-pj-red" : priority === "P1" ? "text-pj-yellow" : priority === "P2" ? "text-pj-yellow" : "text-pj-muted"}`}>{priority}</span><div className="h-1.5 bg-pj-panel-muted"><div className={`h-full ${priority === "P0" ? "bg-pj-red" : priority === "P1" || priority === "P2" ? "bg-pj-yellow" : priority === "P3" ? "bg-pj-lime" : "bg-pj-muted"}`} style={{ width: `${(count / maxPriorityCount) * 100}%` }} /></div><span className="text-right font-pj-mono text-[10px] text-pj-dim group-hover:text-pj">{count}</span></button>)}
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid border-b border-pj lg:grid-cols-[1.2fr_.8fr]">
                <div className="border-b border-pj py-9 lg:border-b-0 lg:border-r lg:pr-10">
                    <div className="flex items-end justify-between gap-4"><div><p className="pj-dashboard-eyebrow">02 / MOVEMENT</p><h2 className="mt-3 font-pj-serif text-4xl leading-none text-pj">Latest changes.</h2></div><Link className="pj-dashboard-link" to={`/organisations/${organizationId}/projects/${projectId}/tickets`}>All work <ArrowUpRight className="h-3.5 w-3.5" /></Link></div>
                    <div className="mt-7">{recentTickets.length ? recentTickets.map((ticket, index) => <Link key={ticket.id} to={`/organisations/${organizationId}/projects/${projectId}/tickets/${ticket.id}`} className="group grid grid-cols-[2.5rem_1fr_auto] gap-4 border-t border-pj py-5 last:border-b"><span className="font-pj-mono text-[10px] text-pj-dim">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[.13em] text-pj-dim"><span>{ticket.ticket_number}</span><span>·</span><span>{ticket.type}</span></div><p className="mt-1 truncate text-sm text-pj group-hover:text-pj-lime">{ticket.title}</p></div><div className="text-right"><p className={`text-[9px] uppercase tracking-[.12em] ${ticket.status === "Done" || ticket.status === "Closed" ? "text-pj-lime" : ticket.priority === "P0" || ticket.priority === "P1" ? "text-pj-yellow" : "text-pj-muted"}`}>{ticket.status}</p><p className="mt-1 text-[9px] text-pj-dim">{formatUpdated(ticket.updated_at)}</p></div></Link>) : <p className="border-t border-pj py-8 text-sm text-pj-muted">No ticket movement has been recorded yet.</p>}</div>
                </div>
                <div className="py-9 lg:pl-10">
                    <p className="pj-dashboard-eyebrow">03 / SIGNALS</p><h2 className="mt-3 font-pj-serif text-4xl leading-none text-pj">What the data says.</h2>
                    <div className="mt-7 space-y-0 border-t border-pj">
                        <SignalLine label="Active flow" value={activeTickets.length} detail={activeTickets.length ? `${activePercent}% of all tracked work is active.` : "Nothing is currently in an active workflow state."} tone="lime" />
                        <SignalLine label="Delayed" value={delayedTickets.length} detail={delayedTickets.length ? `${delayedTickets.length} open item${delayedTickets.length === 1 ? " is" : "s are"} past its expected end date.` : "No open ticket is currently past its expected end date."} tone={delayedTickets.length ? "yellow" : "lime"} />
                        <SignalLine label="Delivery" value={`${completedPercent}%`} detail={tickets.length ? `${completedTickets.length} of ${tickets.length} tracked tickets are delivered or closed.` : "Delivery percentage will appear once tickets exist."} tone="lime" />
                        <SignalLine label="Effort" value={`${totalHours}h`} detail={loggedHours ? "Total hours logged across the tickets currently returned by the API." : "No logged hours have been returned for this project."} tone="neutral" />
                    </div>
                </div>
            </section>

            <section className="py-9">
                <div className="flex items-end justify-between gap-4"><div><p className="pj-dashboard-eyebrow">04 / NEXT MOVE</p><h2 className="mt-3 font-pj-serif text-4xl leading-none text-pj">What deserves attention.</h2></div><span className="text-[10px] uppercase tracking-[.14em] text-pj-dim">Derived from live ticket data</span></div>
                <div className="mt-7 grid gap-px border border-pj bg-pj-border md:grid-cols-3">
                    <SignalCard index="01" title="Priority" value={urgentTickets.length} description={urgentTickets.length ? `${urgentTickets.length} open P0/P1 ticket${urgentTickets.length === 1 ? " is" : "s are"} asking for attention.` : "There are no open P0/P1 tickets right now."} tone="yellow" onClick={() => goTickets("?priority=P0")} />
                    <SignalCard index="02" title="Delay" value={delayedTickets.length} description={delayedTickets.length ? `${delayedTickets.length} open ticket${delayedTickets.length === 1 ? " has" : "s have"} passed its expected end date.` : "No open ticket has passed its expected end date."} tone={delayedTickets.length ? "yellow" : "lime"} onClick={() => goTickets()} />
                    <SignalCard index="03" title="Coverage" value={`${tickets.length}`} description={`${activeTickets.length} active, ${completedTickets.length} delivered, ${openTickets.length} still open.`} tone="neutral" onClick={() => goTickets()} />
                </div>
            </section>
        </div>
    );
}

function SignalLine({ label, value, detail, tone }: { label: string; value: number | string; detail: string; tone: "lime" | "yellow" | "neutral" }) {
    return <div className="grid grid-cols-[5.5rem_4rem_1fr] gap-4 border-b border-pj py-5 last:border-b-0 sm:grid-cols-[7rem_5rem_1fr]"><span className="pj-dashboard-eyebrow self-start">{label}</span><span className={`font-pj-serif text-3xl leading-none ${tone === "lime" ? "text-pj-lime" : tone === "yellow" ? "text-pj-yellow" : "text-pj"}`}>{value}</span><p className="text-xs leading-5 text-pj-muted">{detail}</p></div>;
}

function DashboardMetric({ label, value, detail, accent, onClick }: { label: string; value: number | string; detail: string; accent: "lime" | "yellow" | "neutral"; onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} className="group border-r border-pj px-4 py-6 text-left transition-colors last:border-r-0 hover:bg-pj-lime-soft sm:px-6 sm:py-7">
            <p className="pj-dashboard-eyebrow">{label}</p>
            <p className={`mt-4 font-pj-serif text-5xl leading-none ${accent === "lime" ? "text-pj-lime" : accent === "yellow" ? "text-pj-yellow" : "text-pj"}`}>{value}</p>
            <p className="mt-3 text-[10px] uppercase tracking-[.1em] text-pj-dim group-hover:text-pj-muted">{detail}</p>
        </button>
    );
}

function HealthRow({ label, value, tone }: { label: string; value: number; tone: "lime" | "yellow" | "neutral" }) {
    return (
        <div className="flex items-center justify-between border-b border-pj pb-3 text-[10px] uppercase tracking-[.12em] last:border-b-0 last:pb-0">
            <span className="text-pj-muted">{label}</span>
            <span className={tone === "lime" ? "text-pj-lime" : tone === "yellow" ? "text-pj-yellow" : "text-pj"}>{value}</span>
        </div>
    );
}

function SignalCard({ index, title, value, description, tone, onClick }: { index: string; title: string; value: number | string; description: string; tone: "lime" | "yellow" | "neutral"; onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} className="group bg-pj-panel p-6 text-left transition-colors hover:bg-pj-panel-raised sm:p-7">
            <div className="flex items-center justify-between">
                <span className="font-pj-mono text-[10px] text-pj-dim">{index}</span>
                <span className={`h-1.5 w-1.5 ${tone === "lime" ? "bg-pj-lime" : tone === "yellow" ? "bg-pj-yellow" : "bg-pj-muted"}`} />
            </div>
            <p className="mt-9 pj-dashboard-eyebrow">{title}</p>
            <p className={`mt-3 font-pj-serif text-5xl ${tone === "lime" ? "text-pj-lime" : tone === "yellow" ? "text-pj-yellow" : "text-pj"}`}>{value}</p>
            <p className="mt-3 max-w-xs text-xs leading-6 text-pj-muted">{description}</p>
            <span className="mt-7 inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.14em] text-pj-dim group-hover:text-pj">Explore <ArrowUpRight className="h-3 w-3" /></span>
        </button>
    );
}

function BoardStat({ label, value, accent = "neutral" }: { label: string; value: number; accent?: "lime" | "yellow" | "neutral" }) {
    return <div><p className="text-[9px] uppercase tracking-[.18em] text-zinc-500 dark:text-zinc-500">{label}</p><p className={`mt-1 text-2xl tabular-nums ${accent === "lime" ? "text-pj-lime" : accent === "yellow" ? "text-pj-yellow" : "text-zinc-900 dark:text-white"}`}>{value}</p></div>;
}

function DraggableTicket({ ticket }: { ticket: Ticket }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: ticket.id });
    return (
        <div ref={setNodeRef} {...listeners} {...attributes} style={{ transform: !isDragging && transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }} className={isDragging ? "opacity-0" : ""}>
            <TicketCard ticket={ticket} />
        </div>
    );
}

function TicketCard({ ticket, dragging = false }: { ticket: Ticket; dragging?: boolean }) {
    const navigate = useNavigate();
    const priorityClass = ticket.priority === "P0" ? "text-pj-red" : ticket.priority === "P1" ? "text-pj-yellow" : ticket.priority === "P2" ? "text-amber-500 dark:text-amber-300" : "text-zinc-500 dark:text-zinc-400";
    return (
        <article
            className={`pj-board-ticket ${dragging ? "pj-board-ticket-dragging" : ""}`}
            onDoubleClick={() => navigate(`/organisations/${ticket.organization_id}/projects/${ticket.project_id}/tickets/${ticket.id}`)}
            title="Double-click to open"
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2"><span className={`text-[9px] font-semibold uppercase tracking-[.12em] ${priorityClass}`}>{ticket.priority}</span><p className="text-[9px] uppercase tracking-[.1em] text-zinc-500">{ticket.ticket_number}</p></div>
                <span className="text-[9px] text-zinc-500">{ticket.type}</span>
            </div>
            <h3 className="mt-3 text-[13px] leading-5 text-zinc-900 dark:text-zinc-100">{ticket.title}</h3>
            <div className="mt-4 flex items-center justify-between gap-3 text-[9px] uppercase tracking-[.1em] text-zinc-500">
                <span className="truncate">{ticket.assigned_to || "Unassigned"}</span>
                <span className="shrink-0">{ticket.status === "Done" || ticket.status === "Closed" ? "Delivered" : "Open"}</span>
            </div>
        </article>
    );
}

const statusBar: Record<TicketStatus, string> = {
    "To Do": "bg-zinc-400 dark:bg-zinc-600",
    "In Progress": "bg-pj-yellow",
    "In Review": "bg-zinc-500 dark:bg-zinc-400",
    Testing: "bg-pj-yellow",
    Done: "bg-pj-lime",
    Closed: "bg-zinc-300 dark:bg-zinc-700",
};

const priorityTone: Record<TicketPriority, { label: string; text: string; border: string; bg: string; dot: string }> = {
    P0: { label: "Critical", text: "pj-priority-p0", border: "pj-priority-p0", bg: "pj-priority-p0", dot: "bg-red-600 dark:bg-red-400" },
    P1: { label: "Urgent", text: "pj-priority-p1", border: "pj-priority-p1", bg: "pj-priority-p1", dot: "bg-orange-600 dark:bg-orange-300" },
    P2: { label: "High", text: "pj-priority-p2", border: "pj-priority-p2", bg: "pj-priority-p2", dot: "bg-amber-600 dark:bg-amber-300" },
    P3: { label: "Normal", text: "pj-priority-p3", border: "pj-priority-p3", bg: "pj-priority-p3", dot: "bg-sky-600 dark:bg-sky-300" },
    P4: { label: "Low", text: "pj-priority-p4", border: "pj-priority-p4", bg: "pj-priority-p4", dot: "bg-zinc-500" },
};

function formatUpdated(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Recently";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
