"use client";

import { AppShell } from "@/components/Layout/AppShell";
import { PageLoader } from "@/components/States";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-6 pt-32">
        <PageLoader rows={2} />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
