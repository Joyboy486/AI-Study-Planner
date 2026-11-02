import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ambientSound } from '../utils/sound';
import { NexusCard } from '../components/ui/NexusCard';
import { NexusButton } from '../components/ui/NexusButton';
import confetti from 'canvas-confetti';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Volume2,
  VolumeX,
  Bell,
  Sparkles,
  BookOpen,
  Calendar,
  Flame,
  Clock,
  History,
  Activity,
  Headphones,
  Maximize2,
  Minimize2,
  FastForward,
} from 'lucide-react';

export const FocusRoom: React.FC = () => {
  const { user } = useAuth();
  const {
    subjects,
    tasks,
    sessions,
    recordSession,
    activeSubjectId,
    setActiveSubjectId,
    activeTaskId,
    setActiveTaskId,
    showToast,
  } = useApp();

  // Mode: focus | short_break | long_break
  const [mode, setMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');

  // Custom durations in minutes
  const [customMinutes] = useState({
    focus: user?.preferences?.focusDuration || 25,
    short_break: user?.preferences?.shortBreakDuration || 5,
    long_break: user?.preferences?.longBreakDuration || 15,
  });

  const [timeLeft, setTimeLeft] = useState(customMinutes.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  // Sound state
  const [ambientType, setAmbientType] = useState<'off' | 'rain' | 'binaural' | 'brownnoise'>('off');
  const [notificationGranted, setNotificationGranted] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );

  const [isZenMode, setIsZenMode] = useState(false);

  // Timestamp tracking to avoid interval lag when tab is in background
  const endTimeRef = useRef<number | null>(null);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00D68F', '#64FFCA', '#008F62', '#DCE7E2'],
      });
    } catch {
      // ignore
    }
  };

  const initialDuration = customMinutes[mode] * 60;
  const progressPct = Math.min(100, Math.max(0, ((initialDuration - timeLeft) / initialDuration) * 100));

  // Change mode
  const handleSwitchMode = (newMode: 'focus' | 'short_break' | 'long_break') => {
    setIsRunning(false);
    setMode(newMode);
    const secs = customMinutes[newMode] * 60;
    setTimeLeft(secs);
    endTimeRef.current = null;
  };

  // Timer tick
  useEffect(() => {
    let animId: NodeJS.Timeout;
    if (isRunning) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
        if (!sessionStartTime) setSessionStartTime(new Date());
      }

      animId = setInterval(() => {
        const remaining = Math.max(0, Math.round((endTimeRef.current! - Date.now()) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(animId);
          handleSessionComplete();
        }
      }, 500);
    } else {
      endTimeRef.current = null;
    }

    return () => {
      if (animId) clearInterval(animId);
    };
  }, [isRunning, timeLeft]);

  // Handle ambient sound changes
  useEffect(() => {
    if (ambientType === 'off') {
      ambientSound.stop();
    } else {
      ambientSound.play(ambientType);
    }
    return () => {
      ambientSound.stop();
    };
  }, [ambientType]);

  const toggleTimer = () => {
    if (!isRunning) {
      if (timeLeft <= 0) {
        setTimeLeft(customMinutes[mode] * 60);
      }
      setIsRunning(true);
    } else {
      setIsRunning(false);
      endTimeRef.current = null;
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(customMinutes[mode] * 60);
    endTimeRef.current = null;
    setSessionStartTime(null);
  };

  const handleSessionComplete = async () => {
    setIsRunning(false);
    endTimeRef.current = null;
    ambientSound.playChime();
    triggerConfetti();

    // Browser notification
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('FocusFlow — Session Completed!', {
        body: mode === 'focus' ? 'Outstanding focus sprint! Take a well-deserved break.' : 'Break completed! Ready for the next deep sprint?',
        icon: '/favicon.ico',
      });
    }

    const durationMins = customMinutes[mode];

    if (mode === 'focus') {
      const targetSubId = activeSubjectId || subjects[0]?.id;
      if (targetSubId) {
        await recordSession({
          subjectId: targetSubId,
          taskId: activeTaskId || undefined,
          duration: durationMins,
          sessionType: 'focus',
          completionStatus: 'completed',
          startTime: (sessionStartTime || new Date(Date.now() - durationMins * 60000)).toISOString(),
          endTime: new Date().toISOString(),
          notes: `Completed ${durationMins}m focus sprint.`,
        });
      }
      showToast(`Completed ${durationMins}m focus session! Logged to history.`, 'success');
      handleSwitchMode('short_break');
    } else {
      showToast('Break completed! Ready for another focus session.', 'info');
      handleSwitchMode('focus');
    }

    setSessionStartTime(null);
  };

  const requestNotification = async () => {
    if (typeof Notification !== 'undefined') {
      const res = await Notification.requestPermission();
      setNotificationGranted(res === 'granted');
      if (res === 'granted') {
        showToast('Notifications enabled for completed study sprints!', 'success');
      }
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const currentSubject = subjects.find((s) => s.id === activeSubjectId) || subjects[0];
  const currentTask = tasks.find((t) => t.id === activeTaskId);

  // Recent completed sessions
  const recentSessions = sessions.slice(0, 5);

  const modeThemeColor =
    mode === 'focus' ? '#00D68F' : mode === 'short_break' ? '#64FFCA' : '#57F5C4';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <NexusCard glowColor="rgba(0, 214, 143, 0.2)" className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight text-[#F3FFF9]">Pomodoro Focus Room</h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#00D68F]/10 text-[#64FFCA] border border-[#00D68F]/25 font-bold">
                Cyber Emerald Zone
              </span>
            </div>
            <p className="text-xs text-[#91A69B] mt-0.5">
              Distraction-free environment with native Web Audio binaural & ambient generators.
            </p>
          </div>

          {/* Ambient audio & Notification triggers */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Ambient sound selector */}
            <div className="flex items-center gap-1.5 p-1 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs">
              <Headphones className="w-3.5 h-3.5 text-[#64FFCA] ml-1.5" />
              {(['off', 'binaural', 'rain', 'brownnoise'] as const).map((snd) => (
                <button
                  key={snd}
                  onClick={() => setAmbientType(snd)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer font-medium ${
                    ambientType === snd
                      ? 'bg-gradient-to-r from-[#008F62] via-[#00D68F] to-[#64FFCA] text-[#050807] font-bold shadow-md'
                      : 'text-[#91A69B] hover:text-[#F3FFF9]'
                  }`}
                >
                  {snd === 'off' ? 'Mute' : snd === 'binaural' ? 'Alpha Wave' : snd}
                </button>
              ))}
            </div>

            {!notificationGranted && (
              <button
                onClick={requestNotification}
                className="p-2.5 rounded-xl bg-[#0A100E] border border-[rgba(100,255,202,0.16)] text-[#91A69B] hover:text-[#F3FFF9] transition-colors cursor-pointer"
                title="Enable desktop notifications"
              >
                <Bell className="w-4 h-4 text-[#FFC857]" />
              </button>
            )}

            <button
              onClick={() => setIsZenMode(true)}
              className="px-3 py-2 rounded-xl bg-[#0A100E] border border-[rgba(100,255,202,0.2)] text-[#64FFCA] hover:text-[#F3FFF9] hover:border-[#00D68F] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-sm"
              title="Enter distraction-free Zen capsule"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Zen Mode</span>
            </button>
          </div>
        </div>
      </NexusCard>

      {/* Main Focus Room Canvas */}
      <NexusCard
        glowColor={
          mode === 'focus'
            ? 'rgba(0, 214, 143, 0.35)'
            : mode === 'short_break'
            ? 'rgba(100, 255, 202, 0.35)'
            : 'rgba(0, 143, 98, 0.35)'
        }
        className="relative p-8 sm:p-12 overflow-hidden shadow-2xl flex flex-col items-center justify-center text-center bg-[#0D1713]"
      >
        {/* Atmospheric Ambient Lighting */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[110px] pointer-events-none transition-all duration-1000"
          style={{
            backgroundColor:
              mode === 'focus'
                ? 'rgba(0, 214, 143, 0.12)'
                : mode === 'short_break'
                ? 'rgba(100, 255, 202, 0.12)'
                : 'rgba(0, 143, 98, 0.12)',
          }}
        />

        {/* Mode Selector Tabs */}
        <div className="relative z-10 flex items-center p-1.5 mb-8 bg-[#0A100E] border border-[rgba(100,255,202,0.2)] rounded-2xl shadow-xl">
          <button
            onClick={() => handleSwitchMode('focus')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'focus'
                ? 'bg-gradient-to-r from-[#008F62] via-[#00D68F] to-[#64FFCA] text-[#050807] shadow-lg shadow-[#00D68F]/30'
                : 'text-[#91A69B] hover:text-[#F3FFF9]'
            }`}
          >
            Deep Focus ({customMinutes.focus}m)
          </button>
          <button
            onClick={() => handleSwitchMode('short_break')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'short_break'
                ? 'bg-gradient-to-r from-[#008F62] via-[#00D68F] to-[#64FFCA] text-[#050807] shadow-lg shadow-[#64FFCA]/30'
                : 'text-[#91A69B] hover:text-[#F3FFF9]'
            }`}
          >
            Short Break ({customMinutes.short_break}m)
          </button>
          <button
            onClick={() => handleSwitchMode('long_break')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'long_break'
                ? 'bg-gradient-to-r from-[#008F62] via-[#00D68F] to-[#64FFCA] text-[#050807] shadow-lg shadow-[#008F62]/30'
                : 'text-[#91A69B] hover:text-[#F3FFF9]'
            }`}
          >
            Long Break ({customMinutes.long_break}m)
          </button>
        </div>

        {/* Course & Task context tag */}
        {mode === 'focus' && (
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 mb-6">
            {/* Subject Selector */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0A100E] border border-[rgba(100,255,202,0.25)] text-xs text-[#DCE7E2] shadow-md">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: currentSubject?.color || '#00D68F' }}
              />
              <select
                value={activeSubjectId || ''}
                onChange={(e) => setActiveSubjectId(e.target.value)}
                className="bg-transparent text-[#F3FFF9] font-medium focus:outline-none cursor-pointer"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#0A100E]">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Task selector if available */}
            {tasks.length > 0 && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0A100E] border border-[rgba(100,255,202,0.25)] text-xs text-[#DCE7E2] shadow-md">
                <span className="text-[#91A69B]">Target Task:</span>
                <select
                  value={activeTaskId || ''}
                  onChange={(e) => setActiveTaskId(e.target.value || null)}
                  className="bg-transparent text-[#F3FFF9] font-medium focus:outline-none max-w-xs truncate cursor-pointer"
                >
                  <option value="" className="bg-[#0A100E]">
                    General Focus (No specific task)
                  </option>
                  {tasks
                    .filter((t) => t.status !== 'completed')
                    .map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#0A100E]">
                        {t.title}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Giant Circular Timer with Holographic Glowing Progress Ring */}
        <div className="relative z-10 w-72 h-72 sm:w-84 sm:h-84 flex items-center justify-center my-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="timerRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#008F62" />
                <stop offset="50%" stopColor="#00D68F" />
                <stop offset="100%" stopColor="#64FFCA" />
              </linearGradient>
              <linearGradient id="dialBezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(100, 255, 202, 0.28)" />
                <stop offset="50%" stopColor="rgba(0, 214, 143, 0.08)" />
                <stop offset="100%" stopColor="rgba(100, 255, 202, 0.22)" />
              </linearGradient>
            </defs>

            {/* Layer 1: Outer Metallic Bezel */}
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="url(#dialBezelGrad)"
              strokeWidth="0.8"
            />

            {/* Layer 2: 12 Dial Hour Ticks */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 360) / 12;
              const rad = (angle * Math.PI) / 180;
              const x1 = 50 + 45.5 * Math.cos(rad);
              const y1 = 50 + 45.5 * Math.sin(rad);
              const x2 = 50 + 47.8 * Math.cos(rad);
              const y2 = 50 + 47.8 * Math.sin(rad);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={i % 3 === 0 ? 'rgba(100, 255, 202, 0.5)' : 'rgba(100, 255, 202, 0.2)'}
                  strokeWidth={i % 3 === 0 ? '1' : '0.6'}
                />
              );
            })}

            {/* Layer 3: Inner Metallic Bevel Track */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(100, 255, 202, 0.08)"
              strokeWidth="0.6"
              strokeDasharray="2 2"
            />

            {/* Layer 4: Background Track */}
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              className="stroke-[rgba(100,255,202,0.08)]"
              strokeWidth="4"
            />

            {/* Layer 5: Active Progress Ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="url(#timerRingGradient)"
              strokeWidth="4.2"
              strokeDasharray="276"
              strokeDashoffset={276 - (276 * progressPct) / 100}
              strokeLinecap="round"
              className="transition-all duration-300 ease-linear"
              style={{
                filter: isRunning
                  ? `drop-shadow(0 0 10px ${modeThemeColor})`
                  : 'drop-shadow(0 0 4px rgba(0, 214, 143, 0.4))',
              }}
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-6xl sm:text-7xl font-extrabold text-[#F3FFF9] font-mono tabular-nums tracking-tighter drop-shadow-[0_0_20px_rgba(0,214,143,0.4)]">
              {timeFormatted}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <Activity className={`w-3.5 h-3.5 ${isRunning ? 'text-[#64FFCA] animate-pulse' : 'text-[#91A69B]'}`} />
              <span className="text-xs uppercase tracking-widest font-bold text-[#91A69B] font-mono">
                {isRunning ? 'Flow State Active' : 'Session Ready'}
              </span>
            </div>

            {/* Quick Adjustment Buttons when Paused */}
            {!isRunning && (
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => setTimeLeft((prev) => Math.max(60, prev - 300))}
                  className="px-2 py-0.5 rounded-md bg-[#0A100E] border border-[rgba(100,255,202,0.15)] text-[10px] font-mono text-[#91A69B] hover:text-[#F3FFF9] hover:border-[#00D68F] transition-colors cursor-pointer"
                  title="Subtract 5 minutes"
                >
                  -5m
                </button>
                <button
                  onClick={() => setTimeLeft((prev) => prev + 300)}
                  className="px-2 py-0.5 rounded-md bg-[#0A100E] border border-[rgba(100,255,202,0.15)] text-[10px] font-mono text-[#91A69B] hover:text-[#F3FFF9] hover:border-[#00D68F] transition-colors cursor-pointer"
                  title="Add 5 minutes"
                >
                  +5m
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Control Buttons (Start / Pause, Reset, Complete Early) */}
        <div className="relative z-10 flex items-center gap-4 mt-8">
          <NexusButton
            variant="secondary"
            size="md"
            onClick={resetTimer}
            icon={<RotateCcw className="w-4 h-4 text-[#91A69B]" />}
          >
            Reset
          </NexusButton>

          <NexusButton
            variant="primary"
            size="lg"
            onClick={toggleTimer}
            icon={isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          >
            {isRunning ? 'Pause Sprint' : 'Start Focus Sprint'}
          </NexusButton>

          <NexusButton
            variant="secondary"
            size="md"
            onClick={handleSessionComplete}
            icon={<CheckCircle2 className="w-4 h-4 text-[#64FFCA]" />}
          >
            Complete
          </NexusButton>
        </div>
      </NexusCard>

      {/* Session History Log */}
      <NexusCard glowColor="rgba(0, 214, 143, 0.2)" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#00D68F]" />
            <h3 className="text-base font-bold text-[#F3FFF9] tracking-tight">Recent Focus Sprints</h3>
          </div>
          <span className="text-xs text-[#91A69B] font-mono px-2 py-0.5 rounded-full bg-[rgba(100,255,202,0.08)]">
            {sessions.length} total logged
          </span>
        </div>

        <div className="space-y-2.5">
          {recentSessions.length === 0 ? (
            <div className="py-6 text-center text-[#91A69B] text-xs">
              No sessions logged yet. Complete a 25-minute sprint to start your history log.
            </div>
          ) : (
            recentSessions.map((sess) => {
              const sub = subjects.find((s) => s.id === sess.subjectId);
              const dateStr = new Date(sess.startTime).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              });
              const timeStr = new Date(sess.startTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={sess.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#0A100E] border border-[rgba(100,255,202,0.1)] hover:border-[#00D68F]/30 transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: sub?.color || '#00D68F' }}
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-[#F3FFF9] truncate">
                        {sub?.name || 'Focused Session'}
                      </div>
                      <div className="text-[11px] text-[#91A69B] font-mono mt-0.5">
                        {dateStr} at {timeStr} {sess.notes ? `· ${sess.notes}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-[#64FFCA]">
                      +{sess.duration} mins
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#00D68F]/10 text-[#64FFCA] border border-[#00D68F]/25 font-bold">
                      Completed
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </NexusCard>

      {/* Distraction-Free Zen Capsule Overlay */}
      {isZenMode && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-[#050807]/96 backdrop-blur-2xl flex flex-col items-center justify-between p-6 sm:p-10 select-none animate-in fade-in duration-300">
          {/* Top Bar with Exit Zen Mode */}
          <div className="w-full max-w-4xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00D68F] shadow-[0_0_10px_#00D68F] animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#64FFCA] font-bold">
                DISTRACTION-FREE ZEN CAPSULE
              </span>
            </div>

            <NexusButton
              variant="secondary"
              size="sm"
              onClick={() => setIsZenMode(false)}
              icon={<Minimize2 className="w-4 h-4 text-[#64FFCA]" />}
            >
              Exit Zen
            </NexusButton>
          </div>

          {/* Centered Large Dial */}
          <div className="flex flex-col items-center justify-center my-auto">
            {/* Subject Context */}
            <div className="flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-[#0A100E] border border-[rgba(100,255,202,0.2)] text-xs text-[#DCE7E2] shadow-xl">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: currentSubject?.color || '#00D68F' }}
              />
              <span className="font-semibold text-[#F3FFF9]">{currentSubject?.name || 'Deep Study'}</span>
              {currentTask && (
                <>
                  <span className="text-[#91A69B]">·</span>
                  <span className="text-[#91A69B] max-w-xs truncate">{currentTask.title}</span>
                </>
              )}
            </div>

            {/* Giant Zen Countdown Dial */}
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  className="stroke-[rgba(100,255,202,0.06)]"
                  strokeWidth="3.5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="url(#timerRingGradient)"
                  strokeWidth="4"
                  strokeDasharray="276"
                  strokeDashoffset={276 - (276 * progressPct) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-300 ease-linear"
                  style={{
                    filter: isRunning
                      ? `drop-shadow(0 0 12px ${modeThemeColor})`
                      : 'drop-shadow(0 0 4px rgba(0, 214, 143, 0.4))',
                  }}
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-7xl sm:text-8xl font-black text-[#F3FFF9] font-mono tabular-nums tracking-tighter drop-shadow-[0_0_30px_rgba(0,214,143,0.5)]">
                  {timeFormatted}
                </span>
                <span className="text-xs uppercase tracking-widest font-mono text-[#64FFCA] font-bold mt-2">
                  {isRunning ? 'Flow State Active' : 'Session Paused'}
                </span>
              </div>
            </div>

            {/* Zen Controls */}
            <div className="flex items-center gap-4 mt-8">
              <NexusButton
                variant="secondary"
                size="md"
                onClick={resetTimer}
                icon={<RotateCcw className="w-4 h-4 text-[#91A69B]" />}
              >
                Reset
              </NexusButton>

              <NexusButton
                variant="primary"
                size="lg"
                onClick={toggleTimer}
                icon={isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              >
                {isRunning ? 'Pause Sprint' : 'Resume Sprint'}
              </NexusButton>

              <NexusButton
                variant="secondary"
                size="md"
                onClick={handleSessionComplete}
                icon={<CheckCircle2 className="w-4 h-4 text-[#64FFCA]" />}
              >
                Complete
              </NexusButton>
            </div>
          </div>

          {/* Ambient Sound Selector in Zen Mode */}
          <div className="flex items-center gap-2 text-xs text-[#91A69B]">
            <Headphones className="w-4 h-4 text-[#64FFCA]" />
            <span>Sound:</span>
            {(['off', 'binaural', 'rain', 'brownnoise'] as const).map((snd) => (
              <button
                key={`zen-${snd}`}
                onClick={() => setAmbientType(snd)}
                className={`px-2 py-0.5 rounded-lg capitalize text-[11px] cursor-pointer transition-colors ${
                  ambientType === snd ? 'text-[#64FFCA] font-bold underline' : 'text-[#91A69B] hover:text-[#F3FFF9]'
                }`}
              >
                {snd === 'off' ? 'Mute' : snd === 'binaural' ? 'Alpha' : snd}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
