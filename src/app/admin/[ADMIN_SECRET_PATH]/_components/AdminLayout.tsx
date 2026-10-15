"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import { PanelLeftClose, PanelLeftOpen, Bell, CircleUserRound } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminHeader = ({ collapsed, onToggleSidebar }: { collapsed: boolean; onToggleSidebar: () => void }) => (
  <header className="admin-topbar sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-[var(--store-line)] bg-[var(--store-bg)]/85 px-4 backdrop-blur-xl sm:px-6">
    <button type="button" onClick={onToggleSidebar} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="hidden rounded-lg p-2 text-[var(--store-muted)] transition hover:bg-[var(--store-bg-soft)] hover:text-[var(--store-ink)] xl:inline-flex">
      {collapsed ? <PanelLeftOpen aria-hidden="true" className="h-5 w-5" /> : <PanelLeftClose aria-hidden="true" className="h-5 w-5" />}
    </button>
    <div className="flex-1" />
    <button type="button" aria-label="Notifications" className="rounded-lg p-2 text-[var(--store-muted)] transition hover:bg-[var(--store-bg-soft)] hover:text-[var(--store-ink)]">
      <Bell aria-hidden="true" className="h-5 w-5" />
    </button>
    <span aria-label="Administrator" title="Administrator" className="grid h-9 w-9 place-items-center rounded-full border border-[var(--store-line)] bg-[var(--store-surface)] text-[var(--store-ink)]">
      <CircleUserRound aria-hidden="true" className="h-5 w-5" />
    </span>
  </header>
);

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname.includes("/login");

  if (isLoginPage) return <main className="admin-login-shell">{children}</main>;

  return (
    <div className="admin-shell min-h-screen bg-[var(--store-bg)] text-[var(--store-ink)]">
      <AdminSidebar collapsed={sidebarCollapsed} />
      <div className={`min-h-screen transition-[margin] duration-200 ${sidebarCollapsed ? "xl:ml-20" : "xl:ml-72"}`}>
        <AdminHeader collapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed((value) => !value)} />
        <main className="admin-content min-h-[calc(100vh-4rem)] w-full p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
