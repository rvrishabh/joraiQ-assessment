"use client";

import { Logo } from "@/components/Brand/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import Link from "next/link";
import { LogOut } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const home = user?.role === "TEACHER" ? "/teacher" : "/student";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href={home} aria-label="Home">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 sm:flex">
              <span className="grid size-8 place-items-center rounded-full bg-pencil text-xs font-bold">
                {initials(user?.fullName ?? "")}
              </span>
              <div className="leading-tight">
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-xs text-ink-soft">
                  {user?.role === "TEACHER" ? "Teacher" : "Student"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => void logout()} aria-label="Log out">
              <LogOut className="size-4" aria-hidden />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-xl text-ink-soft">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
