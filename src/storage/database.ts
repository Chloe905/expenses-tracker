import { LedgerSnapshot } from "@/types/ledger";

const STORAGE_KEY = "morandi-ledger-state";
let memorySnapshot: LedgerSnapshot | null = null;

export function initDatabase() {
  return undefined;
}

export async function loadSnapshot(): Promise<LedgerSnapshot | null> {
  const storage = getWebStorage();
  const payload = storage?.getItem(STORAGE_KEY);
  if (!payload) {
    return memorySnapshot;
  }
  try {
    return JSON.parse(payload) as LedgerSnapshot;
  } catch {
    return null;
  }
}

export async function saveSnapshot(snapshot: LedgerSnapshot): Promise<void> {
  memorySnapshot = snapshot;
  getWebStorage()?.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function getWebStorage(): Storage | null {
  if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) {
    return null;
  }
  return globalThis.localStorage;
}
