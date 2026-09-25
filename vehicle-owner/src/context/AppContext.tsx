/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  Vehicle,
  SpeedZone,
  ZoneEvent,
  EmergencyOverrideState,
  NotificationItem,
  MapSyncState,
  VerificationRequest,
  ConnectionState,
  AccessibilitySettings,
} from '../types';
import {
  vehicleService,
  overrideService,
  verificationService,
  activityService,
  notificationService,
  mapSyncService,
  INITIAL_VEHICLE,
  INITIAL_ZONES,
  INITIAL_EVENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_OVERRIDE_STATE,
  INITIAL_VERIFICATION_REQUEST,
  INITIAL_MAP_SYNC_STATE,
} from '../services/mockServices';
import {
  isFirebaseConfigured,
  subscribeToAuth,
  loginWithEmail,
  logoutUser,
  subscribeToLiveZones,
} from '../services/firebase';

export type DrivingScenario =
  | 'normal_cruise'
  | 'approaching_school'
  | 'inside_school_zone'
  | 'construction_zone'
  | 'emergency_mode';

interface AppContextType {
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Authentication
  currentUser: User | null;
  authLoading: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  firebaseConfigured: boolean;

  // Vehicle
  vehicle: Vehicle;
  refreshVehicle: () => Promise<void>;

  // Zones & Map
  zones: SpeedZone[];
  selectedZone: SpeedZone | null;
  setSelectedZone: (zone: SpeedZone | null) => void;
  isLiveFirebaseSync: boolean;
  zoneSyncError: string | null;

  // Driving Simulation & Telemetry
  scenario: DrivingScenario;
  setScenario: (scenario: DrivingScenario) => void;
  currentSpeed: number;
  setCurrentSpeed: (speed: number) => void;
  allowedSpeed: number;
  distanceToZone: number;
  remainingInZone: number;
  roadName: string;
  connectionState: ConnectionState;
  setConnectionState: (state: ConnectionState) => void;

  // Emergency Override
  overrideState: EmergencyOverrideState;
  activateOverride: (reason: string, explanation?: string) => Promise<void>;
  endOverride: () => Promise<void>;
  flagOverrideActivity: () => Promise<void>;
  simulateBlockedState: () => Promise<void>;
  resetOverrideState: () => Promise<void>;

  // Verification
  verificationRequest: VerificationRequest;
  submitVerification: (explanation: string, attachmentName?: string) => Promise<void>;
  updateVerificationStatus: (status: VerificationRequest['status']) => Promise<void>;

  // Activity Events
  events: ZoneEvent[];
  activityCategory: string;
  setActivityCategory: (cat: string) => void;
  refreshEvents: () => Promise<void>;

  // Notifications
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  isNotifOpen: boolean;
  setIsNotifOpen: (open: boolean) => void;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Map Sync
  mapSyncState: MapSyncState;
  triggerMapSync: () => Promise<void>;
  isSyncing: boolean;

  // Accessibility
  accessibility: AccessibilitySettings;
  updateAccessibility: (key: keyof AccessibilitySettings, val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('home');

  // Firebase Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [firebaseConfigured, setFirebaseConfigured] = useState<boolean>(isFirebaseConfigured());

  // Vehicle
  const [vehicle, setVehicle] = useState<Vehicle>(INITIAL_VEHICLE);

  // Zones (Initialized with fallback, seamlessly updated from Firebase Realtime Database)
  const [zones, setZones] = useState<SpeedZone[]>(INITIAL_ZONES);
  const [selectedZone, setSelectedZone] = useState<SpeedZone | null>(INITIAL_ZONES[0]);
  const [isLiveFirebaseSync, setIsLiveFirebaseSync] = useState<boolean>(false);
  const [zoneSyncError, setZoneSyncError] = useState<string | null>(null);

  // Telemetry & Driving scenario
  const [scenario, setScenarioState] = useState<DrivingScenario>('approaching_school');
  const [currentSpeed, setCurrentSpeed] = useState<number>(48);
  const [allowedSpeed, setAllowedSpeed] = useState<number>(30);
  const [distanceToZone, setDistanceToZone] = useState<number>(420);
  const [remainingInZone, setRemainingInZone] = useState<number>(900);
  const [roadName, setRoadName] = useState<string>('Janpath Avenue, Sector 4');
  const [connectionState, setConnectionState] = useState<ConnectionState>('connected');

  // Emergency Override
  const [overrideState, setOverrideState] = useState<EmergencyOverrideState>(INITIAL_OVERRIDE_STATE);

  // Verification
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest>(INITIAL_VERIFICATION_REQUEST);

  // Activity Events
  const [events, setEvents] = useState<ZoneEvent[]>(INITIAL_EVENTS);
  const [activityCategory, setActivityCategory] = useState<string>('all');

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);

  // Map Sync
  const [mapSyncState, setMapSyncState] = useState<MapSyncState>(INITIAL_MAP_SYNC_STATE);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Accessibility
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    colorBlindMode: false,
    highContrast: false,
    largerText: false,
    reducedMotion: false,
  });

  // Track previous speed limits to inform the driver if Government updates it live
  const prevZoneSpeedRef = useRef<number | null>(null);

  // 1. Firebase Authentication Listener (Session Persistence)
  useEffect(() => {
    setFirebaseConfigured(isFirebaseConfigured());

    if (!isFirebaseConfigured()) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        setAuthError(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Realtime Database `/zones` Listener (Strictly READ-ONLY)
  // Automatically updates zones in state when Government Control App updates Firebase
  useEffect(() => {
    if (!currentUser || !isFirebaseConfigured()) {
      setIsLiveFirebaseSync(false);
      return;
    }

    setConnectionState('syncing');

    const unsubscribe = subscribeToLiveZones(
      (liveZones) => {
        setConnectionState('connected');
        setZoneSyncError(null);

        if (liveZones && liveZones.length > 0) {
          setIsLiveFirebaseSync(true);
          setZones(liveZones);

          // Find ZN-010 if present, or maintain selected zone
          const targetZone =
            liveZones.find((z) => z.id === 'ZN-010') ||
            (selectedZone ? liveZones.find((z) => z.id === selectedZone.id) : null) ||
            liveZones[0];

          if (targetZone) {
            setSelectedZone(targetZone);

            // LIVE SPEED SYNCHRONIZATION:
            // If the vehicle is currently in an active or approaching zone,
            // update allowedSpeed automatically without page reload!
            if (scenario === 'approaching_school' || scenario === 'inside_school_zone') {
              setAllowedSpeed(targetZone.speedLimit);
              setRoadName(targetZone.roadName);
            }

            // Check if speed limit changed live from Government App (e.g. from 30 to 25)
            if (
              prevZoneSpeedRef.current !== null &&
              prevZoneSpeedRef.current !== targetZone.speedLimit
            ) {
              const oldSpeed = prevZoneSpeedRef.current;
              const newSpeed = targetZone.speedLimit;

              // Post instant activity event & notification
              const alertTitle = `Live Speed Limit Updated: ${newSpeed} km/h`;
              const alertMsg = `Government Safety Gateway updated ${targetZone.name} limit from ${oldSpeed} km/h to ${newSpeed} km/h.`;

              activityService.addEvent({
                category: 'zones',
                title: alertTitle,
                description: alertMsg,
                speedLimit: newSpeed,
                zoneName: targetZone.name,
                severity: 'notice',
                iconType: 'zone',
              }).then((newEvt) => {
                setEvents((prev) => [newEvt, ...prev]);
              });

              setNotifications((prev) => [
                {
                  id: `NOTIF-${Date.now()}`,
                  category: 'zone',
                  title: alertTitle,
                  message: alertMsg,
                  timestamp: 'Just now',
                  read: false,
                  severity: 'notice',
                },
                ...prev,
              ]);
            }
            prevZoneSpeedRef.current = targetZone.speedLimit;
          }

          // Update Map Sync Information with real count
          const permCount = liveZones.filter((z) => z.type !== 'temporary' && z.type !== 'construction').length;
          const tempCount = liveZones.length - permCount;
          setMapSyncState((prev) => ({
            ...prev,
            totalZones: liveZones.length,
            permanentZones: permCount,
            temporaryZones: tempCount,
            lastUpdated: 'Live Connected (Firebase RTDB)',
            syncStatus: 'up_to_date',
          }));
        } else {
          // Empty zone data gracefully handled
          setIsLiveFirebaseSync(true);
        }
      },
      (error) => {
        console.error('Firebase Realtime Database error:', error);
        setZoneSyncError(error.message || 'Error subscribing to /zones');
        if (error.message && error.message.includes('PERMISSION_DENIED')) {
          setZoneSyncError('Permission Denied on Realtime Database: Authenticated READ required.');
        }
        setConnectionState('limited');
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser, scenario]);

  // Auth Operations
  const login = async (email: string, pass: string) => {
    const user = await loginWithEmail(email, pass);
    setCurrentUser(user);
    setAuthError(null);
  };

  const logout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setIsLiveFirebaseSync(false);
  };

  // Handle Scenario Transitions
  const setScenario = (newScenario: DrivingScenario) => {
    setScenarioState(newScenario);
    const activeTarget = zones.find((z) => z.id === 'ZN-010') || zones[0];
    const targetLimit = activeTarget ? activeTarget.speedLimit : 30;

    switch (newScenario) {
      case 'normal_cruise':
        setCurrentSpeed(50);
        setAllowedSpeed(50);
        setDistanceToZone(1400);
        setRemainingInZone(0);
        setRoadName('Mahatma Gandhi Marg');
        break;
      case 'approaching_school':
        setCurrentSpeed(48);
        setAllowedSpeed(targetLimit);
        setDistanceToZone(420);
        setRemainingInZone(activeTarget ? activeTarget.controlledRangeMeters : 900);
        setRoadName(activeTarget ? activeTarget.roadName : 'Janpath Avenue, Sector 4');
        break;
      case 'inside_school_zone':
        setCurrentSpeed(targetLimit);
        setAllowedSpeed(targetLimit);
        setDistanceToZone(0);
        setRemainingInZone(620);
        setRoadName(activeTarget ? `${activeTarget.roadName} (Controlled Zone)` : 'Janpath Avenue (School Frontage)');
        break;
      case 'construction_zone':
        setCurrentSpeed(38);
        setAllowedSpeed(25);
        setDistanceToZone(280);
        setRemainingInZone(450);
        setRoadName('Cuttack-Puri Bypass (NH-16 Link)');
        break;
      case 'emergency_mode':
        setCurrentSpeed(62);
        setAllowedSpeed(targetLimit); // Note: suspended restriction
        setDistanceToZone(150);
        setRemainingInZone(600);
        setRoadName('Sachivalaya Marg (Hospital Corridor)');
        break;
    }
  };

  // Live Timer for Active Emergency Override
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (overrideState.status === 'active' && overrideState.remainingSeconds > 0) {
      interval = setInterval(() => {
        setOverrideState((prev) => {
          if (prev.remainingSeconds <= 1) {
            // Auto Expire
            activityService.addEvent({
              category: 'emergency',
              title: 'Emergency Override Ended',
              description: 'Time limit reached (02:00:00). Normal speed-zone restrictions automatically restored.',
              severity: 'normal',
              iconType: 'override',
            });
            return {
              ...prev,
              status: 'expired',
              remainingSeconds: 0,
              monitoringActive: false,
            };
          }
          return {
            ...prev,
            remainingSeconds: prev.remainingSeconds - 1,
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [overrideState.status, overrideState.remainingSeconds]);

  // Emergency Actions (Local state, no writes to /overrides or /telemetry as requested)
  const activateOverride = async (reason: string, explanation?: string) => {
    const updated = await overrideService.activateOverride(reason, explanation);
    setOverrideState(updated);
    setScenario('emergency_mode');

    // Add activity event
    const newEvent = await activityService.addEvent({
      category: 'emergency',
      title: 'Emergency Override Activated',
      description: `Declared: ${reason}. Virtual speed restrictions suspended. Full government telemetry active.`,
      severity: 'notice',
      iconType: 'override',
    });
    setEvents((prev) => [newEvent, ...prev]);

    // Add notification
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      category: 'emergency',
      title: 'Emergency Override Active',
      message: `Restriction suspended (${reason}). Government monitoring active. Auto-expires in 2 hrs.`,
      timestamp: 'Just now',
      read: false,
      severity: 'warning',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const endOverride = async () => {
    const updated = await overrideService.endOverride();
    setOverrideState(updated);
    setScenario('approaching_school');

    const newEvent = await activityService.addEvent({
      category: 'emergency',
      title: 'Emergency Override Concluded by Driver',
      description: 'Standard virtual speed-zone operation restored across all safety zones.',
      severity: 'normal',
      iconType: 'override',
    });
    setEvents((prev) => [newEvent, ...prev]);
  };

  const flagOverrideActivity = async () => {
    const updated = await overrideService.flagOverrideActivity();
    setOverrideState(updated);

    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      category: 'emergency',
      title: 'Activity Flagged for Review',
      message: 'AI safety monitoring noted unusual telemetry outside typical emergency routing.',
      timestamp: 'Just now',
      read: false,
      severity: 'warning',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const simulateBlockedState = async () => {
    const updated = await overrideService.simulateBlockedState();
    setOverrideState(updated);
    setActiveTab('emergency');
  };

  const resetOverrideState = async () => {
    const updated = await overrideService.resetToIdle();
    setOverrideState(updated);
  };

  // Verification Actions
  const submitVerification = async (explanation: string, attachmentName?: string) => {
    const res = await verificationService.submitVerification(explanation, attachmentName);
    setVerificationRequest(res);

    const newEvent = await activityService.addEvent({
      category: 'system',
      title: 'Verification Submitted for Review',
      description: `Dispute filed with attached documentation (${res.attachmentName || 'Statement.pdf'}). Awaiting RSA review.`,
      severity: 'notice',
      iconType: 'system',
    });
    setEvents((prev) => [newEvent, ...prev]);
  };

  const updateVerificationStatus = async (status: VerificationRequest['status']) => {
    const res = await verificationService.setReviewStatus(status);
    setVerificationRequest(res);
    if (status === 'approved' || status === 'access_restored') {
      await overrideService.resetToIdle();
      setOverrideState((prev) => ({ ...prev, status: 'idle', flaggedForReview: false }));
    }
  };

  // Map Sync Action
  const triggerMapSync = async () => {
    setIsSyncing(true);
    setMapSyncState((prev) => ({ ...prev, syncStatus: 'syncing', syncProgress: 20 }));

    await new Promise((res) => setTimeout(res, 400));
    setMapSyncState((prev) => ({ ...prev, syncProgress: 60 }));

    await new Promise((res) => setTimeout(res, 500));
    setMapSyncState((prev) => ({ ...prev, syncProgress: 90 }));

    const updated = await mapSyncService.triggerSync();
    setMapSyncState(updated);
    setIsSyncing(false);

    const newEvent = await activityService.addEvent({
      category: 'system',
      title: 'Local Speed-Zone Map Synchronized',
      description: `Downloaded delta update: ${updated.totalZones} zones verified for ${updated.region}.`,
      severity: 'normal',
      iconType: 'sync',
    });
    setEvents((prev) => [newEvent, ...prev]);
  };

  // Notifications Actions
  const markNotificationRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const refreshVehicle = async () => {
    const v = await vehicleService.getVehicle();
    setVehicle(v);
  };

  const refreshEvents = async () => {
    const ev = await activityService.getEvents(activityCategory);
    setEvents(ev);
  };

  const updateAccessibility = (key: keyof AccessibilitySettings, val: boolean) => {
    setAccessibility((prev) => {
      const next = { ...prev, [key]: val };
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (key === 'highContrast') root.classList.toggle('high-contrast', val);
        if (key === 'largerText') root.classList.toggle('larger-text', val);
        if (key === 'reducedMotion') root.classList.toggle('reduced-motion', val);
      }
      return next;
    });
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentUser,
        authLoading,
        authError,
        setAuthError,
        login,
        logout,
        firebaseConfigured,
        vehicle,
        refreshVehicle,
        zones,
        selectedZone,
        setSelectedZone,
        isLiveFirebaseSync,
        zoneSyncError,
        scenario,
        setScenario,
        currentSpeed,
        setCurrentSpeed,
        allowedSpeed,
        distanceToZone,
        remainingInZone,
        roadName,
        connectionState,
        setConnectionState,
        overrideState,
        activateOverride,
        endOverride,
        flagOverrideActivity,
        simulateBlockedState,
        resetOverrideState,
        verificationRequest,
        submitVerification,
        updateVerificationStatus,
        events,
        activityCategory,
        setActivityCategory,
        refreshEvents,
        notifications,
        unreadNotifsCount,
        isNotifOpen,
        setIsNotifOpen,
        markNotificationRead,
        markAllNotificationsRead,
        mapSyncState,
        triggerMapSync,
        isSyncing,
        accessibility,
        updateAccessibility,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
