import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { TransactionRow } from "@/components/TransactionRow";
import { formatMoney } from "@/lib/money";
import { getMonthlySummary } from "@/lib/stats";
import { useLedgerStore } from "@/store/ledgerStore";
import { palette } from "@/theme/palette";

export default function OverviewScreen() {
  const router = useRouter();
  const transactions = useLedgerStore((state) => state.transactions);
  const categories = useLedgerStore((state) => state.categories);
  const people = useLedgerStore((state) => state.people);
  const deleteTransaction = useLedgerStore((state) => state.deleteTransaction);
  const summary = getMonthlySummary(transactions);
  const today = new Date().toDateString();
  const todayTransactions = transactions.filter((item) => new Date(item.date).toDateString() === today).slice(0, 5);

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text variant="muted">莫蘭迪記帳</Text>
          <Text variant="title">本月總覽</Text>
        </View>
        <Link href="/transaction/new" asChild>
          <Pressable accessibilityRole="button" accessibilityLabel="新增記帳" style={styles.addButton}>
            <Ionicons name="add" size={24} color={palette.surface} />
          </Pressable>
        </Link>
      </View>

      <Card style={styles.summaryCard}>
        <Text variant="muted">本月結餘</Text>
        <Text variant="amount">{formatMoney(summary.income - summary.expense)}</Text>
        <View style={styles.summaryGrid}>
          <View>
            <Text variant="muted">收入</Text>
            <Text style={styles.income}>{formatMoney(summary.income)}</Text>
          </View>
          <View>
            <Text variant="muted">支出</Text>
            <Text style={styles.expense}>{formatMoney(summary.expense)}</Text>
          </View>
          <View>
            <Text variant="muted">轉帳</Text>
            <Text style={styles.transfer}>{formatMoney(summary.transfer)}</Text>
          </View>
        </View>
      </Card>

      <Card>
        <View style={styles.sectionHeader}>
          <Text variant="section">今日交易</Text>
          <Link href="/(tabs)/ledger" asChild>
            <Pressable accessibilityRole="button">
              <Text variant="muted">查看全部</Text>
            </Pressable>
          </Link>
        </View>
        {todayTransactions.length ? todayTransactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            category={categories.find((item) => item.id === transaction.categoryId)}
            payer={people.find((item) => item.id === transaction.payerId)}
            onOpen={() => router.push(`/transaction/${transaction.id}`)}
            onEdit={() => router.push(`/transaction/new?editId=${transaction.id}`)}
            onDelete={() => {
              Alert.alert("刪除交易", "確定要刪除這筆交易嗎？", [
                { text: "取消", style: "cancel" },
                { text: "刪除", style: "destructive", onPress: () => deleteTransaction(transaction.id) }
              ]);
            }}
          />
        )) : <Text variant="muted">今天還沒有交易，點右上角快速新增。</Text>}
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
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  summaryCard: {
    backgroundColor: "#EDE7DE"
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  income: {
    color: palette.income,
    fontWeight: "900"
  },
  expense: {
    color: palette.expense,
    fontWeight: "900"
  },
  transfer: {
    color: palette.transfer,
    fontWeight: "900"
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});
