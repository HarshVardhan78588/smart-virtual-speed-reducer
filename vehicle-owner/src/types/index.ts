export type ConnectionState = 'connected' | 'syncing' | 'limited' | 'offline';

export type ZoneType = 'school' | 'hospital' | 'construction' | 'permanent' | 'temporary' | 'event';

export type ZoneStatus = 'active' | 'scheduled' | 'inactive';

export interface SpeedZone {
  id: string;
  name: string;
  type: ZoneType;
  speedLimit: number; // km/h
  controlledRangeMeters: number;
  controlledDistance?: number; // alias or distance from Firebase
  startPoint?: any; // start coordinate or marker from Firebase
  endPoint?: any; // end coordinate or marker from Firebase
  reason: string;
  schedule: string;
  status: ZoneStatus;
  authority: string;
  lastUpdated: string;
  roadName: string;
  startKm: number;
  endKm: number;
  virtualHumpsCount: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export type EventSeverity = 'normal' | 'notice' | 'warning' | 'critical';

export type EventCategory = 'zones' | 'emergency' | 'warnings' | 'system';

export interface ZoneEvent {
  id: string;
  timestamp: string;
  category: EventCategory;
  title: string;
  description: string;
  speedLimit?: number;
  vehicleSpeed?: number;
  zoneName?: string;
  severity: EventSeverity;
  iconType: 'zone' | 'override' | 'sync' | 'warning' | 'system' | 'blocked';
}

export type OverrideStatus = 'idle' | 'active' | 'expired' | 'blocked';

export type OverrideReason =
  | 'Medical Emergency'
  | 'Emergency Assistance'
  | 'Critical Family Emergency'
  | 'Official Emergency Duty'
  | 'Other';

export interface EmergencyOverrideState {
  status: OverrideStatus;
  activatedAt?: string;
  expiresAt?: string;
  remainingSeconds: number;
  totalDurationSeconds: number;
  reason?: OverrideReason;
  otherExplanation?: string;
  monitoringActive: boolean;
  aiRiskLevel: 'Low' | 'Moderate' | 'High';
  aiConfidence: number; // e.g. 94
  aiSignals: string[];
  flaggedForReview: boolean;
  blockReason?: string;
}

export type VerificationStatus =
  | 'not_submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'access_restored'
  | 'access_remains_blocked';

export interface VerificationRequest {
  id: string;
  incidentDate: string;
  overrideTime: string;
  vehicleId: string;
  vehicleName: string;
  reasonOriginallySelected: string;
  systemFlag: string;
  userExplanation?: string;
  attachmentName?: string;
  submittedAt?: string;
  status: VerificationStatus;
  reviewerNotes?: string;
}

export interface HardwareSubsystem {
  name: string;
  status: 'connected' | 'calibrated' | 'ready' | 'active' | 'warning' | 'offline';
  detail: string;
  accessibleSymbol: string;
}

export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  model: string;
  type: string;
  vin: string;
  deviceId: string;
  systemVersion: string;
  batteryLevel: number;
  voltage: string;
  powerSource: string;
  lastDeviceUpdate: string;
  lastSyncTime: string;
  mapVersion: string;
  subsystems: {
    gps: HardwareSubsystem;
    imu: HardwareSubsystem;
    camera: HardwareSubsystem;
    communication: HardwareSubsystem;
    power: HardwareSubsystem;
  };
}

export interface MapSyncState {
  region: string;
  version: string;
  lastUpdated: string;
  totalZones: number;
  temporaryZones: number;
  permanentZones: number;
  syncStatus: 'up_to_date' | 'syncing' | 'update_available' | 'error';
  syncProgress: number; // 0-100
}

export interface NotificationItem {
  id: string;
  category: 'zone' | 'temporary' | 'map' | 'emergency' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: 'info' | 'notice' | 'warning' | 'urgent';
}

export interface Telemetry {
  currentSpeed: number; // km/h
  allowedSpeed: number; // km/h
  roadName: string;
  distanceToUpcomingZone: number; // meters
  zoneRemainingMeters: number; // meters
  approachingZone: SpeedZone | null;
  activeZone: SpeedZone | null;
  connectionState: ConnectionState;
  gpsSatellites: number;
  heading: number; // degrees
}

export interface AccessibilitySettings {
  colorBlindMode: boolean;
  highContrast: boolean;
  largerText: boolean;
  reducedMotion: boolean;
}
