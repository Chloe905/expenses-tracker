import { Category, Transaction } from "@/types/ledger";

export function getMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

export function getMonthlySummary(transactions: Transaction[], date = new Date()) {
  const { start, end } = getMonthRange(date);
  const monthTransactions = transactions.filter((item) => {
    const txDate = new Date(item.date);
    return txDate >= start && txDate < end;
  });

  return monthTransactions.reduce(
    (summary, item) => {
      if (item.type === "income") {
        summary.income += item.baseAmount;
      }
      if (item.type === "expense") {
        summary.expense += item.baseAmount;
      }
      if (item.type === "transfer") {
        summary.transfer += item.baseAmount;
      }
      return summary;
    },
    { income: 0, expense: 0, transfer: 0 }
  );
}

export function getCategoryTotals(transactions: Transaction[], categories: Category[]) {
  return categories
    .map((category) => {
      const amount = transactions
        .filter((transaction) => transaction.categoryId === category.id && transaction.type === "expense")
        .reduce((sum, transaction) => sum + transaction.baseAmount, 0);
      return { category, amount };
    })
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}
