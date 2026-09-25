import React, { useState, useEffect } from 'react';
import {
  Radio,
  Bell,
  UploadCloud,
  Clock,
  ChevronDown,
  Layers,
  Sparkles,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useTrafficSystem } from '../../context/TrafficSystemContext';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  onToggleNotifications: () => void;
  unreadAlertsCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleNotifications,
  unreadAlertsCount
}) => {
  const {
    currentUser,
    pendingPublishCount,
    openPublishModal,
    vehicles,
    overrides
  } = useTrafficSystem();

  const { user, logout, isAdminAuthority } = useAuth();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) + ' IST'
      );
      setCurrentDate(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeOverridesCount = overrides.filter(
    o => o.status === 'active' || o.status === 'under_review'
  ).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 text-slate-800 shadow-xs">
      {/* Zone 1: System Title & Authority */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold shrink-0 shadow-xs">
            <Radio className="w-5 h-5 text-teal-600" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm md:text-base font-bold tracking-tight text-slate-900 truncate">
                Smart Virtual Speed Reducer System
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-slate-600 font-medium whitespace-nowrap">
                GOVT COMMAND v2.6
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
              <span className="text-slate-700 font-medium truncate">{currentUser.department}</span>
              <span aria-hidden="true" className="shrink-0">·</span>
              <span className="font-mono text-slate-500 truncate">{currentUser.division}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zone 2: Telemetry State, Mesh Link & Clock (Desktop) */}
      <div className="hidden lg:flex items-center gap-3 text-xs shrink-0 mx-4">
        {/* Network Mesh status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
          </span>
          <span className="font-mono text-slate-600 font-medium">V2X MESH:</span>
          <span className="text-teal-700 font-semibold tracking-wide">SYNCED (24/24)</span>
        </div>

        {/* Live Active Overrides Badge */}
        {activeOverridesCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="font-mono font-medium">OVERRIDES:</span>
            <span className="font-bold tabular-nums text-amber-900">{activeOverridesCount}</span>
          </div>
        )}

        {/* Live Date and Time */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          <span className="text-slate-600 whitespace-nowrap">{currentDate}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="font-mono font-bold text-slate-900 tabular-nums tracking-wide whitespace-nowrap">{currentTime}</span>
        </div>
      </div>

      {/* Zone 3: Actions, Publish Button, Visible Auth Indicator & Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Signed-in Authority Email Indicator (Requirement 9) */}
        {user?.email && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50/80 border border-teal-200 text-teal-800 text-[11px] font-mono shadow-2xs">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="font-medium truncate max-w-[170px]" title={user.email}>
              {user.email}
            </span>
          </div>
        )}

        {/* Publish Update Button */}
        <button
          onClick={openPublishModal}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-xs ${
            pendingPublishCount > 0
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20'
              : 'bg-teal-700 text-white hover:bg-teal-800'
          }`}
          aria-label="Publish Zone Update to Connected Vehicles"
        >
          <UploadCloud className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">Publish Update</span>
          {pendingPublishCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-900 text-amber-300 text-[10px] font-mono font-bold leading-none">
              {pendingPublishCount} Draft
            </span>
          )}
        </button>

        {/* Notification Icon */}
        <button
          onClick={onToggleNotifications}
          className="relative p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open System Alerts"
        >
          <Bell className="w-4 h-4" aria-hidden="true" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* Operator Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 transition-colors"
            aria-expanded={isProfileOpen}
            aria-label="Authority User Profile Menu"
          >
            <div className="w-7 h-7 rounded-md bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-800 font-mono text-xs font-bold shrink-0">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-left hidden xl:block">
              <div className="text-xs font-semibold leading-tight text-slate-900 truncate max-w-[130px]">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500 font-mono leading-tight">{currentUser.badgeNumber}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl p-3.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="pb-2.5 mb-2.5 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 truncate">{currentUser.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shrink-0 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    AUTHENTICATED
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">{currentUser.role}</div>
                {user?.email && (
                  <div className="text-[11px] font-mono text-teal-700 mt-1 font-medium truncate" title={user.email}>
                    {user.email}
                  </div>
                )}
                <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                  UID: {user?.uid || currentUser.id}
                </div>
              </div>
              <div className="space-y-2 text-slate-600 text-[11px]">
                <div className="flex justify-between">
                  <span>Connected Fleet:</span>
                  <span className="font-mono text-slate-900 font-semibold">{vehicles.length} Units</span>
                </div>
                <div className="flex justify-between">
                  <span>Duty Session:</span>
                  <span className="font-mono text-slate-900">Active ({currentUser.lastLogin})</span>
                </div>
                <div className="flex justify-between">
                  <span>Authority Clearance:</span>
                  <span className="font-mono text-emerald-700 font-semibold">
                    {isAdminAuthority ? 'L3 Administrator (Root)' : 'L2 Traffic Officer'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-500">Firebase RTDB:</span>
                  <span className="font-mono text-teal-700 font-semibold text-[10px] bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                    AUTH SESSION ACTIVE
                  </span>
                </div>
              </div>

              {/* Requirement 10: Sign Out / Logout Action */}
              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Lock Console & Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
