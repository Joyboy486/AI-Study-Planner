import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { NavTab } from '../components/Sidebar';
import { NexusCard } from '../components/ui/NexusCard';
import { NexusButton } from '../components/ui/NexusButton';
import {
  Flame,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ArrowUpRight,
  Plus,
  Play,
  Calendar,
  AlertCircle,
  BookOpen,
  Orbit,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface DashboardProps {
  onNavigate: (tab: NavTab) => void;
  onOpenTaskModal: () => void;
  onOpenSubjectModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenTaskModal,
  onOpenSubjectModal,
}) => {
  const { user } = useAuth();
  const { subjects, tasks, sessions, analytics, toggleTask, setActiveSubjectId } = useApp();

  const firstName = user?.name ? user.name.split(' ')[0] : 'Scholar';
  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Calculate metrics
  const todayMinutes = analytics?.todayMinutes ?? 50;
  const todayTargetMinutes = ((user?.preferences?.weeklyHourGoal || 24) * 60) / 6; // daily target estimate (240 min = 4h)
  const todayPct = Math.min(100, Math.round((todayMinutes / Math.max(30, todayTargetMinutes)) * 100));
  const remainingMinutes = Math.max(0, Math.round(todayTargetMinutes - todayMinutes));

  // Upcoming deadlines (tasks sorted by dueDate)
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const sortedDeadlines = [...pendingTasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);

  // Timeline sessions: past sessions of today + planned tasks
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter((s) => s.startTime.startsWith(todayStr));

  // Chart data
  const chartData = analytics?.dailyData || [
    { day: 'Mon', hours: 2.5, minutes: 150 },
    { day: 'Tue', hours: 3.2, minutes: 192 },
    { day: 'Wed', hours: 1.8, minutes: 108 },
    { day: 'Thu', hours: 4.0, minutes: 240 },
    { day: 'Fri', hours: 2.1, minutes: 126 },
    { day: 'Sat', hours: 3.5, minutes: 210 },
    { day: 'Sun', hours: 2.8, minutes: 168 },
  ];

  const handleStartSession = (subId?: string) => {
    if (subId) setActiveSubjectId(subId);
    onNavigate('focus-room');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. HERO HEADER: Cyber Emerald Dimensional Banner */}
      <NexusCard
        glowColor="emerald"
        className="relative p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-[#0A100E] via-[#0D1713] to-[#050807] border border-[rgba(100,255,202,0.2)] shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00D68F]/15 via-[#64FFCA]/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-[#008F62]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs text-[#64FFCA] font-semibold mb-2 tracking-wide">
              <Calendar className="w-3.5 h-3.5 text-[#00D68F]" />
              <span>{todayDateStr}</span>
              <span className="text-[rgba(100,255,202,0.3)]">·</span>
              <span className="text-[#91A69B] font-mono">Cyber Sprint Cycle</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F3FFF9] mb-2 leading-tight">
              Accelerate your academic mastery,{' '}
              <span className="bg-gradient-to-r from-[#00D68F] via-[#64FFCA] to-[#DCE7E2] bg-clip-text text-transparent">
                {firstName}
              </span>
              .
            </h1>
            <p className="text-sm text-[#91A69B] leading-relaxed">
              "Consistency is the DNA of mastery." You have{' '}
              <span className="text-[#F3FFF9] font-semibold border-b border-[#00D68F]/50">{pendingTasks.length} pending tasks</span> and{' '}
              <span className="text-[#64FFCA] font-semibold border-b border-[#64FFCA]/50">{subjects.length} active courses</span> in orbit.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <NexusButton
              variant="primary"
              onClick={() => onNavigate('ai-companion')}
              icon={<Sparkles className="w-4 h-4 text-[#050807]" />}
            >
              Plan My Day with AI
            </NexusButton>
            <NexusButton
              variant="secondary"
              onClick={() => onNavigate('universe')}
              icon={<Orbit className="w-4 h-4 text-[#64FFCA]" />}
            >
              Explore Focus Universe
            </NexusButton>
          </div>
        </div>
      </NexusCard>

      {/* 2. TOP KPI GRID (Today's Focus, Daily Tasks, Focus Streak) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Today's Focus */}
        <NexusCard glowColor="emerald" className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#00D68F]/15 border border-[#00D68F]/30 flex items-center justify-center shadow-[0_0_12px_rgba(0,214,143,0.25)]">
                <Clock className="w-4 h-4 text-[#00D68F]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#91A69B]">
                Today's Focus
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#91A69B] px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
              Goal: {(todayTargetMinutes / 60).toFixed(1)}h
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 my-2">
            <div>
              <div className="text-3xl font-extrabold text-[#F3FFF9] font-mono tabular-nums tracking-tight">
                {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
              </div>
              <div className="text-xs text-[#91A69B] mt-1">
                {remainingMinutes > 0 ? (
                  <span>{remainingMinutes}m remaining to hit daily pace</span>
                ) : (
                  <span className="text-[#64FFCA] font-semibold flex items-center gap-1">
                    Daily study goal achieved!
                  </span>
                )}
              </div>
            </div>

            {/* Glowing Circular Progress Ring */}
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <defs>
                  <linearGradient id="focusProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#008F62" />
                    <stop offset="50%" stopColor="#00D68F" />
                    <stop offset="100%" stopColor="#64FFCA" />
                  </linearGradient>
                </defs>
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  className="stroke-white/10"
                  strokeWidth="3.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="url(#focusProgressGrad)"
                  strokeWidth="3.5"
                  strokeDasharray="88"
                  strokeDashoffset={88 - (88 * todayPct) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(0, 214, 143, 0.6))' }}
                />
              </svg>
              <span className="absolute text-[11px] font-mono font-bold text-[#F3FFF9]">
                {todayPct}%
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[rgba(100,255,202,0.12)] flex items-center justify-between text-xs">
            <span className="text-[#91A69B]">Completed Sessions: {todaySessions.length}</span>
            <button
              onClick={() => handleStartSession()}
              className="text-[#64FFCA] hover:text-[#F3FFF9] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Focus Now</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </NexusCard>

        {/* Card 2: Daily Tasks */}
        <NexusCard glowColor="mint" className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#64FFCA]/15 border border-[#64FFCA]/30 flex items-center justify-center shadow-[0_0_12px_rgba(100,255,202,0.25)]">
                <CheckCircle2 className="w-4 h-4 text-[#64FFCA]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#91A69B]">
                Daily Tasks
              </span>
            </div>
            <button
              onClick={onOpenTaskModal}
              className="p-1.5 text-[#91A69B] hover:text-[#64FFCA] rounded-lg hover:bg-[#12221A] transition-colors cursor-pointer"
              title="Add task"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 py-2 text-center">
            <div className="p-2.5 rounded-xl bg-[#050807] border border-[rgba(100,255,202,0.1)]">
              <div className="text-2xl font-bold font-mono text-[#F3FFF9] tabular-nums">
                {tasks.length}
              </div>
              <div className="text-[10px] text-[#91A69B] uppercase mt-0.5 font-semibold">Total</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#050807] border border-[rgba(100,255,202,0.1)]">
              <div className="text-2xl font-bold font-mono text-[#00D68F] tabular-nums">
                {tasks.filter((t) => t.status === 'completed').length}
              </div>
              <div className="text-[10px] text-[#91A69B] uppercase mt-0.5 font-semibold">Done</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#050807] border border-[rgba(100,255,202,0.1)]">
              <div className="text-2xl font-bold font-mono text-[#FFC857] tabular-nums">
                {pendingTasks.length}
              </div>
              <div className="text-[10px] text-[#91A69B] uppercase mt-0.5 font-semibold">Pending</div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[rgba(100,255,202,0.12)] flex items-center justify-between text-xs">
            <span className="text-[#91A69B]">
              {analytics?.tasks.overdue ? (
                <span className="text-[#FF647C] font-medium">{analytics.tasks.overdue} overdue</span>
              ) : (
                <span className="text-[#00D68F] font-semibold">Zero overdue</span>
              )}
            </span>
            <button
              onClick={() => onNavigate('planner')}
              className="text-[#64FFCA] hover:text-[#F3FFF9] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Open Planner</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </NexusCard>

        {/* Card 3: Focus Streak */}
        <NexusCard glowColor="emerald" className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#00D68F]/15 border border-[#00D68F]/30 flex items-center justify-center shadow-[0_0_12px_rgba(0,214,143,0.25)]">
                <Flame className="w-4 h-4 text-[#00D68F]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#91A69B]">
                Focus Streak
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#64FFCA] px-2 py-0.5 rounded-full bg-[#00D68F]/10 border border-[#00D68F]/25 font-semibold">
              Best: {analytics?.bestStreak ?? 7}d
            </span>
          </div>

          <div className="flex items-baseline gap-2 my-2">
            <span className="text-4xl font-extrabold text-[#F3FFF9] font-mono tabular-nums tracking-tight">
              {analytics?.currentStreak ?? 7}
            </span>
            <span className="text-sm font-semibold text-[#00D68F]">Days Consecutive</span>
          </div>

          {/* 7-day visual consistency bar */}
          <div className="grid grid-cols-7 gap-1.5 pt-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayLabel, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div
                  className={`w-full h-8 rounded-md transition-all ${
                    idx < 6
                      ? 'bg-gradient-to-t from-[#008F62] to-[#64FFCA] shadow-[0_0_8px_rgba(0,214,143,0.4)]'
                      : 'bg-[#12221A] border border-[rgba(100,255,202,0.2)]'
                  }`}
                />
                <span className="text-[10px] text-[#91A69B] font-mono font-medium">{dayLabel}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-[rgba(100,255,202,0.12)] text-[11px] text-[#91A69B] flex items-center justify-between">
            <span>Streak Protected</span>
            <span className="text-[#00D68F] font-semibold">Active Today</span>
          </div>
        </NexusCard>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT: WEEKLY FOCUS VELOCITY & TODAY'S SCHEDULE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Weekly Focus Chart */}
        <NexusCard glowColor="emerald" className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#F3FFF9] tracking-tight">Weekly Focus Velocity</h3>
                <p className="text-xs text-[#91A69B]">Daily study minutes recorded across past 7 days</p>
              </div>
              {analytics?.comparisonInsight && (
                <div className="text-xs text-[#64FFCA] bg-[#00D68F]/10 border border-[#00D68F]/25 px-3 py-1 rounded-full max-w-sm truncate font-medium">
                  {analytics.comparisonInsight}
                </div>
              )}
            </div>

            {/* Recharts Bar Chart in Cyber Emerald */}
            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="emeraldBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#64FFCA" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#008F62" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    stroke="#1E332A"
                    tick={{ fill: '#91A69B', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#12221A' }}
                  />
                  <YAxis
                    stroke="#1E332A"
                    tick={{ fill: '#91A69B', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val}m`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0, 214, 143, 0.08)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-2.5 rounded-xl bg-[#0D1713] border border-[rgba(100,255,202,0.3)] text-xs shadow-2xl">
                            <div className="font-semibold text-[#F3FFF9]">{data.day}</div>
                            <div className="text-[#64FFCA] font-mono tabular-nums font-bold">
                              {data.minutes} mins ({(data.minutes / 60).toFixed(1)} hrs)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="minutes"
                    fill="url(#emeraldBarGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={38}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[rgba(100,255,202,0.12)] flex items-center justify-between text-xs text-[#91A69B]">
            <div>
              Total Week:{' '}
              <span className="text-[#F3FFF9] font-mono font-semibold">
                {analytics?.currentWeekHours ?? 20.2}h
              </span>
            </div>
            <div>
              Peak Flow:{' '}
              <span className="text-[#64FFCA] font-medium font-mono">
                {analytics?.mostProductiveDay ?? 'Thu (4.0h)'}
              </span>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-[#00D68F] hover:text-[#64FFCA] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Full Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </NexusCard>

        {/* Right 1 Col: Today's Schedule & Timeline */}
        <NexusCard glowColor="mint" className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#F3FFF9] tracking-tight">Today's Schedule</h3>
              <span className="text-[11px] text-[#91A69B] font-mono px-2 py-0.5 rounded-full bg-white/5">
                {todaySessions.length} logged
              </span>
            </div>

            {/* Vertical timeline */}
            <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
              {todaySessions.length === 0 && (
                <div className="py-8 text-center text-[#91A69B] text-xs">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-[#2A3E34]" />
                  <p>No study sessions logged today yet.</p>
                  <button
                    onClick={() => handleStartSession()}
                    className="mt-3 px-3 py-1.5 bg-[#00D68F]/15 hover:bg-[#00D68F]/25 border border-[#00D68F]/30 text-[#64FFCA] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Start 25m Focus Sprint
                  </button>
                </div>
              )}

              {todaySessions.map((sess) => {
                const sub = subjects.find((s) => s.id === sess.subjectId);
                const startTimeStr = new Date(sess.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={sess.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[#050807] border border-[rgba(100,255,202,0.1)] hover:border-[#00D68F]/40 transition-colors"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full mt-1 shrink-0 shadow-sm"
                      style={{ backgroundColor: sub?.color || '#00D68F' }}
                    />
                    <div className="overflow-hidden w-full">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#F3FFF9] truncate">
                          {sub?.name || 'Focused Study'}
                        </span>
                        <span className="text-[10px] text-[#91A69B] font-mono shrink-0">
                          {startTimeStr}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#91A69B] mt-0.5 truncate">
                        {sess.duration} min deep sprint {sess.notes ? `· ${sess.notes}` : ''}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Show top pending tasks as planned slots */}
              {pendingTasks.slice(0, 3).map((t) => {
                const sub = subjects.find((s) => s.id === t.subjectId);
                return (
                  <div
                    key={t.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[#050807]/60 border border-dashed border-[rgba(100,255,202,0.15)] hover:border-[#00D68F]/40 transition-colors group cursor-pointer"
                    onClick={() => handleStartSession(t.subjectId)}
                  >
                    <Play className="w-3.5 h-3.5 text-[#00D68F] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="overflow-hidden w-full">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#DCE7E2] truncate">{t.title}</span>
                        <span className="text-[10px] text-[#91A69B] font-mono shrink-0">
                          {t.estimatedDuration}m
                        </span>
                      </div>
                      <div className="text-[10px] text-[#64FFCA] mt-0.5 truncate font-medium">
                        {sub?.name || 'General Task'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[rgba(100,255,202,0.12)] flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate('planner')}
              className="text-[#91A69B] hover:text-[#F3FFF9] transition-colors cursor-pointer"
            >
              View Full Planner
            </button>
            <NexusButton
              size="sm"
              variant="primary"
              onClick={() => handleStartSession()}
            >
              Start Session
            </NexusButton>
          </div>
        </NexusCard>
      </div>

      {/* 4. UPCOMING DEADLINES & ACTIVE TASKS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Task Checklist */}
        <NexusCard glowColor="emerald" className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#F3FFF9] tracking-tight">Active Academic Tasks</h3>
              <p className="text-xs text-[#91A69B]">Click circle to mark completed</p>
            </div>
            <NexusButton
              size="sm"
              variant="secondary"
              onClick={onOpenTaskModal}
              icon={<Plus className="w-3.5 h-3.5 text-[#64FFCA]" />}
            >
              New Task
            </NexusButton>
          </div>

          <div className="space-y-2.5">
            {tasks.length === 0 ? (
              <div className="py-8 text-center text-[#91A69B] text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-[#2A3E34]" />
                <p>No tasks created yet.</p>
                <button
                  onClick={onOpenTaskModal}
                  className="mt-2 text-[#00D68F] hover:underline font-semibold"
                >
                  Create your first task
                </button>
              </div>
            ) : (
              tasks.slice(0, 5).map((t) => {
                const sub = subjects.find((s) => s.id === t.subjectId);
                const isDone = t.status === 'completed';
                return (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isDone
                        ? 'bg-[#050807]/50 border-white/5 opacity-60'
                        : 'bg-[#0D1713] border-[rgba(100,255,202,0.12)] hover:border-[#00D68F]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden mr-3">
                      <button
                        onClick={() => toggleTask(t.id)}
                        className="text-[#91A69B] hover:text-[#00D68F] transition-colors shrink-0 cursor-pointer"
                        title={isDone ? 'Mark as pending' : 'Mark as completed'}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-[#00D68F]" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>

                      <div className="overflow-hidden">
                        <div
                          className={`text-xs font-semibold truncate ${
                            isDone ? 'line-through text-[#91A69B]' : 'text-[#F3FFF9]'
                          }`}
                        >
                          {t.title}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#91A69B] mt-0.5">
                          <span
                            className="font-medium"
                            style={{ color: sub?.color || '#00D68F' }}
                          >
                            {sub?.name || 'General'}
                          </span>
                          <span>·</span>
                          <span className="font-mono">{t.estimatedDuration}m</span>
                          <span>·</span>
                          <span className="font-mono">Due {t.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          t.priority === 'high'
                            ? 'bg-[#FF647C]/15 text-[#FF647C] border border-[#FF647C]/30'
                            : t.priority === 'medium'
                            ? 'bg-[#FFC857]/15 text-[#FFC857] border border-[#FFC857]/30'
                            : 'bg-white/5 text-[#91A69B] border border-white/10'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </NexusCard>

        {/* Right 1 Col: Upcoming Exam & Assignment Deadlines */}
        <NexusCard glowColor="mint" className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#F3FFF9] tracking-tight">Upcoming Deadlines</h3>
              <span className="text-[11px] text-[#91A69B] font-mono px-2 py-0.5 rounded-full bg-white/5">
                {sortedDeadlines.length} soon
              </span>
            </div>

            <div className="space-y-3">
              {sortedDeadlines.length === 0 ? (
                <div className="py-8 text-center text-[#91A69B] text-xs">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-[#2A3E34]" />
                  <p>No imminent deadlines pending.</p>
                </div>
              ) : (
                sortedDeadlines.map((t) => {
                  const sub = subjects.find((s) => s.id === t.subjectId);
                  const daysLeft = Math.ceil(
                    (new Date(t.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const isUrgent = daysLeft <= 2;
                  return (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl bg-[#050807] border border-[rgba(100,255,202,0.1)] hover:border-[#00D68F]/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-[#F3FFF9] truncate">{t.title}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                            isUrgent
                              ? 'bg-[#FF647C]/15 text-[#FF647C] border border-[#FF647C]/30'
                              : 'bg-[#12221A] text-[#64FFCA] border border-[rgba(100,255,202,0.2)]'
                          }`}
                        >
                          {daysLeft <= 0 ? 'Today' : `${daysLeft}d left`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#91A69B]">
                        <span style={{ color: sub?.color || '#00D68F' }}>
                          {sub?.name || 'General'}
                        </span>
                        <span className="font-mono">Due {t.dueDate}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[rgba(100,255,202,0.12)] flex items-center justify-between text-xs">
            <span className="text-[#91A69B]">Exam Countdown Active</span>
            <button
              onClick={() => onNavigate('subjects')}
              className="text-[#00D68F] hover:text-[#64FFCA] hover:underline font-semibold cursor-pointer transition-colors"
            >
              View All Courses
            </button>
          </div>
        </NexusCard>
      </div>

      {/* 5. QUICK ACTIONS STRIP */}
      <div className="p-4 rounded-2xl bg-[#0D1713] border border-[rgba(100,255,202,0.16)] flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <span className="text-xs font-bold text-[#91A69B] uppercase tracking-wider">
          Quick Actions
        </span>

        <div className="flex flex-wrap items-center gap-2.5">
          <NexusButton
            size="sm"
            variant="secondary"
            onClick={onOpenTaskModal}
            icon={<Plus className="w-3.5 h-3.5 text-[#64FFCA]" />}
          >
            Add Task
          </NexusButton>

          <NexusButton
            size="sm"
            variant="secondary"
            onClick={onOpenSubjectModal}
            icon={<BookOpen className="w-3.5 h-3.5 text-[#00D68F]" />}
          >
            Add Subject
          </NexusButton>

          <NexusButton
            size="sm"
            variant="secondary"
            onClick={() => handleStartSession()}
            icon={<Play className="w-3.5 h-3.5 text-[#64FFCA]" />}
          >
            Start Focus Session
          </NexusButton>

          <NexusButton
            size="sm"
            variant="primary"
            onClick={() => onNavigate('ai-companion')}
            icon={<Sparkles className="w-3.5 h-3.5 text-[#050807]" />}
          >
            Generate Study Plan
          </NexusButton>
        </div>
      </div>
    </div>
  );
};
