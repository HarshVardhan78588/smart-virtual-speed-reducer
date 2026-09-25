import React, { useState } from 'react';
import {
  Sliders,
  User,
  Shield,
  Eye,
  Bell,
  Map,
  Key,
  Lock,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Radio,
  Save
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTrafficSystem } from '../context/TrafficSystemContext';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, toggleHighContrast, setFontSize, setColorblindMode, toggleReducedMotion } = useAccessibility();
  const { currentUser } = useTrafficSystem();

  const [activeSection, setActiveSection] = useState<string>('accessibility');
  const [telemetryInterval, setTelemetryInterval] = useState<number>(2000);
  const [speedBufferKmh, setSpeedBufferKmh] = useState<number>(5);
  const [autoLockdownThreshold, setAutoLockdownThreshold] = useState<number>(90);
  const [saveToast, setSaveToast] = useState<boolean>(false);

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const navItems = [
    { id: 'accessibility', label: 'Accessibility & Contrast', icon: Eye },
    { id: 'authority', label: 'Authority Profile & Station', icon: User },
    { id: 'system', label: 'System Telemetry & Buffers', icon: Sliders },
    { id: 'notifications', label: 'Alert Notification Rules', icon: Bell },
    { id: 'map', label: 'GIS Map & Rendering', icon: Map },
    { id: 'security', label: 'Security & Operator Roles', icon: Shield }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Government Control Center Preferences & Governance Setup
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure system telemetry polling buffers, operator permissions, V2X security verification, and accessibility options.
          </p>
        </div>

        {saveToast && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Preferences saved successfully.</span>
          </div>
        )}
      </div>

      {/* Main Settings Body */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar for Settings */}
        <div className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-900 border border-teal-200 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 rounded-xl bg-white border border-slate-200 p-6 space-y-6 text-xs shadow-xs">
          {/* SECTION: ACCESSIBILITY */}
          {activeSection === 'accessibility' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Accessibility & Color-Blind Compliance
                </h2>
                <p className="text-slate-500">
                  The Smart Virtual Speed Reducer System never communicates state through color alone. Configure additional ergonomic parameters below.
                </p>
              </div>

              {/* High Contrast */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="font-semibold text-slate-900">High Contrast UI Mode</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Reinforces element borders, darkens contrast, and amplifies text luminescence for optimal readability in control centers.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleHighContrast}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.highContrast ? 'bg-teal-700' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.highContrast ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Text Size */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div>
                  <div className="font-semibold text-slate-900">Dashboard Typography Scale</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Adjust text scaling across tables, telemetry feeds, and map tooltips.
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-1">
                  {(['normal', 'large', 'extralarge'] as const).map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFontSize(size)}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold capitalize transition-all ${
                        settings.fontSize === size
                          ? 'bg-teal-50 border-teal-300 text-teal-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {size === 'extralarge' ? 'Extra Large' : size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="font-semibold text-slate-900">Reduced Motion Mode</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Disables radar sweep animation, pulsing indicators, and vehicle coordinate transitions.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleReducedMotion}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.reducedMotion ? 'bg-teal-700' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.reducedMotion ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Colorblind Palette Adjustment */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <div className="font-semibold text-slate-900">Color-Blind Specific Filter Adjustment</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Optimizes zone boundaries and telemetry glyphs for specific color perception variations.
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'standard', label: 'Standard (Icon + Label Built-In)' },
                    { id: 'deuteranopia', label: 'Deuteranopia (Green Weak)' },
                    { id: 'protanopia', label: 'Protanopia (Red Weak)' },
                    { id: 'tritanopia', label: 'Tritanopia (Blue-Yellow)' },
                    { id: 'monochrome', label: 'High-Contrast Monochromacy' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setColorblindMode(m.id as any)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        settings.colorblindMode === m.id
                          ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs">{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: AUTHORITY PROFILE */}
          {activeSection === 'authority' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Authority Profile & Division Authentication
                </h2>
                <p className="text-slate-500">
                  Current operator credentials, jurisdiction, and cryptographic broadcast authorization.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-500 block text-[11px] mb-1">Controller Name:</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.name}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block text-[11px] mb-1">Badge Identifier:</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.badgeNumber}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-teal-700 font-mono font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-500 block text-[11px] mb-1">Governing Department:</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.department}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block text-[11px] mb-1">Jurisdiction Command:</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.division}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: SYSTEM PREFERENCES */}
          {activeSection === 'system' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Telemetry Engine & Enforcement Buffers
                </h2>
                <p className="text-slate-500">
                  Define governor enforcement tolerance and simulation refresh parameters.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div>
                  <label className="block font-semibold text-slate-900 mb-1">
                    Speed Tolerance Buffer: {speedBufferKmh} km/h
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Grace buffer before automatic electronic throttle reduction / brake assist engages.
                  </p>
                  <input
                    type="range"
                    min={0}
                    max={15}
                    value={speedBufferKmh}
                    onChange={e => setSpeedBufferKmh(Number(e.target.value))}
                    className="w-full accent-teal-700"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <label className="block font-semibold text-slate-900 mb-1">
                    AI Auto-Lockdown Risk Threshold: {autoLockdownThreshold}%
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Neural confidence level at which vehicle emergency override is auto-flagged for immediate controller review.
                  </p>
                  <input
                    type="range"
                    min={50}
                    max={99}
                    value={autoLockdownThreshold}
                    onChange={e => setAutoLockdownThreshold(Number(e.target.value))}
                    className="w-full accent-teal-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION: NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Alert Rules & Sound Beacons
                </h2>
                <p className="text-slate-500">
                  Configure alert routing for overrides, high-risk flags, and zone transitions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                {[
                  { title: 'Emergency Override Activated', desc: 'Notify immediately on citizen medical override request' },
                  { title: 'AI High Risk Misuse Flag', desc: 'Flash audible alert when risk confidence exceeds threshold' },
                  { title: 'Sensor Tamper / IMU Anomaly', desc: 'Alert if vehicle IMU gyro disagrees with speed telemetry' },
                  { title: 'New Zone Draft Awaiting Verification', desc: 'Prompt authority to publish uncommitted speed zones' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
                    <div>
                      <div className="font-semibold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500">{item.desc}</div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-teal-600 bg-white focus:ring-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: GIS MAP */}
          {activeSection === 'map' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
                  GIS Vector Map Preferences
                </h2>
                <p className="text-slate-500">
                  Vector rendering style, coordinate projection, and radar overlays.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-900">Coordinate System Projection</div>
                    <div className="text-slate-500 text-[11px]">WGS 84 / UTM Zone 45N (Eastern Command)</div>
                  </div>
                  <span className="font-mono text-teal-700 text-xs font-semibold">EPSG:32645</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <div>
                    <div className="font-semibold text-slate-900">Digital Twin Map Canvas Style</div>
                    <div className="text-slate-500 text-[11px]">Clean Light Neutral GIS Vector (Operations Center)</div>
                  </div>
                  <span className="font-mono text-emerald-700 text-xs font-semibold">ACTIVE</span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: SECURITY */}
          {activeSection === 'security' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Security, Cryptographic Keys & V2X Mesh
                </h2>
                <p className="text-slate-500">
                  Public Key Infrastructure (PKI) certificates used to sign broadcast payloads to vehicle ECUs.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-900">V2X Root Certificate Authority</div>
                    <div className="text-slate-500 text-[11px]">MoRTH-ITS-ROOT-CA-2026 (SHA-384 with ECDSA)</div>
                  </div>
                  <span className="font-mono text-emerald-700 text-xs font-semibold">VALID (Exp 2031)</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <div>
                    <div className="font-semibold text-slate-900">Authority Verification PIN</div>
                    <div className="text-slate-500 text-[11px]">Required before publishing zone updates to vehicles</div>
                  </div>
                  <span className="font-mono text-teal-700 text-xs font-semibold">CONFIGURED (PIN: 2026)</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <div>
                    <div className="font-semibold text-slate-900">Shared Firebase Realtime Database</div>
                    <div className="text-slate-500 text-[11px]">smart-virtual-speed-reducer (Data layer for government, owner & twin apps)</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-amber-700 text-xs font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      LOCKED MODE (PERMISSION_DENIED)
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">Rules: read: false, write: false (Protected)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Apply & Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
