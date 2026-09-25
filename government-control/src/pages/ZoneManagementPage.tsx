import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Power,
  MapPin,
  Clock,
  Car,
  ChevronDown,
  ArrowUpDown,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  MousePointerClick
} from 'lucide-react';
import { useTrafficSystem } from '../context/TrafficSystemContext';
import { SpeedZone, ZoneType, ZoneStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ZoneConfigModal } from '../components/map/ZoneConfigModal';

export const ZoneManagementPage: React.FC = () => {
  const {
    zones,
    deleteZone,
    toggleZoneStatus,
    selectZone,
    setActiveTab,
    openPublishModal,
    pendingPublishCount
  } = useTrafficSystem();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof SpeedZone>('name');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [editingZone, setEditingZone] = useState<SpeedZone | null>(null);

  // Filter & Search logic
  const filteredZones = useMemo(() => {
    return zones.filter(zone => {
      const matchesSearch =
        zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.startLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.endLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'all' || zone.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || zone.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    }).sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        return sortAsc
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }
      if (typeof aVal === 'number') {
        return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      }
      return 0;
    });
  }, [zones, searchQuery, typeFilter, statusFilter, sortField, sortAsc]);

  const handleSort = (field: keyof SpeedZone) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleEdit = (zone: SpeedZone) => {
    setEditingZone(zone);
    setIsConfigModalOpen(true);
  };

  const handleCreate = () => {
    setEditingZone(null);
    setIsConfigModalOpen(true);
  };

  const handleViewOnMap = (zoneId: string) => {
    selectZone(zoneId);
    setActiveTab('map');
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Speed Zone Management & Dynamic Geofence Matrix
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-teal-800 font-semibold">
              {zones.length} Total Zones
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative definition of permanent, temporary, and virtual hump deceleration corridors. All creations and edits require cryptographic authority publishing.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => {
              setActiveTab('map');
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-xs"
          >
            <MousePointerClick className="w-4 h-4 text-teal-700" />
            <span>Select on Map</span>
          </button>

          <button
            onClick={openPublishModal}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-xs ${
              pendingPublishCount > 0
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Publish Update</span>
            {pendingPublishCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-900 text-amber-300 text-[10px] font-mono font-bold leading-none">
                {pendingPublishCount} Draft
              </span>
            )}
          </button>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Virtual Zone</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 text-xs shadow-xs">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by zone name, street, road marker, or ID..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Type:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-teal-600"
            >
              <option value="all">All Types</option>
              <option value="temporary">Temporary (School/Event)</option>
              <option value="permanent">Permanent (Hospital/Core)</option>
              <option value="virtual_hump">Virtual Hump Series</option>
              <option value="dynamic_restriction">Dynamic Restriction</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-teal-600"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft (Unpublished)</option>
              <option value="disabled">Disabled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-mono text-[11px]">
                <th
                  onClick={() => handleSort('name')}
                  className="px-4 py-3 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Zone & Identity</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3">Type</th>
                <th
                  onClick={() => handleSort('speedLimit')}
                  className="px-4 py-3 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Speed Limit</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3">Range</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Status</th>
                <th
                  onClick={() => handleSort('vehiclesToday')}
                  className="px-4 py-3 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Vehicles Today</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3">Authority / Created By</th>
                <th className="px-4 py-3">Last Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredZones.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <AlertCircle className="w-8 h-8 text-slate-400" />
                      <div className="text-sm font-semibold text-slate-700">No matching speed zones found</div>
                      <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredZones.map(zone => (
                  <tr
                    key={zone.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Zone & Identity */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {zone.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                        <span className="text-teal-700 font-bold">{zone.id}</span>
                        <span>·</span>
                        <span className="truncate max-w-[200px]">{zone.startLocation}</span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3.5 text-slate-700">
                      <span className="capitalize">{zone.type.replace('_', ' ')}</span>
                    </td>

                    {/* Speed Limit */}
                    <td className="px-4 py-3.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 font-mono font-bold text-amber-800 text-xs shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                        <span>{zone.speedLimit} km/h</span>
                      </div>
                    </td>

                    {/* Range */}
                    <td className="px-4 py-3.5 font-mono text-slate-700 font-medium">
                      {zone.rangeMeters} m
                    </td>

                    {/* Schedule */}
                    <td className="px-4 py-3.5 text-slate-700">
                      <div className="font-mono text-xs font-medium">{zone.schedule.startTime} - {zone.schedule.endTime}</div>
                      <div className="text-[10px] text-slate-500">{zone.schedule.days.join(', ')}</div>
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={zone.status} size="sm" />
                    </td>

                    {/* Vehicles Today */}
                    <td className="px-4 py-3.5 font-mono text-slate-700 tabular-nums">
                      <div className="font-semibold text-slate-900">{zone.vehiclesToday.toLocaleString()}</div>
                      <div className="text-[10px] text-emerald-700 font-mono font-medium">
                        {zone.preventedViolationsToday} calmed
                      </div>
                    </td>

                    {/* Created By */}
                    <td className="px-4 py-3.5 text-slate-600 text-xs">
                      {zone.createdBy}
                    </td>

                    {/* Last Updated */}
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">
                      {zone.lastUpdated}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewOnMap(zone.id)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-teal-700 transition-colors"
                          title="View on Digital Twin Map"
                        >
                          <MapPin className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(zone)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-amber-700 transition-colors"
                          title="Edit Parameters"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleZoneStatus(zone.id)}
                          className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors ${
                            zone.status === 'active'
                              ? 'text-emerald-600 hover:text-rose-600'
                              : 'text-slate-400 hover:text-emerald-600'
                          }`}
                          title={zone.status === 'active' ? 'Disable Zone' : 'Activate Zone'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteZone(zone.id)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Zone"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zone Configuration Modal */}
      <ZoneConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setEditingZone(null);
        }}
        editZone={editingZone}
        onActivateMapSelection={() => setActiveTab('map')}
      />
    </div>
  );
};
