import { AccountBook, Category, Currency, Person, Transaction } from "@/types/ledger";

export const accountBooks: AccountBook[] = [
  { id: "book-personal", name: "日常帳本", icon: "wallet", baseCurrency: "TWD" },
  { id: "book-trip", name: "旅行帳本", icon: "airplane", baseCurrency: "TWD" }
];

export const categories: Category[] = [
  { id: "cat-breakfast", name: "早餐", type: "expense", icon: "cafe", color: "#C9A6A0", order: 1 },
  { id: "cat-transport", name: "交通", type: "expense", icon: "train", color: "#8E9AAF", order: 2 },
  { id: "cat-rent", name: "房租", type: "expense", icon: "home", color: "#BCA88D", order: 3 },
  { id: "cat-subscription", name: "訂閱", type: "expense", icon: "repeat", color: "#A48E89", order: 4 },
  { id: "cat-dining", name: "聚餐", type: "expense", icon: "restaurant", color: "#B87D73", order: 5 },
  { id: "cat-salary", name: "薪資", type: "income", icon: "briefcase", color: "#9AA77D", order: 6 },
  { id: "cat-bonus", name: "獎金", type: "income", icon: "sparkles", color: "#8FA89B", order: 7 },
  { id: "cat-transfer", name: "轉帳", type: "transfer", icon: "swap-horizontal", color: "#8E9AAF", order: 8 }
];

export const people: Person[] = [
  { id: "person-me", name: "我", avatarColor: "#8FA89B", favorite: true },
  { id: "person-ana", name: "Ana", avatarColor: "#C9A6A0", favorite: true },
  { id: "person-ben", name: "Ben", avatarColor: "#8E9AAF", favorite: false }
];

export const currencies: Currency[] = [
  { code: "TWD", name: "新台幣", rateToBase: 1, isBase: true },
  { code: "JPY", name: "日圓", rateToBase: 0.22, isBase: false },
  { code: "USD", name: "美元", rateToBase: 32.1, isBase: false },
  { code: "EUR", name: "歐元", rateToBase: 34.9, isBase: false }
];

export const transactions: Transaction[] = [
  {
    id: "tx-seed-1",
    accountBookId: "book-personal",
    type: "expense",
    amount: 120,
    currencyCode: "TWD",
    baseAmount: 120,
    categoryId: "cat-breakfast",
    payerId: "person-me",
    payments: [
      { id: "payment-seed-1", transactionId: "tx-seed-1", personId: "person-me", amount: 120 }
    ],
    date: new Date().toISOString(),
    note: "咖啡與早餐",
    tags: ["日常"],
    splitMode: "equal",
    splits: [
      { id: "split-seed-1", transactionId: "tx-seed-1", personId: "person-me", amount: 120, settled: true }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "tx-seed-2",
    accountBookId: "book-personal",
    type: "expense",
    amount: 1800,
    currencyCode: "TWD",
    baseAmount: 1800,
    categoryId: "cat-dining",
    payerId: "person-me",
    payments: [
      { id: "payment-seed-2", transactionId: "tx-seed-2", personId: "person-me", amount: 1800 }
    ],
    date: new Date().toISOString(),
    note: "週末聚餐",
    tags: ["朋友"],
    splitMode: "equal",
    splits: [
      { id: "split-seed-2a", transactionId: "tx-seed-2", personId: "person-me", amount: 600, settled: true },
      { id: "split-seed-2b", transactionId: "tx-seed-2", personId: "person-ana", amount: 600, settled: false },
      { id: "split-seed-2c", transactionId: "tx-seed-2", personId: "person-ben", amount: 600, settled: false }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "tx-seed-3",
    accountBookId: "book-personal",
    type: "income",
    amount: 62000,
    currencyCode: "TWD",
    baseAmount: 62000,
    categoryId: "cat-salary",
    payerId: "person-me",
    payments: [
      { id: "payment-seed-3", transactionId: "tx-seed-3", personId: "person-me", amount: 62000 }
    ],
    date: new Date().toISOString(),
    note: "本月薪資",
    tags: ["固定"],
    splitMode: "equal",
    splits: [],
    createdAt: new Date().toISOString()
  }
];
