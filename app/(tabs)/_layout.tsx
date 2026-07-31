import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { palette } from "@/theme/palette";

type TabIcon = keyof typeof Ionicons.glyphMap;

function icon(name: TabIcon) {
  return ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={name} color={color} size={size} />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerShadowVisible: false,
        headerTitleStyle: { color: palette.text, fontWeight: "800" },
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.mutedText,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8
        }
      }}
    >
      <Tabs.Screen name="index" options={{ title: "總覽", tabBarIcon: icon("home-outline") }} />
      <Tabs.Screen name="ledger" options={{ title: "記帳", tabBarIcon: icon("list-outline") }} />
      <Tabs.Screen name="stats" options={{ title: "統計", tabBarIcon: icon("bar-chart-outline") }} />
      <Tabs.Screen name="splits" options={{ title: "分帳", tabBarIcon: icon("people-outline") }} />
      <Tabs.Screen name="settings" options={{ title: "設定", tabBarIcon: icon("settings-outline") }} />
    </Tabs>
  );
}
