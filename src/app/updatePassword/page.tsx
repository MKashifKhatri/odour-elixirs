"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductVisual from "@/components/ProductVisual";
import { resetPassword } from "@/app/services/api";

function UpdatePasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!token) {
      setError("This reset link is missing or invalid. Request a new one.");
      return;
    }
    if (password !== confirmation) {
      setError("Your passwords don’t match.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await resetPassword({ token, password });
      router.replace("/login?passwordReset=success");
    } catch (resetError) {
      setError(typeof resetError === "string" ? resetError : "Could not reset your password. Request a new link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="oe-store-page oe-auth-page">
      <div className="oe-auth-pitch">
        <ProductVisual className="oe-auth-pitch-image" src="/brand/oe-campaign-hero.jpg" alt="Odour Elixirs amber fragrance" priority sizes="(max-width: 760px) 100vw, 60vw" />
        <p className="oe-micro-label oe-micro-label-dark"><span />ODOUR ELIXIRS · YOUR ACCOUNT</p>
        <h1>Back to your<br /><em>own kind of presence.</em></h1>
        <p>Choose a new password for your account.</p>
      </div>
      <div className="oe-auth-panel">
        <p className="oe-micro-label oe-micro-label-dark"><span />ACCOUNT ACCESS</p>
        <h2>Choose a new password</h2>
        <p className="oe-auth-subtitle">Use at least 8 characters.</p>
        {error && <div role="alert" className="oe-auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="oe-auth-fields">
          <div>
            <label htmlFor="password">New password</label>
            <input className="oe-auth-input" type="password" id="password" name="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={8} required />
          </div>
          <div>
            <label htmlFor="confirmation">Confirm new password</label>
            <input className="oe-auth-input" type="password" id="confirmation" name="confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" minLength={8} required />
          </div>
          <button type="submit" disabled={isSubmitting || !token} className="oe-auth-submit">
            {isSubmitting ? "Updating…" : "Update password"}
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
        <div className="oe-auth-footnote"><Link href="/forgot-password">Request another reset link</Link></div>
      </div>
    </section>
  );
}

export default function UpdatePasswordPage() {
  return <Suspense fallback={<div className="oe-store-page oe-auth-page" aria-busy="true" />}><UpdatePasswordForm /></Suspense>;
}
