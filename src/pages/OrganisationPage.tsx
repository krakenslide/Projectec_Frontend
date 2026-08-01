import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Loader2, Plus } from "lucide-react";
import { getErrorMessage } from "../api/client";
import { createOrganisation, listOrganisations } from "../api/organisation";
import type { Organisation } from "../types/organisation";
import { useToast } from "../components/ui/Toast";

export default function OrganisationPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try { setOrganisations(await listOrganisations()); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const openOrganisation = (org: Organisation) => {
    localStorage.setItem("activeOrgId", org.id);
    localStorage.setItem("activeOrgName", org.name);
    localStorage.removeItem("activeProjectId");
    localStorage.removeItem("activeProjectName");
    navigate(`/organisations/${org.id}/projects`);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setSaving(true);
    try { openOrganisation(await createOrganisation(name.trim(), description.trim())); showToast("Organisation created"); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  return <div className="space-y-8 font-['DM_Mono','Courier_New',monospace]">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#4a4a4a] pb-8">
      <div><p className="mb-4 text-[10px] uppercase tracking-[.22em] text-[#9a9a9a]">01 — Workspace</p><h1 className="font-['Instrument_Serif',Georgia,serif] text-6xl text-white">Organisations</h1><p className="mt-4 text-sm text-[#9a9a9a]">Select an organisation before creating or viewing its projects.</p></div>
      <button className="inline-flex min-h-11 items-center gap-2 border border-[#f0ede6] bg-[#f0ede6] px-5 text-[11px] uppercase tracking-[.18em] text-black" onClick={() => setShowForm(!showForm)} type="button"><Plus className="h-4 w-4" /> New organisation</button>
    </header>
    {showForm && <form className="space-y-5 border border-[#333] p-5" onSubmit={submit}><h2 className="text-lg text-white">Create organisation</h2><input className="w-full border-b border-[#555] bg-transparent p-3 text-white" minLength={3} onChange={e => setName(e.target.value)} placeholder="Organisation name" required value={name} /><textarea className="w-full border-b border-[#555] bg-transparent p-3 text-white" maxLength={500} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" value={description} /><button className="border border-[#f0ede6] px-5 py-3 text-xs uppercase text-white disabled:opacity-50" disabled={saving} type="submit">{saving ? "Creating…" : "Create and open projects"}</button></form>}
    {error && <p className="border-y border-red-500 py-3 text-sm text-red-300">{error}</p>}
    {loading ? <div className="flex min-h-48 items-center justify-center text-sm text-[#9a9a9a]"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading organisations</div> : organisations.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{organisations.map(org => <button className="min-h-40 border border-[#333] p-5 text-left hover:border-[#f0ede6]" key={org.id} onClick={() => openOrganisation(org)} type="button"><Building2 className="mb-8 h-5 w-5 text-[#b8b8b8]" /><h2 className="font-['Instrument_Serif',Georgia,serif] text-3xl text-white">{org.name}</h2><p className="mt-3 line-clamp-2 text-sm text-[#9a9a9a]">{org.description || "No description"}</p></button>)}</div> : <div className="border border-dashed border-[#555] p-12 text-center text-[#9a9a9a]">Create an organisation to begin.</div>}
  </div>;
}
