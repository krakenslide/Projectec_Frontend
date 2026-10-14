import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Flag, Loader2, Plus, X, ArrowUpRight } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { closestCorners, DndContext, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { getErrorMessage } from "../api/client";
import { createMilestone, getMilestoneProgress, listMilestoneSummary, listMilestoneTickets } from "../api/milestones";
import { updateTicket } from "../api/tickets";
import type { Milestone, MilestoneProgressPoint } from "../types/milestone";
import type { Ticket, TicketPriority, TicketStatus } from "../types/ticket";
import WorkOrbitLoader from "../components/ui/WorkOrbitLoader";

const statuses: TicketStatus[] = ["To Do", "In Progress", "In Review", "Testing", "Done", "Closed"];

export default function MilestonesPage() {
  const { organizationId, projectId } = useParams<{ organizationId: string; projectId: string }>();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    if (!projectId) return;
    setLoading(true); setError("");
    try { setMilestones(await listMilestoneSummary(projectId)); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [projectId]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectId || saving || !name.trim()) return;
    setSaving(true); setError("");
    try { await createMilestone(projectId, { name: name.trim() }); setName(""); setShowForm(false); await load(); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const totalTickets = milestones.reduce((sum, item) => sum + item.total_tickets, 0);
  const completedTickets = milestones.reduce((sum, item) => sum + item.completed_tickets, 0);
  const attention = milestones.filter((item) => milestoneHealth(item) === "AT RISK").length;

  return (
    <div className="pj-app-page pj-milestones space-y-0 font-['Inter',ui-sans-serif,sans-serif]">
      <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
        <Link className="text-[10px] uppercase tracking-[.2em] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white" to={`/organisations/${organizationId}/projects/${projectId}/tickets`}>← Tickets</Link>
        <div className="mt-7 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-pj-lime">DELIVERY ROADMAP</p>
            <h1 className="mt-3 font-['Instrument_Serif',Georgia,serif] text-5xl leading-[.92] tracking-tight text-zinc-900 dark:text-white sm:text-6xl">Deliver the outcome.</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">Track delivery against the plan, surface risk early, and see the work behind every milestone.</p>
          </div>
          <button className="inline-flex min-h-10 items-center justify-center gap-2 self-start border border-zinc-900 bg-zinc-900 px-4 text-[10px] font-semibold uppercase tracking-[.14em] text-white hover:bg-zinc-700 dark:border-white dark:bg-white dark:text-zinc-900" onClick={() => setShowForm((value) => !value)} type="button">
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{showForm ? "Close" : "New milestone"}
          </button>
        </div>
        <div className="mt-8 grid grid-cols-2 border-t border-zinc-200 pt-5 dark:border-zinc-800 sm:grid-cols-4">
          <RoadmapStat label="Milestones" value={milestones.length} />
          <RoadmapStat label="Tickets" value={totalTickets} />
          <RoadmapStat label="Delivered" value={completedTickets} accent="lime" />
          <RoadmapStat label="At risk" value={attention} accent={attention ? "yellow" : "lime"} />
        </div>
      </header>

      {showForm && <form className="border-b border-zinc-200 py-5 dark:border-zinc-800" onSubmit={submit}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 text-[10px] uppercase tracking-[.16em] text-zinc-500">Milestone name
            <input autoFocus className="mt-2 w-full border border-zinc-400 bg-transparent px-3 py-3 text-sm normal-case tracking-normal text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-600 dark:text-white dark:focus:border-white" minLength={1} onChange={(event) => setName(event.target.value)} placeholder="e.g. Beta launch" required value={name} />
          </label>
          <button className="inline-flex min-h-11 items-center justify-center gap-2 border border-zinc-900 px-5 text-[10px] font-semibold uppercase tracking-[.14em] text-zinc-900 dark:border-white dark:text-white" disabled={saving} type="submit">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{saving ? "Creating" : "Create milestone"}</button>
        </div>
      </form>}

      {error && <p className="border-y border-red-400/50 py-3 text-sm text-red-500 dark:text-red-300">{error}</p>}

      {loading ? <WorkOrbitLoader /> : milestones.length ? (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {milestones.map((milestone, index) => <MilestoneRow key={milestone.id} index={index + 1} milestone={milestone} open={expandedId === milestone.id} organizationId={organizationId} projectId={projectId} onToggle={() => setExpandedId((current) => current === milestone.id ? null : milestone.id)} />)}
        </div>
      ) : (
        <div className="py-20 text-center"><Flag className="mx-auto h-5 w-5 text-zinc-400" /><p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">No milestones yet.</p><p className="mt-1 text-xs text-zinc-500">Create one to start tracking delivery against a plan.</p></div>
      )}
    </div>
  );
}

function RoadmapStat({ label, value, accent = "neutral" }: { label: string; value: number; accent?: "lime" | "yellow" | "neutral" }) {
  return <div><p className="text-[9px] uppercase tracking-[.18em] text-zinc-500">{label}</p><p className={`mt-1 text-2xl tabular-nums ${accent === "lime" ? "text-pj-lime" : accent === "yellow" ? "text-pj-yellow" : "text-zinc-900 dark:text-white"}`}>{value}</p></div>;
}

function MilestoneRow({ milestone, open, organizationId, projectId, onToggle, index }: { milestone: Milestone; open: boolean; organizationId?: string; projectId?: string; onToggle: () => void; index: number }) {
  const health = milestoneHealth(milestone);
  const days = daysRemaining(milestone.expected_end_date);
  return <section className="pj-milestone-row">
    <button className="grid w-full gap-5 py-6 text-left lg:grid-cols-[minmax(0,1.4fr)_minmax(240px,.8fr)_auto] lg:items-center" onClick={onToggle} type="button">
      <div className="min-w-0">
        <div className="flex items-center gap-3"><span className="text-[9px] font-semibold tracking-[.16em] text-zinc-500">{String(index).padStart(2, "0")}</span><span className={`text-[9px] font-semibold uppercase tracking-[.14em] ${health === "ON TRACK" ? "text-pj-lime" : health === "AT RISK" ? "text-pj-yellow" : "text-zinc-500"}`}>{health}</span></div>
        <h2 className="mt-2 truncate font-['Instrument_Serif',Georgia,serif] text-3xl text-zinc-900 dark:text-white sm:text-4xl">{milestone.name}</h2>
        <p className="mt-2 text-[10px] uppercase tracking-[.12em] text-zinc-500">{formatWindow(milestone.expected_start_date, milestone.expected_end_date)} {days !== null && <span>· {days > 0 ? `${days} days left` : days === 0 ? "Due today" : `${Math.abs(days)} days overdue`}</span>}</p>
      </div>
      <div>
        <div className="flex items-end justify-between"><span className="text-[9px] uppercase tracking-[.14em] text-zinc-500">Delivery</span><span className="text-2xl tabular-nums text-zinc-900 dark:text-white">{milestone.progress_percentage}%</span></div>
        <div className="mt-3 h-1 bg-zinc-200 dark:bg-zinc-800"><div className={`h-full ${progressColor(milestone.progress_percentage)}`} style={{ width: `${Math.min(100, Math.max(0, milestone.progress_percentage))}%` }} /></div>
        <p className="mt-2 text-[9px] uppercase tracking-[.1em] text-zinc-500">{milestone.completed_tickets} / {milestone.total_tickets} tickets delivered</p>
      </div>
      <ChevronDown className={`h-4 w-4 justify-self-start text-zinc-500 transition-transform lg:justify-self-end ${open ? "rotate-180" : ""}`} />
    </button>
    {open && <div className="border-t border-zinc-200 pb-8 pt-7 dark:border-zinc-800"><MilestoneDetail milestone={milestone} organizationId={organizationId} projectId={projectId} /></div>}
  </section>;
}

function MilestoneDetail({ milestone, organizationId, projectId }: { milestone: Milestone; organizationId?: string; projectId?: string }) {
  const [progress, setProgress] = useState<MilestoneProgressPoint[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;
    setLoadingProgress(true); setLoadingTickets(true); setError("");
    void getMilestoneProgress(projectId, milestone.id).then(setProgress).catch((err) => setError(getErrorMessage(err))).finally(() => setLoadingProgress(false));
    void listMilestoneTickets(projectId, milestone.id).then(setTickets).catch((err) => setError(getErrorMessage(err))).finally(() => setLoadingTickets(false));
  }, [projectId, milestone.id]);

  const chartData = useMemo(() => progress.map((point) => ({ date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }), Expected: point.expected_percentage, Actual: point.actual_percentage })), [progress]);
  const attention = tickets.filter((ticket) => !["Done", "Closed"].includes(ticket.status) && ["P0", "P1"].includes(ticket.priority));
  const active = tickets.filter((ticket) => ["In Progress", "In Review", "Testing"].includes(ticket.status)).length;
  const moveTicket = async (ticket: Ticket, status: TicketStatus) => {
    if (ticket.status === status) return;
    const previous = tickets; setTickets((items) => items.map((item) => item.id === ticket.id ? { ...item, status } : item));
    try { await updateTicket(ticket.id, { status }); } catch (err) { setTickets(previous); setError(`Could not move ${ticket.ticket_number}: ${getErrorMessage(err)}`); }
  };

  return (
    <div className="space-y-8">
      {error && <p className="border-y border-red-400/50 py-3 text-sm text-red-500 dark:text-red-300">{error}</p>}
      <div>
        <p className="text-[10px] uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-400">
          Expected vs actual progress
        </p>
        {loadingProgress ? (
          <ProjectecLoader />
        ) : chartData.length ? (
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid stroke="currentColor" strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="date" fontSize={11} stroke="currentColor" strokeOpacity={0.5} tickLine={false} />
                <YAxis domain={[0, 100]} fontSize={11} stroke="currentColor" strokeOpacity={0.5} tickFormatter={(v) => `${v}%`} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--pj-tooltip-bg, #111)", border: "1px solid #333", fontSize: 12 }}
                  formatter={(value) => `${value ?? 0}%`}
                />
                <Line dataKey="Expected" dot={false} stroke="#a1a1aa" strokeDasharray="4 4" strokeWidth={2} type="monotone" />
                <Line dataKey="Actual" dot={{ r: 3 }} stroke="#10b981" strokeWidth={2} type="monotone" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">No progress history yet.</p>
        )}
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-400">
          Milestone tickets ({tickets.length})
        </p>
        {loadingTickets ? (
          <ProjectecLoader />
        ) : tickets.length ? (
          <MilestoneKanban organizationId={organizationId} tickets={tickets} onMove={moveTicket} />
        ) : (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">No tickets linked to this milestone yet.</p>
        )}
      </div>
    </div>
    <section><div className="flex items-end justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800"><div><p className="text-[9px] font-semibold uppercase tracking-[.18em] text-zinc-500">Work contributing to this milestone</p><h3 className="mt-2 font-['Instrument_Serif',Georgia,serif] text-3xl text-zinc-900 dark:text-white">Delivery board</h3></div><span className="text-[10px] uppercase tracking-[.12em] text-zinc-500">{tickets.length} tickets</span></div>{loadingTickets ? <WorkOrbitLoader /> : tickets.length ? <MilestoneKanban tickets={tickets} onMove={moveTicket} /> : <p className="py-10 text-sm text-zinc-500">No tickets linked to this milestone yet.</p>}</section>
  </div>;
}

function DetailStat({ label, value, accent = "neutral" }: { label: string; value: number; accent?: "lime" | "yellow" | "neutral" }) { return <div><p className="text-[9px] uppercase tracking-[.14em] text-zinc-500">{label}</p><p className={`mt-1 text-xl tabular-nums ${accent === "lime" ? "text-pj-lime" : accent === "yellow" ? "text-pj-yellow" : "text-zinc-900 dark:text-white"}`}>{value}</p></div>; }

function MilestoneKanban({ tickets, onMove }: { tickets: Ticket[]; onMove: (ticket: Ticket, status: TicketStatus) => void }) {
  const [overStatus, setOverStatus] = useState<TicketStatus | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor));
  const handleDragEnd = (event: DragEndEvent) => { const ticket = tickets.find((item) => item.id === event.active.id); const status = statuses.find((item) => item === event.over?.id); setOverStatus(null); if (ticket && status) void onMove(ticket, status); };
  return <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd} onDragOver={(event) => setOverStatus(statuses.find((status) => status === event.over?.id) ?? null)} sensors={sensors}><div className="pj-scrollbar mt-5 w-full overflow-x-auto pb-5"><div className="grid min-w-[1080px] grid-cols-6 gap-3">{statuses.map((status) => <MiniColumn key={status} status={status} tickets={tickets.filter((ticket) => ticket.status === status)} isOver={overStatus === status} />)}</div></div></DndContext>;
}

function MiniColumn({ status, tickets, isOver }: { status: TicketStatus; tickets: Ticket[]; isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: status });
  return <section ref={setNodeRef} className={`pj-milestone-column ${isOver ? "pj-milestone-column-over" : ""}`}><header className="border-b border-zinc-200 px-3 py-3 dark:border-zinc-800"><div className="flex items-center justify-between"><h4 className="text-[9px] font-semibold uppercase tracking-[.14em] text-zinc-700 dark:text-zinc-200">{status}</h4><span className="text-[10px] tabular-nums text-zinc-500">{tickets.length}</span></div></header><div className="space-y-2 p-2">{tickets.map((ticket) => <MiniTicket key={ticket.id} ticket={ticket} />)}{!tickets.length && <div className="flex min-h-16 items-center justify-center border border-dashed border-zinc-200 text-[9px] uppercase tracking-[.1em] text-zinc-500 dark:border-zinc-800">{isOver ? "Drop here" : "Clear"}</div>}</div></section>;
}

function MiniTicket({ ticket }: { ticket: Ticket }) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: ticket.id });
  return <div ref={setNodeRef} {...listeners} {...attributes} style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }} className={isDragging ? "opacity-25" : ""}><article className="pj-milestone-ticket" onDoubleClick={() => navigate(`/organisations/${ticket.organization_id}/projects/${ticket.project_id}/tickets/${ticket.id}`)}><div className="flex items-center gap-2"><span className={`text-[9px] font-semibold ${priorityClass(ticket.priority)}`}>{ticket.priority}</span><span className="text-[9px] uppercase tracking-[.1em] text-zinc-500">{ticket.ticket_number}</span></div><h5 className="mt-2 line-clamp-2 text-[12px] leading-4 text-zinc-900 dark:text-zinc-100">{ticket.title}</h5><p className="mt-3 truncate text-[9px] uppercase tracking-[.08em] text-zinc-500">{ticket.assigned_to || "Unassigned"}</p></article></div>;
}

function priorityClass(priority: TicketPriority) { return priority === "P0" ? "text-pj-red" : priority === "P1" ? "text-pj-yellow" : priority === "P2" ? "text-amber-500 dark:text-amber-300" : "text-zinc-500"; }
function progressColor(pct: number) { if (pct >= 100) return "bg-pj-lime"; if (pct > 0) return pct < 50 ? "bg-pj-yellow" : "bg-pj-lime"; return "bg-zinc-400 dark:bg-zinc-600"; }
function formatWindow(start: string | null, end: string | null) { if (!start && !end) return "No dates set"; const fmt = (value: string | null) => value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"; return `${fmt(start)} → ${fmt(end)}`; }
function daysRemaining(end: string | null) { if (!end) return null; return Math.ceil((new Date(end).getTime() - Date.now()) / 86400000); }
function milestoneHealth(milestone: Milestone) { if (milestone.progress_percentage >= 100) return "COMPLETE"; const days = daysRemaining(milestone.expected_end_date); if (days !== null && days < 0) return "AT RISK"; if (days !== null && days <= 3 && milestone.progress_percentage < 80) return "AT RISK"; return "ON TRACK"; }
