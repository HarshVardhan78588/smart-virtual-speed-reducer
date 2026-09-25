import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileCheck,
  ShieldCheck,
  Layers,
  Car
} from 'lucide-react';
import { useTrafficSystem } from '../../context/TrafficSystemContext';

export const PublishModal: React.FC = () => {
  const {
    isPublishModalOpen,
    closePublishModal,
    publishZoneUpdates,
    zones,
    vehicles,
    currentUser,
    pendingPublishCount
  } = useTrafficSystem();

  const [pin, setPin] = useState<string>('2026'); // pre-filled for rapid judge review
  const [notes, setNotes] = useState<string>('Routine digital zone enforcement sync');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [publishResult, setPublishResult] = useState<{
    success: boolean;
    message: string;
    affectedVehicles: number;
    affectedZones: number;
    timestamp: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isPublishModalOpen) return null;

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await publishZoneUpdates(pin, notes);
      if (res.success) {
        setPublishResult(res);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err) {
      setErrorMessage('Failed to transmit cryptographic payload to edge mesh.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPublishResult(null);
    setErrorMessage('');
    closePublishModal();
  };

  const draftZones = zones.filter(z => z.isDraft || z.status === 'draft');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-modal-title"
    >
      <div className="w-full max-w-lg rounded-xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <UploadCloud className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id="publish-modal-title" className="text-sm font-bold text-slate-900 tracking-tight">
                Authority Verification & Publish Workflow
              </h2>
              <div className="text-[11px] font-mono text-slate-500">
                National Smart Virtual Speed Reducer Gateway
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {publishResult ? (
          /* SUCCESS STATE */
          <div className="p-6 space-y-5">
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <div className="text-sm font-bold text-emerald-950 mb-1">
                  Zone update published successfully.
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Cryptographic zone payload distributed via V2X radio beacons and cellular mesh to all local in-vehicle telematics units.
                </p>
              </div>
            </div>

            {/* Verification & Sync Summary */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-[11px] font-mono text-slate-500 uppercase">Updated:</div>
                <div className="text-lg font-bold font-mono text-slate-900 tabular-nums flex items-center gap-1.5 mt-0.5">
                  <Car className="w-4 h-4 text-teal-600" />
                  {publishResult.affectedVehicles} vehicles
                </div>
              </div>

              <div>
                <div className="text-[11px] font-mono text-slate-500 uppercase">Zones Synced:</div>
                <div className="text-lg font-bold font-mono text-slate-900 tabular-nums flex items-center gap-1.5 mt-0.5">
                  <Layers className="w-4 h-4 text-teal-600" />
                  {publishResult.affectedZones} zones
                </div>
              </div>

              <div>
                <div className="text-[11px] font-mono text-slate-500 uppercase">Synchronization:</div>
                <div className="text-xs font-bold font-mono text-emerald-700 pt-1">
                  Just now
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Verified OK</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
              <div className="flex justify-between">
                <span>Verified Authority:</span>
                <span className="text-slate-900 font-mono font-semibold">{currentUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Authorized Badge:</span>
                <span className="text-teal-700 font-mono font-medium">{currentUser.badgeNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>V2X Delivery Protocol:</span>
                <span className="text-slate-900 font-mono">IEEE 802.11p / C-V2X Direct</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleClose}
                className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs"
              >
                Done & Return to Console
              </button>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <form onSubmit={handlePublish} className="p-6 space-y-5">
            {/* Warning / Explanation Banner */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="leading-relaxed">
                <span className="font-semibold text-amber-950">
                  This update will change the active speed-zone data distributed to connected vehicles.
                </span>
                <p className="mt-1 text-amber-800">
                  Onboard vehicle controllers (GPS, IMU, camera vision) will immediately adjust their virtual speed governor targets and driver alerts upon receiving this payload.
                </p>
              </div>
            </div>

            {/* Summary of changes */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-medium">Total Speed Zones in Broadcast:</span>
                <span className="font-mono font-bold text-slate-900">{zones.length} Zones</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-medium">Pending Uncommitted Drafts:</span>
                <span className="font-mono font-bold text-amber-800">
                  {draftZones.length > 0 ? `${draftZones.length} Pending Approval` : 'None (Full Re-sync)'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-medium">Target Connected Vehicles:</span>
                <span className="font-mono font-bold text-teal-700">{vehicles.length} Units Online</span>
              </div>
              {draftZones.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <div className="text-[11px] font-mono text-slate-500 mb-1">Uncommitted items:</div>
                  <ul className="space-y-1">
                    {draftZones.map(d => (
                      <li key={d.id} className="text-[11px] text-slate-700 flex items-center justify-between">
                        <span>• {d.name}</span>
                        <span className="font-mono text-amber-800 font-semibold">{d.speedLimit} km/h</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* PIN Input */}
            <div className="space-y-1.5">
              <label htmlFor="auth-pin" className="block text-xs font-semibold text-slate-800">
                Authority Verification PIN <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  id="auth-pin"
                  type="password"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="Enter 4-digit Authority PIN"
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Prototype verification PIN: <span className="font-mono text-teal-700 font-bold">2026</span> (default) or any 4+ digit code.
              </p>
            </div>

            {/* Broadcast Notes */}
            <div className="space-y-1.5">
              <label htmlFor="broadcast-notes" className="block text-xs font-semibold text-slate-800">
                Audit Log Reason / Notes
              </label>
              <input
                id="broadcast-notes"
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g., Morning school zone schedule adjustment"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !pin}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Radio className="w-4 h-4 animate-spin text-white" />
                    <span>Transmitting Mesh Payload...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize & Publish Payload</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
