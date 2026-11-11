import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

interface FieldShellProps {
  children: ReactNode;
  error?: string;
  helpText?: string;
  label: string;
}

export function FieldShell({ children, error, helpText, label }: FieldShellProps) {
  return (
    <label className="block">
      <span className="mb-[9px] block font-[var(--font-mono)] text-[9px] font-medium tracking-[.22em] text-[var(--pj-muted)] uppercase">
        {label}
      </span>
      {children}
      {error ? (
        <span className="text-xs text-[var(--pj-red)]">{error}</span>
      ) : helpText ? (
        <span className="text-xs text-[var(--pj-dim)]">{helpText}</span>
      ) : null}
    </label>
  );
}

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helpText?: string;
  label: string;
}

export function InputField({
  className = "",
  error,
  helpText,
  label,
  ...props
}: InputFieldProps) {
  return (
    <FieldShell error={error} helpText={helpText} label={label}>
      <input
        className={`ui-input min-h-[42px] w-full rounded-none border border-[var(--pj-input-border)] bg-[var(--pj-panel)] px-3 py-2.5 text-[13px] text-[var(--pj-text)] outline-none transition-[border-color,box-shadow] duration-[160ms] ease-[var(--ease-pj)] hover:border-[var(--pj-border-strong)] focus:border-[var(--pj-lime)] focus:shadow-[0_1px_0_var(--pj-lime)] ${className}`}
        {...props}
      />
    </FieldShell>
  );
}

interface TextareaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  helpText?: string;
  label: string;
}

export function TextareaField({
  className = "",
  error,
  helpText,
  label,
  ...props
}: TextareaFieldProps) {
  return (
    <FieldShell error={error} helpText={helpText} label={label}>
      <textarea
        className={`ui-input min-h-[110px] w-full resize-y rounded-none border border-[var(--pj-input-border)] bg-[var(--pj-panel)] px-3 py-2.5 text-[13px] text-[var(--pj-text)] outline-none transition-[border-color,box-shadow] duration-[160ms] ease-[var(--ease-pj)] hover:border-[var(--pj-border-strong)] focus:border-[var(--pj-lime)] focus:shadow-[0_1px_0_var(--pj-lime)] ${className}`}
        {...props}
      />
    </FieldShell>
  );
}
