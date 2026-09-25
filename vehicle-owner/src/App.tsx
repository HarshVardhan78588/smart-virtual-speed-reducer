/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/TopBar';
import { Navigation } from './components/Navigation';
import { LimitedConnectionBanner } from './components/LimitedConnectionBanner';
import { NotificationDrawer } from './components/NotificationDrawer';
import { HomeDashboard } from './components/HomeDashboard';
import { LiveZoneMap } from './components/LiveZoneMap';
import { EmergencySection } from './components/EmergencySection';
import { ActivityTimeline } from './components/ActivityTimeline';
import { VehicleProfile } from './components/VehicleProfile';
import { SettingsSection } from './components/SettingsSection';
import { LoginScreen } from './components/LoginScreen';
import { Shield } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class TabErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Tab runtime exception caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-xl border border-rose-200 p-6 shadow-xs max-w-xl mx-auto my-8">
          <div className="flex items-center gap-3 text-rose-700 mb-3">
            <Shield className="w-5 h-5 text-rose-600" />
            <h2 className="text-sm font-bold text-slate-900">Module Display Exception</h2>
          </div>
          <p className="text-xs text-slate-600 mb-4 font-mono bg-rose-50 p-3 rounded border border-rose-100">
            {this.state.error?.message || 'Unknown runtime exception occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Retry View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
      <TabErrorBoundary>
        {activeTab === 'home' && <HomeDashboard />}
        {activeTab === 'live-zone' && <LiveZoneMap />}
        {activeTab === 'emergency' && <EmergencySection />}
        {activeTab === 'activity' && <ActivityTimeline />}
        {activeTab === 'vehicle' && <VehicleProfile />}
        {activeTab === 'settings' && <SettingsSection />}
      </TabErrorBoundary>
    </main>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { currentUser, authLoading } = useApp();

  // Loading state while onAuthStateChanged resolves session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-xl bg-teal-800 flex items-center justify-center text-white mb-4 shadow-xs">
          <Shield className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <span className="w-4 h-4 border-2 border-teal-800/30 border-t-teal-800 rounded-full animate-spin" />
          <span>Verifying Safety Grid Credentials...</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">Smart Virtual Speed Reducer Gateway</p>
      </div>
    );
  }

  // If not authenticated, show clean Vehicle Owner Login Screen
  if (!currentUser) {
    return <LoginScreen />;
  }

  // Authenticated: show the complete Vehicle Owner interface
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E293B] flex flex-col font-sans transition-colors selection:bg-teal-100 selection:text-teal-900">
      {/* Top Header */}
      <TopBar />

      {/* Desktop Navigation */}
      <Navigation />

      {/* Offline / Limited Connection Notice */}
      <LimitedConnectionBanner />

      {/* Active Screen Viewport */}
      <div className="flex-1">
        <MainContent />
      </div>

      {/* Notifications Slide-over Drawer */}
      <NotificationDrawer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AuthenticatedApp />
    </AppProvider>
  );
}

