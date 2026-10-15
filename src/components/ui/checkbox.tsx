"use client";
import * as React from "react";
import { BrandIcon } from "./brand-icons";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  error?: string;
  indeterminate?: boolean;
}
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, error, indeterminate = false, id, className = "", ...props }, forwardedRef) {
  const generated = React.useId();
  const fieldId = id || generated;
  const ref = React.useRef<HTMLInputElement | null>(null);
  React.useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);
  return <div className={`ds-checkbox ${className}`}><label htmlFor={fieldId}><span className="ds-checkbox-control"><input {...props} type="checkbox" id={fieldId} ref={(node) => { ref.current = node; if (typeof forwardedRef === "function") forwardedRef(node); else if (forwardedRef) forwardedRef.current = node; }} aria-invalid={!!error || props["aria-invalid"]} aria-describedby={[props["aria-describedby"], error ? `${fieldId}-error` : ""].filter(Boolean).join(" ") || undefined} /><BrandIcon name={indeterminate ? "minus" : "check"} /></span><span>{label}</span></label>{error && <p id={`${fieldId}-error`} className="ds-error" role="alert">{error}</p>}</div>;
});
