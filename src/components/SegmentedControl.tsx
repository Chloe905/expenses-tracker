import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/Text";
import { palette } from "@/theme/palette";

type Option<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            onPress={() => onChange(option.value)}
            style={[styles.option, selected && styles.selected]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: palette.surfaceAlt,
    padding: 4,
    borderRadius: 8,
    gap: 4
  },
  option: {
    flex: 1,
    minHeight: 36,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center"
  },
  selected: {
    backgroundColor: palette.surface
  },
  label: {
    fontWeight: "800",
    color: palette.mutedText
  },
  selectedLabel: {
    color: palette.text
  }
});
