import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NexusCard } from './ui/NexusCard';
import { NexusButton } from './ui/NexusButton';
import { X, Plus, Calendar, Clock, AlertCircle } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
  const { subjects, addTask, activeSubjectId } = useApp();

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(activeSubjectId || subjects[0]?.id || '');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [estimatedDuration, setEstimatedDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title');
      return;
    }
    if (!subjectId) {
      setError('Please select or create a subject first');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await addTask({
        title: title.trim(),
        subjectId,
        description: description.trim(),
        priority,
        dueDate,
        estimatedDuration: Number(estimatedDuration),
        status: 'pending',
      });
      setTitle('');
      setDescription('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <NexusCard
        glowColor="rgba(0, 214, 143, 0.3)"
        className="relative w-full max-w-md p-6 shadow-2xl bg-[#0D1713] border border-[rgba(100,255,202,0.25)]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#91A69B] hover:text-[#F3FFF9] rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-[#F3FFF9] mb-1">Create Academic Task</h3>
        <p className="text-xs text-[#91A69B] mb-4">Add a new assignment, problem set, or reading sprint.</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#FF647C]/10 border border-[#FF647C]/20 text-xs text-[#FF647C] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#DCE7E2] mb-1">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Solve Problem Set 3 — Eigenvalues"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs text-[#F3FFF9] placeholder-[#91A69B] focus:outline-none focus:border-[#00D68F] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#DCE7E2] mb-1">Subject / Course</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs text-[#F3FFF9] focus:outline-none focus:border-[#00D68F] transition-colors"
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
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs text-[#F3FFF9] font-mono focus:outline-none focus:border-[#00D68F]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#DCE7E2] mb-1">Est. Duration (Mins)</label>
              <input
                type="number"
                min={5}
                max={360}
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs text-[#F3FFF9] font-mono focus:outline-none focus:border-[#00D68F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#DCE7E2] mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs text-[#F3FFF9] focus:outline-none focus:border-[#00D68F]"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#DCE7E2] mb-1">Notes / Scope (Optional)</label>
            <textarea
              rows={2}
              placeholder="Key concepts or deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs text-[#F3FFF9] placeholder-[#91A69B] focus:outline-none focus:border-[#00D68F]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <NexusButton
              variant="secondary"
              size="sm"
              type="button"
              onClick={onClose}
            >
              Cancel
            </NexusButton>
            <NexusButton
              variant="primary"
              size="sm"
              type="submit"
              disabled={loading}
              icon={<Plus className="w-3.5 h-3.5 text-white" />}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </NexusButton>
          </div>
        </form>
      </NexusCard>
    </div>
  );
};
