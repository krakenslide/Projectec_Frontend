import type { HTMLAttributes, ReactNode } from "react";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Panel({ children, className = "", ...props }: PanelProps) {
  return (
    <div className={`ui-panel ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Card({ children, className = "", ...props }: PanelProps) {
  return (
    <div className={`ui-card ${className}`} {...props}>
      {children}
    </div>
  );
}
