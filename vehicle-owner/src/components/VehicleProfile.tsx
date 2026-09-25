import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Truck,
  Cpu,
  RefreshCw,
  BatteryCharging,
  Layers,
  Radio,
  Eye,
  Activity,
  CheckCircle2,
  HardDrive,
  Check,
  DownloadCloud,
} from 'lucide-react';

export const VehicleProfile: React.FC = () => {
  const { vehicle, mapSyncState, triggerMapSync, isSyncing } = useApp();
  const [syncStepLabel, setSyncStepLabel] = useState<string>('');

  const handleSyncClick = async () => {
    setSyncStepLabel('Checking for updates...');
    setTimeout(() => setSyncStepLabel('Downloading local zone map...'), 400);
    setTimeout(() => setSyncStepLabel('Validating update signatures...'), 900);
    setTimeout(() => setSyncStepLabel('Map synchronized.'), 1400);

    await triggerMapSync();
    setTimeout(() => setSyncStepLabel(''), 2500);
  };

  const subsystemsList = [
    {
      key: 'gps',
      label: 'Dual-Band GNSS (GPS + NavIC)',
      icon: <Radio className="w-4 h-4 text-teal-700" />,
      data: vehicle.subsystems.gps,
    },
    {
      key: 'imu',
      label: '6-Axis IMU & Gyroscope',
      icon: <Activity className="w-4 h-4 text-teal-700" />,
      data: vehicle.subsystems.imu,
    },
    {
      key: 'camera',
      label: 'Front Optical Road Sign Sensor',
      icon: <Eye className="w-4 h-4 text-teal-700" />,
      data: vehicle.subsystems.camera,
    },
    {
      key: 'communication',
      label: 'Cellular V2X & Telemetry Modem',
      icon: <Cpu className="w-4 h-4 text-teal-700" />,
      data: vehicle.subsystems.communication,
    },
    {
      key: 'power',
      label: 'Power Delivery & LiFePO4 Backup',
      icon: <BatteryCharging className="w-4 h-4 text-teal-700" />,
      data: vehicle.subsystems.power,
    },
  ];

  return (
    <div className="space-y-5 pb-16 md:pb-6">
      {/* 1. Vehicle Identity Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  {vehicle.name}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1">
                  <span>✓</span>
                  <span>Operational</span>
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2">
                <span>Registration: <strong className="font-mono text-slate-700">{vehicle.plateNumber}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Type: <strong className="text-slate-700">{vehicle.type}</strong></span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs">
            <div className="text-slate-500 font-medium">On-Board Device ID</div>
            <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
              {vehicle.deviceId}
            </div>
          </div>
        </div>

        {/* Identity Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-500 block font-medium">Vehicle VIN</span>
            <span className="font-mono font-semibold text-slate-800">{vehicle.vin}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Firmware Version</span>
            <span className="font-mono font-semibold text-slate-800">{vehicle.systemVersion}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Power Supply</span>
            <span className="font-semibold text-slate-800">
              {vehicle.voltage} ({vehicle.batteryLevel}% Backup)
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Last Self-Diagnostic</span>
            <span className="font-semibold text-slate-800">{vehicle.lastDeviceUpdate}</span>
          </div>
        </div>
      </div>

      {/* 2. LOCAL SPEED-ZONE MAP SYNCHRONIZATION SECTION */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block">
                Local Speed-Zone Map
              </span>
              <h2 className="text-base font-bold text-slate-900">
                {mapSyncState.region}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            {syncStepLabel && (
              <span className="text-xs font-medium text-teal-800 animate-pulse">
                {syncStepLabel}
              </span>
            )}
            <button
              onClick={handleSyncClick}
              disabled={isSyncing}
              className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>
        </div>

        {/* Sync Status Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Map Version</span>
            <strong className="text-slate-900 font-mono text-sm block mt-0.5">
              {mapSyncState.version}
            </strong>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Last Updated</span>
            <strong className="text-slate-900 block mt-0.5">{mapSyncState.lastUpdated}</strong>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Zones Stored</span>
            <strong className="text-slate-900 text-sm block mt-0.5 tabular-nums">
              {mapSyncState.totalZones}
            </strong>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Permanent Zones</span>
            <strong className="text-slate-900 block mt-0.5 tabular-nums">
              {mapSyncState.permanentZones}
            </strong>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Temporary Zones</span>
            <strong className="text-slate-900 block mt-0.5 tabular-nums">
              {mapSyncState.temporaryZones}
            </strong>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-3 leading-relaxed">
          The vehicle only stores relevant local digital speed zones rather than bulky map tiles.
          This ensures continuous autonomous speed control even when mobile data or cloud connection
          is momentarily lost.
        </p>
      </div>

      {/* 3. Hardware Subsystems Status Grid */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>On-Board Hardware Subsystem Health</span>
          <span className="text-teal-800 font-semibold text-[11px]">5 of 5 Nominal</span>
        </h2>

        <div className="space-y-3">
          {subsystemsList.map((sub) => (
            <div
              key={sub.key}
              className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0">
                  {sub.icon}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{sub.label}</div>
                  <div className="text-slate-600 mt-0.5">{sub.data.detail}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-900 border border-teal-200 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
                  <span>{sub.data.accessibleSymbol}</span>
                  <span className="capitalize">{sub.data.status}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
