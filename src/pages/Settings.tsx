import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { NexusCard } from '../components/ui/NexusCard';
import { NexusButton } from '../components/ui/NexusButton';
import {
  Settings as SettingsIcon,
  Save,
  Database,
  Clock,
  Target,
  Bell,
  Sparkles,
  LogOut,
  ShieldCheck,
  Check,
  RefreshCw,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, isDemo, logout, updatePreferences, loginDemo } = useAuth();
  const { health, showToast, refreshData } = useApp();

  const [weeklyGoal, setWeeklyGoal] = useState<number>(user?.preferences?.weeklyHourGoal || 20);
  const [focusDuration, setFocusDuration] = useState<number>(user?.preferences?.focusDuration || 25);
  const [shortBreak, setShortBreak] = useState<number>(user?.preferences?.shortBreakDuration || 5);
  const [longBreak, setLongBreak] = useState<number>(user?.preferences?.longBreakDuration || 15);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(user?.preferences?.soundEnabled ?? true);
  const [studyHours, setStudyHours] = useState<string[]>(
    user?.preferences?.availableStudyHours || ['morning', 'evening']
  );
  const [isSaving, setIsSaving] = useState(false);

  const toggleHour = (slot: string) => {
    if (studyHours.includes(slot)) {
      setStudyHours(studyHours.filter((s) => s !== slot));
    } else {
      setStudyHours([...studyHours, slot]);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updatePreferences({
        weeklyHourGoal: Number(weeklyGoal),
        focusDuration: Number(focusDuration),
        shortBreakDuration: Number(shortBreak),
        longBreakDuration: Number(longBreak),
        soundEnabled,
        availableStudyHours: studyHours,
      });
      showToast('Settings saved successfully', 'success');
      refreshData();
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReloadDemo = async () => {
    await loginDemo();
    showToast('Loaded demo student profile with sample courses & sessions', 'info');
    refreshData();
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      {/* Header bar */}
      <NexusCard glowColor="rgba(0, 214, 143, 0.2)" className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight text-[#F3FFF9]">Workspace Preferences</h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#00D68F]/10 text-[#64FFCA] border border-[#00D68F]/25 font-bold">
                System Config
              </span>
            </div>
            <p className="text-xs text-[#91A69B] mt-0.5">
              Configure focus timers, study targets, and cloud database diagnostics.
            </p>
          </div>

          <NexusButton
            variant="primary"
            size="sm"
            onClick={handleSavePreferences}
            disabled={isSaving}
            icon={<Save className="w-4 h-4 text-white" />}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </NexusButton>
        </div>
      </NexusCard>

      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* Section 1: Study Goals & Pomodoro Durations */}
        <NexusCard glowColor="rgba(0, 214, 143, 0.2)" className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-[#00D68F]" />
            <h3 className="text-base font-bold text-[#F3FFF9] tracking-tight">Focus & Session Defaults</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#DCE7E2] mb-1.5">
                Weekly Study Target (Hours)
              </label>
              <input
                type="number"
                min={5}
                max={80}
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-sm text-[#F3FFF9] font-mono focus:outline-none focus:border-[#00D68F]"
              />
              <span className="text-[11px] text-[#91A69B] mt-1 block">
                Used to calculate daily velocity and target percentages.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#DCE7E2] mb-1.5">
                Focus Session Length (Minutes)
              </label>
              <input
                type="number"
                min={10}
                max={120}
                value={focusDuration}
                onChange={(e) => setFocusDuration(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-sm text-[#F3FFF9] font-mono focus:outline-none focus:border-[#00D68F]"
              />
              <span className="text-[11px] text-[#91A69B] mt-1 block">
                Standard Pomodoro sprint duration (e.g. 25m or 50m).
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#DCE7E2] mb-1.5">
                Short Break Length (Minutes)
              </label>
              <input
                type="number"
                min={2}
                max={30}
                value={shortBreak}
                onChange={(e) => setShortBreak(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-sm text-[#F3FFF9] font-mono focus:outline-none focus:border-[#00D68F]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#DCE7E2] mb-1.5">
                Long Break Length (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={60}
                value={longBreak}
                onChange={(e) => setLongBreak(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-sm text-[#F3FFF9] font-mono focus:outline-none focus:border-[#00D68F]"
              />
            </div>
          </div>
        </NexusCard>

        {/* Section 2: Study Windows & Sound */}
        <NexusCard glowColor="rgba(100, 255, 202, 0.2)" className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-[#64FFCA]" />
            <h3 className="text-base font-bold text-[#F3FFF9] tracking-tight">Preferred Study Windows</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'morning', label: 'Morning', hours: '6 AM – 11 AM' },
              { id: 'afternoon', label: 'Midday', hours: '11 AM – 4 PM' },
              { id: 'evening', label: 'Evening', hours: '4 PM – 9 PM' },
              { id: 'night', label: 'Night Owl', hours: '9 PM – 2 AM' },
            ].map((slot) => {
              const active = studyHours.includes(slot.id);
              return (
                <button
                  type="button"
                  key={slot.id}
                  onClick={() => toggleHour(slot.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-[#008F62]/25 to-[#00D68F]/15 border-[#00D68F] text-[#F3FFF9] shadow-sm'
                      : 'bg-[#0A100E] border-[rgba(100,255,202,0.12)] text-[#91A69B] hover:border-[rgba(100,255,202,0.25)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span>{slot.label}</span>
                    {active && <Check className="w-3.5 h-3.5 text-[#64FFCA]" />}
                  </div>
                  <div className="text-[10px] text-[#91A69B] font-mono">{slot.hours}</div>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[rgba(100,255,202,0.12)] flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#F3FFF9] block">Session Completion Chime</span>
              <span className="text-[11px] text-[#91A69B]">Play pleasant audio chime when timers finish</span>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 accent-[#00D68F] cursor-pointer"
            />
          </div>
        </NexusCard>

        {/* Section 3: Database & Cloud Diagnostics */}
        <NexusCard glowColor="rgba(0, 214, 143, 0.2)" className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-[#00D68F]" />
            <h3 className="text-base font-bold text-[#F3FFF9] tracking-tight">System & Database Architecture</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#0A100E] border border-[rgba(100,255,202,0.1)] space-y-1">
              <span className="text-[#91A69B] font-medium">Database Storage Engine</span>
              <div className="text-[#F3FFF9] font-semibold font-mono flex items-center gap-2 mt-1">
                <span
                  className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${
                    health?.database.isConnected ? 'bg-[#64FFCA] shadow-[#64FFCA]' : 'bg-[#FFC857] shadow-[#FFC857]'
                  }`}
                />
                <span>
                  {health?.database.isConnected
                    ? 'MongoDB Connection Active'
                    : 'Embedded Local Store (MongoDB Standby)'}
                </span>
              </div>
              <p className="text-[10px] text-[#91A69B] pt-1">
                {health?.database.isConnected
                  ? 'All changes are permanently committed to MongoDB collections.'
                  : 'Operating with in-memory resilient storage. Connect MONGODB_URI in .env to switch.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0A100E] border border-[rgba(100,255,202,0.1)] space-y-1">
              <span className="text-[#91A69B] font-medium">Gemini AI Model Status</span>
              <div className="text-[#F3FFF9] font-semibold font-mono flex items-center gap-2 mt-1">
                <span
                  className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${
                    health?.geminiConfigured ? 'bg-[#00D68F] shadow-[#00D68F]' : 'bg-[#64FFCA] shadow-[#64FFCA]'
                  }`}
                />
                <span>
                  {health?.geminiConfigured
                    ? 'Gemini 2.5 Flash Online'
                    : 'Cognitive Heuristics Fallback Active'}
                </span>
              </div>
              <p className="text-[10px] text-[#91A69B] pt-1">
                Full-stack server proxy configured via User-Agent telemetry.
              </p>
            </div>
          </div>
        </NexusCard>

        {/* Section 4: Account Details & Session Actions */}
        <NexusCard glowColor="rgba(0, 214, 143, 0.2)" className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-[#F3FFF9]">{user?.name || 'Academic Scholar'}</h4>
            <p className="text-xs text-[#91A69B]">{user?.email || 'student@focusflow.ai'}</p>
            {isDemo && (
              <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20 font-bold">
                Active in Demo Mode
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <NexusButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleReloadDemo}
              icon={<RefreshCw className="w-3.5 h-3.5 text-[#64FFCA]" />}
            >
              Reset Sample Demo Courses
            </NexusButton>

            {user && (
              <NexusButton
                type="button"
                variant="danger"
                size="sm"
                onClick={logout}
                icon={<LogOut className="w-3.5 h-3.5" />}
              >
                Sign Out
              </NexusButton>
            )}
          </div>
        </NexusCard>
      </form>
    </div>
  );
};

