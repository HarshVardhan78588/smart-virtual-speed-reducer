export type ZoneType = 'permanent' | 'temporary' | 'virtual_hump' | 'dynamic_restriction';

export type ZoneStatus = 'active' | 'scheduled' | 'expired' | 'disabled' | 'draft';

export type ZonePriority = 'critical' | 'high' | 'medium' | 'low';

export interface SpeedZone {
  id: string;
  name: string;
  type: ZoneType;
  speedLimit: number; // km/h
  rangeMeters: number;
  startLocation: string;
  endLocation: string;
  coordinates: {
    start: { x: number; y: number; lat: number; lng: number };
    end: { x: number; y: number; lat: number; lng: number };
  };
  schedule: {
    startTime: string;
    endTime: string;
    startDate: string;
    endDate: string;
    days: string[]; // ['Mon', 'Tue', ...] or ['Everyday']
  };
  reason: string;
  priority: ZonePriority;
  status: ZoneStatus;
  vehiclesToday: number;
  preventedViolationsToday: number;
  createdBy: string;
  lastUpdated: string;
  version: number;
  isDraft?: boolean;
}

export type VehicleType = 'car' | 'motorcycle' | 'bus' | 'truck' | 'emergency';

export type SensorStatus = 'nominal' | 'degraded' | 'offline';

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

export interface VehicleTelemetry {
  id: string;
  plateNumber: string;
  type: VehicleType;
  model: string;
  currentSpeed: number; // km/h
  allowedSpeed: number; // km/h
  currentZoneId: string | null;
  currentZoneName: string | null;
  coordinates: { x: number; y: number; lat: number; lng: number };
  heading: number; // 0-360 degrees
  roadName: string;
  speedHistory: number[]; // last 10 points
  sensors: {
    gps: SensorStatus;
    imu: SensorStatus;
    camera: SensorStatus;
    v2x: SensorStatus;
  };
  connection: ConnectionStatus;
  hasActiveOverride: boolean;
  overrideId?: string;
  driverAlertState: 'nominal' | 'warning' | 'auto_braking' | 'override_active';
  lastUpdate: string;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export type OverrideStatus = 
  | 'active'
  | 'under_review'
  | 'blocked'
  | 'permanently_disabled'
  | 'verification_pending'
  | 'expired'
  | 'cleared';

export interface EmergencyOverride {
  id: string;
  vehicleId: string;
  plateNumber: string;
  vehicleType: VehicleType;
  driverName: string;
  declaredReason: string;
  declaredDestination: string;
  startTime: string;
  expiresAt: string;
  durationMinutes: number;
  remainingSeconds: number;
  currentLocation: string;
  currentZoneName: string | null;
  currentSpeed: number;
  speedLimit: number;
  status: OverrideStatus;
  movementStatus: 'moving_nominal' | 'moving_excessive' | 'stationary' | 'deviated';
  aiRiskLevel: RiskLevel;
  aiRiskConfidence: number; // e.g. 92%
  riskIndicators: string[];
  blockReason?: string;
  blockedAt?: string;
  blockedBy?: string;
  notes?: string;
  gpsTrack: Array<{ lat: number; lng: number; speed: number; time: string }>;
}

export type EventSeverity = 'critical' | 'warning' | 'info' | 'nominal';

export type EventCategory = 
  | 'zone_update'
  | 'vehicle_entry'
  | 'vehicle_exit'
  | 'speed_reducer_activated'
  | 'emergency_override'
  | 'ai_risk_flag'
  | 'override_blocked'
  | 'authority_action';

export interface SystemEvent {
  id: string;
  timestamp: string;
  category: EventCategory;
  title: string;
  description: string;
  targetId: string;
  targetType: 'vehicle' | 'zone' | 'system';
  severity: EventSeverity;
  operator: string;
  status: string;
}

export interface PublishBatch {
  timestamp: string;
  operatorId: string;
  operatorName: string;
  affectedZonesCount: number;
  connectedVehiclesCount: number;
  verificationHash: string;
  notes: string;
}

export interface AuthorityUser {
  id: string;
  name: string;
  role: string;
  badgeNumber: string;
  department: string;
  division: string;
  lastLogin: string;
  email?: string;
  uid?: string;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'extralarge';
  reducedMotion: boolean;
  colorblindMode: 'standard' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'monochrome';
}

export interface MapLayerOptions {
  showRoads: boolean;
  showZones: boolean;
  showVirtualHumps: boolean;
  showVehicles: boolean;
  showSpeedLabels: boolean;
  showTrafficDensity: boolean;
  showRadarScan: boolean;
}
