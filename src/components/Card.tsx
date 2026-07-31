import { PropsWithChildren } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { palette } from "@/theme/palette";

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    gap: 12
  }
});
