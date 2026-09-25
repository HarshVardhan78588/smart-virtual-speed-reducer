import React, { useState } from 'react';
import {
  BarChart3,
  TrendingDown,
  ShieldCheck,
  Car,
  AlertTriangle,
  Clock,
  Download,
  Calendar,
  Layers,
  Leaf,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';
import {
  hourlyTrafficData,
  zonePerformanceData,
  summarySafetyStats
} from '../data/safetyData';
import { useTrafficSystem } from '../context/TrafficSystemContext';

export const SafetyReportsPage: React.FC = () => {
  const { zones } = useTrafficSystem();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  const maxTraffic = Math.max(...hourlyTrafficData.map(d => d.totalVehicles));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Safety Analytics & Virtual Hump Impact Evaluation
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-teal-50 border border-teal-200 font-mono text-teal-800 font-semibold">
              COMPLIANCE: {summarySafetyStats.overallComplianceRate}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time metric assessment of virtual speed humps: collision prevention index, deceleration compliance, smoother traffic flow, and emission reductions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                timeRange === 'today'
                  ? 'bg-teal-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                timeRange === 'week'
                  ? 'bg-teal-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                timeRange === 'month'
                  ? 'bg-teal-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
          </div>

          <button
            onClick={() => alert('Exporting Official MoRTH Safety Audit Report (PDF/CSV)...')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-teal-700" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Top 4 Impact KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Total Zone Transits
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 tabular-nums">
            {summarySafetyStats.totalTransitsToday.toLocaleString()}
          </div>
          <div className="text-[11px] text-teal-700 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Smooth Virtual Calming</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Speed Violations Prevented
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700 tabular-nums">
            {summarySafetyStats.totalViolationsPrevented.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">
            {summarySafetyStats.overallComplianceRate}% Overall Compliance
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Physical Humps Replaced
          </div>
          <div className="text-2xl font-black font-mono text-teal-800 tabular-nums">
            {summarySafetyStats.physicalHumpsDigitallyReplaced}
          </div>
          <div className="text-[11px] text-slate-500">
            Zero physical underbody vehicle impact
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            CO2 Emission Saved (Braking)
          </div>
          <div className="text-2xl font-black font-mono text-teal-800 tabular-nums">
            {summarySafetyStats.carbonEmissionReductionKg} <span className="text-xs font-sans font-normal text-slate-500">kg</span>
          </div>
          <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
            <Leaf className="w-3.5 h-3.5" />
            <span>Eliminated stop-and-go jerks</span>
          </div>
        </div>
      </div>

      {/* Chart 1: Vehicles Per Hour & Speed Calming Trend (SVG) */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Hourly Traffic Volume & Deceleration Impact
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Comparison between vehicle approach speed vs speed inside controlled virtual zones.
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-teal-600" />
              <span className="text-slate-700">Total Transits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-amber-500 rounded-sm" />
              <span className="text-slate-700">Speed In Zone</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-slate-400 rounded-sm" />
              <span className="text-slate-700">Approach Speed</span>
            </div>
          </div>
        </div>

        {/* SVG Bar Chart with Light Palette */}
        <div className="h-64 w-full">
          <svg className="w-full h-full" viewBox="0 0 800 240" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 60, 120, 180, 240].map((y, i) => (
              <line
                key={i}
                x1="40"
                y1={y}
                x2="780"
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="0.8"
                strokeDasharray="4 4"
              />
            ))}

            {/* Bars for Hourly Transits */}
            {hourlyTrafficData.map((d, i) => {
              const barWidth = 36;
              const x = 50 + i * 60;
              const barHeight = (d.totalVehicles / maxTraffic) * 160;
              const y = 200 - barHeight;

              return (
                <g key={i}>
                  {/* Total vehicles bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="3"
                    fill="#0f766e"
                    fillOpacity="0.80"
                  />
                  {/* Inside zone segment */}
                  <rect
                    x={x}
                    y={200 - (d.inZones / maxTraffic) * 160}
                    width={barWidth}
                    height={(d.inZones / maxTraffic) * 160}
                    rx="3"
                    fill="#14b8a6"
                  />

                  {/* Hour label */}
                  <text
                    x={x + barWidth / 2}
                    y="222"
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {d.hour}
                  </text>
                </g>
              );
            })}

            {/* Trend Line: Speed In Zone */}
            <polyline
              fill="none"
              stroke="#d97706"
              strokeWidth="2.5"
              points={hourlyTrafficData
                .map((d, i) => `${50 + i * 60 + 18},${200 - (d.avgSpeedInZone / 80) * 160}`)
                .join(' ')}
            />

            {/* Trend Line: Approach Speed */}
            <polyline
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              points={hourlyTrafficData
                .map((d, i) => `${50 + i * 60 + 18},${200 - (d.avgSpeedApproaching / 80) * 160}`)
                .join(' ')}
            />
          </svg>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
          <div>
            Peak Traffic Window: <span className="text-slate-900 font-mono font-bold">17:00 - 18:00 IST (2,640 vehicles)</span>
          </div>
          <div>
            Average Deceleration Inside Zones:{' '}
            <span className="text-emerald-700 font-mono font-bold">-54% Speed Calming</span>
          </div>
        </div>
      </div>

      {/* Zone Performance Table */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden space-y-3 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Corridor-Specific Deceleration Efficacy
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Live effectiveness data across primary school, hospital, and virtual hump corridors.
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-mono text-[11px]">
                <th className="px-4 py-3">Corridor / Zone</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Speed Limit</th>
                <th className="px-4 py-3">Transits Today</th>
                <th className="px-4 py-3">Average Speed</th>
                <th className="px-4 py-3">Compliance Rate</th>
                <th className="px-4 py-3">Violations Prevented</th>
                <th className="px-4 py-3 text-right">Physical Accidents Averted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {zonePerformanceData.map(zp => (
                <tr key={zp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-slate-900">
                    <div>{zp.name}</div>
                    <div className="text-[10px] text-teal-700 font-mono">{zp.id}</div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-700">{zp.type}</td>
                  <td className="px-4 py-3.5 font-mono font-bold text-amber-800">
                    {zp.speedLimit} km/h
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-900 tabular-nums">
                    {zp.totalTransits.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-emerald-800 tabular-nums font-bold">
                    {zp.avgSpeed} km/h
                  </td>
                  <td className="px-4 py-3.5 font-mono tabular-nums">
                    <span className="text-emerald-700 font-bold">{zp.complianceRate}%</span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-teal-800 tabular-nums font-semibold">
                    {zp.preventedOverspeedCount}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700 tabular-nums">
                    +{zp.physicalHumpAccidentsAverted}
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
