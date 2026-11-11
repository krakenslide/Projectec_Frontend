import type { HTMLAttributes, ReactNode } from "react";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Panel({ children, className = "", ...props }: PanelProps) {
  return (
    <div
      className={`ui-panel relative overflow-hidden rounded-[var(--radius-panel)] border border-[var(--pj-border)] bg-[var(--pj-panel)] p-5 shadow-[var(--shadow-panel)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Card({ children, className = "", ...props }: PanelProps) {
  return (
    <div
      className={`ui-card relative overflow-hidden rounded-[var(--radius-panel)] border border-[var(--pj-border)] bg-[var(--pj-panel)] p-[18px] transition-[transform,border-color,background-color,box-shadow] duration-[240ms] ease-[var(--ease-pj)] before:absolute before:inset-y-0 before:left-0 before:z-[2] before:w-[var(--pj-rail)] before:origin-center before:scale-y-0 before:bg-[var(--pj-lime)] before:transition-transform before:duration-300 before:ease-[var(--ease-pj)] before:content-[''] hover:-translate-y-0.5 hover:border-[var(--pj-lime-line)] hover:bg-[var(--pj-panel-raised)] hover:shadow-[var(--shadow-panel)] hover:before:scale-y-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
