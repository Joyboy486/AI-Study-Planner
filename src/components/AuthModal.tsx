import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { NexusCard } from './ui/NexusCard';
import { NexusButton } from './ui/NexusButton';
import { Sparkles, Lock, Mail, User as UserIcon, X, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const { login, register, loginDemo } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        await register(name, email, password);
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginDemo();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Demo login failed');
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
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#008F62] via-[#00D68F] to-[#64FFCA] flex items-center justify-center shadow-[0_0_15px_rgba(0,214,143,0.4)]">
            <Sparkles className="w-5 h-5 text-[#050807]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[#F3FFF9]">FocusFlow</h2>
            <p className="text-xs text-[#91A69B]">Cyber Emerald AI Academic Operating System</p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 mb-5 bg-[#0A100E] border border-[rgba(100,255,202,0.12)] rounded-xl">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-[#008F62] via-[#00D68F] to-[#64FFCA] text-[#050807] font-bold shadow-sm'
                : 'text-[#91A69B] hover:text-[#F3FFF9]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-gradient-to-r from-[#008F62] via-[#00D68F] to-[#64FFCA] text-[#050807] font-bold shadow-sm'
                : 'text-[#91A69B] hover:text-[#F3FFF9]'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#FF647C]/10 border border-[#FF647C]/20 text-xs text-[#FF647C]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[#DCE7E2] mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-[#91A69B]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-sm text-[#F3FFF9] placeholder-[#91A69B] focus:outline-none focus:border-[#00D68F] transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#DCE7E2] mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-[#91A69B]" />
              <input
                type="email"
                required
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-sm text-[#F3FFF9] placeholder-[#91A69B] focus:outline-none focus:border-[#00D68F] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#DCE7E2] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-[#91A69B]" />
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-sm text-[#F3FFF9] placeholder-[#91A69B] focus:outline-none focus:border-[#00D68F] transition-colors"
              />
            </div>
          </div>

          <NexusButton
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
            icon={<ArrowRight className="w-4 h-4 text-white" />}
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Workspace' : 'Create My Account'}
          </NexusButton>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[rgba(100,255,202,0.12)]"></div>
          </div>
          <div className="relative flex justify-center text-xs text-[#91A69B] uppercase font-mono">
            <span className="bg-[#0D1713] px-3 font-semibold">or instant test access</span>
          </div>
        </div>

        <NexusButton
          type="button"
          variant="secondary"
          className="w-full"
          onClick={handleDemoClick}
          disabled={loading}
          icon={<ShieldCheck className="w-4 h-4 text-[#64FFCA]" />}
        >
          Explore Demo Student Account (Instant)
        </NexusButton>

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#91A69B]">
          <span>Protected with bcrypt & JWT</span>
          <span>·</span>
          <span>Resilient Store</span>
        </div>
      </NexusCard>
    </div>
  );
};
