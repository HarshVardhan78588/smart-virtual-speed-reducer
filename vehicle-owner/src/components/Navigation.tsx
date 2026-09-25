import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, MapPin, AlertOctagon, History, Truck, Settings } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeType?: 'warning' | 'alert' | 'info';
}

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, overrideState, unreadNotifsCount } = useApp();

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'live-zone',
      label: 'Live Zone',
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      id: 'emergency',
      label: 'Emergency',
      icon: <AlertOctagon className="w-4 h-4" />,
      badge:
        overrideState.status === 'active'
          ? 'Active'
          : overrideState.status === 'blocked'
          ? 'Blocked'
          : undefined,
      badgeType: overrideState.status === 'active' ? 'warning' : 'alert',
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: <History className="w-4 h-4" />,
    },
    {
      id: 'vehicle',
      label: 'Vehicle',
      icon: <Truck className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <>
      {/* Desktop Navigation Bar */}
      <nav className="hidden md:block bg-white border-b border-slate-200/80 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-start gap-1 py-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-50/80 text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className={isActive ? 'text-teal-700' : 'text-slate-500'}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.badgeType === 'warning'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-[-6px] left-3 right-3 h-[2px] bg-teal-700 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Fixed Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
        <div className="grid grid-cols-6 gap-1 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors min-h-[48px] ${
                  isActive ? 'text-teal-800 font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight truncate w-full text-center">
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 bg-teal-700 rounded-full mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
