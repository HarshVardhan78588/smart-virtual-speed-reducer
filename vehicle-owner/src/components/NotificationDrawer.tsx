import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCheck, Bell, AlertTriangle, MapPin, RefreshCw, AlertOctagon } from 'lucide-react';
import { NotificationItem } from '../types';

export const NotificationDrawer: React.FC = () => {
  const {
    notifications,
    isNotifOpen,
    setIsNotifOpen,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveTab,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<string>('all');

  if (!isNotifOpen) return null;

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.read;
    return n.category === activeFilter;
  });

  const getCategoryIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'zone':
        return <MapPin className="w-3.5 h-3.5 text-teal-700" />;
      case 'temporary':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />;
      case 'map':
        return <RefreshCw className="w-3.5 h-3.5 text-blue-700" />;
      case 'emergency':
        return <AlertOctagon className="w-3.5 h-3.5 text-rose-700" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-700" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal-800" />
            <h2 className="text-sm font-bold text-slate-900">Safety Notifications</h2>
            <span className="text-xs text-slate-500 font-medium">({notifications.length})</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => markAllNotificationsRead()}
              className="text-xs text-teal-800 hover:text-teal-900 font-medium px-2 py-1 rounded hover:bg-slate-100 flex items-center gap-1 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={() => setIsNotifOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close notifications"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b border-slate-100 bg-slate-50 flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'zone', label: 'Zones' },
            { id: 'temporary', label: 'Temporary' },
            { id: 'emergency', label: 'Emergency' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                activeFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No notifications matching this filter.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  markNotificationRead(item.id);
                  if (item.category === 'emergency') {
                    setActiveTab('emergency');
                    setIsNotifOpen(false);
                  } else if (item.category === 'zone' || item.category === 'temporary') {
                    setActiveTab('live-zone');
                    setIsNotifOpen(false);
                  }
                }}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  item.read
                    ? 'bg-white border-slate-200/80 hover:bg-slate-50'
                    : 'bg-teal-50/40 border-teal-200 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-1 rounded-md bg-white border border-slate-200 shrink-0">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">{item.title}</h4>
                      <span className="text-[11px] text-slate-400 shrink-0 tabular-nums">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="capitalize">{item.category} update</span>
                      {!item.read && (
                        <span className="text-teal-700 font-medium">Click to view</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 text-center">
          Connected to State Digital Speed Safety Grid
        </div>
      </div>
    </div>
  );
};
