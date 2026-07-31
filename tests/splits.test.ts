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

  it("uses explicit amount allocations", () => {
    const splits = buildSplits({
      transactionId: "tx",
      amount: 100,
      mode: "amount",
      allocations: [
        { personId: "a", amount: 70 },
        { personId: "b", amount: 30 }
      ]
    });

    expect(splits.map((split) => [split.personId, split.amount, split.percent])).toEqual([
      ["a", 70, 70],
      ["b", 30, 30]
    ]);
  });

  it("uses explicit percent allocations", () => {
    const splits = buildSplits({
      transactionId: "tx",
      amount: 999,
      mode: "percent",
      allocations: [
        { personId: "a", percent: 40 },
        { personId: "b", percent: 60 }
      ]
    });

    expect(splits.map((split) => [split.personId, split.amount, split.percent])).toEqual([
      ["a", 399.6, 40],
      ["b", 599.4, 60]
    ]);
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

  it("settles expenses across multiple payers and split participants", () => {
    const settlements = summarizeSettlements([
      {
        payerId: "me",
        type: "expense",
        payments: [
          { id: "pay-a", transactionId: "tx", personId: "me", amount: 700 },
          { id: "pay-b", transactionId: "tx", personId: "ana", amount: 300 }
        ],
        splits: [
          { id: "split-a", transactionId: "tx", personId: "me", amount: 250, settled: false },
          { id: "split-b", transactionId: "tx", personId: "ana", amount: 250, settled: false },
          { id: "split-c", transactionId: "tx", personId: "ben", amount: 500, settled: false }
        ]
      }
    ]);

    expect(settlements).toEqual([
      { fromPersonId: "ben", toPersonId: "me", amount: 450 },
      { fromPersonId: "ben", toPersonId: "ana", amount: 50 }
    ]);
  });

  it("subtracts recorded debt settlements from current debt", () => {
    const settlements = summarizeSettlements([
      {
        payerId: "me",
        type: "expense",
        payments: [{ id: "pay-old", transactionId: "old", personId: "me", amount: 100 }],
        splits: [
          { id: "split-old-me", transactionId: "old", personId: "me", amount: 50, settled: false },
          { id: "split-old-ana", transactionId: "old", personId: "ana", amount: 50, settled: false }
        ]
      },
      {
        payerId: "me",
        type: "expense",
        payments: [{ id: "pay-new", transactionId: "new", personId: "me", amount: 40 }],
        splits: [
          { id: "split-new-me", transactionId: "new", personId: "me", amount: 20, settled: false },
          { id: "split-new-ana", transactionId: "new", personId: "ana", amount: 20, settled: false }
        ]
      }
    ], [
      { fromPersonId: "ana", toPersonId: "me", amount: 50 }
    ]);

    expect(settlements).toEqual([{ fromPersonId: "ana", toPersonId: "me", amount: 20 }]);
  });
});
