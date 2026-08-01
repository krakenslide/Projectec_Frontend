import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Check, X } from "lucide-react";

type ToastTone = "success" | "error";
interface ToastItem { id: number; message: string; tone: ToastTone; }
interface ToastContextValue { showToast: (message: string, tone?: ToastTone) => void; }

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = (message: string, tone: ToastTone = "success") => {
        const id = Date.now() + Math.random();
        setToasts((items) => [...items, { id, message, tone }]);
        window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3600);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div aria-live="polite" className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
                {toasts.map((toast) => <Toast key={toast.id} toast={toast} onClose={() => setToasts((items) => items.filter((item) => item.id !== toast.id))} />)}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used inside ToastProvider");
    return context;
}

function Toast({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
    const success = toast.tone === "success";
    return <div className={`pointer-events-auto flex items-start gap-3 border bg-[#101010] px-4 py-3 shadow-[0_12px_35px_rgba(0,0,0,.35)] ${success ? "border-emerald-400/45" : "border-red-400/50"}`}>
        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border ${success ? "border-emerald-400/50 text-emerald-300" : "border-red-400/50 text-red-300"}`}>{success ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}</span>
        <p className="flex-1 text-xs leading-5 text-zinc-200">{toast.message}</p>
        <button aria-label="Dismiss notification" className="text-zinc-600 transition-colors hover:text-white" onClick={onClose} type="button"><X className="h-3.5 w-3.5" /></button>
    </div>;
}
