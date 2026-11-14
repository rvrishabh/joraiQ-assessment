"use client";

import { PageLoader } from "@/components/States";
import { useHomeRedirect } from "@/hooks/useGuards";

export default function IndexPage() {
  useHomeRedirect({ whenAnonymous: "/login" });
  return (
    <div className="mx-auto max-w-md px-6 pt-32">
      <PageLoader rows={2} />
    </div>
  );
}
