import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Activity, Clock3, Edit3, Link2, Loader2, MessageSquare, Save, Send, Trash2, X } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { createComment, deleteComment, listComments, updateComment, type Comment, type TaggedUser } from "../api/comments";
import { deleteTicket, getTicket, updateTicket } from "../api/tickets";
import { listTicketActivities, type TicketActivity } from "../api/activities";
import { getErrorMessage } from "../api/client";
import type { Ticket, TicketPriority, TicketStatus, TicketType } from "../types/ticket";
import { useToast } from "../components/ui/Toast";
import ProjectecLoader from "../components/ui/ProjectecLoader";
import ConfirmModal from "../components/ui/ConfirmModal";
import AssigneePicker from "../components/ui/AssigneePicker";
import type { ProjectMember } from "../types/project";
import { listProjectMembers } from "../api/projects";
import { getMe } from "../api/auth";

const statuses: TicketStatus[] = ["To Do", "In Progress", "In Review", "Testing", "Done", "Closed"];
const types: TicketType[] = ["Feature", "Bug", "Task", "Improvement"];
const priorities: TicketPriority[] = ["P0", "P1", "P2", "P3", "P4"];
const dateValue = (value: string | null | undefined) => value ? value.slice(0, 16) : "";
const optional = (value: string) => value.trim() || null;

const priorityTone: Record<TicketPriority, string> = { P0: "border-red-400/50 bg-red-950/20 text-red-300", P1: "border-orange-300/50 bg-orange-950/20 text-orange-200", P2: "border-amber-300/50 bg-amber-950/20 text-amber-200", P3: "border-sky-300/50 bg-sky-950/20 text-sky-200", P4: "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950/30 text-zinc-600 dark:text-zinc-300" };
const statusTone: Record<TicketStatus, string> = { "To Do": "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300", "In Progress": "border-emerald-400/50 text-emerald-300", "In Review": "border-sky-400/50 text-sky-300", Testing: "border-violet-400/50 text-violet-300", Done: "border-green-400/50 text-green-300", Closed: "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300" };

export default function TicketDetailPage() {
    const { organizationId, projectId, ticketId } = useParams<{ organizationId: string; projectId: string; ticketId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [original, setOriginal] = useState<Ticket | null>(null);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState("");
    const [taggedUserIds, setTaggedUserIds] = useState<string[]>([]);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState("");
    const [editingTaggedUserIds, setEditingTaggedUserIds] = useState<string[]>([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [commentBusy, setCommentBusy] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
    const [ticketSaving, setTicketSaving] = useState(false);
    const [deletingTicket, setDeletingTicket] = useState(false);
    const [ticketDeleteOpen, setTicketDeleteOpen] = useState(false);
    const [commentDeleteOpen, setCommentDeleteOpen] = useState(false);
    const [error, setError] = useState("");
    const [activities, setActivities] = useState<TicketActivity[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(true);

    useEffect(() => {
        if (!ticketId) return;
        void getTicket(ticketId).then((data) => { setTicket(data); setOriginal(data); }).catch((err: unknown) => setError(getErrorMessage(err)));
    }, [ticketId]);

    useEffect(() => {
        if (!projectId) return;
        void listProjectMembers(projectId).then(setMembers).catch((err: unknown) => setError(getErrorMessage(err)));
    }, [projectId]);

    useEffect(() => {
        void getMe().then((user) => setCurrentUserId(user.id)).catch(() => setCurrentUserId(null));
    }, []);

    useEffect(() => {
        if (!ticketId) return;
        void listComments(ticketId).then(setComments).catch((err: unknown) => setError(`Ticket loaded, but comments could not be loaded: ${getErrorMessage(err)}`)).finally(() => setLoadingComments(false));
    }, [ticketId]);

    useEffect(() => {
        if (!ticketId) return;
        setLoadingActivities(true);
        void listTicketActivities(ticketId).then(setActivities).catch(() => undefined).finally(() => setLoadingActivities(false));
    }, [ticketId]);

    useEffect(() => {
        const commentId = location.hash.replace("#comment-", "");
        if (!commentId || !comments.some((comment) => comment.id === commentId)) return;
        window.requestAnimationFrame(() => document.getElementById(`comment-${commentId}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
    }, [comments, location.hash]);

    const validation = useMemo(() => {
        if (!ticket) return "";
        if (ticket.title.trim().length < 3) return "Ticket title must contain at least 3 characters.";
        if (ticket.title.trim().length > 255) return "Ticket title cannot exceed 255 characters.";
        if (ticket.difficulty !== null && ticket.difficulty !== undefined && (ticket.difficulty < 1 || ticket.difficulty > 100)) return "Difficulty must be between 1 and 100.";
        if ((ticket.hours_logged ?? 0) < 0) return "Hours logged cannot be negative.";
        return "";
    }, [ticket]);

    const refreshComments = async () => {
        if (!ticketId) return;

        const latestComments = await listComments(ticketId);
        setComments(latestComments);
    };

    const saveTicket = async () => {
        if (!ticketId || !ticket || validation || ticketSaving) return;
        setTicketSaving(true); setError("");
        try {
            const updated = await updateTicket(ticketId, { title: ticket.title.trim(), description: ticket.description || null, type: ticket.type, priority: ticket.priority, status: ticket.status, difficulty: ticket.difficulty ?? null, parent_ticket_id: ticket.parent_ticket_id ?? null, assigned_to: ticket.assigned_to ?? null, expected_start_date: ticket.expected_start_date || null, expected_end_date: ticket.expected_end_date || null, actual_start_date: ticket.actual_start_date || null, actual_end_date: ticket.actual_end_date || null, reason_for_delay: ticket.reason_for_delay || null, hours_logged: ticket.hours_logged ?? 0, demo_link: ticket.demo_link || null });
            setTicket(updated); setOriginal(updated); showToast("Ticket saved");
        } catch (err: unknown) { setError(getErrorMessage(err)); } finally { setTicketSaving(false); }
    };

    const addComment = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!ticketId || !commentText.trim() || commentBusy) return;
        setCommentBusy(true); setError("");
        const finalTaggedUserIds = members
            .filter((member) => {
                const mention = `@${member.name || member.email}`;

                return (
                    taggedUserIds.includes(member.user_id) &&
                    commentText.includes(mention)
                );
            })
            .map((member) => member.user_id);
        try {
            await createComment(ticketId, commentText.trim(), Array.from(new Set(finalTaggedUserIds)));
            await refreshComments();
            setCommentText("");
            setTaggedUserIds([]);
            showToast("Comment added");
        } catch (err: unknown) { setError(getErrorMessage(err)); } finally { setCommentBusy(false); }
    };

    const saveComment = async (comment: Comment) => {
        if (!ticketId || !editingText.trim() || commentBusy) return;
        setCommentBusy(true); setError("");
        try {
            await updateComment(ticketId, comment.id, editingText.trim(), editingTaggedUserIds);
            await refreshComments();
            setEditingCommentId(null);
            setEditingText("");
            setEditingTaggedUserIds([]);
            showToast("Comment updated");
        } catch (err: unknown) { setError(getErrorMessage(err)); } finally { setCommentBusy(false); }
    };

    const removeComment = async () => {
        if (!ticketId || !deletingCommentId || commentBusy) return;
        setCommentBusy(true); setError("");
        try {
            await deleteComment(ticketId, deletingCommentId);
            await refreshComments();
            setCommentDeleteOpen(false); showToast("Comment deleted");
        } catch (err: unknown) { setError(getErrorMessage(err)); } finally { setCommentBusy(false); setDeletingCommentId(null); }
    };

    const removeTicket = async () => {
        if (!ticketId || deletingTicket) return;
        setDeletingTicket(true); setError("");
        try { await deleteTicket(ticketId); setTicketDeleteOpen(false); showToast("Ticket deleted"); navigate(`/organisations/${organizationId}/projects/${projectId}/tickets`, { replace: true }); }
        catch (err: unknown) { setError(getErrorMessage(err)); setDeletingTicket(false); }
    };

    const updateTicketField = <K extends keyof Ticket>(key: K, value: Ticket[K]) => setTicket((current) => current ? { ...current, [key]: value } : current);
    const changed = JSON.stringify(ticket) !== JSON.stringify(original);

    if (!ticket) return <div className="space-y-7 font-['Inter',ui-sans-serif,sans-serif]"><Link className="text-xs uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white" to={`/organisations/${organizationId}/projects/${projectId}/tickets`}>← Tickets</Link><ProjectecLoader /></div>;

    return <div className="max-w-6xl space-y-7 font-['Inter',ui-sans-serif,sans-serif]">
        <Link className="text-xs uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white" to={`/organisations/${organizationId}/projects/${projectId}/tickets`}>← Back to tickets</Link>
        {error && <p className="border-y border-red-400/50 py-3 text-sm text-red-300">{error}</p>}
        <header className="border-b border-zinc-200 dark:border-zinc-800 pb-7"><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] uppercase tracking-[.18em] text-zinc-600 dark:text-zinc-300">{ticket.ticket_number}</span><span className={`border px-2 py-1 text-[10px] uppercase tracking-[.12em] ${priorityTone[ticket.priority]}`}>{ticket.priority}</span><span className={`border px-2 py-1 text-[10px] uppercase tracking-[.12em] ${statusTone[ticket.status]}`}>{ticket.status}</span></div><input className="mt-4 w-full bg-transparent font-['Instrument_Serif',Georgia,serif] text-5xl leading-none text-zinc-900 dark:text-white outline-none focus:border-b focus:border-zinc-900 dark:focus:border-white" maxLength={255} value={ticket.title} onChange={(event) => updateTicketField("title", event.target.value)} /><p className="mt-4 text-xs text-zinc-600 dark:text-zinc-300">{ticket.type} · Updated {formatDate(ticket.updated_at)}</p></header>
        <div className="flex min-w-[900px] items-start gap-6">
            <section className="min-w-0 flex-1 space-y-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/25 p-5"><div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4"><div><p className="text-[10px] uppercase tracking-[.18em] text-zinc-600 dark:text-zinc-300">Ticket workspace</p><h2 className="mt-2 text-lg text-zinc-800 dark:text-zinc-100">Details</h2></div><button className="inline-flex min-h-9 items-center gap-2 border border-zinc-300 dark:border-zinc-700 px-3 text-[10px] uppercase tracking-[.12em] text-zinc-600 dark:text-zinc-300 hover:border-zinc-900 dark:hover:border-white hover:text-zinc-900 dark:hover:text-white" disabled={!changed || Boolean(validation) || ticketSaving} onClick={() => void saveTicket()} type="button">{ticketSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}{ticketSaving ? "Saving" : "Save"}</button></div><Field label="Description"><textarea className="min-h-36 w-full bg-transparent text-sm leading-6 text-zinc-700 dark:text-zinc-200 outline-none" value={ticket.description ?? ""} onChange={(event) => updateTicketField("description", optional(event.target.value))} placeholder="Describe the work behind this ticket" /></Field><div className="grid gap-4 md:grid-cols-2"><SelectField label="Status" value={ticket.status} options={statuses} onChange={(value) => updateTicketField("status", value as TicketStatus)} /><SelectField label="Type" value={ticket.type} options={types} onChange={(value) => updateTicketField("type", value as TicketType)} /><SelectField label="Priority" value={ticket.priority} options={priorities} onChange={(value) => updateTicketField("priority", value as TicketPriority)} /><Field label="Difficulty (1-100)"><input className="w-full bg-transparent text-zinc-900 dark:text-white" max={100} min={1} type="number" value={ticket.difficulty ?? ""} onChange={(event) => updateTicketField("difficulty", event.target.value ? Number(event.target.value) : null)} /></Field><Field label="Hours logged"><input className="w-full bg-transparent text-zinc-900 dark:text-white" min={0} type="number" value={ticket.hours_logged ?? 0} onChange={(event) => updateTicketField("hours_logged", Number(event.target.value))} /></Field><AssigneePicker label="Assignee" members={members} value={ticket.assigned_to} onChange={(value) => updateTicketField("assigned_to", value)} /><Field label="Expected start"><input className="w-full bg-transparent text-zinc-900 dark:text-white" type="datetime-local" value={dateValue(ticket.expected_start_date)} onChange={(event) => updateTicketField("expected_start_date", optional(event.target.value))} /></Field><Field label="Expected end"><input className="w-full bg-transparent text-zinc-900 dark:text-white" type="datetime-local" value={dateValue(ticket.expected_end_date)} onChange={(event) => updateTicketField("expected_end_date", optional(event.target.value))} /></Field><Field label="Actual start"><input className="w-full bg-transparent text-zinc-900 dark:text-white" type="datetime-local" value={dateValue(ticket.actual_start_date)} onChange={(event) => updateTicketField("actual_start_date", optional(event.target.value))} /></Field><Field label="Actual end"><input className="w-full bg-transparent text-zinc-900 dark:text-white" type="datetime-local" value={dateValue(ticket.actual_end_date)} onChange={(event) => updateTicketField("actual_end_date", optional(event.target.value))} /></Field></div><Field label="Reason for delay"><textarea className="min-h-20 w-full bg-transparent text-zinc-700 dark:text-zinc-200 outline-none" maxLength={1000} value={ticket.reason_for_delay ?? ""} onChange={(event) => updateTicketField("reason_for_delay", optional(event.target.value))} /></Field>
                <Field label="Demo link">
                    <input
                        className="w-full bg-transparent text-zinc-900 dark:text-white outline-none"
                        type="url"
                        placeholder="https://..."
                        value={ticket.demo_link ?? ""}
                        onChange={(event) =>
                            updateTicketField(
                                "demo_link",
                                optional(event.target.value)
                            )
                        }
                    />
                </Field>
                {validation && <p className="text-sm text-red-300">{validation}</p>}</section>
            <aside className="w-[22rem] shrink-0 space-y-5"><section className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/25 p-5"><h2 className="text-[10px] uppercase tracking-[.18em] text-zinc-600 dark:text-zinc-400">Ticket data</h2><div className="mt-5 space-y-4"><Meta label="Ticket ID" value={ticket.id} /><Meta label="Project ID" value={ticket.project_id} /><Meta label="Created" value={formatDate(ticket.created_at)} /><Meta label="Updated" value={formatDate(ticket.updated_at)} />
                {ticket.demo_link && (
                    <div>
                        <p className="text-[10px] uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-300">
                            Demo
                        </p>

                        <a
                            className="mt-1 inline-flex items-center gap-1.5 text-xs text-zinc-600 underline underline-offset-4 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-200"
                            href={ticket.demo_link}
                            onClick={(event) => event.stopPropagation()}
                            rel="noreferrer"
                            target="_blank"
                        >
                            <Link2 className="h-3.5 w-3.5" />
                            Open demo
                        </a>
                    </div>
                )}
            </div><button className="mt-6 inline-flex min-h-9 items-center gap-2 border border-red-400/60 px-3 text-[10px] uppercase tracking-[.12em] text-red-700 hover:bg-red-950/20" disabled={deletingTicket} onClick={() => setTicketDeleteOpen(true)} type="button">{deletingTicket ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}Delete ticket</button></section><ActivityPanel activities={activities} loading={loadingActivities} /></aside>
        </div>
        <CommentsPanel comments={comments} commentBusy={commentBusy} commentText={commentText} currentUserId={currentUserId} deletingCommentId={deletingCommentId} editingCommentId={editingCommentId} editingText={editingText} editingTaggedUserIds={editingTaggedUserIds} loading={loadingComments} members={members} taggedUserIds={taggedUserIds} onAdd={addComment} onCancelEdit={() => { setEditingCommentId(null); setEditingText(""); setEditingTaggedUserIds([]); }} onDelete={(id) => { setDeletingCommentId(id); setCommentDeleteOpen(true); }} onEdit={(comment) => { setEditingCommentId(comment.id); setEditingText(comment.description); setEditingTaggedUserIds(getTaggedUserIds(comment)); }} onSave={saveComment} onTextChange={setCommentText} onTaggedUsersChange={setTaggedUserIds} onEditingTaggedUsersChange={setEditingTaggedUserIds} onEditTextChange={setEditingText} />
        <ConfirmModal busy={deletingTicket} confirmLabel="Delete ticket" description="This permanently deletes the ticket and its associated work history." onCancel={() => setTicketDeleteOpen(false)} onConfirm={() => void removeTicket()} open={ticketDeleteOpen} title="Delete ticket?" />
        <ConfirmModal busy={commentBusy} confirmLabel="Delete comment" description="This removes the comment from the ticket activity." onCancel={() => { setCommentDeleteOpen(false); setDeletingCommentId(null); }} onConfirm={() => void removeComment()} open={commentDeleteOpen} title="Delete comment?" />
    </div>;
}

function ActivityPanel({ activities, loading }: { activities: TicketActivity[]; loading: boolean }) {
    const chartData = useMemo(() => {
        const counts = new Map<string, number>();
        activities.forEach((activity) => {
            const day = new Date(activity.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            counts.set(day, (counts.get(day) ?? 0) + 1);
        });
        return Array.from(counts.entries()).map(([day, count]) => ({ day, count }));
    }, [activities]);

    return (
        <section className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/30">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-5 py-4">
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
                    <h2 className="text-sm font-medium uppercase tracking-[.14em] text-zinc-700 dark:text-zinc-200">Activity</h2>
                </div>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">{activities.length} {activities.length === 1 ? "event" : "events"}</span>
            </div>
            {loading ? (
                <div className="flex min-h-24 items-center justify-center text-sm text-zinc-600 dark:text-zinc-400"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading activity...</div>
            ) : activities.length === 0 ? (
                <div className="border border-dashed border-zinc-200 dark:border-zinc-800 m-4 p-8 text-center text-sm text-zinc-600 dark:text-zinc-400">No recorded activity yet.</div>
            ) : (
                <div className="space-y-6 p-5">
                    <div>
                        <p className="mb-3 text-[10px] uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-400">Events per day</p>
                        <div className="h-44 w-full">
                            <ResponsiveContainer height="100%" width="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid stroke="currentColor" strokeOpacity={0.1} vertical={false} />
                                    <XAxis dataKey="day" fontSize={11} stroke="currentColor" strokeOpacity={0.5} tickLine={false} />
                                    <YAxis allowDecimals={false} fontSize={11} stroke="currentColor" strokeOpacity={0.5} tickLine={false} />
                                    <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", fontSize: 12 }} />
                                    <Line dataKey="count" dot={{ r: 3 }} stroke="#10b981" strokeWidth={2} type="monotone" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div>
                        <p className="mb-3 text-[10px] uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-400">Timeline</p>
                        <ol className="max-h-56 space-y-4 overflow-y-auto border-l border-zinc-200 pl-4 dark:border-zinc-800">
                            {[...activities].sort((a, b) => b.created_at.localeCompare(a.created_at)).map((activity) => (
                                <li className="relative" key={activity.id}>
                                    <span className="absolute -left-[1.32rem] top-1.5 h-2 w-2 rounded-full bg-emerald-500" />
                                    <p className="text-xs text-zinc-700 dark:text-zinc-300">
                                        Changed <span className="font-medium">{activity.field_name}</span> from{" "}
                                        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] line-through opacity-70 dark:bg-zinc-900">{activity.old_value ?? "—"}</span>{" "}
                                        to <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">{activity.new_value ?? "—"}</span>
                                    </p>
                                    <p className="mt-1 text-[10px] uppercase tracking-[.1em] text-zinc-500 dark:text-zinc-500">{formatDate(activity.created_at)}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            )}
        </section>
    );
}

function renderMentions(
    text: string,
    members: ProjectMember[],
) {
    const names = members
        .map((member) => member.name?.trim())
        .filter((name): name is string => Boolean(name))
        .sort((a, b) => b.length - a.length);

    if (!names.length) {
        return text;
    }

    const escapedNames = names.map((name) =>
        name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    );

    const regex = new RegExp(
        `(@(?:${escapedNames.join("|")}))(?=\\s|$|[.,!?;:])`,
        "g",
    );

    return text.split(regex).map((part, index) => {
        const isMention = names.some(
            (name) => part === `@${name}`,
        );

        return isMention ? (
            <span
                key={index}
                className="mx-0.5 rounded bg-sky-100 px-1 font-medium text-sky-700 dark:bg-sky-950/50 dark:text-sky-300"
            >
                {part}
            </span>
        ) : (
            <span key={index}>{part}</span>
        );
    });
}

function CommentsPanel({
    comments,
    commentBusy,
    commentText,
    currentUserId,
    deletingCommentId,
    editingCommentId,
    editingText,
    editingTaggedUserIds,
    loading,
    members,
    taggedUserIds,
    onAdd,
    onCancelEdit,
    onDelete,
    onEdit,
    onSave,
    onTextChange,
    onTaggedUsersChange,
    onEditingTaggedUsersChange,
    onEditTextChange,
}: {
    comments: Comment[];
    commentBusy: boolean;
    commentText: string;
    currentUserId: string | null;
    deletingCommentId: string | null;
    editingCommentId: string | null;
    editingText: string;
    editingTaggedUserIds: string[];
    loading: boolean;
    members: ProjectMember[];
    taggedUserIds: string[];
    onAdd: (event: React.FormEvent) => void;
    onCancelEdit: () => void;
    onDelete: (id: string) => void;
    onEdit: (comment: Comment) => void;
    onSave: (comment: Comment) => Promise<void>;
    onTextChange: (value: string) => void;
    onTaggedUsersChange: (ids: string[]) => void;
    onEditingTaggedUsersChange: (ids: string[]) => void;
    onEditTextChange: (value: string) => void;
}) {
    return (
        <section className="flex flex-col border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/30">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-5 py-4">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
                    <h2 className="text-sm font-medium uppercase tracking-[.14em] text-zinc-700 dark:text-zinc-200">
                        Comments
                    </h2>
                </div>

                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    {comments.length} {comments.length === 1 ? "comment" : "comments"}
                </span>
            </div>

            {/* Comments */}
            <div className="flex-1 p-4">
                {loading ? (
                    <div className="flex min-h-24 items-center justify-center text-sm text-zinc-600 dark:text-zinc-400">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading comments...
                    </div>
                ) : comments.length === 0 ? (
                    <div className="border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
                        No comments yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {comments.map((comment) => {
                            const initials = (comment.name || comment.email || "?")
                                .split(" ")
                                .map((s) => s[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase();

                            const editing = editingCommentId === comment.id;
                            const canManage = currentUserId !== null && comment.created_by === currentUserId;

                            return (
                                <article
                                    key={comment.id}
                                    id={`comment-${comment.id}`}
                                    className={`scroll-mt-24 border bg-white p-4 transition-colors hover:border-zinc-300 dark:bg-zinc-950 dark:hover:border-zinc-700 ${location.hash === `#comment-${comment.id}` ? "border-sky-400 ring-2 ring-sky-400/20 dark:border-sky-400" : "border-zinc-200 dark:border-zinc-800"}`}
                                >
                                    <div className="flex gap-4">
                                        {/* Avatar */}
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                                            {initials}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-zinc-800 dark:text-zinc-100">
                                                        {comment.name || "Team member"}
                                                    </p>

                                                    {comment.email && (
                                                        <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                                                            {comment.email}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex shrink-0 items-center gap-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                                                    <Clock3 className="h-3 w-3" />
                                                    {formatDate(
                                                        comment.updated_at || comment.created_at
                                                    )}
                                                </div>
                                            </div>

                                            {/* Body */}
                                            {editing ? (
                                                <>
                                                    <div className="mt-4"><MentionComposer disabled={commentBusy} members={members} taggedUserIds={editingTaggedUserIds} value={editingText} onChange={onEditTextChange} onTaggedUsersChange={onEditingTaggedUsersChange} /></div>

                                                    <div className="mt-3 flex justify-end gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={onCancelEdit}
                                                            className="inline-flex items-center gap-1 text-xs uppercase tracking-[.12em] text-zinc-600 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                            Cancel
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                commentBusy || !editingText.trim()
                                                            }
                                                            onClick={() => void onSave(comment)}
                                                            className="inline-flex items-center gap-1 rounded border border-zinc-900 dark:border-white px-3 py-1.5 text-xs uppercase tracking-[.12em] text-zinc-900 dark:text-white disabled:opacity-40"
                                                        >
                                                            <Save className="h-3.5 w-3.5" />
                                                            Save
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="mt-4 max-w-prose whitespace-pre-wrap text-sm leading-7 text-zinc-700 dark:text-zinc-300">
                                                        {renderMentions(comment.description, members)}
                                                    </div>
                                                    <TaggedUsers users={comment.tagged_users} members={members} />

                                                    {canManage && <div className="mt-4 flex gap-5">
                                                        <button
                                                            type="button"
                                                            onClick={() => onEdit(comment)}
                                                            className="inline-flex items-center gap-1 text-xs uppercase tracking-[.12em] text-zinc-600 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
                                                        >
                                                            <Edit3 className="h-3.5 w-3.5" />
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                deletingCommentId === comment.id
                                                            }
                                                            onClick={() => onDelete(comment.id)}
                                                            className="inline-flex items-center gap-1 text-xs uppercase tracking-[.12em] text-zinc-600 dark:text-zinc-400 transition-colors hover:text-red-400 disabled:opacity-40"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Delete
                                                        </button>
                                                    </div>}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Composer */}
            <form
                onSubmit={onAdd}
                className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 p-4"
            >
                <MentionComposer disabled={commentBusy} members={members} taggedUserIds={taggedUserIds} value={commentText} onChange={onTextChange} onTaggedUsersChange={onTaggedUsersChange} />

                <div className="mt-3 flex justify-end">
                    <button
                        type="submit"
                        disabled={commentBusy || !commentText.trim()}
                        className="inline-flex items-center gap-2 rounded border border-zinc-900 dark:border-white px-4 py-2 text-xs font-medium uppercase tracking-[.12em] text-zinc-900 dark:text-white transition-colors hover:bg-white dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {commentBusy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        Post Comment
                    </button>
                </div>
            </form>
        </section>
    );
}

function MentionComposer({ disabled, members, taggedUserIds, value, onChange, onTaggedUsersChange }: { disabled: boolean; members: ProjectMember[]; taggedUserIds: string[]; value: string; onChange: (value: string) => void; onTaggedUsersChange: (ids: string[]) => void }) {
    const match = /(^|\s)@([^\s@]*)$/.exec(value);
    const query = match?.[2].toLowerCase() ?? null;
    const suggestions = query === null ? [] : members.filter((member) => !taggedUserIds.includes(member.user_id) && `${member.name} ${member.email}`.toLowerCase().includes(query)).slice(0, 6);
    const mentionLabel = (member: ProjectMember) => `@${member.name || member.email}`;
    const handleChange = (nextValue: string) => {
        onChange(nextValue);

        const validTaggedUserIds = members
            .filter((member) => {
                const mention = `@${member.name || member.email}`;

                return (
                    taggedUserIds.includes(member.user_id) &&
                    nextValue.includes(mention)
                );
            })
            .map((member) => member.user_id);

        onTaggedUsersChange(
            Array.from(new Set(validTaggedUserIds)),
        );
    };
    const selectMember = (member: ProjectMember) => {
        if (!match) return;

        const prefix = value.slice(
            0,
            match.index + match[1].length,
        );

        const mention = `@${member.name || member.email}`;

        const nextValue = `${prefix}${mention} `;

        onChange(nextValue);

        onTaggedUsersChange(
            Array.from(
                new Set([
                    ...taggedUserIds,
                    member.user_id,
                ]),
            ),
        );

    }; return <div className="relative">
        <textarea
            disabled={disabled}
            value={value}
            maxLength={5000}
            onChange={(event) =>
                handleChange(event.target.value)
            }
            placeholder="Leave a note for the team... Type @ to mention someone."
            className="min-h-28 w-full resize-y rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-3 text-sm leading-6 text-zinc-700 dark:text-zinc-200 outline-none transition-colors placeholder:text-zinc-600 dark:text-zinc-300 focus:border-zinc-900 dark:focus:border-white focus:ring-2 focus:ring-white/15" />
        {suggestions.length > 0 && <div className="absolute bottom-full left-0 z-20 mb-2 w-full max-w-sm overflow-hidden border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-lg"><p className="border-b border-zinc-200 dark:border-zinc-800 px-3 py-2 text-[10px] uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-400">Mention a project member</p>{suggestions.map((member) => <button className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 focus-visible:bg-zinc-100 dark:focus-visible:bg-zinc-900 focus-visible:outline-none" key={member.user_id} onMouseDown={(event) => { event.preventDefault(); selectMember(member); }} type="button"><span className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-700 dark:text-zinc-200">{(member.name || member.email).slice(0, 2).toUpperCase()}</span><span className="min-w-0"><span className="block truncate text-sm text-zinc-800 dark:text-zinc-100">{member.name || member.email}</span><span className="block truncate text-xs text-zinc-600 dark:text-zinc-400">{member.email}</span></span></button>)}</div>}
    </div>;
}

function TaggedUsers({ users, members }: { users: Comment["tagged_users"]; members: ProjectMember[] }) {
    const tagged = (users ?? []).map((user) => {
        if (typeof user === "string") return members.find((member) => member.user_id === user) ?? { user_id: user };
        const userId = user.user_id ?? user.id;
        return members.find((member) => member.user_id === userId) ?? user;
    });
    if (!tagged.length) return null;
    return <div className="mt-3 flex flex-wrap gap-1.5">{tagged.map((user, index) => { const taggedUser = user as ProjectMember | TaggedUser; const label = taggedUser.name || taggedUser.email || "Mentioned member"; return <span className="border border-sky-400/35 bg-sky-50 px-2 py-1 text-xs text-sky-800 dark:bg-sky-950/30 dark:text-sky-200" key={(taggedUser.user_id ?? taggedUser.id ?? "tagged") + index}>@{label}</span>; })}</div>;
}

function getTaggedUserIds(comment: Comment) {
    return (comment.tagged_users ?? []).flatMap((user) => {
        const id = typeof user === "string" ? user : user.user_id ?? user.id;
        return id ? [id] : [];
    });
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-300"><span className="mb-2 block">{label}</span><div className="border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-3 transition-colors hover:border-zinc-400 dark:hover:border-zinc-500 focus-within:border-zinc-900 dark:border-white focus-within:ring-2 focus-within:ring-white/15">{children}</div></label>; }
function SelectField({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) { return <Field label={label}><select className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none [color-scheme:dark]" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white" key={option}>{option}</option>)}</select></Field>; }
function Meta({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-300">{label}</p><p className="mt-1 break-all text-xs text-zinc-700 dark:text-zinc-300">{value}</p></div>; }
function formatDate(value: string | null | undefined) { if (!value) return "Unknown date"; const date = new Date(value); return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }