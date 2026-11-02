import { User, Subject, Task, StudySession, AnalyticsData, HealthStatus } from '../types';

const TOKEN_KEY = 'focusflow_jwt_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(name: string, email: string, password: string):Promise<{ token: string; user: User }> {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async loginDemo(): Promise<{ token: string; user: User; isDemo: boolean }> {
    return request('/api/auth/demo', {
      method: 'POST',
    });
  },

  async getMe(): Promise<User> {
    return request('/api/auth/me');
  },

  async updatePreferences(preferences: Partial<User['preferences']>): Promise<{ preferences: User['preferences'] }> {
    return request('/api/auth/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  },

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    return request('/api/subjects');
  },

  async createSubject(subject: Partial<Subject>): Promise<Subject> {
    return request('/api/subjects', {
      method: 'POST',
      body: JSON.stringify(subject),
    });
  },

  async updateSubject(id: string, subject: Partial<Subject>): Promise<Subject> {
    return request(`/api/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subject),
    });
  },

  async deleteSubject(id: string): Promise<{ message: string }> {
    return request(`/api/subjects/${id}`, {
      method: 'DELETE',
    });
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    return request('/api/tasks');
  },

  async createTask(task: Partial<Task>): Promise<Task> {
    return request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    return request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  },

  async deleteTask(id: string): Promise<{ message: string }> {
    return request(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // Sessions
  async getSessions(): Promise<StudySession[]> {
    return request('/api/sessions');
  },

  async createSession(session: Partial<StudySession>): Promise<StudySession> {
    return request('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    return request('/api/analytics');
  },

  // AI Companion
  async askAI(params: {
    action: string;
    prompt?: string;
    subjectId?: string;
    taskId?: string;
    userNotes?: string;
  }): Promise<{ reply: string; source: string; action: string }> {
    return request('/api/ai/companion', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Health
  async getHealth(): Promise<HealthStatus> {
    return request('/api/health');
  },
};
