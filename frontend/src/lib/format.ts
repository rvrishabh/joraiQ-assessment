const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDate(value: string | Date | null | undefined) {
  return value ? dateFmt.format(new Date(value)) : "-";
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
}

export function pluralize(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}
