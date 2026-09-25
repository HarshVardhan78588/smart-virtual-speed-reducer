import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ZoneEvent } from '../types';
import {
  History,
  MapPin,
  AlertOctagon,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  TrendingDown,
  Calendar,
} from 'lucide-react';

export const ActivityTimeline: React.FC = () => {
  const { events } = useApp();
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = events.filter((e) => {
    if (filter !== 'all' && e.category !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.zoneName && e.zoneName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getEventVisuals = (event: ZoneEvent) => {
    switch (event.iconType) {
      case 'zone':
        return {
          icon: <MapPin className="w-3.5 h-3.5 text-teal-700" />,
          bg: 'bg-teal-50 border-teal-200',
          symbol: '!',
        };
      case 'override':
        return {
          icon: <AlertOctagon className="w-3.5 h-3.5 text-amber-700" />,
          bg: 'bg-amber-50 border-amber-200',
          symbol: '◇',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />,
          bg: 'bg-amber-50 border-amber-200',
          symbol: '!',
        };
      case 'sync':
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 text-blue-700" />,
          bg: 'bg-blue-50 border-blue-200',
          symbol: '↻',
        };
      default:
        return {
          icon: <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />,
          bg: 'bg-slate-100 border-slate-200',
          symbol: '✓',
        };
    }
  };

  return (
    <div className="space-y-4 pb-16 md:pb-6">
      {/* Header and Filter */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-teal-800" />
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Safety & Zone Activity History
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically logged vehicle safety transitions and digital speed zone interactions
          </p>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs self-start sm:self-center">
          {[
            { id: 'all', label: 'All' },
            { id: 'zones', label: 'Zones' },
            { id: 'emergency', label: 'Emergency' },
            { id: 'warnings', label: 'Warnings' },
            { id: 'system', label: 'System' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                filter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-6 shadow-xs">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No activity events recorded under this filter.
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
            {filteredEvents.map((evt) => {
              const visual = getEventVisuals(evt);
              return (
                <div key={evt.id} className="relative group">
                  {/* Timeline Node Point */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full bg-white border flex items-center justify-center shadow-xs ${visual.bg}`}
                  >
                    {visual.icon}
                  </div>

                  {/* Content Container */}
                  <div className="bg-slate-50/70 hover:bg-slate-50 rounded-xl p-3.5 sm:p-4 border border-slate-200/80 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{evt.title}</span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 uppercase font-semibold">
                          {evt.category}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400 tabular-nums">
                        {evt.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>

                    {(evt.zoneName || evt.speedLimit || evt.vehicleSpeed) && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-medium">
                        {evt.zoneName && (
                          <span>
                            Zone: <strong className="text-slate-800">{evt.zoneName}</strong>
                          </span>
                        )}
                        {evt.speedLimit && (
                          <span>
                            Limit: <strong className="font-mono text-slate-800">{evt.speedLimit} km/h</strong>
                          </span>
                        )}
                        {evt.vehicleSpeed && (
                          <span>
                            Entry Speed: <strong className="font-mono text-slate-800">{evt.vehicleSpeed} km/h</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
