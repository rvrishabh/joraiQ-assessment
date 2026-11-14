"use client";

import { Logo } from "@/components/Brand/Logo";
import { PenCircle, Reveal } from "@/components/Motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <Reveal className="grid min-h-screen place-items-center px-6 text-center">
      <div className="flex flex-col items-center">
        <div data-reveal className="mb-10">
          <Logo />
        </div>
        <div data-reveal className="relative grid h-36 w-60 place-items-center">
          <PenCircle className="absolute inset-0 size-full" delay={0.5} />
          <span className="hand -rotate-6 text-8xl text-redpen">404</span>
        </div>
        <h1 data-reveal className="mt-6 text-4xl font-extrabold">
          This page is not here
        </h1>
        <p data-reveal className="mt-2 max-w-sm text-ink-soft">
          The link may be old, or the quiz may have been removed.
        </p>
        <Link data-reveal href="/" className="mt-7">
          <Button size="lg">Back to home</Button>
        </Link>
      </div>
    </Reveal>
  );
}
