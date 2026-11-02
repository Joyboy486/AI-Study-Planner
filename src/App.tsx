import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { AuroraCanvas } from './components/ui/AuroraCanvas';
import { Dashboard } from './pages/Dashboard';
import { FocusUniverse } from './pages/FocusUniverse';
import { Subjects } from './pages/Subjects';
import { Planner } from './pages/Planner';
import { FocusRoom } from './pages/FocusRoom';
import { AICompanion } from './pages/AICompanion';
import { Analytics } from './pages/Analytics';
import { SettingsPage } from './pages/Settings';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { CreateSubjectModal } from './components/CreateSubjectModal';
import { Toast } from './components/Toast';

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const { isLoadingData } = useApp();

  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Trigger onboarding if user registered but has not completed onboarding
  React.useEffect(() => {
    if (user && user.preferences && user.preferences.onboardingCompleted === false) {
      setIsOnboardingOpen(true);
    }
  }, [user]);

  const mainViewportRef = React.useRef<HTMLDivElement>(null);

  // Reset scroll to top of main viewport whenever navigation tab changes
  React.useEffect(() => {
    if (mainViewportRef.current) {
      mainViewportRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentTab]);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#050807] text-[#F3FFF9] selection:bg-[#00D68F]/30 selection:text-white">
      {/* Dynamic 3D Cosmic Aurora & Stardust Canvas */}
      <AuroraCanvas />

      {/* Collapsible Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main Content Viewport */}
      <div
        ref={mainViewportRef}
        className={`relative z-10 flex-1 flex flex-col min-w-0 h-screen ${currentTab === 'ai-companion' ? 'overflow-hidden' : 'overflow-y-auto'}`}
      >
        {/* Sticky Top Bar */}
        <TopBar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Page Container */}
        <main className={`flex-1 flex flex-col min-h-0 px-4 sm:px-8 max-w-7xl w-full mx-auto ${currentTab === 'ai-companion' ? 'py-3 overflow-hidden' : 'pt-6 pb-24'}`}>
          {currentTab === 'overview' && (
            <Dashboard
              onNavigate={setCurrentTab}
              onOpenTaskModal={() => setIsTaskModalOpen(true)}
              onOpenSubjectModal={() => setIsSubjectModalOpen(true)}
            />
          )}

          {currentTab === 'universe' && (
            <FocusUniverse
              onNavigate={setCurrentTab}
              onOpenSubjectModal={() => setIsSubjectModalOpen(true)}
            />
          )}

          {currentTab === 'subjects' && (
            <Subjects
              onNavigate={setCurrentTab}
              onOpenSubjectModal={() => setIsSubjectModalOpen(true)}
            />
          )}

          {currentTab === 'planner' && (
            <Planner
              onNavigate={setCurrentTab}
              onOpenTaskModal={() => setIsTaskModalOpen(true)}
            />
          )}

          {currentTab === 'focus-room' && <FocusRoom />}

          {currentTab === 'ai-companion' && <AICompanion />}

          {currentTab === 'analytics' && <Analytics />}

          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => setIsOnboardingOpen(false)}
      />

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />

      <CreateSubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
      />

      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}
