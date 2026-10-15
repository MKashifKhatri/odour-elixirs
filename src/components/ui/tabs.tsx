"use client";
import { useId, useState, type ReactNode } from "react";

export function Tabs({ label, items, defaultValue }: { label: string; items: { value: string; label: string; content: ReactNode; disabled?: boolean }[]; defaultValue?: string }) {
  const id = useId();
  const enabled = items.filter((item) => !item.disabled);
  const [value, setValue] = useState(defaultValue || enabled[0]?.value);
  const selected = enabled.some((item) => item.value === value) ? value : enabled[0]?.value;
  return <div className="ds-tabs"><div role="tablist" aria-label={label}>{items.map((item) => <button type="button" key={item.value} role="tab" id={`${id}-${item.value}-tab`} aria-controls={`${id}-${item.value}-panel`} aria-selected={selected === item.value} tabIndex={selected === item.value ? 0 : -1} disabled={item.disabled} onClick={() => setValue(item.value)} onKeyDown={(event) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key) || !enabled.length) return;
    event.preventDefault();
    const index = enabled.findIndex((entry) => entry.value === item.value);
    const next = event.key === "Home" ? 0 : event.key === "End" ? enabled.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + enabled.length) % enabled.length;
    setValue(enabled[next].value);
    document.getElementById(`${id}-${enabled[next].value}-tab`)?.focus();
  }}>{item.label}</button>)}</div>{items.map((item) => <div key={item.value} id={`${id}-${item.value}-panel`} role="tabpanel" aria-labelledby={`${id}-${item.value}-tab`} tabIndex={0} hidden={selected !== item.value}>{item.content}</div>)}</div>;
}
