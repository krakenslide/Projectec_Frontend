import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  AlertCircle,
  Edit3,
  Flag,
  Loader2,
  Plus,
  Save,
  X,
} from "lucide-react";

import { getBoard, getProject, updateProject } from "../api/projects";
import { createIssue, moveIssue } from "../api/issues";
import { getErrorMessage } from "../api/client";
import KanbanColumn from "../components/KanbanColumn";
import IssueCard from "../components/IssueCard";
import type { Board, Issue, IssuePriority, IssueStatus } from "../types/issue";
import type { Project } from "../types/project";

const COLUMNS: { label: string; status: IssueStatus }[] = [
  { label: "To Do", status: "TODO" },
  { label: "In Progress", status: "IN_PROGRESS" },
  { label: "Done", status: "DONE" },
];

const priorityOptions: { value: IssuePriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const iconClass = "h-3.5 w-3.5 shrink-0";

function ErrorRule({ message }: { message: string }) {
  return (
    <div className="border-y border-[#b53a3a] py-3">
      <p className="m-0 flex items-start gap-2 font-['DM_Mono','Courier_New',monospace] text-[11px] leading-[1.6] tracking-[0.05em] text-[#b53a3a]">
        <AlertCircle className="mt-[2px] h-3.5 w-3.5 shrink-0" />
        <span>{message}</span>
      </p>
    </div>
  );
}

function SpinnerLabel({ label }: { label: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center border border-[#1e1e1e]">
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[#555555]">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {label}
      </div>
    </div>
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
        "inline-flex min-h-11 items-center justify-center gap-2 border px-5 py-3",
        "rounded-none font-['DM_Mono','Courier_New',monospace]",
        "text-[11px] uppercase tracking-[0.22em]",
        "transition-colors duration-200",
        disabled
          ? "cursor-wait border-[#252525] bg-[#1c1c1c] text-[#555555]"
          : "border-[#f0ede6] bg-[#f0ede6] text-[#080808] hover:bg-[#d8d5ce]",
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
        "inline-flex min-h-11 items-center justify-center gap-2 border border-[#252525] px-5 py-3",
        "rounded-none bg-transparent font-['DM_Mono','Courier_New',monospace]",
        "text-[11px] uppercase tracking-[0.18em] text-[#f0ede6]",
        "transition-colors duration-200 hover:border-[#555555]",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function FormShell({
  kicker,
  title,
  description,
  error,
  children,
}: {
  kicker: string;
  title: string;
  description: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-[#1e1e1e] p-5">
      <div className="mb-8">
        <p className="mb-[18px] text-[10px] uppercase tracking-[0.22em] text-[#555555]">
          {kicker}
        </p>

        <h2 className="m-0 font-['Instrument_Serif',Georgia,serif] text-[36px] font-normal leading-[1.05] text-[#f0ede6]">
          {title}
        </h2>

        <p className="mt-4 max-w-xl text-[12px] leading-[1.85] text-[#555555]">
          {description}
        </p>
      </div>

      {error ? <div className="mb-8"><ErrorRule message={error} /></div> : null}

      {children}
    </section>
  );
}

export default function ProjectBoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [priority, setPriority] = useState<IssuePriority>("MEDIUM");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), 40);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    const load = async () => {
      try {
        const [proj, b] = await Promise.all([
          getProject(projectId),
          getBoard(projectId),
        ]);

        if (!cancelled) {
          setProject(proj);
          setBoard(b);
          setProjectName(proj.name);
          setProjectDesc(proj.description ?? "");
        }
      } catch (err: unknown) {
        if (!cancelled) setError(getErrorMessage(err));
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [projectId, refreshTrigger]);

  const refresh = () => setRefreshTrigger((prev) => prev + 1);

  const handleDragStart = (event: DragStartEvent) => {
    if (!board) return;

    const all = [...board.TODO, ...board.IN_PROGRESS, ...board.DONE];
    const issue = all.find((i) => i.id === event.active.id);

    if (issue) setActiveIssue(issue);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveIssue(null);

    const { active, over } = event;
    if (!over || !board) return;

    const issueId = active.id as string;
    const targetStatus = over.id as IssueStatus;

    const all = [...board.TODO, ...board.IN_PROGRESS, ...board.DONE];
    const issue = all.find((i) => i.id === issueId);

    if (!issue || issue.status === targetStatus) return;

    const targetIssues = board[targetStatus];
    const maxPos = targetIssues.length
      ? Math.max(...targetIssues.map((i) => i.position))
      : 0;

    try {
      await moveIssue(issueId, targetStatus, maxPos + 1000);
      refresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    setError("");
    setLoading(true);

    try {
      await createIssue(title, desc, priority, projectId);
      setTitle("");
      setDesc("");
      setPriority("MEDIUM");
      setShowForm(false);
      refresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    setError("");
    setLoading(true);

    try {
      const updated = await updateProject(projectId, {
        name: projectName,
        description: projectDesc || null,
      });

      setProject(updated);
      setShowProjectForm(false);
      refresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setError("");
    setTitle("");
    setDesc("");
    setPriority("MEDIUM");
  };

  const resetProjectForm = () => {
    setShowProjectForm(false);
    setProjectName(project?.name ?? "");
    setProjectDesc(project?.description ?? "");
    setError("");
  };

  const totalIssues = board
    ? board.TODO.length + board.IN_PROGRESS.length + board.DONE.length
    : 0;

  return (
    <div
      className={[
        "space-y-[36px] font-['DM_Mono','Courier_New',monospace]",
        "transition-opacity duration-[550ms] ease-in",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      {/* Header */}
      <div className="border-b border-[#1e1e1e] pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="mb-[18px] text-[10px] uppercase tracking-[0.22em] text-[#555555]">
              02 — Project board
            </p>

            <h1 className="truncate font-['Instrument_Serif',Georgia,serif] text-[clamp(44px,4.5vw,72px)] font-normal leading-[0.95] tracking-[-0.01em] text-[#f0ede6]">
              {project?.name ?? "Loading project"}
            </h1>

            <p className="mt-5 max-w-3xl text-[12px] leading-[1.85] text-[#555555]">
              {project?.description || `${totalIssues} issues on this board`}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <SecondaryButton
              onClick={() => {
                if (showProjectForm) {
                  resetProjectForm();
                  return;
                }

                setProjectName(project?.name ?? "");
                setProjectDesc(project?.description ?? "");
                setShowProjectForm(true);
                setShowForm(false);
                setError("");
              }}
            >
              {showProjectForm ? (
                <>
                  <X className={iconClass} />
                  Cancel
                </>
              ) : (
                <>
                  <Edit3 className={iconClass} />
                  Edit project
                </>
              )}
            </SecondaryButton>

            {showForm ? (
              <SecondaryButton
                onClick={() => {
                  setShowForm(false);
                  setShowProjectForm(false);
                  setError("");
                }}
              >
                <X className={iconClass} />
                Cancel
              </SecondaryButton>
            ) : (
              <PrimaryButton
                onClick={() => {
                  setShowForm(true);
                  setShowProjectForm(false);
                  setError("");
                }}
              >
                <Plus className={iconClass} />
                New issue
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>

      {/* Edit project form */}
      {showProjectForm ? (
        <FormShell
          kicker="Project settings"
          title="Edit project"
          description="Update the board name and supporting context."
          error={error}
        >
          <form className="flex flex-col gap-9" onSubmit={handleUpdateProject}>
            <div>
              <label
                htmlFor="projectName"
                className="mb-[11px] block text-[10px] uppercase tracking-[0.22em] text-[#555555]"
              >
                Project name
              </label>

              <input
                id="projectName"
                className="w-full rounded-none border-0 border-b border-[#2a2a2a] bg-transparent px-0 py-[11px] text-[14px] text-[#f0ede6] outline-none transition-colors duration-200 placeholder:text-[#2e2e2e] focus:border-[#f0ede6]"
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                required
                value={projectName}
              />
            </div>

            <div>
              <label
                htmlFor="projectDesc"
                className="mb-[11px] block text-[10px] uppercase tracking-[0.22em] text-[#555555]"
              >
                Description
              </label>

              <textarea
                id="projectDesc"
                className="min-h-24 w-full resize-none rounded-none border-0 border-b border-[#2a2a2a] bg-transparent px-0 py-[11px] text-[14px] leading-[1.7] text-[#f0ede6] outline-none transition-colors duration-200 placeholder:text-[#2e2e2e] focus:border-[#f0ede6]"
                onChange={(e) => setProjectDesc(e.target.value)}
                placeholder="Describe your project"
                rows={3}
                value={projectDesc}
              />
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <PrimaryButton disabled={loading} type="submit">
                {loading ? (
                  <>
                    <Loader2 className={`${iconClass} animate-spin`} />
                    Saving
                  </>
                ) : (
                  <>
                    <Save className={iconClass} />
                    Save changes
                  </>
                )}
              </PrimaryButton>

              <SecondaryButton onClick={resetProjectForm} type="button">
                <X className={iconClass} />
                Cancel
              </SecondaryButton>
            </div>
          </form>
        </FormShell>
      ) : null}

      {/* New issue form */}
      {showForm ? (
        <FormShell
          kicker="Issue intake"
          title="New issue"
          description="Add a task to the board and choose its initial priority."
          error={error}
        >
          <form className="flex flex-col gap-9" onSubmit={handleCreateIssue}>
            <div>
              <label
                htmlFor="issueTitle"
                className="mb-[11px] block text-[10px] uppercase tracking-[0.22em] text-[#555555]"
              >
                Issue title
              </label>

              <input
                id="issueTitle"
                autoFocus
                className="w-full rounded-none border-0 border-b border-[#2a2a2a] bg-transparent px-0 py-[11px] text-[14px] text-[#f0ede6] outline-none transition-colors duration-200 placeholder:text-[#2e2e2e] focus:border-[#f0ede6]"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                required
                value={title}
              />
            </div>

            <div>
              <label
                htmlFor="issueDesc"
                className="mb-[11px] block text-[10px] uppercase tracking-[0.22em] text-[#555555]"
              >
                Description
              </label>

              <textarea
                id="issueDesc"
                className="min-h-24 w-full resize-none rounded-none border-0 border-b border-[#2a2a2a] bg-transparent px-0 py-[11px] text-[14px] leading-[1.7] text-[#f0ede6] outline-none transition-colors duration-200 placeholder:text-[#2e2e2e] focus:border-[#f0ede6]"
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Add details"
                rows={3}
                value={desc}
              />
            </div>

            <div>
              <div className="mb-[11px] text-[10px] uppercase tracking-[0.22em] text-[#555555]">
                Priority
              </div>

              <div className="flex flex-wrap gap-3">
                {priorityOptions.map((option) => {
                  const selected = priority === option.value;

                  return (
                    <button
                      className={[
                        "inline-flex min-h-11 items-center gap-2 border px-4",
                        "rounded-none bg-transparent font-['DM_Mono','Courier_New',monospace]",
                        "text-[11px] uppercase tracking-[0.18em]",
                        "transition-colors duration-200",
                        selected
                          ? "border-[#f0ede6] text-[#f0ede6]"
                          : "border-[#252525] text-[#555555] hover:border-[#555555] hover:text-[#f0ede6]",
                      ].join(" ")}
                      key={option.value}
                      onClick={() => setPriority(option.value)}
                      type="button"
                    >
                      <Flag className={iconClass} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <PrimaryButton disabled={loading} type="submit">
                {loading ? (
                  <>
                    <Loader2 className={`${iconClass} animate-spin`} />
                    Creating
                  </>
                ) : (
                  <>
                    <Plus className={iconClass} />
                    Create issue
                  </>
                )}
              </PrimaryButton>

              <SecondaryButton onClick={resetForm} type="button">
                <X className={iconClass} />
                Cancel
              </SecondaryButton>
            </div>
          </form>
        </FormShell>
      ) : null}

      {!showForm && !showProjectForm && error ? (
        <ErrorRule message={error} />
      ) : null}

      {/* Board */}
      {board ? (
        <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
            {COLUMNS.map(({ label, status }) => (
              <KanbanColumn
                allIssues={board}
                issues={board[status]}
                key={status}
                onRefresh={refresh}
                status={status}
                title={label}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeIssue && board ? (
              <div className="pointer-events-none opacity-95">
                <IssueCard
                  allIssues={board}
                  issue={activeIssue}
                  onRefresh={() => { }}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <SpinnerLabel label="Loading board" />
      )}
    </div>
  );
}