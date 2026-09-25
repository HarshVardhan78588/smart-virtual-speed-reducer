import React from 'react';
import { X, Bell, AlertTriangle, AlertOctagon, Info, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useTrafficSystem } from '../../context/TrafficSystemContext';
import { StatusBadge } from './StatusBadge';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose
}) => {
  const { events, setActiveTab, selectVehicle } = useTrafficSystem();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white border-l border-slate-200 shadow-2xl flex flex-col text-slate-800 animate-in slide-in-from-right duration-200"
      role="dialog"
      aria-label="System Notifications"
    >
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-teal-700" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Live Command Alerts & Telemetry
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          aria-label="Close notifications"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 border-b border-slate-100 bg-slate-50/60 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Real-time V2X audit stream</span>
        <span className="font-mono text-teal-700 font-semibold">{events.length} events logged</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {events.map(ev => {
          const isCritical = ev.severity === 'critical';
          const isWarning = ev.severity === 'warning';

          return (
            <div
              key={ev.id}
              className={`p-3 rounded-xl border text-xs transition-all ${
                isCritical
                  ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300'
                  : isWarning
                  ? 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-mono text-[10px] text-slate-500">{ev.timestamp}</span>
                <StatusBadge status={ev.severity} size="sm" />
              </div>

              <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                {isCritical && <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                {isWarning && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                <span>{ev.title}</span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
                {ev.description}
              </p>

              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px] text-slate-500">
                <span className="font-mono">Target: {ev.targetId}</span>
                {ev.targetType === 'vehicle' && (
                  <button
                    onClick={() => {
                      selectVehicle(ev.targetId);
                      setActiveTab('vehicles');
                      onClose();
                    }}
                    className="text-teal-700 hover:text-teal-900 font-semibold underline underline-offset-2"
                  >
                    Inspect Telemetry →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <button
          onClick={() => {
            setActiveTab('activity');
            onClose();
          }}
          className="w-full py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-center shadow-xs"
        >
          View Full Audit Log
        </button>
      </div>
    </div>
  );
};
