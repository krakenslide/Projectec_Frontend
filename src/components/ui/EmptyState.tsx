import type { ReactNode } from "react";

interface EmptyStateProps {
  action?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
}

export function EmptyState({ action, description, icon, title }: EmptyStateProps) {
  return (
    <div className="ui-empty flex min-h-[190px] flex-col items-center justify-center gap-[10px] border border-dashed border-[var(--pj-border-strong)] px-6 py-16 text-center">
      {icon ? <div className="text-[var(--pj-dim)]">{icon}</div> : null}
      <div className="text-sm font-semibold text-[var(--pj-text)]">{title}</div>
      {description ? (
        <div className="max-w-sm text-sm text-[var(--pj-muted)]">{description}</div>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
