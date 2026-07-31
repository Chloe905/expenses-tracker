import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { confirmDeleteTransaction } from "@/lib/confirmDelete";
import { formatMoney } from "@/lib/money";
import { useLedgerStore } from "@/store/ledgerStore";
import { palette } from "@/theme/palette";

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const transactions = useLedgerStore((state) => state.transactions);
  const categories = useLedgerStore((state) => state.categories);
  const people = useLedgerStore((state) => state.people);
  const deleteTransaction = useLedgerStore((state) => state.deleteTransaction);
  const transaction = transactions.find((item) => item.id === id);

  if (!transaction) {
    return (
      <Screen>
        <Card>
          <Text variant="section">找不到交易</Text>
          <Text variant="muted">這筆交易可能已被刪除。</Text>
          <PrimaryButton label="返回" icon="arrow-back-outline" onPress={() => router.back()} />
        </Card>
      </Screen>
    );
  }

  const category = categories.find((item) => item.id === transaction.categoryId);
  const payer = people.find((item) => item.id === transaction.payerId);
  const amountColor = transaction.type === "income" ? palette.income : transaction.type === "expense" ? palette.expense : palette.transfer;
  const sign = transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : "";

  const handleDelete = () => {
    confirmDeleteTransaction(() => {
      deleteTransaction(transaction.id);
      router.back();
    });
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="返回" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color={palette.text} />
        </Pressable>
        <Text variant="title">交易詳情</Text>
        <View style={styles.headerActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="編輯交易" onPress={() => router.push(`/transaction/new?editId=${transaction.id}`)} style={styles.iconButton}>
            <Ionicons name="create-outline" size={22} color={palette.text} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="刪除交易" onPress={handleDelete} style={styles.iconButton}>
            <Ionicons name="trash-outline" size={22} color={palette.expense} />
          </Pressable>
        </View>
      </View>

      <Card>
        <View style={styles.summary}>
          <View style={[styles.categoryIcon, { backgroundColor: category?.color ?? palette.surfaceAlt }]}>
            <Ionicons name={(category?.icon ?? "receipt") as keyof typeof Ionicons.glyphMap} size={24} color={palette.surface} />
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.categoryName}>{category?.name ?? "未分類"}</Text>
            <Text variant="muted">{formatDate(transaction.date)} · {payer?.name ?? "未知"} 付款</Text>
          </View>
        </View>
        <Text style={[styles.amount, { color: amountColor }]}>{sign}{formatMoney(transaction.baseAmount)}</Text>
        <Text variant="muted">原幣金額 {formatMoney(transaction.amount, transaction.currencyCode)}</Text>
      </Card>

      <Card>
        <Text variant="section">付款明細</Text>
        {transaction.payments.map((payment) => (
          <DetailRow
            key={payment.id}
            label={`${people.find((person) => person.id === payment.personId)?.name ?? "未知"} 先付`}
            value={formatMoney(payment.amount)}
          />
        ))}
      </Card>

      {transaction.type === "expense" ? (
        <Card>
          <Text variant="section">分帳明細</Text>
          <Text variant="muted">模式：{getSplitModeLabel(transaction.splitMode)}</Text>
          {transaction.splits.map((split) => (
            <DetailRow
              key={split.id}
              label={`${people.find((person) => person.id === split.personId)?.name ?? "未知"} 應分`}
              value={split.percent === undefined ? formatMoney(split.amount) : `${formatMoney(split.amount)} · ${split.percent}%`}
            />
          ))}
        </Card>
      ) : null}

      <Card>
        <Text variant="section">備註與標籤</Text>
        <DetailRow label="備註" value={transaction.note || "沒有備註"} />
        <DetailRow label="標籤" value={transaction.tags.length ? transaction.tags.join(", ") : "沒有標籤"} />
      </Card>
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text variant="muted">{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(date));
}

function getSplitModeLabel(splitMode: string) {
  if (splitMode === "amount") {
    return "指定金額";
  }
  if (splitMode === "percent") {
    return "指定比例";
  }
  return "平均";
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  headerActions: {
    flexDirection: "row",
    gap: 4
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  summaryText: {
    flex: 1,
    minWidth: 0
  },
  categoryName: {
    fontSize: 20,
    fontWeight: "900"
  },
  amount: {
    fontSize: 34,
    fontWeight: "900"
  },
  detailRow: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  detailValue: {
    flex: 1,
    textAlign: "right",
    fontWeight: "800"
  }
});
