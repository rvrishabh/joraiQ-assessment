"use client";

import { Logo } from "@/components/Brand/Logo";
import { OmrSheet } from "@/components/Brand/OmrSheet";
import { Reveal } from "@/components/Motion";
import type { ReactNode } from "react";

/**
 * Split screen for sign-in and registration: the self-marking answer sheet
 * on the left, the form on a sheet of paper on the right.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-14">
        {/* White graph-paper grid on ink */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse at 30% 40%, #000 30%, transparent 75%)",
          }}
        />
        <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-pencil/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 size-[28rem] rounded-full bg-[#4c5bd4]/25 blur-3xl" />

        <div className="relative">
          <Logo light />
        </div>

        <div className="relative flex flex-col gap-10 py-8">
          <Reveal className="max-w-xl space-y-4">
            <h1 data-reveal className="text-[2.75rem] font-extrabold leading-[0.98] tracking-[-0.035em] xl:text-[3.4rem]">
              <span className="block">Set the quiz.</span>
              <span className="block whitespace-nowrap">Let the sheet mark it.</span>
            </h1>
            <p data-reveal className="max-w-md text-lg leading-relaxed text-white/65">
              Assign a quiz to your class, see who finished, and how every student scored.
            </p>
          </Reveal>
          <div className="ml-auto mr-10 w-full max-w-sm pb-8 xl:mr-16">
            <OmrSheet />
          </div>
        </div>

        <p className="relative text-sm text-white/40">A JoraIQ learning tool</p>
      </aside>

      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <Reveal className="w-full max-w-[26rem]">
          <div data-reveal className="mb-10 lg:hidden">
            <Logo />
          </div>
          {children}
        </Reveal>
      </section>
    </div>
  );
}
