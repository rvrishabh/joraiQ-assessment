"use client";

import { cn } from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ElementType, type ReactNode } from "react";

gsap.registerPlugin(useGSAP);

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Page entrance. Children marked with `data-reveal` rise in once, in
 * document order. Used once per page so it reads as one sequence.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  delay = 0,
  deps = [],
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delay?: number;
  deps?: unknown[];
}) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      // Only elements not shown yet, so content that loads later joins the
      // sequence without replaying what is already on screen.
      const items = gsap.utils
        .toArray<HTMLElement>("[data-reveal]", root.current)
        .filter((el) => !el.dataset.shown);
      if (!items.length) return;
      items.forEach((el) => (el.dataset.shown = "1"));
      if (prefersReducedMotion()) {
        gsap.set(items, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        items,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.06, delay, clearProps: "transform" },
      );
    },
    { scope: root, dependencies: deps },
  );
  return (
    <Tag ref={root} className={className}>
      {children}
    </Tag>
  );
}

/** Number that counts up from zero the first time it renders. */
export function CountUp({
  value,
  suffix = "",
  decimals = 0,
  duration = 1.1,
  className,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const el = useRef<HTMLSpanElement>(null);
  const fmt = (v: number) => `${v.toFixed(decimals)}${suffix}`;
  useGSAP(
    () => {
      if (!el.current) return;
      if (prefersReducedMotion()) {
        el.current.textContent = fmt(value);
        return;
      }
      const counter = { v: 0 };
      gsap.to(counter, {
        v: value,
        duration,
        ease: "power2.out",
        onUpdate: () => {
          if (el.current) el.current.textContent = fmt(counter.v);
        },
      });
    },
    { dependencies: [value] },
  );
  return (
    <span ref={el} className={cn("tabular-nums", className)} aria-label={fmt(value)}>
      {fmt(value)}
    </span>
  );
}

/**
 * A heading with a highlighter swipe that draws in behind it once.
 */
export function Highlighted({ children, className, delay = 0.25 }: { children: ReactNode; className?: string; delay?: number }) {
  const root = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        ".highlight-bar",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.7, ease: "power2.inOut", delay },
      );
    },
    { scope: root },
  );
  return (
    <span ref={root} className={cn("highlight", className)}>
      <span className="highlight-bar" aria-hidden />
      {children}
    </span>
  );
}

/**
 * Hand-drawn loop, like a teacher circling a score in red pen. The path
 * strokes itself in once.
 */
export function PenCircle({
  className,
  color = "var(--color-redpen)",
  delay = 0.2,
  duration = 0.9,
  manual = false,
}: {
  className?: string;
  color?: string;
  delay?: number;
  duration?: number;
  /** Leave the stroke hidden so a parent timeline can draw `.pen-path`. */
  manual?: boolean;
}) {
  const path = useRef<SVGPathElement>(null);
  useGSAP(
    () => {
      const p = path.current;
      if (!p) return;
      const len = p.getTotalLength();
      if (prefersReducedMotion()) {
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: 0 });
        return;
      }
      if (manual) {
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        return;
      }
      gsap.fromTo(
        p,
        { strokeDasharray: len, strokeDashoffset: len },
        { strokeDashoffset: 0, duration, delay, ease: "power2.inOut" },
      );
    },
    { dependencies: [] },
  );
  return (
    <svg viewBox="0 0 220 120" className={cn("pointer-events-none", className)} aria-hidden fill="none">
      <path
        ref={path}
        className="pen-path"
        d="M150 14 C 92 2, 22 18, 14 58 C 7 96, 74 114, 128 108 C 186 102, 214 76, 204 46 C 196 22, 158 10, 112 12"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Red-pen tick, drawn in. */
export function PenTick({ className, delay = 0 }: { className?: string; delay?: number }) {
  const path = useRef<SVGPathElement>(null);
  useGSAP(() => {
    const p = path.current;
    if (!p) return;
    const len = p.getTotalLength();
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: prefersReducedMotion() ? 0 : len });
    if (!prefersReducedMotion()) gsap.to(p, { strokeDashoffset: 0, duration: 0.4, delay, ease: "power2.out" });
  });
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden fill="none">
      <path ref={path} d="M7 22 L16 31 L34 9" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Red-pen cross, drawn in. */
export function PenCross({ className, delay = 0 }: { className?: string; delay?: number }) {
  const root = useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      const paths = gsap.utils.toArray<SVGPathElement>("path", root.current);
      paths.forEach((p, i) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: prefersReducedMotion() ? 0 : len });
        if (!prefersReducedMotion())
          gsap.to(p, { strokeDashoffset: 0, duration: 0.22, delay: delay + i * 0.18, ease: "power2.out" });
      });
    },
    { scope: root },
  );
  return (
    <svg ref={root} viewBox="0 0 40 40" className={className} aria-hidden fill="none">
      <path d="M10 9 L31 31" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M31 9 L9 32" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}
