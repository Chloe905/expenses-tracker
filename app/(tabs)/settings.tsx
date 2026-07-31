import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";

import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { formatMoney } from "@/lib/money";
import { useLedgerStore } from "@/store/ledgerStore";
import { palette } from "@/theme/palette";

export default function SettingsScreen() {
  const people = useLedgerStore((state) => state.people);
  const categories = useLedgerStore((state) => state.categories);
  const currencies = useLedgerStore((state) => state.currencies);
  const addPerson = useLedgerStore((state) => state.addPerson);
  const deletePerson = useLedgerStore((state) => state.deletePerson);
  const addCategory = useLedgerStore((state) => state.addCategory);
  const deleteCategory = useLedgerStore((state) => state.deleteCategory);
  const addCurrency = useLedgerStore((state) => state.addCurrency);
  const updateCurrencyRate = useLedgerStore((state) => state.updateCurrencyRate);
  const exportSnapshot = useLedgerStore((state) => state.exportSnapshot);
  const importSnapshot = useLedgerStore((state) => state.importSnapshot);
  const cloudEnabled = useLedgerStore((state) => state.cloudEnabled);
  const syncStatus = useLedgerStore((state) => state.syncStatus);
  const [personName, setPersonName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("receipt");
  const [categoryColor, setCategoryColor] = useState("#C9A6A0");
  const [currencyCode, setCurrencyCode] = useState("");
  const [currencyName, setCurrencyName] = useState("");
  const [currencyRate, setCurrencyRate] = useState("");
  const [importText, setImportText] = useState("");
  const expenseCategories = categories.filter((category) => category.type === "expense");

  const showMessage = (message: string) => {
    if (Platform.OS === "web") {
      window.alert(message);
    } else {
      Alert.alert("莫蘭迪記帳", message);
    }
  };

  return (
    <Screen>
      <Text variant="title">設定</Text>
      <Card>
        <Text variant="section">雲端同步</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: cloudEnabled ? palette.income : palette.secondary }]} />
          <View style={styles.statusCopy}>
            <Text>{cloudEnabled ? "Firebase 已啟用" : "目前使用本機資料"}</Text>
            <Text variant="muted">
              {cloudEnabled ? getSyncStatusLabel(syncStatus) : "設定 Firebase 環境變數後會自動切換到 Firestore。"}
            </Text>
          </View>
        </View>
      </Card>
      <Card>
        <Text variant="section">分帳人</Text>
        <View style={styles.people}>
          {people.map((person) => (
            <View key={person.id} style={styles.person}>
              <View style={[styles.avatar, { backgroundColor: person.avatarColor }]}>
                <Text style={styles.avatarText}>{person.name.slice(0, 1)}</Text>
              </View>
              <Text>{person.name}</Text>
              {person.id !== "person-me" ? (
                <Pressable accessibilityRole="button" accessibilityLabel={`刪除${person.name}`} onPress={() => deletePerson(person.id)} style={styles.smallIconButton}>
                  <Ionicons name="close" size={16} color={palette.expense} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
        <View style={styles.inlineForm}>
          <TextInput
            value={personName}
            onChangeText={setPersonName}
            placeholder="新增分帳人"
            placeholderTextColor={palette.mutedText}
            style={styles.input}
          />
          <PrimaryButton
            label="加入"
            icon="person-add-outline"
            onPress={() => {
              if (!personName.trim()) {
                return;
              }
              addPerson(personName.trim());
              setPersonName("");
            }}
          />
        </View>
      </Card>

      <Card>
        <Text variant="section">支出分類</Text>
        <View style={styles.categoryGrid}>
          {expenseCategories.map((category) => (
            <View key={category.id} style={styles.categoryItem}>
              <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                <Ionicons name={category.icon as keyof typeof Ionicons.glyphMap} size={16} color={palette.surface} />
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
              {expenseCategories.length > 1 ? (
                <Pressable accessibilityRole="button" accessibilityLabel={`刪除${category.name}`} onPress={() => deleteCategory(category.id)} style={styles.smallIconButton}>
                  <Ionicons name="trash-outline" size={16} color={palette.expense} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
        <View style={styles.swatches}>
          {categoryColors.map((color) => (
            <Pressable
              key={color}
              accessibilityRole="button"
              accessibilityLabel={`選擇分類顏色 ${color}`}
              onPress={() => setCategoryColor(color)}
              style={[styles.swatch, { backgroundColor: color }, categoryColor === color && styles.selectedSwatch]}
            />
          ))}
        </View>
        <View style={styles.iconChoices}>
          {categoryIcons.map((icon) => (
            <Pressable
              key={icon}
              accessibilityRole="button"
              accessibilityLabel={`選擇分類圖示 ${icon}`}
              onPress={() => setCategoryIcon(icon)}
              style={[styles.iconChoice, categoryIcon === icon && styles.selectedIconChoice]}
            >
              <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={categoryIcon === icon ? palette.surface : palette.text} />
            </Pressable>
          ))}
        </View>
        <View style={styles.inlineForm}>
          <TextInput
            value={categoryName}
            onChangeText={setCategoryName}
            placeholder="新增支出分類"
            placeholderTextColor={palette.mutedText}
            style={styles.input}
          />
          <PrimaryButton
            label="加入"
            icon="add-circle-outline"
            onPress={() => {
              if (!categoryName.trim()) {
                return;
              }
              addCategory({
                name: categoryName.trim(),
                type: "expense",
                icon: categoryIcon,
                color: categoryColor
              });
              setCategoryName("");
            }}
          />
        </View>
      </Card>

      <Card>
        <Text variant="section">幣別匯率</Text>
        {currencies.map((currency) => (
          <View key={currency.code} style={styles.currencyRow}>
            <View>
              <Text>{currency.code} · {currency.name}</Text>
              <Text variant="muted">換算範例：{formatMoney(currency.rateToBase)}</Text>
            </View>
            <TextInput
              editable={!currency.isBase}
              keyboardType="decimal-pad"
              value={String(currency.rateToBase)}
              onChangeText={(value) => {
                const nextRate = Number(value);
                if (Number.isFinite(nextRate) && nextRate > 0) {
                  updateCurrencyRate(currency.code, nextRate);
                }
              }}
              style={[styles.rateInput, currency.isBase && styles.disabledInput]}
            />
          </View>
        ))}
        <View style={styles.currencyForm}>
          <TextInput
            value={currencyCode}
            onChangeText={(value) => setCurrencyCode(value.toUpperCase())}
            placeholder="代碼，例如 HKD"
            placeholderTextColor={palette.mutedText}
            autoCapitalize="characters"
            maxLength={6}
            style={[styles.input, styles.codeInput]}
          />
          <TextInput
            value={currencyName}
            onChangeText={setCurrencyName}
            placeholder="幣別名稱"
            placeholderTextColor={palette.mutedText}
            style={styles.input}
          />
          <TextInput
            value={currencyRate}
            onChangeText={setCurrencyRate}
            placeholder="匯率"
            placeholderTextColor={palette.mutedText}
            keyboardType="decimal-pad"
            style={[styles.input, styles.rateFormInput]}
          />
          <PrimaryButton
            label="新增幣別"
            icon="add-circle-outline"
            onPress={() => {
              const rateToBase = Number(currencyRate);
              if (!currencyCode.trim() || !Number.isFinite(rateToBase) || rateToBase <= 0) {
                showMessage("請輸入幣別代碼與大於 0 的匯率。");
                return;
              }
              addCurrency({
                code: currencyCode.trim(),
                name: currencyName.trim() || currencyCode.trim().toUpperCase(),
                rateToBase
              });
              setCurrencyCode("");
              setCurrencyName("");
              setCurrencyRate("");
            }}
          />
        </View>
      </Card>

      <Card>
        <Text variant="section">匯出 / 匯入</Text>
        <PrimaryButton
          label="匯出 JSON"
          icon="download-outline"
          variant="secondary"
          onPress={() => {
            const output = JSON.stringify(exportSnapshot(), null, 2);
            setImportText(output);
            showMessage("已產生 JSON，可從下方文字框複製或保存。");
          }}
        />
        <TextInput
          value={importText}
          onChangeText={setImportText}
          multiline
          placeholder="貼上 JSON 後按匯入"
          placeholderTextColor={palette.mutedText}
          style={[styles.input, styles.importBox]}
        />
        <PrimaryButton
          label="匯入 JSON"
          icon="cloud-upload-outline"
          variant="quiet"
          onPress={() => {
            try {
              importSnapshot(JSON.parse(importText));
              showMessage("匯入完成。");
            } catch {
              showMessage("JSON 格式不正確，請檢查後再試。");
            }
          }}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  statusCopy: {
    flex: 1,
    minWidth: 0
  },
  people: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  person: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: palette.background
  },
  smallIconButton: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surface
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: palette.surface,
    fontWeight: "900"
  },
  inlineForm: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 12,
    color: palette.text,
    backgroundColor: palette.surface,
    outlineStyle: "none"
  } as object,
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  categoryItem: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: palette.background
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  categoryName: {
    fontWeight: "800"
  },
  swatches: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent"
  },
  selectedSwatch: {
    borderColor: palette.text
  },
  iconChoices: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  iconChoice: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surfaceAlt
  },
  selectedIconChoice: {
    backgroundColor: palette.primary
  },
  currencyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  rateInput: {
    width: 96,
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 10,
    color: palette.text,
    backgroundColor: palette.surface,
    textAlign: "right",
    outlineStyle: "none"
  } as object,
  disabledInput: {
    backgroundColor: palette.surfaceAlt
  },
  currencyForm: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center"
  },
  codeInput: {
    flex: 0,
    width: 150
  } as object,
  rateFormInput: {
    flex: 0,
    width: 110
  } as object,
  importBox: {
    minHeight: 140,
    paddingVertical: 12,
    textAlignVertical: "top"
  }
});

function getSyncStatusLabel(syncStatus: "local" | "syncing" | "synced" | "error") {
  if (syncStatus === "synced") {
    return "已同步到 Firestore。";
  }
  if (syncStatus === "syncing") {
    return "正在同步到 Firestore。";
  }
  if (syncStatus === "error") {
    return "Firebase 同步失敗，已保留本機快取。";
  }
  return "目前使用本機資料。";
}

const categoryColors = ["#C9A6A0", "#8E9AAF", "#BCA88D", "#A48E89", "#B87D73", "#8FA89B", "#9AA77D"];
const categoryIcons = ["receipt", "cart", "cafe", "restaurant", "train", "home", "bag", "heart", "game-controller", "book"];
