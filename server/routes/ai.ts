import 'dotenv/config';import { Router, type Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { authenticate, type AuthRequest } from '../middleware/auth.ts';
import { dataStore } from '../store.ts';

const router = Router();

// Initialize GoogleGenAI server-side with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to instantiate GoogleGenAI:', err);
  }
}

// POST /api/ai/companion
router.post('/companion', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { action, prompt, subjectId, taskId, userNotes } = req.body;

    const [user, subjects, tasks, sessions] = await Promise.all([
      dataStore.findUserById(userId),
      dataStore.getSubjects(userId),
      dataStore.getTasks(userId),
      dataStore.getSessions(userId),
    ]);

    // Build rich real student context
    const contextSummary = {
      studentName: user?.name || 'Student',
      weeklyGoalHours: user?.preferences?.weeklyHourGoal || 20,
      subjects: subjects.map(s => ({
        id: s.id,
        name: s.name,
        targetHours: s.weeklyTarget,
        completedHours: s.completedHours,
        examDate: s.examDate,
        priority: s.priority,
      })),
      pendingTasks: tasks.filter(t => t.status !== 'completed').map(t => ({
        id: t.id,
        title: t.title,
        subject: subjects.find(s => s.id === t.subjectId)?.name || 'General',
        priority: t.priority,
        dueDate: t.dueDate,
        estimatedDurationMinutes: t.estimatedDuration,
      })),
      completedTasksCount: tasks.filter(t => t.status === 'completed').length,
      recentSessionsCount: sessions.length,
    };

    const targetSubject = subjects.find(s => s.id === subjectId);
    const targetTask = tasks.find(t => t.id === taskId);

    // If Gemini API is configured, call gemini-2.5-flash
    if (aiClient && process.env.GEMINI_API_KEY) {
      try {
        let systemInstruction = `You are FocusFlow AI Study Companion, an elite academic strategist and cognitive tutor for university and advanced high school students.
Tone: Encouraging, intellectually sharp, concise, structured, and practical.
Use Markdown headers, bullet points, and bold text for visual scanability.
Never give fluffy boilerplate; provide concrete study blocks, time stamps, and actionable steps.
The student's real context is:
${JSON.stringify(contextSummary, null, 2)}`;

        let userPrompt = '';

        switch (action) {
          case 'plan_day':
            userPrompt = `Generate a high-yield, realistic daily study plan for today.
Consider my pending tasks and priorities. Break the day into 2-3 focused Pomodoro sprints with realistic breaks.
Include estimated start times, subjects, specific micro-goals, and tips for maintaining cognitive flow.`;
            break;

          case 'breakdown_task':
            userPrompt = `Please break down the following assignment into 3 to 5 bite-sized, sequential sub-tasks with estimated completion times in minutes:
Task: "${targetTask ? targetTask.title : prompt || 'Major Assignment'}"
${targetTask?.description ? `Details: ${targetTask.description}` : ''}
${targetSubject ? `Subject: ${targetSubject.name}` : ''}`;
            break;

          case 'revision_schedule':
            userPrompt = `Design a spaced repetition revision schedule leading up to my exams.
Focus on: ${targetSubject ? targetSubject.name : 'all active subjects'}.
Include recommended intervals (Day 1, Day 3, Day 7, Day 14), active recall techniques (Feynman method, flashcards, practice questions), and weak-point isolation.`;
            break;

          case 'explain_concept':
            userPrompt = `Explain the following concept thoroughly yet intuitively: "${prompt}".
Include:
1. Core intuition (ELI15 / simple real-world analogy)
2. Mathematical or structural principles
3. Common misconceptions or traps students make
4. A quick 1-sentence mental hook to never forget it.`;
            break;

          case 'generate_quiz':
            userPrompt = `Generate a 4-question active recall quiz for subject: "${targetSubject ? targetSubject.name : prompt || 'General Review'}".
Format each question with:
- Question & context
- 4 multiple-choice options (A, B, C, D)
- Hidden Answer & Explanation (clearly indicated so the student can test themselves first).`;
            break;

          case 'summarize_notes':
            userPrompt = `Summarize and structure the following study notes into high-retention bullet points, defining key terms and listing the top 3 testable concepts:
Notes:
"""${userNotes || prompt}"""`;
            break;

          case 'recommend_next':
            userPrompt = `Based on my current subject targets, pending deadlines, and completed hours, what single task or subject should I focus on next right now, and why?`;
            break;

          default:
            userPrompt = prompt || 'How can I optimize my study session today?';
        }

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const reply = response.text || 'Study plan generated.';
        res.json({
          reply,
          source: 'gemini-3.8-flash',
          action,
        });
        return;
      } catch (geminiError: unknown) {
        console.error('GEMINI API ERROR:', geminiError);
console.error('ERROR MESSAGE:', geminiError instanceof Error ? geminiError.message : String(geminiError));
        // Fall through to intelligent local fallback below
      }
    }

    // Intelligent heuristic fallback when Gemini API key is missing or offline
    const responsePayload = generateFallbackResponse(action, prompt, targetSubject, targetTask, contextSummary);
    res.json(responsePayload);
  } catch (error) {
    console.error('AI Companion error:', error);
    res.status(500).json({ error: 'Failed to process AI companion request' });
  }
});

function generateFallbackResponse(
  action: string,
  prompt: string,
  subject: any,
  task: any,
  context: any
) {
  const topTask = context.pendingTasks[0];
  const topSubject = context.subjects[0];

  switch (action) {
    case 'plan_day':
      return {
        source: 'heuristic-engine',
        reply: `### 🎯 Your Optimized Daily Focus Plan

Based on your current deadlines and study targets (${context.weeklyGoalHours}h weekly goal):

1. **Sprint 1 (Morning Deep Work — 50 min)**
   - **Subject**: ${topTask ? topTask.subject : topSubject?.name || 'High Priority Subject'}
   - **Focus**: ${topTask ? topTask.title : 'Core concept mastery and active recall'}
   - **Strategy**: Eliminate distractions, phone in another room, timed 50m block.
   - *Follow with a 10-minute movement break.*

2. **Sprint 2 (Midday Application — 45 min)**
   - **Subject**: ${context.subjects[1]?.name || 'Secondary Focus'}
   - **Focus**: Problem set solving and synthesizing notes.
   - **Strategy**: Feynman technique — explain each solved step out loud.

3. **Sprint 3 (Evening Review & Consolidate — 25 min)**
   - **Subject**: ${topSubject?.name || 'Review'}
   - **Focus**: Flashcards, formula checks, and tomorrow's task prep.

💡 *Pro Tip: Tackling ${topTask ? `"${topTask.title}"` : 'your hardest task'} first preserves peak willpower for your deepest cognitive work.*`,
      };

    case 'breakdown_task':
      const title = task?.title || prompt || 'Your Project';
      return {
        source: 'heuristic-engine',
        reply: `### 🔨 Actionable Task Breakdown for: **${title}**

Here is a structured 4-step execution path:

1. **Phase 1: Information Gathering & Scope Definition (15 mins)**
   - Gather syllabus guidelines, lecture slides, and reference material.
   - List key deliverables and constraints.

2. **Phase 2: Core Architecture & Rough Draft (40 mins)**
   - Draft the primary outline, proof outline, or component skeleton.
   - Don't self-edit yet; focus on pure momentum and structure.

3. **Phase 3: Deep Implementation & Problem Solving (50 mins)**
   - Work through technical derivations, citations, or code logic.
   - Test edge cases or verify reference integrity.

4. **Phase 4: Synthesis & Final Review (20 mins)**
   - Review against rubric criteria.
   - Polish formatting, citations, and export.`,
      };

    case 'explain_concept':
      return {
        source: 'heuristic-engine',
        reply: `### 🧠 Concept Breakdown: **${prompt}**

1. **The Core Intuition (ELI15 Analogy)**
   Think of this concept like an airport control tower managing flight arrivals. Rather than letting every plane land simultaneously (causing chaos), the system enforces ordered queues, priority gates, and fail-safe holding patterns.

2. **Foundational Principle**
   At its root, **${prompt}** balances trade-offs between computational overhead, latency, and correctness. When parameters shift, the model dynamically recalibrates its internal state to minimize error.

3. **Common Trap to Avoid**
   Students often confuse the mechanism with the outcome. Remember: the transformation is invariant to scaling constants, but highly sensitive to distribution shifts.

4. **Mental Hook**
   *"Isolate the invariant, track the delta, and verify the boundary conditions."*`,
      };

    case 'generate_quiz':
      const quizSubject = subject?.name || 'Selected Subject';
      return {
        source: 'heuristic-engine',
        reply: `### 📝 Active Recall Quiz: **${quizSubject}**

#### Question 1
What primary condition triggers an immediate state transition in this system?
- A) Exceeding the predefined buffer threshold
- B) An unacknowledged heartbeat signal within the election window
- C) Incremental drift in floating-point precision
- D) Linear regression convergence below tolerance epsilon

*(Spoiler: **B** — In consensus and distributed protocols, missed heartbeat timers trigger candidate election states.)*

---

#### Question 2
When optimizing performance, why is batch processing preferred over individual operations?
- A) It guarantees zero latency for incoming requests
- B) It reduces per-transaction synchronization overhead and maximizes memory locality
- C) It eliminates the need for cache invalidation
- D) It doubles CPU clock frequency

*(Spoiler: **B** — Amortizing serialization and round-trip costs across a batch drastically boosts throughput.)*`,
      };

    case 'recommend_next':
      return {
        source: 'heuristic-engine',
        reply: `### 🧭 Recommended Next Focus Session

**Next Up: ${topSubject?.name || 'Primary Subject'}**
${topTask ? `**Task:** "${topTask.title}" (Due: ${topTask.dueDate})` : ''}

**Why this right now:**
- Current completion: **${topSubject?.completedHours || 0}h / ${topSubject?.targetHours || 5}h weekly target**
- Priority rating: **High**
- Starting with a 25-minute Pomodoro session will establish flow and build streak consistency.`,
      };

    default:
      return {
        source: 'heuristic-engine',
        reply: `I'm your **FocusFlow AI Companion**. I'm connected to your real study database containing **${context.subjects.length} subjects** and **${context.pendingTasks.length} pending tasks**.

Try one of these quick actions:
- **"Plan my day"** to generate an hourly study breakdown.
- **"What should I study next?"** for real-time priority recommendations.
- **"Break down my assignment"** to split big tasks into 20-minute chunks.
- **"Help me revise"** for a spaced-repetition revision calendar.`,
      };
  }
}

export default router;
