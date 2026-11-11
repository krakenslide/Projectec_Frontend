import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, Loader2, Save, Trash2 } from "lucide-react";
import { getErrorMessage } from "../api/client";
import { deleteProject, getProject, updateProject } from "../api/projects";
import type { Project } from "../types/project";
import ConfirmModal from "../components/ui/ConfirmModal";
import { useToast } from "../components/ui/Toast";

export default function ProjectSettingsPage() {
  const { organizationId, projectId } = useParams<{ organizationId: string; projectId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;
    void getProject(projectId)
      .then((nextProject) => {
        setProject(nextProject);
        setName(nextProject.name);
        setDescription(nextProject.description ?? "");
      })
      .catch((err: unknown) => setError(getErrorMessage(err)));
  }, [projectId]);

  const validationMessage = useMemo(() => {
    const trimmedName = name.trim();
    if (trimmedName.length < 3) return "Project name must contain at least 3 characters.";
    if (trimmedName.length > 127) return "Project name cannot exceed 127 characters.";
    if (description.length > 500) return "Description cannot exceed 500 characters.";
    return "";
  }, [description, name]);

  const hasChanges = project !== null && (name.trim() !== project.name || description !== (project.description ?? ""));

  const saveProject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectId || !hasChanges || validationMessage) return;
    setError("");
    setSaving(true);
    try {
      setProject(await updateProject(projectId, { name: name.trim(), description: description.trim() || null }));
      showToast("Project settings saved");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const removeProject = async () => {
    if (!projectId || !organizationId || deleting || !project) return;
    setError("");
    setDeleting(true);
    try {
      await deleteProject(projectId);
      showToast("Project deleted");
      setDeleteModalOpen(false);
      navigate(`/organisations/${organizationId}/projects`, { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setDeleting(false);
    }
  };

  return (
    <div className="pj-app-page pj-settings-page w-full max-w-4xl space-y-9 font-['Inter',ui-sans-serif,sans-serif">
      <Link className="pj-dashboard-link inline-flex" to={`/organisations/${organizationId}/projects/${projectId}/tickets`}>← Project work</Link>

      <header className="border-b border-[var(--pj-border)] pb-8">
        <p className="pj-dashboard-eyebrow">Project · Administration</p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-[var(--font-serif)] text-5xl leading-[.94] text-[var(--pj-text)] sm:text-6xl">Project settings.</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--pj-muted)]">Keep the project identity and description accurate. Changes apply to the existing project.</p>
          </div>
          {project && <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[.16em] text-[var(--pj-dim)]">{project.code}</span>}
        </div>
      </header>

      {error && <p className="border-y border-[color:var(--pj-red)]/45 py-3 text-sm text-[var(--pj-red)]">{error}</p>}

      <form className="pj-settings-surface overflow-hidden shadow-[var(--shadow-panel)]" onSubmit={saveProject}>
        <div className="border-b border-[var(--pj-border)] px-5 py-4 sm:px-6">
          <p className="pj-dashboard-eyebrow">Identity</p>
          <p className="mt-1 text-sm text-[var(--pj-muted)]">The information shown throughout the project workspace.</p>
        </div>
        <div className="space-y-7 p-5 sm:p-6">
          <label className="pj-settings-field block" htmlFor="project-name">
            <span className="mb-[10px] block font-[var(--font-mono)] text-[9px] leading-none font-medium tracking-[.16em] text-[var(--pj-muted)] uppercase">Project name</span>
            <input className="w-full rounded-none border border-[var(--pj-input-border)] bg-[var(--pj-panel-raised)] px-[14px] py-[13px] text-sm leading-[1.6] text-[var(--pj-text)] outline-none focus:border-[var(--pj-lime)] focus:shadow-[inset_0_0_0_1px_var(--pj-lime)]" id="project-name" maxLength={127} minLength={3} onChange={(event) => setName(event.target.value)} required value={name} />
          </label>
          <label className="pj-settings-field block" htmlFor="project-description">
            <span className="mb-[10px] block font-[var(--font-mono)] text-[9px] leading-none font-medium tracking-[.16em] text-[var(--pj-muted)] uppercase">Description</span>
            <textarea className="min-h-[130px] w-full resize-y rounded-none border border-[var(--pj-input-border)] bg-[var(--pj-panel-raised)] px-[14px] py-[13px] text-sm leading-[1.6] text-[var(--pj-text)] outline-none focus:border-[var(--pj-lime)] focus:shadow-[inset_0_0_0_1px_var(--pj-lime)]" id="project-description" maxLength={500} onChange={(event) => setDescription(event.target.value)} value={description} />
            <small className="mt-1.5 block font-[var(--font-mono)] text-[10px] text-[var(--pj-dim)]">{description.length}/500</small>
          </label>
          {validationMessage && <p className="text-xs text-[var(--pj-red)]">{validationMessage}</p>}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--pj-border)] pt-5">
            <p className="text-[10px] uppercase tracking-[.13em] text-[var(--pj-dim)]">Unsaved changes are kept local until saved.</p>
            <button className="pj-settings-primary inline-flex min-h-[42px] items-center gap-[9px] rounded-none border border-[var(--pj-lime-vivid)] bg-[var(--pj-lime-vivid)] px-[17px] text-[10px] font-bold tracking-[.14em] text-[var(--pj-on-lime)] uppercase transition-[background-color,box-shadow] duration-[160ms] ease-[var(--ease-pj)] enabled:hover:bg-[var(--pj-lime-vivid-strong)] enabled:hover:shadow-[0_8px_28px_var(--pj-lime-glow)] disabled:cursor-not-allowed disabled:opacity-40" disabled={!hasChanges || Boolean(validationMessage) || saving} type="submit">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving" : "Save changes"}
            </button>
          </div>
        </div>
      </form>

      <section className="pj-danger-surface border border-[color-mix(in_srgb,var(--pj-red)_42%,var(--pj-border))] bg-[color-mix(in_srgb,var(--pj-red)_4%,var(--pj-panel))] px-6 py-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--pj-red)]" />
            <div>
              <p className="pj-dashboard-eyebrow text-[var(--pj-red)]">Destructive action</p>
              <h2 className="mt-2 font-[var(--font-serif)] text-2xl text-[var(--pj-text)]">Delete project</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--pj-muted)]">This action is permanent. The existing API may also remove associated tickets.</p>
            </div>
          </div>
          <button className="pj-settings-danger inline-flex min-h-10 shrink-0 items-center gap-2 rounded-none border border-[color-mix(in_srgb,var(--pj-red)_58%,var(--pj-border))] bg-transparent px-[14px] text-[10px] font-semibold tracking-[.13em] text-[var(--pj-red)] uppercase transition-colors duration-[160ms] ease-[var(--ease-pj)] enabled:hover:bg-[color-mix(in_srgb,var(--pj-red)_9%,transparent)] disabled:cursor-not-allowed" disabled={deleting || !project} onClick={() => setDeleteModalOpen(true)} type="button">
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {deleting ? "Deleting" : "Delete project"}
          </button>
        </div>
      </section>

      <ConfirmModal busy={deleting} confirmLabel="Delete project" description="This permanently deletes the project and may also delete its tickets." onCancel={() => setDeleteModalOpen(false)} onConfirm={() => void removeProject()} open={deleteModalOpen} requiredText={project?.code} title="Delete project?" />
    </div>
  );
}
