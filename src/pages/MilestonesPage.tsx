import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronDown, Flag, Loader2, Plus, X } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { getErrorMessage } from "../api/client";
import {
  createMilestone,
  getMilestoneProgress,
  listMilestoneSummary,
  listMilestoneTickets,
} from "../api/milestones";
import { updateTicket } from "../api/tickets";
import type { Milestone, MilestoneProgressPoint } from "../types/milestone";
import type { Ticket, TicketPriority, TicketStatus } from "../types/ticket";
import ProjectecLoader from "../components/ui/ProjectecLoader";

const statuses: TicketStatus[] = ["To Do", "In Progress", "In Review", "Testing", "Done", "Closed"];

const priorityTone: Record<TicketPriority, string> = {
  P0: "border-red-400/50 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-300",
  P1: "border-orange-300/50 bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-200",
  P2: "border-amber-300/50 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-200",
  P3: "border-sky-300/50 bg-sky-50 text-sky-700 dark:bg-sky-950/20 dark:text-sky-200",
  P4: "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950/30 text-zinc-600 dark:text-zinc-300",
};

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
    setLoading(true);
    setError("");
    try {
      setMilestones(await listMilestoneSummary(projectId));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [projectId]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectId || saving || !name.trim()) return;
    setSaving(true);
    setError("");
    try {
      await createMilestone(projectId, { name: name.trim() });
      setName("");
      setShowForm(false);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 font-['Inter',ui-sans-serif,sans-serif]">
      <header className="border-b border-zinc-200 pb-7 dark:border-zinc-800">
        <Link
          className="text-xs uppercase tracking-[.16em] text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          to={`/organisations/${organizationId}/projects/${projectId}/tickets`}
        >
          ← Tickets
        </Link>
        <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[.22em] text-zinc-600 dark:text-zinc-300">
              Delivery tracking
            </p>
            <h1 className="mt-3 font-['Instrument_Serif',Georgia,serif] text-5xl leading-none text-zinc-900 dark:text-white">
              Milestones
            </h1>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              {milestones.length} milestone{milestones.length === 1 ? "" : "s"} tracked for this project
            </p>
          </div>
          <button
            className="inline-flex min-h-10 items-center gap-2 border border-zinc-900 bg-zinc-900 px-4 text-[11px] uppercase tracking-[.14em] text-white transition-colors hover:bg-zinc-700 dark:border-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            onClick={() => setShowForm((value) => !value)}
            type="button"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Close" : "New milestone"}
          </button>
        </div>
      </header>

      {showForm && (
        <form
          className="flex flex-wrap items-end gap-4 border border-zinc-300 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950/40"
          onSubmit={submit}
        >
          <label className="flex-1 text-[10px] uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-300">
            Milestone name
            <input
              autoFocus
              className="mt-2 w-full border border-zinc-400 bg-white px-3 py-3 text-sm normal-case tracking-normal text-zinc-900 outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white dark:focus:border-white"
              minLength={1}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Beta launch"
              required
              value={name}
            />
          </label>
          <button
            className="inline-flex min-h-11 items-center gap-2 border border-zinc-900 px-5 text-[11px] uppercase tracking-[.14em] text-zinc-900 disabled:opacity-40 dark:border-white dark:text-white"
            disabled={saving}
            type="submit"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Creating" : "Create milestone"}
          </button>
        </form>
      )}

      {error && <p className="border-y border-red-400/50 py-3 text-sm text-red-500 dark:text-red-300">{error}</p>}

      {loading ? (
        <ProjectecLoader />
      ) : milestones.length ? (
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <MilestoneRow
              key={milestone.id}
              milestone={milestone}
              open={expandedId === milestone.id}
              organizationId={organizationId}
              projectId={projectId}
              onToggle={() => setExpandedId((current) => (current === milestone.id ? null : milestone.id))}
            />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-zinc-300 p-12 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          No milestones yet. Create one to start tracking delivery against a plan.
        </div>
      )}
    </div>
  );
}

function MilestoneRow({
  milestone,
  open,
  organizationId,
  projectId,
  onToggle,
}: {
  milestone: Milestone;
  open: boolean;
  organizationId?: string;
  projectId?: string;
  onToggle: () => void;
}) {
  return (
    <section className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/25">
      <button
        className="flex w-full flex-wrap items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
        onClick={onToggle}
        type="button"
      >
        <Flag className="h-4 w-4 shrink-0 text-zinc-600 dark:text-zinc-300" />

        {/* Milestone info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg text-zinc-900 dark:text-white">
              {milestone.name}
            </h2>

            <span className="shrink-0 text-[10px] uppercase tracking-[.12em] text-zinc-600 dark:text-zinc-400">
              {milestone.completed_tickets}/{milestone.total_tickets} tickets
            </span>
          </div>

          <p className="mt-1 text-[11px] text-zinc-700 dark:text-zinc-400">
            {formatWindow(
              milestone.expected_start_date,
              milestone.expected_end_date,
            )}
          </p>
        </div>

        {/* Progress */}
        <div className="flex w-full max-w-sm shrink-0 items-center gap-3 sm:w-72">
          <div className="h-1.5 flex-1 bg-zinc-200 dark:bg-zinc-700">
            <div
              className={`h-full transition-all duration-500 ${progressColor(
                milestone.progress_percentage,
              )}`}
              style={{
                width: `${milestone.progress_percentage}%`,
              }}
            />
          </div>

          <span className="w-10 shrink-0 text-right text-xs tabular-nums text-zinc-700 dark:text-zinc-300">
            {milestone.progress_percentage}%
          </span>
        </div>

        {/* Expand */}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-600 transition-transform dark:text-zinc-300 ${open ? "rotate-180" : ""
            }`}
        />
      </button>
      {open && (
        <div className="border-t border-zinc-200 p-5 dark:border-zinc-800">
          <MilestoneDetail milestone={milestone} organizationId={organizationId} projectId={projectId} />
        </div>
      )}
    </section>
  );
}

function progressColor(pct: number) {
  if (pct >= 100) return "bg-green-600 dark:bg-green-400";
  if (pct >= 50) return "bg-emerald-600 dark:bg-emerald-400";
  if (pct > 0) return "bg-amber-600 dark:bg-amber-400";
  return "bg-zinc-400 dark:bg-zinc-600";
}

function formatWindow(start: string | null, end: string | null) {
  if (!start || !end) return "No dates set";
  const fmt = (value: string) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(start)} → ${fmt(end)}`;
}

function MilestoneDetail({
  milestone,
  organizationId,
  projectId,
}: {
  milestone: Milestone;
  organizationId?: string;
  projectId?: string;
}) {
  const [progress, setProgress] = useState<MilestoneProgressPoint[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;
    setLoadingProgress(true);
    void getMilestoneProgress(projectId, milestone.id)
      .then(setProgress)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoadingProgress(false));
    setLoadingTickets(true);
    void listMilestoneTickets(projectId, milestone.id)
      .then(setTickets)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoadingTickets(false));
  }, [projectId, milestone.id]);

  const chartData = useMemo(
    () =>
      progress.map((point) => ({
        date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        Expected: point.expected_percentage,
        Actual: point.actual_percentage,
      })),
    [progress],
  );

  const moveTicket = async (ticket: Ticket, status: TicketStatus) => {
    if (ticket.status === status) return;
    const previous = tickets;
    setTickets((items) => items.map((item) => (item.id === ticket.id ? { ...item, status } : item)));
    try {
      await updateTicket(ticket.id, { status });
    } catch (err) {
      setTickets(previous);
      setError(`Could not move ${ticket.ticket_number}: ${getErrorMessage(err)}`);
    }
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
                  formatter={(value: number) => `${value}%`}
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
  );
}

function MilestoneKanban({
  tickets,
  onMove,
}: {
  organizationId?: string;
  tickets: Ticket[];
  onMove: (ticket: Ticket, status: TicketStatus) => void;
}) {
  const [overStatus, setOverStatus] = useState<TicketStatus | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const ticket = tickets.find((item) => item.id === event.active.id);
    const status = statuses.find((item) => item === event.over?.id);
    setOverStatus(null);
    if (ticket && status) onMove(ticket, status);
  };

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragOver={(event) => setOverStatus(statuses.find((status) => status === event.over?.id) ?? null)}
      sensors={sensors}
    >
      <div className="pj-scrollbar mt-4 w-full overflow-x-auto pb-4">
        <div className="grid min-w-[900px] grid-cols-6 gap-3">
          {statuses.map((status) => (
            <MiniColumn
              key={status}
              isOver={overStatus === status}
              status={status}
              tickets={tickets.filter((ticket) => ticket.status === status)}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
}

function MiniColumn({ status, tickets, isOver }: { status: TicketStatus; tickets: Ticket[]; isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: status });
  return (
    <section
      ref={setNodeRef}
      className={`h-fit min-w-0 border transition-all duration-200 ${isOver ? "border-zinc-900 bg-zinc-50 dark:border-white/80 dark:bg-zinc-900/10" : "border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-950/40"}`}
    >
      <header className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
        <h3 className="text-[10px] uppercase tracking-[.12em] text-zinc-700 dark:text-zinc-200">{status}</h3>
        <span className="text-[10px] tabular-nums text-zinc-600 dark:text-zinc-400">{tickets.length}</span>
      </header>
      <div className="space-y-2 p-2">
        {tickets.map((ticket) => (
          <MiniTicket key={ticket.id} ticket={ticket} />
        ))}
        {!tickets.length && (
          <div className="flex min-h-16 items-center justify-center border border-dashed border-zinc-200 text-[9px] uppercase tracking-[.1em] text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
            Empty
          </div>
        )}
      </div>
    </section>
  );
}

function MiniTicket({ ticket }: { ticket: Ticket }) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: ticket.id });
  return (
    <div
      className={isDragging ? "opacity-25" : ""}
      ref={setNodeRef}
      style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }}
      {...listeners}
      {...attributes}
    >
      <article
        className="cursor-grab border border-zinc-200 bg-white p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-400 active:cursor-grabbing dark:border-zinc-800 dark:bg-[#111] dark:hover:border-zinc-500"
        onDoubleClick={() =>
          navigate(`/organisations/${ticket.organization_id}/projects/${ticket.project_id}/tickets/${ticket.id}`)
        }
      >
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[9px] uppercase tracking-[.1em] text-zinc-600 dark:text-zinc-400">{ticket.ticket_number}</p>
          <span className={`shrink-0 border px-1.5 py-0.5 text-[9px] uppercase tracking-[.1em] ${priorityTone[ticket.priority]}`}>
            {ticket.priority}
          </span>
        </div>
        <h4 className="mt-1.5 line-clamp-2 text-[12px] leading-4 text-zinc-800 dark:text-zinc-100">{ticket.title}</h4>
      </article>
    </div>
  );
}
