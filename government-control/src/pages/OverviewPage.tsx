import React from 'react';
import {
  Layers,
  Clock,
  ShieldCheck,
  Car,
  Compass,
  AlertTriangle,
  Eye,
  ShieldAlert,
  ArrowUpRight,
  TrendingDown,
  Activity,
  Radio,
  Plus,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';
import { useTrafficSystem } from '../context/TrafficSystemContext';
import { DigitalTwinMap } from '../components/map/DigitalTwinMap';
import { StatusBadge } from '../components/common/StatusBadge';

export const OverviewPage: React.FC = () => {
  const {
    zones,
    vehicles,
    overrides,
    events,
    setActiveTab,
    selectVehicle,
    openPublishModal,
    pendingPublishCount
  } = useTrafficSystem();

  // Metrics computation
  const activeSpeedZones = zones.filter(z => z.status === 'active').length;
  const temporaryZones = zones.filter(z => z.type === 'temporary').length;
  const permanentZones = zones.filter(z => z.type === 'permanent' || z.type === 'virtual_hump').length;
  const connectedVehicles = vehicles.length;
  const vehiclesInZones = vehicles.filter(v => v.currentZoneId !== null).length;
  const activeOverrides = overrides.filter(o => o.status === 'active').length;
  const overridesUnderReview = overrides.filter(o => o.status === 'under_review').length;
  const flaggedActivities = overrides.filter(o => o.aiRiskLevel === 'high').length;

  const statCards = [
    {
      id: 'active_zones',
      label: 'Active Speed Zones',
      value: activeSpeedZones,
      subtext: `${temporaryZones} Temp · ${permanentZones} Perm`,
      icon: Layers,
      trend: '100% Enforced',
      accent: 'teal',
      onClick: () => setActiveTab('zones')
    },
    {
      id: 'temporary_zones',
      label: 'Temporary Zones',
      value: temporaryZones,
      subtext: 'School / Event scheduled',
      icon: Clock,
      trend: 'Dynamic Window',
      accent: 'amber',
      onClick: () => setActiveTab('zones')
    },
    {
      id: 'permanent_zones',
      label: 'Permanent Zones',
      value: permanentZones,
      subtext: 'Hospital & Virtual Humps',
      icon: ShieldCheck,
      trend: '24/7 Active',
      accent: 'cyan',
      onClick: () => setActiveTab('zones')
    },
    {
      id: 'connected_vehicles',
      label: 'Connected Vehicles',
      value: connectedVehicles,
      subtext: 'Active V2X & Telematics',
      icon: Car,
      trend: '100% Pinned',
      accent: 'emerald',
      onClick: () => setActiveTab('vehicles')
    },
    {
      id: 'vehicles_in_zones',
      label: 'Vehicles In Zones',
      value: vehiclesInZones,
      subtext: `${Math.round((vehiclesInZones / connectedVehicles) * 100)}% of local traffic`,
      icon: Compass,
      trend: 'Governed & Calmed',
      accent: 'teal',
      onClick: () => setActiveTab('vehicles')
    },
    {
      id: 'active_overrides',
      label: 'Active Overrides',
      value: activeOverrides,
      subtext: 'Medical & Law enforcement',
      icon: ShieldAlert,
      trend: 'Live Telemetry',
      accent: 'amber',
      onClick: () => setActiveTab('overrides')
    },
    {
      id: 'under_review',
      label: 'Under Review',
      value: overridesUnderReview,
      subtext: 'Authority review required',
      icon: Eye,
      trend: 'AI Anomaly Flag',
      accent: overridesUnderReview > 0 ? 'rose' : 'slate',
      isAlert: overridesUnderReview > 0,
      onClick: () => setActiveTab('overrides')
    },
    {
      id: 'flagged_activities',
      label: 'Flagged High Risk',
      value: flaggedActivities,
      subtext: 'Misuse detection simulation',
      icon: AlertTriangle,
      trend: 'Confidence 92%',
      accent: flaggedActivities > 0 ? 'rose' : 'slate',
      isAlert: flaggedActivities > 0,
      onClick: () => setActiveTab('overrides')
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Mission Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-teal-700 font-semibold mb-1">
            <Radio className="w-4 h-4 text-teal-600 animate-pulse" />
            <span>Smart India Hackathon 2026 Prototype · Traffic Authority Core</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Smart Virtual Speed Reducer System Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Eliminating physical road speed humps via intelligent digital geofences. Vehicle telematics (GPS, IMU, Camera, V2X) seamlessly receive regulatory zones and enact automated speed governors, acoustic driver alerts, and audited emergency corridors.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveTab('map')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-xs"
          >
            <Compass className="w-4 h-4 text-teal-700" />
            <span>Digital Twin Map</span>
          </button>
          <button
            onClick={openPublishModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-all shadow-xs"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Publish Updates ({pendingPublishCount})</span>
          </button>
        </div>
      </div>

      {/* Primary Key Statistics Grid (8 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-3.5">
        {statCards.map(card => {
          const Icon = card.icon;

          return (
            <button
              key={card.id}
              onClick={card.onClick}
              className={`p-4 rounded-xl text-left bg-white border transition-all hover:shadow-xs group ${
                card.isAlert
                  ? 'border-rose-300 bg-rose-50/40'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  {card.label}
                </span>
                <div
                  className={`p-1.5 rounded-lg ${
                    card.isAlert
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-black font-mono text-slate-900 tabular-nums">
                  {card.value}
                </div>
                <div className="text-[10px] font-mono text-teal-700 font-semibold flex items-center gap-0.5">
                  <span>{card.trend}</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              <div className="text-[11px] text-slate-500 mt-1 truncate">
                {card.subtext}
              </div>
            </button>
          );
        })}
      </div>

      {/* Central Interactive Digital Traffic Map Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Live Digital Twin GIS Road Network
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-teal-50 border border-teal-200 font-mono text-teal-800 font-semibold">
              REAL-TIME REFRESH
            </span>
          </div>
          <button
            onClick={() => setActiveTab('map')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
          >
            <span>Expand Full-Screen Command Map</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Central Map */}
        <DigitalTwinMap isFullScreen={false} />
      </div>

      {/* Lower Dashboard Section: Split between Active Overrides Alert & Live System Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Active Emergency Overrides Live Monitor */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Emergency Overrides Under Surveillance
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('overrides')}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold"
            >
              Control Center →
            </button>
          </div>

          <div className="space-y-3">
            {overrides.slice(0, 3).map(ovr => {
              const isHighRisk = ovr.aiRiskLevel === 'high';
              const isBlocked = ovr.status === 'blocked';

              return (
                <div
                  key={ovr.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isBlocked
                      ? 'bg-rose-50/60 border-rose-200'
                      : isHighRisk
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-mono text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>{ovr.vehicleId}</span>
                        <span className="text-slate-500 font-normal">({ovr.plateNumber})</span>
                      </div>
                      <div className="text-[11px] text-slate-700 mt-0.5 truncate max-w-xs">
                        {ovr.declaredReason}
                      </div>
                    </div>
                    <StatusBadge status={ovr.status} size="sm" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 my-1 border-y border-slate-200/60 text-[11px] font-mono text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Speed:</span>
                      <span className={ovr.currentSpeed > ovr.speedLimit ? 'text-rose-700 font-bold' : 'text-slate-800'}>
                        {ovr.currentSpeed} km/h
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Time Left:</span>
                      <span className="text-teal-800 font-bold">
                        {Math.floor(ovr.remainingSeconds / 60)} min
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">AI Risk:</span>
                      <span className={isHighRisk ? 'text-rose-700 font-bold' : 'text-emerald-700'}>
                        {ovr.aiRiskLevel.toUpperCase()} ({ovr.aiRiskConfidence}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span className="truncate max-w-[200px]">{ovr.currentLocation}</span>
                    <button
                      onClick={() => {
                        selectVehicle(ovr.vehicleId);
                        setActiveTab('overrides');
                      }}
                      className="text-teal-700 hover:text-teal-900 font-semibold underline"
                    >
                      Audit Telemetry
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Event Audit Log Ticker */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-700" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Live System Audit & V2X Broadcast Stream
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('activity')}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold"
            >
              Full Log ({events.length}) →
            </button>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {events.slice(0, 5).map(ev => (
              <div
                key={ev.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 text-xs space-y-1 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-500">{ev.timestamp}</span>
                  <StatusBadge status={ev.severity} size="sm" />
                </div>
                <div className="font-semibold text-slate-900">{ev.title}</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {ev.description}
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
                  <span>Operator: {ev.operator}</span>
                  <span>Target: {ev.targetId}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
