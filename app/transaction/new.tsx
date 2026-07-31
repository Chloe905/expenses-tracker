import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
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
  splitMode: z.enum(["equal", "amount", "percent"]),
  participantIds: z.array(z.string()).min(1)
});

type FormValues = z.infer<typeof schema>;

export default function NewTransactionScreen() {
  const router = useRouter();
  const categories = useLedgerStore((state) => state.categories);
  const people = useLedgerStore((state) => state.people);
  const currencies = useLedgerStore((state) => state.currencies);
  const addTransaction = useLedgerStore((state) => state.addTransaction);

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
      splitMode: "equal",
      participantIds: ["person-me"]
    }
  });

  const selectedType = form.watch("type");
  const participantIds = form.watch("participantIds");
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
          {people.map((person) => (
            <Controller
              key={person.id}
              control={form.control}
              name="payerId"
              render={({ field }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => field.onChange(person.id)}
                  style={[styles.chip, field.value === person.id && styles.selectedChip]}
                >
                  <Text style={field.value === person.id && styles.selectedChipText}>{person.name}</Text>
                </Pressable>
              )}
            />
          ))}
        </View>
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
                const selected = participantIds.includes(person.id);
                return (
                  <Pressable
                    key={person.id}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    onPress={() => {
                      const next = selected ? participantIds.filter((id) => id !== person.id) : [...participantIds, person.id];
                      form.setValue("participantIds", next.length ? next : [person.id]);
                    }}
                    style={[styles.chip, selected && styles.selectedChip]}
                  >
                    <Text style={selected && styles.selectedChipText}>{person.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}
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
            addTransaction({
              ...values,
              tags: values.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
              participantIds: values.type === "expense" ? values.participantIds : []
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
  }
});
