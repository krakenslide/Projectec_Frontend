import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleDot,
  Clock3,
  MessageSquare,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useParams } from "react-router-dom";
import {
  getDeveloperDailySummary,
  type DeveloperDailySummary,
} from "../api/analytics";
import { getErrorMessage } from "../api/client";
import { listProjectMembers } from "../api/projects";
import type { ProjectMember } from "../types/project";
import ProjectecLoader from "../components/ui/ProjectecLoader";

const statusConfig: Record<string, { dot: string; badge: string }> = {
  "To Do": {
    dot: "bg-zinc-500",
    badge:
      "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
  },
  "In Progress": {
    dot: "bg-emerald-500",
    badge:
      "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
  "In Review": {
    dot: "bg-sky-500",
    badge:
      "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-700 dark:bg-sky-950/30 dark:text-sky-300",
  },
  Testing: {
    dot: "bg-violet-500",
    badge:
      "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-700 dark:bg-violet-950/30 dark:text-violet-300",
  },
  Done: {
    dot: "bg-green-500",
    badge:
      "border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-950/30 dark:text-green-300",
  },
  Closed: {
    dot: "bg-zinc-400",
    badge:
      "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
  },
};

export default function StandupPage() {
  const { organizationId, projectId } = useParams<{
    organizationId: string;
    projectId: string;
  }>();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [summary, setSummary] = useState<DeveloperDailySummary | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [statusChangeFilter, setStatusChangeFilter] = useState<
    "all" | "changed" | "unchanged"
  >("all");
  useEffect(() => {
    if (!projectId) return;
    void listProjectMembers(projectId)
      .then((items) => {
        setMembers(items);
        setSelectedUserId((current) =>
          current && items.some((member) => member.user_id === current)
            ? current
            : items[0]?.user_id ?? null,
        );
      })
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoadingMembers(false));
  }, [projectId]);
  const loadSummary = () => {
    if (!organizationId || !selectedUserId) return;
    setLoadingSummary(true);
    setError("");
    void getDeveloperDailySummary(organizationId, selectedUserId)
      .then(setSummary)
      .catch((err: unknown) => {
        setSummary(null);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoadingSummary(false));
  };
  useEffect(() => {
    loadSummary();
  }, [organizationId, selectedUserId]);
  const selectedMember = members.find(
    (member) => member.user_id === selectedUserId,
  );
  const statusCounts = useMemo(
    () =>
      summary?.tickets.reduce<Record<string, number>>(
        (counts, ticket) => ({
          ...counts,
          [ticket.current_status]: (counts[ticket.current_status] ?? 0) + 1,
        }),
        {},
      ) ?? {},
    [summary],
  );
  const statuses = Object.keys(statusCounts);
  const tickets = useMemo(
    () =>
      summary?.tickets.filter(
        (ticket) =>
          (selectedStatus === "All" ||
            ticket.current_status === selectedStatus) &&
          (statusChangeFilter === "all" ||
            (statusChangeFilter === "changed"
              ? ticket.status_changed
              : !ticket.status_changed)) &&
          `${ticket.ticket_name} ${ticket.project_name} ${ticket.comments.map((comment) => comment.description).join(" ")}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ) ?? [],
    [query, selectedStatus, statusChangeFilter, summary],
  );
  return (
    <div className="pj-standup w-full space-y-5 font-['Inter',ui-sans-serif,sans-serif]">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <div>
          <p className="text-[10px] uppercase tracking-[.2em] text-zinc-600 dark:text-zinc-400">
            Daily delivery view
          </p>
          <h1 className="mt-2 font-['Instrument_Serif',Georgia,serif] text-5xl leading-none text-zinc-900 dark:text-white">
            Standup
          </h1>
        </div>
        <button
          className="inline-flex min-h-9 items-center gap-2 border border-zinc-300 px-3 text-[10px] uppercase tracking-[.14em] text-zinc-700 hover:border-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-white"
          disabled={loadingSummary || !selectedUserId}
          onClick={loadSummary}
          type="button"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loadingSummary ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </header>
      {error && (
        <p className="border-y border-red-300 py-3 text-sm text-red-700 dark:border-red-400/50 dark:text-red-300">
          {error}
        </p>
      )}
      <div className="grid min-h-[34rem] gap-5 lg:grid-cols-[minmax(15rem,24%)_minmax(0,1fr)]">
        <aside className="self-start border border-zinc-200 bg-zinc-50/70 lg:sticky lg:top-20 dark:border-zinc-800 dark:bg-zinc-950/30">
          <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
            <p className="text-[10px] uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-400">
              Project members
            </p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Choose a teammate
            </p>
          </div>
          {loadingMembers ? (
            <ProjectecLoader />
          ) : (
            <div className="p-2">
              {members.map((member) => (
                <button
                  className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors ${member.user_id === selectedUserId ? "bg-white shadow-sm dark:bg-zinc-900" : "hover:bg-white/70 dark:hover:bg-zinc-900/60"}`}
                  key={member.user_id}
                  onClick={() => setSelectedUserId(member.user_id)}
                  type="button"
                >
                  <Avatar member={member} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-zinc-800 dark:text-zinc-100">
                      {member.name || member.email}
                    </span>
                    <span className="mt-1 block truncate text-[10px] uppercase tracking-[.1em] text-zinc-600 dark:text-zinc-400">
                      {member.role}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>
        <section className="min-w-0 border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/20">
          {loadingSummary ? (
            <div className="flex min-h-[30rem] items-center justify-center">
              <ProjectecLoader />
            </div>
          ) : summary ? (
            <>
              <div className="border-b border-zinc-200 px-5 py-5 dark:border-zinc-800">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-400">
                      {formatRange(summary.report_start, summary.report_end)}
                    </p>
                    <h2 className="mt-2 text-xl text-zinc-900 dark:text-white">
                      {summary.developer_name ||
                        selectedMember?.name ||
                        "Daily summary"}
                    </h2>
                  </div>
                  <p className="text-right text-[10px] uppercase tracking-[.12em] text-zinc-600 dark:text-zinc-400">
                    {summary.total_tickets} tickets
                    <br />
                    in today’s report
                  </p>
                </div>
                <div className="mt-5 grid gap-px border border-zinc-200 bg-zinc-200 sm:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-800">
                  <Metric
                    icon={CircleDot}
                    label="Active tickets"
                    value={summary.total_tickets}
                  />
                  <Metric
                    icon={CheckCircle2}
                    label="Finished"
                    value={summary.tickets_finished}
                  />
                  <Metric
                    icon={Clock3}
                    label="Hours logged"
                    value={summary.total_hours_logged}
                  />
                </div>
              </div>
              <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_13rem]">
                <div>
                  <div className="border-b border-zinc-200 pb-3 dark:border-zinc-800">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-[10px] uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-400">
                        Work today
                      </h3>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        {tickets.length} of {summary.total_tickets} tickets
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        className={`border px-2 py-1 text-[10px] uppercase tracking-[.1em] ${selectedStatus === "All" ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900" : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"}`}
                        onClick={() => setSelectedStatus("All")}
                        type="button"
                      >
                        All
                      </button>
                      {statuses.map((status) => (
                        <button
                          className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] uppercase tracking-[.1em] ${statusConfig[status]?.badge ?? statusConfig["To Do"].badge} ${selectedStatus === status ? "ring-1 ring-zinc-900 dark:ring-white" : ""}`}
                          key={status}
                          onClick={() => setSelectedStatus(status)}
                          type="button"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusConfig[status]?.dot ?? "bg-zinc-500"}`}
                          />
                          {status}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="mr-1 text-[10px] uppercase tracking-[.12em] text-zinc-600 dark:text-zinc-400">
                        Status change
                      </span>
                      {(["all", "changed", "unchanged"] as const).map(
                        (filter) => (
                          <button
                            className={`border px-2 py-1 text-[10px] uppercase tracking-[.1em] ${statusChangeFilter === filter ? "border-emerald-700 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950/30 dark:text-emerald-300" : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"}`}
                            key={filter}
                            onClick={() => setStatusChangeFilter(filter)}
                            type="button"
                          >
                            {filter}
                          </button>
                        ),
                      )}
                    </div>
                    <div className="relative mt-3">
                      <Search className="pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                      <input
                        className="w-full border-b border-zinc-300 bg-transparent py-2 pl-6 pr-7 text-xs text-zinc-900 outline-none placeholder:text-zinc-500 focus:border-zinc-900 dark:border-zinc-700 dark:text-white dark:focus:border-white"
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search tickets or updates"
                        value={query}
                      />
                      {query && (
                        <button
                          aria-label="Clear search"
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                          onClick={() => setQuery("")}
                          type="button"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {tickets.map((ticket, index) => (
                      <article
                        className="py-4"
                        key={`${ticket.project_name}-${ticket.ticket_name}-${index}`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-[.12em] text-zinc-600 dark:text-zinc-400">
                              {ticket.project_name}
                            </p>
                            <h4 className="mt-1 text-sm text-zinc-800 dark:text-zinc-100">
                              {ticket.ticket_name}
                            </h4>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] uppercase tracking-[.1em] ${statusConfig[ticket.current_status]?.badge ?? statusConfig["To Do"].badge}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${statusConfig[ticket.current_status]?.dot ?? "bg-zinc-500"}`}
                            />
                            {ticket.current_status}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-zinc-600 dark:text-zinc-400">
                          <span>{ticket.hours_logged}h logged</span>
                          {ticket.status_changed && (
                            <span className="text-emerald-700 dark:text-emerald-300">
                              Status changed
                            </span>
                          )}
                          {ticket.finished && (
                            <span className="text-emerald-700 dark:text-emerald-300">
                              Finished
                            </span>
                          )}
                        </div>
                        {ticket.comments.length > 0 && (
                          <div className="mt-3 space-y-2 border-l-2 border-zinc-200 pl-3 dark:border-zinc-800">
                            {ticket.comments.map((comment) => (
                              <p
                                className="text-xs leading-5 text-zinc-600 dark:text-zinc-300"
                                key={comment.id}
                              >
                                <MessageSquare className="mr-1 inline h-3 w-3" />
                                {comment.description}
                              </p>
                            ))}
                          </div>
                        )}
                      </article>
                    ))}
                    {!tickets.length && (
                      <p className="py-10 text-center text-sm text-zinc-600 dark:text-zinc-400">
                        No work items match the active filters.
                      </p>
                    )}
                  </div>
                </div>
                <aside className="border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <p className="text-[10px] uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-400">
                    Status mix
                  </p>
                  <div className="mt-4 space-y-3">
                    {Object.entries(statusCounts).map(([status, count]) => (
                      <button
                        className="flex w-full items-center justify-between text-left text-xs"
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        type="button"
                      >
                        <span className="inline-flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusConfig[status]?.dot ?? "bg-zinc-500"}`}
                          />
                          {status}
                        </span>
                        <span className="font-medium text-zinc-900 dark:text-white">
                          {count}
                        </span>
                      </button>
                    ))}
                  </div>
                </aside>
              </div>
            </>
          ) : (
            <div className="flex min-h-[30rem] items-center justify-center p-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
              {selectedUserId
                ? "No daily summary is available for this member."
                : "Select a project member to see their daily summary."}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
function Avatar({ member }: { member: ProjectMember }) {
  const initials = (member.name || member.email)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
      {initials}
    </span>
  );
}
function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CircleDot;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white p-4 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[.12em] text-zinc-600 dark:text-zinc-400">
          {label}
        </span>
        <Icon className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300" />
      </div>
      <p className="mt-3 text-2xl text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}
function formatRange(start: string, end: string) {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  return `${new Date(start).toLocaleString("en-US", options)} – ${new Date(end).toLocaleString("en-US", options)}`;
}
