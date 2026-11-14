"use client";

import { PenCircle, prefersReducedMotion } from "@/components/Motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

// Which bubble (A-D) gets filled on each row, and whether that answer is right.
const MARKS = [1, 3, 0, 2, 1, 0];
const WRONG_ROW = 3;
const LETTERS = ["A", "B", "C", "D"];

function Pencil() {
  return (
    <svg width="22" height="120" viewBox="0 0 22 120" aria-hidden>
      <rect x="3" y="0" width="16" height="12" rx="3" fill="#f39a9a" />
      <rect x="3" y="12" width="16" height="8" fill="#c8ccd6" />
      <rect x="3" y="20" width="16" height="72" fill="#FFC93C" />
      <rect x="8.5" y="20" width="5" height="72" fill="#f2b51f" />
      <path d="M3 92 L19 92 L11 114 Z" fill="#f2d9b0" />
      <path d="M8.2 106 L13.8 106 L11 114 Z" fill="#19214A" />
    </svg>
  );
}

/**
 * A scantron-style answer sheet that a pencil fills in, row by row, before a
 * red pen marks the score. Plays once on the sign-in screen, then settles.
 */
export function OmrSheet() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const sheet = root.current?.querySelector<HTMLElement>(".omr-sheet");
      const pencil = root.current?.querySelector<HTMLElement>(".omr-pencil");
      const fills = gsap.utils.toArray<HTMLElement>(".omr-fill", root.current);
      if (!sheet || !pencil) return;

      if (prefersReducedMotion()) {
        gsap.set(fills, { scale: 1 });
        gsap.set([".omr-score", ".omr-mark"], { opacity: 1 });
        gsap.set(pencil, { opacity: 0 });
        return;
      }

      // Pencil tip sits at the bottom-centre of the pencil graphic.
      const tipAt = (el: HTMLElement) => {
        const s = sheet.getBoundingClientRect();
        const b = el.getBoundingClientRect();
        return { x: b.left - s.left + b.width / 2 - 11, y: b.top - s.top + b.height / 2 - 114 };
      };

      const tl = gsap.timeline({ delay: 0.2 });
      tl.from(".omr-stack", { y: 40, opacity: 0, rotate: -6, duration: 0.8, ease: "power3.out", stagger: 0.08 });
      tl.from(".omr-row", { opacity: 0, x: -12, duration: 0.3, stagger: 0.05 }, "-=0.4");

      const first = fills[0]!;
      tl.fromTo(
        pencil,
        { x: () => tipAt(first).x + 80, y: () => tipAt(first).y - 60, opacity: 0, rotate: 18 },
        { x: () => tipAt(first).x, y: () => tipAt(first).y, opacity: 1, rotate: 14, duration: 0.5, ease: "power2.out" },
      );

      fills.forEach((fill, i) => {
        if (i > 0) tl.to(pencil, { x: () => tipAt(fill).x, y: () => tipAt(fill).y, duration: 0.28, ease: "power2.inOut" });
        // A short scribble while the bubble fills.
        tl.to(pencil, { x: "+=3", y: "-=2", duration: 0.05, repeat: 3, yoyo: true, ease: "none" });
        tl.fromTo(fill, { scale: 0 }, { scale: 1, duration: 0.22, ease: "back.out(2)" }, "<");
      });

      tl.to(pencil, { x: "+=120", y: "-=80", opacity: 0, rotate: 30, duration: 0.5, ease: "power2.in" });
      tl.to(".omr-mark", { opacity: 1, duration: 0.01, stagger: 0.12 }, "-=0.2");
      tl.fromTo(".omr-score", { opacity: 0, scale: 0.6, rotate: -14 }, { opacity: 1, scale: 1, rotate: -6, duration: 0.45, ease: "back.out(2.2)" });
      tl.to(".pen-path", { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" }, "-=0.1");
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden className="relative select-none">
      {/* Sheets underneath, for a stack-of-papers feel */}
      <div className="omr-stack absolute inset-0 translate-x-4 translate-y-3 rotate-3 rounded-2xl bg-white/10" />
      <div className="omr-stack absolute inset-0 translate-x-2 translate-y-1.5 rotate-[1.5deg] rounded-2xl bg-white/20" />

      <div className="omr-stack omr-sheet relative w-full max-w-sm rounded-2xl bg-[#fbfaf6] p-6 text-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
        <div className="mb-5 flex items-end justify-between border-b-2 border-ink pb-2">
          <span className="font-display text-sm font-extrabold">Answer sheet</span>
          <span className="text-xs text-ink/55">Use HB pencil only</span>
        </div>

        <div className="space-y-2.5">
          {MARKS.map((mark, row) => (
            <div key={row} className="omr-row flex items-center gap-3">
              <span className="w-5 text-right text-xs tabular-nums text-ink/50">{row + 1}</span>
              <div className="flex gap-3">
                {LETTERS.map((letter, col) => (
                  <span
                    key={letter}
                    className="relative grid size-7 place-items-center rounded-full border border-ink/45 text-[10px] text-ink/50"
                  >
                    {letter}
                    {col === mark && (
                      <span className="omr-fill absolute inset-[2px] rounded-full bg-ink" />
                    )}
                  </span>
                ))}
              </div>
              <span
                className={`omr-mark hand ml-auto text-2xl opacity-0 ${row === WRONG_ROW ? "text-redpen" : "text-mark"}`}
              >
                {row === WRONG_ROW ? "✗" : "✓"}
              </span>
            </div>
          ))}
        </div>

        <div className="omr-score absolute -bottom-9 -right-8 grid h-28 w-44 place-items-center opacity-0">
          <PenCircle manual className="absolute inset-0 size-full" />
          <span className="hand text-5xl text-redpen">5/6</span>
        </div>

        <span className="omr-pencil pointer-events-none absolute left-0 top-0 origin-bottom opacity-0 drop-shadow-[6px_10px_8px_rgba(0,0,0,0.25)]">
          <Pencil />
        </span>
      </div>
    </div>
  );
}
