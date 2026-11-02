import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { NavTab } from './Sidebar';
import { NexusButton } from './ui/NexusButton';
import { Menu, Flame, Play, Sparkles } from 'lucide-react';

interface TopBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenMobileNav: () => void;
  onOpenAuth: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenMobileNav,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const { analytics, timerState } = useApp();

  const tabLabels: Record<NavTab, string> = {
    overview: 'Overview',
    universe: 'Focus Universe',
    subjects: 'My Subjects',
    planner: 'Study Planner',
    'focus-room': 'Focus Room',
    'ai-companion': 'AI Companion',
    analytics: 'Progress Analytics',
    settings: 'Settings',
  };

  const streak = analytics?.currentStreak ?? 7;

  return (
    <header className="sticky top-0 z-30 shrink-0 flex items-center justify-between gap-4 px-4 sm:px-8 py-3.5 bg-[#050807]/90 backdrop-blur-xl border-b border-[rgba(100,255,202,0.12)]">
      {/* Zone 1: Mobile Hamburger + Breadcrumb Trail */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 text-[#91A69B] hover:text-[#64FFCA] rounded-xl hover:bg-[#12221A] transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clean Breadcrumb */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#91A69B] font-medium whitespace-nowrap">FocusFlow</span>
          <span className="text-[rgba(100,255,202,0.3)]">/</span>
          <span className="text-[#F3FFF9] font-semibold tracking-tight whitespace-nowrap">
            {tabLabels[currentTab]}
          </span>
        </div>
      </div>

      {/* Zone 2: Streak Indicator & Quick Timer Status */}
      <div className="hidden sm:flex items-center gap-4 text-xs font-medium">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D1713] border border-[rgba(100,255,202,0.16)] text-[#DCE7E2] shadow-sm">
          <Flame className="w-3.5 h-3.5 text-[#00D68F] animate-pulse" />
          <span className="font-mono tabular-nums font-bold text-[#F3FFF9]">{streak}</span>
          <span className="text-[#91A69B]">Day Streak</span>
        </div>

        {timerState.isRunning && (
          <button
            onClick={() => onSelectTab('focus-room')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00D68F]/15 border border-[#00D68F]/30 text-[#64FFCA] animate-pulse cursor-pointer shadow-sm hover:scale-105 transition-transform"
          >
            <span className="w-2 h-2 rounded-full bg-[#64FFCA] shadow-[0_0_8px_#64FFCA]" />
            <span className="font-mono tabular-nums font-bold">
              {Math.floor(timerState.timeLeft / 60)}:{(timerState.timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </button>
        )}
      </div>

      {/* Zone 3: Primary Quick CTA */}
      <div className="flex items-center gap-2.5 shrink-0">
        {currentTab !== 'ai-companion' && (
          <NexusButton
            variant="secondary"
            size="sm"
            icon={<Sparkles className="w-3.5 h-3.5 text-[#64FFCA]" />}
            onClick={() => onSelectTab('ai-companion')}
            className="hidden lg:inline-flex"
          >
            Ask AI
          </NexusButton>
        )}

        <NexusButton
          variant="primary"
          size="sm"
          halo={true}
          icon={<Play className="w-3 h-3 fill-current" />}
          onClick={() => onSelectTab('focus-room')}
        >
          Start Focus
        </NexusButton>

        {!user && (
          <NexusButton
            variant="secondary"
            size="sm"
            onClick={onOpenAuth}
          >
            Sign In
          </NexusButton>
        )}
      </div>
    </header>
  );
};
