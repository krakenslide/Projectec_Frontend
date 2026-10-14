import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CheckCircle2,
  ChevronRight,
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
import WorkOrbitLoader from "../components/ui/WorkOrbitLoader";

const statusConfig: Record<string, { dot: string; tone: string }> = {
  "To Do": { dot: "bg-zinc-500", tone: "text-zinc-600 dark:text-zinc-300" },
  "In Progress": { dot: "bg-[var(--pj-lime)]", tone: "text-[var(--pj-accent-text)]" },
  "In Review": { dot: "bg-sky-500", tone: "text-sky-700 dark:text-sky-300" },
  Testing: { dot: "bg-violet-500", tone: "text-violet-700 dark:text-violet-300" },
  Done: { dot: "bg-[var(--pj-lime)]", tone: "text-[var(--pj-accent-text)]" },
  Closed: { dot: "bg-zinc-400", tone: "text-zinc-500 dark:text-zinc-400" },
};

export default function StandupPage() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const [members, setMembers] = useState<OrganisationMember[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [summary, setSummary] = useState<DeveloperDailySummary | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All statuses");
  const [selectedProject, setSelectedProject] = useState("All projects");
  const [changedOnly, setChangedOnly] = useState(true);

  useEffect(() => {
    if (!organizationId) return;
    setLoadingMembers(true);
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
    setQuery("");
    setSelectedStatus("All statuses");
    setSelectedProject("All projects");
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, selectedUserId]);

  const selectedMember = members.find((member) => member.user_id === selectedUserId);
  const projectNames = useMemo(
    () => Array.from(new Set(summary?.tickets.map((ticket) => ticket.project_name) ?? [])),
    [summary],
  );
  const scopedTickets = useMemo(
    () => summary?.tickets.filter((ticket) => selectedProject === "All projects" || ticket.project_name === selectedProject) ?? [],
    [selectedProject, summary],
  );
  const statusCounts = useMemo(
    () => scopedTickets.reduce<Record<string, number>>((counts, ticket) => {
      counts[ticket.current_status] = (counts[ticket.current_status] ?? 0) + 1;
      return counts;
    }, {}),
    [scopedTickets],
  );
  const statuses = Object.keys(statusCounts);
  const tickets = useMemo(
    () => scopedTickets.filter((ticket) =>
      (selectedStatus === "All statuses" || ticket.current_status === selectedStatus) &&
      (!changedOnly || ticket.status_changed) &&
      `${ticket.ticket_name} ${ticket.project_name} ${ticket.comments.map((comment) => comment.description).join(" ")}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    ),
    [changedOnly, query, scopedTickets, selectedStatus],
  );

  const changedCount = scopedTickets.filter((ticket) => ticket.status_changed).length;
  const finishedCount = scopedTickets.filter((ticket) => ticket.finished).length;
  const activeCount = scopedTickets.filter((ticket) => ticket.current_status === "In Progress").length;
  const attentionCount = scopedTickets.filter((ticket) => ["P0", "P1"].includes(ticket.priority) && ticket.current_status !== "Done" && ticket.current_status !== "Closed").length;
  const filtersActive = query.trim() !== "" || selectedStatus !== "All statuses" || selectedProject !== "All projects" || changedOnly;
  const statusBreakdown = useMemo(() => Object.entries(statusCounts).sort((a, b) => b[1] - a[1]), [statusCounts]);
  const projectBreakdown = useMemo(() => {
    const counts = scopedTickets.reduce<Record<string, number>>((acc, ticket) => {
      acc[ticket.project_name] = (acc[ticket.project_name] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [scopedTickets]);
  const totalHours = scopedTickets.reduce((sum, ticket) => sum + (Number(ticket.hours_logged) || 0), 0);
  const commentCount = scopedTickets.reduce((sum, ticket) => sum + ticket.comments.length, 0);
  const changedHours = scopedTickets.filter((ticket) => ticket.status_changed).reduce((sum, ticket) => sum + (Number(ticket.hours_logged) || 0), 0);

  useEffect(() => {
    if (selectedProject !== "All projects" && !projectNames.includes(selectedProject)) {
      setSelectedProject("All projects");
    }
  }, [projectNames, selectedProject]);

  const clearFilters = () => {
    setQuery("");
    setSelectedStatus("All statuses");
    setSelectedProject("All projects");
    setChangedOnly(true);
  };

  const initials = (selectedMember?.name || selectedMember?.email || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="pj-app-page w-full space-y-8 font-[var(--font-sans)]">
      <header className="border-b border-[var(--pj-border)] pb-7">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="pj-dashboard-eyebrow">Daily team pulse</p>
            <h1 className="mt-3 font-[var(--font-serif)] text-5xl leading-[.92] text-[var(--pj-text)] sm:text-6xl">What moved today?</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--pj-muted)]">A focused view of each teammate's recent work, movement and attention points.</p>
          </div>
          <button className="pj-outline-action" disabled={loadingSummary || !selectedUserId} onClick={loadSummary} type="button">
            <RefreshCw className={`h-3.5 w-3.5 ${loadingSummary ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </header>

      {error && <p className="border-y border-[var(--pj-red)]/40 py-3 text-sm text-[var(--pj-red)]">{error}</p>}

      <section className="grid grid-cols-2 border-y border-[var(--pj-border)] sm:grid-cols-4">
        <StandupStat label="Changed" value={changedCount} detail={`${changedHours}h logged`} />
        <StandupStat label="Active" value={activeCount} detail={`${scopedTickets.length ? Math.round((activeCount / scopedTickets.length) * 100) : 0}% of work`} />
        <StandupStat label="Finished" value={finishedCount} detail={`${totalHours}h across scope`} />
        <StandupStat label="Attention" value={attentionCount} detail={attentionCount ? "P0 / P1 open" : "No critical work"} accent={attentionCount > 0} />
      </section>

      <div className="grid gap-7 xl:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="pj-standup-panel self-start border border-[var(--pj-border-strong)] bg-[var(--pj-panel)] xl:sticky xl:top-20">
          <div className="border-b border-[var(--pj-border)] px-4 py-4">
            <p className="pj-dashboard-eyebrow">Team</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="text-sm text-[var(--pj-text)]">Select a teammate</p>
              <span className="font-[var(--font-mono)] text-[10px] text-[var(--pj-muted)]">{members.length}</span>
            </div>
          </div>
          {loadingMembers ? <div className="p-5"><WorkOrbitLoader /></div> : (
            <div className="max-h-[60vh] overflow-y-auto">
              {members.map((member) => {
                const selected = member.user_id === selectedUserId;
                const memberInitials = (member.name || member.email || "?").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
                return (
                  <button
                    key={member.user_id}
                    className={`pj-member-choice group flex w-full items-center gap-3 border-b border-[var(--pj-border)] px-4 py-3 text-left transition-colors ${selected ? "is-selected" : ""}`}
                    onClick={() => setSelectedUserId(member.user_id)}
                    type="button"
                  >
                    <span className="pj-member-avatar grid h-9 w-9 shrink-0 place-items-center border border-[var(--pj-border)] bg-[var(--pj-panel-muted)] font-[var(--font-mono)] text-[10px] text-[var(--pj-muted)]">{memberInitials}</span>
                    <span className="min-w-0">
                      <span className={`block truncate text-sm ${selected ? "font-semibold text-[var(--pj-text)]" : "text-[var(--pj-text)]"}`}>{member.name || member.email}</span>
                      <span className="mt-0.5 block truncate text-[9px] uppercase tracking-[.12em] text-[var(--pj-dim)]">{member.role_name}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <main className="min-w-0 space-y-7">
          {loadingSummary ? <div className="pj-standup-panel flex min-h-80 items-center justify-center border border-[var(--pj-border-strong)] bg-[var(--pj-panel)]"><WorkOrbitLoader /></div> : summary ? (
            <>
              <section className="pj-standup-panel border border-[var(--pj-border-strong)] bg-[var(--pj-panel)]">
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_18rem]">
                  <div className="p-6 sm:p-8">
                    <p className="pj-dashboard-eyebrow">Your standup</p>
                    <div className="mt-4 flex items-start gap-4">
                      <div className="grid h-14 w-14 shrink-0 place-items-center border border-[var(--pj-border-strong)] bg-[var(--pj-panel-muted)] font-[var(--font-mono)] text-sm text-[var(--pj-text)]">{initials}</div>
                      <div className="min-w-0">
                        <h2 className="font-[var(--font-serif)] text-3xl leading-none text-[var(--pj-text)]">{selectedMember?.name || summary.developer_name}</h2>
                        <p className="mt-2 text-xs text-[var(--pj-muted)]">{selectedMember?.email || "No email available"}</p>
                      </div>
                    </div>
                    <p className="mt-7 max-w-2xl text-sm leading-7 text-[var(--pj-muted)]">The reporting window covers the work recorded between <strong className="font-medium text-[var(--pj-text)]">{formatRange(summary.report_start, summary.report_end)}</strong>.</p>
                  </div>
                  <div className="grid grid-cols-2 border-t border-[var(--pj-border)] lg:border-l lg:border-t-0">
                    <ProfileMetric label="Tickets" value={summary.total_tickets} />
                    <ProfileMetric label="Hours" value={`${summary.total_hours_logged}h`} />
                    <ProfileMetric label="Finished" value={summary.tickets_finished} />
                    <ProfileMetric label="Comments" value={summary.total_comments} />
                  </div>
                </div>
              </section>

              <section className="grid gap-7 lg:grid-cols-2">
                <DetailPanel title="Status mix" eyebrow="Work distribution">
                  <div className="space-y-4">
                    {statusBreakdown.length ? statusBreakdown.map(([status, count]) => (
                      <div key={status}>
                        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[.12em]">
                          <span className="text-[var(--pj-text)]">{status}</span><span className="font-[var(--font-mono)] text-[var(--pj-muted)]">{count}</span>
                        </div>
                        <div className="h-1 bg-[var(--pj-panel-muted)]"><div className="h-full bg-[var(--pj-lime)]" style={{ width: `${Math.max(6, (count / Math.max(1, scopedTickets.length)) * 100)}%` }} /></div>
                      </div>
                    )) : <EmptyDetail text="No status data in this reporting window." />}
                  </div>
                </DetailPanel>
                <DetailPanel title="Projects touched" eyebrow="Portfolio spread">
                  <div className="divide-y divide-[var(--pj-border)]">
                    {projectBreakdown.length ? projectBreakdown.map(([project, count]) => (
                      <button key={project} type="button" onClick={() => setSelectedProject(project)} className="flex w-full items-center justify-between py-3 text-left transition-colors hover:bg-[var(--pj-hover-surface)]">
                        <span className="min-w-0 truncate text-sm text-[var(--pj-text)]">{project}</span><span className="ml-4 flex items-center gap-2 font-[var(--font-mono)] text-[10px] text-[var(--pj-muted)]">{count} tickets <ChevronRight className="h-3 w-3" /></span>
                      </button>
                    )) : <EmptyDetail text="No project activity in this reporting window." />}
                  </div>
                </DetailPanel>
              </section>

              <section className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <DetailPanel title="Standup signals" eyebrow="What needs context">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <SignalCard label="Changed work" value={changedCount} text={changedCount ? `${changedHours}h logged on changed tickets` : "Nothing changed"} />
                    <SignalCard label="Conversation" value={commentCount} text={commentCount ? `${commentCount} comments recorded` : "No comments recorded"} />
                    <SignalCard label="Completion" value={`${scopedTickets.length ? Math.round((finishedCount / scopedTickets.length) * 100) : 0}%`} text={`${finishedCount} finished of ${scopedTickets.length} tickets`} />
                  </div>
                </DetailPanel>
                <DetailPanel title="Reporting window" eyebrow="Data scope">
                  <p className="font-[var(--font-serif)] text-xl text-[var(--pj-text)]">{formatRange(summary.report_start, summary.report_end)}</p>
                  <p className="mt-3 text-xs leading-5 text-[var(--pj-muted)]">All metrics on this page are derived from the selected teammate's daily-summary response.</p>
                </DetailPanel>
              </section>

              <section className="pj-standup-panel border border-[var(--pj-border-strong)] bg-[var(--pj-panel)]">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--pj-border)] p-5 sm:p-6">
                  <div>
                    <p className="pj-dashboard-eyebrow">Work movement</p>
                    <h2 className="mt-1 font-[var(--font-serif)] text-2xl text-[var(--pj-text)]">Recent work</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[.12em] text-[var(--pj-muted)]">
                    <span>{tickets.length} shown</span><span>·</span><span>{changedCount} changed</span>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap gap-2 border-b border-[var(--pj-border)] pb-5">
                    <div className="relative min-w-[14rem] flex-1">
                      <Search className="pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--pj-dim)]" />
                      <input className="w-full border-b border-[var(--pj-input-border)] bg-transparent py-2 pl-6 pr-6 text-xs text-[var(--pj-text)] outline-none placeholder:text-[var(--pj-placeholder)] focus:border-[var(--pj-focus)]" onChange={(event) => setQuery(event.target.value)} placeholder="Search work" value={query} />
                      {query && <button className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--pj-muted)]" onClick={() => setQuery("")} type="button"><X className="h-3.5 w-3.5" /></button>}
                    </div>
                    <FilterSelect value={selectedProject} options={["All projects", ...projectNames]} onChange={setSelectedProject} />
                    <FilterSelect value={selectedStatus} options={["All statuses", ...statuses]} onChange={setSelectedStatus} />
                    <button className={`border px-3 py-2 text-[9px] uppercase tracking-[.12em] ${changedOnly ? "border-[var(--pj-lime)] bg-[var(--pj-hover-surface)] text-[var(--pj-text)]" : "border-[var(--pj-border)] text-[var(--pj-muted)] hover:bg-[var(--pj-hover-surface)]"}`} onClick={() => setChangedOnly((value) => !value)} type="button">Changed today {changedCount ? `(${changedCount})` : ""}</button>
                    {filtersActive && <button className="px-2 text-[9px] uppercase tracking-[.12em] text-[var(--pj-muted)] hover:text-[var(--pj-text)]" onClick={clearFilters} type="button">Clear</button>}
                  </div>

                  <div className="mt-5 space-y-0">
                    {tickets.map((ticket, index) => <StandupTicket key={`${ticket.project_name}-${ticket.ticket_name}-${index}`} ticket={ticket} />)}
                    {!tickets.length && <div className="border border-dashed border-[var(--pj-border)] py-12 text-center text-sm text-[var(--pj-muted)]">No work items match the current filters.</div>}
                  </div>
                </div>
              </section>
            </>
          ) : <div className="pj-standup-panel flex min-h-80 items-center justify-center border border-[var(--pj-border-strong)] bg-[var(--pj-panel)] p-8 text-center text-sm text-[var(--pj-muted)]">{selectedUserId ? "No daily summary is available for this member." : "Select a teammate to see their daily summary."}</div>}
        </main>
      </div>
    </div>
  );
}

function StandupStat({ label, value, detail, accent = false }: { label: string; value: number; detail: string; accent?: boolean }) {
  return <div className="border-r border-[var(--pj-border)] px-4 py-4 last:border-r-0 sm:px-5"><p className="pj-dashboard-eyebrow">{label}</p><p className={`mt-1 font-[var(--font-serif)] text-3xl ${accent ? "text-[var(--pj-yellow)]" : "text-[var(--pj-text)]"}`}>{value}</p><p className="mt-1 text-[9px] uppercase tracking-[.1em] text-[var(--pj-dim)]">{detail}</p></div>;
}

// function Avatar({ member }: { member: OrganisationMember }) {
//   const initials = (member.name || member.email)
//     .split(" ")
//     .map((part) => part[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

//   return (
//     <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
//       {initials}
//     </span>
//   );
// }

function SignalCard({ label, value, text }: { label: string; value: number | string; text: string }) {
  return <div className="border border-[var(--pj-border)] p-4"><p className="text-[9px] uppercase tracking-[.12em] text-[var(--pj-muted)]">{label}</p><p className="mt-2 font-[var(--font-serif)] text-2xl text-[var(--pj-text)]">{value}</p><p className="mt-1 text-[10px] leading-4 text-[var(--pj-muted)]">{text}</p></div>;
}

function EmptyDetail({ text }: { text: string }) {
  return <p className="py-4 text-xs text-[var(--pj-muted)]">{text}</p>;
}

function ProfileMetric({ label, value }: { label: string; value: number | string }) {
  return <div className="border-b border-r border-[var(--pj-border)] p-5 last:border-r-0"><p className="pj-dashboard-eyebrow">{label}</p><p className="mt-2 font-[var(--font-serif)] text-2xl text-[var(--pj-text)]">{value}</p></div>;
}

function FilterSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return <select className="min-h-9 border border-[var(--pj-border)] bg-[var(--pj-panel-muted)] px-3 text-[9px] uppercase tracking-[.1em] text-[var(--pj-text)] outline-none hover:bg-[var(--pj-hover-surface)] focus:border-[var(--pj-focus)]" onChange={(event) => onChange(event.target.value)} value={value}>{options.map((option) => <option key={option}>{option}</option>)}</select>;
}

function StandupTicket({ ticket }: { ticket: DeveloperDailySummary["tickets"][number] }) {
  const status = statusConfig[ticket.current_status] ?? statusConfig["To Do"];
  return <article className="border-b border-[var(--pj-border)] py-5 last:border-b-0">
    <div className="grid gap-4 md:grid-cols-[4.5rem_minmax(0,1fr)_auto] md:items-start">
      <div><span className="font-[var(--font-mono)] text-[10px] font-medium text-[var(--pj-text)]">{ticket.current_status}</span><span className={`mt-2 block h-1 w-8 ${status.dot}`} /></div>
      <div className="min-w-0">
        <p className="font-[var(--font-mono)] text-[9px] uppercase tracking-[.14em] text-[var(--pj-dim)]">{ticket.project_name}</p>
        <h3 className="mt-1 text-sm font-medium leading-6 text-[var(--pj-text)]">{ticket.ticket_name}</h3>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[9px] uppercase tracking-[.1em] text-[var(--pj-muted)]">
          <span>{ticket.hours_logged}h logged</span>
          {ticket.status_changed && <span className={status.tone}>{ticket.previous_status ? `${ticket.previous_status} → ${ticket.current_status}` : "Status changed"}</span>}
          {ticket.finished && <span className="inline-flex items-center gap-1 text-[var(--pj-accent-text)]"><CheckCircle2 className="h-3 w-3" /> Finished</span>}
        </div>
        {ticket.comments.length > 0 && <div className="mt-4 border-l border-[var(--pj-border-strong)] pl-3 space-y-2">{ticket.comments.map((comment) => <p key={comment.id} className="text-xs leading-5 text-[var(--pj-muted)]"><MessageSquare className="mr-1 inline h-3 w-3" />{comment.description}</p>)}</div>}
      </div>
      <div className="flex items-center gap-2 text-[9px] uppercase tracking-[.1em] text-[var(--pj-dim)]"><Clock3 className="h-3 w-3" /> {ticket.finished ? "Finished" : "Active"}</div>
    </div>
  </article>;
}

function formatRange(start: string, end: string) {
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };
  return `${new Date(start).toLocaleString("en-US", options)} – ${new Date(end).toLocaleString("en-US", options)}`;
}
