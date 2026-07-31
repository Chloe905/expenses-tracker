import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { Text } from "@/components/Text";
import { palette } from "@/theme/palette";

type DeleteTransactionModalProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteTransactionModal({ visible, onCancel, onConfirm }: DeleteTransactionModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable accessibilityRole="button" accessibilityLabel="取消刪除" onPress={onCancel} style={styles.backdrop}>
        <View onStartShouldSetResponder={() => true} style={styles.dialog}>
          <View style={styles.icon}>
            <Ionicons name="trash-outline" size={24} color={palette.expense} />
          </View>
          <Text style={styles.title}>刪除交易</Text>
          <Text variant="muted" style={styles.message}>確定要刪除這筆交易嗎？刪除後無法復原。</Text>
          <View style={styles.actions}>
            <PrimaryButton label="取消" variant="secondary" onPress={onCancel} />
            <PrimaryButton label="確認刪除" icon="trash-outline" variant="danger" onPress={onConfirm} />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(62, 58, 54, 0.38)"
  },
  dialog: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 20,
    gap: 12,
    backgroundColor: palette.surface
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3E1DE"
  },
  title: {
    fontSize: 22,
    fontWeight: "900"
  },
  message: {
    lineHeight: 22
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8
  }
});
