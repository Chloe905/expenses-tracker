import { roundMoney } from "@/lib/money";
import { DebtSettlement, Payment, Split, SplitMode } from "@/types/ledger";

type BuildSplitInput = {
  transactionId: string;
  amount: number;
  participantIds?: string[];
  mode: SplitMode;
  allocations?: {
    personId: string;
    amount?: number;
    percent?: number;
  }[];
};

export function buildSplits({ transactionId, amount, participantIds, mode, allocations }: BuildSplitInput): Split[] {
  if (mode === "amount" && allocations?.length) {
    return allocations
      .filter((allocation) => (allocation.amount ?? 0) > 0)
      .map((allocation) => ({
        id: `${transactionId}-split-${allocation.personId}`,
        transactionId,
        personId: allocation.personId,
        amount: roundMoney(allocation.amount ?? 0),
        percent: amount > 0 ? roundMoney(((allocation.amount ?? 0) / amount) * 100) : 0,
        settled: false
      }));
  }

  if (mode === "percent" && allocations?.length) {
    return allocations
      .filter((allocation) => (allocation.percent ?? 0) > 0)
      .map((allocation, index) => {
        const priorAmount = allocations
          .slice(0, index)
          .reduce((sum, item) => sum + roundMoney(amount * ((item.percent ?? 0) / 100)), 0);
        const isLast = index === allocations.length - 1;
        const splitAmount = isLast ? roundMoney(amount - priorAmount) : roundMoney(amount * ((allocation.percent ?? 0) / 100));
        return {
          id: `${transactionId}-split-${allocation.personId}`,
          transactionId,
          personId: allocation.personId,
          amount: splitAmount,
          percent: roundMoney(allocation.percent ?? 0),
          settled: false
        };
      });
  }

  const selectedParticipantIds = participantIds ?? allocations?.map((allocation) => allocation.personId) ?? [];
  if (selectedParticipantIds.length === 0) {
    return [];
  }

  if (mode === "equal") {
    const baseShare = Math.floor((amount / selectedParticipantIds.length) * 100) / 100;
    let assigned = 0;
    return selectedParticipantIds.map((personId, index) => {
      const isLast = index === selectedParticipantIds.length - 1;
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

  const equalPercent = roundMoney(100 / selectedParticipantIds.length);
  return selectedParticipantIds.map((personId, index) => ({
    id: `${transactionId}-split-${personId}`,
    transactionId,
    personId,
    amount: index === selectedParticipantIds.length - 1 ? roundMoney(amount - roundMoney(amount * equalPercent / 100) * (selectedParticipantIds.length - 1)) : roundMoney(amount * equalPercent / 100),
    percent: equalPercent,
    settled: false
  }));
}

export function summarizeSettlements(
  transactions: { payerId: string; baseAmount?: number; type: string; splits: Split[]; payments?: Payment[] }[],
  debtSettlements: Pick<DebtSettlement, "fromPersonId" | "toPersonId" | "amount">[] = []
) {
  const netByPerson = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.type !== "expense") {
      continue;
    }

    const payments = transaction.payments?.length
      ? transaction.payments
      : [{ id: `${transaction.payerId}-fallback-payment`, transactionId: "fallback", personId: transaction.payerId, amount: transaction.baseAmount ?? transaction.splits.reduce((sum, split) => sum + split.amount, 0) }];

    for (const payment of payments) {
      netByPerson.set(payment.personId, roundMoney((netByPerson.get(payment.personId) ?? 0) + payment.amount));
    }

    for (const split of transaction.splits) {
      if (split.settled) {
        continue;
      }
      netByPerson.set(split.personId, roundMoney((netByPerson.get(split.personId) ?? 0) - split.amount));
    }
  }

  for (const settlement of debtSettlements) {
    netByPerson.set(settlement.fromPersonId, roundMoney((netByPerson.get(settlement.fromPersonId) ?? 0) + settlement.amount));
    netByPerson.set(settlement.toPersonId, roundMoney((netByPerson.get(settlement.toPersonId) ?? 0) - settlement.amount));
  }

  const debtors = Array.from(netByPerson.entries())
    .filter(([, amount]) => amount < -0.009)
    .map(([personId, amount]) => ({ personId, amount: roundMoney(Math.abs(amount)) }))
    .sort((a, b) => b.amount - a.amount);
  const creditors = Array.from(netByPerson.entries())
    .filter(([, amount]) => amount > 0.009)
    .map(([personId, amount]) => ({ personId, amount: roundMoney(amount) }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: { fromPersonId: string; toPersonId: string; amount: number }[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = roundMoney(Math.min(debtor.amount, creditor.amount));

    if (amount > 0) {
      settlements.push({ fromPersonId: debtor.personId, toPersonId: creditor.personId, amount });
    }

    debtor.amount = roundMoney(debtor.amount - amount);
    creditor.amount = roundMoney(creditor.amount - amount);

    if (debtor.amount <= 0.009) {
      debtorIndex += 1;
    }
    if (creditor.amount <= 0.009) {
      creditorIndex += 1;
    }
  }

  return settlements.sort((a, b) => b.amount - a.amount);
}
