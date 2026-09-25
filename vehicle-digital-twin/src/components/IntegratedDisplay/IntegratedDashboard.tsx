import React, { useState } from 'react';
import { VehicleState } from '../../types/vehicle';
import { Vehicle3DScene } from '../VehicleScene/Vehicle3DScene';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Volume2,
  VolumeX,
  Radio,
  Clock,
  Compass,
} from 'lucide-react';

interface IntegratedDashboardProps {
  state: VehicleState;
  onEmergencyRequest: () => void;
  onEmergencyConfirm: () => void;
  onEmergencyEnd: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  visualSoundNotice: string | null;
}

export const IntegratedDashboard: React.FC<IntegratedDashboardProps> = ({
  state,
  onEmergencyRequest,
  onEmergencyConfirm,
  onEmergencyEnd,
  isMuted,
  onToggleMute,
  visualSoundNotice,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const isOverrideActive = state.override.status === 'active';
  const isOverrideBlocked = state.override.status === 'blocked';
  const activeZone = state.currentZone || state.upcomingZone;

  // Format seconds into HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Determine approach status text
  const getApproachStatus = () => {
    if (isOverrideActive) return { text: 'EMERGENCY OVERRIDE ACTIVE', symbol: '□', color: 'text-red-700 bg-red-50 border-red-200' };
    if (state.isInsideZone) return { text: `${state.allowedSpeed} km/h ZONE ACTIVE`, symbol: '◇', color: 'text-teal-800 bg-teal-50 border-teal-200' };
    if (!activeZone) return { text: 'NORMAL ROADWAY', symbol: '✓', color: 'text-slate-700 bg-slate-50 border-slate-200' };

    if (state.distanceToZone <= 120) {
      return { text: 'SPEED CONTROL ACTIVE', symbol: '◇', color: 'text-teal-800 bg-teal-50 border-teal-200' };
    } else if (state.distanceToZone <= 320) {
      return { text: 'PREPARE TO REDUCE', symbol: '!', color: 'text-amber-800 bg-amber-50 border-amber-200' };
    } else {
      return { text: 'SPEED ZONE AHEAD', symbol: '!', color: 'text-amber-800 bg-amber-50 border-amber-200' };
    }
  };

  const approach = getApproachStatus();

  return (
    <div className="w-full flex flex-col rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden select-none">
      {/* 1. Cockpit Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50/60 text-xs">
        {/* Left: Gear selector & District */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono font-semibold">
            {['P', 'R', 'N', 'D'].map((gear) => (
              <span
                key={gear}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  gear === 'D'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-700'
                }`}
              >
                {gear}
              </span>
            ))}
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Compass className="w-3.5 h-3.5 text-teal-600" />
            <span>{state.map.district}</span>
          </div>
        </div>

        {/* Center: Sound Accessibility Notice */}
        <div className="flex items-center gap-2">
          {visualSoundNotice && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-900 border border-teal-300 font-mono text-[11px] animate-pulse">
              <Volume2 className="w-3 h-3 text-teal-700" />
              <span>{visualSoundNotice}</span>
            </div>
          )}
        </div>

        {/* Right: Time, Diagnostics & Sound Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-600 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>14:28:40</span>
          </div>
          <span className="text-slate-300">|</span>

          {/* Mute button */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio Alert' : 'Mute Audio Alert'}
            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-teal-600" />}
          </button>
        </div>
      </div>

      {/* 2. Main Automotive Dashboard Display Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-6 bg-slate-50/30">
        {/* Left Col: Current Speed & Controlled Speed Response (3 cols) */}
        <div className="lg:col-span-3 flex flex-col justify-between p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div>
            <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase flex items-center justify-between">
              <span>CURRENT SPEED</span>
              <span className="text-slate-400 font-mono">GPS CALIBRATED</span>
            </div>

            {/* Huge Readable Speedometer Digits */}
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-6xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
                {Math.round(state.currentSpeed)}
              </span>
              <span className="text-sm font-semibold text-slate-500">km/h</span>
            </div>

            {/* Speed Delta vs Allowed */}
            <div className="mt-2 text-xs font-medium">
              {state.currentSpeed > state.allowedSpeed ? (
                <div className="flex items-center gap-1.5 text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>+{Math.round(state.currentSpeed - state.allowedSpeed)} km/h over allowed limit</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-teal-700">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Compliant with zone restriction</span>
                </div>
              )}
            </div>

            {/* Controlled Speed Response Visualization */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                <span>CONTROLLED SPEED RESPONSE</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${state.controlledSpeedActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-600'}`}>
                  {state.controlledSpeedActive ? 'ACTIVE' : 'STANDBY'}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                Gradual deceleration curve applied upstream of virtual speed boundary:
              </p>

              {/* Deceleration Step Progression */}
              <div className="mt-2.5 p-2 rounded bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 flex items-center justify-center gap-1.5">
                <span className={state.currentSpeed >= 50 ? 'font-bold text-slate-900' : 'text-slate-400'}>52</span>
                <span className="text-slate-400">↓</span>
                <span className={state.currentSpeed < 50 && state.currentSpeed >= 45 ? 'font-bold text-teal-700' : 'text-slate-400'}>48</span>
                <span className="text-slate-400">↓</span>
                <span className={state.currentSpeed < 45 && state.currentSpeed >= 40 ? 'font-bold text-teal-700' : 'text-slate-400'}>43</span>
                <span className="text-slate-400">↓</span>
                <span className={state.currentSpeed < 40 && state.currentSpeed >= 33 ? 'font-bold text-teal-700' : 'text-slate-400'}>37</span>
                <span className="text-slate-400">↓</span>
                <span className={state.currentSpeed <= 32 ? 'font-bold text-teal-800 bg-teal-100 px-1 rounded' : 'text-slate-400'}>30</span>
              </div>
            </div>
          </div>

          {/* Prototype disclaimer */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 leading-tight">
            Digital Twin Prototype · Simulating in-vehicle speed control integration.
          </div>
        </div>

        {/* Center Col: 3D Digital Twin Road Scene + Approach HUD (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          {/* Approach Banner (Color-blind friendly with symbols) */}
          <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-semibold ${approach.color}`}>
            <div className="flex items-center gap-2">
              <span className="text-base leading-none font-bold" aria-hidden="true">{approach.symbol}</span>
              <span className="tracking-wide">{approach.text}</span>
            </div>
            {state.distanceToZone > 0 && !state.isInsideZone && (
              <div className="font-mono text-sm tabular-nums">
                {Math.round(state.distanceToZone)} m
              </div>
            )}
            {state.isInsideZone && (
              <div className="font-mono text-xs">
                {Math.round(state.zoneRemaining)} m REMAINING
              </div>
            )}
          </div>

          {/* 3D Visual Digital Twin Canvas */}
          <div className="w-full h-[320px]">
            <Vehicle3DScene
              vehicleType={state.vehicleType}
              currentSpeed={state.currentSpeed}
              allowedSpeed={state.allowedSpeed}
              distanceToZone={state.distanceToZone}
              currentZone={state.currentZone}
              upcomingZone={state.upcomingZone}
              isInsideZone={state.isInsideZone}
              controlledSpeedActive={state.controlledSpeedActive}
              overrideActive={isOverrideActive}
            />
          </div>

          {/* Zone Distance Bar */}
          {activeZone && (
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium mb-1.5">
                <span>Approach Distance to Virtual Speed Reducer</span>
                <span className="font-mono font-semibold text-slate-900">
                  {state.isInsideZone ? 'INSIDE CONTROLLED ZONE' : `${Math.round(state.distanceToZone)} m to entry`}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    state.isInsideZone ? 'bg-teal-600' : state.distanceToZone < 200 ? 'bg-teal-500' : 'bg-amber-500'
                  }`}
                  style={{
                    width: `${
                      state.isInsideZone
                        ? Math.max(0, Math.min(100, (state.zoneRemaining / (activeZone.length || 900)) * 100))
                        : Math.max(0, Math.min(100, 100 - (state.distanceToZone / 600) * 100))
                    }%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Allowed Speed & Zone Information (3 cols) */}
        <div className="lg:col-span-3 flex flex-col justify-between p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div>
            <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase flex items-center justify-between">
              <span>ALLOWED SPEED</span>
              <span className="text-slate-400 font-mono">LOCAL MAP</span>
            </div>

            {/* Circular Automotive Speed Limit Sign */}
            <div className="mt-3 flex items-center gap-4">
              <div className="w-20 h-20 rounded-full border-4 border-red-600 bg-white flex flex-col items-center justify-center shadow-xs">
                <span className="text-3xl font-bold font-mono text-slate-900 leading-none">
                  {state.allowedSpeed}
                </span>
                <span className="text-[9px] font-bold text-slate-500 mt-0.5">km/h</span>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-900">
                  {activeZone ? activeZone.name : 'Standard Road Limit'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {activeZone?.type === 'temporary' ? (
                    <span className="text-amber-700 font-medium">TEMPORARY ZONE</span>
                  ) : activeZone?.type === 'virtual_hump' ? (
                    <span className="text-teal-700 font-medium">VIRTUAL SPEED HUMP</span>
                  ) : (
                    <span>PERMANENT ZONE</span>
                  )}
                </div>
              </div>
            </div>

            {/* Zone Details */}
            {activeZone ? (
              <div className="mt-5 space-y-2.5 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">ZONE REASON</div>
                  <div className="font-semibold text-slate-800 text-sm mt-0.5 flex items-center gap-1.5">
                    <span className="text-teal-600 font-bold">◇</span>
                    <span>{activeZone.reason}</span>
                  </div>
                  {activeZone.activeHours && (
                    <div className="text-[11px] text-amber-700 font-medium mt-1">
                      Active Hours: {activeZone.activeHours}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">CONTROLLED RANGE</span>
                    <span className="font-mono font-semibold text-slate-800">{activeZone.length} m</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">ZONE STATUS</span>
                    <span className="font-semibold text-teal-800">
                      {state.isInsideZone ? 'ACTIVE' : 'UPCOMING'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 leading-snug">
                  {activeZone.description}
                </div>
              </div>
            ) : (
              <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                No active or upcoming virtual speed zone within local buffer.
              </div>
            )}
          </div>

          {/* Emergency Override Touch Button */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            {isOverrideBlocked ? (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs">
                <div className="flex items-center gap-1.5 text-red-800 font-semibold">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>OVERRIDE BLOCKED</span>
                </div>
                <p className="text-[11px] text-red-700 mt-1">
                  Reason: Safety review required. Please check Vehicle Owner App.
                </p>
              </div>
            ) : isOverrideActive ? (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs">
                <div className="flex items-center justify-between text-red-800 font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>OVERRIDE ACTIVE</span>
                  </span>
                  <span className="font-mono">{formatTime(state.override.timeRemaining)}</span>
                </div>
                <div className="mt-2 space-y-1 text-[10px] text-red-700 font-mono">
                  <div className="flex justify-between">
                    <span>GOV MONITORING:</span>
                    <span className="font-bold">ACTIVE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GPS &amp; IMU:</span>
                    <span className="font-bold">RECORDING</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ROUTE &amp; SPEED:</span>
                    <span className="font-bold">TRANSMITTED</span>
                  </div>
                </div>
                <button
                  onClick={onEmergencyEnd}
                  className="mt-3 w-full py-1.5 px-3 rounded-md bg-white border border-red-300 text-red-700 font-semibold text-xs hover:bg-red-50 transition-colors shadow-2xs"
                >
                  End Emergency Override
                </button>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Request Emergency Override</span>
                </button>
                <span className="block text-[10px] text-slate-400 text-center mt-1.5">
                  Touch control · Subject to municipal telemetry logging
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Bottom Footer Diagnostics Bar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-2.5 border-t border-slate-200 bg-slate-50/70 text-[11px] text-slate-600">
        <div className="flex items-center gap-4 font-mono">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-teal-600" />
            <span>MAP v{state.map.version}</span>
            <span className="text-slate-400">({state.map.storedZones} zones)</span>
          </span>
          <span className="text-slate-300">·</span>
          <span>TEMP ZONES: {state.map.temporaryZones}</span>
          <span className="text-slate-300">·</span>
          <span className="text-teal-700 font-semibold">STATUS: {state.map.status.toUpperCase()}</span>
        </div>

        {/* Technical Sensor Diagnostics */}
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            GPS: ACTIVE
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            IMU: ACTIVE
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            CAMERA: READY
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            LOCAL MAP: SYNCED
          </span>
        </div>
      </div>

      {/* Emergency Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-50 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Emergency Override Request</h4>
                <p className="text-xs text-slate-500">In-Vehicle Integrated Touch Control</p>
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>Notice:</strong> Use only for genuine emergencies (medical, safety, urgent transport). Vehicle telemetry, speed curve, and GPS route will be logged and transmitted for post-event municipal audit.
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  onEmergencyRequest();
                  onEmergencyConfirm();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors"
              >
                Confirm Emergency Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
