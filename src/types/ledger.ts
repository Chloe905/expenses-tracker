export type TransactionType = "expense" | "income" | "transfer";
export type SplitMode = "equal" | "amount" | "percent";

export type AccountBook = {
  id: string;
  name: string;
  icon: string;
  baseCurrency: string;
};

export type Category = {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  order: number;
};

export type Person = {
  id: string;
  name: string;
  avatarColor: string;
  favorite: boolean;
};

export type Currency = {
  code: string;
  name: string;
  rateToBase: number;
  isBase: boolean;
};

export type Payment = {
  id: string;
  transactionId: string;
  personId: string;
  amount: number;
};

export type Split = {
  id: string;
  transactionId: string;
  personId: string;
  amount: number;
  percent?: number;
  settled: boolean;
};

export type Transaction = {
  id: string;
  accountBookId: string;
  type: TransactionType;
  amount: number;
  currencyCode: string;
  baseAmount: number;
  categoryId: string;
  payerId: string;
  payments: Payment[];
  date: string;
  note: string;
  tags: string[];
  splitMode: SplitMode;
  splits: Split[];
  createdAt: string;
};

export type TransactionDraft = {
  type: TransactionType;
  amount: number;
  currencyCode: string;
  categoryId: string;
  payerId: string;
  payments: {
    personId: string;
    amount: number;
  }[];
  date: string;
  note: string;
  tags: string[];
  splitMode: SplitMode;
  splitAllocations: {
    personId: string;
    amount?: number;
    percent?: number;
  }[];
};

export type LedgerSnapshot = {
  accountBooks: AccountBook[];
  categories: Category[];
  people: Person[];
  currencies: Currency[];
  transactions: Transaction[];
};
