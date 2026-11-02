import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { NexusCard } from '../components/ui/NexusCard';
import {
  BarChart3,
  Flame,
  Clock,
  Target,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Sparkles,
  PieChart as PieIcon,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const Analytics: React.FC = () => {
  const { user, isDemo } = useAuth();
  const { analytics, subjects, tasks, sessions } = useApp();

  const weeklyGoal = user?.preferences?.weeklyHourGoal || 20;
  const currentWeekHours = analytics?.currentWeekHours ?? 0;
  const previousWeekHours = analytics?.previousWeekHours ?? 0;
  const goalProgressPct = analytics?.goalProgressPct ?? Math.min(100, Math.round((currentWeekHours / weeklyGoal) * 100));

  const dailyData = analytics?.dailyData || [];
  const subjectBreakdown = analytics?.subjectBreakdown || [];

  // Cyber Emerald Donut chart colors
  const defaultColors = ['#00D68F', '#64FFCA', '#008F62', '#57F5C4', '#2EE09E', '#10B981'];

  const pieData = subjectBreakdown.length > 0
    ? subjectBreakdown.map((s, idx) => ({
        name: s.name,
        value: s.hours,
        color: s.color || defaultColors[idx % defaultColors.length],
      }))
    : [{ name: 'Deep Work', value: currentWeekHours || 1, color: '#00D68F' }];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <NexusCard glowColor="rgba(0, 214, 143, 0.2)" className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight text-[#F3FFF9]">Progress Analytics</h2>
              {isDemo && (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                  Demo Student Analytics Loaded
                </span>
              )}
            </div>
            <p className="text-xs text-[#91A69B] mt-0.5">
              Empirical telemetry on focus endurance, course allocations, and streak health.
            </p>
          </div>

          {/* Narrative Insight */}
          {analytics?.comparisonInsight && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#00D68F]/10 border border-[#00D68F]/30 text-xs text-[#64FFCA] shadow-sm">
              <TrendingUp className="w-4 h-4 text-[#00D68F] shrink-0" />
              <span className="font-medium">{analytics.comparisonInsight}</span>
            </div>
          )}
        </div>
      </NexusCard>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Weekly Hours */}
        <NexusCard glowColor="rgba(0, 214, 143, 0.25)" className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#91A69B] mb-2 font-medium">
            <span>Weekly Focus Time</span>
            <Clock className="w-4 h-4 text-[#00D68F]" />
          </div>
          <div className="text-3xl font-extrabold text-[#F3FFF9] font-mono tabular-nums tracking-tight">
            {currentWeekHours}h
          </div>
          <div className="text-[11px] text-[#91A69B] mt-2 flex items-center justify-between">
            <span>Goal: {weeklyGoal}h</span>
            <span className="text-[#64FFCA] font-mono font-medium">
              {currentWeekHours >= previousWeekHours ? `+${(currentWeekHours - previousWeekHours).toFixed(1)}h vs last wk` : `${(currentWeekHours - previousWeekHours).toFixed(1)}h vs last wk`}
            </span>
          </div>
        </NexusCard>

        {/* Stat 2: Goal Completion */}
        <NexusCard glowColor="rgba(100, 255, 202, 0.25)" className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#91A69B] mb-2 font-medium">
            <span>Weekly Goal Progress</span>
            <Target className="w-4 h-4 text-[#64FFCA]" />
          </div>
          <div className="text-3xl font-extrabold text-[#F3FFF9] font-mono tabular-nums tracking-tight">
            {goalProgressPct}%
          </div>
          {/* Mini progress bar */}
          <div className="w-full h-1.5 rounded-full bg-[#050807] overflow-hidden mt-3 border border-[rgba(100,255,202,0.1)]">
            <div
              className="h-full bg-gradient-to-r from-[#008F62] via-[#00D68F] to-[#64FFCA] rounded-full transition-all duration-500 shadow-[0_0_8px_#00D68F]"
              style={{ width: `${goalProgressPct}%` }}
            />
          </div>
        </NexusCard>

        {/* Stat 3: Consecutive Streak */}
        <NexusCard glowColor="rgba(255, 200, 87, 0.25)" className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#91A69B] mb-2 font-medium">
            <span>Focus Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-[#F3FFF9] font-mono tabular-nums tracking-tight">
            {analytics?.currentStreak ?? 7} <span className="text-base text-amber-400 font-normal">days</span>
          </div>
          <div className="text-[11px] text-[#91A69B] mt-2 flex items-center justify-between">
            <span>All-time best: {analytics?.bestStreak ?? 7}d</span>
            <span className="text-[#64FFCA] font-medium">On Track</span>
          </div>
        </NexusCard>

        {/* Stat 4: Task Completion Ratio */}
        <NexusCard glowColor="rgba(0, 214, 143, 0.25)" className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#91A69B] mb-2 font-medium">
            <span>Tasks Completed</span>
            <CheckCircle2 className="w-4 h-4 text-[#00D68F]" />
          </div>
          <div className="text-3xl font-extrabold text-[#F3FFF9] font-mono tabular-nums tracking-tight">
            {analytics?.tasks.completed ?? 0}
            <span className="text-base text-[#91A69B] font-normal"> / {analytics?.tasks.total ?? 0}</span>
          </div>
          <div className="text-[11px] text-[#91A69B] mt-2 flex items-center justify-between">
            <span>Overdue: {analytics?.tasks.overdue ?? 0}</span>
            <span className="text-[#64FFCA] font-medium">
              {analytics?.tasks.total ? Math.round((analytics.tasks.completed / analytics.tasks.total) * 100) : 0}% Done
            </span>
          </div>
        </NexusCard>
      </div>

      {/* Main Charts: Area Daily Trend + Donut Subject Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Daily Study Trend (Area Chart) */}
        <NexusCard glowColor="rgba(0, 214, 143, 0.2)" className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#F3FFF9] tracking-tight">Daily Study Hours Trend</h3>
              <p className="text-xs text-[#91A69B]">Total hours spent in deep flow per day</p>
            </div>
            <div className="text-xs font-mono text-[#91A69B]">
              Peak: <span className="text-[#64FFCA] font-bold">{analytics?.mostProductiveDay ?? 'Thu'}</span>
            </div>
          </div>

          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D68F" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#64FFCA" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  stroke="#263830"
                  tick={{ fill: '#91A69B', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#12221A' }}
                />
                <YAxis
                  stroke="#263830"
                  tick={{ fill: '#91A69B', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}h`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-xl bg-[#0D1713] border border-[#00D68F]/30 text-xs shadow-2xl">
                          <div className="font-semibold text-[#F3FFF9]">{d.day} ({d.date})</div>
                          <div className="text-[#64FFCA] font-mono tabular-nums font-bold">
                            {d.hours} hours ({d.minutes} mins)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#00D68F"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorHours)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-[rgba(100,255,202,0.12)] flex items-center justify-between text-xs text-[#91A69B]">
            <span>Telemetry calculated from validated sessions</span>
            <span className="text-[#F3FFF9] font-mono">{analytics?.totalFocusSessions ?? 0} sprints recorded</span>
          </div>
        </NexusCard>

        {/* Right 1 Col: Course Subject Distribution Donut */}
        <NexusCard glowColor="rgba(0, 214, 143, 0.2)" className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-[#F3FFF9] tracking-tight">Subject Distribution</h3>
              <PieIcon className="w-4 h-4 text-[#00D68F]" />
            </div>
            <p className="text-xs text-[#91A69B] mb-4">Study time allocated per subject</p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-2 rounded-lg bg-[#0D1713] border border-[rgba(100,255,202,0.2)] text-xs shadow-xl">
                            <span className="font-semibold text-[#F3FFF9]">{data.name}:</span>{' '}
                            <span className="font-mono text-[#64FFCA] font-bold">{data.value}h</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Legend */}
          <div className="space-y-1.5 mt-2 max-h-32 overflow-y-auto pr-1">
            {subjectBreakdown.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 overflow-hidden mr-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-[#DCE7E2] truncate">{s.name}</span>
                </div>
                <span className="text-[#F3FFF9] font-mono tabular-nums shrink-0 font-medium">
                  {s.hours}h ({s.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </NexusCard>
      </div>
    </div>
  );
};
