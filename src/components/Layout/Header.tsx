import { LogOut } from "lucide-react";

import { ProjectecLogo } from "../ui/ProjectecLogo";

interface HeaderProps {
    pageLabel: string;
    onLogout: () => void;
    loading: boolean;
}

export default function Header({
    pageLabel,
    onLogout,
    loading,
}: HeaderProps) {
    const iconButtonBaseClass = [
        "inline-flex h-9 w-9 items-center justify-center",
        "border border-white/10 bg-[#111111]",
        "text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        "transition-all duration-200",
        "active:scale-95",
    ].join(" ");

    const monoBaseClass = [
        "font-['DM_Mono','Courier_New',monospace]",
        "text-[11px] uppercase tracking-[0.2em]",
    ].join(" ");

    return (
        <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-white/10 bg-[#080808]/95 backdrop-blur-xl">
            <div className="relative flex h-full items-center justify-between gap-4 px-4 sm:px-6">
                <div className={`pj-header-progress pointer-events-none absolute bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent transition-[left,width,opacity] duration-500 ${loading ? "left-0 w-1/3 animate-[pj-header-sweep_1.2s_ease-in-out_infinite]" : "left-1/4 w-1/2 opacity-60"}`} />

                <div className="flex min-w-0 items-center gap-3">

                    <div className="flex min-w-0 items-center gap-3">
                        <ProjectecLogo
                            size={26}
                            delay={100}
                            animate
                            enableHover
                            showWordmark={false}
                        />

                        <div className="min-w-0">
                            <div className="hidden items-center gap-2 sm:flex">
                                <span
                                    className={[
                                        monoBaseClass,
                                        "text-[10px] tracking-[0.22em] text-zinc-600",
                                    ].join(" ")}
                                >
                                    Projectec
                                </span>

                                <span
                                    aria-hidden="true"
                                    className="text-[11px] text-zinc-700"
                                >
                                    /
                                </span>

                                <span
                                    className={[
                                        monoBaseClass,
                                        "truncate text-zinc-300",
                                    ].join(" ")}
                                >
                                    {pageLabel}
                                </span>
                            </div>

                            <div
                                className={[
                                    monoBaseClass,
                                    "truncate text-zinc-200 sm:hidden",
                                ].join(" ")}
                            >
                                {pageLabel}
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    aria-label="Log out"
                    className={[
                        iconButtonBaseClass,
                        "hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300",
                        "lg:hidden",
                    ].join(" ")}
                    onClick={onLogout}
                    type="button"
                >
                    <LogOut className="h-4 w-4" />
                </button>
            </div>
        </header>
    );
}
