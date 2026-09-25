import React, { useState } from 'react';
import {
  DisplayMode,
  VehicleType,
  VehicleState,
  ZoneReason,
  ZoneType,
  SpeedZone,
} from '../../types/vehicle';
import { SCENARIO_PRESETS } from '../../data/mockScenarios';
import { FirebaseSyncState, FirebaseZonesDictionary } from '../../types/firebase';
import {
  Play,
  Pause,
  Sliders,
  RefreshCw,
  Cpu,
  Layers,
  ArrowRight,
  ShieldAlert,
  MapPin,
  Car,
  Bike,
  Database,
  Radio,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface SimulationDrawerProps {
  state: VehicleState;
  displayMode: DisplayMode;
  onSelectDisplayMode: (mode: DisplayMode) => void;
  onSelectVehicleType: (type: VehicleType) => void;
  onApplyScenario: (presetId: string) => void;
  onUpdateSpeed: (speed: number) => void;
  onUpdateAllowedSpeed: (allowed: number) => void;
  onUpdateDistance: (dist: number) => void;
  onUpdateZoneType: (type: ZoneType) => void;
  onUpdateZoneReason: (reason: ZoneReason) => void;
  onToggleAutoDrive: () => void;
  onSimulateMapUpdate: () => void;
  onRequestOverride: () => void;
  onActivateOverride: () => void;
  onEndOverride: () => void;
  onBlockOverride: () => void;

  // Firebase Realtime Database integration props
  firebaseSyncState: FirebaseSyncState;
  firebaseLiveZone: SpeedZone | null;
  firebaseZonesDict: FirebaseZonesDictionary | null;
  onApplyFirebaseLiveZone: () => void;
  onRefreshFirebaseZones: () => void;
}

export const SimulationDrawer: React.FC<SimulationDrawerProps> = ({
  state,
  displayMode,
  onSelectDisplayMode,
  onSelectVehicleType,
  onApplyScenario,
  onUpdateSpeed,
  onUpdateAllowedSpeed,
  onUpdateDistance,
  onUpdateZoneType,
  onUpdateZoneReason,
  onToggleAutoDrive,
  onSimulateMapUpdate,
  onRequestOverride,
  onActivateOverride,
  onEndOverride,
  onBlockOverride,
  firebaseSyncState,
  firebaseLiveZone,
  firebaseZonesDict,
  onApplyFirebaseLiveZone,
  onRefreshFirebaseZones,
}) => {
  const [showArchModal, setShowArchModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'scenarios' | 'controls' | 'map_sync' | 'firebase_sync' | 'signals'>('scenarios');

  const zn010Record = firebaseZonesDict ? firebaseZonesDict['ZN-010'] : null;

  return (
    <div className="w-full rounded-2xl bg-white border border-slate-200 shadow-sm p-5 select-none">
      {/* Simulation Header & Mode Selector (Clearly marked as PROTOTYPE DEMO TOOL) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-teal-50 text-teal-700">
              <Sliders className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              SIH Evaluator Simulation Suite &amp; Hardware Mode Selector
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrates cross-platform vehicle adaptation from a single unified onboard system.
          </p>
        </div>

        {/* Display Mode Tabs (PROTOTYPE ONLY) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => onSelectDisplayMode('integrated')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              displayMode === 'integrated'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-teal-600" />
            <span>Integrated Display</span>
          </button>

          <button
            onClick={() => onSelectDisplayMode('retrofit')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              displayMode === 'retrofit'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-amber-600" />
            <span>Retrofit Display</span>
          </button>

          <button
            onClick={() => onSelectDisplayMode('two_wheeler')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              displayMode === 'two_wheeler'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bike className="w-3.5 h-3.5 text-indigo-600" />
            <span>Two-Wheeler Display</span>
          </button>
        </div>
      </div>

      {/* Prototype Clarification Note */}
      <div className="mt-3 px-3.5 py-2 rounded-lg bg-teal-50/70 border border-teal-200/60 text-[11px] text-teal-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold">PROTOTYPE NOTE:</span>
          <span>
            Mode selector is provided solely for demonstration. In physical production, the vehicle's installed hardware and CAN-bus profile determine the interface automatically.
          </span>
        </div>
        <button
          onClick={() => setShowArchModal(true)}
          className="text-xs font-semibold text-teal-800 hover:text-teal-950 underline flex items-center gap-1 shrink-0 ml-2"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>System Architecture</span>
        </button>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-4 mt-4 border-b border-slate-200 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`pb-2 font-semibold transition-colors border-b-2 -mb-[2px] whitespace-nowrap ${
            activeTab === 'scenarios'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Quick Scenarios
        </button>
        <button
          onClick={() => setActiveTab('firebase_sync')}
          className={`pb-2 font-semibold transition-colors border-b-2 -mb-[2px] whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'firebase_sync'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-teal-600" />
          <span>Firebase /zones Sync</span>
          {firebaseSyncState === 'live_synced' && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('controls')}
          className={`pb-2 font-semibold transition-colors border-b-2 -mb-[2px] whitespace-nowrap ${
            activeTab === 'controls'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Live Telemetry Sliders
        </button>
        <button
          onClick={() => setActiveTab('map_sync')}
          className={`pb-2 font-semibold transition-colors border-b-2 -mb-[2px] whitespace-nowrap ${
            activeTab === 'map_sync'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Map Database &amp; OTA Sync
        </button>
        <button
          onClick={() => setActiveTab('signals')}
          className={`pb-2 font-semibold transition-colors border-b-2 -mb-[2px] whitespace-nowrap ${
            activeTab === 'signals'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Hardware Signal Stream
        </button>
      </div>

      {/* Tab 1: Quick Scenarios */}
      {activeTab === 'scenarios' && (
        <div className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Dedicated Firebase Live Zone Scenario Card */}
            {firebaseLiveZone && (
              <button
                onClick={onApplyFirebaseLiveZone}
                className="p-3 text-left rounded-xl border-2 border-teal-500/80 bg-teal-50/50 hover:bg-teal-100/60 transition-all group flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                      <span>LIVE FIREBASE: {firebaseLiveZone.id}</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-teal-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-xs font-semibold text-slate-800 mt-1">
                    {firebaseLiveZone.name}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {firebaseLiveZone.reason} · {firebaseLiveZone.length}m range
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-teal-200/60 flex items-center justify-between text-[10px] font-mono text-teal-900 font-bold">
                  <span>Target: {firebaseLiveZone.allowedSpeed} km/h</span>
                  <span>RTDB /zones Live</span>
                </div>
              </button>
            )}

            {/* Preserved standard scenarios */}
            {SCENARIO_PRESETS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => onApplyScenario(sc.id)}
                className="p-3 text-left rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-teal-700">
                      {sc.title}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {sc.subtitle}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono text-slate-600">
                  <span>Speed: {sc.speed} km/h</span>
                  <span>Limit: {sc.allowed} km/h</span>
                </div>
              </button>
            ))}
          </div>

          {/* Auto Drive Simulation Toggle Banner */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleAutoDrive}
                className={`p-2 rounded-xl transition-colors ${
                  state.autoDrive
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                {state.autoDrive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {state.autoDrive ? 'Auto-Drive Simulation Running' : 'Auto-Drive Simulation Paused'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Vehicle continuously advances, approaches virtual speed zones, and demonstrates automatic speed reduction.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">
                {state.controlledSpeedActive ? 'DECEL ACTIVE' : 'NOMINAL CRUISE'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Firebase Realtime Database /zones Synchronization Tab */}
      {activeTab === 'firebase_sync' && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase">
                  Firebase Realtime Database /zones Synchronization
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Exact Database Read Path: <strong className="font-mono text-slate-800">/zones</strong> · Strictly READ ONLY · Security Rules Compliant
              </p>
            </div>

            <button
              onClick={onRefreshFirebaseZones}
              className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh /zones</span>
            </button>
          </div>

          {/* Sync Status Banner */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">SYNC STATUS</span>
              <div className="mt-1 flex items-center gap-2">
                {firebaseSyncState === 'live_synced' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-800">LIVE SYNCED</span>
                  </>
                ) : firebaseSyncState === 'connecting' ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-teal-600 animate-spin" />
                    <span className="text-xs font-bold text-teal-800">CONNECTING...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-800">{firebaseSyncState.toUpperCase()}</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">TOTAL /zones IN RTDB</span>
              <div className="mt-1 text-sm font-bold font-mono text-slate-900">
                {firebaseZonesDict ? Object.keys(firebaseZonesDict).length : 0} Zones Received
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">PERMISSION MODEL</span>
              <div className="mt-1 text-xs font-semibold text-slate-800">
                Vehicle: READ ONLY (No /zones writes)
              </div>
            </div>
          </div>

          {/* Live Government Record: /zones/ZN-010 Verification */}
          <div className="mt-4 p-3.5 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-slate-900">
                  Target Government Record: /zones/ZN-010
                </span>
              </div>
              {zn010Record ? (
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
                  ✓ VERIFIED PRESENT IN FIREBASE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-mono font-bold">
                  WAITING FOR DATA
                </span>
              )}
            </div>

            {zn010Record ? (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-slate-50 rounded">
                  <span className="text-[10px] text-slate-400 block">NAME</span>
                  <span className="font-bold text-slate-900">{zn010Record.name}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <span className="text-[10px] text-slate-400 block">SPEED LIMIT</span>
                  <span className="font-mono font-bold text-teal-700">{zn010Record.speedLimit} km/h</span>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <span className="text-[10px] text-slate-400 block">REASON</span>
                  <span className="font-semibold text-slate-800">{zn010Record.reason}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <span className="text-[10px] text-slate-400 block">CONTROLLED DISTANCE</span>
                  <span className="font-mono font-bold text-slate-900">{zn010Record.controlledDistance} m</span>
                </div>

                <div className="col-span-2 sm:col-span-4 mt-2 flex justify-end">
                  <button
                    onClick={onApplyFirebaseLiveZone}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Load ZN-010 into Driver Interface</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 text-xs text-slate-500">
                Querying Realtime Database path <code className="font-mono text-teal-700">/zones</code>...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Live Telemetry Sliders */}
      {activeTab === 'controls' && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Slider 1: Current Speed */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
              <span>Current Vehicle Speed</span>
              <span className="font-mono text-teal-700 text-sm font-bold">{Math.round(state.currentSpeed)} km/h</span>
            </div>
            <input
              type="range"
              min={0}
              max={110}
              step={1}
              value={Math.round(state.currentSpeed)}
              onChange={(e) => onUpdateSpeed(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>0 km/h</span>
              <span>50 km/h</span>
              <span>110 km/h</span>
            </div>
          </div>

          {/* Slider 2: Allowed Speed Limit */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
              <span>Zone Permitted Speed</span>
              <span className="font-mono text-red-600 text-sm font-bold">{state.allowedSpeed} km/h</span>
            </div>
            <input
              type="range"
              min={15}
              max={80}
              step={5}
              value={state.allowedSpeed}
              onChange={(e) => onUpdateAllowedSpeed(Number(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>15 km/h</span>
              <span>30 km/h</span>
              <span>80 km/h</span>
            </div>
          </div>

          {/* Slider 3: Distance to Zone */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
              <span>Distance to Speed Zone</span>
              <span className="font-mono text-slate-900 text-sm font-bold">{Math.round(state.distanceToZone)} m</span>
            </div>
            <input
              type="range"
              min={0}
              max={800}
              step={10}
              value={Math.round(state.distanceToZone)}
              onChange={(e) => onUpdateDistance(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>0 m (Inside)</span>
              <span>300 m (Prepare)</span>
              <span>800 m</span>
            </div>
          </div>

          {/* Zone Reason & Type Pickers */}
          <div className="md:col-span-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Zone Type:</span>
              {(['permanent', 'temporary', 'virtual_hump'] as ZoneType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onUpdateZoneType(t)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                    state.currentZone?.type === t || state.upcomingZone?.type === t
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Zone Reason:</span>
              {(['School Safety', 'Hospital Zone', 'Event / Festival', 'Construction', 'Pedestrian Safety', 'SIH Firebase Integration Test'] as ZoneReason[]).map(
                (r) => (
                  <button
                    key={r}
                    onClick={() => onUpdateZoneReason(r)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      state.currentZone?.reason === r || state.upcomingZone?.reason === r
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Emergency State Overrides */}
          <div className="md:col-span-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span className="text-xs font-bold text-slate-900">Emergency Override Simulation State:</span>
              <span className="font-mono text-xs font-bold text-red-700 uppercase">
                [{state.override.status}]
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onRequestOverride}
                className="px-3 py-1 text-xs font-medium bg-white border border-slate-300 hover:bg-slate-100 rounded-md text-slate-800"
              >
                Request
              </button>
              <button
                onClick={onActivateOverride}
                className="px-3 py-1 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Activate Directly
              </button>
              <button
                onClick={onEndOverride}
                className="px-3 py-1 text-xs font-medium bg-white border border-slate-300 hover:bg-slate-100 rounded-md text-slate-800"
              >
                End
              </button>
              <button
                onClick={onBlockOverride}
                className="px-3 py-1 text-xs font-medium bg-stone-800 hover:bg-stone-900 text-white rounded-md"
              >
                Simulate Blocked
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Local Map Database & OTA Sync Simulation */}
      {activeTab === 'map_sync' && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-bold text-slate-900">LOCAL SPEED-ZONE MAP DATABASE</h4>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Onboard hardware module maintains offline-first local speed-zone database with cryptographic hash validation.
              </p>
            </div>

            <button
              onClick={onSimulateMapUpdate}
              disabled={state.map.status === 'checking' || state.map.status === 'downloading' || state.map.status === 'validating'}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${state.map.status !== 'synced' && state.map.status !== 'updated' ? 'animate-spin' : ''}`} />
              <span>Simulate OTA Map Update</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">REGION / DISTRICT</span>
              <div className="font-semibold text-slate-900 mt-0.5">{state.map.district}</div>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">MAP VERSION</span>
              <div className="font-mono font-bold text-teal-700 mt-0.5">{state.map.version}</div>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">PERMANENT ZONES</span>
              <div className="font-mono font-bold text-slate-900 mt-0.5">{state.map.storedZones}</div>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">TEMPORARY ZONES</span>
              <div className="font-mono font-bold text-amber-700 mt-0.5">{state.map.temporaryZones}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Real-time Hardware Signal Stream */}
      {activeTab === 'signals' && (
        <div className="mt-4 p-4 rounded-xl bg-stone-950 text-stone-200 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800 text-[11px] text-stone-400">
            <span>ONBOARD CONTROLLER HARDWARE SIGNAL LOG</span>
            <span className="text-emerald-400">BUS RATE: 500 kbps (CAN 2.0B)</span>
          </div>

          <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto">
            {state.recentSignals.map((sig) => (
              <div key={sig.id} className="flex items-start justify-between gap-4 text-[11px] border-b border-stone-900 pb-1">
                <div className="flex items-center gap-2">
                  <span className="text-stone-500">{sig.timestamp}</span>
                  <span className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 text-[9px] font-bold">
                    {sig.source}
                  </span>
                  <span className="text-stone-100">{sig.signal}</span>
                </div>
                <span className="text-teal-400 text-[10px] shrink-0">{sig.payload}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Architecture Visual Modal */}
      {showArchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-600" />
                <h4 className="text-base font-bold text-slate-900">System Hardware &amp; Signal Architecture</h4>
              </div>
              <button
                onClick={() => setShowArchModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 mb-2">1. Virtual Speed Zone Decision Chain</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center font-mono text-[11px]">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="font-bold text-teal-800">FIREBASE /zones + SENSORS</div>
                    <div className="text-[10px] text-slate-500">RTDB · GPS · IMU · Local Map</div>
                  </div>
                  <div className="flex items-center justify-center font-bold text-slate-400">→</div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="font-bold text-teal-800">VEHICLE CONTROLLER</div>
                    <div className="text-[10px] text-slate-500">Zone Match · Speed Trajectory</div>
                  </div>
                  <div className="flex items-center justify-center font-bold text-slate-400">→</div>
                </div>
                <div className="mt-2 text-center font-mono text-[11px]">
                  <span className="p-1.5 px-3 bg-teal-100 text-teal-900 rounded font-bold">
                    DRIVER DISPLAY (Integrated / Retrofit / Two-Wheeler)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setShowArchModal(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg"
              >
                Close Architecture Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
