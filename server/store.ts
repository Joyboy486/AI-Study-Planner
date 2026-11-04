import type { IUser, ISubject, ITask, IStudySession } from './models/types.ts';
import {
  UserModel,
  SubjectModel,
  TaskModel,
  StudySessionModel,
} from './models/mongooseModels.ts';
import { getDBStatus } from './db.ts';

// In-memory fallback stores
const memoryUsers = new Map<string, IUser>();
const memorySubjects = new Map<string, ISubject>();
const memoryTasks = new Map<string, ITask>();
const memorySessions = new Map<string, IStudySession>();

export const DEMO_USER_ID = 'user-demo-101';

// Demo data stays in memory.
// Registered users use MongoDB.
function shouldUseMemoryStore(userId?: string): boolean {
  return !getDBStatus().isConnected || userId === DEMO_USER_ID;
}

function isMongoObjectId(value: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(value);
}

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
      color: '#00D68F',
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
      color: '#64FFCA',
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
      color: '#008F62',
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
      color: '#57F5C4',
      priority: 'medium',
      weeklyTarget: 5,
      examDate: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completedHours: 3.0,
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  for (const subject of subjects) {
    memorySubjects.set(subject.id, subject);
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

  for (const task of tasks) {
    memoryTasks.set(task.id, task);
  }

  // Seed past study sessions
  for (let i = 6; i >= 0; i--) {
    const sessionDay = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const subject = subjects[i % subjects.length];
    const duration = [50, 75, 60, 90, 80, 50, 65][i % 7];

    const sessionId = `sess-${i}`;
    const start = new Date(sessionDay.setHours(10, 0, 0, 0)).toISOString();
    const end = new Date(sessionDay.setHours(10, duration, 0, 0)).toISOString();

    memorySessions.set(sessionId, {
      id: sessionId,
      userId: DEMO_USER_ID,
      subjectId: subject.id,
      startTime: start,
      endTime: end,
      duration,
      sessionType: 'focus',
      completionStatus: 'completed',
      notes: `Deep focus sprint on ${subject.name}.`,
      createdAt: start,
    });
  }
}

// Initialize demo data
seedDemoData();

export const dataStore = {
  // USERS
  async findUserByEmail(email: string): Promise<IUser | null> {
    const normalizedEmail = email.trim().toLowerCase();

    const memoryUser = Array.from(memoryUsers.values()).find(
      user => user.email.toLowerCase() === normalizedEmail,
    );

    if (memoryUser) return memoryUser;

    const { isConnected } = getDBStatus();

    if (isConnected) {
      const doc = await UserModel.findOne({ email: normalizedEmail });
      if (!doc) return null;

      return {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        passwordHash: doc.passwordHash,
        preferences: doc.preferences?.toObject
          ? doc.preferences.toObject()
          : doc.preferences,
        createdAt: doc.createdAt.toISOString(),
      };
    }

    return null;
  },

  async findUserById(id: string): Promise<IUser | null> {
    const { isConnected } = getDBStatus();

    if (isConnected && isMongoObjectId(id)) {
      const doc = await UserModel.findById(id);
      if (!doc) return null;

      return {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        passwordHash: doc.passwordHash,
        preferences: doc.preferences?.toObject
          ? doc.preferences.toObject()
          : doc.preferences,
        createdAt: doc.createdAt.toISOString(),
      };
    }

    return memoryUsers.get(id) || null;
  },
    async createUser(data: Omit<IUser, 'id' | 'createdAt'>): Promise<IUser> {
    const createdAt = new Date().toISOString();

    if (getDBStatus().isConnected) {
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

  async updateUserPreferences(
    userId: string,
    prefs: Partial<IUser['preferences']>
  ): Promise<IUser | null> {
    if (shouldUseMemoryStore(userId)) {
      const user = memoryUsers.get(userId);
      if (!user) return null;

      user.preferences = { ...user.preferences, ...prefs };
      memoryUsers.set(userId, user);
      return user;
    }

    if (!isMongoObjectId(userId)) return null;

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
  },

  // SUBJECTS
  async getSubjects(userId: string): Promise<ISubject[]> {
    if (shouldUseMemoryStore(userId)) {
      return Array.from(memorySubjects.values()).filter(
        subject => subject.userId === userId
      );
    }

    const docs = await SubjectModel.find({ userId }).sort({ createdAt: 1 });

    return docs.map(doc => ({
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
    }));
  },

  async createSubject(
    userId: string,
    data: Partial<ISubject>
  ): Promise<ISubject> {
    const createdAt = new Date().toISOString();

    if (!shouldUseMemoryStore(userId)) {
      const doc = await SubjectModel.create({
        userId,
        name: data.name || 'New Subject',
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

  async updateSubject(
    userId: string,
    id: string,
    data: Partial<ISubject>
  ): Promise<ISubject | null> {
    if (shouldUseMemoryStore(userId)) {
      const subject = memorySubjects.get(id);
      if (!subject || subject.userId !== userId) return null;

      const updated = { ...subject, ...data };
      memorySubjects.set(id, updated);
      return updated;
    }

    if (!isMongoObjectId(id)) return null;

    const doc = await SubjectModel.findOneAndUpdate(
      { _id: id, userId },
      data,
      { new: true }
    );

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
  },

  async deleteSubject(userId: string, id: string): Promise<boolean> {
    if (shouldUseMemoryStore(userId)) {
      const subject = memorySubjects.get(id);
      if (!subject || subject.userId !== userId) return false;

      memorySubjects.delete(id);

      for (const [taskId, task] of memoryTasks.entries()) {
        if (task.subjectId === id && task.userId === userId) {
          memoryTasks.delete(taskId);
        }
      }

      return true;
    }

    if (!isMongoObjectId(id)) return false;

    const result = await SubjectModel.deleteOne({ _id: id, userId });
    await TaskModel.deleteMany({ subjectId: id, userId });

    return result.deletedCount > 0;
  },

  // TASKS
  async getTasks(userId: string): Promise<ITask[]> {
    if (shouldUseMemoryStore(userId)) {
      return Array.from(memoryTasks.values()).filter(
        task => task.userId === userId
      );
    }

    const docs = await TaskModel.find({ userId }).sort({ dueDate: 1 });

    return docs.map(doc => ({
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
    }));
  },

  async createTask(
    userId: string,
    data: Partial<ITask>
  ): Promise<ITask> {
    const createdAt = new Date().toISOString();

    if (!shouldUseMemoryStore(userId)) {
      const doc = await TaskModel.create({
        userId,
        subjectId: data.subjectId,
        title: data.title || 'Untitled Task',
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

  async updateTask(
    userId: string,
    id: string,
    data: Partial<ITask>
  ): Promise<ITask | null> {
    if (shouldUseMemoryStore(userId)) {
      const task = memoryTasks.get(id);
      if (!task || task.userId !== userId) return null;

      const updated = { ...task, ...data };

      if (data.status === 'completed' && !updated.completedAt) {
        updated.completedAt = new Date().toISOString();
      }

      memoryTasks.set(id, updated);
      return updated;
    }

    if (!isMongoObjectId(id)) return null;

    const doc = await TaskModel.findOneAndUpdate(
      { _id: id, userId },
      data,
      { new: true }
    );

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
  },

  async deleteTask(userId: string, id: string): Promise<boolean> {
    if (shouldUseMemoryStore(userId)) {
      const task = memoryTasks.get(id);
      if (!task || task.userId !== userId) return false;

      memoryTasks.delete(id);
      return true;
    }

    if (!isMongoObjectId(id)) return false;

    const result = await TaskModel.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  },
    // STUDY SESSIONS
  async getSessions(userId: string): Promise<IStudySession[]> {
    if (shouldUseMemoryStore(userId)) {
      return Array.from(memorySessions.values())
        .filter(session => session.userId === userId)
        .sort(
          (a, b) =>
            new Date(b.startTime).getTime() -
            new Date(a.startTime).getTime()
        );
    }

    const docs = await StudySessionModel.find({ userId }).sort({
      startTime: -1,
    });

    return docs.map(doc => ({
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
    }));
  },

  async createSession(
    userId: string,
    data: Partial<IStudySession>
  ): Promise<IStudySession> {
    const createdAt = new Date().toISOString();
    const duration = Math.max(
      1,
      Math.round(Number(data.duration) || 25)
    );

    const startTime =
      data.startTime ||
      new Date(Date.now() - duration * 60000).toISOString();

    const endTime = data.endTime || new Date().toISOString();

    if (shouldUseMemoryStore(userId)) {
      if (data.subjectId && data.completionStatus === 'completed') {
        const subject = memorySubjects.get(data.subjectId);

        if (subject && subject.userId === userId) {
          const additionalHours = Number((duration / 60).toFixed(2));

          subject.completedHours = Number(
            ((subject.completedHours || 0) + additionalHours).toFixed(2)
          );

          memorySubjects.set(data.subjectId, subject);
        }
      }

      const id = `sess-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 6)}`;

      const session: IStudySession = {
        id,
        userId,
        subjectId: data.subjectId || '',
        taskId: data.taskId,
        startTime,
        endTime,
        duration,
        sessionType: data.sessionType || 'focus',
        completionStatus: data.completionStatus || 'completed',
        notes: data.notes || '',
        createdAt,
      };

      memorySessions.set(id, session);
      return session;
    }

    if (
      data.subjectId &&
      data.completionStatus === 'completed' &&
      isMongoObjectId(data.subjectId)
    ) {
      const additionalHours = Number((duration / 60).toFixed(2));

      await SubjectModel.updateOne(
        { _id: data.subjectId, userId },
        { $inc: { completedHours: additionalHours } }
      );
    }

    const doc = await StudySessionModel.create({
      userId,
      subjectId: data.subjectId,
      taskId: data.taskId,
      startTime,
      endTime,
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
  },
};