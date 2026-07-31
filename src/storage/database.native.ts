import * as SQLite from "expo-sqlite";

import { LedgerSnapshot } from "@/types/ledger";

const db = SQLite.openDatabaseSync("morandi-ledger.db");

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS ledger_state (
      id TEXT PRIMARY KEY NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

export async function loadSnapshot(): Promise<LedgerSnapshot | null> {
  initDatabase();
  const rows = db.getAllSync<{ payload: string }>("SELECT payload FROM ledger_state WHERE id = ?", ["default"]);
  if (!rows[0]?.payload) {
    return null;
  }
  return JSON.parse(rows[0].payload) as LedgerSnapshot;
}

export async function saveSnapshot(snapshot: LedgerSnapshot): Promise<void> {
  initDatabase();
  db.runSync(
    "INSERT OR REPLACE INTO ledger_state (id, payload, updated_at) VALUES (?, ?, ?)",
    ["default", JSON.stringify(snapshot), new Date().toISOString()]
  );
}
