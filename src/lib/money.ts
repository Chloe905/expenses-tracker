import { Currency } from "@/types/ledger";

export function toBaseAmount(amount: number, currencyCode: string, currencies: Currency[]) {
  const currency = currencies.find((item) => item.code === currencyCode);
  if (!currency) {
    throw new Error(`Missing currency rate: ${currencyCode}`);
  }
  return roundMoney(amount * currency.rateToBase);
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatMoney(value: number, currency = "TWD") {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "TWD" || currency === "JPY" ? 0 : 2
  }).format(value);
}
