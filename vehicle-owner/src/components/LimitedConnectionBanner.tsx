import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, HardDrive, ShieldCheck, WifiOff } from 'lucide-react';

export const LimitedConnectionBanner: React.FC = () => {
  const { connectionState, mapSyncState, vehicle } = useApp();

  if (connectionState === 'connected' || connectionState === 'syncing') {
    return null;
  }

  const isLimited = connectionState === 'limited';

  return (
    <div
      role="alert"
      className={`border-b px-4 py-2.5 sm:px-6 transition-colors ${
        isLimited
          ? 'bg-amber-50/90 border-amber-200/80 text-amber-950'
          : 'bg-slate-100 border-slate-300 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="mt-0.5 sm:mt-0 p-1 rounded bg-white/80 border border-current shrink-0">
            {isLimited ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-slate-700" />
            )}
          </div>
          <div>
            <div className="font-semibold flex items-center gap-1.5">
              <span>{isLimited ? '! LIMITED CLOUD TELEMETRY' : '× OFFLINE SAFETY MODE'}</span>
              <span className="font-normal text-slate-600">·</span>
              <span className="font-normal text-slate-700">
                {isLimited
                  ? 'Cloud telemetry upload delayed, but vehicle local protection is active.'
                  : 'App is offline, but on-board hardware continues autonomous speed zone control.'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-slate-600 text-[11px]">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-slate-500" />
                <span>Stored local speed-zone data:</span>
                <strong className="text-slate-800">Available ({mapSyncState.totalZones} zones)</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Last synchronized map: <strong className="text-slate-800">{mapSyncState.lastUpdated}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Map version: <strong className="font-mono text-slate-800">{mapSyncState.version}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-center bg-white/90 border border-slate-200 px-2.5 py-1 rounded text-[11px] text-slate-700 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
          <span>On-Board Speed Governor: Ready</span>
        </div>
      </div>
    </div>
  );
};
