import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  Shield,
  Check,
  ChevronDown,
  LogOut,
  Radio,
} from 'lucide-react';
import { ConnectionState } from '../types';

export const TopBar: React.FC = () => {
  const {
    vehicle,
    connectionState,
    setConnectionState,
    unreadNotifsCount,
    isNotifOpen,
    setIsNotifOpen,
    overrideState,
    currentUser,
    logout,
    isLiveFirebaseSync,
  } = useApp();

  const [connDropdownOpen, setConnDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const getConnectionBadge = () => {
    switch (connectionState) {
      case 'connected':
        return {
          symbol: '✓',
          label: isLiveFirebaseSync ? 'Firebase RTDB Live' : 'Connected',
          icon: isLiveFirebaseSync ? (
            <Radio className="w-3.5 h-3.5 text-teal-700 animate-pulse" />
          ) : (
            <Wifi className="w-3.5 h-3.5 text-teal-700" />
          ),
          classes: 'text-teal-800 bg-teal-50 border-teal-200',
        };
      case 'syncing':
        return {
          symbol: '↻',
          label: 'Syncing Zones',
          icon: <RefreshCw className="w-3.5 h-3.5 text-blue-700 animate-spin" />,
          classes: 'text-blue-800 bg-blue-50 border-blue-200',
        };
      case 'limited':
        return {
          symbol: '!',
          label: 'Limited Connection',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />,
          classes: 'text-amber-800 bg-amber-50 border-amber-200',
        };
      case 'offline':
        return {
          symbol: '×',
          label: 'Offline (Local Active)',
          icon: <WifiOff className="w-3.5 h-3.5 text-slate-700" />,
          classes: 'text-slate-800 bg-slate-100 border-slate-300',
        };
    }
  };

  const badge = getConnectionBadge();

  const userInitial = currentUser?.email
    ? currentUser.email.charAt(0).toUpperCase()
    : 'OW';

  const userDisplayName = currentUser?.email || 'owner@svsr-demo.in';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-teal-800 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
                Smart Virtual Speed Reducer
              </span>
              <span className="hidden sm:inline-block text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Vehicle Portal
              </span>
              {isLiveFirebaseSync && (
                <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
                  <span>RTDB Live</span>
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 truncate flex items-center gap-1.5">
              <span className="font-medium text-slate-700">{vehicle.name}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-600">{vehicle.plateNumber}</span>
              {overrideState.status === 'active' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-700 font-semibold flex items-center gap-1">
                    <span>◇</span>
                    <span>Override Active</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Zone: Controls & Notifications */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Connection Status Indicator & Test Switcher */}
          <div className="relative">
            <button
              onClick={() => setConnDropdownOpen(!connDropdownOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors hover:shadow-xs ${badge.classes}`}
              title="Click to toggle connection state simulation"
              aria-label="Connection Status"
            >
              <span className="font-bold text-xs" aria-hidden="true">
                {badge.symbol}
              </span>
              {badge.icon}
              <span className="hidden md:inline">{badge.label}</span>
              <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
            </button>

            {connDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-lg border border-slate-200 shadow-md py-1.5 z-40 text-xs">
                <div className="px-3 py-1 text-slate-500 font-medium border-b border-slate-100">
                  Connection & Synchronization
                </div>
                {(['connected', 'syncing', 'limited', 'offline'] as ConnectionState[]).map((state) => {
                  const isCurrent = connectionState === state;
                  const labelMap = {
                    connected: '✓ Connected (Live Firebase Grid)',
                    syncing: '↻ Syncing (Updating Local Zones)',
                    limited: '! Limited Connection (Weak Signal)',
                    offline: '× Offline (On-board Autonomous)',
                  };
                  return (
                    <button
                      key={state}
                      onClick={() => {
                        setConnectionState(state);
                        setConnDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        isCurrent ? 'bg-slate-50 font-semibold text-teal-800' : 'text-slate-700'
                      }`}
                    >
                      <span>{labelMap[state]}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-teal-700" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Driver / Owner Profile with Logout */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-90 transition-opacity"
              aria-label="Owner profile options"
            >
              <div className="w-8 h-8 rounded-full bg-teal-800 text-white flex items-center justify-center text-xs font-bold border border-teal-700">
                {userInitial}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-medium text-slate-800 leading-tight truncate max-w-[120px]">
                  {userDisplayName}
                </div>
                <div className="text-[11px] text-slate-500 leading-tight">
                  Verified Owner
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden lg:block" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl border border-slate-200 shadow-lg py-2 z-40 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="font-semibold text-slate-900 truncate">
                    {userDisplayName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Role: Vehicle Owner / Driver
                  </div>
                </div>

                <button
                  onClick={async () => {
                    setProfileDropdownOpen(false);
                    await logout();
                  }}
                  className="w-full text-left px-3 py-2 text-rose-700 hover:bg-rose-50 flex items-center gap-2 font-medium transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

