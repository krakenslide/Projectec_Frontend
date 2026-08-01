import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    busy?: boolean;
    requiredText?: string;
    onCancel: () => void;
    onConfirm: () => void;
}

export default function ConfirmModal({ open, title, description, confirmLabel, busy = false, requiredText, onCancel, onConfirm }: ConfirmModalProps) {
    const [confirmation, setConfirmation] = useState("");
    const canConfirm = !requiredText || confirmation === requiredText;

    useEffect(() => {
        if (open) setConfirmation("");
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !busy) onCancel();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [busy, onCancel, open]);

    if (!open) return null;

    return <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
        <section aria-labelledby="confirm-modal-title" aria-modal="true" className="w-full max-w-md border border-zinc-700 bg-[#101010] p-5 shadow-[0_18px_60px_rgba(0,0,0,.5)]" role="dialog">
            <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-red-400/50 text-red-300"><AlertTriangle className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1"><h2 className="text-lg text-white" id="confirm-modal-title">{title}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p></div>
                <button aria-label="Close confirmation" className="text-zinc-600 hover:text-white" disabled={busy} onClick={onCancel} type="button"><X className="h-4 w-4" /></button>
            </div>
            {requiredText && <label className="mt-5 block text-[10px] uppercase tracking-[.14em] text-zinc-500">Type <span className="text-zinc-200">{requiredText}</span> to confirm<input autoFocus className="mt-2 w-full border border-zinc-700 bg-zinc-950 p-3 text-sm normal-case tracking-normal text-white outline-none focus:border-white" disabled={busy} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>}
            <div className="mt-6 flex justify-end gap-3"><button className="min-h-10 border border-zinc-700 px-4 text-xs uppercase tracking-[.14em] text-zinc-400 hover:border-zinc-500 hover:text-white" disabled={busy} onClick={onCancel} type="button">Cancel</button><button className="min-h-10 border border-red-400/60 bg-red-950/20 px-4 text-xs uppercase tracking-[.14em] text-red-200 disabled:cursor-not-allowed disabled:opacity-40" disabled={!canConfirm || busy} onClick={onConfirm} type="button">{busy ? "Working" : confirmLabel}</button></div>
        </section>
    </div>;
}
