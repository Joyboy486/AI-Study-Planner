import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { NexusCard } from '../components/ui/NexusCard';
import { NexusButton } from '../components/ui/NexusButton';
import {
  Sparkles,
  Send,
  BookOpen,
  Calendar,
  HelpCircle,
  ListTodo,
  FileText,
  Compass,
  ArrowRight,
  Bot,
  User,
  Plus,
  Check,
  Zap,
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
  action?: string;
}

// Markdown parser helper for assistant responses
const FormattedMessage: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');

  const renderFormattedLine = (rawLine: string, lineIdx: number) => {
    const trimmed = rawLine.trim();

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***') {
      return <hr key={lineIdx} className="border-[rgba(100,255,202,0.16)] my-2.5" />;
    }

    // Headers (e.g. ### Header)
    if (trimmed.startsWith('### ')) {
      return (
        <h4 key={lineIdx} className="text-sm font-bold text-[#F3FFF9] mt-2 mb-1 flex items-center gap-1.5">
          {renderInlineFormatting(trimmed.replace('### ', ''))}
        </h4>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h3 key={lineIdx} className="text-base font-extrabold text-[#F3FFF9] mt-2.5 mb-1.5">
          {renderInlineFormatting(trimmed.replace('## ', ''))}
        </h3>
      );
    }

    // Bullet points (e.g. - item or * item)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const cleanLine = trimmed.replace(/^[-*]\s+/, '');
      return (
        <div key={lineIdx} className="flex items-start gap-2 ml-1 my-1 text-xs sm:text-sm">
          <span className="text-[#00D68F] font-bold mt-0.5">•</span>
          <span className="flex-1 text-[#DCE7E2]">{renderInlineFormatting(cleanLine)}</span>
        </div>
      );
    }

    // Numbered lists (e.g. 1. item)
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      return (
        <div key={lineIdx} className="flex items-start gap-2 ml-1 my-1 text-xs sm:text-sm">
          <span className="text-[#64FFCA] font-mono font-bold">{numberedMatch[1]}.</span>
          <span className="flex-1 text-[#DCE7E2]">{renderInlineFormatting(numberedMatch[2])}</span>
        </div>
      );
    }

    // Empty lines
    if (!trimmed) {
      return <div key={lineIdx} className="h-1.5" />;
    }

    // Regular paragraph
    return (
      <p key={lineIdx} className="text-xs sm:text-sm text-[#DCE7E2] leading-relaxed my-0.5">
        {renderInlineFormatting(trimmed)}
      </p>
    );
  };

  const renderInlineFormatting = (content: string) => {
    // Parse bold text **bold** and backticks `code`
    const parts = content.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-[#F3FFF9]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-[#0A100E] text-[#64FFCA] border border-[rgba(100,255,202,0.2)] font-mono text-[11px]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return <div className="space-y-1">{lines.map((line, idx) => renderFormattedLine(line, idx))}</div>;
};

export const AICompanion: React.FC = () => {
  const { subjects, tasks, addTask, showToast } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I'm your **FocusFlow AI Academic Companion**. I have real-time visibility into your courses, target hours, and upcoming deadlines.

How can I accelerate your learning today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'FocusFlow Nexus AI Core',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [userNotes, setUserNotes] = useState('');
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatContainerRef.current) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg) return;

    if (lastMsg.sender === 'assistant' && lastMessageRef.current) {
      // Scroll to start of assistant message so headers and sprint 1 are not sliced off
      const topOffset = lastMessageRef.current.offsetTop - chatContainerRef.current.offsetTop - 12;
      chatContainerRef.current.scrollTo({
        top: Math.max(0, topOffset),
        behavior: 'smooth',
      });
    } else {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  const handleSend = async (action: string = 'general', customText?: string) => {
    const promptToSend = customText || inputPrompt;
    if (!promptToSend.trim() && action === 'general') return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: promptToSend || `Triggered action: ${action.replace('_', ' ')}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await api.askAI({
        action,
        prompt: promptToSend,
        subjectId: selectedSubjectId || undefined,
        userNotes: userNotes || undefined,
      });

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: res.source?.includes('gemini') ? 'Gemini 2.5 Flash' : 'Academic Heuristics Engine',
        action: res.action,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `I encountered an issue generating this response: ${err instanceof Error ? err.message : 'Network error'}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'Error Handler',
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChipClick = (action: string, promptText: string) => {
    handleSend(action, promptText);
  };

  const promptChips = [
    {
      action: 'plan_day',
      label: 'Plan my day',
      desc: 'Personalized hourly focus schedule',
      icon: <Calendar className="w-3.5 h-3.5 text-[#00D68F]" />,
    },
    {
      action: 'recommend_next',
      label: 'What should I study next?',
      desc: 'Based on deadlines and progress',
      icon: <Compass className="w-3.5 h-3.5 text-[#64FFCA]" />,
    },
    {
      action: 'breakdown_task',
      label: 'Break down my assignment',
      desc: 'Deconstruct large project into sprints',
      icon: <ListTodo className="w-3.5 h-3.5 text-[#008F62]" />,
    },
    {
      action: 'revision_schedule',
      label: 'Help me revise',
      desc: 'Spaced repetition exam schedule',
      icon: <BookOpen className="w-3.5 h-3.5 text-[#57F5C4]" />,
    },
    {
      action: 'generate_quiz',
      label: 'Generate a quiz',
      desc: 'Active recall multiple-choice test',
      icon: <HelpCircle className="w-3.5 h-3.5 text-[#FFC857]" />,
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full space-y-3 animate-in fade-in duration-300">
      {/* Header Bar */}
      <NexusCard glowColor="rgba(0, 214, 143, 0.25)" className="p-3.5 sm:p-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#008F62] via-[#00D68F] to-[#64FFCA] p-[1.5px] shadow-[0_0_15px_rgba(0,214,143,0.3)] shrink-0">
              <div className="w-full h-full bg-[#050807] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#64FFCA]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#F3FFF9]">AI Study Companion</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#00D68F]/10 text-[#64FFCA] border border-[#00D68F]/25 font-bold">
                  Gemini 2.5 Flash Powered
                </span>
              </div>
              <p className="text-xs text-[#91A69B] mt-0.5 hidden sm:block">
                Personalized syllabus advisor, task breakdown generator, and cognitive concept tutor.
              </p>
            </div>
          </div>

          {/* Course Context Picker */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#91A69B] shrink-0 font-medium">Focus Course:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-1.5 bg-[#0A100E] border border-[rgba(100,255,202,0.2)] rounded-xl text-[#F3FFF9] font-medium focus:outline-none focus:border-[#00D68F] cursor-pointer"
            >
              <option value="">All Courses Context</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </NexusCard>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 no-scrollbar">
        {promptChips.map((chip) => (
          <NexusButton
            key={chip.action}
            variant="secondary"
            size="sm"
            onClick={() => handleChipClick(chip.action, chip.label)}
            disabled={isLoading}
            icon={chip.icon}
          >
            {chip.label}
          </NexusButton>
        ))}

        <NexusButton
          variant="secondary"
          size="sm"
          onClick={() => setShowNotesDrawer(!showNotesDrawer)}
          icon={<FileText className="w-3.5 h-3.5 text-[#64FFCA]" />}
        >
          {showNotesDrawer ? 'Hide Notes Input' : 'Summarize Notes'}
        </NexusButton>
      </div>

      {/* Optional Notes Input Drawer */}
      {showNotesDrawer && (
        <div className="shrink-0">
          <NexusCard glowColor="rgba(0, 214, 143, 0.2)" className="p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#F3FFF9]">Paste Lecture or Study Notes</span>
              <span className="text-[#91A69B]">AI will extract key concepts and active recall bullets</span>
            </div>
            <textarea
              rows={3}
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="Paste raw notes, lecture excerpts, or reading passages here..."
              className="w-full p-2.5 bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl text-xs text-[#F3FFF9] placeholder-[#91A69B] focus:outline-none focus:border-[#00D68F]"
            />
            <NexusButton
              variant="primary"
              size="sm"
              onClick={() => handleSend('summarize_notes', 'Please synthesize my pasted study notes')}
              disabled={!userNotes.trim() || isLoading}
              icon={<Zap className="w-3.5 h-3.5 text-white" />}
            >
              Synthesize Notes into High-Yield Recall
            </NexusButton>
          </NexusCard>
        </div>
      )}

      {/* Chat Messages Stream - Expands dynamically and scrolls internally */}
      <div
        ref={chatContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#050807] rounded-2xl border border-[rgba(100,255,202,0.16)] shadow-xl scroll-smooth"
      >
        {messages.map((m, idx) => {
          const isUser = m.sender === 'user';
          const isLast = idx === messages.length - 1;
          return (
            <div
              key={m.id}
              ref={isLast ? lastMessageRef : null}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                  isUser
                    ? 'bg-gradient-to-tr from-[#008F62] to-[#64FFCA] text-[#050807]'
                    : 'bg-[#0A100E] border border-[rgba(100,255,202,0.25)] text-[#64FFCA]'
                }`}
              >
                {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-[#12221A] to-[#0D1713] text-[#F3FFF9] border border-[#00D68F]/40 rounded-tr-none shadow-lg'
                    : 'bg-[#0D1713] text-[#DCE7E2] border border-[rgba(100,255,202,0.16)] rounded-tl-none shadow-md'
                }`}
              >
                {/* Assistant Source Badge */}
                {!isUser && (
                  <div className="flex items-center justify-between text-[10px] text-[#91A69B] mb-2 pb-1.5 border-b border-[rgba(100,255,202,0.1)] font-mono">
                    <span className="text-[#64FFCA] font-semibold">{m.source}</span>
                    <span>{m.timestamp}</span>
                  </div>
                )}

                {/* Formatted Message with parsed headings, bold, and list bullets */}
                <FormattedMessage text={m.text} />
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0A100E] border border-[#00D68F]/30 flex items-center justify-center text-[#64FFCA]">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[#0D1713] border border-[rgba(100,255,202,0.12)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#008F62] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-bounce delay-100" />
              <span className="w-2 h-2 rounded-full bg-[#64FFCA] animate-bounce delay-200" />
              <span className="text-xs text-[#91A69B] ml-2">Reasoning with student syllabus context...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input bar - Pinned at bottom of the view with full width horizontal alignment */}
      <NexusCard
        tiltEffect={false}
        glowColor="rgba(0, 214, 143, 0.25)"
        className="shrink-0 mb-1 sm:mb-2 shadow-2xl border border-[rgba(100,255,202,0.2)] bg-[#0D1713]"
        contentClassName="p-2 sm:p-2.5 flex items-center gap-3 w-full"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend('general')}
          placeholder="Ask a question, request concept breakdown, or generate a sprint plan..."
          className="flex-1 px-3 py-2 bg-transparent text-xs sm:text-sm text-[#F3FFF9] placeholder-[#91A69B] focus:outline-none min-w-0"
        />

        <div className="shrink-0">
          <NexusButton
            size="sm"
            variant="primary"
            onClick={() => handleSend('general')}
            disabled={!inputPrompt.trim() || isLoading}
            icon={<Send className="w-4 h-4 text-white" />}
          >
            Ask AI
          </NexusButton>
        </div>
      </NexusCard>
    </div>
  );
};
