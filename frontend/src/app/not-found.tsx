"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">This page is not here</h1>
        <p className="text-ink-soft">The link may be old, or the quiz may have been removed.</p>
        <Link href="/">
          <Button>Back to home</Button>
        </Link>
      </div>
    </div>
  );
}
