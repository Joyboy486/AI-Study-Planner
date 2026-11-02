import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { NexusCard } from './ui/NexusCard';
import { NexusButton } from './ui/NexusButton';
import { ArrowRight, Check, Sparkles, BookOpen, Clock, Target, Calendar } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { user, updatePreferences } = useAuth();
  const { addSubject, showToast } = useApp();

  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState(user?.name || '');
  const [subjectNames, setSubjectNames] = useState<string>('Data Structures & Algorithms, Physics II');
  const [weeklyGoal, setWeeklyGoal] = useState<number>(20);
  const [studyHours, setStudyHours] = useState<string[]>(['morning', 'evening']);
  const [focusDuration, setFocusDuration] = useState<number>(25);

  if (!isOpen) return null;

  const toggleStudyHour = (slot: string) => {
    if (studyHours.includes(slot)) {
      setStudyHours(studyHours.filter(s => s !== slot));
    } else {
      setStudyHours([...studyHours, slot]);
    }
  };

  const handleFinish = async () => {
    // 1. Save preferences
    await updatePreferences({
      weeklyHourGoal: weeklyGoal,
      focusDuration,
      availableStudyHours: studyHours,
      onboardingCompleted: true,
    });

    // 2. Add custom subjects if entered
    const subjectsToCreate = subjectNames
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const colors = ['#00D68F', '#64FFCA', '#008F62', '#57F5C4', '#2EE09E'];

    for (let i = 0; i < subjectsToCreate.length; i++) {
      try {
        await addSubject({
          name: subjectsToCreate[i],
          color: colors[i % colors.length],
          priority: i === 0 ? 'high' : 'medium',
          weeklyTarget: Math.round(weeklyGoal / Math.max(1, subjectsToCreate.length)),
        });
      } catch (err) {
        console.error('Failed to create onboarding subject:', err);
      }
    }

    showToast('Welcome to FocusFlow Cyber Emerald! Your futuristic workspace is activated.', 'success');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <NexusCard
        glowColor="rgba(0, 214, 143, 0.35)"
        className="relative w-full max-w-lg p-7 shadow-2xl bg-[#0D1713] border border-[rgba(100,255,202,0.25)]"
      >
        {/* Progress header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#008F62] via-[#00D68F] to-[#64FFCA] p-[1.5px] shadow-[0_0_12px_rgba(0,214,143,0.4)]">
              <div className="w-full h-full bg-[#050807] rounded-[7px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#64FFCA]" />
              </div>
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase text-[#91A69B]">
              Activating Cyber Emerald · Step {step} of 5
            </span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-6 rounded-full transition-all ${
                  s === step
                    ? 'bg-gradient-to-r from-[#008F62] via-[#00D68F] to-[#64FFCA] shadow-[0_0_8px_#64FFCA]'
                    : s < step
                    ? 'bg-[#00D68F]'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Name */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-[#F3FFF9] tracking-tight">What should we call you?</h3>
              <p className="text-sm text-[#91A69B] mt-1">
                Your name will personalize your study cockpit, AI companion prompts, and streaks.
              </p>
            </div>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya Lin"
              className="w-full px-4 py-3 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-base text-[#F3FFF9] placeholder-[#91A69B] focus:outline-none focus:border-[#00D68F]"
            />
          </div>
        )}

        {/* STEP 2: Main Subjects */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <BookOpen className="w-6 h-6 text-[#64FFCA] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xl font-bold text-[#F3FFF9] tracking-tight">What are your main subjects?</h3>
                <p className="text-sm text-[#91A69B] mt-1">
                  Separate with commas. These will form the core of your orbital Focus Universe.
                </p>
              </div>
            </div>
            <textarea
              rows={3}
              value={subjectNames}
              onChange={(e) => setSubjectNames(e.target.value)}
              placeholder="e.g. Distributed Systems, Organic Chemistry, Linear Algebra"
              className="w-full px-4 py-3 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-sm text-[#F3FFF9] placeholder-[#91A69B] focus:outline-none focus:border-[#00D68F]"
            />
          </div>
        )}

        {/* STEP 3: Weekly Goal */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Target className="w-6 h-6 text-[#00D68F] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xl font-bold text-[#F3FFF9] tracking-tight">Set your weekly study goal</h3>
                <p className="text-sm text-[#91A69B] mt-1">
                  How many focused hours do you aim to invest each week?
                </p>
              </div>
            </div>

            <div className="py-4 text-center">
              <span className="text-5xl font-extrabold text-[#F3FFF9] font-mono tabular-nums tracking-tight">
                {weeklyGoal}
              </span>
              <span className="text-lg text-[#64FFCA] font-medium ml-2 font-mono">hours / week</span>
            </div>

            <input
              type="range"
              min={5}
              max={60}
              step={1}
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(Number(e.target.value))}
              className="w-full accent-[#00D68F] cursor-pointer"
            />
            <div className="flex justify-between text-xs text-[#91A69B] font-mono">
              <span>5h (Casual)</span>
              <span>20h (Standard)</span>
              <span>40h+ (Intense)</span>
            </div>
          </div>
        )}

        {/* STEP 4: Available Study Hours */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-6 h-6 text-[#57F5C4] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xl font-bold text-[#F3FFF9] tracking-tight">When do you do your best thinking?</h3>
                <p className="text-sm text-[#91A69B] mt-1">
                  Select your primary study windows for daily plan generation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { id: 'morning', label: 'Early Morning (6 AM - 10 AM)', desc: 'Peak cognitive clarity' },
                { id: 'afternoon', label: 'Midday (11 AM - 3 PM)', desc: 'Problem sets & labs' },
                { id: 'evening', label: 'Evening (4 PM - 9 PM)', desc: 'Revision & reading' },
                { id: 'night', label: 'Night Owl (9 PM - 1 AM)', desc: 'Distraction-free quiet' },
              ].map((time) => {
                const isSelected = studyHours.includes(time.id);
                return (
                  <button
                    type="button"
                    key={time.id}
                    onClick={() => toggleStudyHour(time.id)}
                    className={`p-3.5 text-left rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#008F62]/25 to-[#00D68F]/15 border-[#00D68F] text-[#F3FFF9] shadow-md'
                        : 'bg-[#0A100E] border-[rgba(100,255,202,0.12)] text-[#91A69B] hover:border-[rgba(100,255,202,0.25)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[#F3FFF9]">{time.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#64FFCA]" />}
                    </div>
                    <span className="text-[11px] text-[#91A69B]">{time.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Focus Duration */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-[#64FFCA] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xl font-bold text-[#F3FFF9] tracking-tight">Preferred focus sprint duration</h3>
                <p className="text-sm text-[#91A69B] mt-1">
                  Choose your default Pomodoro session length for deep work.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { duration: 25, label: 'Classic', desc: '25 min focus / 5 min break' },
                { duration: 50, label: 'Deep Work', desc: '50 min focus / 10 min break' },
                { duration: 90, label: 'Ultradian', desc: '90 min focus / 20 min break' },
              ].map((p) => {
                const isSelected = focusDuration === p.duration;
                return (
                  <button
                    type="button"
                    key={p.duration}
                    onClick={() => setFocusDuration(p.duration)}
                    className={`p-4 text-center rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#008F62]/25 to-[#00D68F]/15 border-[#00D68F] text-[#F3FFF9] shadow-md'
                        : 'bg-[#0A100E] border-[rgba(100,255,202,0.12)] text-[#91A69B] hover:border-[rgba(100,255,202,0.25)]'
                    }`}
                  >
                    <span className="text-2xl font-bold text-[#F3FFF9] font-mono">{p.duration}m</span>
                    <div className="text-xs font-semibold text-[#F3FFF9] mt-1">{p.label}</div>
                    <div className="text-[10px] text-[#91A69B] mt-0.5">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-[rgba(100,255,202,0.12)]">
          {step > 1 ? (
            <NexusButton
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setStep(step - 1)}
            >
              Back
            </NexusButton>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <NexusButton
              variant="primary"
              size="sm"
              type="button"
              onClick={() => setStep(step + 1)}
              icon={<ArrowRight className="w-3.5 h-3.5 text-white" />}
            >
              Continue
            </NexusButton>
          ) : (
            <NexusButton
              variant="primary"
              size="sm"
              type="submit"
              onClick={handleFinish}
              icon={<Sparkles className="w-3.5 h-3.5 text-white" />}
            >
              Launch FocusFlow
            </NexusButton>
          )}
        </div>
      </NexusCard>
    </div>
  );
};
