/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  Lock,
  Mail,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Settings,
  HelpCircle,
  KeyRound,
} from 'lucide-react';
import {
  isFirebaseConfigured,
  getFirebaseConfig,
  getMissingConfigKeys,
  saveRuntimeFirebaseConfig,
  FirebaseWebConfig,
} from '../services/firebase';

export const LoginScreen: React.FC = () => {
  const { login, authError, setAuthError } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Runtime config form state (for when env vars are not set in the container)
  const currentConfig = getFirebaseConfig();
  const [customApiKey, setCustomApiKey] = useState(currentConfig.apiKey || '');
  const [customDatabaseUrl, setCustomDatabaseUrl] = useState(
    currentConfig.databaseURL || 'https://smart-virtual-speed-reducer-default-rtdb.firebaseio.com'
  );
  const [customProjectId, setCustomProjectId] = useState(
    currentConfig.projectId || 'smart-virtual-speed-reducer'
  );
  const [customAppId, setCustomAppId] = useState(currentConfig.appId || '');

  const missingKeys = getMissingConfigKeys();
  const configured = isFirebaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setAuthError('Please enter both your email and password.');
      return;
    }

    if (!configured) {
      setAuthError(
        'Firebase configuration is required. Please set the Web App configuration values.'
      );
      setShowConfigModal(true);
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      console.error('Authentication failure:', err);
      let message = 'Unable to sign in. Please verify your credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        message = 'Invalid email or password. Please check your credentials.';
      } else if (err.code === 'auth/user-not-found') {
        message = 'No account found matching this email address.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please provide a valid email format.';
      } else if (err.code === 'auth/network-request-failed') {
        message = 'Network error: Please check your internet connection.';
      } else if (err.message) {
        message = err.message;
      }
      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customApiKey.trim()) {
      alert('Firebase API Key is required.');
      return;
    }
    saveRuntimeFirebaseConfig({
      apiKey: customApiKey.trim(),
      databaseURL: customDatabaseUrl.trim(),
      projectId: customProjectId.trim(),
      appId: customAppId.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E293B] flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-xl bg-teal-800 flex items-center justify-center text-white shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-center text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Smart Virtual Speed Reducer
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-500 font-medium">
          Vehicle Owner & Driver Portal · Connected Safety Grid
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Missing Firebase Config Alert (if any) */}
        {!configured && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">
                  Firebase Web App Configuration Required
                </strong>
                <p className="text-amber-900 mt-0.5">
                  To connect to Firebase Authentication and Realtime Database for project{' '}
                  <code className="font-mono bg-amber-100 px-1 rounded">
                    smart-virtual-speed-reducer
                  </code>
                  , the Firebase Web App credentials are required.
                </p>
                <div className="mt-2 text-[11px] font-mono text-amber-800">
                  Missing: {missingKeys.join(', ')}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowConfigModal(true)}
              className="mt-2 w-full py-1.5 px-3 bg-white border border-amber-300 text-amber-950 rounded-lg text-xs font-semibold hover:bg-amber-100/50 flex items-center justify-center gap-1.5 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-800" />
              <span>Configure Firebase Web App Credentials</span>
            </button>
          </div>
        )}

        {/* Card */}
        <div className="bg-white py-6 px-5 sm:px-8 border border-slate-200/90 rounded-2xl shadow-xs">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1"
              >
                Owner / Driver Email
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@svsr-demo.in"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700 bg-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1"
              >
                Password
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700 bg-white"
                />
              </div>
            </div>

            {/* Test Account Quick Fill Hint */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold text-slate-700">Pre-Configured Test Account:</span>
                <button
                  type="button"
                  onClick={() => setEmail('owner@svsr-demo.in')}
                  className="text-teal-800 hover:text-teal-900 font-bold hover:underline"
                >
                  Use this email
                </button>
              </div>
              <div className="font-mono text-slate-800 mt-1">owner@svsr-demo.in</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Enter the password established for this account in the Firebase project.
              </p>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Vehicle Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Info */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-teal-700" />
              <span>State Safety Grid Session</span>
            </span>
            <button
              onClick={() => setShowConfigModal(true)}
              className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              <span>Firebase Config</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONFIGURATION MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-teal-800" />
                <h3 className="text-sm font-bold text-slate-900">
                  Firebase Web App Configuration
                </h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              These values correspond to the <strong>vehicle-owner</strong> Web App registered in
              your Firebase project <strong>smart-virtual-speed-reducer</strong>.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  API Key (VITE_FIREBASE_API_KEY)
                </label>
                <input
                  type="text"
                  required
                  placeholder="AIzaSy..."
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Project ID (VITE_FIREBASE_PROJECT_ID)
                </label>
                <input
                  type="text"
                  required
                  value={customProjectId}
                  onChange={(e) => setCustomProjectId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Realtime Database URL (VITE_FIREBASE_DATABASE_URL)
                </label>
                <input
                  type="text"
                  required
                  value={customDatabaseUrl}
                  onChange={(e) => setCustomDatabaseUrl(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  App ID (VITE_FIREBASE_APP_ID)
                </label>
                <input
                  type="text"
                  placeholder="1:1234567890:web:abcdef..."
                  value={customAppId}
                  onChange={(e) => setCustomAppId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
                You can also configure these permanently in the environment variables (
                <code className="font-mono">.env</code>).
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-800 text-white font-bold hover:bg-teal-900 shadow-xs"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
