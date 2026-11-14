"use client";

import { PenCircle, prefersReducedMotion } from "@/components/Motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

const BURST_COLORS = ["#FFC93C", "#0F8A5F", "#19214A", "#E03A2F", "#4c5bd4"];

/**
 * The score as a teacher would write it: red pen, circled. A good score
 * gets a short burst of answer bubbles.
 */
export function GradedScore({
  correct,
  total,
  accuracy,
}: {
  correct: number;
  total: number;
  accuracy: number;
}) {
  const root = useRef<HTMLDivElement>(null);
  const celebrate = accuracy >= 70;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo(
        ".gs-num",
        { opacity: 0, scale: 1.6, rotate: -18 },
        { opacity: 1, scale: 1, rotate: -6, duration: 0.5, ease: "back.out(2)" },
      );
      if (celebrate) {
        const dots = gsap.utils.toArray<HTMLElement>(".gs-dot");
        tl.fromTo(
          dots,
          { x: 0, y: 0, scale: 0, opacity: 1 },
          {
            x: () => gsap.utils.random(-170, 170),
            y: () => gsap.utils.random(-130, 110),
            scale: () => gsap.utils.random(0.6, 1.3),
            rotate: () => gsap.utils.random(-90, 90),
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.01,
          },
          "+=0.5",
        );
        tl.to(dots, { opacity: 0, duration: 0.6, ease: "power1.in" }, "-=0.4");
      }
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative grid h-40 w-56 shrink-0 place-items-center" role="img" aria-label={`Score ${correct} out of ${total}`}>
      {celebrate &&
        Array.from({ length: 22 }).map((_, i) => (
          <span
            key={i}
            aria-hidden
            className="gs-dot pointer-events-none absolute left-1/2 top-1/2 -ml-1.5 -mt-1.5 size-3 rounded-full opacity-0"
            style={{
              background: BURST_COLORS[i % BURST_COLORS.length],
              borderRadius: i % 3 === 0 ? "3px" : "999px",
            }}
          />
        ))}
      <PenCircle className="absolute inset-0 size-full" delay={0.55} duration={0.8} />
      <span className="gs-num hand relative -rotate-6 text-7xl text-redpen">
        {correct}/{total}
      </span>
    </div>
  );
}
