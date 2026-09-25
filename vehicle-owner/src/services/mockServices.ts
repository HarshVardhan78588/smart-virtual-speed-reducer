import {
  Vehicle,
  SpeedZone,
  ZoneEvent,
  EmergencyOverrideState,
  NotificationItem,
  MapSyncState,
  VerificationRequest,
} from '../types';
import {
  IVehicleService,
  IZoneService,
  IOverrideService,
  IVerificationService,
  IActivityService,
  INotificationService,
  IMapSyncService,
} from './types';

export const INITIAL_VEHICLE: Vehicle = {
  id: 'VEH-IN-98214',
  name: 'CargoMesh Demo Vehicle',
  plateNumber: 'DL-01-AX-4820',
  model: 'E-Transit Prime Cargo',
  type: 'Light Commercial Electric (LCV)',
  vin: 'MA1TC24X8RP908122',
  deviceId: 'SVSR-OBD-8842-X',
  systemVersion: 'v3.4.2-rel (Hardware Tier 2)',
  batteryLevel: 98,
  voltage: '13.8V Nominal',
  powerSource: 'External Main Line + Internal LiFePO4 Backup',
  lastDeviceUpdate: 'Today, 08:30 IST',
  lastSyncTime: 'Today, 10:42 IST',
  mapVersion: '2026.09.25.04',
  subsystems: {
    gps: {
      name: 'Dual-Band GNSS (GPS + NavIC)',
      status: 'active',
      detail: '14 satellites locked · RTK Fixed (0.2m precision)',
      accessibleSymbol: '✓',
    },
    imu: {
      name: '6-Axis IMU & Gyroscope',
      status: 'calibrated',
      detail: 'Zero-bias calibrated · Dynamic road pitch active',
      accessibleSymbol: '✓',
    },
    camera: {
      name: 'Front Road Sign & Speed Optical Sensor',
      status: 'ready',
      detail: '60 FPS real-time vision sensor · Lens unobstructed',
      accessibleSymbol: '✓',
    },
    communication: {
      name: 'Cellular V2X & Telemetry Modem',
      status: 'connected',
      detail: '5G Low-Latency · Government Safety Gateway connected',
      accessibleSymbol: '✓',
    },
    power: {
      name: 'Vehicle Power Interface',
      status: 'ready',
      detail: '13.8V regulated · Internal battery 98% healthy',
      accessibleSymbol: '✓',
    },
  },
};

export const INITIAL_ZONES: SpeedZone[] = [
  {
    id: 'ZONE-BBSR-01',
    name: 'Unit-4 Government Girls High School Zone',
    type: 'school',
    speedLimit: 30,
    controlledRangeMeters: 900,
    reason: 'School Safety Zone - High Pedestrian Density',
    schedule: '07:30 - 16:30 IST (Mon-Sat)',
    status: 'active',
    authority: 'Odisha Road Safety Authority (ORSA)',
    lastUpdated: 'Today, 08:42 IST',
    roadName: 'Janpath Avenue, Sector 4',
    startKm: 12.4,
    endKm: 13.3,
    virtualHumpsCount: 3,
    coordinates: { lat: 20.2961, lng: 85.8245 },
  },
  {
    id: 'ZONE-BBSR-02',
    name: 'Capital Hospital Trauma Care Corridor',
    type: 'hospital',
    speedLimit: 30,
    controlledRangeMeters: 650,
    reason: 'Hospital Emergency Ambulance Access Corridor',
    schedule: '24 Hours / 7 Days Active',
    status: 'active',
    authority: 'Municipal Safety Directorate',
    lastUpdated: 'Yesterday, 18:20 IST',
    roadName: 'Sachivalaya Marg',
    startKm: 8.1,
    endKm: 8.75,
    virtualHumpsCount: 2,
    coordinates: { lat: 20.2724, lng: 85.8338 },
  },
  {
    id: 'ZONE-BBSR-03',
    name: 'Metro Flyover Expansion Work Sector',
    type: 'construction',
    speedLimit: 25,
    controlledRangeMeters: 450,
    reason: 'Temporary Construction Zone - Heavy Equipment Crossing',
    schedule: 'Temporary · Valid until Sept 29, 2026',
    status: 'active',
    authority: 'Urban Transit Infrastructure Cell',
    lastUpdated: 'Today, 06:15 IST',
    roadName: 'Cuttack-Puri Bypass (NH-16 Link)',
    startKm: 21.0,
    endKm: 21.45,
    virtualHumpsCount: 2,
    coordinates: { lat: 20.315, lng: 85.808 },
  },
  {
    id: 'ZONE-BBSR-04',
    name: 'Master Canteen Intermodal Transit Square',
    type: 'permanent',
    speedLimit: 40,
    controlledRangeMeters: 1100,
    reason: 'High Volume Pedestrian & Bus Hub',
    schedule: '06:00 - 22:30 IST Daily',
    status: 'active',
    authority: 'Bhubaneswar Traffic Police Department',
    lastUpdated: 'Sept 20, 2026',
    roadName: 'Station Square Junction',
    startKm: 5.2,
    endKm: 6.3,
    virtualHumpsCount: 4,
    coordinates: { lat: 20.2662, lng: 85.8436 },
  },
  {
    id: 'ZONE-BBSR-05',
    name: 'Ekamra Heritage Cultural Corridor',
    type: 'event',
    speedLimit: 20,
    controlledRangeMeters: 550,
    reason: 'Weekly Heritage Walk Pedestrian Zone',
    schedule: 'Weekends 06:00 - 11:00 IST',
    status: 'scheduled',
    authority: 'Smart City Culture & Safety Board',
    lastUpdated: 'Today, 07:00 IST',
    roadName: 'Old Town Heritage Road',
    startKm: 2.1,
    endKm: 2.65,
    virtualHumpsCount: 2,
    coordinates: { lat: 20.2415, lng: 85.8341 },
  },
];

export const INITIAL_EVENTS: ZoneEvent[] = [
  {
    id: 'EVT-101',
    timestamp: '11:12 IST',
    category: 'system',
    title: 'Local Map Synchronized',
    description: 'Received delta update: 12 new speed zones verified by State Safety Gateway.',
    severity: 'normal',
    iconType: 'sync',
  },
  {
    id: 'EVT-102',
    timestamp: '10:48 IST',
    category: 'warnings',
    title: 'Controlled Speed Reduction Applied',
    description: 'Smooth deceleration from 52 km/h to 30 km/h over 350m preceding Unit-4 School Zone.',
    speedLimit: 30,
    vehicleSpeed: 48,
    zoneName: 'Unit-4 Government Girls High School Zone',
    severity: 'notice',
    iconType: 'zone',
  },
  {
    id: 'EVT-103',
    timestamp: '10:45 IST',
    category: 'zones',
    title: 'Exited School Safety Zone',
    description: 'Vehicle cleared controlled zone boundary. Standard road limit (50 km/h) restored.',
    speedLimit: 50,
    vehicleSpeed: 42,
    zoneName: 'Unit-4 Government Girls High School Zone',
    severity: 'normal',
    iconType: 'zone',
  },
  {
    id: 'EVT-104',
    timestamp: '10:42 IST',
    category: 'zones',
    title: 'Entered School Safety Zone',
    description: 'Active virtual speed boundary engaged. Vehicle response matched to 30 km/h.',
    speedLimit: 30,
    vehicleSpeed: 30,
    zoneName: 'Unit-4 Government Girls High School Zone',
    severity: 'notice',
    iconType: 'zone',
  },
  {
    id: 'EVT-105',
    timestamp: '09:15 IST',
    category: 'warnings',
    title: 'Approaching Construction Caution',
    description: 'Temporary 25 km/h zone detected 600m ahead on Cuttack-Puri Bypass.',
    speedLimit: 25,
    zoneName: 'Metro Flyover Expansion Work Sector',
    severity: 'warning',
    iconType: 'warning',
  },
  {
    id: 'EVT-106',
    timestamp: 'Yesterday, 16:30 IST',
    category: 'emergency',
    title: 'Emergency Override Expired',
    description: 'Emergency override completed after 22 minutes. Standard speed-zone operation restored.',
    severity: 'normal',
    iconType: 'override',
  },
  {
    id: 'EVT-107',
    timestamp: 'Yesterday, 16:08 IST',
    category: 'emergency',
    title: 'Emergency Override Activated',
    description: 'Driver declared Medical Emergency. Restrictions suspended with live telemetry streaming.',
    severity: 'notice',
    iconType: 'override',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-01',
    category: 'zone',
    title: 'Speed Zone Ahead: 30 km/h',
    message: 'Approaching Unit-4 School Safety Zone in 420 meters. Controlled reduction active.',
    timestamp: '1 min ago',
    read: false,
    severity: 'notice',
  },
  {
    id: 'NOTIF-02',
    category: 'temporary',
    title: 'Temporary Speed Zone Activated',
    message: 'Metro Flyover Expansion work zone active until 18:00 IST on Cuttack-Puri Bypass.',
    timestamp: '25 mins ago',
    read: false,
    severity: 'warning',
  },
  {
    id: 'NOTIF-03',
    category: 'map',
    title: 'Local Zone Map Up to Date',
    message: '128 local safety zones verified for Bhubaneswar District (v2026.09.25.04).',
    timestamp: '2 hours ago',
    read: true,
    severity: 'info',
  },
  {
    id: 'NOTIF-04',
    category: 'system',
    title: 'Hardware Self-Test Passed',
    message: 'GPS NavIC, 6-Axis IMU, and Optical Sign Sensor confirmed operational.',
    timestamp: '4 hours ago',
    read: true,
    severity: 'info',
  },
];

export const INITIAL_OVERRIDE_STATE: EmergencyOverrideState = {
  status: 'idle',
  remainingSeconds: 7200, // 2 hours
  totalDurationSeconds: 7200,
  monitoringActive: false,
  aiRiskLevel: 'Low',
  aiConfidence: 94,
  aiSignals: [
    'No repeated activations in last 48 hours',
    'Historical route correlation aligns with hospital corridors',
    'Acceleration profile nominal during past events',
    'Zero unverified overrides recorded on this vehicle profile',
  ],
  flaggedForReview: false,
};

export const INITIAL_VERIFICATION_REQUEST: VerificationRequest = {
  id: 'VER-BBSR-2026-081',
  incidentDate: 'Sept 22, 2026',
  overrideTime: '14:22 - 14:48 IST (26 mins)',
  vehicleId: 'DL-01-AX-4820',
  vehicleName: 'CargoMesh Demo Vehicle',
  reasonOriginallySelected: 'Medical Emergency',
  systemFlag: 'Repeated speed deviation outside designated hospital quadrant',
  status: 'not_submitted',
};

export const INITIAL_MAP_SYNC_STATE: MapSyncState = {
  region: 'Bhubaneswar District & Capital Region',
  version: '2026.09.25.04',
  lastUpdated: 'Today, 10:42 IST',
  totalZones: 128,
  temporaryZones: 7,
  permanentZones: 121,
  syncStatus: 'up_to_date',
  syncProgress: 100,
};

// Mock Service Implementations

class MockVehicleService implements IVehicleService {
  private vehicle = { ...INITIAL_VEHICLE };

  async getVehicle(): Promise<Vehicle> {
    return { ...this.vehicle };
  }

  async updateSubsystemStatus(subsystem: string, status: any): Promise<void> {
    if (this.vehicle.subsystems[subsystem as keyof typeof this.vehicle.subsystems]) {
      this.vehicle.subsystems[subsystem as keyof typeof this.vehicle.subsystems].status = status;
    }
  }
}

class MockZoneService implements IZoneService {
  private zones = [...INITIAL_ZONES];

  async getAllZones(): Promise<SpeedZone[]> {
    return [...this.zones];
  }

  async getZoneById(id: string): Promise<SpeedZone | undefined> {
    return this.zones.find((z) => z.id === id);
  }

  async getUpcomingZone(): Promise<SpeedZone | null> {
    return this.zones[0]; // Unit-4 School Zone
  }

  async getActiveZone(): Promise<SpeedZone | null> {
    return null;
  }
}

class MockOverrideService implements IOverrideService {
  private state = { ...INITIAL_OVERRIDE_STATE };

  async getOverrideState(): Promise<EmergencyOverrideState> {
    return { ...this.state };
  }

  async activateOverride(reason: string, explanation?: string): Promise<EmergencyOverrideState> {
    this.state = {
      ...this.state,
      status: 'active',
      activatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      remainingSeconds: 7200,
      totalDurationSeconds: 7200,
      reason: reason as any,
      otherExplanation: explanation,
      monitoringActive: true,
      flaggedForReview: false,
      aiRiskLevel: 'Low',
      aiConfidence: 94,
    };
    return { ...this.state };
  }

  async endOverride(): Promise<EmergencyOverrideState> {
    this.state = {
      ...this.state,
      status: 'idle',
      remainingSeconds: 7200,
      monitoringActive: false,
      flaggedForReview: false,
    };
    return { ...this.state };
  }

  async flagOverrideActivity(): Promise<EmergencyOverrideState> {
    this.state = {
      ...this.state,
      flaggedForReview: true,
      aiRiskLevel: 'Moderate',
      aiConfidence: 88,
    };
    return { ...this.state };
  }

  async simulateBlockedState(): Promise<EmergencyOverrideState> {
    this.state = {
      ...this.state,
      status: 'blocked',
      monitoringActive: false,
      flaggedForReview: true,
      blockReason: 'Repeated suspicious override activity following safety audit #SR-892',
    };
    return { ...this.state };
  }

  async resetToIdle(): Promise<EmergencyOverrideState> {
    this.state = {
      ...INITIAL_OVERRIDE_STATE,
      status: 'idle',
    };
    return { ...this.state };
  }
}

class MockVerificationService implements IVerificationService {
  private verification = { ...INITIAL_VERIFICATION_REQUEST };

  async getVerificationRequest(): Promise<VerificationRequest> {
    return { ...this.verification };
  }

  async submitVerification(explanation: string, attachmentName?: string): Promise<VerificationRequest> {
    this.verification = {
      ...this.verification,
      userExplanation: explanation,
      attachmentName: attachmentName || 'Hospital_Discharge_Slip_2209.pdf',
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'under_review',
    };
    return { ...this.verification };
  }

  async setReviewStatus(status: VerificationRequest['status']): Promise<VerificationRequest> {
    this.verification = {
      ...this.verification,
      status,
    };
    return { ...this.verification };
  }
}

class MockActivityService implements IActivityService {
  private events = [...INITIAL_EVENTS];

  async getEvents(category?: string): Promise<ZoneEvent[]> {
    if (!category || category === 'all') {
      return [...this.events];
    }
    return this.events.filter((e) => e.category === category);
  }

  async addEvent(event: Omit<ZoneEvent, 'id' | 'timestamp'>): Promise<ZoneEvent> {
    const newEvent: ZoneEvent = {
      ...event,
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
    };
    this.events.unshift(newEvent);
    return newEvent;
  }
}

class MockNotificationService implements INotificationService {
  private notifications = [...INITIAL_NOTIFICATIONS];

  async getNotifications(): Promise<NotificationItem[]> {
    return [...this.notifications];
  }

  async markAsRead(id: string): Promise<void> {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  }

  async markAllAsRead(): Promise<void> {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
  }
}

class MockMapSyncService implements IMapSyncService {
  private state = { ...INITIAL_MAP_SYNC_STATE };

  async getMapSyncState(): Promise<MapSyncState> {
    return { ...this.state };
  }

  async triggerSync(onProgress?: (progress: number) => void): Promise<MapSyncState> {
    this.state.syncStatus = 'syncing';
    for (let i = 10; i <= 100; i += 25) {
      if (onProgress) onProgress(i);
      await new Promise((res) => setTimeout(res, 250));
    }
    const now = new Date();
    const timeStr = `Today, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} IST`;
    this.state = {
      ...this.state,
      lastUpdated: timeStr,
      syncStatus: 'up_to_date',
      syncProgress: 100,
      totalZones: 130, // simulated incremental zone
      temporaryZones: 8,
    };
    return { ...this.state };
  }
}

// Singleton instances ready for injection or future Firebase replacement
export const vehicleService: IVehicleService = new MockVehicleService();
export const zoneService: IZoneService = new MockZoneService();
export const overrideService: IOverrideService = new MockOverrideService();
export const verificationService: IVerificationService = new MockVerificationService();
export const activityService: IActivityService = new MockActivityService();
export const notificationService: INotificationService = new MockNotificationService();
export const mapSyncService: IMapSyncService = new MockMapSyncService();
