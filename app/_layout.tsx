import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useLedgerStore } from "@/store/ledgerStore";
import { palette } from "@/theme/palette";

export default function RootLayout() {
  const hydrate = useLedgerStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: palette.background },
            headerShadowVisible: false,
            headerTitleStyle: { color: palette.text, fontWeight: "700" },
            contentStyle: { backgroundColor: palette.background }
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="transaction/new"
            options={{
              title: "新增記帳",
              presentation: "modal"
            }}
          />
          <Stack.Screen
            name="invite"
            options={{
              title: "加入分帳群組"
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
