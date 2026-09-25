import { SpeedZone, ZoneType, ZoneStatus, ZonePriority } from './index';

export type CanonicalZoneType = 'PERMANENT' | 'TEMPORARY' | 'VIRTUAL_HUMP';

export type CanonicalReasonCategory = 
  | 'SCHOOL'
  | 'HOSPITAL'
  | 'EVENT'
  | 'CONSTRUCTION'
  | 'PEDESTRIAN_SAFETY'
  | 'ACCIDENT_PRONE'
  | 'OTHER';

export type CanonicalZoneStatus = 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DISABLED' | 'DRAFT';

export interface CanonicalPoint {
  latitude: number;
  longitude: number;
  name?: string;
  // UI Canvas coordinates projection for visual GIS dashboard
  x?: number;
  y?: number;
}

export interface CanonicalSpeedZone {
  id: string; // e.g. ZN-001
  name: string;
  type: CanonicalZoneType;
  reason: string;
  reasonCategory?: CanonicalReasonCategory;
  speedLimit: number; // km/h
  startPoint: CanonicalPoint;
  endPoint: CanonicalPoint;
  controlledDistance: number; // in meters
  status: CanonicalZoneStatus;
  schedule: {
    startTime: string;
    endTime: string;
    startDate: string;
    endDate: string;
    days: string[];
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version?: number;
  isDraft?: boolean;
}

// Canonical Vehicle structure for future shared vehicle-owner & digital-twin apps
export interface CanonicalVehicle {
  id: string; // e.g. VH-2041
  vehicleType: string;
  displayType: string;
  currentZoneId: string | null;
  currentSpeed: number;
  allowedSpeed: number;
  gpsStatus: 'NOMINAL' | 'DEGRADED' | 'OFFLINE';
  imuStatus: 'NOMINAL' | 'DEGRADED' | 'OFFLINE';
  cameraStatus: 'NOMINAL' | 'DEGRADED' | 'OFFLINE';
  connectionStatus: 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED';
  mapVersion: number;
  location?: {
    latitude: number;
    longitude: number;
    heading: number;
    speed: number;
  };
  updatedAt: string;
}

// Canonical Override structure for future shared system
export interface CanonicalOverride {
  id: string; // e.g. OV-001
  vehicleId: string;
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'BLOCKED' | 'EXPIRED' | 'CLEARED';
  reason: string;
  startedAt: string;
  expiresAt: string;
  durationMinutes: number;
  monitoring: {
    lastSpeed: number;
    speedLimit: number;
    deviationDetected: boolean;
    routeFollowed: boolean;
  };
  riskStatus: 'LOW' | 'MEDIUM' | 'HIGH';
  riskConfidence?: number;
  blockReason?: string;
  updatedAt: string;
}

// Canonical System Event structure for future shared activity audit
export interface CanonicalSystemEvent {
  eventId: string;
  timestamp: string;
  eventType: string;
  vehicleId?: string;
  zoneId?: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO' | 'NOMINAL';
  operator: string;
  description: string;
}

// Helper: infer reason category from reason string
export const inferReasonCategory = (reason: string): CanonicalReasonCategory => {
  const lower = reason.toLowerCase();
  if (lower.includes('school') || lower.includes('student')) return 'SCHOOL';
  if (lower.includes('hospital') || lower.includes('ambulance') || lower.includes('patient') || lower.includes('trauma')) return 'HOSPITAL';
  if (lower.includes('event') || lower.includes('festival') || lower.includes('athletic') || lower.includes('game')) return 'EVENT';
  if (lower.includes('construction') || lower.includes('metro') || lower.includes('work')) return 'CONSTRUCTION';
  if (lower.includes('pedestrian') || lower.includes('vendor') || lower.includes('crossing')) return 'PEDESTRIAN_SAFETY';
  if (lower.includes('curve') || lower.includes('blind') || lower.includes('accident')) return 'ACCIDENT_PRONE';
  return 'OTHER';
};

// Bi-directional conversion helpers: UI SpeedZone <-> CanonicalSpeedZone
export const toCanonicalZone = (uiZone: SpeedZone): CanonicalSpeedZone => {
  let canonicalType: CanonicalZoneType = 'PERMANENT';
  if (uiZone.type === 'temporary' || uiZone.type === 'dynamic_restriction') {
    canonicalType = 'TEMPORARY';
  } else if (uiZone.type === 'virtual_hump') {
    canonicalType = 'VIRTUAL_HUMP';
  }

  const now = new Date().toISOString();

  // Normalize ID e.g. ZONE-IND-01 -> ZN-001 (or keep if already ZN-xxx)
  let id = uiZone.id;
  if (id.startsWith('ZONE-IND-')) {
    const num = id.replace('ZONE-IND-', '').padStart(3, '0');
    id = `ZN-${num}`;
  }

  return {
    id,
    name: uiZone.name,
    type: canonicalType,
    reason: uiZone.reason,
    reasonCategory: inferReasonCategory(uiZone.reason),
    speedLimit: uiZone.speedLimit,
    startPoint: {
      latitude: uiZone.coordinates?.start?.lat ?? 20.3533,
      longitude: uiZone.coordinates?.start?.lng ?? 85.8172,
      name: uiZone.startLocation,
      x: uiZone.coordinates?.start?.x ?? 260,
      y: uiZone.coordinates?.start?.y ?? 190
    },
    endPoint: {
      latitude: uiZone.coordinates?.end?.lat ?? 20.3589,
      longitude: uiZone.coordinates?.end?.lng ?? 85.8234,
      name: uiZone.endLocation,
      x: uiZone.coordinates?.end?.x ?? 440,
      y: uiZone.coordinates?.end?.y ?? 210
    },
    controlledDistance: uiZone.rangeMeters,
    status: uiZone.status.toUpperCase() as CanonicalZoneStatus,
    schedule: uiZone.schedule,
    createdBy: uiZone.createdBy,
    createdAt: uiZone.lastUpdated || now,
    updatedAt: now,
    version: uiZone.version,
    isDraft: uiZone.isDraft
  };
};

export const toUiZone = (canonical: CanonicalSpeedZone): SpeedZone => {
  let uiType: ZoneType = 'permanent';
  if (canonical.type === 'TEMPORARY') uiType = 'temporary';
  else if (canonical.type === 'VIRTUAL_HUMP') uiType = 'virtual_hump';

  const uiStatus = (canonical.status.toLowerCase() as ZoneStatus) || 'active';

  return {
    id: canonical.id,
    name: canonical.name,
    type: uiType,
    speedLimit: canonical.speedLimit,
    rangeMeters: canonical.controlledDistance,
    startLocation: canonical.startPoint.name || `Lat: ${canonical.startPoint.latitude.toFixed(4)}`,
    endLocation: canonical.endPoint.name || `Lat: ${canonical.endPoint.latitude.toFixed(4)}`,
    coordinates: {
      start: {
        lat: canonical.startPoint.latitude,
        lng: canonical.startPoint.longitude,
        x: canonical.startPoint.x ?? 300,
        y: canonical.startPoint.y ?? 200
      },
      end: {
        lat: canonical.endPoint.latitude,
        lng: canonical.endPoint.longitude,
        x: canonical.endPoint.x ?? 450,
        y: canonical.endPoint.y ?? 220
      }
    },
    schedule: canonical.schedule || {
      startTime: '00:00',
      endTime: '23:59',
      startDate: '2026-01-01',
      endDate: '2028-12-31',
      days: ['Everyday']
    },
    reason: canonical.reason,
    priority: (canonical.type === 'PERMANENT' ? 'critical' : 'high') as ZonePriority,
    status: uiStatus,
    vehiclesToday: 0,
    preventedViolationsToday: 0,
    createdBy: canonical.createdBy || 'Government Traffic Authority',
    lastUpdated: canonical.updatedAt || 'Just now',
    version: canonical.version || 1,
    isDraft: canonical.isDraft
  };
};
