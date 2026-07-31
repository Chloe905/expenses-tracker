import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { z } from "zod";

import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Text } from "@/components/Text";
import { useLedgerStore } from "@/store/ledgerStore";
import { palette } from "@/theme/palette";
import { SplitMode, TransactionType } from "@/types/ledger";

const schema = z.object({
  type: z.enum(["expense", "income", "transfer"]),
  amount: z.coerce.number().positive("請輸入金額"),
  currencyCode: z.string().min(1),
  categoryId: z.string().min(1),
  payerId: z.string().min(1),
  date: z.string().min(1),
  note: z.string(),
  tags: z.string(),
  splitMode: z.enum(["equal", "amount", "percent"])
});

type FormValues = z.infer<typeof schema>;

export default function NewTransactionScreen() {
  const router = useRouter();
  const categories = useLedgerStore((state) => state.categories);
  const people = useLedgerStore((state) => state.people);
  const currencies = useLedgerStore((state) => state.currencies);
  const addTransaction = useLedgerStore((state) => state.addTransaction);
  const [payerIds, setPayerIds] = useState(["person-me"]);
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, string>>({});
  const [splitPersonIds, setSplitPersonIds] = useState(["person-me"]);
  const [splitAmounts, setSplitAmounts] = useState<Record<string, string>>({});
  const [splitPercents, setSplitPercents] = useState<Record<string, string>>({});
  const [allocationError, setAllocationError] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "expense",
      amount: 0,
      currencyCode: "TWD",
      categoryId: "cat-breakfast",
      payerId: "person-me",
      date: new Date().toISOString(),
      note: "",
      tags: "",
      splitMode: "equal"
    }
  });

  const selectedType = form.watch("type");
  const selectedAmount = Number(form.watch("amount")) || 0;
  const splitMode = form.watch("splitMode");
  const visibleCategories = categories.filter((category) => category.type === selectedType);

  return (
    <Screen>
      <Controller
        control={form.control}
        name="type"
        render={({ field }) => (
          <SegmentedControl<TransactionType>
            value={field.value}
            onChange={(value) => {
              field.onChange(value);
              const nextCategory = categories.find((category) => category.type === value);
              if (nextCategory) {
                form.setValue("categoryId", nextCategory.id);
              }
            }}
            options={[
              { label: "支出", value: "expense" },
              { label: "收入", value: "income" },
              { label: "轉帳", value: "transfer" }
            ]}
          />
        )}
      />

      <Card>
        <Text variant="section">金額與分類</Text>
        <Controller
          control={form.control}
          name="amount"
          render={({ field }) => (
            <TextInput
              keyboardType="decimal-pad"
              value={String(field.value || "")}
              onChangeText={field.onChange}
              placeholder="0"
              placeholderTextColor={palette.mutedText}
              style={styles.amountInput}
            />
          )}
        />
        {form.formState.errors.amount ? <Text style={styles.error}>{form.formState.errors.amount.message}</Text> : null}
        <Text variant="muted">幣別</Text>
        <View style={styles.chips}>
          {currencies.map((currency) => (
            <Controller
              key={currency.code}
              control={form.control}
              name="currencyCode"
              render={({ field }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => field.onChange(currency.code)}
                  style={[styles.chip, field.value === currency.code && styles.selectedChip]}
                >
                  <Text style={field.value === currency.code && styles.selectedChipText}>{currency.code}</Text>
                </Pressable>
              )}
            />
          ))}
        </View>
        <Text variant="muted">分類</Text>
        <View style={styles.chips}>
          {visibleCategories.map((category) => (
            <Controller
              key={category.id}
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => field.onChange(category.id)}
                  style={[styles.categoryChip, { borderColor: category.color }, field.value === category.id && { backgroundColor: category.color }]}
                >
                  <Ionicons name={category.icon as keyof typeof Ionicons.glyphMap} size={16} color={field.value === category.id ? palette.surface : palette.text} />
                  <Text style={field.value === category.id && styles.selectedChipText}>{category.name}</Text>
                </Pressable>
              )}
            />
          ))}
        </View>
      </Card>

      <Card>
        <Text variant="section">付款人與分帳</Text>
        <Text variant="muted">付款人</Text>
        <View style={styles.chips}>
          {people.map((person) => {
            const selected = payerIds.includes(person.id);
            return (
              <Pressable
                key={person.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                onPress={() => {
                  const next = selected ? payerIds.filter((id) => id !== person.id) : [...payerIds, person.id];
                  const safeNext = next.length ? next : [person.id];
                  setPayerIds(safeNext);
                  form.setValue("payerId", safeNext[0]);
                }}
                style={[styles.chip, selected && styles.selectedChip]}
              >
                <Text style={selected && styles.selectedChipText}>{person.name}</Text>
              </Pressable>
            );
          })}
        </View>
        {payerIds.map((personId) => {
          const person = people.find((item) => item.id === personId);
          const autoPaymentAmount = getAutoFilledValue(selectedAmount, payerIds, paymentAmounts, personId);
          return (
            <View key={personId} style={styles.amountRow}>
              <Text style={styles.rowLabel}>{person?.name ?? "未知"} 先付</Text>
              <TextInput
                keyboardType="decimal-pad"
                value={paymentAmounts[personId] ?? autoPaymentAmount}
                onChangeText={(value) => setPaymentAmounts((current) => ({ ...current, [personId]: value }))}
                placeholder="0"
                placeholderTextColor={palette.mutedText}
                style={styles.rowInput}
              />
            </View>
          );
        })}
        {selectedType === "expense" ? (
          <>
            <Controller
              control={form.control}
              name="splitMode"
              render={({ field }) => (
                <SegmentedControl<SplitMode>
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { label: "平均", value: "equal" },
                    { label: "金額", value: "amount" },
                    { label: "比例", value: "percent" }
                  ]}
                />
              )}
            />
            <Text variant="muted">分帳人</Text>
            <View style={styles.chips}>
              {people.map((person) => {
                const selected = splitPersonIds.includes(person.id);
                return (
                  <Pressable
                    key={person.id}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    onPress={() => {
                      const next = selected ? splitPersonIds.filter((id) => id !== person.id) : [...splitPersonIds, person.id];
                      setSplitPersonIds(next.length ? next : [person.id]);
                    }}
                    style={[styles.chip, selected && styles.selectedChip]}
                  >
                    <Text style={selected && styles.selectedChipText}>{person.name}</Text>
                  </Pressable>
                );
              })}
            </View>
            {splitPersonIds.map((personId, index) => {
              const person = people.find((item) => item.id === personId);
              const equalShare = splitPersonIds.length ? selectedAmount / splitPersonIds.length : 0;
              const autoSplitAmount = getAutoFilledValue(selectedAmount, splitPersonIds, splitAmounts, personId);
              const autoSplitPercent = getAutoFilledValue(100, splitPersonIds, splitPercents, personId);
              return (
                <View key={personId} style={styles.amountRow}>
                  <Text style={styles.rowLabel}>{person?.name ?? "未知"} 應分</Text>
                  {splitMode === "equal" ? (
                    <Text style={styles.previewValue}>{formatPlainNumber(index === splitPersonIds.length - 1 ? selectedAmount - equalShare * (splitPersonIds.length - 1) : equalShare)}</Text>
                  ) : (
                    <TextInput
                      keyboardType="decimal-pad"
                      value={splitMode === "amount" ? splitAmounts[personId] ?? autoSplitAmount : splitPercents[personId] ?? autoSplitPercent}
                      onChangeText={(value) => {
                        if (splitMode === "amount") {
                          setSplitAmounts((current) => ({ ...current, [personId]: value }));
                        } else {
                          setSplitPercents((current) => ({ ...current, [personId]: value }));
                        }
                      }}
                      placeholder={splitMode === "amount" ? "0" : "%"}
                      placeholderTextColor={palette.mutedText}
                      style={styles.rowInput}
                    />
                  )}
                </View>
              );
            })}
          </>
        ) : null}
        {allocationError ? <Text style={styles.error}>{allocationError}</Text> : null}
      </Card>

      <Card>
        <Text variant="section">備註與標籤</Text>
        <Controller
          control={form.control}
          name="note"
          render={({ field }) => (
            <TextInput value={field.value} onChangeText={field.onChange} placeholder="備註" placeholderTextColor={palette.mutedText} style={styles.input} />
          )}
        />
        <Controller
          control={form.control}
          name="tags"
          render={({ field }) => (
            <TextInput value={field.value} onChangeText={field.onChange} placeholder="標籤，以逗號分隔" placeholderTextColor={palette.mutedText} style={styles.input} />
          )}
        />
        <PrimaryButton
          label="儲存交易"
          icon="checkmark-outline"
          onPress={form.handleSubmit((values) => {
            const allocation = buildTransactionAllocation({
              amount: values.amount,
              type: values.type,
              payerIds,
              paymentAmounts,
              splitPersonIds,
              splitMode: values.splitMode,
              splitAmounts,
              splitPercents
            });

            if (allocation.error) {
              setAllocationError(allocation.error);
              return;
            }

            setAllocationError("");
            addTransaction({
              ...values,
              payerId: allocation.payments[0]?.personId ?? values.payerId,
              payments: allocation.payments,
              tags: values.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
              splitAllocations: allocation.splitAllocations
            });
            router.back();
          })}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  amountInput: {
    minHeight: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    fontSize: 28,
    fontWeight: "900",
    color: palette.text,
    backgroundColor: palette.surface,
    outlineStyle: "none"
  } as object,
  input: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 12,
    color: palette.text,
    backgroundColor: palette.surface,
    outlineStyle: "none"
  } as object,
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chip: {
    minHeight: 38,
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surfaceAlt
  },
  selectedChip: {
    backgroundColor: palette.primary
  },
  selectedChipText: {
    color: palette.surface,
    fontWeight: "900"
  },
  categoryChip: {
    minHeight: 38,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: palette.surface
  },
  error: {
    color: palette.warning,
    fontWeight: "800"
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  rowLabel: {
    width: 96,
    fontWeight: "800"
  },
  rowInput: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 12,
    color: palette.text,
    backgroundColor: palette.surface,
    outlineStyle: "none"
  } as object,
  previewValue: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: palette.background,
    color: palette.mutedText,
    lineHeight: 40,
    fontWeight: "800"
  }
});

type AllocationInput = {
  amount: number;
  type: TransactionType;
  payerIds: string[];
  paymentAmounts: Record<string, string>;
  splitPersonIds: string[];
  splitMode: SplitMode;
  splitAmounts: Record<string, string>;
  splitPercents: Record<string, string>;
};

function buildTransactionAllocation(input: AllocationInput): {
  payments: { personId: string; amount: number }[];
  splitAllocations: { personId: string; amount?: number; percent?: number }[];
  error?: string;
} {
  const payments = resolveRemainingAllocation(input.amount, input.payerIds, input.paymentAmounts);

  const paidTotal = roundInputTotal(payments.reduce((sum, payment) => sum + payment.amount, 0));
  if (Math.abs(paidTotal - input.amount) > 0.01) {
    return {
      payments,
      splitAllocations: [],
      error: `先付總額需等於交易金額，目前是 ${formatPlainNumber(paidTotal)}。`
    };
  }

  if (input.type !== "expense") {
    return { payments, splitAllocations: [] };
  }

  if (input.splitMode === "equal") {
    return {
      payments,
      splitAllocations: input.splitPersonIds.map((personId) => ({ personId }))
    };
  }

  if (input.splitMode === "amount") {
    const splitAllocations = resolveRemainingAllocation(input.amount, input.splitPersonIds, input.splitAmounts);
    const splitTotal = roundInputTotal(splitAllocations.reduce((sum, split) => sum + (split.amount ?? 0), 0));
    if (Math.abs(splitTotal - input.amount) > 0.01) {
      return {
        payments,
        splitAllocations,
        error: `分帳金額總和需等於交易金額，目前是 ${formatPlainNumber(splitTotal)}。`
      };
    }
    return { payments, splitAllocations };
  }

  const splitAllocations = resolveRemainingAllocation(100, input.splitPersonIds, input.splitPercents).map((allocation) => ({
    personId: allocation.personId,
    percent: allocation.amount
  }));
  const percentTotal = roundInputTotal(splitAllocations.reduce((sum, split) => sum + (split.percent ?? 0), 0));
  if (Math.abs(percentTotal - 100) > 0.01) {
    return {
      payments,
      splitAllocations,
      error: `分帳比例總和需為 100%，目前是 ${formatPlainNumber(percentTotal)}%。`
    };
  }
  return { payments, splitAllocations };
}

function parseNumericInput(value?: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function resolveRemainingAllocation(total: number, personIds: string[], values: Record<string, string>) {
  const emptyIds = personIds.filter((personId) => isBlank(values[personId]));
  const enteredTotal = personIds.reduce((sum, personId) => {
    if (isBlank(values[personId])) {
      return sum;
    }
    return sum + parseNumericInput(values[personId]);
  }, 0);
  const autoFillPersonId = emptyIds.length === 1 ? emptyIds[0] : null;

  return personIds.map((personId) => ({
    personId,
    amount: personId === autoFillPersonId ? Math.max(roundInputTotal(total - enteredTotal), 0) : parseNumericInput(values[personId])
  }));
}

function getAutoFilledValue(total: number, personIds: string[], values: Record<string, string>, personId: string) {
  if (!isBlank(values[personId])) {
    return "";
  }

  const emptyIds = personIds.filter((id) => isBlank(values[id]));
  if (emptyIds.length !== 1 || emptyIds[0] !== personId || total <= 0) {
    return "";
  }

  const enteredTotal = personIds.reduce((sum, id) => {
    if (id === personId || isBlank(values[id])) {
      return sum;
    }
    return sum + parseNumericInput(values[id]);
  }, 0);
  const remaining = Math.max(roundInputTotal(total - enteredTotal), 0);
  return remaining > 0 ? String(remaining) : "";
}

function isBlank(value?: string) {
  return value === undefined || value.trim() === "";
}

function roundInputTotal(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatPlainNumber(value: number) {
  return new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 2 }).format(roundInputTotal(value));
}
