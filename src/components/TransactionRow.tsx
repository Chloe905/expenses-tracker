import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/Text";
import { formatMoney } from "@/lib/money";
import { palette } from "@/theme/palette";
import { Category, Person, Transaction } from "@/types/ledger";

type TransactionRowProps = {
  transaction: Transaction;
  category?: Category;
  payer?: Person;
  onDuplicate?: () => void;
};

export function TransactionRow({ transaction, category, payer, onDuplicate }: TransactionRowProps) {
  const amountColor = transaction.type === "income" ? palette.income : transaction.type === "expense" ? palette.expense : palette.transfer;
  const sign = transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : "";

  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: category?.color ?? palette.surfaceAlt }]}>
        <Ionicons name={(category?.icon ?? "receipt") as keyof typeof Ionicons.glyphMap} size={18} color={palette.surface} />
      </View>
      <View style={styles.main}>
        <Text style={styles.name}>{category?.name ?? "未分類"} · {payer?.name ?? "未知"}</Text>
        <Text variant="muted" numberOfLines={1}>{transaction.note || "沒有備註"}</Text>
      </View>
      <View style={styles.amountGroup}>
        <Text style={[styles.amount, { color: amountColor }]}>{sign}{formatMoney(transaction.baseAmount)}</Text>
        {onDuplicate ? (
          <Pressable accessibilityRole="button" accessibilityLabel="複製交易" onPress={onDuplicate} style={styles.copy}>
            <Ionicons name="copy-outline" size={16} color={palette.mutedText} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  main: {
    flex: 1,
    minWidth: 0
  },
  name: {
    fontWeight: "800"
  },
  amountGroup: {
    alignItems: "flex-end",
    gap: 4
  },
  amount: {
    fontWeight: "900"
  },
  copy: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center"
  }
});
