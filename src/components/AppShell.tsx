"use client";

import { Suspense } from "react";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";
import { store } from "@/store/store";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import BrandIntro from "@/components/BrandIntro";
import { Toaster2 } from "@/components/ui/toaster";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith("/admin");
  return <Provider store={store}><AuthProvider><Suspense>{isAdminPath ? children : <div className="storefront-shell"><Header /><main id="main-content" tabIndex={-1} className={`storefront-main${pathname === "/" ? " is-home" : ""}`}>{children}</main><Footer /><MobileTabBar /><BrandIntro isInitialHomePage={pathname === "/"} /></div>}<Toaster /><Toaster2 /></Suspense></AuthProvider></Provider>;
}
