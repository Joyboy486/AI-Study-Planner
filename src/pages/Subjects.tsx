import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Subject } from '../types';
import { NavTab } from '../components/Sidebar';
import { NexusCard } from '../components/ui/NexusCard';
import { NexusButton } from '../components/ui/NexusButton';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Play,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  Target,
} from 'lucide-react';

interface SubjectsProps {
  onNavigate: (tab: NavTab) => void;
  onOpenSubjectModal: () => void;
}

export const Subjects: React.FC<SubjectsProps> = ({
  onNavigate,
  onOpenSubjectModal,
}) => {
  const { subjects, tasks, updateSubject, deleteSubject, setActiveSubjectId } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Filtered list
  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || s.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleStartSession = (subId: string) => {
    setActiveSubjectId(subId);
    onNavigate('focus-room');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;
    await updateSubject(editingSubject.id, {
      name: editingSubject.name,
      description: editingSubject.description,
      color: editingSubject.color,
      priority: editingSubject.priority,
      weeklyTarget: Number(editingSubject.weeklyTarget),
      examDate: editingSubject.examDate,
    });
    setEditingSubject(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <NexusCard glowColor="rgba(0, 214, 143, 0.2)" className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight text-[#F3FFF9]">Course & Subject Management</h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#00D68F]/10 text-[#64FFCA] border border-[#00D68F]/25 font-bold">
                Academic Syllabi
              </span>
            </div>
            <p className="text-xs text-[#91A69B] mt-0.5">
              Manage your academic courses, weekly targets, exam horizons, and priority weightings.
            </p>
          </div>

          <NexusButton
            variant="primary"
            size="sm"
            onClick={onOpenSubjectModal}
            icon={<Plus className="w-4 h-4 text-white" />}
          >
            New Course
          </NexusButton>
        </div>
      </NexusCard>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#91A69B]" />
          <input
            type="text"
            placeholder="Search subjects or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0D1713] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs text-[#F3FFF9] placeholder-[#91A69B] focus:outline-none focus:border-[#00D68F] transition-colors"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1 p-1 bg-[#0D1713] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs shrink-0">
          {(['all', 'high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1.5 font-medium rounded-lg capitalize transition-colors cursor-pointer ${
                priorityFilter === p
                  ? 'bg-gradient-to-r from-[#008F62] via-[#00D68F] to-[#64FFCA] text-[#050807] font-bold shadow-sm'
                  : 'text-[#91A69B] hover:text-[#F3FFF9]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Subject Cards */}
      {filteredSubjects.length === 0 ? (
        <NexusCard className="py-16 text-center text-[#91A69B] text-xs">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <h4 className="text-sm font-bold text-[#F3FFF9] mb-1">No subjects match your criteria</h4>
          <p className="max-w-xs mx-auto mb-4">
            Try adjusting your search terms or priority filters, or create a new subject.
          </p>
          <NexusButton
            variant="primary"
            size="sm"
            onClick={onOpenSubjectModal}
            icon={<Plus className="w-4 h-4 text-white" />}
          >
            Create Subject
          </NexusButton>
        </NexusCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSubjects.map((sub) => {
            const subTasks = tasks.filter((t) => t.subjectId === sub.id);
            const pendingCount = subTasks.filter((t) => t.status !== 'completed').length;
            const progressPct =
              sub.weeklyTarget > 0
                ? Math.min(100, Math.round(((sub.completedHours || 0) / sub.weeklyTarget) * 100))
                : 0;

            // Attention alert: exam in < 14 days and progress < 40%
            let needsAttention = false;
            let daysUntilExam: number | null = null;
            if (sub.examDate) {
              const diffMs = new Date(sub.examDate).getTime() - new Date().getTime();
              daysUntilExam = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              if (daysUntilExam > 0 && daysUntilExam <= 14 && progressPct < 40) {
                needsAttention = true;
              }
            }

            return (
              <NexusCard
                key={sub.id}
                glowColor={`${sub.color}44`}
                className="p-5 relative overflow-hidden flex flex-col justify-between"
              >
                {/* Top color indicator bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 shadow-sm"
                  style={{ backgroundColor: sub.color }}
                />

                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-4 h-4 rounded-full shrink-0 shadow-md"
                        style={{
                          backgroundColor: sub.color,
                          boxShadow: `0 0 10px ${sub.color}88`,
                        }}
                      />
                      <h3 className="text-base font-bold text-[#F3FFF9] tracking-tight">{sub.name}</h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditingSubject(sub)}
                        className="p-1.5 text-[#91A69B] hover:text-[#F3FFF9] rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                        title="Edit course"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteSubject(sub.id)}
                        className="p-1.5 text-[#91A69B] hover:text-[#FF647C] rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                        title="Delete course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {sub.description && (
                    <p className="text-xs text-[#91A69B] mb-4 line-clamp-2 leading-relaxed">
                      {sub.description}
                    </p>
                  )}

                  {/* Needs Attention warning */}
                  {needsAttention && (
                    <div className="mb-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs text-amber-300">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        Attention needed: Exam in {daysUntilExam}d and you have only completed {progressPct}% of your weekly target.
                      </span>
                    </div>
                  )}

                  {/* Progress Ring / Bar */}
                  <div className="my-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[#91A69B]">Weekly Target Progress</span>
                      <span className="font-mono font-bold text-[#F3FFF9]">
                        {sub.completedHours}h{' '}
                        <span className="text-[#91A69B] font-normal">/ {sub.weeklyTarget}h ({progressPct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#050807] overflow-hidden border border-[rgba(100,255,202,0.1)]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progressPct}%`,
                          backgroundColor: sub.color,
                          boxShadow: `0 0 10px ${sub.color}88`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Course Details strip */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#91A69B] my-3 pt-2 border-t border-[rgba(100,255,202,0.12)]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#91A69B]" />
                      <span>{pendingCount} tasks pending</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#91A69B]" />
                      <span>
                        {sub.examDate ? (
                          daysUntilExam !== null && daysUntilExam >= 0 ? (
                            <span className="text-[#F3FFF9] font-mono font-medium">Exam in {daysUntilExam}d</span>
                          ) : (
                            <span>Exam: {sub.examDate}</span>
                          )
                        ) : (
                          'No exam set'
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-3 pt-3 border-t border-[rgba(100,255,202,0.12)] flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[rgba(100,255,202,0.08)] text-[#64FFCA] border border-[rgba(100,255,202,0.16)] font-semibold">
                    {sub.priority} priority
                  </span>

                  <NexusButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleStartSession(sub.id)}
                    icon={<Play className="w-3 h-3 fill-current" />}
                  >
                    Start Session
                  </NexusButton>
                </div>
              </NexusCard>
            );
          })}
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <NexusCard
            glowColor="rgba(0, 214, 143, 0.3)"
            className="relative w-full max-w-md p-6 shadow-2xl bg-[#0D1713] border border-[rgba(100,255,202,0.25)]"
          >
            <button
              onClick={() => setEditingSubject(null)}
              className="absolute top-4 right-4 p-2 text-[#91A69B] hover:text-[#F3FFF9] rounded-lg hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#F3FFF9] mb-4">Edit Course</h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#DCE7E2] mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={editingSubject.name}
                  onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs text-[#F3FFF9] focus:outline-none focus:border-[#00D68F]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#DCE7E2] mb-1">Description / Topics</label>
                <textarea
                  rows={2}
                  value={editingSubject.description}
                  onChange={(e) => setEditingSubject({ ...editingSubject, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs text-[#F3FFF9] focus:outline-none focus:border-[#00D68F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#DCE7E2] mb-1">Weekly Target (Hours)</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={editingSubject.weeklyTarget}
                    onChange={(e) => setEditingSubject({ ...editingSubject, weeklyTarget: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs text-[#F3FFF9] font-mono focus:outline-none focus:border-[#00D68F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#DCE7E2] mb-1">Priority</label>
                  <select
                    value={editingSubject.priority}
                    onChange={(e) => setEditingSubject({ ...editingSubject, priority: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs text-[#F3FFF9] focus:outline-none focus:border-[#00D68F]"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#DCE7E2] mb-1">Exam Date (Optional)</label>
                  <input
                    type="date"
                    value={editingSubject.examDate || ''}
                    onChange={(e) => setEditingSubject({ ...editingSubject, examDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs text-[#F3FFF9] font-mono focus:outline-none focus:border-[#00D68F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#DCE7E2] mb-1">Accent Color</label>
                  <div className="flex items-center gap-2 pt-1">
                    {['#00D68F', '#64FFCA', '#008F62', '#57F5C4', '#2EE09E', '#10B981'].map((color) => (
                      <button
                        type="button"
                        key={color}
                        onClick={() => setEditingSubject({ ...editingSubject, color })}
                        className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                          editingSubject.color === color ? 'scale-125 ring-2 ring-white' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <NexusButton
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setEditingSubject(null)}
                >
                  Cancel
                </NexusButton>
                <NexusButton
                  variant="primary"
                  size="sm"
                  type="submit"
                >
                  Save Changes
                </NexusButton>
              </div>
            </form>
          </NexusCard>
        </div>
      )}
    </div>
  );
};
