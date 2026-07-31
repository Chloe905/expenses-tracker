import { describe, expect, it } from "vitest";

import { toBaseAmount } from "@/lib/money";
import { currencies } from "@/data/seed";

describe("toBaseAmount", () => {
  it("converts to the base currency with the configured manual rate", () => {
    expect(toBaseAmount(100, "JPY", currencies)).toBe(22);
  });

  it("throws when the currency has no rate", () => {
    expect(() => toBaseAmount(10, "GBP", currencies)).toThrow("Missing currency rate: GBP");
  });
});
