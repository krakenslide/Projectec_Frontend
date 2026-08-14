import type { HTMLAttributes, ReactNode } from "react";

export function Section({ children, className = "", ...props }: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return <section className={`pj-surface ${className}`} {...props}>{children}</section>;
}
