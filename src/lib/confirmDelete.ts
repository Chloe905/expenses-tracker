import { Alert, Platform } from "react-native";

export function confirmDeleteTransaction(onConfirm: () => void) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    if (window.confirm("確定要刪除這筆交易嗎？")) {
      onConfirm();
    }
    return;
  }

  Alert.alert("刪除交易", "確定要刪除這筆交易嗎？", [
    { text: "取消", style: "cancel" },
    { text: "刪除", style: "destructive", onPress: onConfirm }
  ]);
}
