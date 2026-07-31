import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  User,
  getAuth,
  onAuthStateChanged,
  signInAnonymously
} from "firebase/auth";
import { Firestore, doc, getDoc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";

import { getFirebaseConfig } from "@/config/firebaseConfig";
import { LedgerSnapshot } from "@/types/ledger";

type FirebaseLedgerClient = {
  auth: Auth;
  db: Firestore;
};

let client: FirebaseLedgerClient | null | undefined;

export function isFirebaseConfigured() {
  return getFirebaseConfig() !== null;
}

export async function loadCloudSnapshot(): Promise<LedgerSnapshot | null> {
  const readyClient = getFirebaseClient();
  if (!readyClient) {
    return null;
  }

  const user = await ensureAnonymousUser(readyClient.auth);
  const snapshot = await getDoc(getSnapshotRef(readyClient.db, user.uid));

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data().payload as LedgerSnapshot;
}

export async function saveCloudSnapshot(snapshot: LedgerSnapshot): Promise<void> {
  const readyClient = getFirebaseClient();
  if (!readyClient) {
    return;
  }

  const user = await ensureAnonymousUser(readyClient.auth);
  await setDoc(getSnapshotRef(readyClient.db, user.uid), {
    payload: snapshot,
    updatedAt: serverTimestamp()
  });
}

function getFirebaseClient(): FirebaseLedgerClient | null {
  if (client !== undefined) {
    return client;
  }

  const config = getFirebaseConfig();
  if (!config) {
    client = null;
    return client;
  }

  const app = getApps().length ? getApp() : initializeApp(config);
  client = {
    auth: getLedgerAuth(app),
    db: getFirestore(app)
  };
  return client;
}

function getLedgerAuth(app: FirebaseApp) {
  return getAuth(app);
}

async function ensureAnonymousUser(auth: Auth): Promise<User> {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  const existingUser = await new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });

  if (existingUser) {
    return existingUser;
  }

  const credential = await signInAnonymously(auth);
  return credential.user;
}

function getSnapshotRef(db: Firestore, uid: string) {
  return doc(db, "users", uid, "ledgerSnapshots", "default");
}
