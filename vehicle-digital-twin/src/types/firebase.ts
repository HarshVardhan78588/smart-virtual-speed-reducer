export interface FirebaseZoneRecord {
  name?: string;
  speedLimit?: number | string;
  reason?: string;
  controlledDistance?: number | string;
  isDraft?: boolean;
  type?: string;
  activeHours?: string;
  description?: string;
  symbol?: string;
  createdAt?: number | string;
  updatedAt?: number | string;
  status?: string;
}

export type FirebaseZonesDictionary = Record<string, FirebaseZoneRecord>;

export type FirebaseSyncState =
  | 'idle'
  | 'checking_config'
  | 'unconfigured'
  | 'authenticating'
  | 'connecting'
  | 'live_synced'
  | 'empty'
  | 'permission_denied'
  | 'error'
  | 'offline';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
