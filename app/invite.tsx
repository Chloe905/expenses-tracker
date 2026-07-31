import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useLedgerStore } from "@/store/ledgerStore";
import { palette } from "@/theme/palette";

export default function InviteScreen() {
  const router = useRouter();
  const { bookName } = useLocalSearchParams<{ bookId?: string; bookName?: string }>();
  const addPerson = useLedgerStore((state) => state.addPerson);
  const people = useLedgerStore((state) => state.people);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const decodedBookName = typeof bookName === "string" && bookName.trim() ? bookName : "日常帳本";

  return (
    <Screen>
      <Card>
        <View style={styles.headerIcon}>
          <Ionicons name="people-outline" size={28} color={palette.surface} />
        </View>
        <Text variant="title">加入分帳群組</Text>
        <Text variant="muted">你正在加入「{decodedBookName}」。輸入名字後會加入這個帳本的分帳人清單。</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="你的名字"
          placeholderTextColor={palette.mutedText}
          style={styles.input}
        />
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <PrimaryButton
          label="加入群組"
          icon="person-add-outline"
          onPress={() => {
            const trimmedName = name.trim();
            if (!trimmedName) {
              setMessage("請先輸入名字。");
              return;
            }
            if (people.some((person) => person.name === trimmedName)) {
              setMessage("這個名字已經在分帳人清單裡。");
              return;
            }
            addPerson(trimmedName);
            router.replace("/(tabs)/settings");
          }}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primary
  },
  input: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 12,
    color: palette.text,
    backgroundColor: palette.surface,
    outlineStyle: "none"
  } as object,
  message: {
    color: palette.expense,
    fontWeight: "800"
  }
});
