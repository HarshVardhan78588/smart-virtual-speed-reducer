export type VehicleType = 'car' | 'motorcycle';

export type DisplayMode = 'integrated' | 'retrofit' | 'two_wheeler';

export type ZoneType = 'permanent' | 'temporary' | 'virtual_hump';

export type ZoneReason =
  | 'School Safety'
  | 'Hospital Zone'
  | 'Pedestrian Safety'
  | 'Construction'
  | 'Event / Festival'
  | 'Accident-Prone Area'
  | 'Temporary Traffic Control';

export interface SpeedZone {
  id: string;
  name: string;
  type: ZoneType;
  reason: ZoneReason;
  allowedSpeed: number; // km/h
  startDistance: number; // meters from current vehicle position
  length: number; // total controlled length in meters
  activeHours?: string; // for temporary zones, e.g. "18:00 - 23:00"
  description?: string;
  symbol: string; // e.g. "!", "◇", "✓"
}

export type SensorHealth =
  | 'active'
  | 'ready'
  | 'searching'
  | 'calibrating'
  | 'degraded'
  | 'error'
  | 'offline'
  | 'synced'
  | 'connected';

export interface SensorStatus {
  gps: SensorHealth;
  imu: SensorHealth;
  camera: SensorHealth;
  localMap: SensorHealth;
  comm: SensorHealth;
}

export interface MapDatabaseState {
  version: string;
  district: string;
  storedZones: number;
  temporaryZones: number;
  lastSync: string;
  status: 'synced' | 'checking' | 'downloading' | 'validating' | 'updated';
  updateDetails?: {
    prevVersion: string;
    newVersion: string;
    zonesAdded: number;
    tempAdded: number;
  };
}

export interface EmergencyOverrideState {
  status: 'inactive' | 'requested' | 'active' | 'blocked';
  timeRemaining: number; // seconds remaining
  monitoring: 'ACTIVE' | 'STANDBY';
  gpsTracked: boolean;
  speedMonitored: boolean;
  imuTracked: boolean;
  routeMonitored: boolean;
  blockedReason?: string;
  activatedAt?: string;
}

export interface HardwareSignalLog {
  id: string;
  timestamp: string;
  source:
    | 'PHYSICAL_BUTTON'
    | 'CAN_BUS'
    | 'GNSS_RECEIVER'
    | 'CAMERA_VISION'
    | 'CONTROLLER_LOGIC'
    | 'COMMUNICATION_MODULE'
    | 'LOCAL_DATABASE';
  signal: string;
  payload: string;
  status: 'processed' | 'pending' | 'interrupt';
}

export interface VehicleState {
  vehicleType: VehicleType;
  vehicleName: string;
  vehicleId: string;
  currentSpeed: number; // km/h
  targetSpeed: number; // km/h
  allowedSpeed: number; // km/h (based on zone or baseline)
  baselineSpeedLimit: number; // km/h (standard road limit, e.g. 50 or 60)
  distanceToZone: number; // meters to upcoming zone start
  zoneRemaining: number; // meters remaining in current active zone
  isInsideZone: boolean;
  currentZone: SpeedZone | null;
  upcomingZone: SpeedZone | null;
  sensors: SensorStatus;
  map: MapDatabaseState;
  override: EmergencyOverrideState;
  controlledSpeedActive: boolean;
  decelerationStepText: string; // e.g. "52 → 48 → 43 → 37 → 30 km/h"
  audioAlert: {
    active: boolean;
    type: 'beep' | 'warning' | 'chime' | 'urgent';
    text: string;
  } | null;
  recentSignals: HardwareSignalLog[];
  autoDrive: boolean;
}

export interface ScenarioPreset {
  id: string;
  title: string;
  subtitle: string;
  speed: number;
  allowed: number;
  distance: number;
  zone: SpeedZone | null;
  overrideStatus?: 'inactive' | 'requested' | 'active' | 'blocked';
}
