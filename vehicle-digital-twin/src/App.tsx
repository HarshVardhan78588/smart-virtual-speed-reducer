import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  DisplayMode,
  VehicleState,
  VehicleType,
  ZoneReason,
  ZoneType,
  HardwareSignalLog,
  SpeedZone,
} from './types/vehicle';
import { SCENARIO_PRESETS, MOCK_ZONES } from './data/mockScenarios';
import { FirebaseSyncState, FirebaseZonesDictionary } from './types/firebase';
import {
  subscribeToAuthState,
  subscribeToZones,
  logoutVehicleUser,
  getFirebaseConfig,
} from './services/firebase';
import { mapFirebaseRecordToSpeedZone } from './utils/zoneMapper';
import { useSoundAlert } from './hooks/useSoundAlert';
import { VehicleAuthScreen } from './components/Auth/VehicleAuthScreen';
import { IntegratedDashboard } from './components/IntegratedDisplay/IntegratedDashboard';
import { RetrofitDashboard } from './components/RetrofitDisplay/RetrofitDashboard';
import { TwoWheelerDashboard } from './components/TwoWheelerDisplay/TwoWheelerDashboard';
import { SimulationDrawer } from './components/SimulationControls/SimulationDrawer';
import {
  ShieldCheck,
  Cpu,
  Car,
  Bike,
  Volume2,
  VolumeX,
  LogOut,
  Database,
  Radio,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { User } from 'firebase/auth';

export default function App() {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('integrated');
  const { isMuted, setIsMuted, playChime, visualNotice } = useSoundAlert();

  // Firebase Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Firebase Realtime Database /zones state
  const [firebaseSyncState, setFirebaseSyncState] = useState<FirebaseSyncState>('idle');
  const [firebaseZonesDict, setFirebaseZonesDict] = useState<FirebaseZonesDictionary | null>(null);
  const [firebaseLiveZone, setFirebaseLiveZone] = useState<SpeedZone | null>(null);

  // Unified Underlying Vehicle State (Shared by ALL three display configurations)
  const [state, setState] = useState<VehicleState>({
    vehicleType: 'car',
    vehicleName: 'EcoCruiser Alpha-4',
    vehicleId: 'VIN-SVSR-2026-9921',
    currentSpeed: 48,
    targetSpeed: 48,
    allowedSpeed: 25, // default initialized, overridden immediately by Firebase /zones/ZN-010
    baselineSpeedLimit: 50,
    distanceToZone: 450,
    zoneRemaining: 1000,
    isInsideZone: false,
    currentZone: null,
    upcomingZone: null,
    sensors: {
      gps: 'active',
      imu: 'active',
      camera: 'ready',
      localMap: 'synced',
      comm: 'connected',
    },
    map: {
      version: '2026.09.25-FIREBASE-SYNC',
      district: 'Central Metro District 04',
      storedZones: 1,
      temporaryZones: 0,
      lastSync: 'Live',
      status: 'synced',
    },
    override: {
      status: 'inactive',
      timeRemaining: 7182, // 01:59:42 in seconds
      monitoring: 'STANDBY',
      gpsTracked: true,
      speedMonitored: true,
      imuTracked: true,
      routeMonitored: true,
    },
    controlledSpeedActive: false,
    decelerationStepText: '52 → 48 → 43 → 37 → 25 km/h',
    audioAlert: null,
    recentSignals: [
      {
        id: 'sig-001',
        timestamp: '14:28:10',
        source: 'GNSS_RECEIVER',
        signal: 'GEO_FENCE_QUERY',
        payload: 'LAT: 12.9716, LNG: 77.5946 [LOCK]',
        status: 'processed',
      },
    ],
    autoDrive: true,
  });

  // Signal Logger Helper
  const logHardwareSignal = useCallback(
    (source: HardwareSignalLog['source'], signal: string, payload: string) => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const newLog: HardwareSignalLog = {
        id: 'sig-' + Math.random().toString(36).substring(2, 8),
        timestamp: timeStr,
        source,
        signal,
        payload,
        status: 'processed',
      };
      setState((prev) => ({
        ...prev,
        recentSignals: [newLog, ...prev.recentSignals.slice(0, 15)],
      }));
    },
    []
  );

  // 1. Firebase Authentication Listener
  useEffect(() => {
    const config = getFirebaseConfig();
    if (!config) {
      setIsLoadingAuth(false);
      return;
    }

    const unsubscribe = subscribeToAuthState((user) => {
      setCurrentUser(user);
      setIsLoadingAuth(false);
      if (user) {
        logHardwareSignal(
          'COMMUNICATION_MODULE',
          'FIREBASE_AUTH_SUCCESS',
          `Vehicle: ${user.email} [UID: ${user.uid.slice(0, 8)}...]`
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [logHardwareSignal]);

  // 2. Firebase Realtime Database /zones Subscription (STRICTLY READ ONLY)
  useEffect(() => {
    if (!currentUser) {
      setFirebaseSyncState('idle');
      return;
    }

    setFirebaseSyncState('connecting');

    const unsubscribe = subscribeToZones(
      (zonesDict) => {
        setFirebaseZonesDict(zonesDict);

        if (!zonesDict || Object.keys(zonesDict).length === 0) {
          setFirebaseSyncState('empty');
          return;
        }

        setFirebaseSyncState('live_synced');

        // Look specifically for /zones/ZN-010 as instructed
        if (zonesDict['ZN-010']) {
          const zn010Record = zonesDict['ZN-010'];
          const parsedZone = mapFirebaseRecordToSpeedZone('ZN-010', zn010Record, 450);

          setFirebaseLiveZone(parsedZone);

          // Update vehicle state with live Firebase data
          setState((prev) => {
            const nextSpeedLimit = parsedZone.allowedSpeed;
            return {
              ...prev,
              allowedSpeed: nextSpeedLimit,
              upcomingZone: prev.isInsideZone ? null : parsedZone,
              currentZone: prev.isInsideZone ? parsedZone : null,
              map: {
                ...prev.map,
                storedZones: Object.keys(zonesDict).length,
                version: '2026.09.25-FIREBASE-LIVE',
                lastSync: 'Just now (Realtime /zones)',
                status: 'synced',
              },
            };
          });

          logHardwareSignal(
            'CAN_BUS',
            'RTDB_ZONE_SYNC_RECEIVED',
            `Path: /zones/ZN-010 | Name: "${zn010Record.name}" | Limit: ${zn010Record.speedLimit} km/h | Reason: "${zn010Record.reason}"`
          );
        } else {
          // If ZN-010 not found, pick the first available active zone
          const firstKey = Object.keys(zonesDict)[0];
          const firstRecord = zonesDict[firstKey];
          const parsed = mapFirebaseRecordToSpeedZone(firstKey, firstRecord, 450);
          setFirebaseLiveZone(parsed);
          setState((prev) => ({
            ...prev,
            allowedSpeed: parsed.allowedSpeed,
            upcomingZone: prev.isInsideZone ? null : parsed,
            currentZone: prev.isInsideZone ? parsed : null,
            map: {
              ...prev.map,
              storedZones: Object.keys(zonesDict).length,
            },
          }));
        }
      },
      (error) => {
        const msg = error.message || '';
        if (msg.toLowerCase().includes('permission_denied')) {
          setFirebaseSyncState('permission_denied');
        } else {
          setFirebaseSyncState('error');
        }
        logHardwareSignal(
          'COMMUNICATION_MODULE',
          'RTDB_ZONE_SYNC_ERROR',
          `Error reading /zones: ${msg}`
        );
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser, logHardwareSignal]);

  // Sync Vehicle Type with Display Mode
  useEffect(() => {
    if (displayMode === 'two_wheeler') {
      setState((prev) => ({
        ...prev,
        vehicleType: 'motorcycle',
        vehicleName: 'VoltRider Urban M1',
      }));
    } else {
      setState((prev) => ({
        ...prev,
        vehicleType: 'car',
        vehicleName: 'EcoCruiser Alpha-4',
      }));
    }
  }, [displayMode]);

  // Main Simulation Physics & Auto-Drive Loop
  const lastTickRef = useRef<number>(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setState((prev) => {
        let {
          currentSpeed,
          distanceToZone,
          zoneRemaining,
          isInsideZone,
          autoDrive,
          override,
        } = prev;

        // 1. Handle Emergency Override Countdown
        let nextOverride = { ...override };
        if (override.status === 'active') {
          const nextTime = Math.max(0, override.timeRemaining - Math.round(dt));
          nextOverride.timeRemaining = nextTime;
          nextOverride.monitoring = 'ACTIVE';
        }

        if (!autoDrive) {
          return {
            ...prev,
            override: nextOverride,
          };
        }

        // 2. Auto-Drive Movement calculation
        const metersPerSec = currentSpeed / 3.6;
        const distMoved = metersPerSec * dt;

        // Controlled Speed Deceleration Response
        let nextSpeed = currentSpeed;
        let isControlled = false;

        if (override.status === 'active') {
          // Driver has full override speed control
          isControlled = false;
        } else if (!isInsideZone && distanceToZone <= 380 && currentSpeed > prev.allowedSpeed) {
          // Gradual controlled deceleration curve
          isControlled = true;
          const decel = 3.5 * dt; // km/h per second
          nextSpeed = Math.max(prev.allowedSpeed, currentSpeed - decel);
        } else if (isInsideZone && currentSpeed > prev.allowedSpeed) {
          isControlled = true;
          const decel = 4.0 * dt;
          nextSpeed = Math.max(prev.allowedSpeed, currentSpeed - decel);
        } else if (!isInsideZone && distanceToZone > 400 && currentSpeed < prev.baselineSpeedLimit) {
          // Cruise up to road baseline
          nextSpeed = Math.min(prev.baselineSpeedLimit, currentSpeed + 2.5 * dt);
        }

        // 3. Zone Transition Logic
        let nextDist = distanceToZone;
        let nextZoneRemaining = zoneRemaining;
        let nextInside = isInsideZone;

        if (!isInsideZone) {
          if (prev.upcomingZone) {
            nextDist = Math.max(0, distanceToZone - distMoved);
            if (nextDist <= 0) {
              // Enter zone!
              nextInside = true;
              nextZoneRemaining = prev.upcomingZone.length;
              playChime('enter');
            }
          }
        } else {
          // Inside active zone
          nextZoneRemaining = Math.max(0, zoneRemaining - distMoved);
          if (nextZoneRemaining <= 0) {
            // Exited zone!
            nextInside = false;
            nextDist = 600; // Next upcoming zone distance
            playChime('beep');
          }
        }

        return {
          ...prev,
          currentSpeed: nextSpeed,
          distanceToZone: nextDist,
          zoneRemaining: nextZoneRemaining,
          isInsideZone: nextInside,
          controlledSpeedActive: isControlled,
          override: nextOverride,
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [playChime]);

  // Audio Alerts on Approach Thresholds
  const prevDistRef = useRef(state.distanceToZone);
  useEffect(() => {
    if (state.distanceToZone <= 300 && prevDistRef.current > 300 && !state.isInsideZone) {
      playChime('approach');
    }
    prevDistRef.current = state.distanceToZone;
  }, [state.distanceToZone, state.isInsideZone, playChime]);

  // ---------------------------------------------
  // Scenario & Control Handlers
  // ---------------------------------------------
  const handleApplyScenario = (presetId: string) => {
    const preset = SCENARIO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    playChime('click');
    logHardwareSignal('CONTROLLER_LOGIC', 'APPLY_SCENARIO_PRESET', `Preset: ${preset.title}`);

    setState((prev) => ({
      ...prev,
      currentSpeed: preset.speed,
      targetSpeed: preset.speed,
      allowedSpeed: preset.allowed,
      distanceToZone: preset.distance,
      isInsideZone: preset.distance === 0 && preset.zone !== null,
      zoneRemaining: preset.zone ? preset.zone.length : 0,
      upcomingZone: preset.distance > 0 ? preset.zone : null,
      currentZone: preset.distance === 0 ? preset.zone : null,
      controlledSpeedActive: false,
      override: {
        ...prev.override,
        status: preset.overrideStatus || 'inactive',
      },
    }));
  };

  const handleApplyFirebaseLiveZone = () => {
    if (!firebaseLiveZone) return;
    playChime('click');
    logHardwareSignal(
      'CONTROLLER_LOGIC',
      'APPLY_FIREBASE_ZONE_TO_CONTROLLER',
      `Target: ${firebaseLiveZone.id} (${firebaseLiveZone.name}) · Limit: ${firebaseLiveZone.allowedSpeed} km/h`
    );

    setState((prev) => ({
      ...prev,
      allowedSpeed: firebaseLiveZone.allowedSpeed,
      distanceToZone: 450,
      isInsideZone: false,
      zoneRemaining: firebaseLiveZone.length,
      upcomingZone: firebaseLiveZone,
      currentZone: null,
      controlledSpeedActive: false,
    }));
  };

  const handleRefreshFirebaseZones = () => {
    playChime('click');
    logHardwareSignal('COMMUNICATION_MODULE', 'REFRESH_RTDB_SUBSCRIPTION', 'Subscribed to /zones');
  };

  const handleUpdateSpeed = (speed: number) => {
    setState((prev) => ({ ...prev, currentSpeed: speed, targetSpeed: speed }));
  };

  const handleUpdateAllowedSpeed = (allowed: number) => {
    setState((prev) => ({ ...prev, allowedSpeed: allowed }));
  };

  const handleUpdateDistance = (dist: number) => {
    setState((prev) => ({
      ...prev,
      distanceToZone: dist,
      isInsideZone: dist === 0,
    }));
  };

  const handleUpdateZoneType = (type: ZoneType) => {
    setState((prev) => {
      const active = prev.upcomingZone || prev.currentZone || MOCK_ZONES.school;
      const updated = { ...active, type };
      return {
        ...prev,
        upcomingZone: prev.upcomingZone ? updated : null,
        currentZone: prev.currentZone ? updated : null,
      };
    });
  };

  const handleUpdateZoneReason = (reason: ZoneReason) => {
    setState((prev) => {
      const active = prev.upcomingZone || prev.currentZone || MOCK_ZONES.school;
      const updated = { ...active, reason };
      return {
        ...prev,
        upcomingZone: prev.upcomingZone ? updated : null,
        currentZone: prev.currentZone ? updated : null,
      };
    });
  };

  const handleToggleAutoDrive = () => {
    playChime('click');
    setState((prev) => ({ ...prev, autoDrive: !prev.autoDrive }));
  };

  // Emergency Override Flow
  const handleEmergencyRequest = () => {
    playChime('override');
    logHardwareSignal('CONTROLLER_LOGIC', 'OVERRIDE_REQUESTED', 'User prompted confirmation');
    setState((prev) => ({
      ...prev,
      override: { ...prev.override, status: 'requested' },
    }));
  };

  const handleEmergencyConfirm = () => {
    playChime('override');
    logHardwareSignal('CAN_BUS', 'EMERGENCY_ACTIVE_BROADCAST', 'Speed restriction suspended; telemetry streaming');
    setState((prev) => ({
      ...prev,
      override: {
        ...prev.override,
        status: 'active',
        timeRemaining: 7200,
        monitoring: 'ACTIVE',
      },
    }));
  };

  const handleEmergencyEnd = () => {
    playChime('click');
    logHardwareSignal('CAN_BUS', 'EMERGENCY_DEACTIVATED', 'Vehicle returning to standard zone policy');
    setState((prev) => ({
      ...prev,
      override: { ...prev.override, status: 'inactive', monitoring: 'STANDBY' },
    }));
  };

  const handleEmergencyBlock = () => {
    playChime('beep');
    logHardwareSignal('COMMUNICATION_MODULE', 'OVERRIDE_BLOCK_DIRECTIVE', 'Safety compliance hold received');
    setState((prev) => ({
      ...prev,
      override: {
        ...prev.override,
        status: 'blocked',
        blockedReason: 'Safety review required. Please check Vehicle Owner App.',
      },
    }));
  };

  // Physical Button Handler (For Retrofit & Two-Wheeler)
  const handlePhysicalButtonPress = () => {
    playChime('click');
    logHardwareSignal('PHYSICAL_BUTTON', 'GPIO_INTERRUPT_TRIGGER', 'Direct hardware circuit closure');

    if (state.override.status === 'active') {
      handleEmergencyEnd();
    } else if (state.override.status === 'blocked') {
      playChime('beep');
    } else {
      setTimeout(() => {
        handleEmergencyConfirm();
      }, 200);
    }
  };

  // OTA Map Update Simulation
  const handleSimulateMapUpdate = () => {
    playChime('click');
    logHardwareSignal('COMMUNICATION_MODULE', 'OTA_MAP_UPDATE_INITIATED', 'Requesting differential zone packet');

    setState((prev) => ({
      ...prev,
      map: { ...prev.map, status: 'checking' },
    }));

    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        map: { ...prev.map, status: 'downloading' },
      }));
    }, 900);

    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        map: { ...prev.map, status: 'validating' },
      }));
    }, 1800);

    setTimeout(() => {
      playChime('beep');
      logHardwareSignal('LOCAL_DATABASE', 'MAP_CRYPTO_VERIFIED', 'OTA sync committed to flash memory');
      setState((prev) => ({
        ...prev,
        map: {
          ...prev.map,
          version: '2026.09.25-FIREBASE-LIVE',
          status: 'synced',
        },
      }));
    }, 2800);
  };

  const handleLogout = async () => {
    try {
      await logoutVehicleUser();
      setCurrentUser(null);
    } catch {
      // Ignore
    }
  };

  // If not authenticated, show VehicleAuthScreen
  if (!currentUser) {
    return (
      <VehicleAuthScreen
        onAuthenticated={() => {}}
        isLoadingAuth={isLoadingAuth}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-slate-800 flex flex-col justify-between">
      {/* 1. Universal Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-40">
        {/* Zone 1: Single Wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-black text-sm shadow-xs">
            SV
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
              Smart Virtual Speed Reducer
            </div>
            <div className="text-[11px] text-slate-500 font-medium leading-none">
              In-Vehicle Driver Interface &amp; Digital Twin
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation & Live Firebase Status */}
        <nav className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-600">
          {/* Live Firebase RTDB Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800">
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <span>RTDB /zones:</span>
            {firebaseSyncState === 'live_synced' ? (
              <span className="font-bold text-teal-900 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {firebaseLiveZone ? `${firebaseLiveZone.id} (${firebaseLiveZone.allowedSpeed} km/h)` : 'LIVE'}
              </span>
            ) : firebaseSyncState === 'connecting' ? (
              <span className="text-slate-500">Connecting...</span>
            ) : (
              <span className="text-amber-700">{firebaseSyncState}</span>
            )}
          </div>

          <span className="text-slate-300">·</span>

          {/* Authenticated Device Identity */}
          <div className="flex items-center gap-1.5 text-slate-600">
            <Radio className="w-3.5 h-3.5 text-teal-600" />
            <span>Vehicle:</span>
            <strong className="text-slate-900 font-mono text-[11px]">{currentUser.email}</strong>
            <span className="text-[10px] font-mono text-slate-400">
              ({currentUser.uid.slice(0, 6)}...)
            </span>
          </div>
        </nav>

        {/* Zone 3: Primary Actions (Audio Toggle, ASIL-B badge & Logout) */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors"
            title={isMuted ? 'Unmute alerts' : 'Mute alerts'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-teal-600" />}
            <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Audio ON'}</span>
          </button>

          <div className="hidden sm:flex px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>ISO 26262 ASIL-B</span>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            title="Sign Out Vehicle Account"
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* 2. Main Content Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Active Display Mode Header & Hardware Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              {displayMode === 'integrated' && <Car className="w-5 h-5" />}
              {displayMode === 'retrofit' && <Cpu className="w-5 h-5" />}
              {displayMode === 'two_wheeler' && <Bike className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                {displayMode === 'integrated' && 'Configuration 1: Integrated Vehicle Infotainment & Cockpit'}
                {displayMode === 'retrofit' && 'Configuration 2: Older Vehicle Retrofit Display (Near Speedometer)'}
                {displayMode === 'two_wheeler' && 'Configuration 3: Motorcycle & Scooter Handlebar Display'}
              </div>
              <p className="text-[11px] text-slate-500">
                {firebaseLiveZone
                  ? `Active Firebase Zone: ${firebaseLiveZone.id} (${firebaseLiveZone.name} · ${firebaseLiveZone.allowedSpeed} km/h)`
                  : 'All three configurations receive identical virtual speed-zone definitions from the onboard processor.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden lg:inline">
              PROTOTYPE DISPLAY SWITCHER:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setDisplayMode('integrated')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  displayMode === 'integrated'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Integrated
              </button>
              <button
                onClick={() => setDisplayMode('retrofit')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  displayMode === 'retrofit'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Retrofit
              </button>
              <button
                onClick={() => setDisplayMode('two_wheeler')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  displayMode === 'two_wheeler'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Two-Wheeler
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Display Rendering */}
        <div className="w-full flex justify-center">
          {displayMode === 'integrated' && (
            <IntegratedDashboard
              state={state}
              onEmergencyRequest={handleEmergencyRequest}
              onEmergencyConfirm={handleEmergencyConfirm}
              onEmergencyEnd={handleEmergencyEnd}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
              visualSoundNotice={visualNotice}
            />
          )}

          {displayMode === 'retrofit' && (
            <RetrofitDashboard
              state={state}
              onPhysicalEmergencyPress={handlePhysicalButtonPress}
              onEmergencyEnd={handleEmergencyEnd}
              visualSoundNotice={visualNotice}
            />
          )}

          {displayMode === 'two_wheeler' && (
            <TwoWheelerDashboard
              state={state}
              onPhysicalEmergencyPress={handlePhysicalButtonPress}
              onEmergencyEnd={handleEmergencyEnd}
              visualSoundNotice={visualNotice}
            />
          )}
        </div>

        {/* 3. SIH Evaluator Simulation Suite & Hardware Control Panel */}
        <SimulationDrawer
          state={state}
          displayMode={displayMode}
          onSelectDisplayMode={setDisplayMode}
          onSelectVehicleType={(type: VehicleType) =>
            setState((prev) => ({ ...prev, vehicleType: type }))
          }
          onApplyScenario={handleApplyScenario}
          onUpdateSpeed={handleUpdateSpeed}
          onUpdateAllowedSpeed={handleUpdateAllowedSpeed}
          onUpdateDistance={handleUpdateDistance}
          onUpdateZoneType={handleUpdateZoneType}
          onUpdateZoneReason={handleUpdateZoneReason}
          onToggleAutoDrive={handleToggleAutoDrive}
          onSimulateMapUpdate={handleSimulateMapUpdate}
          onRequestOverride={handleEmergencyRequest}
          onActivateOverride={handleEmergencyConfirm}
          onEndOverride={handleEmergencyEnd}
          onBlockOverride={handleEmergencyBlock}
          firebaseSyncState={firebaseSyncState}
          firebaseLiveZone={firebaseLiveZone}
          firebaseZonesDict={firebaseZonesDict}
          onApplyFirebaseLiveZone={handleApplyFirebaseLiveZone}
          onRefreshFirebaseZones={handleRefreshFirebaseZones}
        />
      </main>

      {/* 4. Refined Editorial Footer */}
      <footer className="w-full bg-white border-t border-slate-200 mt-8 py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              Smart Virtual Speed Reducer System
            </span>
            <span>·</span>
            <span>Application 3: In-Vehicle Driver Interface &amp; Digital Twin</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 font-mono">
              <Database className="w-3.5 h-3.5 text-teal-600" />
              <span>Read Path: /zones</span>
            </span>
            <span>·</span>
            <span>SIH Prototype Demonstration</span>
            <span>·</span>
            <span className="text-teal-700 font-semibold">
              Firebase Auth &amp; RTDB Live Sync
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
