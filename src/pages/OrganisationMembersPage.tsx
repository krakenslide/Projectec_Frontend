import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, Plus, Search, Trash2, Users } from "lucide-react";
import { getErrorMessage } from "../api/client";
import { listUsers, type UserOption } from "../api/users";
import { addOrganisationMember, removeOrganisationMember } from "../api/organisation";
import type { OrganisationRole } from "../types/organisation";
import { useToast } from "../components/ui/Toast";
import WorkOrbitLoader from "../components/ui/WorkOrbitLoader";

export default function OrganisationMembersPage() {
    const { organizationId } = useParams<{ organizationId: string }>();
    const { showToast } = useToast();
    const [members, setMembers] = useState<UserOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<OrganisationRole>("Member");
    const [query, setQuery] = useState("");
    const [scope, setScope] = useState<"all" | "active" | "inactive">("all");
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

    useEffect(() => { void loadMembers(); }, [organizationId]);

    const stats = useMemo(() => ({
        total: members.length,
        active: members.filter((member) => member.is_active).length,
        inactive: members.filter((member) => !member.is_active).length,
    }), [members]);

    const visibleMembers = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return members.filter((member) => {
            const matchesScope = scope === "all" || (scope === "active" ? member.is_active : !member.is_active);
            const haystack = `${member.name} ${member.email}`.toLowerCase();
            return matchesScope && (!needle || haystack.includes(needle));
        });
    }, [members, query, scope]);

    const addMember = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!organizationId || adding) return;
        setAdding(true); setError("");
        try {
            await addOrganisationMember(organizationId, email.trim(), role);
            showToast("Member added to organisation"); setEmail(""); await loadMembers();
        } catch (err: unknown) { setError(getErrorMessage(err)); }
        finally { setAdding(false); }
    };

    const removeMember = async (member: UserOption) => {
        if (!organizationId || removingId) return;
        setRemovingId(member.id); setError("");
        try {
            await removeOrganisationMember(organizationId, member.id);
            showToast(`${member.name || member.email} removed from organisation`);
            setMembers((items) => items.filter((item) => item.id !== member.id));
        } catch (err: unknown) { setError(getErrorMessage(err)); }
        finally { setRemovingId(null); }
    };

    return (
        <div className="pj-app-page w-full space-y-8 font-['Inter',ui-sans-serif,sans-serif]">
            <Link className="pj-dashboard-link inline-flex" to={`/organisations/${organizationId}/projects`}>← Projects</Link>

            <header className="border-b border-zinc-300 dark:border-zinc-700 pb-7">
                <p className="pj-dashboard-eyebrow">Organisation · People</p>
                <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="font-['Instrument_Serif',Georgia,serif] text-5xl leading-[.95] text-zinc-900 dark:text-white md:text-6xl">The people behind the work.</h1>
                        <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">Manage who belongs to this organisation and the access they have to its workspace.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[.14em] text-zinc-500 dark:text-zinc-400"><Users className="h-4 w-4" /> Organisation directory</div>
                </div>
            </header>

            <section className="grid grid-cols-3 border-y border-zinc-300 dark:border-zinc-700">
                {[['People', stats.total], ['Active', stats.active], ['Inactive', stats.inactive]].map(([label, value]) => (
                    <div className="border-r border-zinc-300 dark:border-zinc-700 px-4 py-4 last:border-r-0" key={String(label)}><p className="pj-dashboard-eyebrow">{label}</p><p className="mt-1 font-['DM_Mono',monospace] text-2xl text-zinc-900 dark:text-white">{value}</p></div>
                ))}
            </section>

            {error && <p className="border-y border-red-400/50 py-3 text-sm text-red-300">{error}</p>}

            <form className="border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950/40" onSubmit={addMember}>
                <div className="border-b border-zinc-300 px-5 py-4 dark:border-zinc-700"><p className="pj-dashboard-eyebrow">Add people</p><p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">Add someone who already has an account.</p></div>
                <div className="grid gap-3 p-5 md:grid-cols-[minmax(0,1fr)_12rem_auto]">
                    <label className="text-[10px] uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-300">Email<input className="mt-2 block w-full border border-zinc-400 bg-white p-3 text-sm normal-case tracking-normal text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white dark:focus:border-white" placeholder="email@example.com" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
                    <label className="text-[10px] uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-300">Role<select className="mt-2 block w-full border border-zinc-400 bg-white p-3 text-sm normal-case tracking-normal text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white dark:focus:border-white" value={role} onChange={(event) => setRole(event.target.value as OrganisationRole)}><option>Administrator</option><option>Member</option></select></label>
                    <button className="inline-flex min-h-11 items-center justify-center gap-2 self-end border border-zinc-900 px-4 text-xs uppercase tracking-[.14em] text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white disabled:opacity-40 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-zinc-950" disabled={adding} type="submit">{adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{adding ? "Adding" : "Add member"}</button>
                </div>
            </form>

            <section>
                <div className="flex flex-col gap-4 border-b border-zinc-300 pb-4 dark:border-zinc-700 lg:flex-row lg:items-center lg:justify-between">
                    <div><p className="pj-dashboard-eyebrow">People</p><p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{visibleMembers.length} shown</p></div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" /><input className="h-10 w-full border border-zinc-300 bg-transparent pl-9 pr-3 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-white sm:w-64" placeholder="Search people" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
                        <div className="flex h-10 border border-zinc-300 dark:border-zinc-700">{([['all','All'],['active','Active'],['inactive','Inactive']] as const).map(([value, label]) => <button key={value} className={`px-3 text-[10px] uppercase tracking-[.12em] ${scope === value ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}`} onClick={() => setScope(value)} type="button">{label}</button>)}</div>
                    </div>
                </div>

                {loading ? <WorkOrbitLoader /> : visibleMembers.length ? (
                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {visibleMembers.map((member) => {
                            const initials = (member.name || member.email || "?").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
                            return <article className="pj-member-table-row group grid gap-4 py-5 md:grid-cols-[minmax(0,1fr)_10rem_3rem] md:items-center" key={member.id}>
                                <div className="flex min-w-0 items-center gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center border border-zinc-300 bg-zinc-100 font-['DM_Mono',monospace] text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">{initials}</div><div className="min-w-0"><p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{member.name || "Unnamed user"}</p><p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">{member.email}</p></div></div>
                                <div><p className={`text-[10px] uppercase tracking-[.14em] ${member.is_active ? 'text-pj-lime' : 'text-zinc-500 dark:text-zinc-400'}`}>● {member.is_active ? "Active" : "Inactive"}</p><p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">Joined {new Date(member.created_at).toLocaleDateString()}</p></div>
                                <button aria-label={`Remove ${member.name || member.email}`} className="justify-self-start text-zinc-500 transition-colors hover:text-red-400 disabled:opacity-40 md:justify-self-end" disabled={removingId !== null} onClick={() => void removeMember(member)} type="button">{removingId === member.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button>
                            </article>;
                        })}
                    </div>
                ) : <div className="border-y border-dashed border-zinc-300 py-12 text-center dark:border-zinc-700"><p className="text-sm text-zinc-900 dark:text-white">Nothing here.</p><p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Try another search or filter.</p></div>}
            </section>
        </div>
    );
}
