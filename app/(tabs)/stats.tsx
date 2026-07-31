import { StyleSheet, View } from "react-native";

import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { formatMoney } from "@/lib/money";
import { getCategoryTotals, getMonthlySummary } from "@/lib/stats";
import { useLedgerStore } from "@/store/ledgerStore";
import { palette } from "@/theme/palette";

export default function StatsScreen() {
  const transactions = useLedgerStore((state) => state.transactions);
  const categories = useLedgerStore((state) => state.categories);
  const summary = getMonthlySummary(transactions);
  const categoryTotals = getCategoryTotals(transactions, categories);
  const maxAmount = Math.max(...categoryTotals.map((item) => item.amount), 1);

  return (
    <Screen>
      <Text variant="title">統計</Text>
      <Card>
        <Text variant="section">本月收支</Text>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text variant="muted">收入</Text>
            <Text style={styles.income}>{formatMoney(summary.income)}</Text>
          </View>
          <View style={styles.metric}>
            <Text variant="muted">支出</Text>
            <Text style={styles.expense}>{formatMoney(summary.expense)}</Text>
          </View>
          <View style={styles.metric}>
            <Text variant="muted">結餘</Text>
            <Text style={styles.balance}>{formatMoney(summary.income - summary.expense)}</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text variant="section">分類占比</Text>
        {categoryTotals.map(({ category, amount }) => (
          <View key={category.id} style={styles.barRow}>
            <View style={styles.barLabel}>
              <View style={[styles.dot, { backgroundColor: category.color }]} />
              <Text>{category.name}</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.bar, { width: `${Math.max((amount / maxAmount) * 100, 8)}%`, backgroundColor: category.color }]} />
            </View>
            <Text variant="muted">{formatMoney(amount)}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap"
  },
  metric: {
    flexGrow: 1,
    flexBasis: 120,
    padding: 12,
    borderRadius: 8,
    backgroundColor: palette.background
  },
  income: {
    color: palette.income,
    fontWeight: "900"
  },
  expense: {
    color: palette.expense,
    fontWeight: "900"
  },
  balance: {
    color: palette.text,
    fontWeight: "900"
  },
  barRow: {
    gap: 8,
    paddingVertical: 6
  },
  barLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  barTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.surfaceAlt,
    overflow: "hidden"
  },
  bar: {
    height: 10,
    borderRadius: 5
  }
});
