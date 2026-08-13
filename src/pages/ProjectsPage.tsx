import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Download, Loader2, Plus, Search, X } from "lucide-react";
import { getErrorMessage } from "../api/client";
import { createProject, listProjects } from "../api/projects";
import { downloadDailySummaryExcel } from "../api/analytics";
import type { Project } from "../types/project";
import { useToast } from "../components/ui/Toast";
import ProjectecLoader from "../components/ui/ProjectecLoader";

export default function ProjectsPage() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]); const [name, setName] = useState(""); const [code, setCode] = useState(""); const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState(""); const [query, setQuery] = useState(""); const [exporting, setExporting] = useState(false);
  const exportDailySummary = async () => {
    if (!organizationId || exporting) return;
    setExporting(true); setError("");
    try { const filename = await downloadDailySummaryExcel(organizationId); showToast(`Downloaded ${filename}`); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setExporting(false); }
  };
  const load = async () => { if (!organizationId) return; setLoading(true); try { setProjects(await listProjects(organizationId)); } catch (err) { setError(getErrorMessage(err)); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [organizationId]);
  const filteredProjects = useMemo(() => { const term = query.trim().toLowerCase(); return term ? projects.filter((project) => `${project.name} ${project.code} ${project.description ?? ""}`.toLowerCase().includes(term)) : projects; }, [projects, query]);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (!organizationId) return; setSaving(true); setError(""); try { const project = await createProject(organizationId, { name: name.trim(), code: code.trim().toUpperCase(), description: description.trim() }); localStorage.setItem("activeProjectId", project.id); localStorage.setItem("activeProjectName", project.name); showToast("Project created"); navigate(`/organisations/${organizationId}/projects/${project.id}/tickets`); } catch (err) { setError(getErrorMessage(err)); } finally { setSaving(false); } };
  if (!organizationId) return <p className="text-red-300">Choose an organisation first.</p>;
  return <div className="space-y-8 font-['Inter',ui-sans-serif,sans-serif]">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-8">
      <div>
        <Link className="text-xs uppercase tracking-[.18em] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white" to="/organisations">
          ← Organisations
        </Link>
        <p className="mt-5 text-[10px] uppercase tracking-[.22em] text-zinc-600 dark:text-zinc-400">
          02 — Organisation projects
        </p>
        <h1 className="mt-4 font-['Instrument_Serif',Georgia,serif] text-5xl leading-none text-zinc-900 dark:text-white">
          Projects
        </h1>
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Projects belong to this organisation. Open a project to see its tickets.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button className="inline-flex min-h-11 items-center gap-2 border border-zinc-300 px-4 text-[11px] uppercase tracking-[.18em] text-zinc-700 transition-colors hover:border-zinc-900 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-white" disabled={exporting} onClick={() => void exportDailySummary()} type="button">{exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} {exporting ? "Preparing…" : "Export daily summary"}</button>
        <button className="inline-flex min-h-11 items-center gap-2 border border-[#171717] dark:border-[#f5f3ee] bg-[#171717] dark:bg-[#f5f3ee] px-5 text-[11px] uppercase tracking-[.18em] text-white dark:text-zinc-900" onClick={() => setShowForm(!showForm)} type="button">{showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {showForm ? "Close form" : "New project"}</button>
      </div>
    </header>
    {showForm && <form className="grid gap-5 border border-[#a1a1aa] dark:border-[#333] p-5 md:grid-cols-2" onSubmit={submit}><input className="border-b border-[#a1a1aa] dark:border-[#555] bg-transparent p-3 text-zinc-900 dark:text-white" minLength={3} onChange={e => setName(e.target.value)} placeholder="Project name" required value={name} /><input className="border-b border-[#a1a1aa] dark:border-[#555] bg-transparent p-3 uppercase text-zinc-900 dark:text-white" maxLength={10} minLength={3} onChange={e => setCode(e.target.value)} placeholder="Code, e.g. JFY" required value={code} /><textarea className="border-b border-[#a1a1aa] dark:border-[#555] bg-transparent p-3 text-zinc-900 dark:text-white md:col-span-2" maxLength={500} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" value={description} /><button className="w-fit border border-[#171717] dark:border-[#f5f3ee] px-5 py-3 text-xs uppercase text-zinc-900 dark:text-white disabled:opacity-50" disabled={saving} type="submit">{saving ? "Creating…" : "Create project"}</button></form>}
    {error && <p className="border-y border-red-500 py-3 text-sm text-red-300">{error}</p>}
    {!loading && projects.length > 0 && <div className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800"><div className="relative max-w-md flex-1"><Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600 dark:text-zinc-300" /><input className="w-full border-b border-zinc-300 bg-transparent py-2 pl-6 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-900 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-400 dark:focus:border-white" onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" value={query} /></div><span className="shrink-0 text-[10px] uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-300">{filteredProjects.length} shown</span></div>}
    {loading ? <ProjectecLoader /> : projects.length ? filteredProjects.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredProjects.map(project => <button className="min-h-40 border border-[#a1a1aa] dark:border-[#333] p-5 text-left hover:border-[#171717] dark:hover:border-[#f5f3ee]" key={project.id} onClick={() => { localStorage.setItem("activeProjectId", project.id); localStorage.setItem("activeProjectName", project.name); navigate(`/organisations/${organizationId}/projects/${project.id}/tickets`); }} type="button"><span className="text-xs uppercase text-[#52525b] dark:text-[#b8b8b8]">{project.code}</span><h2 className="mt-5 font-['Instrument_Serif',Georgia,serif] text-3xl text-zinc-900 dark:text-white">{project.name}</h2><p className="mt-3 text-sm text-[#52525b] dark:text-[#9a9a9a]">{project.description || "No description"}</p></button>)}</div> : <div className="border border-dashed border-zinc-300 p-12 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">No projects match “{query}”.</div> : <div className="border border-dashed border-[#a1a1aa] dark:border-[#555] p-12 text-center text-[#52525b] dark:text-[#9a9a9a]">No projects in this organisation yet.</div>}
  </div>;
}
