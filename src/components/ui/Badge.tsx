import type { HTMLAttributes, ReactNode } from "react";

type BadgeTone = "neutral" | "success" | "warning" | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: BadgeTone;
}

const toneClass: Record<BadgeTone, string> = {
  neutral: "",
  success:
    "border-[var(--pj-lime-line)] bg-[var(--pj-lime-soft)] text-[var(--pj-accent-text)]",
  warning:
    "border-[var(--pj-yellow-line)] bg-[var(--pj-yellow-soft)] text-[var(--pj-warning-text)]",
  danger:
    "border-[var(--pj-red-line)] bg-[var(--pj-red-soft)] text-[var(--pj-red)]",
};

export function Badge({
  children,
  className = "",
  tone = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex min-h-[22px] items-center gap-1.5 rounded-[var(--radius-panel)] border border-[var(--pj-border)] bg-transparent px-[7px] text-[9px] font-semibold tracking-[.12em] text-[var(--pj-muted)] uppercase before:h-1 before:w-1 before:bg-current before:opacity-[.85] before:content-[''] ${toneClass[tone]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
