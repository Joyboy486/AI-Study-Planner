import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NexusCard } from './ui/NexusCard';
import { NexusButton } from './ui/NexusButton';
import { X, BookOpen, AlertCircle, Plus } from 'lucide-react';

interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateSubjectModal: React.FC<CreateSubjectModalProps> = ({ isOpen, onClose }) => {
  const { addSubject } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#00D68F');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [weeklyTarget, setWeeklyTarget] = useState(6);
  const [examDate, setExamDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const colorPalette = ['#00D68F', '#64FFCA', '#008F62', '#57F5C4', '#10B981', '#34D399', '#059669', '#A7F3D0'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a subject name');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await addSubject({
        name: name.trim(),
        description: description.trim(),
        color,
        priority,
        weeklyTarget: Number(weeklyTarget),
        examDate: examDate || undefined,
      });
      setName('');
      setDescription('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create subject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <NexusCard
        glowColor="rgba(155, 123, 255, 0.3)"
        className="relative w-full max-w-md p-6 shadow-2xl bg-[#101629]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#A5B0CC] hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">Add Academic Course</h3>
        <p className="text-xs text-[#A5B0CC] mb-4">
          Establish a new subject with study targets and exam tracking.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Course / Subject Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Systems & Consensus"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#080B16] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#9B7BFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Topics & Syllabus Description</label>
            <textarea
              rows={2}
              placeholder="e.g. Raft consensus, vector clocks, Paxos, fault tolerance..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#080B16] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#9B7BFF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Weekly Target (Hours)</label>
              <input
                type="number"
                min={1}
                max={40}
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#080B16] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#9B7BFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#080B16] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#9B7BFF]"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Exam Date (Optional)</label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#080B16] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#9B7BFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Celestial Color Halo</label>
            <div className="flex items-center gap-2.5 pt-1">
              {colorPalette.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'scale-125 ring-2 ring-white shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
              {loading ? 'Creating...' : 'Create Course'}
            </NexusButton>
          </div>
        </form>
      </NexusCard>
    </div>
  );
};
