"use client";

import * as React from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <Provider store={store}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: "border border-[var(--store-line)] bg-[var(--store-card)] text-[var(--store-ink)] shadow-lg rounded-xl text-sm",
              duration: 3500,
            }}
          />
        </AuthProvider>
      </Provider>
    </ThemeProvider>
  );
}

