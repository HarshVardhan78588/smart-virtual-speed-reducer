import React from 'react';
import {
  LayoutDashboard,
  Map,
  Layers,
  Car,
  ShieldAlert,
  BarChart3,
  ScrollText,
  Sliders,
  Shield,
  ChevronRight
} from 'lucide-react';
import { useTrafficSystem } from '../../context/TrafficSystemContext';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    pendingPublishCount,
    overrides,
    vehicles,
    zones
  } = useTrafficSystem();

  const activeOverridesCount = overrides.filter(
    o => o.status === 'active' || o.status === 'under_review'
  ).length;

  const flaggedCount = overrides.filter(o => o.status === 'under_review').length;

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'map',
      label: 'Digital Map',
      icon: Map,
      badge: 'LIVE'
    },
    {
      id: 'zones',
      label: 'Zone Management',
      icon: Layers,
      badge: pendingPublishCount > 0 ? `${pendingPublishCount} Draft` : `${zones.length}`
    },
    {
      id: 'vehicles',
      label: 'Vehicles',
      icon: Car,
      badge: `${vehicles.length}`
    },
    {
      id: 'overrides',
      label: 'Emergency Overrides',
      icon: ShieldAlert,
      badge: activeOverridesCount > 0 ? `${activeOverridesCount} Active` : null,
      isAlert: flaggedCount > 0
    },
    {
      id: 'reports',
      label: 'Safety & Reports',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'activity',
      label: 'System Activity',
      icon: ScrollText,
      badge: null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Sliders,
      badge: null
    }
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-50 border-r border-slate-200 flex flex-col justify-between select-none min-h-[calc(100vh-4rem)]">
      {/* Navigation List */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          Traffic Command Hub
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all group ${
                isActive
                  ? 'bg-teal-50 text-teal-900 border border-teal-200 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center gap-2.5 min-w-0 mr-2">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-teal-700'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold whitespace-nowrap ${
                      item.isAlert
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : isActive
                        ? 'bg-teal-100 text-teal-900 border border-teal-200'
                        : 'bg-slate-200/70 text-slate-700 border border-slate-300/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-teal-700 shrink-0" aria-hidden="true" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Mission Card / SIH Prototype Status */}
      <div className="p-3 m-3 rounded-xl bg-white border border-slate-200 shadow-xs text-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
            <span className="font-semibold text-slate-800">SIH 2026 Core</span>
          </div>
          <span className="font-mono text-[10px] text-teal-700 font-semibold">STAGE 1 PROTOTYPE</span>
        </div>
        
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Digital virtual speed reduction active across {zones.length} road corridors. Physical humps replaced.
        </p>

        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>ZONE ENFORCEMENT:</span>
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            100% ONLINE
          </span>
        </div>
      </div>
    </aside>
  );
};
