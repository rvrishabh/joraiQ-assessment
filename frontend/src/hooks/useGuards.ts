"use client";

import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const homeFor = (role: Role) => (role === "TEACHER" ? "/teacher" : "/student");

/** Send signed-in users to their dashboard; optionally send anonymous ones away. */
export function useHomeRedirect({ whenAnonymous }: { whenAnonymous?: string } = {}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (user) router.replace(homeFor(user.role));
    else if (whenAnonymous) router.replace(whenAnonymous);
  }, [isLoading, user, whenAnonymous, router]);

  return { isLoading, user };
}

/** Block a section for anyone who is not signed in as `role`. */
export function useRoleGuard(role: Role) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const allowed = !isLoading && user?.role === role;

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/login");
    else if (user.role !== role) router.replace(homeFor(user.role));
  }, [isLoading, user, role, router]);

  return allowed;
}
