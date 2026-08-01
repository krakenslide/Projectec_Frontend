import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Clock3, Edit3, Loader2, MessageSquare, Save, Send, Trash2, X } from "lucide-react";
import { createComment, deleteComment, listComments, updateComment, type Comment } from "../api/comments";
import { deleteTicket, getTicket, updateTicket } from "../api/tickets";
import { getErrorMessage } from "../api/client";
import type { Ticket, TicketPriority, TicketStatus, TicketType } from "../types/ticket";
import { useToast } from "../components/ui/Toast";
import ProjectecLoader from "../components/ui/ProjectecLoader";
import ConfirmModal from "../components/ui/ConfirmModal";
import AssigneePicker from "../components/ui/AssigneePicker";
import type { ProjectMember } from "../types/project";
import { listProjectMembers } from "../api/projects";

const statuses: TicketStatus[] = ["To Do", "In Progress", "In Review", "Testing", "Done", "Closed"];
const types: TicketType[] = ["Feature", "Bug", "Task", "Improvement"];
const priorities: TicketPriority[] = ["P0", "P1", "P2", "P3", "P4"];
const dateValue = (value: string | null | undefined) => value ? value.slice(0, 16) : "";
const optional = (value: string) => value.trim() || null;

const priorityTone: Record<TicketPriority, string> = { P0: "border-red-400/50 bg-red-950/20 text-red-300", P1: "border-orange-300/50 bg-orange-950/20 text-orange-200", P2: "border-amber-300/50 bg-amber-950/20 text-amber-200", P3: "border-sky-300/50 bg-sky-950/20 text-sky-200", P4: "border-zinc-700 bg-zinc-950/30 text-zinc-400" };
const statusTone: Record<TicketStatus, string> = { "To Do": "border-zinc-700 text-zinc-400", "In Progress": "border-emerald-400/50 text-emerald-300", "In Review": "border-sky-400/50 text-sky-300", Testing: "border-violet-400/50 text-violet-300", Done: "border-green-400/50 text-green-300", Closed: "border-zinc-700 text-zinc-600" };

export default function TicketDetailPage() {
    const { organizationId, projectId, ticketId } = useParams<{ organizationId: string; projectId: string; ticketId: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [original, setOriginal] = useState<Ticket | null>(null);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState("");
    const [loadingComments, setLoadingComments] = useState(true);
    const [commentBusy, setCommentBusy] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
    const [ticketSaving, setTicketSaving] = useState(false);
    const [deletingTicket, setDeletingTicket] = useState(false);
    const [ticketDeleteOpen, setTicketDeleteOpen] = useState(false);
    const [commentDeleteOpen, setCommentDeleteOpen] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!ticketId) return;
        void getTicket(ticketId).then((data) => { setTicket(data); setOriginal(data); }).catch((err: unknown) => setError(getErrorMessage(err)));
    }, [ticketId]);

    useEffect(() => {
        if (!projectId) return;
        void listProjectMembers(projectId).then(setMembers).catch((err: unknown) => setError(getErrorMessage(err)));
    }, [projectId]);

    useEffect(() => {
        if (!ticketId) return;
        void listComments(ticketId).then(setComments).catch((err: unknown) => setError(`Ticket loaded, but comments could not be loaded: ${getErrorMessage(err)}`)).finally(() => setLoadingComments(false));
    }, [ticketId]);

    const validation = useMemo(() => {
        if (!ticket) return "";
        if (ticket.title.trim().length < 3) return "Ticket title must contain at least 3 characters.";
        if (ticket.title.trim().length > 255) return "Ticket title cannot exceed 255 characters.";
        if (ticket.difficulty !== null && ticket.difficulty !== undefined && (ticket.difficulty < 1 || ticket.difficulty > 100)) return "Difficulty must be between 1 and 100.";
        if ((ticket.hours_logged ?? 0) < 0) return "Hours logged cannot be negative.";
        return "";
    }, [ticket]);

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
        try {
            const created = await createComment(ticketId, commentText.trim());
            setComments((items) => [...items, created]); setCommentText(""); showToast("Comment added");
        } catch (err: unknown) { setError(getErrorMessage(err)); } finally { setCommentBusy(false); }
    };

    const saveComment = async (comment: Comment) => {
        if (!ticketId || !editingText.trim() || commentBusy) return;
        setCommentBusy(true); setError("");
        try {
            const updated = await updateComment(ticketId, comment.id, editingText.trim());
            setComments((items) => items.map((item) => item.id === comment.id ? updated : item)); setEditingCommentId(null); setEditingText(""); showToast("Comment updated");
        } catch (err: unknown) { setError(getErrorMessage(err)); } finally { setCommentBusy(false); }
    };

    const removeComment = async () => {
        if (!ticketId || !deletingCommentId || commentBusy) return;
        setCommentBusy(true); setError("");
        try {
            await deleteComment(ticketId, deletingCommentId);
            setComments((items) => items.filter((item) => item.id !== deletingCommentId)); setCommentDeleteOpen(false); showToast("Comment deleted");
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

    if (!ticket) return <div className="space-y-7"><Link className="text-xs uppercase tracking-[.16em] text-zinc-400 hover:text-white" to={`/organisations/${organizationId}/projects/${projectId}/tickets`}>← Tickets</Link><ProjectecLoader /></div>;

    return <div className="max-w-6xl space-y-7">
        <Link className="text-xs uppercase tracking-[.16em] text-zinc-500 transition-colors hover:text-white" to={`/organisations/${organizationId}/projects/${projectId}/tickets`}>← Back to tickets</Link>
        {error && <p className="border-y border-red-400/50 py-3 text-sm text-red-300">{error}</p>}
        <header className="border-b border-zinc-800 pb-7"><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] uppercase tracking-[.18em] text-zinc-600">{ticket.ticket_number}</span><span className={`border px-2 py-1 text-[10px] uppercase tracking-[.12em] ${priorityTone[ticket.priority]}`}>{ticket.priority}</span><span className={`border px-2 py-1 text-[10px] uppercase tracking-[.12em] ${statusTone[ticket.status]}`}>{ticket.status}</span></div><input className="mt-4 w-full bg-transparent font-['Instrument_Serif',Georgia,serif] text-5xl leading-none text-white outline-none focus:border-b focus:border-white" maxLength={255} value={ticket.title} onChange={(event) => updateTicketField("title", event.target.value)} /><p className="mt-4 text-xs text-zinc-600">{ticket.type} · Updated {formatDate(ticket.updated_at)}</p></header>
        <div className="flex min-w-[900px] items-start gap-6">
            <section className="min-w-0 flex-1 space-y-5 border border-zinc-800 bg-zinc-950/25 p-5"><div className="flex items-center justify-between border-b border-zinc-800 pb-4"><div><p className="text-[10px] uppercase tracking-[.18em] text-zinc-600">Ticket workspace</p><h2 className="mt-2 text-lg text-zinc-100">Details</h2></div><button className="inline-flex min-h-9 items-center gap-2 border border-zinc-700 px-3 text-[10px] uppercase tracking-[.12em] text-zinc-400 hover:border-white hover:text-white" disabled={!changed || Boolean(validation) || ticketSaving} onClick={() => void saveTicket()} type="button">{ticketSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}{ticketSaving ? "Saving" : "Save"}</button></div><Field label="Description"><textarea className="min-h-36 w-full bg-transparent text-sm leading-6 text-zinc-200 outline-none" value={ticket.description ?? ""} onChange={(event) => updateTicketField("description", optional(event.target.value))} placeholder="Describe the work behind this ticket" /></Field><div className="grid gap-4 md:grid-cols-2"><SelectField label="Status" value={ticket.status} options={statuses} onChange={(value) => updateTicketField("status", value as TicketStatus)} /><SelectField label="Type" value={ticket.type} options={types} onChange={(value) => updateTicketField("type", value as TicketType)} /><SelectField label="Priority" value={ticket.priority} options={priorities} onChange={(value) => updateTicketField("priority", value as TicketPriority)} /><Field label="Difficulty (1-100)"><input className="w-full bg-transparent text-white" max={100} min={1} type="number" value={ticket.difficulty ?? ""} onChange={(event) => updateTicketField("difficulty", event.target.value ? Number(event.target.value) : null)} /></Field><Field label="Hours logged"><input className="w-full bg-transparent text-white" min={0} type="number" value={ticket.hours_logged ?? 0} onChange={(event) => updateTicketField("hours_logged", Number(event.target.value))} /></Field><AssigneePicker label="Assignee" members={members} value={ticket.assigned_to} onChange={(value) => updateTicketField("assigned_to", value)} /><Field label="Expected start"><input className="w-full bg-transparent text-white" type="datetime-local" value={dateValue(ticket.expected_start_date)} onChange={(event) => updateTicketField("expected_start_date", optional(event.target.value))} /></Field><Field label="Expected end"><input className="w-full bg-transparent text-white" type="datetime-local" value={dateValue(ticket.expected_end_date)} onChange={(event) => updateTicketField("expected_end_date", optional(event.target.value))} /></Field></div><Field label="Reason for delay"><textarea className="min-h-20 w-full bg-transparent text-zinc-200 outline-none" maxLength={1000} value={ticket.reason_for_delay ?? ""} onChange={(event) => updateTicketField("reason_for_delay", optional(event.target.value))} /></Field>{validation && <p className="text-sm text-red-300">{validation}</p>}</section>
            <aside className="w-[22rem] shrink-0"><section className="border border-zinc-800 bg-zinc-950/25 p-5"><h2 className="text-[10px] uppercase tracking-[.18em] text-zinc-500">Ticket data</h2><div className="mt-5 space-y-4"><Meta label="Ticket ID" value={ticket.id} /><Meta label="Project ID" value={ticket.project_id} /><Meta label="Created" value={formatDate(ticket.created_at)} /><Meta label="Updated" value={formatDate(ticket.updated_at)} /></div><button className="mt-6 inline-flex min-h-9 items-center gap-2 border border-red-400/60 px-3 text-[10px] uppercase tracking-[.12em] text-red-200 hover:bg-red-950/20" disabled={deletingTicket} onClick={() => setTicketDeleteOpen(true)} type="button">{deletingTicket ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}Delete ticket</button></section></aside>
        </div>
        <CommentsPanel comments={comments} commentBusy={commentBusy} commentText={commentText} deletingCommentId={deletingCommentId} editingCommentId={editingCommentId} editingText={editingText} loading={loadingComments} onAdd={addComment} onCancelEdit={() => { setEditingCommentId(null); setEditingText(""); }} onDelete={(id) => { setDeletingCommentId(id); setCommentDeleteOpen(true); }} onEdit={(comment) => { setEditingCommentId(comment.id); setEditingText(comment.description); }} onSave={saveComment} onTextChange={setCommentText} onEditTextChange={setEditingText} />
        <ConfirmModal busy={deletingTicket} confirmLabel="Delete ticket" description="This permanently deletes the ticket and its associated work history." onCancel={() => setTicketDeleteOpen(false)} onConfirm={() => void removeTicket()} open={ticketDeleteOpen} title="Delete ticket?" />
        <ConfirmModal busy={commentBusy} confirmLabel="Delete comment" description="This removes the comment from the ticket activity." onCancel={() => { setCommentDeleteOpen(false); setDeletingCommentId(null); }} onConfirm={() => void removeComment()} open={commentDeleteOpen} title="Delete comment?" />
    </div>;
}

function CommentsPanel({
    comments,
    commentBusy,
    commentText,
    deletingCommentId,
    editingCommentId,
    editingText,
    loading,
    onAdd,
    onCancelEdit,
    onDelete,
    onEdit,
    onSave,
    onTextChange,
    onEditTextChange,
}: {
    comments: Comment[];
    commentBusy: boolean;
    commentText: string;
    deletingCommentId: string | null;
    editingCommentId: string | null;
    editingText: string;
    loading: boolean;
    onAdd: (event: React.FormEvent) => void;
    onCancelEdit: () => void;
    onDelete: (id: string) => void;
    onEdit: (comment: Comment) => void;
    onSave: (comment: Comment) => Promise<void>;
    onTextChange: (value: string) => void;
    onEditTextChange: (value: string) => void;
}) {
    return (
        <section className="flex flex-col border border-zinc-800 bg-zinc-950/30">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-zinc-400" />
                    <h2 className="text-sm font-medium uppercase tracking-[.14em] text-zinc-200">
                        Comments
                    </h2>
                </div>

                <span className="text-xs text-zinc-500">
                    {comments.length} {comments.length === 1 ? "comment" : "comments"}
                </span>
            </div>

            {/* Comments */}
            <div className="flex-1 p-4">
                {loading ? (
                    <div className="flex min-h-24 items-center justify-center text-sm text-zinc-500">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading comments...
                    </div>
                ) : comments.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
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

                            return (
                                <article
                                    key={comment.id}
                                    className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 transition-colors hover:border-zinc-700"
                                >
                                    <div className="flex gap-4">
                                        {/* Avatar */}
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-xs font-semibold text-zinc-200">
                                            {initials}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-zinc-100">
                                                        {comment.name || "Team member"}
                                                    </p>

                                                    {comment.email && (
                                                        <p className="truncate text-xs text-zinc-500">
                                                            {comment.email}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex shrink-0 items-center gap-1 text-[11px] text-zinc-500">
                                                    <Clock3 className="h-3 w-3" />
                                                    {formatDate(
                                                        comment.updated_at || comment.created_at
                                                    )}
                                                </div>
                                            </div>

                                            {/* Body */}
                                            {editing ? (
                                                <>
                                                    <textarea
                                                        className="mt-4 min-h-28 w-full resize-y rounded-md border border-zinc-700 bg-zinc-950 p-3 text-sm leading-6 text-zinc-200 outline-none transition-colors focus:border-white"
                                                        value={editingText}
                                                        onChange={(e) =>
                                                            onEditTextChange(e.target.value)
                                                        }
                                                    />

                                                    <div className="mt-3 flex justify-end gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={onCancelEdit}
                                                            className="inline-flex items-center gap-1 text-xs uppercase tracking-[.12em] text-zinc-500 transition-colors hover:text-white"
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
                                                            className="inline-flex items-center gap-1 rounded border border-white px-3 py-1.5 text-xs uppercase tracking-[.12em] text-white disabled:opacity-40"
                                                        >
                                                            <Save className="h-3.5 w-3.5" />
                                                            Save
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="mt-4 max-w-prose whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                                                        {comment.description}
                                                    </div>

                                                    <div className="mt-4 flex gap-5">
                                                        <button
                                                            type="button"
                                                            onClick={() => onEdit(comment)}
                                                            className="inline-flex items-center gap-1 text-xs uppercase tracking-[.12em] text-zinc-500 transition-colors hover:text-white"
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
                                                            className="inline-flex items-center gap-1 text-xs uppercase tracking-[.12em] text-zinc-500 transition-colors hover:text-red-400 disabled:opacity-40"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Delete
                                                        </button>
                                                    </div>
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
                className="border-t border-zinc-800 bg-zinc-950/40 p-4"
            >
                <textarea
                    disabled={commentBusy}
                    value={commentText}
                    maxLength={5000}
                    onChange={(e) => onTextChange(e.target.value)}
                    placeholder="Leave a note for the team..."
                    className="min-h-28 w-full resize-y rounded-md border border-zinc-800 bg-zinc-900 p-3 text-sm leading-6 text-zinc-200 outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-600"
                />

                <div className="mt-3 flex justify-end">
                    <button
                        type="submit"
                        disabled={commentBusy || !commentText.trim()}
                        className="inline-flex items-center gap-2 rounded border border-white px-4 py-2 text-xs font-medium uppercase tracking-[.12em] text-white transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
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

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs uppercase tracking-[.14em] text-zinc-400"><span className="mb-2 block">{label}</span><div className="border border-zinc-700 bg-zinc-950 p-3 transition-colors hover:border-zinc-500 focus-within:border-white focus-within:ring-2 focus-within:ring-white/15">{children}</div></label>; }
function SelectField({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) { return <Field label={label}><select className="w-full bg-zinc-950 text-white outline-none [color-scheme:dark]" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option className="bg-zinc-950 text-white" key={option}>{option}</option>)}</select></Field>; }
function Meta({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] uppercase tracking-[.14em] text-zinc-600">{label}</p><p className="mt-1 break-all text-xs text-zinc-300">{value}</p></div>; }
function formatDate(value: string | null | undefined) { if (!value) return "Unknown date"; const date = new Date(value); return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
