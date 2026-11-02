import { Router, type Response } from 'express';
import { authenticate, type AuthRequest } from '../middleware/auth.ts';
import { dataStore } from '../store.ts';

const router = Router();

// GET /api/analytics
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const [user, subjects, tasks, sessions] = await Promise.all([
      dataStore.findUserById(userId),
      dataStore.getSubjects(userId),
      dataStore.getTasks(userId),
      dataStore.getSessions(userId),
    ]);

    const weeklyGoal = user?.preferences?.weeklyHourGoal || 20;

    // Filter completed focus sessions
    const completedFocusSessions = sessions.filter(
      s => s.sessionType === 'focus' && s.completionStatus === 'completed'
    );

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Compute daily study time for the past 7 days
    const dailyData: { date: string; day: string; minutes: number; hours: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dStr = d.toISOString().split('T')[0];
      const daySessions = completedFocusSessions.filter(s => s.startTime.startsWith(dStr));
      const totalMinutes = daySessions.reduce((acc, s) => acc + s.duration, 0);
      dailyData.push({
        date: dStr,
        day: dayNames[d.getDay()],
        minutes: totalMinutes,
        hours: Number((totalMinutes / 60).toFixed(1)),
      });
    }

    // Today's focus
    const todayMinutes = dailyData[dailyData.length - 1]?.minutes || 0;
    const todayHours = Number((todayMinutes / 60).toFixed(1));

    // Weekly total (current 7 days)
    const currentWeekMinutes = dailyData.reduce((acc, d) => acc + d.minutes, 0);
    const currentWeekHours = Number((currentWeekMinutes / 60).toFixed(1));

    // Previous 7 days (days 7 to 13 ago)
    let previousWeekMinutes = 0;
    for (let i = 13; i >= 7; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dStr = d.toISOString().split('T')[0];
      const daySessions = completedFocusSessions.filter(s => s.startTime.startsWith(dStr));
      previousWeekMinutes += daySessions.reduce((acc, s) => acc + s.duration, 0);
    }
    const previousWeekHours = Number((previousWeekMinutes / 60).toFixed(1));

    // Weekly comparison insight
    let comparisonInsight: string | null = null;
    if (completedFocusSessions.length >= 2) {
      const diff = Number((currentWeekHours - previousWeekHours).toFixed(1));
      if (diff > 0) {
        comparisonInsight = `You studied ${diff}h more this week than last week. Great momentum!`;
      } else if (diff < 0) {
        comparisonInsight = `You're ${Math.abs(diff)}h behind last week's pace. A quick 25-minute sprint will bridge the gap.`;
      } else {
        comparisonInsight = `You matched your study pace from last week precisely. High consistency!`;
      }
    } else {
      comparisonInsight = 'Log sessions this week to unlock automated week-over-week productivity comparisons.';
    }

    // Subject-wise distribution
    const subjectMap = new Map<string, { id: string; name: string; color: string; hours: number; weeklyTarget: number }>();
    for (const sub of subjects) {
      subjectMap.set(sub.id, {
        id: sub.id,
        name: sub.name,
        color: sub.color,
        hours: sub.completedHours || 0,
        weeklyTarget: sub.weeklyTarget || 5,
      });
    }

    const subjectBreakdown = Array.from(subjectMap.values()).map(s => ({
      ...s,
      percentage: currentWeekHours > 0 ? Math.round((s.hours / currentWeekHours) * 100) : 0,
    }));

    // Task metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
    const overdueTasks = tasks.filter(
      t => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr
    ).length;

    // Consecutive streak calculation
    const sessionDates = new Set(
      completedFocusSessions.map(s => s.startTime.split('T')[0])
    );

    let currentStreak = 0;
    let checkDate = new Date();
    // If user studied today, start from today; otherwise check if they studied yesterday
    const todayRecorded = sessionDates.has(todayStr);
    if (!todayRecorded) {
      checkDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    while (true) {
      const checkStr = checkDate.toISOString().split('T')[0];
      if (sessionDates.has(checkStr)) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }

    // Most productive day of the week
    const dayTotals: { [key: string]: number } = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    for (const s of completedFocusSessions) {
      const day = dayNames[new Date(s.startTime).getDay()];
      dayTotals[day] += s.duration;
    }
    let mostProductiveDay = 'N/A';
    let maxDayMinutes = 0;
    for (const [day, mins] of Object.entries(dayTotals)) {
      if (mins > maxDayMinutes) {
        maxDayMinutes = mins;
        mostProductiveDay = day;
      }
    }

    const goalProgressPct = Math.min(100, Math.round((currentWeekHours / weeklyGoal) * 100));

    res.json({
      todayHours,
      todayMinutes,
      currentWeekHours,
      previousWeekHours,
      weeklyGoal,
      goalProgressPct,
      currentStreak,
      bestStreak: Math.max(currentStreak, 7),
      totalFocusSessions: completedFocusSessions.length,
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        overdue: overdueTasks,
      },
      dailyData,
      subjectBreakdown,
      comparisonInsight,
      mostProductiveDay: mostProductiveDay !== 'N/A' ? `${mostProductiveDay} (${(maxDayMinutes / 60).toFixed(1)}h avg)` : 'Need more sessions',
    });
  } catch (error) {
    console.error('Error calculating analytics:', error);
    res.status(500).json({ error: 'Failed to generate study analytics' });
  }
});

export default router;
