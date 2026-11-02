import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { NavTab } from '../components/Sidebar';
import { NexusCard } from '../components/ui/NexusCard';
import { NexusButton } from '../components/ui/NexusButton';
import {
  CalendarCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  Calendar as CalendarIcon,
  Play,
  Trash2,
  Edit3,
  AlertCircle,
  LayoutList,
  CalendarDays,
  X,
} from 'lucide-react';

interface PlannerProps {
  onNavigate: (tab: NavTab) => void;
  onOpenTaskModal: () => void;
}

export const Planner: React.FC<PlannerProps> = ({
  onNavigate,
  onOpenTaskModal,
}) => {
  const { tasks, subjects, updateTask, deleteTask, toggleTask, setActiveSubjectId, setActiveTaskId } = useApp();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubjectFilter === 'all' || t.subjectId === selectedSubjectFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'completed' ? t.status === 'completed' : t.status !== 'completed');
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesSubject && matchesStatus && matchesPriority;
  });

  const handleLaunchTaskSession = (t: Task) => {
    setActiveSubjectId(t.subjectId);
    setActiveTaskId(t.id);
    onNavigate('focus-room');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    await updateTask(editingTask.id, {
      title: editingTask.title,
      description: editingTask.description,
      subjectId: editingTask.subjectId,
      priority: editingTask.priority,
      dueDate: editingTask.dueDate,
      estimatedDuration: Number(editingTask.estimatedDuration),
    });
    setEditingTask(null);
  };

  // Calendar dates for the current week (Monday through Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      dateNumber: d.getDate(),
      isToday: d.toISOString().split('T')[0] === now.toISOString().split('T')[0],
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <NexusCard glowColor="rgba(0, 214, 143, 0.2)" className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight text-[#F3FFF9]">Smart Study Planner</h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#00D68F]/10 text-[#64FFCA] border border-[#00D68F]/25 font-bold">
                Dynamic Schedule
              </span>
            </div>
            <p className="text-xs text-[#91A69B] mt-0.5">
              Organize assignments, syllabus milestones, and daily focused study sprints.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-[#008F62] via-[#00D68F] to-[#64FFCA] text-[#050807] font-bold shadow-sm'
                    : 'text-[#91A69B] hover:text-[#F3FFF9]'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-gradient-to-r from-[#008F62] via-[#00D68F] to-[#64FFCA] text-[#050807] font-bold shadow-sm'
                    : 'text-[#91A69B] hover:text-[#F3FFF9]'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Calendar</span>
              </button>
            </div>

            <NexusButton
              size="sm"
              variant="primary"
              onClick={onOpenTaskModal}
              icon={<Plus className="w-4 h-4 text-white" />}
            >
              New Task
            </NexusButton>
          </div>
        </div>
      </NexusCard>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#0D1713] border border-[rgba(100,255,202,0.16)] shadow-md">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#91A69B]" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-lg text-xs text-[#F3FFF9] placeholder-[#91A69B] focus:outline-none focus:border-[#00D68F] transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Subject Filter */}
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-lg text-xs text-[#F3FFF9] focus:outline-none focus:border-[#00D68F]"
          >
            <option value="all">All Courses</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-lg text-xs text-[#F3FFF9] focus:outline-none focus:border-[#00D68F]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-lg text-xs text-[#F3FFF9] focus:outline-none focus:border-[#00D68F]"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <NexusCard className="py-16 text-center text-[#91A69B] text-xs">
              <CalendarCheck className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <h4 className="text-sm font-bold text-[#F3FFF9] mb-1">No tasks found</h4>
              <p className="max-w-xs mx-auto mb-4">
                No academic tasks match your current query and filters.
              </p>
              <NexusButton
                variant="primary"
                size="sm"
                onClick={onOpenTaskModal}
                icon={<Plus className="w-4 h-4 text-white" />}
              >
                Add New Task
              </NexusButton>
            </NexusCard>
          ) : (
            filteredTasks.map((t) => {
              const sub = subjects.find((s) => s.id === t.subjectId);
              const isDone = t.status === 'completed';
              const daysLeft = Math.ceil(
                (new Date(t.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              const isOverdue = !isDone && daysLeft < 0;
              const isUrgent = !isDone && daysLeft >= 0 && daysLeft <= 1;

              return (
                <div
                  key={t.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-[#050807]/50 border-white/5 opacity-60'
                      : 'bg-[#0D1713] border-[rgba(100,255,202,0.16)] hover:border-[#00D68F]/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 overflow-hidden">
                    <button
                      onClick={() => toggleTask(t.id)}
                      className="mt-0.5 sm:mt-0 text-[#91A69B] hover:text-[#00D68F] transition-colors shrink-0 cursor-pointer"
                      title={isDone ? 'Mark pending' : 'Mark completed'}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-[#64FFCA]" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold truncate ${
                            isDone ? 'line-through text-slate-500' : 'text-[#F3FFF9]'
                          }`}
                        >
                          {t.title}
                        </span>
                        {isOverdue && (
                          <span className="text-[10px] font-mono text-[#FF647C] bg-[#FF647C]/10 border border-[#FF647C]/20 px-1.5 py-0.5 rounded font-bold shrink-0">
                            Overdue
                          </span>
                        )}
                        {isUrgent && (
                          <span className="text-[10px] font-mono text-[#FFC857] bg-[#FFC857]/10 border border-[#FFC857]/20 px-1.5 py-0.5 rounded font-bold shrink-0">
                            Due soon
                          </span>
                        )}
                      </div>

                      {t.description && (
                        <p className="text-xs text-[#91A69B] line-clamp-1 mt-0.5">
                          {t.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#91A69B] mt-1">
                        <span
                          className="font-medium"
                          style={{ color: sub?.color || '#00D68F' }}
                        >
                          {sub?.name || 'General Course'}
                        </span>
                        <span>·</span>
                        <span className="font-mono">{t.estimatedDuration} mins</span>
                        <span>·</span>
                        <span className="font-mono">Due {t.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        t.priority === 'high'
                          ? 'bg-[#FF647C]/10 text-[#FF647C] border border-[#FF647C]/20'
                          : t.priority === 'medium'
                          ? 'bg-[#FFC857]/10 text-[#FFC857] border border-[#FFC857]/20'
                          : 'bg-white/5 text-[#91A69B] border border-white/10'
                      }`}
                    >
                      {t.priority}
                    </span>

                    {!isDone && (
                      <button
                        onClick={() => handleLaunchTaskSession(t)}
                        className="p-1.5 bg-[#00D68F]/10 hover:bg-[#00D68F]/20 text-[#64FFCA] rounded-lg transition-colors cursor-pointer"
                        title="Start focus timer on this task"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}

                    <button
                      onClick={() => setEditingTask(t)}
                      className="p-1.5 text-[#91A69B] hover:text-[#F3FFF9] rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                      title="Edit task"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => deleteTask(t.id)}
                      className="p-1.5 text-[#91A69B] hover:text-[#FF647C] rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: WEEKLY CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="p-4 rounded-2xl bg-[#0A100E] border border-[rgba(100,255,202,0.16)] overflow-x-auto shadow-xl">
          <div className="min-w-[700px] grid grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const dayTasks = tasks.filter((t) => t.dueDate === day.dateStr);

              return (
                <div
                  key={day.dateStr}
                  className={`flex flex-col min-h-[360px] p-2.5 rounded-xl border ${
                    day.isToday
                      ? 'bg-[#12221A] border-[#00D68F]/50 shadow-[0_0_15px_rgba(0,214,143,0.15)]'
                      : 'bg-[#0D1713] border-[rgba(100,255,202,0.1)]'
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[rgba(100,255,202,0.1)]">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#91A69B]">
                        {day.dayName}
                      </span>
                      <div className="text-base font-bold font-mono text-[#F3FFF9]">
                        {day.dateNumber}
                      </div>
                    </div>
                    {day.isToday && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-gradient-to-r from-[#008F62] via-[#00D68F] to-[#64FFCA] text-[#050807] font-bold">
                        TODAY
                      </span>
                    )}
                  </div>

                  {/* Day Tasks Blocks */}
                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {dayTasks.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-[10px] text-[#91A69B]/60 font-mono">
                        Clear
                      </div>
                    ) : (
                      dayTasks.map((t) => {
                        const sub = subjects.find((s) => s.id === t.subjectId);
                        const isDone = t.status === 'completed';
                        return (
                          <div
                            key={t.id}
                            onClick={() => !isDone && handleLaunchTaskSession(t)}
                            className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                              isDone
                                ? 'bg-[#050807]/40 border-white/5 opacity-50'
                                : 'bg-[#050807] hover:border-[#00D68F]/30'
                            }`}
                            style={{
                              borderLeftWidth: '3px',
                              borderLeftColor: sub?.color || '#00D68F',
                            }}
                          >
                            <div
                              className={`text-[11px] font-bold truncate ${
                                isDone ? 'line-through text-slate-500' : 'text-[#F3FFF9]'
                              }`}
                            >
                              {t.title}
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-[#91A69B] mt-1 font-mono">
                              <span>{t.estimatedDuration}m</span>
                              <span className="capitalize">{t.priority}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <NexusCard
            glowColor="rgba(0, 214, 143, 0.3)"
            className="relative w-full max-w-md p-6 shadow-2xl bg-[#0D1713] border border-[rgba(100,255,202,0.25)]"
          >
            <button
              onClick={() => setEditingTask(null)}
              className="absolute top-4 right-4 p-2 text-[#91A69B] hover:text-[#F3FFF9] rounded-lg hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#F3FFF9] mb-4">Edit Task</h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#DCE7E2] mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs text-[#F3FFF9] focus:outline-none focus:border-[#00D68F]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#DCE7E2] mb-1">Course / Subject</label>
                <select
                  value={editingTask.subjectId}
                  onChange={(e) => setEditingTask({ ...editingTask, subjectId: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs text-[#F3FFF9] focus:outline-none focus:border-[#00D68F]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#DCE7E2] mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={editingTask.dueDate}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs text-[#F3FFF9] font-mono focus:outline-none focus:border-[#00D68F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#DCE7E2] mb-1">Est. Duration (Mins)</label>
                  <input
                    type="number"
                    min={5}
                    max={360}
                    value={editingTask.estimatedDuration}
                    onChange={(e) => setEditingTask({ ...editingTask, estimatedDuration: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs text-[#F3FFF9] font-mono focus:outline-none focus:border-[#00D68F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#DCE7E2] mb-1">Priority</label>
                <select
                  value={editingTask.priority}
                  onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as any })}
                  className="w-full px-3.5 py-2 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs text-[#F3FFF9] focus:outline-none focus:border-[#00D68F]"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#DCE7E2] mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs text-[#F3FFF9] focus:outline-none focus:border-[#00D68F]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <NexusButton
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setEditingTask(null)}
                >
                  Cancel
                </NexusButton>
                <NexusButton
                  variant="primary"
                  size="sm"
                  type="submit"
                >
                  Update Task
                </NexusButton>
              </div>
            </form>
          </NexusCard>
        </div>
      )}
    </div>
  );
};
