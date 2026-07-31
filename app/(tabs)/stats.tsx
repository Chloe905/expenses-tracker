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
  const totalExpenseByCategory = categoryTotals.reduce((sum, item) => sum + item.amount, 0);

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
        {categoryTotals.length ? (
          <View style={styles.pieSection}>
            <View style={[styles.pieChart, { backgroundImage: getPieGradient(categoryTotals) } as object]}>
              <View style={styles.pieCenter}>
                <Text style={styles.pieTotal}>{formatMoney(totalExpenseByCategory)}</Text>
                <Text variant="muted">總支出</Text>
              </View>
            </View>
            <View style={styles.pieLegend}>
              {categoryTotals.map(({ category, amount }) => (
                <View key={category.id} style={styles.legendRow}>
                  <View style={[styles.dot, { backgroundColor: category.color }]} />
                  <Text style={styles.legendName} numberOfLines={1}>{category.name}</Text>
                  <Text style={styles.legendPercent}>{formatPercent(amount, totalExpenseByCategory)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Text variant="muted">目前沒有支出分類資料。</Text>
        )}
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
  pieSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap"
  },
  pieChart: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surfaceAlt
  },
  pieCenter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surface
  },
  pieTotal: {
    fontWeight: "900"
  },
  pieLegend: {
    flex: 1,
    minWidth: 180,
    gap: 8
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  legendName: {
    flex: 1,
    minWidth: 0,
    fontWeight: "800"
  },
  legendPercent: {
    fontWeight: "900",
    color: palette.mutedText
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

function getPieGradient(items: { category: { color: string }; amount: number }[]) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  if (total <= 0) {
    return `conic-gradient(${palette.surfaceAlt} 0deg 360deg)`;
  }

  let cursor = 0;
  const stops = items.map((item) => {
    const start = cursor;
    const size = (item.amount / total) * 360;
    cursor += size;
    return `${item.category.color} ${start.toFixed(2)}deg ${cursor.toFixed(2)}deg`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

function formatPercent(amount: number, total: number) {
  if (total <= 0) {
    return "0%";
  }
  return `${Math.round((amount / total) * 100)}%`;
}
