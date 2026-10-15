"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SITE_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import {
  Boxes, CircleHelp, FileText, LayoutDashboard, LogOut, Menu, Package,
  Settings2, Tags, UsersRound, X,
} from "lucide-react";

export const ADMIN_SECRET_PATH = process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH;

const groups = [
  { title: "Workspace", links: [
    { path: "dashboard", label: "Overview", icon: LayoutDashboard },
    { path: "orders", label: "Orders", icon: FileText },
    { path: "products", label: "Products", icon: Package },
    { path: "customers", label: "Customers", icon: UsersRound },
    { path: "inventory", label: "Inventory", icon: Boxes },
    { path: "categories", label: "Categories", icon: Tags },
    { path: "content", label: "Settings", icon: Settings2 },
  ] },
];

export default function AdminSidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await Promise.allSettled([
        createClient().auth.signOut(),
        fetch("/api/logout", { method: "POST" }),
      ]);
    } finally {
      router.replace(`/admin/${ADMIN_SECRET_PATH}/login`);
      router.refresh();
      setSigningOut(false);
    }
  };

  return <>
    <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open admin navigation" className="fixed left-3 top-3 z-30 rounded-lg border border-[var(--store-line)] bg-[var(--store-surface)] p-2 text-[var(--store-ink)] shadow-sm xl:hidden">
      <Menu aria-hidden="true" className="h-5 w-5" />
    </button>
    {mobileOpen && <button type="button" aria-label="Close admin navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-black/60 xl:hidden" />}
    <aside className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[#e6e3dc] bg-[#fffefa] text-[#211e19] transition-[width,transform] duration-200 ${collapsed ? "xl:w-20" : "xl:w-72"} ${mobileOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"}`}>
      <div className={`flex h-16 shrink-0 items-center border-b border-[#e6e3dc] ${collapsed ? "justify-center px-2" : "justify-between px-5"}`}>
        <Link href={`/admin/${ADMIN_SECRET_PATH}/dashboard`} aria-label={`${SITE_NAME} admin home`} className="font-display text-lg font-bold tracking-[-0.05em] text-[#211e19]">
          {collapsed ? "E" : SITE_NAME}<span className="ml-2 align-middle text-[9px] font-semibold uppercase tracking-[0.18em] text-[#6e6e73]">Admin</span>
        </Link>
        <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close admin navigation" className="rounded-lg p-2 text-[#71695e] hover:bg-[#efeee8] hover:text-[#211e19] xl:hidden"><X className="h-4 w-4" /></button>
      </div>
      <nav aria-label="Admin navigation" className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
        {groups.map((group) => <section key={group.title}>
          {!collapsed && <h2 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#89857d]">{group.title}</h2>}
          <ul className="space-y-1">
            {group.links.map(({ path, label, icon: Icon }) => {
              const href = `/admin/${ADMIN_SECRET_PATH}/${path}`;
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return <li key={path}>
                <Link href={href} title={collapsed ? label : undefined} aria-label={label} aria-current={active ? "page" : undefined} className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm transition ${collapsed ? "xl:justify-center xl:px-0" : ""} ${active ? "bg-[#211bd1] font-semibold text-white" : "text-[#625e56] hover:bg-[#efeee8] hover:text-[#211e19]"}`}>
                  <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
                  <span className={collapsed ? "xl:hidden" : ""}>{label}</span>
                </Link>
              </li>;
            })}
          </ul>
        </section>)}
      </nav>
      <div className={`border-t border-[#e6e3dc] p-4 ${collapsed ? "xl:text-center" : ""}`}>
        <button type="button" onClick={() => void signOut()} disabled={signingOut} className={`mb-3 flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-[#625e56] transition hover:bg-[#efeee8] hover:text-[#211e19] disabled:opacity-50 ${collapsed ? "xl:justify-center xl:px-0" : ""}`}>
          <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span className={collapsed ? "xl:hidden" : ""}>{signingOut ? "Signing out…" : "Sign out"}</span>
        </button>
        <div className="flex items-center gap-2 text-xs text-[#89857d]">
          <CircleHelp aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span className={collapsed ? "xl:hidden" : ""}>Store operations</span>
          <span className="ml-auto font-mono text-[10px]">v1</span>
        </div>
      </div>
    </aside>
  </>;
}
