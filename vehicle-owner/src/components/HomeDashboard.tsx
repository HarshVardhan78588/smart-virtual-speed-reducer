import React from 'react';
import { useApp, DrivingScenario } from '../context/AppContext';
import {
  ShieldCheck,
  Navigation as NavIcon,
  Eye,
  Activity,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingDown,
  Car,
  Layers,
  ChevronRight,
  Sliders,
  AlertOctagon,
} from 'lucide-react';

export const HomeDashboard: React.FC = () => {
  const {
    vehicle,
    scenario,
    setScenario,
    currentSpeed,
    setCurrentSpeed,
    allowedSpeed,
    distanceToZone,
    remainingInZone,
    roadName,
    overrideState,
    zones,
    selectedZone,
    setSelectedZone,
    setActiveTab,
    isLiveFirebaseSync,
  } = useApp();

  const isOverride = overrideState.status === 'active';
  const isApproaching = scenario === 'approaching_school' || (distanceToZone > 0 && distanceToZone <= 600);
  const isInside = scenario === 'inside_school_zone' || distanceToZone === 0;

  // Active Zone data: Prioritizes live ZN-010 or selected zone from Firebase
  const currentTargetZone =
    zones.find((z) => z.id === 'ZN-010') ||
    selectedZone ||
    zones[0] || {
      id: 'ZN-010',
      name: 'TEST ZONE A',
      speedLimit: 30,
      controlledRangeMeters: 900,
      reason: 'SIH Firebase Integration Test',
      schedule: 'Active 24 Hours / 7 Days',
      status: 'active',
      authority: 'Odisha Road Safety Authority (ORSA)',
      lastUpdated: 'Live Synced from Government Grid',
      roadName: 'Janpath Avenue, Sector 4',
      startKm: 12.4,
      endKm: 13.3,
      virtualHumpsCount: 3,
      coordinates: { lat: 20.2961, lng: 85.8245 },
    };

  const targetLimit = currentTargetZone.speedLimit || 30;

  // Dynamic gradual reduction steps matching the active speed limit
  const reductionSteps = [
    { speed: 52, label: 'Initial Approach', active: currentSpeed >= 50 },
    { speed: 46, label: 'Gentle Decel', active: currentSpeed >= 44 && currentSpeed < 50 },
    { speed: Math.max(targetLimit + 8, 38), label: 'Transition Buffer', active: currentSpeed >= (targetLimit + 5) && currentSpeed < 44 },
    { speed: Math.max(targetLimit + 4, 34), label: 'Pre-Zone Glide', active: currentSpeed >= (targetLimit + 2) && currentSpeed < (targetLimit + 5) },
    { speed: targetLimit, label: 'Controlled Zone', active: currentSpeed <= (targetLimit + 2) },
  ];

  // Status computation for 2-3 second comprehension
  const getStatusSummary = () => {
    if (isOverride) {
      return {
        what: 'Emergency Override Active',
        why: `Declared: ${overrideState.reason || 'Emergency Assistance'}`,
        limit: 'Virtual limit suspended (Road limit: 50 km/h)',
        action: 'Proceed with extreme caution. Safety monitoring active.',
        badgeSymbol: '◇',
        badgeText: 'Override Active',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      };
    }
    if (isInside) {
      return {
        what: 'Inside Active Virtual Speed Zone',
        why: currentTargetZone.reason,
        limit: `${currentTargetZone.speedLimit} km/h`,
        action: 'Controlled speed response active. Maintain steady 30 km/h.',
        badgeSymbol: '!',
        badgeText: 'Active 30 km/h Zone',
        badgeColor: 'bg-teal-50 text-teal-900 border-teal-300',
      };
    }
    if (isApproaching) {
      return {
        what: `Speed Zone Ahead in ${distanceToZone}m`,
        why: currentTargetZone.reason,
        limit: `${currentTargetZone.speedLimit} km/h`,
        action: 'Gradual deceleration recommended over the next 350m.',
        badgeSymbol: '!',
        badgeText: 'Speed Zone Ahead',
        badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
      };
    }
    return {
      what: 'Normal Road Cruise',
      why: 'Standard urban arterial speed limit',
      limit: '50 km/h',
      action: 'All virtual safety zones clear. Smooth driving mode.',
      badgeSymbol: '✓',
      badgeText: 'Normal Operation',
      badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    };
  };

  const status = getStatusSummary();

  return (
    <div className="space-y-5 pb-16 md:pb-6">
      {/* 1. TOP HARDWARE & SYSTEM STATUS BAR */}
      <section
        aria-label="Hardware & System Status"
        className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 shadow-xs"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-900 tracking-tight">System Active</span>
            <span className="text-slate-400 text-xs">·</span>
            <span className="text-xs text-slate-600 font-medium truncate">
              {vehicle.name}
            </span>
          </div>

          {/* Subsystem status indicators */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5" title="Dual-Band NavIC/GPS Satellite System">
              <span className="text-teal-700 font-bold" aria-hidden="true">✓</span>
              <NavIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>GPS: <strong className="text-slate-800 font-medium">Active (14 Sats)</strong></span>
            </div>

            <div className="flex items-center gap-1.5" title="6-Axis Gyroscope & Accelerometer">
              <span className="text-teal-700 font-bold" aria-hidden="true">✓</span>
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              <span>IMU: <strong className="text-slate-800 font-medium">Calibrated</strong></span>
            </div>

            <div className="flex items-center gap-1.5" title="Front Optical Road Sign Sensor">
              <span className="text-teal-700 font-bold" aria-hidden="true">✓</span>
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Camera: <strong className="text-slate-800 font-medium">Ready</strong></span>
            </div>

            <div className="flex items-center gap-1.5" title="On-board Local Speed Zone Map">
              <span className="text-teal-700 font-bold" aria-hidden="true">✓</span>
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Map: <strong className="text-slate-800 font-medium">Synced</strong></span>
            </div>

            <div className="flex items-center gap-1.5" title="On-board Vehicle Controller Hardware">
              <span className="text-teal-700 font-bold" aria-hidden="true">✓</span>
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Device: <strong className="text-slate-800 font-medium">Connected</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 2-SECOND DRIVER HIERARCHY BANNER */}
      <section
        aria-label="Driver Situation Overview"
        className={`rounded-xl border p-4 transition-all shadow-xs ${
          isOverride
            ? 'bg-amber-50/70 border-amber-300'
            : isInside
            ? 'bg-teal-50/70 border-teal-300'
            : isApproaching
            ? 'bg-amber-50/50 border-amber-200'
            : 'bg-white border-slate-200/90'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${status.badgeColor}`}
              >
                <span aria-hidden="true">{status.badgeSymbol}</span>
                <span>{status.badgeText}</span>
              </span>
              <span className="text-xs text-slate-500 font-medium truncate">{roadName}</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {status.what}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              <strong className="text-slate-800">Why:</strong> {status.why} · <strong className="text-slate-800">Action:</strong> {status.action}
            </p>
          </div>

          <div className="sm:text-right shrink-0">
            <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
              Enforced Limit
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {isOverride ? (
                <span className="text-amber-800 line-through text-lg font-normal">
                  {allowedSpeed} km/h{' '}
                  <span className="no-underline text-xs text-amber-900 font-semibold ml-1">
                    (Suspended)
                  </span>
                </span>
              ) : (
                `${allowedSpeed} km/h`
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. CENTRAL SPEED & ROAD CONTEXT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Central Speed Display (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-6 flex flex-col items-center justify-center text-center shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Current Speed
          </div>

          <div className="relative my-2 flex items-baseline justify-center">
            <span
              className={`text-6xl sm:text-7xl font-bold tracking-tight font-mono tabular-nums ${
                currentSpeed > allowedSpeed && !isOverride
                  ? 'text-amber-700'
                  : isOverride
                  ? 'text-amber-800'
                  : 'text-slate-900'
              }`}
            >
              {currentSpeed}
            </span>
            <span className="text-base sm:text-lg font-semibold text-slate-500 ml-2">km/h</span>
          </div>

          {/* Speed Limit & Status Pill */}
          <div className="w-full mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs px-2">
            <div className="text-left">
              <div className="text-slate-500 font-medium">Allowed Limit</div>
              <div className="text-sm font-bold text-slate-900 tabular-nums">
                {allowedSpeed} km/h
              </div>
            </div>

            <div className="h-7 w-[1px] bg-slate-200" />

            <div className="text-right">
              <div className="text-slate-500 font-medium">Control Mode</div>
              <div className="text-xs font-bold text-slate-800 flex items-center justify-end gap-1">
                <span>{status.badgeSymbol}</span>
                <span>{status.badgeText}</span>
              </div>
            </div>
          </div>

          {/* Live Speed Adjuster Simulation Controls */}
          <div className="w-full mt-5 bg-slate-50 rounded-lg p-3 border border-slate-100">
            <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1.5 font-medium">
              <span>Simulation Speed Slider</span>
              <span className="font-mono font-semibold text-slate-900">{currentSpeed} km/h</span>
            </div>
            <input
              type="range"
              min="15"
              max="75"
              value={currentSpeed}
              onChange={(e) => setCurrentSpeed(Number(e.target.value))}
              className="w-full accent-teal-700 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              aria-label="Adjust current speed"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>15 km/h</span>
              <span className="text-teal-800 font-semibold">30 (Zone)</span>
              <span>50 (Urban)</span>
              <span>75 km/h</span>
            </div>
          </div>
        </div>

        {/* Right Section: Upcoming or Active Zone Information Card (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card: Active or Upcoming Zone */}
          {isInside ? (
            /* ACTIVE SPEED ZONE CARD */
            <div className="bg-white rounded-xl border border-teal-200/90 p-5 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1">
                      <span>!</span>
                      <span>ACTIVE SPEED ZONE</span>
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {currentTargetZone.name}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-teal-900 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
                    {currentTargetZone.speedLimit} km/h
                  </span>
                </div>
              </div>

              {/* Zone Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                <div>
                  <div className="text-slate-500 font-medium">Reason</div>
                  <div className="text-slate-800 font-semibold">{currentTargetZone.reason}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Remaining in Zone</div>
                  <div className="text-slate-800 font-semibold tabular-nums">
                    {remainingInZone} m
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Est. Duration</div>
                  <div className="text-slate-800 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>~1 min 15s</span>
                  </div>
                </div>
              </div>

              {/* Calm Explanation */}
              <div className="mt-4 p-3 bg-teal-50/50 rounded-lg border border-teal-100 text-xs text-slate-700 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-800 shrink-0" />
                <span>
                  Speed control is active for this digitally defined road section. Autonomous
                  throttle response smoothly holds speed at or below {currentTargetZone.speedLimit} km/h.
                </span>
              </div>
            </div>
          ) : (
            /* SPEED ZONE AHEAD CARD */
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                      <span>!</span>
                      <span>SPEED ZONE AHEAD</span>
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {currentTargetZone.name}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-amber-900 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                    {currentTargetZone.speedLimit} km/h
                  </span>
                </div>
              </div>

              {/* Zone Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                <div>
                  <div className="text-slate-500 font-medium">Distance</div>
                  <div className="text-slate-900 font-bold tabular-nums">
                    {distanceToZone} m
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Reason</div>
                  <div className="text-slate-800 font-semibold truncate">
                    {currentTargetZone.reason}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Controlled Range</div>
                  <div className="text-slate-800 font-semibold tabular-nums">
                    {currentTargetZone.controlledRangeMeters} m
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Status</div>
                  <div className="text-amber-800 font-semibold flex items-center gap-1">
                    <span>!</span>
                    <span>Approaching</span>
                  </div>
                </div>
              </div>

              {/* Road Visualization Vehicle -> Distance -> Zone */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium mb-2 flex items-center justify-between">
                  <span>Approach Road Profile</span>
                  <span className="text-teal-800 font-semibold">
                    Virtual Hump Array ({currentTargetZone.virtualHumpsCount || 3} nodes)
                  </span>
                </div>

                <div className="relative bg-slate-100 h-10 rounded-lg border border-slate-200 flex items-center px-4 overflow-hidden">
                  {/* Road Center Line */}
                  <div className="absolute inset-x-0 h-[2px] border-b border-dashed border-slate-300" />

                  {/* Vehicle Marker */}
                  <div className="relative z-10 flex items-center gap-1 bg-slate-900 text-white px-2 py-0.5 rounded shadow-xs text-[11px] font-bold">
                    <Car className="w-3 h-3 text-teal-400" />
                    <span>Vehicle</span>
                  </div>

                  {/* Distance Line */}
                  <div className="flex-1 flex items-center justify-center relative">
                    <span className="bg-white/90 px-2 py-0.5 rounded text-[10px] font-mono text-slate-600 border border-slate-200 z-10">
                      {distanceToZone} m
                    </span>
                  </div>

                  {/* Zone Boundary */}
                  <div className="relative z-10 flex items-center gap-1 bg-teal-800 text-white px-2.5 py-0.5 rounded shadow-xs text-[11px] font-bold">
                    <span>ZONE</span>
                    <span className="font-mono text-teal-200">{currentTargetZone.speedLimit} km/h</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GRADUAL SPEED REDUCTION VISUALIZATION */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs mb-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <TrendingDown className="w-4 h-4 text-teal-700" />
                <span>Gradual Speed Reduction Mechanism</span>
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                Controlled speed response (no harsh physical bumps)
              </span>
            </div>

            {/* Stepped sequence: 52 -> 46 -> 40 -> 35 -> 30 */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-center">
              {reductionSteps.map((step, idx) => (
                <div
                  key={step.speed}
                  className={`p-2 rounded-lg border transition-all ${
                    step.active
                      ? 'bg-teal-50 border-teal-300 text-teal-900 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-500 font-medium'
                  }`}
                >
                  <div className="text-xs sm:text-sm font-mono tabular-nums">
                    {step.speed} <span className="text-[10px] font-normal">km/h</span>
                  </div>
                  <div className="text-[10px] truncate mt-0.5 text-slate-600">
                    {step.label}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 mt-2.5 leading-normal">
              Rather than jarring physical speed breakers, the system smoothly commands gradual
              deceleration along the digital geofence, protecting vehicle suspension, cargo, and
              passengers.
            </p>
          </div>
        </div>
      </div>

      {/* 4. QUICK SCENARIO SIMULATOR TOOLBAR */}
      <section
        aria-label="Driving Simulation Controls"
        className="bg-slate-100/80 rounded-xl p-4 border border-slate-200 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Prototype Driving Scenarios
            </h3>
            <span className="text-[11px] text-slate-500">
              (Evaluate system state transitions in 1-click)
            </span>
          </div>

          <button
            onClick={() => setActiveTab('live-zone')}
            className="text-xs font-semibold text-teal-800 hover:text-teal-900 flex items-center gap-1 self-start sm:self-center"
          >
            <span>Open Live Zone Map</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
          {[
            {
              id: 'normal_cruise',
              label: '1. Normal Cruise',
              desc: '50 km/h · Standard Road',
            },
            {
              id: 'approaching_school',
              label: '2. Approach School Zone',
              desc: '48 km/h · 420m away',
            },
            {
              id: 'inside_school_zone',
              label: '3. Inside School Zone',
              desc: '30 km/h · Active Control',
            },
            {
              id: 'construction_zone',
              label: '4. Construction Caution',
              desc: '25 km/h · Temp Geofence',
            },
            {
              id: 'emergency_mode',
              label: '5. Emergency Override',
              desc: 'Suspended · Monitored',
            },
          ].map((sc) => {
            const isSelected = scenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setScenario(sc.id as DrivingScenario)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-teal-800 text-white border-teal-900 shadow-sm'
                    : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold text-xs truncate">{sc.label}</div>
                <div
                  className={`text-[11px] mt-0.5 truncate ${
                    isSelected ? 'text-teal-200' : 'text-slate-500'
                  }`}
                >
                  {sc.desc}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. EMERGENCY CALLOUT (IF ACTIVE OR BLOCKED) */}
      {isOverride && (
        <div className="bg-amber-50 rounded-xl border border-amber-300 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 shrink-0 font-bold text-sm">
              ◇
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                Emergency Override in Effect
              </h4>
              <p className="text-xs text-amber-900 mt-0.5">
                Restrictions suspended for emergency response. Full telemetry is streaming to
                Government Safety Gateway.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('emergency')}
            className="px-3 py-1.5 bg-amber-900 text-white text-xs font-semibold rounded-lg hover:bg-amber-950 transition-colors whitespace-nowrap self-start sm:self-center"
          >
            Manage Override
          </button>
        </div>
      )}
    </div>
  );
};
