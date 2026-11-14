"use client";

import { PageLoader } from "@/components/States";
import { useRoleGuard } from "@/hooks/useGuards";
import type { ReactNode } from "react";

export default function StudentLayout({ children }: { children: ReactNode }) {
  const allowed = useRoleGuard("STUDENT");
  return allowed ? <>{children}</> : <PageLoader rows={3} />;
}
