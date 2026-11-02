import mongoose, { Schema } from 'mongoose';

const UserPreferencesSchema = new Schema({
  weeklyHourGoal: { type: Number, default: 20 },
  focusDuration: { type: Number, default: 25 },
  shortBreakDuration: { type: Number, default: 5 },
  longBreakDuration: { type: Number, default: 15 },
  availableStudyHours: { type: [String], default: ['morning', 'evening'] },
  soundEnabled: { type: Boolean, default: false },
  onboardingCompleted: { type: Boolean, default: false },
}, { _id: false });

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  preferences: { type: UserPreferencesSchema, default: () => ({}) },
}, { timestamps: true });

const SubjectSchema = new Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  color: { type: String, default: '#A78BFA' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  weeklyTarget: { type: Number, default: 5 },
  examDate: { type: String },
  completedHours: { type: Number, default: 0 },
}, { timestamps: true });

const TaskSchema = new Schema({
  userId: { type: String, required: true, index: true },
  subjectId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: { type: String, required: true },
  estimatedDuration: { type: Number, default: 30 },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  completedAt: { type: String },
}, { timestamps: true });

const StudySessionSchema = new Schema({
  userId: { type: String, required: true, index: true },
  subjectId: { type: String, required: true, index: true },
  taskId: { type: String },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  sessionType: { type: String, enum: ['focus', 'short_break', 'long_break'], default: 'focus' },
  completionStatus: { type: String, enum: ['completed', 'abandoned'], default: 'completed' },
  notes: { type: String, default: '' },
}, { timestamps: true });

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const SubjectModel = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
export const TaskModel = mongoose.models.Task || mongoose.model('Task', TaskSchema);
export const StudySessionModel = mongoose.models.StudySession || mongoose.model('StudySession', StudySessionSchema);
