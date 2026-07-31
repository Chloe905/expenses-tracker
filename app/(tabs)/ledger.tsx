import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Text } from "@/components/Text";
import { TransactionRow } from "@/components/TransactionRow";
import { useLedgerStore } from "@/store/ledgerStore";
import { palette } from "@/theme/palette";
import { TransactionType } from "@/types/ledger";

export default function LedgerScreen() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TransactionType | "all">("all");
  const transactions = useLedgerStore((state) => state.transactions);
  const categories = useLedgerStore((state) => state.categories);
  const people = useLedgerStore((state) => state.people);
  const duplicateTransaction = useLedgerStore((state) => state.duplicateTransaction);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const category = categories.find((item) => item.id === transaction.categoryId);
      const matchesType = type === "all" || transaction.type === type;
      const text = `${transaction.note} ${transaction.tags.join(" ")} ${category?.name ?? ""}`.toLowerCase();
      return matchesType && text.includes(query.toLowerCase());
    });
  }, [categories, query, transactions, type]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="title">記帳列表</Text>
        <Link href="/transaction/new" asChild>
          <Pressable accessibilityRole="button" accessibilityLabel="新增記帳" style={styles.addButton}>
            <Ionicons name="add" size={22} color={palette.surface} />
          </Pressable>
        </Link>
      </View>

      <Card>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={palette.mutedText} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="搜尋分類、備註或標籤"
            placeholderTextColor={palette.mutedText}
            style={styles.input}
          />
        </View>
        <SegmentedControl
          value={type}
          onChange={setType}
          options={[
            { label: "全部", value: "all" },
            { label: "支出", value: "expense" },
            { label: "收入", value: "income" },
            { label: "轉帳", value: "transfer" }
          ]}
        />
      </Card>

      <Card>
        {filteredTransactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            category={categories.find((item) => item.id === transaction.categoryId)}
            payer={people.find((item) => item.id === transaction.payerId)}
            onDuplicate={() => duplicateTransaction(transaction.id)}
          />
        ))}
        {!filteredTransactions.length ? <Text variant="muted">沒有符合條件的交易。</Text> : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primary
  },
  search: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: palette.surface
  },
  input: {
    flex: 1,
    color: palette.text,
    fontSize: 15,
    outlineStyle: "none"
  } as object
});
