"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { BrandIcon } from "./brand-icons";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
}
// Native select retains platform keyboard navigation and mobile pickers.
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, error, hint, id, className, children, ...props }, ref) {
  const generated = React.useId();
  const fieldId = id || generated;
  const description = [props["aria-describedby"], error || hint ? `${fieldId}-message` : ""].filter(Boolean).join(" ") || undefined;
  return <div className="ds-field"><label htmlFor={fieldId}>{label}{props.required && " (required)"}</label><div className="ds-select-wrap"><select {...props} id={fieldId} ref={ref} aria-invalid={!!error || props["aria-invalid"]} aria-describedby={description} className={cn("ds-select", className)}>{children}</select><BrandIcon name="chevron" /></div>{(error || hint) && <p id={`${fieldId}-message`} className={error ? "ds-error" : "ds-hint"} role={error ? "alert" : undefined}>{error || hint}</p>}</div>;
});
