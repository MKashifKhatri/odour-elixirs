"use client";
import { useEffect, useId, useState } from "react";
import { Button } from "./button";
import { BrandIcon } from "./brand-icons";

export function QuantityStepper({ value, onValueChange, min = 1, max = 99, disabled = false, label = "Quantity" }: { value: number; onValueChange: (value: number) => void; min?: number; max?: number; disabled?: boolean; label?: string }) {
  const id = useId();
  const upper = Math.max(min, max);
  const clamp = (next: number) => Math.min(upper, Math.max(min, Math.trunc(next)));
  const safeValue = clamp(Number.isFinite(value) ? value : min);
  const [draft, setDraft] = useState(String(safeValue));
  useEffect(() => { setDraft(String(safeValue)); }, [safeValue]);
  const commit = () => { const number = Number(draft); const next = draft.trim() && Number.isFinite(number) ? clamp(number) : safeValue; setDraft(String(next)); if (next !== value) onValueChange(next); };
  return <div className="ds-field"><label htmlFor={id}>{label}</label><div className="ds-stepper"><Button type="button" variant="ghost" size="icon" aria-label={`Decrease ${label.toLowerCase()}`} disabled={disabled || safeValue <= min} onClick={() => onValueChange(clamp(safeValue - 1))}><BrandIcon name="minus" /></Button><input id={id} type="number" inputMode="numeric" min={min} max={upper} step={1} disabled={disabled} value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); commit(); } if (event.key === "ArrowUp" || event.key === "ArrowDown") { event.preventDefault(); onValueChange(clamp(safeValue + (event.key === "ArrowUp" ? 1 : -1))); } }} /><Button type="button" variant="ghost" size="icon" aria-label={`Increase ${label.toLowerCase()}`} disabled={disabled || safeValue >= upper} onClick={() => onValueChange(clamp(safeValue + 1))}><BrandIcon name="plus" /></Button></div><span className="sr-only" aria-live="polite">{safeValue} selected</span></div>;
}
