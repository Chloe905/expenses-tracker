import { describe, expect, it } from "vitest";

import { getCategoryTotals, getMonthlySummary } from "@/lib/stats";
import { categories } from "@/data/seed";
import { Transaction } from "@/types/ledger";

const baseTransaction = {
  id: "tx",
  accountBookId: "book",
  amount: 0,
  currencyCode: "TWD",
  categoryId: "cat-breakfast",
  payerId: "me",
  date: new Date(2026, 6, 10).toISOString(),
  note: "",
  tags: [],
  splitMode: "equal" as const,
  splits: [],
  createdAt: new Date(2026, 6, 10).toISOString()
};

describe("stats", () => {
  it("summarizes monthly income, expense, and transfer", () => {
    const transactions: Transaction[] = [
      { ...baseTransaction, id: "a", type: "income", baseAmount: 1000 },
      { ...baseTransaction, id: "b", type: "expense", baseAmount: 300 },
      { ...baseTransaction, id: "c", type: "transfer", baseAmount: 200 }
    ];

    expect(getMonthlySummary(transactions, new Date(2026, 6, 15))).toEqual({
      income: 1000,
      expense: 300,
      transfer: 200
    });
  });

  it("builds sorted expense category totals", () => {
    const transactions: Transaction[] = [
      { ...baseTransaction, id: "a", type: "expense", categoryId: "cat-breakfast", baseAmount: 100 },
      { ...baseTransaction, id: "b", type: "expense", categoryId: "cat-dining", baseAmount: 300 }
    ];

    expect(getCategoryTotals(transactions, categories).map((item) => [item.category.id, item.amount])).toEqual([
      ["cat-dining", 300],
      ["cat-breakfast", 100]
    ]);
  });
});
