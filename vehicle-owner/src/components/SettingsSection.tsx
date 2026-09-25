import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Sliders,
  Bell,
  Eye,
  Lock,
  Shield,
  Info,
  Smartphone,
  Check,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { AccessibilitySettings } from '../types';

export const SettingsSection: React.FC = () => {
  const { accessibility, updateAccessibility, vehicle, currentUser, logout } = useApp();
  const [activeSection, setActiveSection] = useState<'accessibility' | 'privacy' | 'security' | 'account' | 'notifications'>('accessibility');

  // Local preferences
  const [audibleAlerts, setAudibleAlerts] = useState(true);
  const [approachHaptic, setApproachHaptic] = useState(true);
  const [leadDistanceThreshold, setLeadDistanceThreshold] = useState('450m');
  const [autoSyncOnWifi, setAutoSyncOnWifi] = useState(true);

  return (
    <div className="space-y-4 pb-16 md:pb-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
        <h1 className="text-base font-bold text-slate-900 tracking-tight">System & Application Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure vehicle safety alerts, driver accessibility preferences, and telemetry policies
        </p>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-100 overflow-x-auto text-xs">
          {[
            { id: 'accessibility', label: 'Accessibility', icon: <Eye className="w-3.5 h-3.5" /> },
            { id: 'notifications', label: 'Alert Preferences', icon: <Bell className="w-3.5 h-3.5" /> },
            { id: 'privacy', label: 'Privacy & Telemetry', icon: <Shield className="w-3.5 h-3.5" /> },
            { id: 'security', label: 'Security & Device', icon: <Lock className="w-3.5 h-3.5" /> },
            { id: 'account', label: 'Driver Profile', icon: <User className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeSection === tab.id
                  ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Settings Content */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-6">
        {/* 1. ACCESSIBILITY SECTION */}
        {activeSection === 'accessibility' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Driver Accessibility Controls</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                The Smart Virtual Speed Reducer app never conveys critical state through color alone.
                Fine-tune visual rendering to suit your driving environment and visual needs.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {/* Color Blind Mode */}
              <div className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Color-Blind Friendly Mode</span>
                    <span className="text-[10px] text-teal-800 font-normal bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                      Standard
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enforces dual-coding with high-contrast shapes (✓ Normal, ! Speed Zone Ahead, ◇ Emergency Override, □ Override Blocked).
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateAccessibility('colorBlindMode', !accessibility.colorBlindMode)
                  }
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    accessibility.colorBlindMode ? 'bg-teal-800' : 'bg-slate-300'
                  }`}
                  aria-label="Toggle Color-Blind Mode"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      accessibility.colorBlindMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* High Contrast */}
              <div className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-900">High Contrast Surfaces</div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Darkens card borders and deepens neutral surfaces for readability under direct sunlight glare.
                  </p>
                </div>
                <button
                  onClick={() => updateAccessibility('highContrast', !accessibility.highContrast)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    accessibility.highContrast ? 'bg-teal-800' : 'bg-slate-300'
                  }`}
                  aria-label="Toggle High Contrast"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      accessibility.highContrast ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Larger Text */}
              <div className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-900">Larger Display Typography (+10%)</div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Increases primary speed readouts and zone titles for effortless scannability while mounted on the vehicle dash.
                  </p>
                </div>
                <button
                  onClick={() => updateAccessibility('largerText', !accessibility.largerText)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    accessibility.largerText ? 'bg-teal-800' : 'bg-slate-300'
                  }`}
                  aria-label="Toggle Larger Text"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      accessibility.largerText ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Reduced Motion */}
              <div className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-900">Reduced Motion & Pulsing</div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Disables radar pulsing animations and smooth speed number transitions to minimize visual distraction.
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateAccessibility('reducedMotion', !accessibility.reducedMotion)
                  }
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    accessibility.reducedMotion ? 'bg-teal-800' : 'bg-slate-300'
                  }`}
                  aria-label="Toggle Reduced Motion"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      accessibility.reducedMotion ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. NOTIFICATIONS & ALERT PREFERENCES */}
        {activeSection === 'notifications' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">In-Cabin Driver Alerts</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure tone notifications and early approach warnings before crossing into virtual zones.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Gentle Chime on Zone Approach</div>
                  <div className="text-slate-500">Audio reminder when vehicle enters the 400m decelerate window</div>
                </div>
                <input
                  type="checkbox"
                  checked={audibleAlerts}
                  onChange={(e) => setAudibleAlerts(e.target.checked)}
                  className="w-4 h-4 accent-teal-800"
                />
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Temporary Construction Zone Warnings</div>
                  <div className="text-slate-500">High-priority warning for recently added work zones</div>
                </div>
                <input
                  type="checkbox"
                  checked={approachHaptic}
                  onChange={(e) => setApproachHaptic(e.target.checked)}
                  className="w-4 h-4 accent-teal-800"
                />
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Advance Warning Threshold</div>
                  <div className="text-slate-500">Distance before zone entry to trigger approach state</div>
                </div>
                <select
                  value={leadDistanceThreshold}
                  onChange={(e) => setLeadDistanceThreshold(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800"
                >
                  <option value="300m">300 meters</option>
                  <option value="450m">450 meters (Recommended)</option>
                  <option value="600m">600 meters</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 3. PRIVACY & TELEMETRY */}
        {activeSection === 'privacy' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Privacy & Telemetry Policy</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Transparent information regarding safety telemetry transmission.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-3 leading-relaxed">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-teal-800" />
                <span>When is Telemetry Transmitted?</span>
              </div>
              <p>
                During routine driving, the Smart Virtual Speed Reducer system operates completely
                autonomously using locally stored speed zones. Your day-to-day route is not continuously
                streamed.
              </p>
              <p>
                <strong className="text-slate-900">Active Emergency Override:</strong> When an emergency
                override is declared, continuous GPS, speed, and IMU telemetry is transmitted to the
                Government Safety Gateway. This is required by public safety regulations to prevent
                unauthorized tampering with school and hospital speed zones.
              </p>
              <p>
                <strong className="text-slate-900">Local Cache:</strong> All map validation hashes and
                speed events remain securely stored on your on-board hardware unit ({vehicle.deviceId}).
              </p>
            </div>
          </div>
        )}

        {/* 4. SECURITY & DEVICE */}
        {activeSection === 'security' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Device Pairing & On-Board Security</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Hardware pairing between this mobile portal and your in-vehicle OBD/CAN controller.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Paired Hardware Controller</div>
                  <div className="font-mono text-slate-600 mt-0.5">{vehicle.deviceId} (Tier 2 Certified)</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-bold">
                  Paired & Encrypted
                </span>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Driver App Biometrics / PIN</div>
                  <div className="text-slate-500 mt-0.5">Required before requesting an emergency override</div>
                </div>
                <span className="text-slate-700 font-medium">Enabled (Face ID / PIN)</span>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Active Session Token</div>
                  <div className="text-slate-500 mt-0.5">Expires in 18 hours · RSA Session #7890-IN</div>
                </div>
                <button
                  onClick={() => alert('Session refreshed')}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. DRIVER PROFILE */}
        {activeSection === 'account' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Driver & Fleet Operator Profile</h2>
              <p className="text-xs text-slate-500 mt-0.5">Authorized vehicle operator credentials</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                <div>
                  <span className="text-slate-500 block">Authenticated Vehicle Owner</span>
                  <strong className="text-slate-900 text-sm block mt-0.5 truncate">
                    {currentUser?.email || 'owner@svsr-demo.in'}
                  </strong>
                  <span className="text-slate-500 mt-1 block">Role: Verified Owner / Driver</span>
                </div>
                <button
                  onClick={() => logout()}
                  className="mt-3 self-start px-3 py-1 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors"
                >
                  Sign Out
                </button>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
                <span className="text-slate-500 block">Fleet Operator</span>
                <strong className="text-slate-900 text-sm block mt-0.5">CargoMesh Logistics Pvt Ltd</strong>
                <span className="text-slate-500">Fleet Account ID: FLT-BBSR-89</span>
                <span className="text-teal-800 text-[11px] block mt-1 font-medium">✓ State Road Safety Compliance Active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
