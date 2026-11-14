import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

// Which bubble (A-D) gets filled on each row of the sheet.
const MARKS = [1, 3, 0, 2, 1, 0];
const LETTERS = ["A", "B", "C", "D"];

/**
 * A scantron-style answer sheet that fills itself in. It is the one moving
 * thing on the sign-in screen, so it runs once and then settles.
 */
export function OmrSheet() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ delay: 0.3 });
        tl.from(".omr-sheet", { y: 24, opacity: 0, duration: 0.6, ease: "power3.out" });
        tl.from(".omr-row", { opacity: 0, x: -10, duration: 0.3, stagger: 0.06 }, "-=0.2");
        tl.fromTo(
          ".omr-fill",
          { scale: 0, transformOrigin: "50% 50%" },
          { scale: 1, duration: 0.28, ease: "back.out(2)", stagger: 0.32 },
          "+=0.1",
        );
        tl.from(".omr-score", { opacity: 0, y: 8, duration: 0.4 }, "-=0.2");
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([".omr-fill", ".omr-score", ".omr-row", ".omr-sheet"], {
          opacity: 1,
          scale: 1,
          x: 0,
          y: 0,
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden className="select-none">
      <div className="omr-sheet w-full max-w-sm rounded-2xl border border-white/15 bg-[#f7f4ea] p-6 text-[#1D2433] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
        <div className="mb-4 flex items-end justify-between border-b-2 border-[#1D2433] pb-2">
          <span className="font-display text-sm font-bold">Answer sheet</span>
          <span className="text-xs text-[#1D2433]/60">Use HB pencil</span>
        </div>

        <div className="space-y-2.5">
          {MARKS.map((mark, row) => (
            <div key={row} className="omr-row flex items-center gap-3">
              <span className="w-5 text-right text-xs tabular-nums text-[#1D2433]/55">{row + 1}</span>
              <div className="flex gap-3">
                {LETTERS.map((letter, col) => (
                  <span
                    key={letter}
                    className="relative grid size-7 place-items-center rounded-full border border-[#1D2433]/50 text-[10px] text-[#1D2433]/55"
                  >
                    {letter}
                    {col === mark && (
                      <span className="omr-fill absolute inset-0 rounded-full bg-[#1D2433]" />
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="omr-score mt-5 flex items-center justify-between rounded-lg bg-[#1D2433] px-4 py-3 text-white">
          <span className="text-sm">Scored on submit</span>
          <span className="font-display text-xl font-bold text-pencil">5 / 6</span>
        </div>
      </div>
    </div>
  );
}
