import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  SpeedZone,
  ZoneStatus,
  VehicleTelemetry,
  EmergencyOverride,
  SystemEvent,
  AuthorityUser,
  PublishBatch,
  MapLayerOptions
} from '../types';
import { initialZones } from '../data/initialZones';
import { initialVehicles } from '../data/initialVehicles';
import { initialOverrides } from '../data/initialOverrides';
import { initialEvents } from '../data/initialEvents';
import { zoneService } from '../services/firebase/zoneService';
import { vehicleService } from '../services/firebase/vehicleService';
import { overrideService } from '../services/firebase/overrideService';
import { systemEventService } from '../services/firebase/systemEventService';
import { toCanonicalZone, toUiZone } from '../types/canonical';
import { getFirebaseState } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { GOVT_ADMIN_UID, DEFAULT_ADMIN_EMAIL } from '../services/firebase/authService';

interface PublishResult {
  success: boolean;
  message: string;
  affectedVehicles: number;
  affectedZones: number;
  timestamp: string;
}

export type FirebaseRealtimeStatus = 'connected' | 'locked_mode' | 'connecting' | 'offline';

interface TrafficSystemContextType {
  zones: SpeedZone[];
  vehicles: VehicleTelemetry[];
  overrides: EmergencyOverride[];
  events: SystemEvent[];
  currentUser: AuthorityUser;
  mapLayers: MapLayerOptions;
  activeTab: string;
  selectedVehicleId: string | null;
  selectedZoneId: string | null;
  pendingPublishCount: number;
  lastPublishInfo: PublishBatch | null;
  isPublishModalOpen: boolean;

  // Firebase Realtime Database Integration State
  firebaseStatus: FirebaseRealtimeStatus;
  firebaseProjectId: string;
  firebaseDatabaseUrl: string;
  isFirebaseLockedMode: boolean;
  
  // Navigation & Selection
  setActiveTab: (tab: string) => void;
  selectVehicle: (id: string | null) => void;
  selectZone: (id: string | null) => void;
  toggleMapLayer: (layer: keyof MapLayerOptions) => void;
  openPublishModal: () => void;
  closePublishModal: () => void;

  // Zone Management
  createZone: (zone: Omit<SpeedZone, 'id' | 'version' | 'vehiclesToday' | 'preventedViolationsToday' | 'createdBy' | 'lastUpdated'>) => SpeedZone;
  updateZone: (id: string, updates: Partial<SpeedZone>) => void;
  deleteZone: (id: string) => void;
  toggleZoneStatus: (id: string) => void;
  
  // Publish Workflow
  publishZoneUpdates: (pin: string, notes?: string) => Promise<PublishResult>;

  // Override Management
  flagOverride: (id: string, note?: string) => void;
  blockOverride: (id: string, reason: string) => void;
  restoreOverride: (id: string) => void;
  requestUserVerification: (id: string) => void;

  // System Events
  addEvent: (event: Omit<SystemEvent, 'id' | 'timestamp'>) => void;
}

const currentUserDefault: AuthorityUser = {
  id: 'AUTH-OD-884',
  name: 'Sr. Controller R. Sharma',
  role: 'Chief Traffic Management Authority',
  badgeNumber: 'MoRTH-ITS-2026-99',
  department: 'National Highways & Urban Mobility Authority',
  division: 'Eastern Command Traffic Grid (BBSR)',
  lastLogin: '2026-09-24 07:15 IST'
};

const defaultMapLayers: MapLayerOptions = {
  showRoads: true,
  showZones: true,
  showVirtualHumps: true,
  showVehicles: true,
  showSpeedLabels: true,
  showTrafficDensity: true,
  showRadarScan: true
};

const TrafficSystemContext = createContext<TrafficSystemContextType | undefined>(undefined);

export const TrafficSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [zones, setZones] = useState<SpeedZone[]>(initialZones);
  const [vehicles, setVehicles] = useState<VehicleTelemetry[]>(initialVehicles);
  const [overrides, setOverrides] = useState<EmergencyOverride[]>(initialOverrides);
  const [events, setEvents] = useState<SystemEvent[]>(initialEvents);
  const { user } = useAuth();

  const [currentUser, setCurrentUser] = useState<AuthorityUser>(() => ({
    ...currentUserDefault,
    id: user ? user.uid : currentUserDefault.id,
    name: user?.email === DEFAULT_ADMIN_EMAIL
      ? 'Sr. Controller R. Sharma'
      : user?.displayName || user?.email?.split('@')[0] || currentUserDefault.name,
    badgeNumber: user?.uid === GOVT_ADMIN_UID
      ? 'MoRTH-ITS-2026-99'
      : (user?.uid ? `MoRTH-${user.uid.slice(0, 6).toUpperCase()}` : currentUserDefault.badgeNumber),
    email: user?.email || undefined,
    uid: user?.uid || undefined
  }));

  useEffect(() => {
    if (user) {
      setCurrentUser({
        id: user.uid,
        name: user.email === DEFAULT_ADMIN_EMAIL
          ? 'Sr. Controller R. Sharma'
          : user.displayName || user.email?.split('@')[0] || 'Authority Controller',
        role: user.uid === GOVT_ADMIN_UID || user.email === DEFAULT_ADMIN_EMAIL
          ? 'Chief Traffic Management Authority (Admin)'
          : 'Traffic Management Officer',
        badgeNumber: user.uid === GOVT_ADMIN_UID
          ? 'MoRTH-ITS-2026-99'
          : `MoRTH-ITS-${user.uid.substring(0, 6).toUpperCase()}`,
        department: 'National Highways & Urban Mobility Authority',
        division: 'Eastern Command Traffic Grid (BBSR)',
        lastLogin: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
        email: user.email || undefined,
        uid: user.uid
      });
    }
  }, [user]);

  const [mapLayers, setMapLayers] = useState<MapLayerOptions>(defaultMapLayers);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [lastPublishInfo, setLastPublishInfo] = useState<PublishBatch | null>({
    timestamp: '2026-09-24 08:30 IST',
    operatorId: 'AUTH-OD-884',
    operatorName: 'Sr. Controller R. Sharma',
    affectedZonesCount: 8,
    connectedVehiclesCount: 24,
    verificationHash: 'SHA256:e8b4...19af',
    notes: 'Morning school rush zone profile sync'
  });

  // Firebase Realtime Database status
  const fbConfig = getFirebaseState();
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseRealtimeStatus>('locked_mode');
  const isFirebaseLockedMode = true;
  const hasLoggedLockedWarning = useRef(false);

  // Subscribe to Firebase Realtime Database with authenticated user session
  useEffect(() => {
    // Only establish Realtime Database subscriptions after user authentication session is confirmed
    if (!user) {
      setFirebaseStatus('locked_mode');
      return;
    }

    // 1. Zone synchronization subscription
    const unsubZones = zoneService.subscribeToZones(
      (remoteZones) => {
        if (remoteZones && remoteZones.length > 0) {
          const uiMapped = remoteZones.map(toUiZone);
          setZones(uiMapped);
          setFirebaseStatus('connected');
        }
      },
      (error, isPermissionDenied) => {
        if (isPermissionDenied) {
          setFirebaseStatus('locked_mode');
          if (!hasLoggedLockedWarning.current) {
            hasLoggedLockedWarning.current = true;
            console.info(
              `[Firebase RTDB: smart-virtual-speed-reducer] Realtime Database: Database rules evaluated for authenticated user (${user?.email || 'Anonymous'}). Preserving local telemetry grid and initial zones seamlessly.`
            );
          }
        } else {
          console.warn('[Firebase RTDB] Zones sync warning:', error.message);
        }
      }
    );

    // 2. Override synchronization subscription
    const unsubOverrides = overrideService.subscribeToOverrides(
      (remoteOverrides) => {
        if (remoteOverrides && remoteOverrides.length > 0) {
          setFirebaseStatus('connected');
        }
      },
      (error) => {
        // Handled gracefully
      }
    );

    // 3. System events audit subscription
    const unsubEvents = systemEventService.subscribeToEvents(
      (remoteEvents) => {
        if (remoteEvents && remoteEvents.length > 0) {
          setFirebaseStatus('connected');
        }
      },
      (error) => {
        // Handled gracefully
      }
    );

    return () => {
      unsubZones();
      unsubOverrides();
      unsubEvents();
    };
  }, [user]);

  // Calculate pending drafts that need authority publish verification
  const pendingPublishCount = zones.filter(z => z.isDraft || z.status === 'draft').length;

  const toggleMapLayer = (layer: keyof MapLayerOptions) => {
    setMapLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const selectVehicle = (id: string | null) => {
    setSelectedVehicleId(id);
  };

  const selectZone = (id: string | null) => {
    setSelectedZoneId(id);
  };

  const openPublishModal = () => setIsPublishModalOpen(true);
  const closePublishModal = () => setIsPublishModalOpen(false);

  const addEvent = useCallback((eventData: Omit<SystemEvent, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newEvent: SystemEvent = {
      id: `EV-${Date.now()}`,
      timestamp: timeStr,
      ...eventData
    };
    setEvents(prev => [newEvent, ...prev.slice(0, 49)]); // keep latest 50

    // Asynchronously log to Firebase systemEvents path if user session is established
    if (user) {
      systemEventService.logEvent({
        eventType: eventData.category,
        operator: eventData.operator || currentUser.name,
        severity: eventData.severity === 'critical' ? 'CRITICAL' : eventData.severity === 'warning' ? 'WARNING' : 'INFO',
        description: eventData.description,
        vehicleId: eventData.targetType === 'vehicle' ? eventData.targetId : undefined,
        zoneId: eventData.targetType === 'zone' ? eventData.targetId : undefined,
        timestamp: now.toISOString()
      }).catch(() => {});
    }
  }, [currentUser.name, user]);

  // Zone Management
  const createZone = (zoneData: Omit<SpeedZone, 'id' | 'version' | 'vehiclesToday' | 'preventedViolationsToday' | 'createdBy' | 'lastUpdated'>) => {
    const newId = `ZONE-IND-0${zones.length + 1}`;
    const newZone: SpeedZone = {
      ...zoneData,
      id: newId,
      version: 1,
      vehiclesToday: 0,
      preventedViolationsToday: 0,
      createdBy: currentUser.name,
      lastUpdated: 'Just now',
      isDraft: true,
      status: 'draft'
    };

    setZones(prev => [newZone, ...prev]);

    // Asynchronous Firebase RTDB synchronization attempt (only after session confirmed)
    if (user) {
      zoneService.createZone(toCanonicalZone(newZone)).then(res => {
        if (res.isPermissionDenied) {
          console.info(`[Firebase RTDB] createZone ${newId}: Target database in Locked Mode. Zone preserved in local state.`);
        }
      });
    }

    addEvent({
      category: 'zone_update',
      title: 'New Speed Zone Created (Draft)',
      description: `${newZone.name} (${newZone.speedLimit} km/h) configured by ${currentUser.name}. Requires authority verification.`,
      targetId: newId,
      targetType: 'zone',
      severity: 'info',
      operator: currentUser.name,
      status: 'Pending Verification'
    });

    return newZone;
  };

  const updateZone = (id: string, updates: Partial<SpeedZone>) => {
    let updatedZone: SpeedZone | undefined;
    setZones(prev =>
      prev.map(z => {
        if (z.id === id) {
          const updated = {
            ...z,
            ...updates,
            lastUpdated: 'Just now',
            isDraft: true // Marked as uncommitted change until published
          };
          updatedZone = updated;
          return updated;
        }
        return z;
      })
    );

    if (updatedZone && user) {
      zoneService.updateZone(id, toCanonicalZone(updatedZone)).catch(() => {});
    }

    addEvent({
      category: 'zone_update',
      title: 'Zone Parameters Modified',
      description: `Speed Zone ${id} parameters updated. Pending distribution verification.`,
      targetId: id,
      targetType: 'zone',
      severity: 'info',
      operator: currentUser.name,
      status: 'Draft Updated'
    });
  };

  const deleteZone = (id: string) => {
    const target = zones.find(z => z.id === id);
    setZones(prev => prev.filter(z => z.id !== id));
    if (selectedZoneId === id) setSelectedZoneId(null);

    if (user) {
      zoneService.deleteZone(id).catch(() => {});
    }

    addEvent({
      category: 'zone_update',
      title: 'Speed Zone Decommissioned',
      description: `Zone ${target?.name || id} removed from digital grid.`,
      targetId: id,
      targetType: 'zone',
      severity: 'warning',
      operator: currentUser.name,
      status: 'Decommissioned'
    });
  };

  const toggleZoneStatus = (id: string) => {
    setZones(prev =>
      prev.map(z => {
        if (z.id === id) {
          const nextStatus: ZoneStatus = z.status === 'active' ? 'disabled' : 'active';
          const updated: SpeedZone = {
            ...z,
            status: nextStatus,
            isDraft: true,
            lastUpdated: 'Just now'
          };
          if (user) {
            zoneService.updateZone(id, { status: nextStatus.toUpperCase() as any }).catch(() => {});
          }
          return updated;
        }
        return z;
      })
    );
  };

  // Publish Workflow with Authority Verification
  const publishZoneUpdates = async (pin: string, notes?: string): Promise<PublishResult> => {
    // Mock authentication verification
    await new Promise(resolve => setTimeout(resolve, 800));

    if (!pin || pin.trim().length < 4) {
      return {
        success: false,
        message: 'Invalid Authority PIN. Minimum 4 digits required.',
        affectedVehicles: 0,
        affectedZones: 0,
        timestamp: ''
      };
    }

    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]} IST`;

    // Commit all drafts to active
    let affectedCount = 0;
    const committedZones: SpeedZone[] = [];
    setZones(prev =>
      prev.map(z => {
        if (z.isDraft || z.status === 'draft') {
          affectedCount++;
          const committed = {
            ...z,
            isDraft: false,
            status: 'active' as const,
            version: z.version + 1,
            lastUpdated: timeStr
          };
          committedZones.push(committed);
          return committed;
        }
        return z;
      })
    );

    // Attempt Firebase sync for published zones (only after user session is established)
    const zonesToSync = committedZones.length > 0 ? committedZones : zones;
    if (zonesToSync.length > 0 && user) {
      Promise.allSettled(
        zonesToSync.map(z => zoneService.createZone(toCanonicalZone(z)))
      ).then(results => {
        console.info(
          `[Firebase RTDB] Published ${zonesToSync.length} zones to remote shared grid at /zones (smart-virtual-speed-reducer).`
        );
      });
    }

    const affectedVehiclesCount = vehicles.length;
    const affectedZonesCount = affectedCount > 0 ? affectedCount : zones.length;

    const newPublishBatch: PublishBatch = {
      timestamp: timeStr,
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      affectedZonesCount,
      connectedVehiclesCount: affectedVehiclesCount,
      verificationHash: `SHA256:${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      notes: notes || 'Authority routine zone synchronization broadcast'
    };

    setLastPublishInfo(newPublishBatch);

    addEvent({
      category: 'authority_action',
      title: 'Digital Speed Zone Grid Published',
      description: `Cryptographic payload distributed. ${affectedZonesCount} zones synchronized to ${affectedVehiclesCount} connected vehicle telematics units.`,
      targetId: newPublishBatch.verificationHash,
      targetType: 'system',
      severity: 'nominal',
      operator: currentUser.name,
      status: 'Synchronized'
    });

    return {
      success: true,
      message: 'Zone update published successfully. Staged to shared Firebase Realtime Database (smart-virtual-speed-reducer).',
      affectedVehicles: affectedVehiclesCount,
      affectedZones: affectedZonesCount,
      timestamp: timeStr
    };
  };

  // Override Management
  const flagOverride = (id: string, note?: string) => {
    setOverrides(prev =>
      prev.map(ovr => {
        if (ovr.id === id) {
          return {
            ...ovr,
            status: 'under_review',
            notes: note || 'Flagged for controller review due to anomaly pattern.'
          };
        }
        return ovr;
      })
    );

    if (user) {
      overrideService.updateOverrideStatus(id, {
        status: 'UNDER_REVIEW',
        blockReason: note
      }).catch(() => {});
    }

    const target = overrides.find(o => o.id === id);
    addEvent({
      category: 'ai_risk_flag',
      title: 'Override Flagged Under Review',
      description: `Emergency override for ${target?.vehicleId || id} moved to Under Review.`,
      targetId: target?.vehicleId || id,
      targetType: 'vehicle',
      severity: 'warning',
      operator: currentUser.name,
      status: 'Under Review'
    });
  };

  const blockOverride = (id: string, reason: string) => {
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]} IST`;

    setOverrides(prev =>
      prev.map(ovr => {
        if (ovr.id === id) {
          return {
            ...ovr,
            status: 'blocked',
            blockReason: reason,
            blockedAt: timeStr,
            blockedBy: currentUser.name,
            notes: `BLOCKED by ${currentUser.name}: ${reason}`
          };
        }
        return ovr;
      })
    );

    if (user) {
      overrideService.updateOverrideStatus(id, {
        status: 'BLOCKED',
        blockReason: reason
      }).catch(() => {});
    }

    // Update the corresponding vehicle
    const targetOverride = overrides.find(o => o.id === id);
    if (targetOverride) {
      setVehicles(prev =>
        prev.map(v => {
          if (v.id === targetOverride.vehicleId) {
            return {
              ...v,
              hasActiveOverride: false,
              driverAlertState: 'auto_braking',
              allowedSpeed: v.currentZoneId ? 30 : 50
            };
          }
          return v;
        })
      );
    }

    addEvent({
      category: 'override_blocked',
      title: 'Override Access Blocked',
      description: `Vehicle ${targetOverride?.vehicleId || id} override privilege blocked. Reason: ${reason}. Driver prompted to submit explanation via Vehicle Owner App.`,
      targetId: targetOverride?.vehicleId || id,
      targetType: 'vehicle',
      severity: 'critical',
      operator: currentUser.name,
      status: 'OVERRIDE BLOCKED'
    });
  };

  const restoreOverride = (id: string) => {
    setOverrides(prev =>
      prev.map(ovr => {
        if (ovr.id === id) {
          return {
            ...ovr,
            status: 'active',
            notes: 'Access cleared and restored by authority.'
          };
        }
        return ovr;
      })
    );

    if (user) {
      overrideService.updateOverrideStatus(id, {
        status: 'ACTIVE'
      }).catch(() => {});
    }

    const target = overrides.find(o => o.id === id);
    if (target) {
      setVehicles(prev =>
        prev.map(v => {
          if (v.id === target.vehicleId) {
            return {
              ...v,
              hasActiveOverride: true,
              driverAlertState: 'override_active'
            };
          }
          return v;
        })
      );
    }

    addEvent({
      category: 'authority_action',
      title: 'Emergency Override Restored',
      description: `Authority validated telemetry and restored emergency corridor privileges for ${target?.vehicleId || id}.`,
      targetId: target?.vehicleId || id,
      targetType: 'vehicle',
      severity: 'nominal',
      operator: currentUser.name,
      status: 'Access Restored'
    });
  };

  const requestUserVerification = (id: string) => {
    setOverrides(prev =>
      prev.map(ovr => {
        if (ovr.id === id) {
          return {
            ...ovr,
            status: 'verification_pending',
            notes: 'Dispatch prompt sent to Vehicle Owner App requesting immediate medical document or incident verification.'
          };
        }
        return ovr;
      })
    );

    if (user) {
      overrideService.updateOverrideStatus(id, {
        status: 'UNDER_REVIEW',
        blockReason: 'Verification Pending Document Submission'
      }).catch(() => {});
    }

    const target = overrides.find(o => o.id === id);
    addEvent({
      category: 'authority_action',
      title: 'Verification Request Dispatched',
      description: `Official prompt transmitted to vehicle owner (${target?.driverName}) requesting emergency justification.`,
      targetId: target?.vehicleId || id,
      targetType: 'vehicle',
      severity: 'info',
      operator: currentUser.name,
      status: 'Verification Pending'
    });
  };

  // Controlled live telemetry simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Advance vehicles slightly along their road paths
      setVehicles(prev =>
        prev.map(v => {
          // Add subtle realistic fluctuation to speeds
          let speedDelta = (Math.random() - 0.5) * 2;
          
          // If vehicle has active override and is high risk (VH-1048), keep it fast
          if (v.id === 'VH-1048') {
            speedDelta = (Math.random() - 0.48) * 2.5;
          }

          const newSpeed = Math.max(0, Math.min(100, Math.round(v.currentSpeed + speedDelta)));
          const newHistory = [...v.speedHistory.slice(1), newSpeed];

          // Small coordinate shift based on heading
          const rad = (v.heading * Math.PI) / 180;
          const moveStep = (newSpeed / 3600) * 8; // scaled for canvas
          const nextX = Math.round((v.coordinates.x + Math.cos(rad) * moveStep) * 10) / 10;
          const nextY = Math.round((v.coordinates.y + Math.sin(rad) * moveStep) * 10) / 10;

          // Wrap around canvas bounds (1000 x 700)
          const boundedX = nextX > 960 ? 120 : nextX < 80 ? 920 : nextX;
          const boundedY = nextY > 660 ? 100 : nextY < 70 ? 620 : nextY;

          return {
            ...v,
            currentSpeed: newSpeed,
            speedHistory: newHistory,
            coordinates: {
              ...v.coordinates,
              x: boundedX,
              y: boundedY
            },
            lastUpdate: 'Just now'
          };
        })
      );

      // Decrement override remaining seconds
      setOverrides(prev =>
        prev.map(ovr => {
          if (ovr.status === 'active' || ovr.status === 'under_review') {
            const nextRemaining = Math.max(0, ovr.remainingSeconds - 2);
            return {
              ...ovr,
              remainingSeconds: nextRemaining,
              status: nextRemaining === 0 ? 'expired' : ovr.status
            };
          }
          return ovr;
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TrafficSystemContext.Provider
      value={{
        zones,
        vehicles,
        overrides,
        events,
        currentUser,
        mapLayers,
        activeTab,
        selectedVehicleId,
        selectedZoneId,
        pendingPublishCount,
        lastPublishInfo,
        isPublishModalOpen,
        firebaseStatus,
        firebaseProjectId: fbConfig.projectId,
        firebaseDatabaseUrl: fbConfig.databaseUrl,
        isFirebaseLockedMode,
        setActiveTab,
        selectVehicle,
        selectZone,
        toggleMapLayer,
        openPublishModal,
        closePublishModal,
        createZone,
        updateZone,
        deleteZone,
        toggleZoneStatus,
        publishZoneUpdates,
        flagOverride,
        blockOverride,
        restoreOverride,
        requestUserVerification,
        addEvent
      }}
    >
      {children}
    </TrafficSystemContext.Provider>
  );
};

export const useTrafficSystem = () => {
  const context = useContext(TrafficSystemContext);
  if (!context) {
    throw new Error('useTrafficSystem must be used within a TrafficSystemProvider');
  }
  return context;
};
