import React, { useState, useMemo } from 'react';
import {
  Car,
  Search,
  Filter,
  Activity,
  Compass,
  Radio,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  X,
  Gauge,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { useTrafficSystem } from '../context/TrafficSystemContext';
import { VehicleTelemetry, VehicleType } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const VehiclesPage: React.FC = () => {
  const {
    vehicles,
    selectedVehicleId,
    selectVehicle,
    setActiveTab,
    zones,
    overrides
  } = useTrafficSystem();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [overrideFilter, setOverrideFilter] = useState<string>('all');

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch =
        v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.roadName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'all' || v.type === typeFilter;
      const matchesZone =
        zoneFilter === 'all'
          ? true
          : zoneFilter === 'in_zone'
          ? v.currentZoneId !== null
          : v.currentZoneId === null;
      const matchesOverride =
        overrideFilter === 'all'
          ? true
          : overrideFilter === 'override_only'
          ? v.hasActiveOverride
          : !v.hasActiveOverride;

      return matchesSearch && matchesType && matchesZone && matchesOverride;
    });
  }, [vehicles, searchQuery, typeFilter, zoneFilter, overrideFilter]);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || null;
  const currentAssociatedOverride = overrides.find(o => o.vehicleId === selectedVehicle?.id);

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Connected Vehicle Fleet Telematics & Onboard Vision Telemetry
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-teal-800 font-semibold">
              {vehicles.length} Units Connected
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-sensor telemetry stream (GPS position, IMU gyro acceleration, onboard vision camera, V2X mesh). Automated speed governors adjust vehicle acceleration in active digital zones.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
          <span>V2X FREQUENCY: 5.9 GHz DSRC/C-V2X</span>
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
            placeholder="Search vehicle ID, license plate, model, or road corridor..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Vehicle Type:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-teal-600"
            >
              <option value="all">All Types</option>
              <option value="car">Cars</option>
              <option value="motorcycle">Motorcycles</option>
              <option value="bus">Buses</option>
              <option value="truck">Trucks</option>
              <option value="emergency">Emergency Vehicles</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Geofence:</span>
            <select
              value={zoneFilter}
              onChange={e => setZoneFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-teal-600"
            >
              <option value="all">All Roadways</option>
              <option value="in_zone">Inside Speed Zone Only</option>
              <option value="outside_zone">Outside Controlled Zones</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Override:</span>
            <select
              value={overrideFilter}
              onChange={e => setOverrideFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-teal-600"
            >
              <option value="all">All Overrides</option>
              <option value="override_only">Active Override Only</option>
              <option value="standard_only">Standard Fleet Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Split Screen with Detail Panel on Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Vehicles Table (Spans 2 cols if item selected, or 3 if none) */}
        <div className={selectedVehicle ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-mono text-[11px]">
                    <th className="px-4 py-3">Vehicle ID & Plate</th>
                    <th className="px-4 py-3">Type & Model</th>
                    <th className="px-4 py-3">Current Speed</th>
                    <th className="px-4 py-3">Allowed</th>
                    <th className="px-4 py-3">Current Zone</th>
                    <th className="px-4 py-3">GPS / IMU / Cam</th>
                    <th className="px-4 py-3">Link</th>
                    <th className="px-4 py-3">Emergency Override</th>
                    <th className="px-4 py-3 text-right">Telemetry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVehicles.map(vehicle => {
                    const isSelected = selectedVehicle?.id === vehicle.id;
                    const isOverspeeding = vehicle.currentSpeed > vehicle.allowedSpeed;

                    return (
                      <tr
                        key={vehicle.id}
                        onClick={() => selectVehicle(vehicle.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-teal-50/80 border-l-3 border-teal-600'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Vehicle ID & Plate */}
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                            <Car className="w-3.5 h-3.5 text-teal-700" />
                            {vehicle.id}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {vehicle.plateNumber}
                          </div>
                        </td>

                        {/* Type & Model */}
                        <td className="px-4 py-3 text-slate-700">
                          <div className="capitalize font-semibold text-slate-900">{vehicle.type}</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                            {vehicle.model}
                          </div>
                        </td>

                        {/* Current Speed */}
                        <td className="px-4 py-3 font-mono tabular-nums">
                          <span
                            className={`font-bold text-xs ${
                              isOverspeeding ? 'text-rose-700' : 'text-emerald-700'
                            }`}
                          >
                            {vehicle.currentSpeed} km/h
                          </span>
                        </td>

                        {/* Allowed Speed */}
                        <td className="px-4 py-3 font-mono text-slate-500 tabular-nums">
                          {vehicle.allowedSpeed} km/h
                        </td>

                        {/* Current Zone */}
                        <td className="px-4 py-3">
                          {vehicle.currentZoneName ? (
                            <span className="text-teal-800 font-medium text-xs truncate max-w-[160px] block">
                              {vehicle.currentZoneName}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">
                              Unrestricted Roadway
                            </span>
                          )}
                        </td>

                        {/* Sensors */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-[10px] font-mono">
                            <span
                              className={`px-1 rounded ${
                                vehicle.sensors.gps === 'nominal'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              GPS
                            </span>
                            <span
                              className={`px-1 rounded ${
                                vehicle.sensors.imu === 'nominal'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              IMU
                            </span>
                            <span
                              className={`px-1 rounded ${
                                vehicle.sensors.camera === 'nominal'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}
                            >
                              CAM
                            </span>
                          </div>
                        </td>

                        {/* Connection */}
                        <td className="px-4 py-3">
                          <StatusBadge status={vehicle.connection} size="sm" />
                        </td>

                        {/* Override */}
                        <td className="px-4 py-3">
                          {vehicle.hasActiveOverride ? (
                            <StatusBadge status="warning" customLabel="ACTIVE OVR" size="sm" />
                          ) : (
                            <span className="text-slate-400 text-[11px]">Normal</span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              selectVehicle(vehicle.id);
                            }}
                            className="text-teal-700 hover:text-teal-900 text-xs font-semibold underline"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Selected Vehicle Live Telemetry Detail Panel */}
        {selectedVehicle && (
          <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4 text-xs shadow-md animate-in fade-in duration-150">
            {/* Panel Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold">
                  LIVE ONBOARD TELEMETRY
                </div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                  <Car className="w-4 h-4 text-teal-700" />
                  {selectedVehicle.id}
                  <span className="text-xs font-normal text-slate-500">({selectedVehicle.plateNumber})</span>
                </h3>
                <div className="text-slate-600 mt-0.5">{selectedVehicle.model}</div>
              </div>
              <button
                onClick={() => selectVehicle(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close vehicle details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Speed Gauge Comparison Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 uppercase text-[10px] font-mono">Current vs Allowed</span>
                <span className="text-[10px] font-mono text-slate-400">REFRESH: 2000ms</span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-black font-mono text-teal-800 tabular-nums">
                    {selectedVehicle.currentSpeed}
                    <span className="text-xs font-sans font-normal text-slate-500 ml-1">km/h</span>
                  </div>
                  <div className="text-[10px] text-slate-500">CURRENT SPEED</div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
                    {selectedVehicle.allowedSpeed}
                    <span className="text-xs font-sans font-normal text-slate-500 ml-1">km/h</span>
                  </div>
                  <div className="text-[10px] text-slate-500">ZONE SPEED LIMIT</div>
                </div>
              </div>

              {/* Progress bar gauge */}
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    selectedVehicle.currentSpeed > selectedVehicle.allowedSpeed
                      ? 'bg-rose-500'
                      : 'bg-teal-600'
                  }`}
                  style={{
                    width: `${Math.min(100, (selectedVehicle.currentSpeed / 100) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Sensor Health Diagnostic */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase text-slate-500 font-semibold">
                Onboard Sensor Array Health
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-700 font-medium">GPS:</span>
                  <StatusBadge status={selectedVehicle.sensors.gps} size="sm" />
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-700 font-medium">IMU:</span>
                  <StatusBadge status={selectedVehicle.sensors.imu} size="sm" />
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Camera:</span>
                  <StatusBadge status={selectedVehicle.sensors.camera} size="sm" />
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-700 font-medium">V2X Radio:</span>
                  <StatusBadge status={selectedVehicle.sensors.v2x} size="sm" />
                </div>
              </div>
            </div>

            {/* Live Coordinates & Road Network Location */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Road Corridor:</span>
                <span className="text-slate-900 font-medium truncate max-w-[180px]">
                  {selectedVehicle.roadName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GPS Coordinates:</span>
                <span className="font-mono text-teal-800 font-medium">
                  {selectedVehicle.coordinates.lat.toFixed(4)}° N, {selectedVehicle.coordinates.lng.toFixed(4)}° E
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Compass Heading:</span>
                <span className="font-mono text-slate-800">{selectedVehicle.heading}° (Vector Active)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Driver Alert State:</span>
                <span className="font-semibold text-amber-800 uppercase">
                  {selectedVehicle.driverAlertState.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Emergency Override Status */}
            {selectedVehicle.hasActiveOverride && currentAssociatedOverride && (
              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    EMERGENCY OVERRIDE ENGAGED
                  </span>
                  <span className="font-mono text-[10px] text-amber-800 font-bold">
                    {Math.floor(currentAssociatedOverride.remainingSeconds / 60)} min left
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Reason: {currentAssociatedOverride.declaredReason}
                </p>
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => setActiveTab('overrides')}
                    className="text-[11px] text-amber-900 hover:text-amber-950 font-bold underline"
                  >
                    Open Emergency Override Control Panel →
                  </button>
                </div>
              </div>
            )}

            {/* Quick Map Locate Button */}
            <div className="pt-2">
              <button
                onClick={() => setActiveTab('map')}
                className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-800 hover:text-slate-900 flex items-center justify-center gap-2 transition-colors"
              >
                <MapPin className="w-4 h-4 text-teal-700" />
                <span>Locate on Digital Twin Map</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
