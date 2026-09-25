import React, { useState } from 'react';
import { Radio } from 'lucide-react';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TrafficSystemProvider, useTrafficSystem } from './context/TrafficSystemContext';
import { AuthorityLoginPage } from './components/auth/AuthorityLoginPage';
import { TopBar } from './components/common/TopBar';
import { Sidebar } from './components/common/Sidebar';
import { PublishModal } from './components/common/PublishModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { DigitalMapPage } from './pages/DigitalMapPage';
import { ZoneManagementPage } from './pages/ZoneManagementPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { EmergencyOverridesPage } from './pages/EmergencyOverridesPage';
import { SafetyReportsPage } from './pages/SafetyReportsPage';
import { SystemActivityPage } from './pages/SystemActivityPage';
import { SettingsPage } from './pages/SettingsPage';

const MainLayout: React.FC = () => {
  const { activeTab, events } = useTrafficSystem();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  const unreadAlertsCount = events.filter(
    e => e.severity === 'critical' || e.severity === 'warning'
  ).length;

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage />;
      case 'map':
        return <DigitalMapPage />;
      case 'zones':
        return <ZoneManagementPage />;
      case 'vehicles':
        return <VehiclesPage />;
      case 'overrides':
        return <EmergencyOverridesPage />;
      case 'reports':
        return <SafetyReportsPage />;
      case 'activity':
        return <SystemActivityPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Persistent Top Navigation Bar */}
      <TopBar
        onToggleNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
        unreadAlertsCount={unreadAlertsCount}
      />

      {/* Main Workspace Layout (Persistent Desktop Sidebar + Viewport) */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto px-6 py-6 bg-slate-100/60">
          <div className="max-w-[1600px] mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <PublishModal />
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { loading, isAuthenticated } = useAuth();

  // Requirement 7: Show clean authentication/loading state while Firebase determines current session
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 selection:bg-teal-100 selection:text-teal-900 font-sans">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mx-auto shadow-2xs">
            <Radio className="w-6 h-6 animate-pulse text-teal-600" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Verifying Authority Session...
            </h2>
            <p className="text-xs text-slate-500">
              Connecting to National ITS Command Gateway & Firebase Authentication
            </p>
          </div>
          <div className="flex justify-center pt-2">
            <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // Requirement 4: The existing Government Control dashboard should only become accessible after successful authentication
  if (!isAuthenticated) {
    return <AuthorityLoginPage />;
  }

  return (
    <TrafficSystemProvider>
      <MainLayout />
    </TrafficSystemProvider>
  );
};

export default function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AccessibilityProvider>
  );
}
