import React, { useState } from 'react';
import { VehicleState } from '../../types/vehicle';
import { ShieldAlert, AlertTriangle, CheckCircle2, Lock, Radio } from 'lucide-react';

interface RetrofitDashboardProps {
  state: VehicleState;
  onPhysicalEmergencyPress: () => void;
  onEmergencyEnd: () => void;
  visualSoundNotice: string | null;
}

export const RetrofitDashboard: React.FC<RetrofitDashboardProps> = ({
  state,
  onPhysicalEmergencyPress,
  onEmergencyEnd,
  visualSoundNotice,
}) => {
  const [buttonPressedVisual, setButtonPressedVisual] = useState(false);
  const [lastHardwareSignal, setLastHardwareSignal] = useState<string | null>(null);

  const isOverrideActive = state.override.status === 'active';
  const isOverrideBlocked = state.override.status === 'blocked';
  const activeZone = state.currentZone || state.upcomingZone;

  const handleButtonClick = () => {
    setButtonPressedVisual(true);
    setLastHardwareSignal('GPIO_PIN_18 [PULLUP] → INTERRUPT: PRESSED (Active Low)');

    setTimeout(() => {
      setButtonPressedVisual(false);
    }, 300);

    onPhysicalEmergencyPress();
  };

  // Determine Retrofit State & Visuals
  const getRetrofitState = () => {
    if (isOverrideBlocked) {
      return {
        title: 'OVERRIDE BLOCKED',
        symbol: '🔒',
        sub: 'CHECK OWNER APP',
        bg: 'bg-stone-900 border-red-500/80 text-red-400',
        textColor: 'text-red-400',
      };
    }
    if (isOverrideActive) {
      return {
        title: 'EMERGENCY OVERRIDE',
        symbol: '□',
        sub: 'MONITORING ACTIVE',
        bg: 'bg-stone-900 border-red-500/80 text-red-400',
        textColor: 'text-red-400',
      };
    }
    if (state.isInsideZone) {
      return {
        title: 'ZONE ACTIVE',
        symbol: '◇',
        sub: `${state.allowedSpeed} km/h CONTROLLED`,
        bg: 'bg-stone-900 border-teal-500/80 text-teal-300',
        textColor: 'text-teal-300',
      };
    }
    if (activeZone) {
      if (state.distanceToZone < 200) {
        return {
          title: 'REDUCE SPEED',
          symbol: '!',
          sub: `${state.allowedSpeed} km/h IN ${Math.round(state.distanceToZone)}m`,
          bg: 'bg-stone-900 border-amber-500/80 text-amber-300',
          textColor: 'text-amber-300',
        };
      }
      return {
        title: 'ZONE AHEAD',
        symbol: '!',
        sub: `${state.allowedSpeed} km/h · ${Math.round(state.distanceToZone)}m`,
        bg: 'bg-stone-900 border-amber-500/80 text-amber-300',
        textColor: 'text-amber-300',
      };
    }
    return {
      title: 'NORMAL',
      symbol: '✓',
      sub: 'SPEED COMPLIANT',
      bg: 'bg-stone-900 border-slate-700 text-emerald-400',
      textColor: 'text-emerald-400',
    };
  };

  const retrofitState = getRetrofitState();

  // Calculate analog speedometer needle angle (-130 deg to +130 deg for 0 to 140 km/h)
  const needleAngle = -130 + (Math.min(state.currentSpeed, 140) / 140) * 260;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Surrounding Context Card */}
      <div className="w-full max-w-5xl rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {/* Context Header */}
        <div className="flex flex-wrap items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50 text-xs">
          <div>
            <span className="font-bold text-slate-800">RETROFIT HARDWARE ARCHITECTURE</span>
            <span className="text-slate-400 mx-2">·</span>
            <span className="text-slate-600">Context: Classic / Non-Touchscreen Automotive Dashboard</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            HARDWARE INTERFACE: SVSR-RETRO-V2
          </div>
        </div>

        {/* Dashboard Surround (Analog Cluster + Retrofit Display + Physical Push Button) */}
        <div className="p-8 bg-gradient-to-b from-stone-900 via-stone-850 to-stone-900 text-stone-100 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle steering wheel rim curve overlay at bottom */}
          <div className="absolute -bottom-48 w-[720px] h-[360px] rounded-t-full border-[28px] border-stone-800/80 pointer-events-none shadow-2xl opacity-60" />

          {/* Instrument Binnacle Hood */}
          <div className="w-full max-w-3xl rounded-3xl bg-stone-950 p-6 border-4 border-stone-800 shadow-2xl relative z-10">
            {/* Cluster Layout: [Analog Tachometer] - [Analog Speedometer] - [RETROFIT DIGITAL MODULE] */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* 1. Classic Analog Speedometer Gauge (6 cols) */}
              <div className="md:col-span-6 flex flex-col items-center p-4 rounded-2xl bg-stone-900 border border-stone-800/80 shadow-inner relative">
                <div className="text-[10px] font-mono tracking-widest text-stone-400 mb-2 uppercase">
                  Vehicle Analog Cluster
                </div>

                {/* Circular Gauge SVG */}
                <div className="relative w-52 h-52">
                  <svg className="w-full h-full" viewBox="0 0 200 200">
                    {/* Dial Ring */}
                    <circle cx="100" cy="100" r="85" fill="none" stroke="#262626" strokeWidth="12" />
                    {/* Major speed tick marks */}
                    {[0, 20, 40, 60, 80, 100, 120, 140].map((val) => {
                      const angle = (-130 + (val / 140) * 260) * (Math.PI / 180);
                      const x1 = 100 + Math.cos(angle) * 76;
                      const y1 = 100 + Math.sin(angle) * 76;
                      const x2 = 100 + Math.cos(angle) * 65;
                      const y2 = 100 + Math.sin(angle) * 65;
                      const textX = 100 + Math.cos(angle) * 54;
                      const textY = 100 + Math.sin(angle) * 54;
                      return (
                        <g key={val}>
                          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a8a29e" strokeWidth="2.5" />
                          <text
                            x={textX}
                            y={textY + 4}
                            fill="#d6d3d1"
                            fontSize="9"
                            fontFamily="JetBrains Mono, monospace"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Zone Speed Limiter Tick (Marker at allowedSpeed) */}
                    {activeZone && (
                      (() => {
                        const limitAngle = (-130 + (state.allowedSpeed / 140) * 260) * (Math.PI / 180);
                        const lx1 = 100 + Math.cos(limitAngle) * 88;
                        const ly1 = 100 + Math.sin(limitAngle) * 88;
                        const lx2 = 100 + Math.cos(limitAngle) * 72;
                        const ly2 = 100 + Math.sin(limitAngle) * 72;
                        return (
                          <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke="#14b8a6" strokeWidth="4" strokeLinecap="round" />
                        );
                      })()
                    )}

                    {/* Central Hub */}
                    <circle cx="100" cy="100" r="14" fill="#1c1917" stroke="#44403c" strokeWidth="3" />

                    {/* Physical Mechanical Needle */}
                    <line
                      x1="100"
                      y1="100"
                      x2={100 + Math.cos(needleAngle * (Math.PI / 180)) * 74}
                      y2={100 + Math.sin(needleAngle * (Math.PI / 180)) * 74}
                      stroke="#ef4444"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      className="transition-all duration-150"
                    />
                    <circle cx="100" cy="100" r="5" fill="#ef4444" />
                  </svg>

                  {/* Digital Odometer Window inside cluster */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-stone-950 px-2 py-0.5 rounded border border-stone-800 font-mono text-[10px] text-stone-300 tabular-nums">
                    084,921 km
                  </div>
                </div>
              </div>

              {/* 2. Compact RETROFIT DISPLAY UNIT (6 cols) */}
              <div className="md:col-span-6 flex flex-col items-center">
                {/* Physical Mounting Bracket Box */}
                <div className="w-full max-w-sm rounded-2xl bg-stone-950 p-4 border-2 border-stone-700 shadow-2xl relative">
                  {/* Bracket screws for realistic hardware appearance */}
                  <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-stone-700 border border-stone-600 flex items-center justify-center text-[6px] text-stone-400">✕</div>
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-stone-700 border border-stone-600 flex items-center justify-center text-[6px] text-stone-400">✕</div>
                  <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-stone-700 border border-stone-600 flex items-center justify-center text-[6px] text-stone-400">✕</div>
                  <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-stone-700 border border-stone-600 flex items-center justify-center text-[6px] text-stone-400">✕</div>

                  {/* Brand / Hardware Label */}
                  <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-[9px] font-mono tracking-wider text-stone-400 uppercase">
                      SVSR RETROFIT UNIT
                    </span>
                    <span className="flex items-center gap-1 text-[8px] font-mono text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      CAN SYNC
                    </span>
                  </div>

                  {/* The Physical Retrofit LCD Display Screen */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${retrofitState.bg} shadow-inner`}>
                    {/* Top Row: Symbol & Status Label */}
                    <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold font-mono leading-none">
                          {retrofitState.symbol}
                        </span>
                        <span className="text-xs font-bold tracking-wider font-mono">
                          {retrofitState.title}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-stone-400">
                        {state.map.district}
                      </div>
                    </div>

                    {/* Middle: Big Clean Digits (Large speed number, zone distance) */}
                    <div className="my-4 flex items-center justify-between">
                      {/* Current Speed / Allowed Speed */}
                      <div>
                        <div className="text-[9px] font-mono text-stone-400 uppercase">
                          {activeZone ? 'ZONE LIMIT' : 'CURRENT'}
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-5xl font-bold font-mono tabular-nums leading-none ${retrofitState.textColor}`}>
                            {activeZone ? state.allowedSpeed : Math.round(state.currentSpeed)}
                          </span>
                          <span className="text-xs font-mono text-stone-400">km/h</span>
                        </div>
                      </div>

                      {/* Distance Countdown */}
                      <div className="text-right">
                        <div className="text-[9px] font-mono text-stone-400 uppercase">DISTANCE</div>
                        {activeZone && !state.isInsideZone ? (
                          <div className="flex items-baseline gap-1 justify-end">
                            <span className="text-3xl font-bold font-mono text-stone-100 tabular-nums">
                              {Math.round(state.distanceToZone)}
                            </span>
                            <span className="text-xs font-mono text-stone-400">m</span>
                          </div>
                        ) : state.isInsideZone ? (
                          <div className="text-sm font-mono font-bold text-teal-400">
                            {Math.round(state.zoneRemaining)}m REM
                          </div>
                        ) : (
                          <div className="text-sm font-mono text-stone-500">--</div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Minimalist Status Kicker */}
                    <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-stone-300">{retrofitState.sub}</span>
                      {activeZone && (
                        <span className="text-stone-400">{activeZone.reason}</span>
                      )}
                    </div>
                  </div>

                  {/* Sound indicator in screen */}
                  {visualSoundNotice && (
                    <div className="mt-2 text-center text-[10px] font-mono text-teal-400 bg-teal-950/60 py-1 rounded border border-teal-800 animate-pulse">
                      🔊 {visualSoundNotice}
                    </div>
                  )}
                </div>

                {/* 3. PHYSICAL EMERGENCY BUTTON MOUNTED NEAR DISPLAY */}
                <div className="mt-5 flex flex-col items-center">
                  <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 flex items-center gap-4 shadow-xl">
                    {/* The Tactile Push Button */}
                    <button
                      onClick={handleButtonClick}
                      disabled={isOverrideBlocked}
                      title="Physical Emergency Override Button"
                      className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                        isOverrideBlocked
                          ? 'opacity-50 cursor-not-allowed bg-stone-800 border-2 border-stone-700'
                          : buttonPressedVisual
                          ? 'scale-90 bg-red-800 shadow-inner'
                          : isOverrideActive
                          ? 'bg-red-600 border-4 border-red-400 shadow-lg shadow-red-600/50 animate-pulse'
                          : 'bg-red-600 hover:bg-red-500 border-4 border-stone-700 hover:border-red-400 shadow-lg cursor-pointer'
                      }`}
                    >
                      {/* Tactile button inner core */}
                      <div className="w-10 h-10 rounded-full border-2 border-red-400/80 bg-gradient-to-b from-red-500 to-red-700 flex items-center justify-center">
                        <ShieldAlert className="w-5 h-5 text-white" />
                      </div>
                    </button>

                    <div>
                      <div className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                        <span>PHYSICAL EMERGENCY BUTTON</span>
                        <span className="text-[10px] font-mono text-red-400 bg-red-950/80 px-1.5 py-0.2 rounded border border-red-800">
                          GPIO INT
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">
                        {isOverrideActive
                          ? 'Override Active · Click to End'
                          : 'Press to request onboard emergency override'}
                      </p>
                      {isOverrideActive && (
                        <button
                          onClick={onEmergencyEnd}
                          className="mt-1.5 text-[10px] text-red-400 hover:text-red-300 font-mono underline block"
                        >
                          [ End Override Signal ]
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Hardware Signal Feedback */}
                  {lastHardwareSignal && (
                    <div className="mt-2 text-[10px] font-mono text-stone-400 bg-stone-950 px-3 py-1 rounded border border-stone-800">
                      ⚡ {lastHardwareSignal}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Explanatory Footer Bar for Evaluators */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              <strong>Retrofit Value Proposition:</strong> Older vehicles without high-end infotainment screens gain the identical virtual speed reducer compliance via this low-cost, daylight-readable module.
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
