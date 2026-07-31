import { create } from "zustand";

import { accountBooks, categories, currencies, people, transactions } from "@/data/seed";
import { buildSplits } from "@/lib/splits";
import { toBaseAmount } from "@/lib/money";
import { loadSnapshot, saveSnapshot } from "@/storage/database";
import { isFirebaseConfigured, loadCloudSnapshot, saveCloudSnapshot } from "@/storage/firebaseLedger";
import { Category, Currency, LedgerSnapshot, Person, Transaction, TransactionDraft } from "@/types/ledger";

type LedgerState = LedgerSnapshot & {
  hydrated: boolean;
  cloudEnabled: boolean;
  syncStatus: "local" | "syncing" | "synced" | "error";
  hydrate: () => Promise<void>;
  addTransaction: (draft: TransactionDraft) => void;
  duplicateTransaction: (transactionId: string) => void;
  addPerson: (name: string) => void;
  addCategory: (category: Omit<Category, "id" | "order">) => void;
  updateCurrencyRate: (code: string, rateToBase: number) => void;
  importSnapshot: (snapshot: LedgerSnapshot) => void;
  exportSnapshot: () => LedgerSnapshot;
};

function seedSnapshot(): LedgerSnapshot {
  return normalizeSnapshot({ accountBooks, categories, people, currencies, transactions });
}

function snapshotFromState(state: LedgerSnapshot): LedgerSnapshot {
  return {
    accountBooks: state.accountBooks,
    categories: state.categories,
    people: state.people,
    currencies: state.currencies,
    transactions: state.transactions
  };
}

async function persist(state: LedgerSnapshot, setSyncStatus?: (status: LedgerState["syncStatus"]) => void) {
  const snapshot = snapshotFromState(state);
  await saveSnapshot(snapshot);

  if (!isFirebaseConfigured()) {
    setSyncStatus?.("local");
    return;
  }

  try {
    setSyncStatus?.("syncing");
    await saveCloudSnapshot(snapshot);
    setSyncStatus?.("synced");
  } catch {
    setSyncStatus?.("error");
  }
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeSnapshot(snapshot: LedgerSnapshot): LedgerSnapshot {
  return {
    ...snapshot,
    transactions: snapshot.transactions.map((transaction) => ({
      ...transaction,
      payments: transaction.payments?.length
        ? transaction.payments
        : [{
          id: `${transaction.id}-payment-${transaction.payerId}`,
          transactionId: transaction.id,
          personId: transaction.payerId,
          amount: transaction.baseAmount
        }]
    }))
  };
}

export const useLedgerStore = create<LedgerState>((set, get) => ({
  ...seedSnapshot(),
  hydrated: false,
  cloudEnabled: isFirebaseConfigured(),
  syncStatus: isFirebaseConfigured() ? "syncing" : "local",
  hydrate: async () => {
    const localSnapshot = normalizeSnapshot((await loadSnapshot()) ?? seedSnapshot());
    set({
      ...localSnapshot,
      hydrated: true,
      cloudEnabled: isFirebaseConfigured(),
      syncStatus: isFirebaseConfigured() ? "syncing" : "local"
    });

    if (!isFirebaseConfigured()) {
      await persist(localSnapshot, (syncStatus) => set({ syncStatus }));
      return;
    }

    try {
      const cloudSnapshot = await loadCloudSnapshot();
      const snapshot = normalizeSnapshot(cloudSnapshot ?? localSnapshot);
      set({ ...snapshot, syncStatus: "synced" });
      await persist(snapshot, (syncStatus) => set({ syncStatus }));
    } catch {
      set({ syncStatus: "error" });
      await saveSnapshot(localSnapshot);
    }
  },
  addTransaction: (draft) => {
    const state = get();
    const id = createId("tx");
    const baseAmount = toBaseAmount(draft.amount, draft.currencyCode, state.currencies);
    const payments = draft.payments.map((payment) => ({
      id: `${id}-payment-${payment.personId}`,
      transactionId: id,
      personId: payment.personId,
      amount: toBaseAmount(payment.amount, draft.currencyCode, state.currencies)
    }));
    const transaction: Transaction = {
      id,
      accountBookId: state.accountBooks[0].id,
      type: draft.type,
      amount: draft.amount,
      currencyCode: draft.currencyCode,
      baseAmount,
      categoryId: draft.categoryId,
      payerId: draft.payerId,
      payments,
      date: draft.date,
      note: draft.note,
      tags: draft.tags,
      splitMode: draft.splitMode,
      splits: draft.type === "expense" ? buildSplits({
        transactionId: id,
        amount: baseAmount,
        mode: draft.splitMode,
        allocations: draft.splitAllocations.map((allocation) => ({
          personId: allocation.personId,
          amount: allocation.amount === undefined ? undefined : toBaseAmount(allocation.amount, draft.currencyCode, state.currencies),
          percent: allocation.percent
        }))
      }) : [],
      createdAt: new Date().toISOString()
    };
    const next = { ...state, transactions: [transaction, ...state.transactions] };
    set({ transactions: next.transactions });
    void persist(next, (syncStatus) => set({ syncStatus }));
  },
  duplicateTransaction: (transactionId) => {
    const transaction = get().transactions.find((item) => item.id === transactionId);
    if (!transaction) {
      return;
    }
    get().addTransaction({
      type: transaction.type,
      amount: transaction.amount,
      currencyCode: transaction.currencyCode,
      categoryId: transaction.categoryId,
      payerId: transaction.payerId,
      payments: transaction.payments?.length
        ? transaction.payments.map((payment) => ({
          personId: payment.personId,
          amount: payment.amount / (get().currencies.find((currency) => currency.code === transaction.currencyCode)?.rateToBase ?? 1)
        }))
        : [{ personId: transaction.payerId, amount: transaction.amount }],
      date: new Date().toISOString(),
      note: transaction.note,
      tags: transaction.tags,
      splitMode: transaction.splitMode,
      splitAllocations: transaction.splits.map((split) => ({
        personId: split.personId,
        amount: split.amount / (get().currencies.find((currency) => currency.code === transaction.currencyCode)?.rateToBase ?? 1),
        percent: split.percent
      }))
    });
  },
  addPerson: (name) => {
    const state = get();
    const person: Person = {
      id: createId("person"),
      name,
      avatarColor: ["#8FA89B", "#8E9AAF", "#C9A6A0", "#9AA77D"][state.people.length % 4],
      favorite: true
    };
    const next = { ...state, people: [...state.people, person] };
    set({ people: next.people });
    void persist(next, (syncStatus) => set({ syncStatus }));
  },
  addCategory: (category) => {
    const state = get();
    const nextCategory: Category = {
      ...category,
      id: createId("cat"),
      order: state.categories.length + 1
    };
    const next = { ...state, categories: [...state.categories, nextCategory] };
    set({ categories: next.categories });
    void persist(next, (syncStatus) => set({ syncStatus }));
  },
  updateCurrencyRate: (code, rateToBase) => {
    const state = get();
    const nextCurrencies: Currency[] = state.currencies.map((currency) =>
      currency.code === code ? { ...currency, rateToBase } : currency
    );
    const next = { ...state, currencies: nextCurrencies };
    set({ currencies: nextCurrencies });
    void persist(next, (syncStatus) => set({ syncStatus }));
  },
  importSnapshot: (snapshot) => {
    set({ ...snapshot, hydrated: true });
    void persist(snapshot, (syncStatus) => set({ syncStatus }));
  },
  exportSnapshot: () => {
    const { accountBooks, categories, people, currencies, transactions } = get();
    return { accountBooks, categories, people, currencies, transactions };
  }
}));
