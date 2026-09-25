/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getDatabase,
  Database,
  ref,
  onValue,
  Unsubscribe,
  DataSnapshot,
} from 'firebase/database';
import { SpeedZone } from '../types';

export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const LOCAL_STORAGE_KEY = 'svsr_vehicle_owner_firebase_config';

/**
 * Retrieves the current Firebase Web App configuration from:
 * 1. Vite environment variables (VITE_FIREBASE_*)
 * 2. Local storage override (if configured via UI)
 */
export function getFirebaseConfig(): FirebaseWebConfig {
  let storedConfig: Partial<FirebaseWebConfig> = {};
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        storedConfig = JSON.parse(saved);
      }
    } catch {
      // Ignore JSON parse error
    }
  }

  const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || ({} as any);

  return {
    apiKey:
      (env.VITE_FIREBASE_API_KEY as string) ||
      storedConfig.apiKey ||
      '',
    authDomain:
      (env.VITE_FIREBASE_AUTH_DOMAIN as string) ||
      storedConfig.authDomain ||
      'smart-virtual-speed-reducer.firebaseapp.com',
    databaseURL:
      (env.VITE_FIREBASE_DATABASE_URL as string) ||
      storedConfig.databaseURL ||
      'https://smart-virtual-speed-reducer-default-rtdb.firebaseio.com',
    projectId:
      (env.VITE_FIREBASE_PROJECT_ID as string) ||
      storedConfig.projectId ||
      'smart-virtual-speed-reducer',
    storageBucket:
      (env.VITE_FIREBASE_STORAGE_BUCKET as string) ||
      storedConfig.storageBucket ||
      'smart-virtual-speed-reducer.appspot.com',
    messagingSenderId:
      (env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) ||
      storedConfig.messagingSenderId ||
      '',
    appId:
      (env.VITE_FIREBASE_APP_ID as string) ||
      storedConfig.appId ||
      '',
  };
}

export function saveRuntimeFirebaseConfig(config: Partial<FirebaseWebConfig>) {
  if (typeof window !== 'undefined' && window.localStorage) {
    const existing = getFirebaseConfig();
    const merged = { ...existing, ...config };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
    window.location.reload();
  }
}

export function clearRuntimeFirebaseConfig() {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    window.location.reload();
  }
}

export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.apiKey.trim().length > 0 && config.projectId);
}

export function getMissingConfigKeys(): string[] {
  const config = getFirebaseConfig();
  const missing: string[] = [];
  if (!config.apiKey) missing.push('VITE_FIREBASE_API_KEY');
  if (!config.projectId) missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!config.databaseURL) missing.push('VITE_FIREBASE_DATABASE_URL');
  if (!config.appId) missing.push('VITE_FIREBASE_APP_ID');
  return missing;
}

// Singleton instances
let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedRtdb: Database | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) {
    return null;
  }
  if (!cachedApp) {
    const config = getFirebaseConfig();
    if (getApps().length > 0) {
      cachedApp = getApp();
    } else {
      cachedApp = initializeApp(config);
    }
  }
  return cachedApp;
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (!cachedAuth) {
    cachedAuth = getAuth(app);
  }
  return cachedAuth;
}

export function getFirebaseDatabase(): Database | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (!cachedRtdb) {
    const config = getFirebaseConfig();
    cachedRtdb = getDatabase(app, config.databaseURL);
  }
  return cachedRtdb;
}

/**
 * Authentication Methods
 */
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase configuration is missing. Please configure Firebase Web App credentials.');
  }
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
}

export async function logoutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) {
    await signOut(auth);
  }
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Realtime Database: Subscribe to live `/zones`
 * Strictly READ-ONLY. No write calls are executed.
 */
export function subscribeToLiveZones(
  onSuccess: (zones: SpeedZone[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const rtdb = getFirebaseDatabase();
  if (!rtdb) {
    onError(new Error('Firebase Realtime Database is not initialized.'));
    return () => {};
  }

  const zonesRef = ref(rtdb, 'zones');

  const unsubscribe = onValue(
    zonesRef,
    (snapshot: DataSnapshot) => {
      try {
        const val = snapshot.val();
        if (!val) {
          onSuccess([]);
          return;
        }

        const parsedZones: SpeedZone[] = [];

        // Handle both dictionary of objects { "ZN-010": { ... } } and array
        Object.entries(val).forEach(([key, raw]: [string, any]) => {
          if (!raw || typeof raw !== 'object') return;
          // Filter out drafts if marked by Government App
          if (raw.isDraft === true) return;

          const speedLimit = Number(raw.speedLimit) || 30;
          const zoneId = raw.id || key;
          const name = raw.name || `Zone ${zoneId}`;
          const reason = typeof raw.reason === 'string' ? raw.reason : (raw.reason ? JSON.stringify(raw.reason) : 'Digital Speed Reducer Zone');
          const controlledDistance = Number(raw.controlledDistance ?? raw.controlledRangeMeters) || 900;
          const controlledRangeMeters = Number(raw.controlledRangeMeters ?? raw.controlledDistance) || controlledDistance;
          const roadName = typeof raw.roadName === 'string' ? raw.roadName : 'Janpath Avenue Sector';
          const schedule = typeof raw.schedule === 'string' ? raw.schedule : (raw.schedule ? JSON.stringify(raw.schedule) : 'Active 24 Hours / 7 Days');
          const authority = typeof raw.authority === 'string' ? raw.authority : 'Odisha Road Safety Authority (ORSA)';
          const lastUpdated = typeof raw.lastUpdated === 'string' ? raw.lastUpdated : 'Live Synced from Government Grid';
          const virtualHumpsCount = Number(raw.virtualHumpsCount) || 3;
          const status = raw.status === 'scheduled' ? 'scheduled' : 'active';
          const type = raw.type || (name.toLowerCase().includes('school') ? 'school' : 'permanent');
          const startKm = Number(raw.startKm) || 12.4;
          const endKm = Number(raw.endKm) || 13.3;
          
          // Coordinate normalization handling objects, {lat, lng}, {latitude, longitude}, or fallback
          let coordinates = { lat: 20.2961, lng: 85.8245 };
          if (raw.coordinates && typeof raw.coordinates === 'object') {
            coordinates = {
              lat: Number(raw.coordinates.lat ?? raw.coordinates.latitude) || 20.2961,
              lng: Number(raw.coordinates.lng ?? raw.coordinates.longitude) || 85.8245,
            };
          } else if (raw.startPoint && typeof raw.startPoint === 'object') {
            coordinates = {
              lat: Number(raw.startPoint.lat ?? raw.startPoint.latitude) || 20.2961,
              lng: Number(raw.startPoint.lng ?? raw.startPoint.longitude) || 85.8245,
            };
          }

          const startPoint = raw.startPoint || coordinates;
          const endPoint = raw.endPoint || { lat: 20.3015, lng: 85.8310 };

          parsedZones.push({
            id: zoneId,
            name,
            type,
            speedLimit,
            controlledRangeMeters,
            controlledDistance,
            startPoint,
            endPoint,
            reason,
            schedule,
            status,
            authority,
            lastUpdated,
            roadName,
            startKm,
            endKm,
            virtualHumpsCount,
            coordinates,
          });
        });

        onSuccess(parsedZones);
      } catch (err: any) {
        onError(err);
      }
    },
    (err) => {
      onError(err);
    }
  );

  return unsubscribe;
}
