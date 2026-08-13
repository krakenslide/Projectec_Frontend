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
        <div className="max-w-2xl space-y-8 font-['Inter',ui-sans-serif,sans-serif]">
            <Link className="text-xs uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white" to={`/organisations/${organizationId}/projects/${projectId}/tickets`}>← Tickets</Link>
            <header><p className="text-[10px] uppercase tracking-[.18em] text-zinc-600 dark:text-zinc-400">Project administration</p><h1 className="mt-3 font-['Instrument_Serif',Georgia,serif] text-5xl leading-none text-zinc-900 dark:text-white">Project settings</h1></header>
            {error && <p className="border-y border-red-400/50 py-3 text-sm text-red-300">{error}</p>}
            <form className="space-y-5 border border-zinc-300 dark:border-zinc-700 p-5" onSubmit={saveProject}>
                <div><label className="mb-2 block text-xs uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-300" htmlFor="project-name">Project name</label><input className="w-full border-b border-zinc-400 dark:border-zinc-600 bg-transparent p-2 text-zinc-900 dark:text-white focus:border-zinc-900 dark:focus:border-white focus:outline-none" id="project-name" maxLength={127} minLength={3} onChange={(event) => setName(event.target.value)} required value={name} /></div>
                <div><label className="mb-2 block text-xs uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-300" htmlFor="project-description">Description</label><textarea className="min-h-28 w-full border-b border-zinc-400 dark:border-zinc-600 bg-transparent p-2 text-zinc-900 dark:text-white focus:border-zinc-900 dark:focus:border-white focus:outline-none" id="project-description" maxLength={500} onChange={(event) => setDescription(event.target.value)} value={description} /></div>
                {validationMessage && <p className="text-sm text-red-300">{validationMessage}</p>}
                <button className="inline-flex min-h-10 items-center gap-2 border border-zinc-900 dark:border-white px-4 text-xs uppercase tracking-[.14em] text-zinc-900 dark:text-white disabled:cursor-not-allowed disabled:opacity-40" disabled={!hasChanges || Boolean(validationMessage) || saving} type="submit">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? "Saving" : "Save changes"}</button>
            </form>
            <section className="border border-red-500/40 p-5"><div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" /><div><h2 className="text-lg text-zinc-900 dark:text-white">Delete project</h2><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">This action is permanent. The API may also delete associated tickets.</p></div></div><button className="mt-5 inline-flex min-h-10 items-center gap-2 border border-red-400/60 px-4 text-xs uppercase tracking-[.14em] text-red-200 disabled:cursor-not-allowed disabled:opacity-40" disabled={deleting || !project} onClick={() => setDeleteModalOpen(true)} type="button">{deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}{deleting ? "Deleting" : "Delete project"}</button></section>
            <ConfirmModal busy={deleting} confirmLabel="Delete project" description="This permanently deletes the project and may also delete its tickets." onCancel={() => setDeleteModalOpen(false)} onConfirm={() => void removeProject()} open={deleteModalOpen} requiredText={project?.code} title="Delete project?" />
        </div>
    );
}
