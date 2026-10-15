"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/app/services/api"; // Import the signup function from api.ts
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductVisual from "@/components/ProductVisual";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;
        try {
            setError("");
            setIsSubmitting(true);
            const response = await signup({ name, email, password });
            if (response.statusCode === 201) {
                toast({ title: "Signup successful! Please verify your email." });
                router.push(`/verify/${response.result.id}`);
            } else {
                throw new Error(response.message || "Signup failed. Please try again.");
            }
        } catch (error: any) {
            console.error("Failed to signup:", error);
            const message = typeof error === "string"
                ? error
                : error?.response?.data?.message || error?.message;
            setError(message || "Failed to signup. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="oe-store-page oe-auth-page">
            <div className="oe-auth-pitch">
                <ProductVisual className="oe-auth-pitch-image" src="/brand/oe-campaign-hero.jpg" alt="Odour Elixirs amber fragrance" priority sizes="(max-width: 760px) 100vw, 60vw" />
                <p className="oe-micro-label oe-micro-label-dark"><span />ODOUR ELIXIRS · YOUR ACCOUNT</p>
                <h1>Good things,<br /><em>remembered.</em></h1>
                <p>Create an account to keep your details and order requests together.</p>
            </div>
            <div className="oe-auth-panel">
                    <p className="oe-micro-label oe-micro-label-dark"><span />JOIN THE HOUSE</p>
                    <h2>Create an account</h2>
                    <p className="oe-auth-subtitle">Save your details for an easier next visit.</p>

                    {error && <div role="alert" className="oe-auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="oe-auth-fields">
                        <div>
                            <label htmlFor="name">Name</label>
                            <input
                                className="oe-auth-input"
                                type="text"
                                id="name"
                                name="name"
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email">Email</label>
                            <input
                                className="oe-auth-input"
                                type="email"
                                id="email"
                                name="email"
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password">Password</label>
                            <input
                                className="oe-auth-input"
                                type="password"
                                id="password"
                                name="password"
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                                required
                                minLength={8}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="oe-auth-submit"
                        >
                            {isSubmitting ? "Creating account…" : "Create Account"}
                            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                        </button>
                    </form>

                    <div className="oe-auth-footnote">
                        Already have an account?{" "}
                        <Link href="/login">
                            Sign In
                        </Link>
                    </div>
                    <div className="oe-auth-guest">Just browsing? <Link href="/products">Continue as guest</Link></div>
                </div>
        </section>
    );
};

export default Signup;
