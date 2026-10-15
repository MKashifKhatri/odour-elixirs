import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export type BadgeTone = "neutral" | "success" | "warning" | "error";
export function Badge({ tone = "neutral", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return <span {...props} className={cn("ds-badge", `ds-badge-${tone}`, className)} />;
}
