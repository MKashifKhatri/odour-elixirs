'use client';

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-3 bg-[var(--store-bg)] text-[var(--store-ink)]">
      <Loader2 className="h-9 w-9 animate-spin text-[var(--store-accent)]" />
      <span className="text-xs font-medium tracking-wider text-[var(--store-muted)] uppercase">Loading...</span>
    </div>
  );
}

