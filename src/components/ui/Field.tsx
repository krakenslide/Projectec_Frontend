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
    <label className="ui-field">
      <span className="ui-label">{label}</span>
      {children}
      {error ? (
        <span className="text-xs text-danger">{error}</span>
      ) : helpText ? (
        <span className="text-xs text-ink-subtle">{helpText}</span>
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
      <input className={`ui-input ${className}`} {...props} />
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
      <textarea className={`ui-input min-h-24 resize-y ${className}`} {...props} />
    </FieldShell>
  );
}
