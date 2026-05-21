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
      className={`ui-alert ${tone === "error" ? "ui-alert-error" : ""} ${className}`}
      role={tone === "error" ? "alert" : "status"}
      {...props}
    >
      <AnimatedIcon className="mt-0.5" name="alert" play={tone === "error"} size={16} />
      <div>{children}</div>
    </div>
  );
}
