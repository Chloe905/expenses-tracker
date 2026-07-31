import { roundMoney } from "@/lib/money";
import { Split, SplitMode } from "@/types/ledger";

type BuildSplitInput = {
  transactionId: string;
  amount: number;
  participantIds: string[];
  mode: SplitMode;
};

export function buildSplits({ transactionId, amount, participantIds, mode }: BuildSplitInput): Split[] {
  if (participantIds.length === 0) {
    return [];
  }

  if (mode === "equal") {
    const baseShare = Math.floor((amount / participantIds.length) * 100) / 100;
    let assigned = 0;
    return participantIds.map((personId, index) => {
      const isLast = index === participantIds.length - 1;
      const splitAmount = isLast ? roundMoney(amount - assigned) : baseShare;
      assigned = roundMoney(assigned + splitAmount);
      return {
        id: `${transactionId}-split-${personId}`,
        transactionId,
        personId,
        amount: splitAmount,
        percent: roundMoney((splitAmount / amount) * 100),
        settled: false
      };
    });
  }

  const equalPercent = roundMoney(100 / participantIds.length);
  return participantIds.map((personId, index) => ({
    id: `${transactionId}-split-${personId}`,
    transactionId,
    personId,
    amount: index === participantIds.length - 1 ? roundMoney(amount - roundMoney(amount * equalPercent / 100) * (participantIds.length - 1)) : roundMoney(amount * equalPercent / 100),
    percent: equalPercent,
    settled: false
  }));
}

export function summarizeSettlements(transactions: { payerId: string; type: string; splits: Split[] }[]) {
  const balances = new Map<string, Map<string, number>>();

  for (const transaction of transactions) {
    if (transaction.type !== "expense") {
      continue;
    }

    for (const split of transaction.splits) {
      if (split.personId === transaction.payerId || split.settled) {
        continue;
      }
      const payerMap = balances.get(split.personId) ?? new Map<string, number>();
      payerMap.set(transaction.payerId, roundMoney((payerMap.get(transaction.payerId) ?? 0) + split.amount));
      balances.set(split.personId, payerMap);
    }
  }

  const settlements: { fromPersonId: string; toPersonId: string; amount: number }[] = [];
  balances.forEach((toMap, fromPersonId) => {
    toMap.forEach((amount, toPersonId) => {
      if (amount > 0) {
        settlements.push({ fromPersonId, toPersonId, amount });
      }
    });
  });

  return settlements.sort((a, b) => b.amount - a.amount);
}
