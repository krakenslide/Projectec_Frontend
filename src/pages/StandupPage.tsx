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
import { listOrganisationMembers } from "../api/organisation";
import type { OrganisationMember } from "../types/organisation";
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

const statusBorderColors: Record<string, string> = {
  "To Do": "border-l-zinc-500 dark:border-l-zinc-600",
  "In Progress": "border-l-emerald-500 dark:border-l-emerald-700",
  "In Review": "border-l-sky-500 dark:border-l-sky-700",
  Testing: "border-l-violet-500 dark:border-l-violet-700",
  Done: "border-l-green-500 dark:border-l-green-700",
  Closed: "border-l-zinc-400 dark:border-l-zinc-700",
};

export default function StandupPage() {
  const { organizationId } = useParams<{
    organizationId: string;
    projectId: string;
  }>();

  const [members, setMembers] = useState<OrganisationMember[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [summary, setSummary] =
    useState<DeveloperDailySummary | null>(null);

  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All statuses");
  const [selectedProject, setSelectedProject] =
    useState("All projects");
  const [changedOnly, setChangedOnly] = useState(true);

  useEffect(() => {
    if (!organizationId) return;

    void listOrganisationMembers(organizationId)
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
  }, [organizationId]);

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
    setQuery("");
    setSelectedStatus("All statuses");
    setSelectedProject("All projects");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, selectedUserId]);

  const selectedMember = members.find(
    (member) => member.user_id === selectedUserId,
  );

  const projectNames = useMemo(
    () =>
      Array.from(
        new Set(
          summary?.tickets.map((ticket) => ticket.project_name) ?? [],
        ),
      ),
    [summary],
  );

  useEffect(() => {
    if (
      selectedProject !== "All projects" &&
      !projectNames.includes(selectedProject)
    ) {
      setSelectedProject("All projects");
    }
  }, [projectNames, selectedProject]);

  const projectScopedTickets = useMemo(
    () =>
      summary?.tickets.filter(
        (ticket) =>
          selectedProject === "All projects" ||
          ticket.project_name === selectedProject,
      ) ?? [],
    [selectedProject, summary],
  );

  const statusCounts = useMemo(
    () =>
      projectScopedTickets.reduce<Record<string, number>>(
        (counts, ticket) => ({
          ...counts,
          [ticket.current_status]:
            (counts[ticket.current_status] ?? 0) + 1,
        }),
        {},
      ),
    [projectScopedTickets],
  );

  const statuses = Object.keys(statusCounts);

  const tickets = useMemo(
    () =>
      projectScopedTickets.filter(
        (ticket) =>
          (selectedStatus === "All statuses" ||
            ticket.current_status === selectedStatus) &&
          (!changedOnly || ticket.status_changed) &&
          `${ticket.ticket_name} ${ticket.project_name} ${ticket.comments
            .map((comment) => comment.description)
            .join(" ")}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [changedOnly, projectScopedTickets, query, selectedStatus],
  );

  const changedCount = projectScopedTickets.filter(
    (ticket) => ticket.status_changed,
  ).length;

  const filtersActive =
    query.trim() !== "" ||
    selectedStatus !== "All statuses" ||
    selectedProject !== "All projects" ||
    changedOnly;

  const clearFilters = () => {
    setQuery("");
    setSelectedStatus("All statuses");
    setSelectedProject("All projects");
    setChangedOnly(true);
  };

  return (
    <div className="pj-standup w-full space-y-5 font-['Inter',ui-sans-serif,sans-serif]">
      {/* Header */}
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
            className={`h-3.5 w-3.5 ${loadingSummary ? "animate-spin" : ""
              }`}
          />
          Refresh
        </button>
      </header>

      {error && (
        <p className="border-y border-red-300 py-3 text-sm text-red-700 dark:border-red-400/50 dark:text-red-300">
          {error}
        </p>
      )}

      {/* Main two-panel workspace */}
      <div className="grid min-h-0 gap-5 lg:grid-cols-[minmax(15rem,24%)_minmax(0,1fr)]">
        {/* Members sidebar */}
        <aside className="self-start overflow-hidden border border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-950/30 lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)]">
          {/* Members header stays fixed */}
          <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-400">
                  Organisation members
                </p>

                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Choose a teammate
                </p>
              </div>

              <span className="shrink-0 text-[10px] uppercase tracking-[.1em] text-zinc-500 dark:text-zinc-500">
                {members.length}
              </span>
            </div>
          </div>

          {loadingMembers ? (
            <ProjectecLoader />
          ) : (
            <div className="max-h-[calc(100vh-14rem)] overflow-y-auto overscroll-contain p-2">
              {members.map((member) => (
                <button
                  className={`group relative flex w-full items-center gap-3 border-l-2 px-3 py-3 text-left transition-all ${member.user_id === selectedUserId
                    ? "border-l-zinc-900 bg-zinc-200 text-zinc-950 shadow-sm dark:border-l-white dark:bg-zinc-900 dark:text-white"
                    : "border-l-transparent text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900/60"
                    }`}
                  key={member.user_id}
                  onClick={() => setSelectedUserId(member.user_id)}
                  type="button"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors ${member.user_id === selectedUserId
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                      }`}
                  >
                    {(member.name || member.email)
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block truncate text-sm ${member.user_id === selectedUserId
                        ? "font-semibold text-zinc-950 dark:text-white"
                        : "text-zinc-800 dark:text-zinc-100"
                        }`}
                    >
                      {member.name || member.email}
                    </span>

                    <span
                      className={`mt-1 block truncate text-[10px] uppercase tracking-[.1em] ${member.user_id === selectedUserId
                        ? "text-zinc-700 dark:text-zinc-300"
                        : "text-zinc-500 dark:text-zinc-400"
                        }`}
                    >
                      {member.role_name}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Main content — independent scroll */}
        <section className="min-h-0 min-w-0 overflow-hidden border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/20 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:overscroll-contain">
          {loadingSummary ? (
            <div className="flex min-h-[30rem] items-center justify-center">
              <ProjectecLoader />
            </div>
          ) : summary ? (
            <>
              {/* Identity + metrics */}
              <div className="border-b border-zinc-200 px-5 py-5 dark:border-zinc-800">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-400">
                      {formatRange(
                        summary.report_start,
                        summary.report_end,
                      )}
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

              <div className="space-y-5 p-5">
                {/* Status distribution */}
                <StatusDistribution
                  counts={statusCounts}
                  selected={selectedStatus}
                  onSelect={setSelectedStatus}
                />

                {/* Filter toolbar */}
                <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-[10px] uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-400">
                      Work today
                    </h3>

                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      {tickets.length} of {projectScopedTickets.length} shown
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2.5">
                    <div className="relative min-w-[11rem] flex-1">
                      <Search className="pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />

                      <input
                        className="w-full border-b border-zinc-300 bg-transparent py-2 pl-6 pr-7 text-xs text-zinc-900 outline-none placeholder:text-zinc-500 focus:border-zinc-900 dark:border-zinc-700 dark:text-white dark:focus:border-white"
                        onChange={(event) =>
                          setQuery(event.target.value)
                        }
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

                    <FilterSelect
                      onChange={setSelectedProject}
                      options={["All projects", ...projectNames]}
                      value={selectedProject}
                    />

                    <FilterSelect
                      onChange={setSelectedStatus}
                      options={["All statuses", ...statuses]}
                      value={selectedStatus}
                    />

                    <button
                      aria-pressed={changedOnly}
                      className={`inline-flex min-h-8 shrink-0 items-center gap-1.5 border px-2.5 py-1.5 text-[10px] uppercase tracking-[.1em] transition-colors ${changedOnly
                        ? "border-emerald-700 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950/30 dark:text-emerald-300"
                        : "border-zinc-300 text-zinc-600 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500"
                        }`}
                      onClick={() =>
                        setChangedOnly((value) => !value)
                      }
                      title="Show only tickets whose status changed today"
                      type="button"
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${changedOnly
                          ? "bg-emerald-500"
                          : "bg-zinc-400"
                          }`}
                      />

                      Changed today

                      {changedCount > 0 && (
                        <span className="opacity-70">
                          ({changedCount})
                        </span>
                      )}
                    </button>

                    {filtersActive && (
                      <button
                        className="text-[10px] uppercase tracking-[.1em] text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-white"
                        onClick={clearFilters}
                        type="button"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Tickets */}
                <div className="space-y-3">
                  {tickets.map((ticket, index) => (
                    <TicketCard
                      key={`${ticket.project_name}-${ticket.ticket_name}-${index}`}
                      ticket={ticket}
                    />
                  ))}

                  {!tickets.length && (
                    <p className="border border-dashed border-zinc-300 py-10 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                      No work items match the active filters.
                    </p>
                  )}
                </div>
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

/* ─── Sub-components ─── */

function FilterSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const active = value !== options[0];

  return (
    <select
      className={`min-h-8 shrink-0 border bg-white px-2 py-1.5 text-[10px] uppercase tracking-[.1em] outline-none transition-colors dark:bg-zinc-950 ${active
        ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
        : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
        }`}
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function Avatar({ member }: { member: OrganisationMember }) {
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

      <p className="mt-3 text-2xl text-zinc-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function StatusDistribution({
  counts,
  selected,
  onSelect,
}: {
  counts: Record<string, number>;
  selected: string;
  onSelect: (status: string) => void;
}) {
  const entries = Object.entries(counts);
  const total = entries.reduce(
    (sum, [, count]) => sum + count,
    0,
  );

  if (total === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-[10px] uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-400">
        Status mix
      </p>

      <div className="flex h-2 border border-zinc-200 dark:border-zinc-800">
        {entries.map(([status, count]) => (
          <button
            key={status}
            className={`transition-all hover:opacity-80 ${selected !== "All statuses" &&
              selected !== status
              ? "opacity-30"
              : "opacity-100"
              } ${statusConfig[status]?.dot ?? "bg-zinc-500"}`}
            onClick={() =>
              onSelect(
                selected === status
                  ? "All statuses"
                  : status,
              )
            }
            style={{
              width: `${(count / total) * 100}%`,
            }}
            title={`${status}: ${count} (${Math.round(
              (count / total) * 100,
            )}%)`}
            type="button"
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {entries.map(([status, count]) => (
          <button
            key={status}
            className={`inline-flex items-center gap-1.5 text-xs transition-opacity ${selected !== "All statuses" &&
              selected !== status
              ? "opacity-40"
              : ""
              }`}
            onClick={() =>
              onSelect(
                selected === status
                  ? "All statuses"
                  : status,
              )
            }
            type="button"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${statusConfig[status]?.dot ?? "bg-zinc-500"
                }`}
            />

            <span className="text-zinc-600 dark:text-zinc-400">
              {status}
            </span>

            <span className="font-medium text-zinc-900 dark:text-white">
              {count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] uppercase tracking-[.1em] ${cfg?.badge ?? statusConfig["To Do"].badge
        }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${cfg?.dot ?? "bg-zinc-500"
          }`}
      />

      {status}
    </span>
  );
}

function TicketCard({
  ticket,
}: {
  ticket: DeveloperDailySummary["tickets"][number];
}) {
  return (
    <article
      className={`border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/20 ${statusBorderColors[ticket.current_status] ??
        "border-l-zinc-500"
        } border-l-4`}
    >
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[.12em] text-zinc-600 dark:text-zinc-400">
              {ticket.project_name}
            </p>

            <h4 className="mt-1 text-sm text-zinc-800 dark:text-zinc-100">
              {ticket.ticket_name}
            </h4>
          </div>

          <StatusBadge status={ticket.current_status} />
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-zinc-600 dark:text-zinc-400">
          <span>{ticket.hours_logged}h logged</span>

          {ticket.status_changed && (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
              {ticket.previous_status && (
                <>
                  <span className="line-through opacity-70">
                    {ticket.previous_status}
                  </span>

                  <span>→</span>

                  <span>{ticket.current_status}</span>
                </>
              )}
            </span>
          )}

          {ticket.finished && (
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-3 w-3" />
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
      </div>
    </article>
  );
}

function formatRange(start: string, end: string) {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };

  return `${new Date(start).toLocaleString(
    "en-US",
    options,
  )} – ${new Date(end).toLocaleString("en-US", options)}`;
}