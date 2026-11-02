export interface UserPreferences {
  weeklyHourGoal: number;
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  availableStudyHours: string[];
  soundEnabled: boolean;
  onboardingCompleted: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
  createdAt: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  description: string;
  color: string;
  priority: 'low' | 'medium' | 'high';
  weeklyTarget: number;
  examDate?: string;
  completedHours: number;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  estimatedDuration: number;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  createdAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  subjectId: string;
  taskId?: string;
  startTime: string;
  endTime: string;
  duration: number;
  sessionType: 'focus' | 'short_break' | 'long_break';
  completionStatus: 'completed' | 'abandoned';
  notes?: string;
  createdAt: string;
}

export interface AnalyticsData {
  todayHours: number;
  todayMinutes: number;
  currentWeekHours: number;
  previousWeekHours: number;
  weeklyGoal: number;
  goalProgressPct: number;
  currentStreak: number;
  bestStreak: number;
  totalFocusSessions: number;
  tasks: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  dailyData: {
    date: string;
    day: string;
    minutes: number;
    hours: number;
  }[];
  subjectBreakdown: {
    id: string;
    name: string;
    color: string;
    hours: number;
    weeklyTarget: number;
    percentage: number;
  }[];
  comparisonInsight: string | null;
  mostProductiveDay: string;
}

export interface HealthStatus {
  status: string;
  service: string;
  timestamp: string;
  database: {
    isConnected: boolean;
    mode: 'mongodb' | 'embedded';
    error: string | null;
  };
  geminiConfigured: boolean;
}
