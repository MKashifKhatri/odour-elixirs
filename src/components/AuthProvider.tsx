"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setLoading, userExist, userNotExist } from "@/store/reducer/userReducer";
import { createClient } from "@/lib/supabase/client";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      dispatch(userNotExist());
      return;
    }
    const supabase = createClient();
    let active = true;

    const loadProfile = async (userId: string) => {
      const [profileResult, addressResult] = await Promise.all([
        supabase.from("profiles").select("id,name,email,is_admin").eq("id", userId).single(),
        supabase.from("addresses").select("*").eq("user_id", userId),
      ]);
      if (!active) return;
      const profile = profileResult.data;
      if (!profile) {
        dispatch(userNotExist());
        return;
      }
      dispatch(userExist({
        user: "",
        id: profile.id,
        name: profile.name,
        email: profile.email,
        is_admin: profile.is_admin,
        addresses: (addressResult.data || []).map((addr) => ({
          id: addr.id,
          address: addr.address || "",
          city: addr.city || "",
          state: addr.state || "",
          zip_code: addr.zip_code || "",
          country: addr.country || "",
          phone_number: addr.phone_number || "",
          is_default: addr.is_default,
        })),
      }));
    };

    const initializeAuth = async () => {
      try {
        dispatch(setLoading(true));
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) await loadProfile(session.user.id);
        else if (active) dispatch(userNotExist());
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (active) dispatch(userNotExist());
      } finally {
        if (active) dispatch(setLoading(false));
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        dispatch(userNotExist());
      } else if (event === "SIGNED_IN" && session?.user) {
        window.setTimeout(() => {
          void loadProfile(session.user.id).catch((error) => {
            console.error("Could not load the signed-in profile:", error);
          });
        }, 0);
      }
    });

    void initializeAuth();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider;
