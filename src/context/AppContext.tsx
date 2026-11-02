import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Subject, Task, StudySession, AnalyticsData, HealthStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface AppContextType {
  subjects: Subject[];
  tasks: Task[];
  sessions: StudySession[];
  analytics: AnalyticsData | null;
  health: HealthStatus | null;
  isLoadingData: boolean;
  activeSubjectId: string | null;
  setActiveSubjectId: (id: string | null) => void;
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
  // Timer shared state
  timerState: {
    isRunning: boolean;
    timeLeft: number;
    mode: 'focus' | 'short_break' | 'long_break';
    initialDuration: number;
  };
  setTimerState: React.Dispatch<React.SetStateAction<{
    isRunning: boolean;
    timeLeft: number;
    mode: 'focus' | 'short_break' | 'long_break';
    initialDuration: number;
  }>>;
  // Actions
  addSubject: (data: Partial<Subject>) => Promise<Subject>;
  updateSubject: (id: string, data: Partial<Subject>) => Promise<Subject>;
  deleteSubject: (id: string) => Promise<void>;
  addTask: (data: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  recordSession: (data: Partial<StudySession>) => Promise<StudySession>;
  refreshData: () => Promise<void>;
  toastMessage: { text: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Global Pomodoro timer state
  const [timerState, setTimerState] = useState<{
    isRunning: boolean;
    timeLeft: number;
    mode: 'focus' | 'short_break' | 'long_break';
    initialDuration: number;
  }>({
    isRunning: false,
    timeLeft: 25 * 60,
    mode: 'focus',
    initialDuration: 25 * 60,
  });

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 3800);
  }, []);

  const refreshData = useCallback(async () => {
    if (!token) return;
    try {
      const [subs, tsks, sess, anlys, hlth] = await Promise.all([
        api.getSubjects().catch(() => []),
        api.getTasks().catch(() => []),
        api.getSessions().catch(() => []),
        api.getAnalytics().catch(() => null),
        api.getHealth().catch(() => null),
      ]);
      setSubjects(subs);
      setTasks(tsks);
      setSessions(sess);
      setAnalytics(anlys);
      setHealth(hlth);
      if (subs.length > 0 && !activeSubjectId) {
        setActiveSubjectId(subs[0].id);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [token, activeSubjectId]);

  useEffect(() => {
    if (token) {
      refreshData();
    } else {
      setSubjects([]);
      setTasks([]);
      setSessions([]);
      setAnalytics(null);
      setIsLoadingData(false);
    }
  }, [token, refreshData]);

  // Handle Focus Room background countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerState.isRunning && timerState.timeLeft > 0) {
      interval = setInterval(() => {
        setTimerState(prev => {
          if (prev.timeLeft <= 1) {
            return { ...prev, timeLeft: 0, isRunning: false };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState.isRunning, timerState.timeLeft]);

  // Subjects CRUD
  const addSubject = async (data: Partial<Subject>) => {
    const newSub = await api.createSubject(data);
    setSubjects(prev => [...prev, newSub]);
    if (!activeSubjectId) setActiveSubjectId(newSub.id);
    showToast(`Created subject "${newSub.name}"`, 'success');
    refreshData();
    return newSub;
  };

  const updateSubject = async (id: string, data: Partial<Subject>) => {
    const updated = await api.updateSubject(id, data);
    setSubjects(prev => prev.map(s => (s.id === id ? updated : s)));
    showToast(`Updated subject "${updated.name}"`, 'info');
    refreshData();
    return updated;
  };

  const deleteSubject = async (id: string) => {
    const sub = subjects.find(s => s.id === id);
    await api.deleteSubject(id);
    setSubjects(prev => prev.filter(s => s.id !== id));
    setTasks(prev => prev.filter(t => t.subjectId !== id));
    if (activeSubjectId === id) {
      const remaining = subjects.filter(s => s.id !== id);
      setActiveSubjectId(remaining[0]?.id || null);
    }
    showToast(`Deleted subject "${sub?.name || ''}"`, 'info');
    refreshData();
  };

  // Tasks CRUD
  const addTask = async (data: Partial<Task>) => {
    const newTask = await api.createTask(data);
    setTasks(prev => [...prev, newTask]);
    showToast(`Added task "${newTask.title}"`, 'success');
    refreshData();
    return newTask;
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    const updated = await api.updateTask(id, data);
    setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
    showToast(`Updated task`, 'info');
    refreshData();
    return updated;
  };

  const deleteTask = async (id: string) => {
    await api.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast(`Task removed`, 'info');
    refreshData();
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    const updated = await api.updateTask(id, { status: nextStatus });
    setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
    showToast(
      nextStatus === 'completed' ? `Completed "${task.title}"!` : `Marked "${task.title}" as pending`,
      nextStatus === 'completed' ? 'success' : 'info'
    );
    refreshData();
  };

  // Sessions
  const recordSession = async (data: Partial<StudySession>) => {
    const newSession = await api.createSession(data);
    setSessions(prev => [newSession, ...prev]);
    showToast(`Logged ${newSession.duration}m study session!`, 'success');
    refreshData();
    return newSession;
  };

  return (
    <AppContext.Provider
      value={{
        subjects,
        tasks,
        sessions,
        analytics,
        health,
        isLoadingData,
        activeSubjectId,
        setActiveSubjectId,
        activeTaskId,
        setActiveTaskId,
        timerState,
        setTimerState,
        addSubject,
        updateSubject,
        deleteSubject,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        recordSession,
        refreshData,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
