"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; hint?: string; success?: string; loading?: boolean; }
const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input({ className, label, error, hint, success, loading, id, ...props }, ref) {
  const generated = React.useId();
  const fieldId = id || generated;
  const message = error || success || hint;
  const input = <input {...props} id={fieldId} ref={ref} placeholder={label ? (props.placeholder || " ") : props.placeholder} className={cn("ds-input", className)} aria-invalid={!!error || props["aria-invalid"]} aria-busy={loading || undefined} aria-describedby={[props["aria-describedby"], message ? `${fieldId}-message` : ""].filter(Boolean).join(" ") || undefined} />;
  // Preserve the bare-input DOM shape for existing FormControl and Slot consumers.
  if (!label && !message && !loading) return input;
  return <div className="ds-field" data-status={error ? "error" : success ? "success" : undefined}><div className={label ? "ds-floating" : undefined}>{input}{label && <label htmlFor={fieldId}>{label}{props.required && " (required)"}</label>}{loading && <span className="ds-input-loading ds-spinner" role="status" aria-label="Checking value" />}</div>{message && <p id={`${fieldId}-message`} className={error ? "ds-error" : success ? "ds-success" : "ds-hint"} role={error ? "alert" : success ? "status" : undefined}>{message}</p>}</div>;
});
export { Input };
