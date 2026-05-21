import type { ReactNode } from "react";

interface EmptyStateProps {
  action?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
}

export function EmptyState({ action, description, icon, title }: EmptyStateProps) {
  return (
    <div className="ui-empty">
      {icon ? <div className="text-ink-subtle">{icon}</div> : null}
      <div className="text-sm font-semibold text-ink">{title}</div>
      {description ? (
        <div className="max-w-sm text-sm text-ink-muted">{description}</div>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
