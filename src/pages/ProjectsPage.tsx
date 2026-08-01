import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2, Plus } from "lucide-react";
import { getErrorMessage } from "../api/client";
import { createProject, listProjects } from "../api/projects";
import type { Project } from "../types/project";
import { useToast } from "../components/ui/Toast";
import ProjectecLoader from "../components/ui/ProjectecLoader";

export default function ProjectsPage() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]); const [name, setName] = useState(""); const [code, setCode] = useState(""); const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const load = async () => { if (!organizationId) return; setLoading(true); try { setProjects(await listProjects(organizationId)); } catch (err) { setError(getErrorMessage(err)); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [organizationId]);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (!organizationId) return; setSaving(true); setError(""); try { const project = await createProject(organizationId, { name: name.trim(), code: code.trim().toUpperCase(), description: description.trim() }); localStorage.setItem("activeProjectId", project.id); localStorage.setItem("activeProjectName", project.name); showToast("Project created"); navigate(`/organisations/${organizationId}/projects/${project.id}/tickets`); } catch (err) { setError(getErrorMessage(err)); } finally { setSaving(false); } };
  if (!organizationId) return <p className="text-red-300">Choose an organisation first.</p>;
  return <div className="space-y-8 font-['DM_Mono','Courier_New',monospace]">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#4a4a4a] pb-8"><div><Link className="text-xs uppercase tracking-[.18em] text-[#9a9a9a] hover:text-white" to="/organisations">← Organisations</Link><p className="mt-5 text-[10px] uppercase tracking-[.22em] text-[#9a9a9a]">02 — Organisation projects</p><h1 className="mt-4 font-['Instrument_Serif',Georgia,serif] text-6xl text-white">Projects</h1><p className="mt-4 text-sm text-[#9a9a9a]">Projects belong to this organisation. Open a project to see its tickets.</p></div><button className="inline-flex min-h-11 items-center gap-2 border border-[#f0ede6] bg-[#f0ede6] px-5 text-[11px] uppercase tracking-[.18em] text-black" onClick={() => setShowForm(!showForm)} type="button"><Plus className="h-4 w-4" /> New project</button></header>
    {showForm && <form className="grid gap-5 border border-[#333] p-5 md:grid-cols-2" onSubmit={submit}><input className="border-b border-[#555] bg-transparent p-3 text-white" minLength={3} onChange={e => setName(e.target.value)} placeholder="Project name" required value={name} /><input className="border-b border-[#555] bg-transparent p-3 uppercase text-white" maxLength={10} minLength={3} onChange={e => setCode(e.target.value)} placeholder="Code, e.g. JFY" required value={code} /><textarea className="border-b border-[#555] bg-transparent p-3 text-white md:col-span-2" maxLength={500} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" value={description} /><button className="w-fit border border-[#f0ede6] px-5 py-3 text-xs uppercase text-white disabled:opacity-50" disabled={saving} type="submit">{saving ? "Creating…" : "Create project"}</button></form>}
    {error && <p className="border-y border-red-500 py-3 text-sm text-red-300">{error}</p>}
    {loading ? <ProjectecLoader /> : projects.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{projects.map(project => <button className="min-h-40 border border-[#333] p-5 text-left hover:border-[#f0ede6]" key={project.id} onClick={() => { localStorage.setItem("activeProjectId", project.id); localStorage.setItem("activeProjectName", project.name); navigate(`/organisations/${organizationId}/projects/${project.id}/tickets`); }} type="button"><span className="text-xs uppercase text-[#b8b8b8]">{project.code}</span><h2 className="mt-5 font-['Instrument_Serif',Georgia,serif] text-3xl text-white">{project.name}</h2><p className="mt-3 text-sm text-[#9a9a9a]">{project.description || "No description"}</p></button>)}</div> : <div className="border border-dashed border-[#555] p-12 text-center text-[#9a9a9a]">No projects in this organisation yet.</div>}
  </div>;
}
