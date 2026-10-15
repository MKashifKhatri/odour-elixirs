"use client";
import { FormEvent, useId, useRef, useState } from "react";
import Link from "next/link";
import { BrandIcon } from "@/components/ui/brand-icons";

export default function NewsletterForm({ eyebrow, title, buttonLabel }: { eyebrow: string; title: string; buttonLabel: string }) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [consented, setConsented] = useState(false);
  const [status, setStatus] = useState("");
  const [emailError, setEmailError] = useState("");
  const [consentError, setConsentError] = useState("");
  const [failed, setFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const subscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const invalidEmail = !inputRef.current?.validity.valid;
    setEmailError(invalidEmail ? "Enter a valid email address, such as you@example.com." : "");
    setConsentError(!consented ? "Please agree to receive emails before subscribing." : "");
    if (invalidEmail || !consented) {
      (invalidEmail ? inputRef.current : consentRef.current)?.focus();
      return;
    }
    setSubmitting(true);
    setStatus("");
    setFailed(false);
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim() }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "We could not add your email just now.");
      setStatus(result.message || "You’re on the list. Look out for a note from the house.");
      setEmail("");
      setConsented(false);
    } catch (error) {
      setFailed(true);
      setStatus(error instanceof Error ? error.message : "We could not add your email just now.");
    } finally { setSubmitting(false); }
  };
  return <section className="brand-newsletter" aria-labelledby={`${id}-title`}>
    <div><p className="brand-newsletter-eyebrow">{eyebrow}</p><h2 id={`${id}-title`}>{title}</h2></div>
    <form onSubmit={subscribe} noValidate aria-busy={submitting}>
      <label htmlFor={`${id}-email`}>Your email address</label>
      <div className="brand-newsletter-field"><input ref={inputRef} id={`${id}-email`} name="email" type="email" autoComplete="email" placeholder="you@example.com" required value={email} aria-invalid={!!emailError} aria-describedby={emailError ? `${id}-email-error` : undefined} onChange={(event) => { setEmail(event.target.value); setEmailError(""); }} /><button type="submit" disabled={submitting}>{submitting ? "Joining…" : buttonLabel}<BrandIcon name="chevron" /></button></div>
      {emailError && <p id={`${id}-email-error`} className="brand-form-error" role="alert">{emailError}</p>}
      <div className="brand-consent"><input ref={consentRef} id={`${id}-consent`} type="checkbox" required checked={consented} aria-invalid={!!consentError} aria-describedby={consentError ? `${id}-consent-error` : undefined} onChange={(event) => { setConsented(event.target.checked); setConsentError(""); }} /><div><label htmlFor={`${id}-consent`}>I agree to receive occasional emails from Odour Elixirs.</label><span>See our <Link href="/privacy-policy">Privacy Policy</Link>.</span></div></div>
      {consentError && <p id={`${id}-consent-error`} className="brand-form-error" role="alert">{consentError}</p>}
      <p className="brand-newsletter-status" role="status" aria-live="polite" aria-atomic="true">{status && !failed && <BrandIcon name="check" />}{failed && <strong>Subscription unsuccessful. </strong>}{status || "Occasional notes from the house, sent by email."}</p>
    </form>
  </section>;
}
