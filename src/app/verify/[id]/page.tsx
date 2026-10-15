"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { verifyCode } from "@/app/services/api";
import { ArrowRight } from "lucide-react";
import ProductVisual from "@/components/ProductVisual";

const VerifyCode = ({ params }: { params: { id: string } }) => {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setError("");
            const response = await verifyCode({ id: params.id, code });
            if (response.statusCode === 200) {
                toast({ title: "Account verified successfully!" });
                router.push("/login"); // Redirect to login page after verification
            } else {
                throw new Error(response.message || "Verification failed. Please try again.");
            }
        } catch (error: any) {
            console.error("Failed to verify code:", error);
            setError(error.message || "Failed to verify code. Please try again.");
        }
    };

    return (
        <section className="oe-store-page oe-auth-page">
            <div className="oe-auth-pitch">
                <ProductVisual className="oe-auth-pitch-image" src="/brand/oe-campaign-hero.jpg" alt="Odour Elixirs amber fragrance" priority sizes="(max-width: 760px) 100vw, 60vw" />
                <p className="oe-micro-label oe-micro-label-dark"><span />ODOUR ELIXIRS · YOUR ACCOUNT</p>
                <h1>One quick step<br /><em>to get going.</em></h1>
                <p>Verify your email to finish setting up your account.</p>
            </div>
            <div className="oe-auth-panel">
                <p className="oe-micro-label oe-micro-label-dark"><span />EMAIL VERIFICATION</p>
                <h2>Verify your account</h2>
                <p className="oe-auth-subtitle">
                    Enter the verification code sent to your email to activate your account.
                </p>

                {error && <div role="alert" className="oe-auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="oe-auth-fields">
                    <div>
                        <label htmlFor="code">Verification code</label>
                        <input
                        className="oe-auth-input"
                            type="text"
                            id="code"
                            name="code"
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="oe-auth-submit"
                    >
                        Verify Account
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </form>
            </div>
        </section>
    );
};

export default VerifyCode;
