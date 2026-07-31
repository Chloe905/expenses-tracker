import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

import { Text } from "@/components/Text";
import { palette } from "@/theme/palette";

type PrimaryButtonProps = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: "primary" | "secondary" | "quiet" | "danger";
};

export function PrimaryButton({ label, icon, onPress, variant = "primary" }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, styles[variant], pressed && styles.pressed]}
    >
      {icon ? <Ionicons name={icon} size={18} color={variant === "primary" || variant === "danger" ? palette.surface : palette.text} /> : null}
      <Text style={[styles.label, (variant === "primary" || variant === "danger") && styles.primaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderRadius: 8,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8
  },
  primary: {
    backgroundColor: palette.primary
  },
  secondary: {
    backgroundColor: palette.surfaceAlt
  },
  quiet: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: palette.border
  },
  danger: {
    backgroundColor: palette.expense
  },
  pressed: {
    opacity: 0.78
  },
  label: {
    fontWeight: "800"
  },
  primaryLabel: {
    color: palette.surface
  }
});
