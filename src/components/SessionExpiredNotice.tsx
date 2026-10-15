"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type SessionExpiredNoticeProps = {
  title?: string;
  description?: string;
  loginHref?: string;
  buttonLabel?: string;
};

export default function SessionExpiredNotice({
  title = "Session expired",
  description = "Please log in again to continue.",
  loginHref = "/login",
  buttonLabel = "Log In",
}: SessionExpiredNoticeProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border border-[var(--store-line)] bg-[var(--store-surface)] px-5 py-8 text-center shadow-sm">
      <p className="text-lg font-semibold text-[var(--store-ink)]">{title}</p>
      <p className="mt-2 text-sm text-[var(--store-muted)]">{description}</p>
      <Button asChild size="sm" className="mt-4">
        <Link href={loginHref}>{buttonLabel}</Link>
      </Button>
    </div>
  );
}
