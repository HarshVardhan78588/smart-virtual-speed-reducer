import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Eye,
  Activity,
  Compass,
  Clock,
  Car,
  AlertOctagon,
  Sparkles,
  CheckCircle2,
  FileCheck,
  RotateCcw,
  Ban,
  ArrowUpRight,
  HelpCircle
} from 'lucide-react';
import { useTrafficSystem } from '../context/TrafficSystemContext';
import { EmergencyOverride, OverrideStatus, RiskLevel } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const EmergencyOverridesPage: React.FC = () => {
  const {
    overrides,
    flagOverride,
    blockOverride,
    restoreOverride,
    requestUserVerification,
    selectVehicle,
    setActiveTab,
    currentUser
  } = useTrafficSystem();

  const [selectedOverrideId, setSelectedOverrideId] = useState<string>(overrides[0]?.id || '');
  const [blockModalOpen, setBlockModalOpen] = useState<boolean>(false);
  const [blockReasonInput, setBlockReasonInput] = useState<string>(
    'Suspicious repeated usage and high-speed overspeeding outside declared hospital corridor'
  );

  const selectedOverride = overrides.find(o => o.id === selectedOverrideId) || overrides[0];

  const handleExecuteBlock = () => {
    if (!selectedOverride) return;
    blockOverride(selectedOverride.id, blockReasonInput);
    setBlockModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-800 font-bold mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Dedicated Emergency Override Control Center</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Emergency Speed Override & AI Misuse Surveillance
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Allows citizens in severe distress (medical transport, police intercept) to temporarily relax virtual speed governor restrictions (max 2–3 hours). Continuous telematics stream evaluates IMU gyro stability, GPS routing deviations, and flags suspicious misuse for government review.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-xs">
            <span className="text-slate-500">AUTHORITY: </span>
            <span className="text-teal-800 font-bold">{currentUser.name}</span>
          </div>
        </div>
      </div>

      {/* AI MISUSE MONITORING BANNER (Prototype Simulation) */}
      <div className="p-4 rounded-xl bg-white border border-teal-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                AI Misuse Monitoring: Active
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 font-semibold">
                PROTOTYPE SIMULATION
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
              Neural trajectory evaluator comparing live vehicle telemetry against declared medical destinations. Flags excessive duration, repeated requests, and aggressive acceleration patterns in pedestrian zones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 text-xs">
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase">AI CONFIDENCE:</div>
            <div className="text-base font-bold font-mono text-teal-800">92% Precision</div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase">AUDIT ENGINE:</div>
            <div className="text-xs font-mono text-emerald-700 font-semibold">ISO/IEC TS 22283</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Override Selection List on Left, Comprehensive Inspection & Action Center on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Overrides Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Override Queue ({overrides.length})
            </h2>
            <span className="text-[10px] font-mono text-teal-700 font-semibold">
              {overrides.filter(o => o.status === 'under_review').length} Under Review
            </span>
          </div>

          <div className="space-y-2.5">
            {overrides.map(ovr => {
              const isSelected = selectedOverride?.id === ovr.id;
              const isHighRisk = ovr.aiRiskLevel === 'high';
              const isBlocked = ovr.status === 'blocked';

              return (
                <div
                  key={ovr.id}
                  onClick={() => setSelectedOverrideId(ovr.id)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/50 shadow-md ring-1 ring-teal-500'
                      : isBlocked
                      ? 'border-rose-200 bg-rose-50/40 hover:bg-rose-50/70'
                      : isHighRisk
                      ? 'border-amber-200 bg-amber-50/40 hover:bg-amber-50/70'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-mono text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Car className="w-3.5 h-3.5 text-teal-700" />
                        {ovr.vehicleId}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{ovr.plateNumber}</div>
                    </div>
                    <StatusBadge status={ovr.status} size="sm" />
                  </div>

                  <div className="text-slate-700 font-medium line-clamp-1 mb-2">
                    {ovr.declaredReason}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Speed:</span>
                      <span className={ovr.currentSpeed > ovr.speedLimit ? 'text-rose-700 font-bold' : 'text-slate-800'}>
                        {ovr.currentSpeed} km/h (Limit: {ovr.speedLimit})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">AI Risk Level:</span>
                      <span className={isHighRisk ? 'text-rose-700 font-bold' : 'text-emerald-700'}>
                        {ovr.aiRiskLevel.toUpperCase()} ({ovr.aiRiskConfidence}%)
                      </span>
                    </div>
                  </div>

                  {ovr.status === 'blocked' && (
                    <div className="mt-2.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-[10px] text-rose-900 font-bold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>BLOCKED: {ovr.blockReason}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Telemetry Audit, AI Risk Breakdown, and Action Bar */}
        {selectedOverride && (
          <div className="lg:col-span-2 space-y-5">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold">
                    ACTIVE EMERGENCY OVERRIDE TELEMETRY
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                    <span>{selectedOverride.vehicleId}</span>
                    <span className="text-xs font-mono font-normal text-slate-500">
                      ({selectedOverride.plateNumber})
                    </span>
                    <StatusBadge status={selectedOverride.status} size="sm" />
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      selectVehicle(selectedOverride.vehicleId);
                      setActiveTab('map');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5 text-teal-700" />
                    <span>Track on Map</span>
                  </button>
                </div>
              </div>

              {/* Core Telemetry Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Current Speed:</span>
                  <div className="text-xl font-black font-mono text-slate-900 tabular-nums">
                    {selectedOverride.currentSpeed} <span className="text-xs font-normal text-slate-500">km/h</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Zone Limit: {selectedOverride.speedLimit} km/h</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Time Remaining:</span>
                  <div className="text-xl font-black font-mono text-teal-800 tabular-nums">
                    {Math.floor(selectedOverride.remainingSeconds / 60)} <span className="text-xs font-normal text-slate-500">min</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Max 120 min duration</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Movement Status:</span>
                  <div className="text-sm font-bold text-slate-900 capitalize mt-1">
                    {selectedOverride.movementStatus.replace('_', ' ')}
                  </div>
                  <span className="text-[10px] text-slate-500">IMU Gyro Active</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">AI Risk Confidence:</span>
                  <div className="text-xl font-black font-mono text-rose-700 tabular-nums">
                    {selectedOverride.aiRiskConfidence}%
                  </div>
                  <span className="text-[10px] font-bold uppercase text-amber-800">
                    {selectedOverride.aiRiskLevel} Risk
                  </span>
                </div>
              </div>

              {/* Context Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="text-slate-500 text-[10px] font-mono uppercase">Declared Justification:</div>
                  <div className="text-slate-900 font-medium">{selectedOverride.declaredReason}</div>
                  <div className="text-slate-500 pt-1 text-[11px]">
                    Destination: <span className="text-slate-800 font-medium">{selectedOverride.declaredDestination}</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Driver: <span className="text-slate-800 font-medium">{selectedOverride.driverName}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="text-slate-500 text-[10px] font-mono uppercase">Telemetry Coordinates:</div>
                  <div className="text-slate-900 font-medium">{selectedOverride.currentLocation}</div>
                  <div className="text-slate-500 pt-1 text-[11px]">
                    Current Geofence:{' '}
                    <span className="text-teal-800 font-mono font-medium">
                      {selectedOverride.currentZoneName || 'Unrestricted Roadway'}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Override Initiated: <span className="text-slate-800 font-mono font-medium">{selectedOverride.startTime}</span>
                  </div>
                </div>
              </div>

              {/* AI Risk Indicators Panel */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                      Simulated AI Risk Evaluation Indicators
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-800 font-semibold">
                    Confidence: {selectedOverride.aiRiskConfidence}%
                  </span>
                </div>

                <ul className="space-y-1.5 text-xs text-amber-900">
                  {selectedOverride.riskIndicators.map((indicator, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{indicator}</span>
                    </li>
                  ))}
                </ul>

                <div className="text-[11px] text-amber-800 pt-2 border-t border-amber-200/80 italic">
                  Note: Prototype simulation. If telemetry corroborates misuse, authority can block override privilege or require citizen verification.
                </div>
              </div>

              {/* Authority Decision / Action Bar */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Government Authority Enforcement Actions
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Operator: {currentUser.name}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  {/* Action 1: Flag / Move to Review */}
                  <button
                    onClick={() => flagOverride(selectedOverride.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-700" />
                    <span>Flag Under Review</span>
                  </button>

                  {/* Action 2: Request User Verification */}
                  <button
                    onClick={() => requestUserVerification(selectedOverride.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-100 hover:bg-sky-200 border border-sky-300 text-sky-900 text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-sky-700" />
                    <span>Request User Verification</span>
                  </button>

                  {/* Action 3: Temporarily Block */}
                  <button
                    onClick={() => setBlockModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Block Override</span>
                  </button>

                  {/* Action 4: Restore Access */}
                  <button
                    onClick={() => restoreOverride(selectedOverride.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-900 text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Restore & Clear</span>
                  </button>
                </div>

                {/* Explanation about Vehicle Owner App feedback */}
                {selectedOverride.status === 'blocked' && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-rose-950">
                      <Lock className="w-4 h-4 text-rose-600" />
                      OVERRIDE PRIVILEGES CURRENTLY BLOCKED FOR THIS VEHICLE
                    </div>
                    <p className="text-[11px] text-rose-800 leading-relaxed">
                      Reason: "{selectedOverride.blockReason}". Vehicle speed governors have been forcibly re-engaged to standard zone limits. The vehicle owner has been prompted in their separate Vehicle Owner App to submit a formal explanation / medical proof.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Block Confirmation Modal */}
      {blockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white border border-rose-300 shadow-2xl p-6 text-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <Lock className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">
                Block Emergency Override Access
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are executing an authoritative enforcement lock on vehicle{' '}
              <span className="font-mono font-bold text-slate-900">{selectedOverride.vehicleId}</span> ({selectedOverride.plateNumber}).
              This will immediately reinstate full virtual speed governors and alert the driver.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Reason for Enforcement Block:
              </label>
              <textarea
                rows={3}
                value={blockReasonInput}
                onChange={e => setBlockReasonInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-rose-600 focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setBlockModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteBlock}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
              >
                Confirm Enforcement Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
