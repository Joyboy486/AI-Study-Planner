export interface IUserPreferences {
  weeklyHourGoal: number;
  focusDuration: number; // in minutes (default 25)
  shortBreakDuration: number;
  longBreakDuration: number;
  availableStudyHours: string[]; // e.g., ["morning", "evening"]
  soundEnabled: boolean;
  onboardingCompleted: boolean;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  preferences: IUserPreferences;
  createdAt: string;
}

export interface ISubject {
  id: string;
  userId: string;
  name: string;
  description: string;
  color: string; // hex code
  priority: 'low' | 'medium' | 'high';
  weeklyTarget: number; // hours
  examDate?: string;
  completedHours: number;
  createdAt: string;
}

export interface ITask {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string; // ISO date string
  estimatedDuration: number; // in minutes
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  createdAt: string;
}

export interface IStudySession {
  id: string;
  userId: string;
  subjectId: string;
  taskId?: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  sessionType: 'focus' | 'short_break' | 'long_break';
  completionStatus: 'completed' | 'abandoned';
  notes?: string;
  createdAt: string;
}
