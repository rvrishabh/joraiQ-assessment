"use client";

import { fetchMe } from "@/api/queries/me";
import { AuthContext } from "@/context/auth-context";
import { ApiError } from "@/lib/axios";
import { supabase } from "@/lib/supabase";
import { authAtom } from "@/stores/auth.atom";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Supabase owns the session; the backend owns the profile and role. We only
 * report "authenticated" once /users/me has answered, so route guards can
 * rely on the role.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useAtom(authAtom);
  const queryClient = useQueryClient();
  const loadingFor = useRef<string | null>(null);

  const syncProfile = useCallback(
    async (hasSession: boolean) => {
      if (!hasSession) {
        setState({ status: "anonymous", user: null });
        return;
      }
      try {
        const user = await fetchMe();
        setState({ status: "authenticated", user });
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          // A valid Supabase session without a profile row cannot use the app.
          await supabase.auth.signOut();
        } else {
          // Server down or unreachable: keep the session so the user is
          // signed back in once it answers. Clearing the de-dupe key lets the
          // next SIGNED_IN (tab focus, sign-in) retry the profile load.
          loadingFor.current = null;
          toast.error(err instanceof ApiError ? err.message : "Could not load your profile");
        }
        setState({ status: "anonymous", user: null });
      }
    },
    [setState],
  );

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") return;
      const key = session?.user.id ?? "none";
      if (event !== "SIGNED_IN" && event !== "INITIAL_SESSION" && event !== "SIGNED_OUT") return;
      if (loadingFor.current === key && event === "SIGNED_IN") return;
      loadingFor.current = key;
      // Defer so supabase-js can finish its own work before we call it again.
      setTimeout(() => void syncProfile(!!session), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [syncProfile]);

  useEffect(() => {
    const onUnauthorized = () => void supabase.auth.signOut();
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    loadingFor.current = null;
    setState({ status: "anonymous", user: null });
  }, [queryClient, setState]);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await syncProfile(!!data.session);
  }, [syncProfile]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.status === "authenticated",
        isLoading: state.status === "loading",
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
