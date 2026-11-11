import type { HTMLAttributes, ReactNode } from "react";
import { AnimatedIcon } from "./AnimatedIcon";

type AlertTone = "neutral" | "error";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  tone?: AlertTone;
}

export function Alert({
  children,
  className = "",
  tone = "neutral",
  ...props
}: AlertProps) {
  return (
    <div
      className={`flex gap-[11px] border border-[var(--pj-border)] bg-[var(--pj-panel)] px-[14px] py-[13px] text-xs leading-[1.6] text-[var(--pj-muted)] ${tone === "error" ? "ui-alert-error border-0 border-l-2 border-l-[var(--pj-red)] bg-[var(--pj-red-soft)] pl-3 text-[var(--pj-red)]" : ""} ${className}`}
      role={tone === "error" ? "alert" : "status"}
      {...props}
    >
      <AnimatedIcon className="mt-0.5" name="alert" play={tone === "error"} size={16} />
      <div>{children}</div>
    </div>
  );
}
