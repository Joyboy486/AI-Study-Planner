import type { IUser, ISubject, ITask, IStudySession } from './models/types.ts';
import { UserModel, SubjectModel, TaskModel, StudySessionModel } from './models/mongooseModels.ts';
import { getDBStatus } from './db.ts';

// In-memory fallback stores
const memoryUsers = new Map<string, IUser>();
const memorySubjects = new Map<string, ISubject>();
const memoryTasks = new Map<string, ITask>();
const memorySessions = new Map<string, IStudySession>();

// Initialize demo data for instant out-of-the-box delight
export const DEMO_USER_ID = 'user-demo-101';

export function seedDemoData() {
  if (memoryUsers.has(DEMO_USER_ID)) return;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const demoUser: IUser = {
    id: DEMO_USER_ID,
    name: 'Elena Rostova',
    email: 'elena@focusflow.ai',
    passwordHash: '$2a$10$demoHashedPasswordPlaceHolderForLocalDemo123456',
    preferences: {
      weeklyHourGoal: 24,
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      availableStudyHours: ['morning', 'evening'],
      soundEnabled: true,
      onboardingCompleted: true,
    },
    createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  };
  memoryUsers.set(DEMO_USER_ID, demoUser);

  const subjects: ISubject[] = [
    {
      id: 'sub-ml',
      userId: DEMO_USER_ID,
      name: 'Machine Learning & Neural Nets',
      description: 'Backpropagation, transformers, attention mechanisms, loss optimization.',
      color: '#00D68F', // primary emerald
      priority: 'high',
      weeklyTarget: 8,
      examDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completedHours: 6.5,
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'sub-dist',
      userId: DEMO_USER_ID,
      name: 'Distributed Systems & Consensus',
      description: 'Raft consensus, vector clocks, Paxos, distributed transaction isolation.',
      color: '#64FFCA', // neon mint
      priority: 'high',
      weeklyTarget: 6,
      examDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completedHours: 4.2,
      createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'sub-linalg',
      userId: DEMO_USER_ID,
      name: 'Advanced Linear Algebra',
      description: 'Eigen decomposition, SVD, Hilbert spaces, spectral graph theory.',
      color: '#008F62', // deep emerald
      priority: 'medium',
      weeklyTarget: 5,
      examDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completedHours: 3.5,
      createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'sub-neuro',
      userId: DEMO_USER_ID,
      name: 'Computational Neuroscience',
      description: 'Hodgkin-Huxley model, spiking neural circuits, synaptic plasticity.',
      color: '#57F5C4', // seafoam mint
      priority: 'medium',
      weeklyTarget: 5,
      examDate: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completedHours: 3.0,
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  for (const s of subjects) {
    memorySubjects.set(s.id, s);
  }

  const tasks: ITask[] = [
    {
      id: 'task-1',
      userId: DEMO_USER_ID,
      subjectId: 'sub-ml',
      title: 'Implement Multi-Head Self-Attention from Scratch',
      description: 'Code the scaled dot-product attention matrix and verify mask broadcasting.',
      priority: 'high',
      dueDate: todayStr,
      estimatedDuration: 60,
      status: 'in_progress',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task-2',
      userId: DEMO_USER_ID,
      subjectId: 'sub-dist',
      title: 'Analyze Raft Election Timeout Edge Cases',
      description: 'Prove safety under network partition with split votes and randomized timers.',
      priority: 'high',
      dueDate: tomorrow,
      estimatedDuration: 45,
      status: 'pending',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task-3',
      userId: DEMO_USER_ID,
      subjectId: 'sub-linalg',
      title: 'Derive Singular Value Decomposition Matrix Bounds',
      description: 'Solve problem set 4 exercises 3 through 7 on low-rank approximations.',
      priority: 'medium',
      dueDate: in3Days,
      estimatedDuration: 50,
      status: 'pending',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task-4',
      userId: DEMO_USER_ID,
      subjectId: 'sub-ml',
      title: 'Derive Cross-Entropy Loss Gradients with Softmax',
      description: 'Mathematical proof and chain rule verification for backward pass.',
      priority: 'medium',
      dueDate: in5Days,
      estimatedDuration: 40,
      status: 'completed',
      completedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task-5',
      userId: DEMO_USER_ID,
      subjectId: 'sub-neuro',
      title: 'Spike-Timing-Dependent Plasticity Simulation',
      description: 'Write Python script to test Hebbian learning rules on 200 integrate-and-fire neurons.',
      priority: 'low',
      dueDate: in5Days,
      estimatedDuration: 45,
      status: 'pending',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  for (const t of tasks) {
    memoryTasks.set(t.id, t);
  }

  // Pre-seed past 6 days of completed study sessions for rich charts & streak
  for (let i = 6; i >= 0; i--) {
    const sessionDay = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const sub = subjects[i % subjects.length];
    const duration = [50, 75, 60, 90, 80, 50, 65][i % 7];
    
    const sessId = `sess-${i}`;
    const start = new Date(sessionDay.setHours(10, 0, 0, 0)).toISOString();
    const end = new Date(sessionDay.setHours(10, duration, 0, 0)).toISOString();

    memorySessions.set(sessId, {
      id: sessId,
      userId: DEMO_USER_ID,
      subjectId: sub.id,
      startTime: start,
      endTime: end,
      duration,
      sessionType: 'focus',
      completionStatus: 'completed',
      notes: `Deep focus sprint on ${sub.name}.`,
      createdAt: start,
    });
  }
}

// Initialize seed data at startup
seedDemoData();

export const dataStore = {
  // USERS
  async findUserByEmail(email: string): Promise<IUser | null> {
    const { isConnected } = getDBStatus();
    if (isConnected) {
      const doc = await UserModel.findOne({ email: email.toLowerCase() });
      if (!doc) return null;
      return {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        passwordHash: doc.passwordHash,
        preferences: doc.preferences?.toObject ? doc.preferences.toObject() : doc.preferences,
        createdAt: doc.createdAt.toISOString(),
      };
    }
    const user = Array.from(memoryUsers.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  },

  async findUserById(id: string): Promise<IUser | null> {
    const { isConnected } = getDBStatus();
    if (isConnected) {
      const doc = await UserModel.findById(id);
      if (!doc) return null;
      return {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        passwordHash: doc.passwordHash,
        preferences: doc.preferences?.toObject ? doc.preferences.toObject() : doc.preferences,
        createdAt: doc.createdAt.toISOString(),
      };
    }
    return memoryUsers.get(id) || null;
  },

  async createUser(data: Omit<IUser, 'id' | 'createdAt'>): Promise<IUser> {
    const { isConnected } = getDBStatus();
    const createdAt = new Date().toISOString();
    if (isConnected) {
      const doc = await UserModel.create({
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        preferences: data.preferences,
      });
      return {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        passwordHash: doc.passwordHash,
        preferences: doc.preferences,
        createdAt: doc.createdAt.toISOString(),
      };
    }
    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const user: IUser = { id, ...data, createdAt };
    memoryUsers.set(id, user);
    return user;
  },

  async updateUserPreferences(userId: string, prefs: Partial<IUser['preferences']>): Promise<IUser | null> {
    const { isConnected } = getDBStatus();
    if (isConnected) {
      const doc = await UserModel.findById(userId);
      if (!doc) return null;
      doc.preferences = { ...doc.preferences, ...prefs };
      await doc.save();
      return {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        passwordHash: doc.passwordHash,
        preferences: doc.preferences,
        createdAt: doc.createdAt.toISOString(),
      };
    }
    const user = memoryUsers.get(userId);
    if (!user) return null;
    user.preferences = { ...user.preferences, ...prefs };
    memoryUsers.set(userId, user);
    return user;
  },

  // SUBJECTS
  async getSubjects(userId: string): Promise<ISubject[]> {
    const { isConnected } = getDBStatus();
    if (isConnected) {
      const docs = await SubjectModel.find({ userId }).sort({ createdAt: 1 });
      return docs.map(d => ({
        id: d._id.toString(),
        userId: d.userId,
        name: d.name,
        description: d.description,
        color: d.color,
        priority: d.priority,
        weeklyTarget: d.weeklyTarget,
        examDate: d.examDate,
        completedHours: d.completedHours,
        createdAt: d.createdAt.toISOString(),
      }));
    }
    return Array.from(memorySubjects.values()).filter(s => s.userId === userId);
  },

  async createSubject(userId: string, data: Partial<ISubject>): Promise<ISubject> {
    const { isConnected } = getDBStatus();
    const createdAt = new Date().toISOString();
    if (isConnected) {
      const doc = await SubjectModel.create({
        userId,
        name: data.name,
        description: data.description || '',
        color: data.color || '#A78BFA',
        priority: data.priority || 'medium',
        weeklyTarget: Number(data.weeklyTarget) || 5,
        examDate: data.examDate,
        completedHours: 0,
      });
      return {
        id: doc._id.toString(),
        userId: doc.userId,
        name: doc.name,
        description: doc.description,
        color: doc.color,
        priority: doc.priority,
        weeklyTarget: doc.weeklyTarget,
        examDate: doc.examDate,
        completedHours: doc.completedHours,
        createdAt: doc.createdAt.toISOString(),
      };
    }
    const id = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const subject: ISubject = {
      id,
      userId,
      name: data.name || 'New Subject',
      description: data.description || '',
      color: data.color || '#A78BFA',
      priority: data.priority || 'medium',
      weeklyTarget: Number(data.weeklyTarget) || 5,
      examDate: data.examDate,
      completedHours: 0,
      createdAt,
    };
    memorySubjects.set(id, subject);
    return subject;
  },

  async updateSubject(userId: string, id: string, data: Partial<ISubject>): Promise<ISubject | null> {
    const { isConnected } = getDBStatus();
    if (isConnected) {
      const doc = await SubjectModel.findOneAndUpdate({ _id: id, userId }, data, { new: true });
      if (!doc) return null;
      return {
        id: doc._id.toString(),
        userId: doc.userId,
        name: doc.name,
        description: doc.description,
        color: doc.color,
        priority: doc.priority,
        weeklyTarget: doc.weeklyTarget,
        examDate: doc.examDate,
        completedHours: doc.completedHours,
        createdAt: doc.createdAt.toISOString(),
      };
    }
    const sub = memorySubjects.get(id);
    if (!sub || sub.userId !== userId) return null;
    const updated = { ...sub, ...data };
    memorySubjects.set(id, updated);
    return updated;
  },

  async deleteSubject(userId: string, id: string): Promise<boolean> {
    const { isConnected } = getDBStatus();
    if (isConnected) {
      const res = await SubjectModel.deleteOne({ _id: id, userId });
      await TaskModel.deleteMany({ subjectId: id, userId });
      return res.deletedCount > 0;
    }
    const sub = memorySubjects.get(id);
    if (!sub || sub.userId !== userId) return false;
    memorySubjects.delete(id);
    // clean up tasks for this subject
    for (const [tId, t] of memoryTasks.entries()) {
      if (t.subjectId === id && t.userId === userId) {
        memoryTasks.delete(tId);
      }
    }
    return true;
  },

  // TASKS
  async getTasks(userId: string): Promise<ITask[]> {
    const { isConnected } = getDBStatus();
    if (isConnected) {
      const docs = await TaskModel.find({ userId }).sort({ dueDate: 1 });
      return docs.map(d => ({
        id: d._id.toString(),
        userId: d.userId,
        subjectId: d.subjectId,
        title: d.title,
        description: d.description,
        priority: d.priority,
        dueDate: d.dueDate,
        estimatedDuration: d.estimatedDuration,
        status: d.status,
        completedAt: d.completedAt,
        createdAt: d.createdAt.toISOString(),
      }));
    }
    return Array.from(memoryTasks.values()).filter(t => t.userId === userId);
  },

  async createTask(userId: string, data: Partial<ITask>): Promise<ITask> {
    const { isConnected } = getDBStatus();
    const createdAt = new Date().toISOString();
    if (isConnected) {
      const doc = await TaskModel.create({
        userId,
        subjectId: data.subjectId,
        title: data.title,
        description: data.description || '',
        priority: data.priority || 'medium',
        dueDate: data.dueDate || new Date().toISOString().split('T')[0],
        estimatedDuration: Number(data.estimatedDuration) || 30,
        status: data.status || 'pending',
      });
      return {
        id: doc._id.toString(),
        userId: doc.userId,
        subjectId: doc.subjectId,
        title: doc.title,
        description: doc.description,
        priority: doc.priority,
        dueDate: doc.dueDate,
        estimatedDuration: doc.estimatedDuration,
        status: doc.status,
        createdAt: doc.createdAt.toISOString(),
      };
    }
    const id = `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const task: ITask = {
      id,
      userId,
      subjectId: data.subjectId || '',
      title: data.title || 'Untitled Task',
      description: data.description || '',
      priority: data.priority || 'medium',
      dueDate: data.dueDate || new Date().toISOString().split('T')[0],
      estimatedDuration: Number(data.estimatedDuration) || 30,
      status: data.status || 'pending',
      createdAt,
    };
    memoryTasks.set(id, task);
    return task;
  },

  async updateTask(userId: string, id: string, data: Partial<ITask>): Promise<ITask | null> {
    const { isConnected } = getDBStatus();
    if (isConnected) {
      const doc = await TaskModel.findOneAndUpdate({ _id: id, userId }, data, { new: true });
      if (!doc) return null;
      return {
        id: doc._id.toString(),
        userId: doc.userId,
        subjectId: doc.subjectId,
        title: doc.title,
        description: doc.description,
        priority: doc.priority,
        dueDate: doc.dueDate,
        estimatedDuration: doc.estimatedDuration,
        status: doc.status,
        completedAt: doc.completedAt,
        createdAt: doc.createdAt.toISOString(),
      };
    }
    const task = memoryTasks.get(id);
    if (!task || task.userId !== userId) return null;
    const updated = { ...task, ...data };
    if (data.status === 'completed' && !updated.completedAt) {
      updated.completedAt = new Date().toISOString();
    }
    memoryTasks.set(id, updated);
    return updated;
  },

  async deleteTask(userId: string, id: string): Promise<boolean> {
    const { isConnected } = getDBStatus();
    if (isConnected) {
      const res = await TaskModel.deleteOne({ _id: id, userId });
      return res.deletedCount > 0;
    }
    const task = memoryTasks.get(id);
    if (!task || task.userId !== userId) return false;
    memoryTasks.delete(id);
    return true;
  },

  // STUDY SESSIONS
  async getSessions(userId: string): Promise<IStudySession[]> {
    const { isConnected } = getDBStatus();
    if (isConnected) {
      const docs = await StudySessionModel.find({ userId }).sort({ startTime: -1 });
      return docs.map(d => ({
        id: d._id.toString(),
        userId: d.userId,
        subjectId: d.subjectId,
        taskId: d.taskId,
        startTime: d.startTime,
        endTime: d.endTime,
        duration: d.duration,
        sessionType: d.sessionType,
        completionStatus: d.completionStatus,
        notes: d.notes,
        createdAt: d.createdAt.toISOString(),
      }));
    }
    return Array.from(memorySessions.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  },

  async createSession(userId: string, data: Partial<IStudySession>): Promise<IStudySession> {
    const { isConnected } = getDBStatus();
    const createdAt = new Date().toISOString();
    const duration = Math.max(1, Math.round(Number(data.duration) || 25));
    
    // Add completed hours to subject
    if (data.subjectId && duration > 0 && data.completionStatus === 'completed') {
      const additionalHours = Number((duration / 60).toFixed(2));
      if (isConnected) {
        await SubjectModel.updateOne(
          { _id: data.subjectId, userId },
          { $inc: { completedHours: additionalHours } }
        );
      } else {
        const sub = memorySubjects.get(data.subjectId);
        if (sub && sub.userId === userId) {
          sub.completedHours = Number(((sub.completedHours || 0) + additionalHours).toFixed(2));
          memorySubjects.set(data.subjectId, sub);
        }
      }
    }

    if (isConnected) {
      const doc = await StudySessionModel.create({
        userId,
        subjectId: data.subjectId,
        taskId: data.taskId,
        startTime: data.startTime || new Date(Date.now() - duration * 60000).toISOString(),
        endTime: data.endTime || new Date().toISOString(),
        duration,
        sessionType: data.sessionType || 'focus',
        completionStatus: data.completionStatus || 'completed',
        notes: data.notes || '',
      });
      return {
        id: doc._id.toString(),
        userId: doc.userId,
        subjectId: doc.subjectId,
        taskId: doc.taskId,
        startTime: doc.startTime,
        endTime: doc.endTime,
        duration: doc.duration,
        sessionType: doc.sessionType,
        completionStatus: doc.completionStatus,
        notes: doc.notes,
        createdAt: doc.createdAt.toISOString(),
      };
    }

    const id = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const session: IStudySession = {
      id,
      userId,
      subjectId: data.subjectId || '',
      taskId: data.taskId,
      startTime: data.startTime || new Date(Date.now() - duration * 60000).toISOString(),
      endTime: data.endTime || new Date().toISOString(),
      duration,
      sessionType: data.sessionType || 'focus',
      completionStatus: data.completionStatus || 'completed',
      notes: data.notes || '',
      createdAt,
    };
    memorySessions.set(id, session);
    return session;
  },
};
