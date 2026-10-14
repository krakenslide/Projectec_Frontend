import { useEffect, useState } from "react";
import { Building2, ChevronRight, Loader2, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
    setLoading(true); setError("");
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

  return (
    <div className="pj-app-page pj-org-page space-y-10 font-['Inter',ui-sans-serif,sans-serif]">
      <header className="pj-page-hero border-b border-zinc-200 pb-9 dark:border-zinc-800">
        <div><p className="pj-dashboard-eyebrow">01 — Organisation</p><h1 className="mt-3 font-['Instrument_Serif',Georgia,serif] text-6xl leading-[.92] text-zinc-900 dark:text-white">Your workspace.</h1><p className="mt-5 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">Organisations are the containers for your teams, projects and engineering work.</p></div>
        <button className="pj-hard-action mt-7 inline-flex min-h-11 items-center gap-2 bg-zinc-950 px-5 text-[11px] uppercase tracking-[.18em] text-white transition-transform hover:-translate-y-0.5 dark:bg-[#f5f3ee] dark:text-zinc-950" onClick={() => setShowForm((value) => !value)} type="button">{showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{showForm ? "Close" : "New organisation"}</button>
      </header>


      {showForm && <form className="pj-form-surface" onSubmit={submit}><div className="mb-6 flex items-end justify-between gap-4"><div><p className="pj-dashboard-eyebrow">Create</p><h2 className="mt-2 font-['Instrument_Serif',Georgia,serif] text-3xl text-zinc-900 dark:text-white">Start a new organisation.</h2></div><span className="font-mono text-[10px] uppercase tracking-[.18em] text-zinc-500">Required: name</span></div><div className="grid gap-5 md:grid-cols-2"><label className="pj-field md:col-span-2"><span>Name</span><input minLength={3} onChange={(e) => setName(e.target.value)} placeholder="Organisation name" required value={name} /></label><label className="pj-field md:col-span-2"><span>Description</span><textarea maxLength={500} onChange={(e) => setDescription(e.target.value)} placeholder="What does this organisation own?" value={description} /></label></div><button className="pj-outline-action mt-6" disabled={saving} type="submit">{saving ? "Creating…" : "Create and open"}</button></form>}
      {error && <p className="border-y border-red-500 py-3 text-sm text-red-500 dark:text-red-300">{error}</p>}

      {loading ? <div className="flex min-h-52 items-center justify-center text-sm text-zinc-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading organisations</div> : organisations.length ? <section><div className="mb-4 flex items-end justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800"><div><p className="pj-dashboard-eyebrow">Organisations</p><h2 className="mt-1 text-lg font-medium text-zinc-900 dark:text-white">Choose an organisation</h2></div><span className="font-mono text-[10px] uppercase tracking-[.16em] text-zinc-500">{organisations.length} available</span></div><div className="divide-y divide-zinc-200 dark:divide-zinc-800">{organisations.map((org, index) => <button className="pj-org-row group grid w-full gap-6 py-7 text-left transition-colors md:grid-cols-[64px_minmax(0,1fr)_24px] md:items-center" key={org.id} onClick={() => openOrganisation(org)} type="button"><span className="font-mono text-[10px] tracking-[.14em] text-zinc-400">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><div className="flex items-center gap-3"><Building2 className="h-4 w-4 shrink-0 text-pj-lime" /><h3 className="truncate font-['Instrument_Serif',Georgia,serif] text-3xl text-zinc-900 dark:text-white">{org.name}</h3></div><p className="mt-2 max-w-xl truncate text-sm text-zinc-500 dark:text-zinc-400">{org.description || "No description yet."}</p></div><ChevronRight className="h-5 w-5 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-pj-lime" /></button>)}</div></section> : <div className="pj-empty-state"><Building2 className="mx-auto mb-5 h-7 w-7 text-zinc-400" /><p className="pj-dashboard-eyebrow">Nothing here yet</p><h2 className="mt-2 font-['Instrument_Serif',Georgia,serif] text-3xl text-zinc-900 dark:text-white">Create your first organisation.</h2><p className="mx-auto mt-3 max-w-md text-sm text-zinc-500 dark:text-zinc-400">Your organisation becomes the home for projects, people and delivery.</p></div>}
    </div>
  );
}
