import React, { useState } from 'react';
import { DigitalTwinMap } from '../components/map/DigitalTwinMap';
import { useTrafficSystem } from '../context/TrafficSystemContext';
import {
  Layers,
  Car,
  Compass,
  Radio,
  ShieldCheck,
  AlertTriangle,
  Info,
  Sliders,
  Sparkles
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';

export const DigitalMapPage: React.FC = () => {
  const { zones, vehicles, overrides } = useTrafficSystem();
  const [showLegend, setShowLegend] = useState<boolean>(true);

  return (
    <div className="space-y-4 pb-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Full-Screen GIS Digital Twin Command Map
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold">
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive spatial road network displaying active virtual speed zones, physical hump replacements, and real-time vehicle V2X telematics. Use "Select on Map" to create zones visually.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              showLegend
                ? 'bg-slate-100 text-slate-900 border-slate-300'
                : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Map Legend</span>
          </button>
        </div>
      </div>

      {/* Map Canvas with full screen height */}
      <div className="relative">
        <DigitalTwinMap isFullScreen={true} />

        {/* Floating Accessible Map Legend */}
        {showLegend && (
          <div className="absolute bottom-4 left-4 z-20 w-80 rounded-xl bg-white/95 border border-slate-200 shadow-xl p-4 text-xs backdrop-blur-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 uppercase text-[11px]">
                Color-Blind Accessible Legend
              </span>
              <span className="text-[10px] font-mono text-teal-700 font-semibold">SYM-V2</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-3 rounded bg-amber-100 border border-amber-400 flex items-center justify-center">
                  <div className="w-2 h-0.5 bg-amber-600" />
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold text-slate-900">Temporary Zone: </span>
                  Diagonal pattern + 30 km/h sign
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-6 h-3 rounded bg-teal-100 border border-teal-500 flex items-center justify-center">
                  <div className="w-2 h-0.5 bg-teal-700" />
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold text-slate-900">Permanent Zone: </span>
                  Crosshatch + Hospital priority
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-6 h-3 rounded bg-emerald-100 border border-emerald-500 flex items-center justify-center">
                  <div className="w-2 h-0.5 bg-emerald-700" />
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold text-slate-900">Virtual Hump: </span>
                  Deceleration ripple lines
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-600 border border-white flex items-center justify-center text-[8px] font-bold text-white shadow-xs">
                  •
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold text-slate-900">Nominal Vehicle: </span>
                  Compliant speed profile
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-amber-500 border border-white flex items-center justify-center text-[8px] font-bold text-white animate-pulse shadow-xs">
                  !
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold text-slate-900">Active Override: </span>
                  Surveillance perimeter ring
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
