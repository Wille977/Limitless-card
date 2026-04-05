import { describe, it, expect } from "vitest";
import { rawToUsdc } from "../limitless-api";

// ─── rawToUsdc ───────────────────────────────────────────────────────────────

describe("rawToUsdc", () => {
  it("converts 6-decimal string to float", () => {
    expect(rawToUsdc("1000000")).toBe(1);
    expect(rawToUsdc("500000")).toBe(0.5);
    expect(rawToUsdc("100000000")).toBe(100);
  });

  it("handles zero", () => {
    expect(rawToUsdc("0")).toBe(0);
    expect(rawToUsdc(0)).toBe(0);
  });

  it("handles numeric input", () => {
    expect(rawToUsdc(1000000)).toBe(1);
    expect(rawToUsdc(250000)).toBe(0.25);
  });

  it("handles negative values", () => {
    expect(rawToUsdc("-1000000")).toBe(-1);
    expect(rawToUsdc(-500000)).toBe(-0.5);
  });

  it("handles custom decimals parameter", () => {
    expect(rawToUsdc("1000", 3)).toBe(1);
    expect(rawToUsdc("100", 2)).toBe(1);
    expect(rawToUsdc("10000000000000000000", 18)).toBe(10); // ETH-like
  });

  it("handles very large values", () => {
    expect(rawToUsdc("1000000000000")).toBe(1_000_000);
  });

  it("handles fractional results", () => {
    expect(rawToUsdc("1")).toBeCloseTo(0.000001);
    expect(rawToUsdc("123456")).toBeCloseTo(0.123456);
  });
});
