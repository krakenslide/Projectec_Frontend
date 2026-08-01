import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { getErrorMessage } from "../api/client";
import { listOrganisationMembers } from "../api/organisation";
import { addProjectMember, listProjectMembers, removeProjectMember, updateProjectMemberRole } from "../api/projects";
import type { OrganisationMember } from "../types/organisation";
import type { ProjectMember, ProjectRole } from "../types/project";
import { useToast } from "../components/ui/Toast";

const roles: ProjectRole[] = ["Project Admin", "Engineer", "QA", "Reporter", "Viewer"];

export default function ProjectMembersPage() {
    const { organizationId, projectId } = useParams<{ organizationId: string; projectId: string }>();
    const { showToast } = useToast();
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [organisationMembers, setOrganisationMembers] = useState<OrganisationMember[]>([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [role, setRole] = useState<ProjectRole>("Viewer");
    const [busy, setBusy] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [error, setError] = useState("");

    const load = async () => {
        if (!organizationId || !projectId) return;
        try {
            const [projectMembers, availableMembers] = await Promise.all([
                listProjectMembers(projectId),
                listOrganisationMembers(organizationId),
            ]);
            setMembers(projectMembers);
            setOrganisationMembers(availableMembers);
            // const assignedIds = new Set(projectMembers.map((member) => member.user_id));
            // const firstAvailable = availableMembers.find((member) => !assignedIds.has(member.user_id));
            // setSelectedUserId(firstAvailable?.user_id ?? "");
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        }
    };

    useEffect(() => {
        void load();
    }, [organizationId, projectId]);

    const availableMembers = organisationMembers.filter(
        (member) => !members.some((projectMember) => projectMember.user_id === member.user_id),
    );

    const addMember = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!projectId || busy || !selectedUserId) return;
        const selectedMember = availableMembers.find((member) => member.user_id === selectedUserId);
        if (!selectedMember) return;
        setBusy(true);
        setError("");
        try {
            await addProjectMember(projectId, selectedMember.email, role);
            showToast(`${selectedMember.name || selectedMember.email} added to project`);
            await load();
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    const changeRole = async (member: ProjectMember, nextRole: ProjectRole) => {
        if (!projectId || nextRole === member.role) return;
        try {
            await updateProjectMemberRole(projectId, member.user_id, nextRole);
            showToast(`${member.name || member.email}'s role updated`);
            setMembers((items) => items.map((item) => item.id === member.id ? { ...item, role: nextRole } : item));
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        }
    };

    const removeMember = async (member: ProjectMember) => {
        if (!projectId) return;
        setRemovingId(member.id);
        setError("");
        try {
            await removeProjectMember(projectId, member.user_id);
            showToast(`${member.name || member.email} removed from project`);
            setMembers((items) => items.filter((item) => item.id !== member.id));
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div className="max-w-4xl space-y-7">
            <Link className="text-xs uppercase tracking-[.16em] text-zinc-400 hover:text-white" to={`/organisations/${organizationId}/projects/${projectId}/tickets`}>← Tickets</Link>
            <header className="border-b border-zinc-700 pb-6">
                <p className="text-xs uppercase tracking-[.18em] text-zinc-500">Project access</p>
                <h1 className="mt-3 text-4xl text-white">Project members</h1>
                <p className="mt-3 text-sm text-zinc-400">Assign delivery roles to people who already belong to the organisation.</p>
            </header>
            {error && <p className="border-y border-red-400/50 py-3 text-sm text-red-300">{error}</p>}
            <form className="grid gap-4 border border-zinc-700 p-5 md:grid-cols-[1fr_180px_auto]" onSubmit={addMember}>
                <label className="text-[10px] uppercase tracking-[.14em] text-zinc-400">
                    Add organisation member
                    <select className="mt-2 block w-full border border-zinc-600 bg-zinc-950 p-3 text-sm normal-case tracking-normal text-white outline-none focus:border-white disabled:opacity-50" disabled={!availableMembers.length || busy} required value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
                        <option value="">{availableMembers.length ? "Select a person" : "All organisation members are added"}</option>
                        {availableMembers.map((member) => <option key={member.user_id} value={member.user_id}>{member.name || member.email} ({member.email})</option>)}
                    </select>
                </label>
                <label className="text-[10px] uppercase tracking-[.14em] text-zinc-400">
                    Project role
                    <select className="mt-2 block w-full border border-zinc-600 bg-zinc-950 p-3 text-sm normal-case tracking-normal text-white outline-none focus:border-white" value={role} onChange={(event) => setRole(event.target.value as ProjectRole)}>
                        {roles.map((item) => <option key={item}>{item}</option>)}
                    </select>
                </label>
                <button className="inline-flex min-h-11 items-center justify-center gap-2 self-end border border-white px-4 text-xs uppercase tracking-[.14em] text-white disabled:opacity-50" disabled={busy || !availableMembers.length || !selectedUserId} type="submit">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    {busy ? "Adding" : "Add member"}
                </button>
            </form>
            <section className="border border-zinc-700">
                <div className="grid grid-cols-[1fr_180px_44px] gap-4 border-b border-zinc-700 px-4 py-3 text-[10px] uppercase tracking-[.14em] text-zinc-500">
                    <span>Member</span><span>Role</span><span />
                </div>
                {members.length ? members.map((member) => (
                    <div className="grid grid-cols-[1fr_180px_44px] items-center gap-4 border-b border-zinc-800 px-4 py-4 last:border-b-0" key={member.id}>
                        <div className="min-w-0">
                            <p className="truncate text-sm text-white">{member.name || "Unnamed member"}</p>
                            <p className="mt-1 truncate text-xs text-zinc-500">{member.email}</p>
                        </div>
                        <select className="border border-zinc-700 bg-zinc-950 p-2 text-xs text-zinc-300" value={member.role} onChange={(event) => void changeRole(member, event.target.value as ProjectRole)}>
                            {roles.map((item) => <option key={item}>{item}</option>)}
                        </select>
                        <button aria-label={`Remove ${member.name || member.email}`} className="text-zinc-500 hover:text-red-300 disabled:opacity-50" disabled={removingId === member.id} onClick={() => void removeMember(member)} type="button">{removingId === member.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button>
                    </div>
                )) : <p className="p-8 text-center text-sm text-zinc-500">No project members yet.</p>}
            </section>
        </div>
    );
}
