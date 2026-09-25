import React, { useState } from 'react';
import {
  loginWithEmailAndPassword,
  getFirebaseConfig,
  reinitializeFirebase,
} from '../../services/firebase';
import { FirebaseConfig } from '../../types/firebase';
import {
  Shield,
  KeyRound,
  Mail,
  AlertTriangle,
  Loader2,
  Settings,
  Car,
  CheckCircle2,
} from 'lucide-react';

interface VehicleAuthScreenProps {
  onAuthenticated: () => void;
  isLoadingAuth: boolean;
}

export const VehicleAuthScreen: React.FC<VehicleAuthScreenProps> = ({
  onAuthenticated,
  isLoadingAuth,
}) => {
  const currentConfig = getFirebaseConfig();

  const [email, setEmail] = useState('vehicle@svsr-demo.in');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Configuration drawer state (if env vars are not set)
  const [showConfigPanel, setShowConfigPanel] = useState(!currentConfig);
  const [configForm, setConfigForm] = useState<FirebaseConfig>({
    apiKey: currentConfig?.apiKey || '',
    authDomain:
      currentConfig?.authDomain || 'smart-virtual-speed-reducer.firebaseapp.com',
    databaseURL:
      currentConfig?.databaseURL ||
      'https://smart-virtual-speed-reducer-default-rtdb.firebaseio.com',
    projectId: currentConfig?.projectId || 'smart-virtual-speed-reducer',
    storageBucket:
      currentConfig?.storageBucket ||
      'smart-virtual-speed-reducer.firebasestorage.app',
    messagingSenderId: currentConfig?.messagingSenderId || '',
    appId: currentConfig?.appId || '',
  });
  const [configSavedNotice, setConfigSavedNotice] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configForm.apiKey || !configForm.projectId) {
      setErrorMsg('API Key and Project ID are required to initialize Firebase.');
      return;
    }
    try {
      reinitializeFirebase(configForm);
      setConfigSavedNotice(true);
      setShowConfigPanel(false);
      setErrorMsg(null);
      setTimeout(() => setConfigSavedNotice(false), 3000);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to initialize Firebase with provided config.'
      );
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const activeConfig = getFirebaseConfig();
    if (!activeConfig) {
      setShowConfigPanel(true);
      setErrorMsg(
        'Firebase Web App configuration is required. Please provide vehicle-digital-twin Firebase Web App settings below.'
      );
      return;
    }

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both vehicle email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await loginWithEmailAndPassword(email.trim(), password);
      onAuthenticated();
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        setErrorMsg('Invalid vehicle authentication credentials. Please verify email and password.');
      } else if (error.code === 'auth/user-not-found') {
        setErrorMsg('Vehicle test account not found in smart-virtual-speed-reducer project.');
      } else if (error.code === 'auth/network-request-failed') {
        setErrorMsg('Network error connecting to Firebase Authentication.');
      } else {
        setErrorMsg(error.message || 'Authentication failed. Please verify credentials and Firebase settings.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-6 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-700 animate-spin" />
          <div className="text-sm font-semibold text-slate-700">
            Checking Vehicle Authentication State...
          </div>
          <p className="text-xs text-slate-500">
            Connecting to smart-virtual-speed-reducer Firebase service
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-between text-slate-800">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-black text-sm shadow-xs">
            SV
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
              Smart Virtual Speed Reducer
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              In-Vehicle Driver Interface &amp; Digital Twin Gateway
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowConfigPanel(!showConfigPanel)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Settings className="w-3.5 h-3.5 text-teal-600" />
          <span>{showConfigPanel ? 'Hide Config' : 'Firebase Config'}</span>
        </button>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg space-y-4">
          {/* Success / saved notice */}
          {configSavedNotice && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
              <span>Firebase configuration saved and initialized successfully.</span>
            </div>
          )}

          {/* Config panel if toggled or needed */}
          {showConfigPanel && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <Settings className="w-4 h-4 text-teal-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  vehicle-digital-twin Firebase Web App Settings
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Project: <strong className="text-slate-800">smart-virtual-speed-reducer</strong>.
                If environment variables are configured in the container, these are auto-detected.
                Otherwise, provide your Web App configuration below:
              </p>

              <form onSubmit={handleSaveConfig} className="mt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      API Key (VITE_FIREBASE_API_KEY)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="AIzaSy..."
                      value={configForm.apiKey}
                      onChange={(e) =>
                        setConfigForm({ ...configForm, apiKey: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono focus:outline-teal-600 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Project ID (VITE_FIREBASE_PROJECT_ID)
                    </label>
                    <input
                      type="text"
                      required
                      value={configForm.projectId}
                      onChange={(e) =>
                        setConfigForm({ ...configForm, projectId: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono focus:outline-teal-600 bg-slate-50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Realtime Database URL (VITE_FIREBASE_DATABASE_URL)
                    </label>
                    <input
                      type="text"
                      required
                      value={configForm.databaseURL}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          databaseURL: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono focus:outline-teal-600 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Auth Domain
                    </label>
                    <input
                      type="text"
                      value={configForm.authDomain}
                      onChange={(e) =>
                        setConfigForm({ ...configForm, authDomain: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono focus:outline-teal-600 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      App ID (VITE_FIREBASE_APP_ID)
                    </label>
                    <input
                      type="text"
                      placeholder="1:128364...:web:..."
                      value={configForm.appId}
                      onChange={(e) =>
                        setConfigForm({ ...configForm, appId: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono focus:outline-teal-600 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    Save &amp; Initialize Firebase
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Login Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
              <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Vehicle Digital Twin Login
                </h2>
                <p className="text-xs text-slate-500">
                  Onboard Gateway · Firebase Authentication
                </p>
              </div>
            </div>

            {/* Test Account Helper */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>Configured Test Account</span>
                <span className="font-mono text-[11px] text-teal-700">
                  UID: YKAPY5KJ...
                </span>
              </div>
              <div className="font-mono text-[11px] text-slate-500 flex items-center justify-between">
                <span>Email: vehicle@svsr-demo.in</span>
                <button
                  type="button"
                  onClick={() => setEmail('vehicle@svsr-demo.in')}
                  className="text-teal-700 hover:underline font-sans text-xs font-medium"
                >
                  Use Default
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vehicle Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vehicle@svsr-demo.in"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-teal-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-teal-600 bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                    <span>Authenticating with Firebase...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-teal-400" />
                    <span>Sign In to Digital Twin</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        Smart Virtual Speed Reducer · Firebase Authentication &amp; Live Realtime Database Synchronization
      </footer>
    </div>
  );
};
