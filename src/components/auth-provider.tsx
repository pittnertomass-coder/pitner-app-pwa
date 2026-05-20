"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

interface AuthProviderProps {
  children: React.ReactNode;
  devMode?: boolean;
}

export function AuthProvider({ children, devMode = false }: AuthProviderProps) {
  const { setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    if (devMode) {
      // V dev bypass módu nastavíme mock uživatele
      setUser({ id: "dev-user", email: "dev@pitner.local" } as never);
      setProfile({
        id: "dev-user",
        email: "dev@pitner.local",
        full_name: "Dev Preview",
        avatar_url: null,
        is_premium: true,
        stripe_customer_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    const { createClient } = require("@/lib/supabase/client");
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }: { data: { user: import("@supabase/supabase-js").User | null } }) => {
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profile);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: import("@supabase/supabase-js").Session | null) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(profile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [devMode, setUser, setProfile, setLoading]);

  return <>{children}</>;
}
