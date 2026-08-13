import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeOptionsMenu({ className = "" }: { className?: string }) {
  const { isViTheme, toggleViTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Theme options"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Theme options"
        className="inline-flex h-9 w-9 items-center justify-center rounded-control border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-900 dark:hover:border-zinc-400 dark:hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500"
      >
        <MoreVertical className="h-4 w-4" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-56 rounded-panel border border-border bg-surface-raised p-1.5 shadow-popover"
        >
          <div
            role="menuitemcheckbox"
            aria-checked={isViTheme}
            tabIndex={0}
            onClick={toggleViTheme}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleViTheme();
              }
            }}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-control px-2.5 py-2 text-sm text-ink transition-colors hover:bg-surface-muted"
          >
            <span className="flex flex-col">
              <span className="font-medium">VI Theme</span>
              <span className="text-xs text-ink-subtle">Vodafone Idea accent colours</span>
            </span>

            <span
              aria-hidden="true"
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                isViTheme ? "bg-accent" : "bg-zinc-300 dark:bg-zinc-600"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                  isViTheme ? "translate-x-[18px]" : "translate-x-1"
                }`}
              />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
