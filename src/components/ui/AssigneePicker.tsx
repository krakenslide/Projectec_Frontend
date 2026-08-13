import { useMemo, useState } from "react";
import { Check, ChevronDown, Search, UserRound, X } from "lucide-react";
import type { ProjectMember } from "../../types/project";

interface AssigneePickerProps {
    members: ProjectMember[];
    value: string | null | undefined;
    onChange: (userId: string | null) => void;
    label?: string;
}

export default function AssigneePicker({ members, value, onChange, label = "Assignee" }: AssigneePickerProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const selected = members.find((member) => member.user_id === value);
    const filtered = useMemo(() => members.filter((member) => `${member.name} ${member.email}`.toLowerCase().includes(query.toLowerCase().trim())), [members, query]);

    return <div className="relative">
        <span className="mb-2 block text-xs uppercase tracking-[.14em] text-zinc-600 dark:text-zinc-300">{label}</span>
        <button className="flex min-h-12 w-full items-center gap-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-3 text-left transition-colors hover:border-zinc-400 dark:hover:border-zinc-500 focus-visible:border-zinc-900 dark:focus-visible:border-white focus-visible:outline-none" onClick={() => setOpen((current) => !current)} type="button">
            {selected ? <Avatar member={selected} /> : <span className="flex h-6 w-6 items-center justify-center border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"><UserRound className="h-3.5 w-3.5" /></span>}
            <span className="min-w-0 flex-1">{selected ? <><span className="block truncate text-sm text-zinc-700 dark:text-zinc-200">{selected.name}</span><span className="block truncate text-[10px] text-zinc-600 dark:text-zinc-300">{selected.email}</span></> : <span className="text-sm text-zinc-600 dark:text-zinc-300">Unassigned</span>}</span>
            {selected && <span onClick={(event) => { event.stopPropagation(); onChange(null); }}><X className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white" /></span>}
            <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-600 dark:text-zinc-300 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && <div className="absolute left-0 right-0 top-full z-30 mt-1 border border-zinc-300 dark:border-zinc-700 bg-[#f4f4f5] dark:bg-[#101010] p-2 shadow-[0_14px_40px_rgba(0,0,0,.45)]">
            <div className="relative"><Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600 dark:text-zinc-300" /><input autoFocus className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 pl-8 pr-2 text-xs text-zinc-900 dark:text-white outline-none focus:border-zinc-400 dark:focus:border-zinc-500" placeholder="Search members" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
            <button className="mt-2 flex w-full items-center gap-2 px-2 py-2 text-left text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white" onClick={() => { onChange(null); setOpen(false); setQuery(""); }} type="button"><UserRound className="h-3.5 w-3.5" />Unassigned</button>
            <div className="mt-1 max-h-52 overflow-y-auto">{filtered.length ? filtered.map((member) => <button className="flex w-full items-center gap-2 px-2 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900" key={member.user_id} onClick={() => { onChange(member.user_id); setOpen(false); setQuery(""); }} type="button"><Avatar member={member} /><span className="min-w-0 flex-1"><span className="block truncate text-xs text-zinc-700 dark:text-zinc-200">{member.name}</span><span className="block truncate text-[10px] text-zinc-600 dark:text-zinc-300">{member.email}</span></span>{member.user_id === value && <Check className="h-3.5 w-3.5 text-emerald-300" />}</button>) : <p className="px-2 py-4 text-center text-xs text-zinc-600 dark:text-zinc-300">No members found.</p>}</div>
        </div>}
    </div>;
}

export function Avatar({ member }: { member: ProjectMember }) {
    const initials = member.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    return <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-[10px] uppercase text-zinc-700 dark:text-zinc-300">{initials || member.email.charAt(0).toUpperCase()}</span>;
}
