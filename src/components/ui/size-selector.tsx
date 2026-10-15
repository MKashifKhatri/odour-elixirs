"use client";
import { useId } from "react";
import { RadioGroup, RadioGroupItem } from "./radio-group";

export function SizeSelector({ label = "Size", options, value, onValueChange, disabled, error }: { label?: string; options: { value: string; label: string; disabled?: boolean }[]; value?: string; onValueChange: (value: string) => void; disabled?: boolean; error?: string }) {
  const id = useId();
  return <fieldset className="ds-fieldset" disabled={disabled}><legend id={`${id}-label`}>{label}</legend><RadioGroup className="ds-size-options" value={value} onValueChange={onValueChange} disabled={disabled} aria-labelledby={`${id}-label`} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}>{options.map((option) => <label className="ds-size-chip" key={option.value}><RadioGroupItem value={option.value} disabled={option.disabled} aria-label={option.label} /><span>{option.label}</span></label>)}</RadioGroup>{error && <p id={`${id}-error`} role="alert" className="ds-error">{error}</p>}</fieldset>;
}
