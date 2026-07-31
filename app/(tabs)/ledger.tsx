import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { Card } from "@/components/Card";
import { DeleteTransactionModal } from "@/components/DeleteTransactionModal";
import { Screen } from "@/components/Screen";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Text } from "@/components/Text";
import { TransactionRow } from "@/components/TransactionRow";
import { formatMoney } from "@/lib/money";
import { useLedgerStore } from "@/store/ledgerStore";
import { palette } from "@/theme/palette";
import { DebtSettlement, Transaction, TransactionType } from "@/types/ledger";

export default function LedgerScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TransactionType | "all">("all");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const transactions = useLedgerStore((state) => state.transactions);
  const debtSettlements = useLedgerStore((state) => state.debtSettlements);
  const categories = useLedgerStore((state) => state.categories);
  const people = useLedgerStore((state) => state.people);
  const deleteTransaction = useLedgerStore((state) => state.deleteTransaction);

  const ledgerItems = useMemo(() => {
    const transactionItems: LedgerItem[] = transactions.filter((transaction) => {
      const category = categories.find((item) => item.id === transaction.categoryId);
      const matchesType = type === "all" || transaction.type === type;
      const text = `${transaction.note} ${transaction.tags.join(" ")} ${category?.name ?? ""}`.toLowerCase();
      return matchesType && text.includes(query.toLowerCase());
    }).map((transaction) => ({
      kind: "transaction",
      id: transaction.id,
      date: transaction.createdAt,
      transaction
    }));

    const settlementItems: LedgerItem[] = type === "all" ? debtSettlements.filter((settlement) => {
      const fromName = getPersonName(people, settlement.fromPersonId);
      const toName = getPersonName(people, settlement.toPersonId);
      const text = `${fromName} ${toName} 已結清 債務結清`.toLowerCase();
      return text.includes(query.toLowerCase());
    }).map((settlement) => ({
      kind: "settlement",
      id: settlement.id,
      date: settlement.settledAt,
      settlement
    })) : [];

    return [...transactionItems, ...settlementItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [categories, debtSettlements, people, query, transactions, type]);

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
        {ledgerItems.map((item) => (
          item.kind === "transaction" ? (
            <TransactionRow
              key={item.id}
              transaction={item.transaction}
              category={categories.find((category) => category.id === item.transaction.categoryId)}
              payer={people.find((person) => person.id === item.transaction.payerId)}
              onOpen={() => router.push(`/transaction/${item.transaction.id}`)}
              onEdit={() => router.push(`/transaction/new?editId=${item.transaction.id}`)}
              onDelete={() => setPendingDeleteId(item.transaction.id)}
            />
          ) : (
            <SettlementLedgerRow
              key={item.id}
              settlement={item.settlement}
              fromName={getPersonName(people, item.settlement.fromPersonId)}
              toName={getPersonName(people, item.settlement.toPersonId)}
            />
          )
        ))}
        {!ledgerItems.length ? <Text variant="muted">沒有符合條件的交易。</Text> : null}
      </Card>
      <DeleteTransactionModal
        visible={pendingDeleteId !== null}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) {
            deleteTransaction(pendingDeleteId);
          }
          setPendingDeleteId(null);
        }}
      />
    </Screen>
  );
}

type LedgerItem =
  | { kind: "transaction"; id: string; date: string; transaction: Transaction }
  | { kind: "settlement"; id: string; date: string; settlement: DebtSettlement };

function SettlementLedgerRow({ settlement, fromName, toName }: { settlement: DebtSettlement; fromName: string; toName: string }) {
  return (
    <View style={styles.settlementRow}>
      <View style={styles.settlementIcon}>
        <Ionicons name="checkmark-done-outline" size={18} color={palette.surface} />
      </View>
      <View style={styles.settlementCopy}>
        <Text style={styles.settlementTitle}>{fromName} 付給 {toName}</Text>
        <Text variant="muted" numberOfLines={1}>已結清 · {formatDate(settlement.settledAt)}</Text>
      </View>
      <Text style={styles.settlementAmount}>{formatMoney(settlement.amount)}</Text>
    </View>
  );
}

function getPersonName(people: { id: string; name: string }[], personId: string) {
  return people.find((person) => person.id === personId)?.name ?? "未知";
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("zh-TW", { month: "2-digit", day: "2-digit" }).format(new Date(date));
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
  } as object,
  settlementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10
  },
  settlementIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.income
  },
  settlementCopy: {
    flex: 1,
    minWidth: 0
  },
  settlementTitle: {
    fontWeight: "800"
  },
  settlementAmount: {
    color: palette.income,
    fontWeight: "900"
  }
});
