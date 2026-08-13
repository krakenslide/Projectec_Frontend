import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { getErrorMessage } from "../api/client";
import { listUsers, type UserOption } from "../api/users";
import { addOrganisationMember, removeOrganisationMember } from "../api/organisation";
import type { OrganisationRole } from "../types/organisation";
import { useToast } from "../components/ui/Toast";
import ProjectecLoader from "../components/ui/ProjectecLoader";

export default function OrganisationMembersPage() {
    const { organizationId } = useParams<{ organizationId: string }>();
    const { showToast } = useToast();
    const [members, setMembers] = useState<UserOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<OrganisationRole>("Member");
    const [error, setError] = useState("");

    const loadMembers = async () => {
        if (!organizationId) return;
        setLoading(true);
        setError("");
        try {
            setMembers(await listUsers({ organizationId, pageSize: 100 }));
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadMembers();
    }, [organizationId]);

    const addMember = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!organizationId || adding) return;
        setAdding(true);
        setError("");
        try {
            await addOrganisationMember(organizationId, email.trim(), role);
            showToast("Member added to organisation");
            setEmail("");
            await loadMembers();
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setAdding(false);
        }
    };

    const removeMember = async (member: UserOption) => {
        if (!organizationId || removingId) return;
        setRemovingId(member.id);
        setError("");
        try {
            await removeOrganisationMember(organizationId, member.id);
            showToast(`${member.name || member.email} removed from organisation`);
            setMembers((items) => items.filter((item) => item.id !== member.id));
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div className="w-full space-y-7 font-['Inter',ui-sans-serif,sans-serif]">
            <Link className="text-xs uppercase tracking-[.16em] text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white" to={`/organisations/${organizationId}/projects`}>← Projects</Link>
            <header className="border-b border-zinc-300 dark:border-zinc-700 pb-6">
                <p className="text-[10px] uppercase tracking-[.18em] text-zinc-600 dark:text-zinc-400">Organisation access</p>
                <h1 className="mt-3 font-['Instrument_Serif',Georgia,serif] text-5xl leading-none text-zinc-900 dark:text-white">Members</h1>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{members.length} {members.length === 1 ? "person" : "people"} in this organisation.</p>
            </header>
            {error && <p className="border-y border-red-400/50 py-3 text-sm text-red-300">{error}</p>}
            {loading ? (
                <ProjectecLoader />
            ) : (
                <>
                    <form className="grid gap-3 border border-zinc-300 dark:border-zinc-700 p-5 md:grid-cols-[minmax(0,1fr)_13rem_auto]" onSubmit={addMember}>
                        <label className="text-[10px] uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-300">
                            Member email
                            <input className="mt-2 block w-full border border-zinc-400 dark:border-zinc-600 bg-white dark:bg-zinc-950 p-3 text-sm normal-case tracking-normal text-zinc-900 dark:text-white outline-none focus:border-zinc-900 dark:focus:border-white" placeholder="email@example.com" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                        </label>
                        <label className="text-[10px] uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-300">
                            Organisation role
                            <select className="mt-2 block w-full border border-zinc-400 dark:border-zinc-600 bg-white dark:bg-zinc-950 p-3 text-sm normal-case tracking-normal text-zinc-900 dark:text-white outline-none focus:border-zinc-900 dark:focus:border-white" value={role} onChange={(event) => setRole(event.target.value as OrganisationRole)}>
                                <option>Administrator</option>
                                <option>Member</option>
                            </select>
                        </label>
                        <button className="inline-flex min-h-11 items-center justify-center gap-2 self-end border border-zinc-900 dark:border-white px-4 text-xs uppercase tracking-[.14em] text-zinc-900 dark:text-white disabled:opacity-40" disabled={adding} type="submit">
                            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            {adding ? "Adding" : "Add member"}
                        </button>
                    </form>
                    {members.length ? (
                        <section className="border border-zinc-300 dark:border-zinc-700">
                            <div className="grid grid-cols-[minmax(0,1fr)_13rem_44px] gap-4 border-b border-zinc-300 dark:border-zinc-700 px-4 py-3 text-[10px] uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-400">
                                <span>Member</span><span>Access</span><span />
                            </div>
                            {members.map((member) => (
                                <article className="grid grid-cols-[minmax(0,1fr)_13rem_44px] items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 px-4 py-4 last:border-b-0" key={member.id}>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm text-zinc-900 dark:text-white">{member.name || "Unnamed user"}</p>
                                        <p className="mt-1 truncate text-xs text-zinc-600 dark:text-zinc-400">{member.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[.12em] text-zinc-600 dark:text-zinc-400">{member.is_active ? "Active" : "Inactive"}</p>
                                        <p className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-300">Joined {new Date(member.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <button aria-label={`Remove ${member.name || member.email}`} className="text-zinc-600 dark:text-zinc-400 hover:text-red-300 disabled:opacity-40" disabled={removingId !== null} onClick={() => void removeMember(member)} type="button">
                                        {removingId === member.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </button>
                                </article>
                            ))}
                        </section>
                    ) : <div className="border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-sm text-zinc-600 dark:text-zinc-400">No members yet.</div>}
                </>
            )}
        </div>
    );
}
