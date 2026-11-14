"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

const R = 54;
const CIRC = 2 * Math.PI * R;

/** Ring and number settle on the final accuracy once, when the result opens. */
export function ScoreRing({ accuracy }: { accuracy: number }) {
  const root = useRef<HTMLDivElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const final = CIRC * (1 - accuracy / 100);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        gsap.set(arc.current, { strokeDashoffset: final });
        if (label.current) label.current.textContent = `${Math.round(accuracy)}%`;
        return;
      }
      const counter = { v: 0 };
      gsap.fromTo(arc.current, { strokeDashoffset: CIRC }, { strokeDashoffset: final, duration: 1.2, ease: "power3.out" });
      gsap.to(counter, {
        v: accuracy,
        duration: 1.2,
        ease: "power3.out",
        onUpdate: () => {
          if (label.current) label.current.textContent = `${Math.round(counter.v)}%`;
        },
      });
    },
    { scope: root, dependencies: [accuracy] },
  );

  return (
    <div ref={root} className="relative size-40" role="img" aria-label={`Accuracy ${accuracy} percent`}>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={R} fill="none" stroke="#d8dde8" strokeWidth="10" />
        <circle
          ref={arc}
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke={accuracy >= 50 ? "#1e8f5c" : "#d2433d"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC}
        />
      </svg>
      <span
        ref={label}
        className="absolute inset-0 grid place-items-center font-display text-4xl font-bold tabular-nums"
      >
        0%
      </span>
    </div>
  );
}
