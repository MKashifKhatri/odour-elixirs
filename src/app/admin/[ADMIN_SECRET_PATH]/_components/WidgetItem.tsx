"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface WidgetItemProps {
  heading: string;
  value: number;
  color: string;
  amount?: boolean;
  loading?: boolean;
}

const WidgetItem = ({ heading, value, color, amount = false, loading = false }: WidgetItemProps) => (
  <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    {loading ? <div aria-label={`Loading ${heading}`} className="space-y-3"><Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-32" /><Skeleton className="h-2 w-20" /></div> :
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{heading}</p>
          <h2 className="mt-2 text-2xl font-semibold text-gray-900">{amount ? `₹${value.toLocaleString("en-IN")}` : value.toLocaleString("en-IN")}</h2>
        </div>
        <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-[var(--store-accent-soft)]">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        </div>
      </div>
    }
  </article>
);

export default WidgetItem;
