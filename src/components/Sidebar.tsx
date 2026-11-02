import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  Timer,
  Orbit,
  Sparkles,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Database,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'subjects'
  | 'planner'
  | 'focus-room'
  | 'universe'
  | 'ai-companion'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenAuth: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  onOpenAuth,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, isDemo, logout } = useAuth();
  const { health } = useApp();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'universe',
      label: 'Focus Universe',
      icon: <Orbit className="w-4 h-4 text-[#64FFCA]" />,
      badge: '3D Space',
    },
    {
      id: 'subjects',
      label: 'My Subjects',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'planner',
      label: 'Study Planner',
      icon: <CalendarCheck className="w-4 h-4" />,
    },
    {
      id: 'focus-room',
      label: 'Focus Room',
      icon: <Timer className="w-4 h-4 text-[#00D68F]" />,
    },
    {
      id: 'ai-companion',
      label: 'AI Companion',
      icon: <Sparkles className="w-4 h-4 text-[#64FFCA]" />,
    },
    {
      id: 'analytics',
      label: 'Progress Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const handleNavClick = (id: NavTab) => {
    onSelectTab(id);
    onCloseMobile();
    window.scrollTo({ top: 0, left: 0 });
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0 });
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return 'FF';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between select-none bg-[#050807]">
      {/* Top: Logo & Geometric Cyber Emerald Mark */}
      <div>
        <div className="flex items-center justify-between px-4 py-5 border-b border-[rgba(100,255,202,0.14)]">
          <div className="flex items-center gap-3">
            {/* Custom Cyber Emerald Mark with glowing core & orbit */}
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[#008F62] via-[#00D68F] to-[#64FFCA] p-[1.5px] shadow-[0_0_18px_rgba(0,214,143,0.4)] shrink-0 group">
              <div className="w-full h-full bg-[#050807] rounded-[10px] flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#00D68F] transition-transform duration-500 group-hover:rotate-45">
                  <circle cx="12" cy="12" r="3.2" fill="currentColor" />
                  <ellipse cx="12" cy="12" rx="8" ry="3.2" stroke="#64FFCA" strokeWidth="1.5" strokeDasharray="2 2" />
                  <ellipse cx="12" cy="12" rx="3.2" ry="8" stroke="#00D68F" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold tracking-tight text-[#F3FFF9] text-base">FocusFlow</span>
                  <span className="text-[10px] tracking-wider text-[#64FFCA] font-mono px-1.5 py-0.2 rounded-full bg-[#64FFCA]/10 border border-[#64FFCA]/25 font-semibold">
                    EMERALD
                  </span>
                </div>
                <div className="text-[11px] text-[#91A69B] truncate">3D AI Study Operating System</div>
              </div>
            )}
          </div>

          {/* Desktop collapse button */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 text-[#91A69B] hover:text-[#F3FFF9] rounded-lg hover:bg-[#12221A] transition-colors cursor-pointer"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group cursor-pointer relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-[rgba(0,214,143,0.18)] via-[rgba(100,255,202,0.06)] to-transparent text-[#F3FFF9] shadow-[0_0_20px_rgba(0,214,143,0.14)] border border-[#00D68F]/35'
                    : 'text-[#91A69B] hover:text-[#F3FFF9] hover:bg-[#0D1713]/90 border border-transparent hover:border-[rgba(100,255,202,0.12)]'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-gradient-to-b from-[#00D68F] to-[#64FFCA] shadow-[0_0_8px_#64FFCA]" />
                )}
                <span className={`shrink-0 transition-transform ${isActive ? 'scale-110 text-[#64FFCA]' : 'group-hover:scale-105'}`}>
                  {item.icon}
                </span>

                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-mono tracking-wide px-1.5 py-0.5 rounded-full bg-[#00D68F]/12 text-[#64FFCA] border border-[#00D68F]/25 font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Database diagnostic badge & User Profile */}
      <div className="p-3 border-t border-[rgba(100,255,202,0.14)] space-y-2.5">
        {/* DB & Health indicator */}
        {!isCollapsed && health && (
          <div className="px-3 py-2 rounded-xl bg-[#0D1713]/90 border border-[rgba(100,255,202,0.1)] flex items-center justify-between text-[10px] text-[#91A69B]">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#64FFCA]" />
              <span className="truncate">{health.database.isConnected ? 'MongoDB Active' : 'Resilient Local Storage'}</span>
            </div>
            <span
              className={`w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px] ${
                health.database.isConnected ? 'bg-[#00D68F] shadow-[#00D68F]' : 'bg-[#FFC857] shadow-[#FFC857]'
              }`}
            />
          </div>
        )}

        {/* User Card */}
        {user ? (
          <div
            className={`p-2.5 rounded-xl bg-[#0D1713]/95 border border-[rgba(100,255,202,0.14)] flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-between'
            } shadow-[0_4px_16px_rgba(0,0,0,0.5)]`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#008F62]/50 via-[#00D68F]/30 to-[#64FFCA]/20 border border-[rgba(100,255,202,0.3)] flex items-center justify-center text-xs font-bold text-[#F3FFF9] shrink-0 shadow-sm">
                {getInitials(user.name)}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[#F3FFF9] truncate">{user.name}</span>
                    {isDemo && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00D68F]/15 text-[#64FFCA] font-mono font-bold border border-[#00D68F]/25">
                        DEMO
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#91A69B] truncate">{user.email}</div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 text-[#91A69B] hover:text-[#FF647C] rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full py-2 px-3 rounded-xl bg-[#0D1713] hover:bg-[#12221A] border border-[rgba(100,255,202,0.25)] text-[#00D68F] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <UserIcon className="w-3.5 h-3.5" />
            {!isCollapsed && <span>Sign In</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-[#050807] border-r border-[rgba(100,255,202,0.12)] transition-all duration-200 z-20 ${
          isCollapsed ? 'w-20' : 'w-64'
        } shrink-0 sticky top-0 h-screen`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onCloseMobile} />
          <div className="relative w-72 bg-[#050807] border-r border-[rgba(100,255,202,0.2)] h-full z-10 flex flex-col shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
