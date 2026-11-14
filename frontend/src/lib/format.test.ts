import { describe, expect, it } from "vitest";
import { formatPercent, initials, pluralize } from "./format";

describe("format helpers", () => {
  it("formats percentages without trailing zeros", () => {
    expect(formatPercent(75)).toBe("75%");
    expect(formatPercent(66.666)).toBe("66.7%");
    expect(formatPercent(null)).toBe("-");
  });

  it("pluralizes", () => {
    expect(pluralize(1, "question")).toBe("1 question");
    expect(pluralize(4, "question")).toBe("4 questions");
  });

  it("builds initials", () => {
    expect(initials("Aarav Mehta")).toBe("AM");
    expect(initials("  diya ")).toBe("D");
  });
});
