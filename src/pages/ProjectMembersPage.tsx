import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, Plus, Search, Trash2, Users } from "lucide-react";
import { getErrorMessage } from "../api/client";
import { listOrganisationMembers } from "../api/organisation";
import { addProjectMember, listProjectMembers, removeProjectMember, updateProjectMemberRole } from "../api/projects";
import { listTickets } from "../api/tickets";
import type { Ticket } from "../types/ticket";
import type { OrganisationMember } from "../types/organisation";
import type { ProjectMember, ProjectRole } from "../types/project";
import { useToast } from "../components/ui/Toast";

const roles: ProjectRole[] = ["Project Admin", "Engineer", "QA", "Reporter", "Viewer"];

export default function ProjectMembersPage() {
    const { organizationId, projectId } = useParams<{ organizationId: string; projectId: string }>();
    const { showToast } = useToast();
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [organisationMembers, setOrganisationMembers] = useState<OrganisationMember[]>([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [role, setRole] = useState<ProjectRole>("Viewer");
    const [busy, setBusy] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [error, setError] = useState("");

    const load = async () => {
        if (!organizationId || !projectId) return;
        setError("");
        try {
            const [projectMembers, availableMembers, projectTickets] = await Promise.all([listProjectMembers(projectId), listOrganisationMembers(organizationId), listTickets(projectId)]);
            setMembers(projectMembers); setOrganisationMembers(availableMembers); setTickets(projectTickets);
        } catch (err: unknown) { setError(getErrorMessage(err)); }
    };

    useEffect(() => { void load(); }, [organizationId, projectId]);

    const availableMembers = organisationMembers.filter((member) => !members.some((projectMember) => projectMember.user_id === member.user_id));
    const visibleMembers = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return members.filter((member) => `${member.name} ${member.email} ${member.role}`.toLowerCase().includes(needle));
    }, [members, query]);
    const roleCounts = useMemo(() => roles.map((item) => [item, members.filter((member) => member.role === item).length] as const), [members]);
    const teamMetrics = useMemo(() => ({
        open: tickets.filter((ticket) => !["Done", "Closed"].includes(ticket.status)).length,
        active: tickets.filter((ticket) => ticket.status === "In Progress").length,
        attention: tickets.filter((ticket) => ["P0", "P1"].includes(ticket.priority) && !["Done", "Closed"].includes(ticket.status)).length,
        unassigned: tickets.filter((ticket) => !ticket.assigned_to && !["Done", "Closed"].includes(ticket.status)).length,
    }), [tickets]);
    const workloadByUser = useMemo(() => new Map(members.map((member) => [member.user_id, {
        open: tickets.filter((ticket) => ticket.assigned_to === member.user_id && !["Done", "Closed"].includes(ticket.status)).length,
        active: tickets.filter((ticket) => ticket.assigned_to === member.user_id && ticket.status === "In Progress").length,
        done: tickets.filter((ticket) => ticket.assigned_to === member.user_id && ["Done", "Closed"].includes(ticket.status)).length,
    }])), [members, tickets]);
    const unassignedCount = teamMetrics.unassigned;

    const addMember = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!projectId || busy || !selectedUserId) return;
        const selectedMember = availableMembers.find((member) => member.user_id === selectedUserId);
        if (!selectedMember) return;
        setBusy(true); setError("");
        try { await addProjectMember(projectId, selectedMember.email, role); showToast(`${selectedMember.name || selectedMember.email} added to project`); setSelectedUserId(""); await load(); }
        catch (err: unknown) { setError(getErrorMessage(err)); }
        finally { setBusy(false); }
    };

    const changeRole = async (member: ProjectMember, nextRole: ProjectRole) => {
        if (!projectId || nextRole === member.role) return;
        try { await updateProjectMemberRole(projectId, member.user_id, nextRole); showToast(`${member.name || member.email}'s role updated`); setMembers((items) => items.map((item) => item.id === member.id ? { ...item, role: nextRole } : item)); }
        catch (err: unknown) { setError(getErrorMessage(err)); }
    };

    const removeMember = async (member: ProjectMember) => {
        if (!projectId) return;
        setRemovingId(member.id); setError("");
        try { await removeProjectMember(projectId, member.user_id); showToast(`${member.name || member.email} removed from project`); setMembers((items) => items.filter((item) => item.id !== member.id)); }
        catch (err: unknown) { setError(getErrorMessage(err)); }
        finally { setRemovingId(null); }
    };

    return (
        <div className="pj-app-page w-full space-y-8 font-['Inter',ui-sans-serif,sans-serif]">
            <Link className="pj-dashboard-link inline-flex" to={`/organisations/${organizationId}/projects/${projectId}/tickets`}>← Project work</Link>
            <header className="border-b border-zinc-300 pb-7 dark:border-zinc-700">
                <p className="pj-dashboard-eyebrow">Project · Team</p>
                <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="font-['Instrument_Serif',Georgia,serif] text-5xl leading-[.95] text-zinc-900 dark:text-white md:text-6xl">The people moving this project.</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">Assign delivery roles to people who already belong to the organisation.</p></div><div className="flex items-center gap-2 text-xs uppercase tracking-[.14em] text-zinc-500 dark:text-zinc-400"><Users className="h-4 w-4" /> {members.length} team members</div></div>
            </header>

            <section className="grid grid-cols-2 border-y border-zinc-300 dark:border-zinc-700 md:grid-cols-5"><div className="border-r border-b border-zinc-300 px-4 py-4 dark:border-zinc-700 md:border-b-0"><p className="pj-dashboard-eyebrow">Team</p><p className="mt-1 font-['DM_Mono',monospace] text-2xl text-zinc-900 dark:text-white">{members.length}</p></div><div className="border-b border-zinc-300 px-4 py-4 dark:border-zinc-700 md:border-b-0 md:border-r"><p className="pj-dashboard-eyebrow">Open work</p><p className="mt-1 font-['DM_Mono',monospace] text-2xl text-zinc-900 dark:text-white">{teamMetrics.open}</p></div><div className="border-r border-zinc-300 px-4 py-4 dark:border-zinc-700"><p className="pj-dashboard-eyebrow">Active</p><p className="mt-1 font-['DM_Mono',monospace] text-2xl text-zinc-900 dark:text-white">{teamMetrics.active}</p></div><div className="border-b border-zinc-300 px-4 py-4 dark:border-zinc-700 md:border-b-0 md:border-r"><p className="pj-dashboard-eyebrow">Attention</p><p className="mt-1 font-['DM_Mono',monospace] text-2xl text-pj-yellow">{teamMetrics.attention}</p></div><div className="px-4 py-4"><p className="pj-dashboard-eyebrow">Unassigned</p><p className="mt-1 font-['DM_Mono',monospace] text-2xl text-zinc-900 dark:text-white">{teamMetrics.unassigned}</p></div></section>

            {error && <p className="border-y border-red-400/50 py-3 text-sm text-red-300">{error}</p>}

            <form className="border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950/40" onSubmit={addMember}>
                <div className="border-b border-zinc-300 px-5 py-4 dark:border-zinc-700"><p className="pj-dashboard-eyebrow">Build the team</p><p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">Only organisation members can be added to this project.</p></div>
                <div className="grid gap-3 p-5 md:grid-cols-[minmax(0,1fr)_12rem_auto]"><label className="text-[10px] uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-300">Person<select className="mt-2 block w-full border border-zinc-400 bg-white p-3 text-sm normal-case tracking-normal text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white dark:focus:border-white" disabled={!availableMembers.length || busy} required value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}><option value="">{availableMembers.length ? "Select a person" : "Everyone is already on the team"}</option>{availableMembers.map((member) => <option key={member.user_id} value={member.user_id}>{member.name || member.email} ({member.email})</option>)}</select></label><label className="text-[10px] uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-300">Project role<select className="mt-2 block w-full border border-zinc-400 bg-white p-3 text-sm normal-case tracking-normal text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white dark:focus:border-white" value={role} onChange={(event) => setRole(event.target.value as ProjectRole)}>{roles.map((item) => <option key={item}>{item}</option>)}</select></label><button className="inline-flex min-h-11 items-center justify-center gap-2 self-end border border-zinc-900 px-4 text-xs uppercase tracking-[.14em] text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white disabled:opacity-50 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-zinc-950" disabled={busy || !availableMembers.length || !selectedUserId} type="submit">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{busy ? "Adding" : "Add member"}</button></div>
            </form>

            <section>
                <div className="flex flex-col gap-4 border-b border-zinc-300 pb-4 dark:border-zinc-700 lg:flex-row lg:items-center lg:justify-between"><div><p className="pj-dashboard-eyebrow">Project team</p><p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Role is editable inline.</p></div><label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" /><input className="h-10 w-full border border-zinc-300 bg-transparent pl-9 pr-3 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-white sm:w-64" placeholder="Search team" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
                {visibleMembers.length ? <div className="divide-y divide-zinc-200 dark:divide-zinc-800">{visibleMembers.map((member) => { const initials = (member.name || member.email || "?").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); return <article className="pj-member-table-row grid gap-4 py-5 md:grid-cols-[minmax(0,1fr)_14rem_3rem] md:items-center" key={member.id}><div className="flex min-w-0 items-center gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center border border-zinc-300 bg-zinc-100 font-['DM_Mono',monospace] text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">{initials}</div><div className="min-w-0"><p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{member.name || "Unnamed member"}</p><p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">{member.email}</p></div></div><div className="flex flex-wrap items-center gap-4 md:justify-end"><div className="font-['DM_Mono',monospace] text-[10px] uppercase tracking-[.12em] text-zinc-500 dark:text-zinc-400"><span className="text-zinc-900 dark:text-zinc-100">{workloadByUser.get(member.user_id)?.open ?? 0}</span> open · <span className="text-pj-lime">{workloadByUser.get(member.user_id)?.active ?? 0}</span> active · <span className="text-zinc-900 dark:text-zinc-100">{workloadByUser.get(member.user_id)?.done ?? 0}</span> done</div><select aria-label={`Role for ${member.name || member.email}`} className="w-full border border-zinc-300 bg-transparent p-2 text-xs text-zinc-800 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:text-zinc-200 dark:focus:border-white md:w-40" value={member.role} onChange={(event) => void changeRole(member, event.target.value as ProjectRole)}>{roles.map((item) => <option key={item}>{item}</option>)}</select></div><button aria-label={`Remove ${member.name || member.email}`} className="text-zinc-500 transition-colors hover:text-red-400 disabled:opacity-50 md:justify-self-end" disabled={removingId === member.id} onClick={() => void removeMember(member)} type="button">{removingId === member.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button></article>; })}</div> : <div className="border-y border-dashed border-zinc-300 py-12 text-center dark:border-zinc-700"><p className="text-sm text-zinc-900 dark:text-white">No project members match this search.</p><p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Try another name, email or role.</p></div>}
            </section>
        </div>
    );
}
