import { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  Grid2X2,
  LayoutList,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";

import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from "../api/projects";
import { getErrorMessage } from "../api/client";
import type { Project } from "../types/project";
import ProjectCard from "../components/ProjectCard";

const iconClass = "h-3.5 w-3.5 shrink-0";

function ErrorRule({ message }: { message: string }) {
  return (
    <div className="border-y border-[#b53a3a] py-3">
      <p className="m-0 flex items-start gap-2 text-[11px] leading-[1.6] tracking-[0.05em] text-[#b53a3a]">
        <AlertCircle className="mt-[2px] h-3.5 w-3.5 shrink-0" />
        <span>{message}</span>
      </p>
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
          ? "cursor-wait border-[#4a4a4a] bg-[#1c1c1c] text-[#555555]"
          : "cursor-pointer border-[#f0ede6] bg-[#f0ede6] text-[#080808] hover:bg-[#d8d5ce]",
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
        "inline-flex min-h-11 items-center justify-center gap-2 border border-[#4a4a4a] px-5 py-3",
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), 40);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setPageLoading(true);

      try {
        const data = await listProjects();
        if (!cancelled) setProjects(data);
      } catch (err: unknown) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (editingProject) {
        await updateProject(editingProject.id, {
          name,
          description: desc || null,
        });
      } else {
        await createProject(name, desc);
      }

      setName("");
      setDesc("");
      setShowForm(false);
      setEditingProject(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setError("");
    setName("");
    setDesc("");
    setEditingProject(null);
  };

  const startEdit = (project: Project) => {
    setEditingProject(project);
    setName(project.name);
    setDesc(project.description ?? "");
    setError("");
    setShowForm(true);
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Delete "${project.name}"? This will remove its issues too.`)) {
      return;
    }

    setError("");

    try {
      await deleteProject(project.id);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const openCreateForm = () => {
    if (showForm) {
      resetForm();
      return;
    }

    setEditingProject(null);
    setName("");
    setDesc("");
    setShowForm(true);
    setError("");
  };

  const hasSearch = searchQuery.trim().length > 0;
  const projectCountLabel = `${projects.length} ${projects.length === 1 ? "project" : "projects"
    } in your workspace`;

  return (
    <div
      className={[
        "space-y-[36px] font-['DM_Mono','Courier_New',monospace]",
        "transition-opacity duration-[550ms] ease-in",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      {/* Header */}
      <div className="border-b border-[#4a4a4a] pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="mb-[18px] text-[10px] uppercase tracking-[0.22em] text-[#9a9a9a]">
              01 — Workspace
            </p>

            <h1 className="font-['Instrument_Serif',Georgia,serif] text-[clamp(44px,4.5vw,72px)] font-normal leading-[0.95] tracking-[-0.01em] text-[#ffffff]">
              Projects
            </h1>

            <p className="mt-5 max-w-3xl text-[12px] leading-[1.85] text-[#9a9a9a]">
              {projectCountLabel}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative min-w-0 sm:w-72">
              <Search className="pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#b8b8b8]" />

              <input
                className={[
                  "w-full rounded-none border-0 border-b border-[#5a5a5a] bg-transparent",
                  "py-[11px] pl-6 pr-0 text-[14px] text-[#ffffff]",
                  "outline-none transition-colors duration-200",
                  "placeholder:text-[#5a5a5a] focus:border-[#ffffff]",
                ].join(" ")}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects"
                type="search"
                value={searchQuery}
              />
            </div>

            {/* View mode */}
            <div
              aria-label="Project view"
              className="inline-flex border border-[#4a4a4a]"
              role="group"
            >
              <button
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
                className={[
                  "inline-flex h-11 w-11 items-center justify-center border-r border-[#4a4a4a]",
                  "rounded-none bg-transparent transition-colors duration-200",
                  viewMode === "grid"
                    ? "bg-[#111111] text-[#ffffff]"
                    : "text-[#b8b8b8] hover:bg-[#111111] hover:text-[#ffffff]"
                ].join(" ")}
                onClick={() => setViewMode("grid")}
                type="button"
              >
                <Grid2X2 className="h-4 w-4" />
              </button>

              <button
                aria-label="List view"
                aria-pressed={viewMode === "list"}
                className={[
                  "inline-flex h-11 w-11 items-center justify-center",
                  "rounded-none bg-transparent transition-colors duration-200",
                  viewMode === "list"
                    ? "bg-[#111111] text-[#ffffff]"
                    : "text-[#b8b8b8] hover:bg-[#111111] hover:text-[#ffffff]"].join(" ")}
                onClick={() => setViewMode("list")}
                type="button"
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>

            {showForm ? (
              <SecondaryButton onClick={openCreateForm}>
                <X className={iconClass} />
                Cancel
              </SecondaryButton>
            ) : (
              <PrimaryButton onClick={openCreateForm}>
                <Plus className={iconClass} />
                New project
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit form */}
      {showForm ? (
        <section className="border border-[#1e1e1e] p-5">
          <div className="mb-8">
            <p className="mb-[18px] text-[10px] uppercase tracking-[0.22em] text-[#d8d5ce]">
              {editingProject ? "Project settings" : "Project intake"}
            </p>

            <h2 className="m-0 font-['Instrument_Serif',Georgia,serif] text-[36px] font-normal leading-[1.05] text-[#f0ede6]">
              {editingProject ? "Edit project" : "Create project"}
            </h2>

            <p className="mt-4 max-w-xl text-[12px] leading-[1.85] text-[#d8d5ce]">
              {editingProject
                ? "Update the project name and supporting context."
                : "Add a project to organize related delivery work."}
            </p>
          </div>

          {error ? (
            <div className="mb-8">
              <ErrorRule message={error} />
            </div>
          ) : null}

          <form className="flex flex-col gap-9" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="projectName"
                className="mb-[11px] block text-[10px] uppercase tracking-[0.22em] text-[#b8b8b8]"
              >
                Project name
              </label>

              <input
                id="projectName"
                autoFocus
                className={[
                  "w-full rounded-none border-0 border-b border-[#2a2a2a] bg-transparent",
                  "px-0 py-[11px] text-[14px] text-[#ffffff]",
                  "outline-none transition-colors duration-200",
                  "placeholder:text-[#5a5a5a] focus:border-[#ffffff]",
                ].join(" ")}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                required
                value={name}
              />
            </div>

            <div>
              <label
                htmlFor="projectDesc"
                className="mb-[11px] block text-[10px] uppercase tracking-[0.22em] text-[#b8b8b8]"
              >
                Description
              </label>

              <textarea
                id="projectDesc"
                className={[
                  "min-h-24 w-full resize-none rounded-none border-0 border-b border-[#5a5a5a]",
                  "bg-transparent px-0 py-[11px] text-[14px] leading-[1.7] text-[#ffffff]",
                  "outline-none transition-colors duration-200",
                  "placeholder:text-[#5a5a5a] focus:border-[#ffffff]",
                ].join(" ")}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Describe the project"
                rows={3}
                value={desc}
              />
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <PrimaryButton disabled={loading} type="submit">
                {loading ? (
                  <>
                    <Loader2 className={`${iconClass} animate-spin`} />
                    {editingProject ? "Saving" : "Creating"}
                  </>
                ) : (
                  <>
                    <Check className={iconClass} />
                    {editingProject ? "Save changes" : "Create project"}
                  </>
                )}
              </PrimaryButton>

              <SecondaryButton onClick={resetForm} type="button">
                <X className={iconClass} />
                Cancel
              </SecondaryButton>
            </div>
          </form>
        </section>
      ) : null}

      {!showForm && error ? <ErrorRule message={error} /> : null}

      {/* Content */}
      {pageLoading ? (
        <div className="flex min-h-[220px] items-center justify-center border border-[#1e1e1e]">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[#9a9a9a]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading projects
          </div>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
              : "flex flex-col gap-3"
          }
        >
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              onDelete={handleDelete}
              onEdit={startEdit}
              project={project}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <section className="flex min-h-[260px] flex-col items-center justify-center border border-dashed border-[#4a4a4a] px-6 py-12 text-center">
          <p className="mb-[18px] text-[10px] uppercase tracking-[0.22em] text-[#555555]">
            {hasSearch ? "No matching projects" : "No projects"}
          </p>

          <h2 className="m-0 font-['Instrument_Serif',Georgia,serif] text-[36px] font-normal leading-[1.05] text-[#f0ede6]">
            {hasSearch ? "Nothing found." : "Start with one project."}
          </h2>

          <p className="mt-4 max-w-md text-[12px] leading-[1.85] text-[#555555]">
            {hasSearch
              ? "Try a different project name or description."
              : "Create your first project to organize delivery work and track issues."}
          </p>

          {!hasSearch ? (
            <div className="mt-8">
              <PrimaryButton onClick={openCreateForm}>
                <Plus className={iconClass} />
                New project
              </PrimaryButton>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}