"use client";

import { useState, useEffect } from "react";
import { KEY_ACCESS_TOKEN, setItem } from "@/utils/localStorageManager";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, userExist } from "@/store/reducer/userReducer";
import { login } from "@/app/services/api";
import { RootState } from "@/store/store";
import Link from "next/link";
import Loader from "@/components/loader";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ProductVisual from "@/components/ProductVisual";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const loading = useSelector((state: RootState) => state.user.loading);

  const requestedRedirect = searchParams.get("redirect") || "/";
  const redirectPath = requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//") ? requestedRedirect : "/";
  const passwordResetComplete = searchParams.get("passwordReset") === "success";

  useEffect(() => {
    if (user && !loading) {
      router.replace(redirectPath);
    }
  }, [user, loading, router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError("");
      dispatch(setLoading(true));
      const response = await login({ email, password });
      if (response?.statusCode === 200 && response?.result?.user) {
        // console.log("Login successful:", response.result);
        setItem(KEY_ACCESS_TOKEN, response.result.accessToken);
        dispatch(userExist(response.result.user));
        router.replace(redirectPath);
      } else if (response?.result?.isVerified === false) {
        setError("Your email is not verified yet. Please verify first.");
      } else {
        throw new Error(response.message || "Login failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Failed to login:", error);
      if (error?.result?.isVerified === false) {
        setError("Please verify your email before logging in. Check your inbox for the verification code.");
      } else {
        const message = typeof error === "string" ? error : error?.response?.data?.message || error?.message;
        setError(message || "Failed to login. Please try again.");
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError("Google sign-in is ready after the Supabase project is connected.");
      return;
    }
    try {
      setGoogleLoading(true);
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}` },
      });
      if (oauthError) throw oauthError;
    } catch (oauthError) {
      setError(oauthError instanceof Error ? oauthError.message : "Could not start Google sign-in.");
      setGoogleLoading(false);
    }
  };
  
  if(loading){
    return <Loader />
  }

  return (
    <section className="oe-store-page oe-auth-page">
      <div className="oe-auth-pitch">
        <ProductVisual className="oe-auth-pitch-image" src="/brand/oe-campaign-hero.jpg" alt="Odour Elixirs amber fragrance" priority sizes="(max-width: 760px) 100vw, 60vw" />
        <p className="oe-micro-label oe-micro-label-dark"><span />ODOUR ELIXIRS · YOUR ACCOUNT</p>
        <h1>Your scents,<br /><em>remembered.</em></h1>
        <p>Sign in to keep your details close and make your next WhatsApp order easier.</p>
      </div>
      <div className="oe-auth-panel">
          <p className="oe-micro-label oe-micro-label-dark"><span />WELCOME BACK</p>
          <h2>Sign in</h2>
          <p className="oe-auth-subtitle">Use your email and password to continue.</p>
          {passwordResetComplete && <div role="status" className="oe-auth-success">Your password has been updated. Sign in with your new password.</div>}

          <button type="button" onClick={handleGoogleSignIn} disabled={googleLoading} className="oe-auth-google"><span aria-hidden="true">G</span>{googleLoading ? "Connecting to Google…" : "Continue with Google"}</button>
          <div className="oe-auth-divider"><span />or continue with email<span /></div>

          {error && (
            <div role="alert" className="oe-auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="oe-auth-fields">
            <div>
              <label htmlFor="email">Email</label>
              <input
                className="oe-auth-input"
                type="email"
                id="email"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="oe-auth-field-heading">
                <label htmlFor="password">Password</label>
                <Link href="/forgot-password">Forgot password?</Link>
              </div>
              <input
                className="oe-auth-input"
                type="password"
                id="password"
                name="password"
                required
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="oe-auth-submit"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="oe-auth-footnote">
            New customer?{" "}
            <Link href="/signup" className="font-semibold text-[var(--store-ink)] hover:underline">
              Create Account
            </Link>
          </div>
          <div className="oe-auth-guest">Just browsing? <Link href="/products">Continue as guest</Link></div>
        </div>
    </section>
  );
};

export default Login;
