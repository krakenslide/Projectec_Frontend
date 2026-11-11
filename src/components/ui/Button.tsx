import type { ButtonHTMLAttributes, ReactNode } from "react";
import { AnimatedIcon } from "./AnimatedIcon";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  isLoading?: boolean;
  variant?: ButtonVariant;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "ui-btn-primary border-[var(--pj-lime-vivid)] bg-[var(--pj-lime-vivid)] text-[var(--pj-on-lime)] enabled:hover:border-[var(--pj-lime-vivid-strong)] enabled:hover:bg-[var(--pj-lime-vivid-strong)] enabled:hover:text-[var(--pj-on-lime)] enabled:hover:shadow-[0_8px_28px_var(--pj-lime-glow)]",
  secondary:
    "ui-btn-secondary border-[var(--pj-border-strong)] bg-transparent text-[var(--pj-text)] enabled:hover:border-[var(--pj-lime)] enabled:hover:bg-[var(--pj-lime-soft)]",
  ghost:
    "ui-btn-ghost border-transparent bg-transparent text-[var(--pj-muted)] enabled:hover:bg-[var(--pj-lime-soft)] enabled:hover:text-[var(--pj-accent-text)]",
  danger:
    "ui-btn-danger border-[var(--pj-red-line)] bg-[var(--pj-red-soft)] text-[var(--pj-red)] enabled:hover:bg-[color-mix(in_srgb,var(--pj-red)_12%,transparent)]",
};

export function Button({
  children,
  className = "",
  disabled,
  icon,
  isLoading = false,
  type = "button",
  variant = "secondary",
  onClick,
  ...props
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex min-h-[42px] items-center justify-center gap-[9px] rounded-[var(--radius-panel)] border px-[17px] text-[10px] font-semibold leading-none tracking-[.12em] uppercase transition-[transform,background-color,border-color,color,box-shadow] duration-[160ms] ease-[var(--ease-pj)] enabled:hover:-translate-y-px enabled:active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-[.42] ${variantClass[variant]} ${className}`}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? <AnimatedIcon name="loading" size={16} /> : icon}
      {children}
    </button>
  );
}
