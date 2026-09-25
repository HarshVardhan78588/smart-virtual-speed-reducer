import {
  Vehicle,
  SpeedZone,
  ZoneEvent,
  EmergencyOverrideState,
  NotificationItem,
  MapSyncState,
  VerificationRequest,
  Telemetry,
  ConnectionState,
} from '../types';

export interface IVehicleService {
  getVehicle(): Promise<Vehicle>;
  updateSubsystemStatus(subsystem: string, status: any): Promise<void>;
}

export interface IZoneService {
  getAllZones(): Promise<SpeedZone[]>;
  getZoneById(id: string): Promise<SpeedZone | undefined>;
  getUpcomingZone(): Promise<SpeedZone | null>;
  getActiveZone(): Promise<SpeedZone | null>;
}

export interface IOverrideService {
  getOverrideState(): Promise<EmergencyOverrideState>;
  activateOverride(reason: string, explanation?: string): Promise<EmergencyOverrideState>;
  endOverride(): Promise<EmergencyOverrideState>;
  flagOverrideActivity(): Promise<EmergencyOverrideState>;
  simulateBlockedState(): Promise<EmergencyOverrideState>;
  resetToIdle(): Promise<EmergencyOverrideState>;
}

export interface IVerificationService {
  getVerificationRequest(): Promise<VerificationRequest>;
  submitVerification(explanation: string, attachmentName?: string): Promise<VerificationRequest>;
  setReviewStatus(status: VerificationRequest['status']): Promise<VerificationRequest>;
}

export interface IActivityService {
  getEvents(category?: string): Promise<ZoneEvent[]>;
  addEvent(event: Omit<ZoneEvent, 'id' | 'timestamp'>): Promise<ZoneEvent>;
}

export interface INotificationService {
  getNotifications(): Promise<NotificationItem[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
}

export interface IMapSyncService {
  getMapSyncState(): Promise<MapSyncState>;
  triggerSync(onProgress?: (progress: number) => void): Promise<MapSyncState>;
}
