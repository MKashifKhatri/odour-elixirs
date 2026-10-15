"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme placeholder"
        className={`h-9 w-9 rounded-full border border-[var(--store-line)] text-[var(--store-ink)] ${className || ""}`}
      >
        <span className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
      className={`relative h-9 w-9 rounded-full border border-[var(--store-line)] bg-transparent text-[var(--store-ink)] transition-colors hover:bg-[var(--store-accent-soft)] ${className || ""}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 animate-in spin-in-90 duration-300" />
      ) : (
        <Moon className="h-4 w-4 animate-in spin-in-90 duration-300" />
      )}
    </Button>
  );
}
