import { PropsWithChildren } from "react";
import { StyleSheet, Text as RNText, TextProps as RNTextProps } from "react-native";

import { palette } from "@/theme/palette";

type TextProps = PropsWithChildren<RNTextProps & { variant?: "title" | "section" | "body" | "muted" | "amount" }>;

export function Text({ children, variant = "body", style, ...props }: TextProps) {
  return (
    <RNText {...props} style={[styles.base, styles[variant], style]}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    color: palette.text,
    letterSpacing: 0
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800"
  },
  section: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800"
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "500"
  },
  muted: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.mutedText
  },
  amount: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800"
  }
});
