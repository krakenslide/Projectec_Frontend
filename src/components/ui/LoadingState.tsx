interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Loading" }: LoadingStateProps) {
  return (
    <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-[var(--pj-muted)]">
      <span
        className="inline-block h-4 w-4 animate-[spin_.7s_linear_infinite] rounded-full border-[1.5px] border-[var(--pj-border-strong)] border-t-[var(--pj-lime)]"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}
