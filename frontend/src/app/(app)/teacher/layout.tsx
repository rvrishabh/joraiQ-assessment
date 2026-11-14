"use client";

import { PageLoader } from "@/components/States";
import { useRoleGuard } from "@/hooks/useGuards";
import type { ReactNode } from "react";

export default function TeacherLayout({ children }: { children: ReactNode }) {
  const allowed = useRoleGuard("TEACHER");
  return allowed ? <>{children}</> : <PageLoader rows={3} />;
}
