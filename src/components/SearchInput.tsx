"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SearchInput({
  onAfterSearch,
  autoFocus = false,
}: {
  onAfterSearch?: () => void;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentQuery = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (pathname === "/search") {
      setSearchTerm(currentQuery);
    } else {
      setSearchTerm("");
    }
    setError("");
  }, [pathname, currentQuery]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchTerm.trim();

    if (!query) {
      setError("Enter a product name to search.");
      return;
    }

    setError("");
    router.push(`/search?q=${encodeURIComponent(query)}`);
    onAfterSearch?.();
  };

  return (
    <form onSubmit={handleSubmit} noValidate role="search">
      <div className="relative">
        <Input
          type="search"
          name="searchTerm"
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            if (error) setError("");
          }}
          placeholder="Search products"
          aria-label="Search products"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "product-search-error" : undefined}
          autoFocus={autoFocus}
          className={`h-11 rounded-xl bg-[var(--store-surface)] pr-12 text-sm text-[var(--store-ink)] placeholder:text-[var(--store-muted)] ${error ? "border-[var(--store-danger)] focus-visible:ring-[var(--store-danger)]" : "border-[var(--store-line)]"}`}
        />
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          aria-label="Submit product search"
          className="absolute right-1 top-1 h-9 w-9 rounded-lg border border-[var(--store-line)] bg-[var(--store-surface)] p-0 text-[var(--store-ink)] hover:bg-[var(--store-accent-soft)]"
        >
          <SearchIcon aria-hidden="true" className="h-5 w-5" />
        </Button>
      </div>
      {error && <p id="product-search-error" role="alert" aria-live="polite" className="mt-2 px-1 text-xs font-medium text-[var(--store-danger)]">{error}</p>}
    </form>
  );
}
