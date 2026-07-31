import { StyleSheet, View } from "react-native";

import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { formatMoney } from "@/lib/money";
import { summarizeSettlements } from "@/lib/splits";
import { useLedgerStore } from "@/store/ledgerStore";
import { palette } from "@/theme/palette";

export default function SplitsScreen() {
  const transactions = useLedgerStore((state) => state.transactions);
  const people = useLedgerStore((state) => state.people);
  const settlements = summarizeSettlements(transactions);

  const personName = (personId: string) => people.find((person) => person.id === personId)?.name ?? "未知";

  return (
    <Screen>
      <Text variant="title">分帳結算</Text>
      <Card>
        <Text variant="section">待收付款</Text>
        {settlements.map((settlement) => (
          <View key={`${settlement.fromPersonId}-${settlement.toPersonId}`} style={styles.settlement}>
            <View style={styles.avatarPair}>
              <View style={[styles.avatar, { backgroundColor: people.find((person) => person.id === settlement.fromPersonId)?.avatarColor ?? palette.secondary }]}>
                <Text style={styles.avatarText}>{personName(settlement.fromPersonId).slice(0, 1)}</Text>
              </View>
              <Text>→</Text>
              <View style={[styles.avatar, { backgroundColor: people.find((person) => person.id === settlement.toPersonId)?.avatarColor ?? palette.primary }]}>
                <Text style={styles.avatarText}>{personName(settlement.toPersonId).slice(0, 1)}</Text>
              </View>
            </View>
            <View style={styles.copy}>
              <Text style={styles.names}>{personName(settlement.fromPersonId)} 付給 {personName(settlement.toPersonId)}</Text>
              <Text variant="muted">最簡化結算建議</Text>
            </View>
            <Text style={styles.amount}>{formatMoney(settlement.amount)}</Text>
          </View>
        ))}
        {!settlements.length ? <Text variant="muted">目前沒有未結清的分帳。</Text> : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  settlement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.border
  },
  avatarPair: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: palette.surface,
    fontWeight: "900"
  },
  copy: {
    flex: 1,
    minWidth: 0
  },
  names: {
    fontWeight: "800"
  },
  amount: {
    color: palette.expense,
    fontWeight: "900"
  }
});
