import React, { useState } from 'react';
import { VehicleState } from '../../types/vehicle';
import { ShieldAlert, AlertTriangle, CheckCircle2, Lock, Radio } from 'lucide-react';

interface TwoWheelerDashboardProps {
  state: VehicleState;
  onPhysicalEmergencyPress: () => void;
  onEmergencyEnd: () => void;
  visualSoundNotice: string | null;
}

export const TwoWheelerDashboard: React.FC<TwoWheelerDashboardProps> = ({
  state,
  onPhysicalEmergencyPress,
  onEmergencyEnd,
  visualSoundNotice,
}) => {
  const [btnPressed, setBtnPressed] = useState(false);
  const [handlebarSignal, setHandlebarSignal] = useState<string | null>(null);

  const isOverrideActive = state.override.status === 'active';
  const isOverrideBlocked = state.override.status === 'blocked';
  const activeZone = state.currentZone || state.upcomingZone;

  const handleButtonPress = () => {
    setBtnPressed(true);
    setHandlebarSignal('SWITCHGEAR_LEFT [PIN_4] → EMERGENCY_INTERRUPT: FIRED');

    setTimeout(() => {
      setBtnPressed(false);
    }, 300);

    onPhysicalEmergencyPress();
  };

  // Determine State Configuration
  const getDisplayState = () => {
    if (isOverrideBlocked) {
      return {
        status: 'OVERRIDE BLOCKED',
        symbol: '🔒',
        colorClass: 'text-red-400 border-red-500 bg-stone-950',
        textColor: 'text-red-400',
        badge: 'BLOCKED',
      };
    }
    if (isOverrideActive) {
      return {
        status: 'EMERGENCY OVERRIDE',
        symbol: '□',
        colorClass: 'text-red-400 border-red-500 bg-stone-950',
        textColor: 'text-red-400',
        badge: 'ACTIVE',
      };
    }
    if (state.isInsideZone) {
      return {
        status: 'ZONE ACTIVE',
        symbol: '◇',
        colorClass: 'text-teal-300 border-teal-500 bg-stone-950',
        textColor: 'text-teal-300',
        badge: `${state.allowedSpeed} LIMIT`,
      };
    }
    if (activeZone) {
      if (state.distanceToZone < 200) {
        return {
          status: 'REDUCE SPEED',
          symbol: '!',
          colorClass: 'text-amber-300 border-amber-500 bg-stone-950',
          textColor: 'text-amber-300',
          badge: 'BRAKE',
        };
      }
      return {
        status: 'ZONE AHEAD',
        symbol: '!',
        colorClass: 'text-amber-300 border-amber-500 bg-stone-950',
        textColor: 'text-amber-300',
        badge: 'AHEAD',
      };
    }
    return {
      status: 'NORMAL',
      symbol: '✓',
      colorClass: 'text-emerald-400 border-emerald-500 bg-stone-950',
      textColor: 'text-emerald-400',
      badge: 'SAFE',
    };
  };

  const ds = getDisplayState();

  return (
    <div className="w-full flex flex-col items-center">
      {/* Surrounding Context Wrapper */}
      <div className="w-full max-w-4xl rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50 text-xs">
          <div>
            <span className="font-bold text-slate-800">TWO-WHEELER HARDWARE ARCHITECTURE</span>
            <span className="text-slate-400 mx-2">·</span>
            <span className="text-slate-600">Context: Motorcycle &amp; Scooter Handlebar Mounting</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            WEATHERPROOF RUGGEDIZED DISPLAY
          </div>
        </div>

        {/* Motorcycle Handlebar Cockpit Mockup */}
        <div className="p-8 bg-gradient-to-b from-stone-900 via-neutral-900 to-stone-950 text-stone-100 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Handlebar Top Triple Clamp & Tubing Simulation */}
          <div className="relative w-full max-w-2xl flex items-center justify-between py-6">
            {/* Left Handlebar Tube & Grip */}
            <div className="flex items-center gap-2">
              {/* Grip */}
              <div className="w-20 h-9 rounded-l-md bg-stone-800 border-y-2 border-l-2 border-stone-700 flex items-center justify-center shadow-md">
                <div className="w-full h-full flex justify-between px-1.5 items-center">
                  <div className="w-1 h-5 bg-stone-700 rounded-xs" />
                  <div className="w-1 h-5 bg-stone-700 rounded-xs" />
                  <div className="w-1 h-5 bg-stone-700 rounded-xs" />
                </div>
              </div>

              {/* Left Switchgear Cluster (Houses the Physical Emergency Button) */}
              <div className="p-2 rounded-xl bg-stone-950 border-2 border-stone-800 flex flex-col items-center gap-2 shadow-xl">
                <span className="text-[8px] font-mono text-stone-400">EMERGENCY</span>
                {/* Physical Waterproof Handlebar Button */}
                <button
                  onClick={handleButtonPress}
                  disabled={isOverrideBlocked}
                  title="Handlebar Physical Emergency Button"
                  className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    isOverrideBlocked
                      ? 'opacity-40 cursor-not-allowed bg-stone-800'
                      : btnPressed
                      ? 'scale-85 bg-red-800 shadow-inner'
                      : isOverrideActive
                      ? 'bg-red-600 border-2 border-red-400 shadow-lg shadow-red-600/50 animate-pulse'
                      : 'bg-red-600 hover:bg-red-500 border-2 border-red-400/60 shadow-md cursor-pointer'
                  }`}
                >
                  <ShieldAlert className="w-5 h-5 text-white" />
                </button>
                <span className="text-[7px] font-mono text-stone-400">PUSH</span>
              </div>

              {/* Handlebar Metal Tubing */}
              <div className="h-5 w-16 bg-gradient-to-b from-stone-400 via-stone-300 to-stone-500 rounded-sm shadow-xs" />
            </div>

            {/* Central Mounted Two-Wheeler Display Unit */}
            <div className="relative z-10 w-72 rounded-2xl bg-stone-950 p-3.5 border-4 border-stone-700 shadow-2xl">
              {/* Top mount screws */}
              <div className="flex justify-between items-center px-1 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
                <span className="text-[8px] font-mono tracking-widest text-stone-400 uppercase">
                  SVSR MOTO-CLUSTER
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
              </div>

              {/* High-Contrast Sunlight-Readable Two-Wheeler Display */}
              <div className={`p-4 rounded-xl border-2 ${ds.colorClass} shadow-inner`}>
                {/* Top: Status & Symbol */}
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold font-mono leading-none">
                      {ds.symbol}
                    </span>
                    <span className="text-xs font-bold font-mono tracking-wider">
                      {ds.status}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 font-bold">
                    {ds.badge}
                  </span>
                </div>

                {/* Primary Speed & Limit */}
                <div className="my-3 flex items-center justify-between">
                  {/* Current Speed Big Digits */}
                  <div>
                    <div className="text-[9px] font-mono text-stone-400 uppercase">SPEED</div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-6xl font-black font-mono tabular-nums leading-none ${ds.textColor}`}>
                        {Math.round(state.currentSpeed)}
                      </span>
                      <span className="text-[10px] font-mono text-stone-400">km/h</span>
                    </div>
                  </div>

                  {/* Allowed Speed Limit Badge */}
                  <div className="flex flex-col items-end">
                    <div className="text-[9px] font-mono text-stone-400 uppercase">LIMIT</div>
                    <div className="px-2.5 py-1 rounded-lg border-2 border-red-500 bg-stone-900 flex items-center gap-1">
                      <span className="text-2xl font-bold font-mono text-stone-100 tabular-nums leading-none">
                        {state.allowedSpeed}
                      </span>
                      <span className="text-[8px] font-mono text-stone-400">km/h</span>
                    </div>
                  </div>
                </div>

                {/* Distance to Zone or Zone Name */}
                <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs font-mono">
                  {activeZone && !state.isInsideZone ? (
                    <>
                      <span className="text-stone-400">ZONE IN:</span>
                      <span className="font-bold text-stone-100 text-sm tabular-nums">
                        {Math.round(state.distanceToZone)} m
                      </span>
                    </>
                  ) : state.isInsideZone ? (
                    <>
                      <span className="text-teal-400">CONTROLLED:</span>
                      <span className="font-bold text-teal-300 text-sm tabular-nums">
                        {Math.round(state.zoneRemaining)} m
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-stone-400">STATUS:</span>
                      <span className="text-emerald-400 font-semibold">ALL CLEAR</span>
                    </>
                  )}
                </div>
              </div>

              {/* Sound visual reminder */}
              {visualSoundNotice && (
                <div className="mt-2 text-center text-[10px] font-mono text-teal-400 bg-teal-950/80 py-1 rounded border border-teal-800 animate-pulse">
                  🔊 {visualSoundNotice}
                </div>
              )}
            </div>

            {/* Right Handlebar Tube & Throttle Grip */}
            <div className="flex items-center gap-2">
              {/* Handlebar Metal Tubing */}
              <div className="h-5 w-16 bg-gradient-to-b from-stone-400 via-stone-300 to-stone-500 rounded-sm shadow-xs" />

              {/* Throttle Grip */}
              <div className="w-24 h-9 rounded-r-md bg-stone-800 border-y-2 border-r-2 border-stone-700 flex items-center justify-center shadow-md">
                <div className="w-full h-full flex justify-between px-1.5 items-center">
                  <div className="w-1 h-5 bg-stone-700 rounded-xs" />
                  <div className="w-1 h-5 bg-stone-700 rounded-xs" />
                  <div className="w-1 h-5 bg-stone-700 rounded-xs" />
                  <div className="w-1 h-5 bg-stone-700 rounded-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* Signal Feedback Line */}
          {handlebarSignal && (
            <div className="mt-2 text-[10px] font-mono text-stone-400 bg-stone-950 px-3 py-1 rounded border border-stone-800">
              ⚡ {handlebarSignal}
            </div>
          )}

          {isOverrideActive && (
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs font-mono text-red-400">EMERGENCY OVERRIDE ACTIVE</span>
              <button
                onClick={onEmergencyEnd}
                className="text-xs text-stone-300 hover:text-white underline font-mono"
              >
                [ End Override ]
              </button>
            </div>
          )}
        </div>

        {/* Footer Explanatory Note */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              <strong>Two-Wheeler Safety Strategy:</strong> Rider attention is paramount. The ultra-large typography and single-glance symbols prevent helmet distraction while enforcing the exact same virtual speed zones.
            </span>
          </div>
          <div className="font-mono text-[11px] text-slate-500 shrink-0">
            COMMON CONTROLLER BUS
          </div>
        </div>
      </div>
    </div>
  );
};
