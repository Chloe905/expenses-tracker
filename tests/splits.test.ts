import { describe, expect, it } from "vitest";

import { buildSplits, summarizeSettlements } from "@/lib/splits";

describe("buildSplits", () => {
  it("splits equally and assigns cent remainder to the last participant", () => {
    const splits = buildSplits({
      transactionId: "tx",
      amount: 100,
      participantIds: ["a", "b", "c"],
      mode: "equal"
    });

    expect(splits.map((split) => split.amount)).toEqual([33.33, 33.33, 33.34]);
  });

  it("returns no splits when there are no participants", () => {
    expect(buildSplits({ transactionId: "tx", amount: 100, participantIds: [], mode: "equal" })).toEqual([]);
  });
});

describe("summarizeSettlements", () => {
  it("summarizes unsettled shares owed to the payer", () => {
    const settlements = summarizeSettlements([
      {
        payerId: "me",
        type: "expense",
        splits: [
          { id: "a", transactionId: "tx", personId: "me", amount: 50, settled: true },
          { id: "b", transactionId: "tx", personId: "ana", amount: 50, settled: false }
        ]
      }
    ]);

    expect(settlements).toEqual([{ fromPersonId: "ana", toPersonId: "me", amount: 50 }]);
  });
});
