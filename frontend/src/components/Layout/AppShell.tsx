"use client";

import { Logo } from "@/components/Brand/Logo";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";
import type { ReactNode } from "react";

const NAV = {
  TEACHER: [
    { href: "/teacher", label: "Quizzes", exact: true },
    { href: "/teacher/quizzes/new", label: "New quiz", exact: true },
  ],
  STUDENT: [{ href: "/student", label: "My quizzes", exact: true }],
} as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const role = user?.role === "TEACHER" ? "TEACHER" : "STUDENT";
  const home = role === "TEACHER" ? "/teacher" : "/student";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link href={home} aria-label="Home" className="shrink-0 rounded-lg">
            <Logo />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
            {NAV[role].map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                    active ? "text-ink" : "text-ink-soft hover:text-ink",
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-3 -bottom-[13px] h-[3px] origin-left rounded-full bg-pencil transition-transform duration-300",
                      active ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5 rounded-full border border-line bg-paper py-1 pl-1 pr-3">
              <span className="grid size-8 place-items-center rounded-full bg-pencil font-display text-xs font-bold">
                {initials(user?.fullName ?? "")}
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="max-w-36 truncate text-sm font-semibold">{user?.fullName}</p>
                <p className="text-[11px] text-ink-soft">{role === "TEACHER" ? "Teacher" : "Student"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              aria-label="Log out"
              className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-redpen-soft hover:text-redpen"
            >
              <LogOut className="size-4.5" aria-hidden />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pt-10">{children}</main>
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      data-reveal
      className="group mb-5 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-ink-soft transition-colors hover:text-ink"
    >
      <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
      {children}
    </Link>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4", className)}>
      <div className="min-w-0">
        <h1 data-reveal className="text-[2.1rem] font-extrabold leading-[1.05] sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p data-reveal className="mt-2.5 max-w-xl text-[1.05rem] text-ink-soft">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div data-reveal>{actions}</div>}
    </div>
  );
}
