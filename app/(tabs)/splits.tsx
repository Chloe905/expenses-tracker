import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { formatMoney } from "@/lib/money";
import { summarizeSettlements } from "@/lib/splits";
import { useLedgerStore } from "@/store/ledgerStore";
import { palette } from "@/theme/palette";

export default function SplitsScreen() {
  const transactions = useLedgerStore((state) => state.transactions);
  const debtSettlements = useLedgerStore((state) => state.debtSettlements);
  const settleDebt = useLedgerStore((state) => state.settleDebt);
  const people = useLedgerStore((state) => state.people);
  const settlements = summarizeSettlements(transactions, debtSettlements);
  const [pendingSettlement, setPendingSettlement] = useState<SettlementItem | null>(null);

  const personName = (personId: string) => people.find((person) => person.id === personId)?.name ?? "未知";

  return (
    <Screen>
      <Text variant="title">分帳結算</Text>
      <Card>
        <Text variant="section">債務關係列表</Text>
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
              <Text variant="muted">目前累計未結清債務</Text>
            </View>
            <View style={styles.actionGroup}>
              <Text style={styles.amount}>{formatMoney(settlement.amount)}</Text>
              <PrimaryButton
                label="債務結清"
                icon="checkmark-circle-outline"
                variant="secondary"
                onPress={() => setPendingSettlement(settlement)}
              />
            </View>
          </View>
        ))}
        {!settlements.length ? <Text variant="muted">目前沒有未結清的分帳。</Text> : null}
      </Card>
      <SettleDebtModal
        settlement={pendingSettlement}
        fromName={pendingSettlement ? personName(pendingSettlement.fromPersonId) : ""}
        toName={pendingSettlement ? personName(pendingSettlement.toPersonId) : ""}
        onCancel={() => setPendingSettlement(null)}
        onConfirm={() => {
          if (pendingSettlement) {
            settleDebt(pendingSettlement);
          }
          setPendingSettlement(null);
        }}
      />
    </Screen>
  );
}

type SettlementItem = {
  fromPersonId: string;
  toPersonId: string;
  amount: number;
};

function SettleDebtModal({
  settlement,
  fromName,
  toName,
  onCancel,
  onConfirm
}: {
  settlement: SettlementItem | null;
  fromName: string;
  toName: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={settlement !== null} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable accessibilityRole="button" accessibilityLabel="取消債務結清" onPress={onCancel} style={styles.backdrop}>
        <View onStartShouldSetResponder={() => true} style={styles.dialog}>
          <Text style={styles.dialogTitle}>債務結清</Text>
          <Text variant="muted" style={styles.dialogMessage}>
            確認 {fromName} 已付給 {toName} {settlement ? formatMoney(settlement.amount) : ""}？確認後會把截至目前為止的這段債務列為已結清，並重新計算剩餘債務。
          </Text>
          <View style={styles.dialogActions}>
            <PrimaryButton label="取消" variant="secondary" onPress={onCancel} />
            <PrimaryButton label="確認結清" icon="checkmark-circle-outline" onPress={onConfirm} />
          </View>
        </View>
      </Pressable>
    </Modal>
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
  },
  actionGroup: {
    alignItems: "flex-end",
    gap: 6
  },
  backdrop: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(62, 58, 54, 0.38)"
  },
  dialog: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 20,
    gap: 12,
    backgroundColor: palette.surface
  },
  dialogTitle: {
    fontSize: 22,
    fontWeight: "900"
  },
  dialogMessage: {
    lineHeight: 22
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8
  }
});
