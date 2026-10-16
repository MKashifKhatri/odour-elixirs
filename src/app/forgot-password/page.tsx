"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductVisual from "@/components/ProductVisual";
import { requestPasswordReset } from "@/app/services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (requestError) {
      setError(typeof requestError === "string" ? requestError : "Could not process your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="oe-store-page oe-auth-page">
      <div className="oe-auth-pitch">
        <ProductVisual className="oe-auth-pitch-image" src="/brand/oe-campaign-hero.jpg" alt="Odour Elixirs amber fragrance" priority sizes="(max-width: 760px) 100vw, 60vw" />
        <p className="oe-micro-label oe-micro-label-dark"><span />ODOUR ELIXIRS · YOUR ACCOUNT</p>
        <h1>A fresh start,<br /><em>just a moment away.</em></h1>
        <p>We’ll send a secure link to reset your password.</p>
      </div>
      <div className="oe-auth-panel">
        <p className="oe-micro-label oe-micro-label-dark"><span />ACCOUNT ACCESS</p>
        <h2>Reset password</h2>
        {submitted ? (
          <>
            <p className="oe-auth-subtitle">If an account exists for that email, reset instructions are on the way.</p>
            <Link href="/login" className="oe-auth-submit">Back to sign in <ArrowRight className="h-4 w-4" /></Link>
          </>
        ) : (
          <>
            <p className="oe-auth-subtitle">Enter the email linked to your account.</p>
            {error && <div role="alert" className="oe-auth-error">{error}</div>}
            <form onSubmit={handleSubmit} className="oe-auth-fields">
              <div>
                <label htmlFor="email">Email</label>
                <input className="oe-auth-input" type="email" id="email" name="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
              </div>
              <button type="submit" disabled={isSubmitting} className="oe-auth-submit">
                {isSubmitting ? "Sending…" : "Send reset link"}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </>
        )}
        <div className="oe-auth-footnote"><Link href="/login">Return to sign in</Link></div>
      </div>
    </section>
  );
}
