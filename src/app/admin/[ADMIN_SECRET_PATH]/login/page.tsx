"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "@/store/reducer/userReducer";
import { RootState } from "@/store/store";
import { createClient } from "@/lib/supabase/client";
import { LoaderCircle } from "lucide-react";

const ADMIN_SECRET_PATH = process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH;

const AdminLogin = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();
  const loading = useSelector((state: RootState) => state.user.loading);
  const user = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    if (user && user.is_admin) {
      router.push(`/admin/${ADMIN_SECRET_PATH}/dashboard`);
    } else if (user && !user.is_admin) {
      setError("You are not authorized to access this page.");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError("");
      setSuccessMessage("");
      dispatch(setLoading(true));
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw new Error(authError.message);

      // Check if the user is an admin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .single() as { data: { is_admin: boolean } | null; error: any };

      if (profileError) throw new Error("Failed to verify admin status.");

      if (profile?.is_admin) {
        setSuccessMessage("Sign in successful. Opening your dashboard…");
        setIsRedirecting(true);
        window.setTimeout(() => router.replace(`/admin/${ADMIN_SECRET_PATH}/dashboard`), 650);
      } else {
        await supabase.auth.signOut();
        throw new Error("You are not authorized to access this page.");
      }
    } catch (error: any) {
      setError(error.message || "Failed to login. Please try again.");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--store-bg)] px-4 py-10 text-[var(--store-ink)]">
      <section aria-labelledby="admin-login-heading" className="w-full max-w-md rounded-2xl border border-[var(--store-line)] bg-[var(--store-surface)] p-6 shadow-[var(--store-shadow)] sm:p-9">
        <p className="eyebrow text-center">Odour Elixirs · Private workspace</p>
        <h1 id="admin-login-heading" className="mt-3 text-center font-display text-2xl font-semibold tracking-tight">Admin sign in</h1>
        {error && (
          <div role="alert" className="my-3 rounded-lg border border-[var(--store-danger)]/40 bg-[var(--store-danger)]/5 px-3 py-2 text-center text-sm text-[var(--store-danger)]">
            {error}
          </div>
        )}
        {successMessage && <p role="status" aria-live="polite" className="my-3 rounded-lg border border-[var(--store-success)]/40 bg-[var(--store-success)]/10 px-3 py-2 text-center text-sm text-[var(--store-success)]">{successMessage}</p>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="email" className="mt-5 block text-sm font-medium">Email</label>
            <input
              className="mt-2 block w-full rounded-lg border border-[var(--store-line)] bg-[var(--store-bg)] px-4 py-3 text-sm text-[var(--store-ink)] outline-none focus:border-[var(--store-accent)] focus:ring-2 focus:ring-[var(--store-accent)]/30"
              type="email"
              id="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || isRedirecting}
              required
            />
            <label htmlFor="password" className="mt-4 block text-sm font-medium">Password</label>
            <input
              className="mt-2 block w-full rounded-lg border border-[var(--store-line)] bg-[var(--store-bg)] px-4 py-3 text-sm text-[var(--store-ink)] outline-none focus:border-[var(--store-accent)] focus:ring-2 focus:ring-[var(--store-accent)]/30"
              type="password"
              id="password"
              name="password"
              required
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || isRedirecting}
              minLength={8}
            />
            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--store-accent)] px-4 py-3 text-sm font-semibold text-[var(--store-accent-foreground)] transition hover:brightness-90 disabled:cursor-wait disabled:opacity-60"
              disabled={loading || isRedirecting}
              aria-busy={loading || isRedirecting}
            >
              {(loading || isRedirecting) && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
              {isRedirecting ? "Opening dashboard…" : loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
      </section>
    </div>
  );
};

export default AdminLogin;
