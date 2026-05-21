import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Check,
  ChevronsUpDown,
  Edit3,
  Flag,
  Loader2,
  MoveRight,
  Trash2,
  X,
} from "lucide-react";

import {
  deleteIssue,
  moveIssue,
  updateIssue,
  updateIssueStatus,
} from "../api/issues";
import { getErrorMessage } from "../api/client";
import type { Issue, IssuePriority, IssueStatus } from "../types/issue";
import { getIssuePriorityTone, issuePriorityTone } from "../utils/issuePriority";

interface Props {
  issue: Issue;
  allIssues: Record<IssueStatus, Issue[]>;
  onRefresh: () => void;
}

const moveConfig: { status: IssueStatus; label: string; tip: string }[] = [
  { status: "TODO", label: "Todo", tip: "Move to To Do" },
  { status: "IN_PROGRESS", label: "Start", tip: "Move to In Progress" },
  { status: "DONE", label: "Done", tip: "Move to Done" },
];

const statusOptions: { value: IssueStatus; label: string }[] = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

const priorityOptions: { value: IssuePriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const iconClass = "h-3.5 w-3.5 shrink-0";

function IconButton({
  children,
  label,
  onClick,
  title,
  dragProps,
  danger = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  title?: string;
  dragProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  danger?: boolean;
}) {
  return (
    <button
      {...dragProps}
      aria-label={label}
      className={[
        "inline-flex h-8 w-8 items-center justify-center border border-transparent bg-transparent",
        "rounded-none transition-all duration-200",
        danger
          ? "text-[#9a9a9a] hover:border-[#d36b6b] hover:bg-[#1a0d0d] hover:text-[#ffb3b3]"
          : "text-[#b8b8b8] hover:border-[#8a8a8a] hover:bg-[#111111] hover:text-[#ffffff]",
        dragProps?.className ?? "",
      ].join(" ")}
      onClick={onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}

function PrimaryButton({
  children,
  disabled,
  type = "button",
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      type={type}
      className={[
        "inline-flex min-h-10 items-center justify-center gap-2 border px-4 py-2.5",
        "rounded-none font-['DM_Mono','Courier_New',monospace]",
        "text-[11px] uppercase tracking-[0.22em]",
        "transition-all duration-200",
        disabled
          ? "cursor-wait border-[#4a4a4a] bg-[#1c1c1c] text-[#7a7a7a]"
          : "border-[#f0ede6] bg-[#f0ede6] text-[#080808] hover:bg-[#ffffff]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  disabled,
  type = "button",
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      type={type}
      className={[
        "inline-flex min-h-10 items-center justify-center gap-2 border border-[#4a4a4a] px-4 py-2.5",
        "rounded-none bg-transparent font-['DM_Mono','Courier_New',monospace]",
        "text-[11px] uppercase tracking-[0.18em] text-[#d8d5ce]",
        "transition-all duration-200 hover:border-[#8a8a8a] hover:bg-[#111111] hover:text-[#ffffff]",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function OptionButton({
  selected,
  children,
  onClick,
  tone,
}: {
  selected: boolean;
  children: React.ReactNode;
  onClick: () => void;
  tone?: {
    borderClass: string;
    textClass: string;
    hoverBorderClass: string;
    hoverTextClass: string;
    bgClass: string;
  };
}) {
  return (
    <button
      className={[
        "inline-flex min-h-9 items-center gap-2 border px-3",
        "rounded-none bg-transparent font-['DM_Mono','Courier_New',monospace]",
        "text-[10px] uppercase tracking-[0.18em]",
        "transition-all duration-200",
        selected && tone
          ? [tone.borderClass, tone.textClass, tone.bgClass].join(" ")
          : selected
            ? "border-[#f0ede6] text-[#ffffff]"
            : tone
              ? [
                "border-[#4a4a4a] text-[#b8b8b8]",
                "hover:bg-[#111111]",
                tone.hoverBorderClass,
                tone.hoverTextClass,
              ].join(" ")
              : "border-[#4a4a4a] text-[#b8b8b8] hover:border-[#8a8a8a] hover:bg-[#111111] hover:text-[#ffffff]",
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ErrorRule({ message }: { message: string }) {
  return (
    <div className="border-y border-[#d36b6b] py-3">
      <p className="m-0 text-[11px] leading-[1.6] tracking-[0.05em] text-[#ffb3b3]">
        {message}
      </p>
    </div>
  );
}

export default function IssueCard({
  issue,
  allIssues,
  onRefresh,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: issue.id, data: { issue } });

  const style = { transform: CSS.Translate.toString(transform) };
  const priorityMeta = getIssuePriorityTone(issue.priority);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description ?? "");
  const [priority, setPriority] = useState<IssuePriority>(issue.priority);
  const [status, setStatus] = useState<IssueStatus>(issue.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleMove = async (targetStatus: IssueStatus) => {
    if (targetStatus === issue.status) return;

    setError("");

    const targetIssues = allIssues[targetStatus];
    const maxPos = targetIssues.length
      ? Math.max(...targetIssues.map((i) => i.position))
      : 0;

    try {
      await moveIssue(issue.id, targetStatus, maxPos + 1000);
      onRefresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const startEdit = () => {
    setError("");
    setTitle(issue.title);
    setDescription(issue.description ?? "");
    setPriority(issue.priority);
    setStatus(issue.status);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setError("");
    setTitle(issue.title);
    setDescription(issue.description ?? "");
    setPriority(issue.priority);
    setStatus(issue.status);
    setIsEditing(false);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      await updateIssue(issue.id, {
        title,
        description: description || null,
        priority,
      });

      if (status !== issue.status) {
        await updateIssueStatus(issue.id, status);
      }

      setIsEditing(false);
      onRefresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this issue?")) return;

    setError("");

    try {
      await deleteIssue(issue.id);
      onRefresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={[
        "group border bg-transparent p-4",
        "font-['DM_Mono','Courier_New',monospace]",
        "transition-all duration-200",
        priorityMeta.borderClass,
        isDragging
          ? "z-50 opacity-80"
          : "hover:border-[#8a8a8a] hover:bg-[#101010]",
      ].join(" ")}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <IconButton
          dragProps={{
            ...listeners,
            ...attributes,
            className: "cursor-grab active:cursor-grabbing",
          }}
          label="Drag issue"
          title="Drag to move"
        >
          <ChevronsUpDown className={iconClass} />
        </IconButton>

        <div className="flex items-center gap-1">
          <IconButton
            label="Edit issue"
            onClick={startEdit}
            title="Edit issue"
          >
            <Edit3 className={iconClass} />
          </IconButton>

          <IconButton
            danger
            label="Delete issue"
            onClick={handleDelete}
            title="Delete issue"
          >
            <Trash2 className={iconClass} />
          </IconButton>
        </div>
      </div>

      {error ? (
        <div className="mb-4">
          <ErrorRule message={error} />
        </div>
      ) : null}

      {isEditing ? (
        <form className="flex flex-col gap-6" onSubmit={handleSave}>
          <div>
            <label
              htmlFor={`issue-title-${issue.id}`}
              className="mb-[11px] block text-[10px] uppercase tracking-[0.22em] text-[#9a9a9a]"
            >
              Title
            </label>

            <input
              id={`issue-title-${issue.id}`}
              autoFocus
              className="w-full rounded-none border-0 border-b border-[#5a5a5a] bg-transparent px-0 py-[11px] text-[14px] text-[#ffffff] outline-none transition-colors duration-200 placeholder:text-[#5a5a5a] focus:border-[#ffffff]"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Issue title"
              required
              value={title}
            />
          </div>

          <div>
            <label
              htmlFor={`issue-description-${issue.id}`}
              className="mb-[11px] block text-[10px] uppercase tracking-[0.22em] text-[#9a9a9a]"
            >
              Description
            </label>

            <textarea
              id={`issue-description-${issue.id}`}
              className="min-h-24 w-full resize-none rounded-none border-0 border-b border-[#5a5a5a] bg-transparent px-0 py-[11px] text-[14px] leading-[1.7] text-[#f0ede6] outline-none transition-colors duration-200 placeholder:text-[#5a5a5a] focus:border-[#ffffff]"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
              rows={3}
              value={description}
            />
          </div>

          <div>
            <div className="mb-[11px] text-[10px] uppercase tracking-[0.22em] text-[#9a9a9a]">
              Priority
            </div>

            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((opt) => {
                const tone = issuePriorityTone[opt.value];

                return (
                  <OptionButton
                    key={opt.value}
                    selected={priority === opt.value}
                    onClick={() => setPriority(opt.value)}
                    tone={tone}
                  >
                    <span
                      className={[
                        "h-1.5 w-1.5",
                        tone.dotClass,
                      ].join(" ")}
                    />
                    <Flag className="h-3 w-3 shrink-0" />
                    {tone.label}
                  </OptionButton>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-[11px] text-[10px] uppercase tracking-[0.22em] text-[#9a9a9a]">
              Status
            </div>

            <div className="flex flex-wrap gap-2">
              {statusOptions.map((opt) => (
                <OptionButton
                  key={opt.value}
                  selected={status === opt.value}
                  onClick={() => setStatus(opt.value)}
                >
                  {opt.label}
                </OptionButton>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <PrimaryButton disabled={saving} type="submit">
              {saving ? (
                <>
                  <Loader2 className={`${iconClass} animate-spin`} />
                  Saving
                </>
              ) : (
                <>
                  <Check className={iconClass} />
                  Save
                </>
              )}
            </PrimaryButton>

            <SecondaryButton onClick={cancelEdit} type="button">
              <X className={iconClass} />
              Cancel
            </SecondaryButton>
          </div>
        </form>
      ) : (
        <>
          <p className="pr-2 text-[14px] font-normal leading-[1.6] text-[#ffffff]">
            {issue.title}
          </p>

          {issue.description ? (
            <p className="mt-3 line-clamp-3 text-[12px] leading-[1.85] text-[#9a9a9a]">
              {issue.description}
            </p>
          ) : null}

          <div className="mt-5 border-t border-[#3a3a3a] pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span
                className={[
                  "inline-flex min-h-8 items-center gap-2 border px-3",
                  "text-[10px] uppercase tracking-[0.18em]",
                  "transition-all duration-200",
                  priorityMeta.borderClass,
                  priorityMeta.textClass,
                  priorityMeta.bgClass,
                  priorityMeta.hoverBorderClass,
                  priorityMeta.hoverTextClass,
                ].join(" ")}
              >
                <span
                  className={[
                    "h-1.5 w-1.5",
                    priorityMeta.dotClass,
                  ].join(" ")}
                />
                <Flag className="h-3 w-3 shrink-0" />
                {priorityMeta.label}
              </span>

              <div className="flex flex-wrap justify-end gap-2">
                {moveConfig
                  .filter((m) => m.status !== issue.status)
                  .map((m) => (
                    <button
                      className={[
                        "inline-flex min-h-8 items-center gap-1.5 border border-transparent px-2",
                        "rounded-none bg-transparent text-[10px] uppercase tracking-[0.16em]",
                        "text-[#b8b8b8] transition-colors duration-200",
                        "hover:border-[#8a8a8a] hover:bg-[#111111] hover:text-[#ffffff]",
                      ].join(" ")}
                      key={m.status}
                      onClick={() => handleMove(m.status)}
                      title={m.tip}
                      type="button"
                    >
                      {m.label}
                      <MoveRight className="h-3 w-3 shrink-0" />
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
    </article>
  );
}