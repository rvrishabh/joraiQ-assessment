export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="8" fill={light ? "#fff" : "#1D2433"} />
        <circle cx="16" cy="16" r="7" fill="none" stroke={light ? "#1D2433" : "#fff"} strokeWidth="2.5" />
        <circle cx="16" cy="16" r="3.5" fill="#F4C430" />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight">Jora Quiz</span>
    </span>
  );
}
