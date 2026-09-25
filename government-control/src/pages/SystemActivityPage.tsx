import React, { useState, useMemo } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  Download,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Car,
  Layers,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useTrafficSystem } from '../context/TrafficSystemContext';
import { EventCategory, EventSeverity, SystemEvent } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const SystemActivityPage: React.FC = () => {
  const { events, setActiveTab, selectVehicle } = useTrafficSystem();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      const matchesSearch =
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.targetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.operator.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity = severityFilter === 'all' || ev.severity === severityFilter;
      const matchesCategory = categoryFilter === 'all' || ev.category === categoryFilter;

      return matchesSearch && matchesSeverity && matchesCategory;
    });
  }, [events, searchQuery, severityFilter, categoryFilter]);

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Timestamp,Category,Title,Target ID,Severity,Operator,Status,Description']
        .concat(
          filteredEvents.map(
            e =>
              `"${e.timestamp}","${e.category}","${e.title}","${e.targetId}","${e.severity}","${e.operator}","${e.status}","${e.description}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `svsr_audit_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Cryptographic Audit & V2X Event Stream
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-teal-800 font-semibold">
              {events.length} Live Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable system activity log recording zone broadcasts, vehicle telematics entries, virtual hump triggers, AI risk evaluations, and authority enforcement actions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-teal-700" />
            <span>Export Audit Log (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 text-xs shadow-xs">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search events by vehicle ID, title, zone, or operator..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Severity:</span>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-teal-600"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
              <option value="nominal">Nominal</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-teal-600"
            >
              <option value="all">All Categories</option>
              <option value="zone_update">Zone Update</option>
              <option value="vehicle_entry">Vehicle Entry</option>
              <option value="vehicle_exit">Vehicle Exit</option>
              <option value="speed_reducer_activated">Speed Reducer Activated</option>
              <option value="emergency_override">Emergency Override</option>
              <option value="ai_risk_flag">AI Risk Flag</option>
              <option value="override_blocked">Override Blocked</option>
              <option value="authority_action">Authority Action</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Event Table */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-mono text-[11px]">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Target ID</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Operator / Source</th>
                <th className="px-4 py-3">Status / Outcome</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map(event => (
                <tr
                  key={event.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Timestamp */}
                  <td className="px-4 py-3.5 font-mono text-slate-600 text-xs tabular-nums">
                    {event.timestamp}
                  </td>

                  {/* Event Type & Title */}
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {event.title}
                    </div>
                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      {event.description}
                    </div>
                  </td>

                  {/* Target */}
                  <td className="px-4 py-3.5 font-mono">
                    <span className="text-teal-700 font-bold">{event.targetId}</span>
                    <div className="text-[10px] text-slate-400 uppercase">{event.targetType}</div>
                  </td>

                  {/* Severity */}
                  <td className="px-4 py-3.5">
                    <StatusBadge status={event.severity} size="sm" />
                  </td>

                  {/* Operator */}
                  <td className="px-4 py-3.5 text-slate-700 font-medium">
                    {event.operator}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 font-mono text-slate-700">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                      {event.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3.5 text-right">
                    {event.targetType === 'vehicle' && (
                      <button
                        onClick={() => {
                          selectVehicle(event.targetId);
                          setActiveTab('vehicles');
                        }}
                        className="text-teal-700 hover:text-teal-900 text-xs font-semibold underline"
                      >
                        View Vehicle
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
