import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth } from 'firebase/auth';

export interface FirebaseConnectionState {
  isConfigured: boolean;
  projectId: string;
  databaseUrl: string;
}

// Environment-based Firebase configuration
// Target project: smart-virtual-speed-reducer
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyPrototypeDummyKeyForInit',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'smart-virtual-speed-reducer.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://smart-virtual-speed-reducer-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'smart-virtual-speed-reducer',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'smart-virtual-speed-reducer.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

let app: FirebaseApp;
let database: Database;
let auth: Auth;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  database = getDatabase(app);
  auth = getAuth(app);
} catch (error) {
  console.warn('[Firebase] Central initialization warning:', error);
  // Re-use or gracefully initialize
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  database = getDatabase(app);
  auth = getAuth(app);
}

export { app, database, auth };

export const getFirebaseState = (): FirebaseConnectionState => ({
  isConfigured: Boolean(firebaseConfig.projectId),
  projectId: firebaseConfig.projectId,
  databaseUrl: firebaseConfig.databaseURL
});
