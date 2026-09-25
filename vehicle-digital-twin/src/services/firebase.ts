import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  onValue,
  off,
  DataSnapshot,
  Database,
} from 'firebase/database';
import { FirebaseConfig, FirebaseZonesDictionary } from '../types/firebase';

const STORAGE_KEY = 'svsr_vehicle_firebase_config';

/**
 * Retrieves Firebase configuration from Vite environment variables (VITE_FIREBASE_*)
 * with fallback to user-supplied runtime configuration stored in localStorage.
 */
export function getFirebaseConfig(): FirebaseConfig | null {
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const envDbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const envStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  const envSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const envAppId = import.meta.env.VITE_FIREBASE_APP_ID;

  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      authDomain: envAuthDomain || `${envProjectId}.firebaseapp.com`,
      databaseURL:
        envDbUrl || `https://${envProjectId}-default-rtdb.firebaseio.com`,
      projectId: envProjectId,
      storageBucket:
        envStorageBucket || `${envProjectId}.firebasestorage.app`,
      messagingSenderId: envSenderId || '',
      appId: envAppId || '',
    };
  }

  // Fallback to locally saved configuration
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.apiKey && parsed.projectId) {
          return parsed as FirebaseConfig;
        }
      }
    } catch {
      // Ignore storage error
    }
  }

  return null;
}

export function saveRuntimeFirebaseConfig(config: FirebaseConfig) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
}

export function clearRuntimeFirebaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Database | null = null;

export function getFirebaseInstances(): {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Database | null;
} {
  const config = getFirebaseConfig();
  if (!config) {
    return { app: null, auth: null, db: null };
  }

  if (!firebaseApp) {
    if (!getApps().length) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }
  }

  if (!firebaseAuth && firebaseApp) {
    firebaseAuth = getAuth(firebaseApp);
  }

  if (!firebaseDb && firebaseApp) {
    firebaseDb = getDatabase(firebaseApp);
  }

  return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb };
}

/**
 * Re-initializes Firebase with a newly provided configuration
 */
export function reinitializeFirebase(config: FirebaseConfig): {
  auth: Auth;
  db: Database;
} {
  saveRuntimeFirebaseConfig(config);
  if (getApps().length) {
    // If apps exist, we initialize with a new name or re-obtain
    firebaseApp = initializeApp(config, 'svsr-runtime-' + Date.now());
  } else {
    firebaseApp = initializeApp(config);
  }
  firebaseAuth = getAuth(firebaseApp);
  firebaseDb = getDatabase(firebaseApp);
  return { auth: firebaseAuth, db: firebaseDb };
}

/**
 * Signs in using Firebase Email & Password
 */
export async function loginWithEmailAndPassword(
  email: string,
  pass: string
): Promise<User> {
  const { auth } = getFirebaseInstances();
  if (!auth) {
    throw new Error(
      'Firebase Authentication is not configured. Please supply Firebase Web App configuration.'
    );
  }
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
}

/**
 * Signs out current Firebase user
 */
export async function logoutVehicleUser(): Promise<void> {
  const { auth } = getFirebaseInstances();
  if (auth) {
    await signOut(auth);
  }
}

/**
 * Observes Firebase Auth state changes
 */
export function subscribeToAuthState(
  callback: (user: User | null) => void
): () => void {
  const { auth } = getFirebaseInstances();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Realtime subscription to /zones in Firebase Realtime Database
 * IMPORTANT: Strictly READ ONLY. Does not perform any write operation.
 */
export function subscribeToZones(
  onData: (zones: FirebaseZonesDictionary | null) => void,
  onError: (error: Error) => void
): () => void {
  const { db } = getFirebaseInstances();
  if (!db) {
    onError(new Error('Firebase Realtime Database is not initialized.'));
    return () => {};
  }

  const zonesRef = ref(db, 'zones');

  const unsubscribe = onValue(
    zonesRef,
    (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val() as FirebaseZonesDictionary;
        onData(val);
      } else {
        onData(null);
      }
    },
    (err) => {
      onError(err);
    }
  );

  return () => {
    off(zonesRef);
  };
}
