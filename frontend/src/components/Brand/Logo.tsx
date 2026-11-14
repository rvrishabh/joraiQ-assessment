/** Mark: a filled answer bubble with a pencil-yellow core. */
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="group inline-flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden className="transition-transform duration-300 group-hover:-rotate-12">
        <rect width="32" height="32" rx="9" fill={light ? "#fff" : "#19214A"} />
        <circle cx="16" cy="16" r="8" fill="none" stroke={light ? "#19214A" : "#fff"} strokeWidth="2.5" />
        <circle cx="16" cy="16" r="4.5" fill="#FFC93C" />
      </svg>
      <span className="font-display text-[1.2rem] font-extrabold tracking-[-0.03em]">
        Jora Quiz
      </span>
    </span>
  );
}
