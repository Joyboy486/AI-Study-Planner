# FocusFlow — AI Study Planner

FocusFlow is a premium, full-stack AI-powered student productivity platform built with the **Midnight Aurora** visual identity. It features an interactive **Focus Universe** orbital course visualization, a distraction-free **Pomodoro Focus Room** with synthesized ambient audio, an intelligent **AI Study Companion** powered by Gemini 3.8 Flash, a calendar/task planner, and comprehensive progress analytics.

---

## 1. Quick Start & Execution

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- (Optional) MongoDB running locally or on MongoDB Atlas (if not present, FocusFlow automatically uses its resilient embedded storage fallback without crashing).

### Windows PowerShell Commands

```powershell
# 1. Clone repository & navigate to directory
cd focusflow

# 2. Install all dependencies
npm install

# 3. Copy environment configuration
cp .env.example .env

# 4. Start the full-stack development server (Express backend + Vite client on port 3000)
npm run dev
```

The application will be live at `http://localhost:3000`.

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Design System**: Midnight Aurora (`#08090F`, Electric Violet `#A78BFA`, Soft Cyan `#67E8F9`, Neon Lavender `#C4B5FD`)
- **Typography**: Plus Jakarta Sans & JetBrains Mono (`tabular-nums`)
- **Charts**: Recharts (Weekly velocity bar charts, daily area charts, subject donut distribution)
- **Audio**: Web Audio API (native real-time synthesis of alpha wave binaural beats, white noise, and rain)
- **Backend**: Node.js, Express.js, TypeScript (running via `tsx server.ts`)
- **Database**: MongoDB with Mongoose + Embedded High-Performance In-Memory/JSON fallback
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing
- **AI Integration**: Google GenAI SDK (`@google/genai`) using `gemini-3.8-flash` on server proxy with cognitive heuristics fallback

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env`:

```env
# GEMINI_API_KEY: Gemini API Key for AI Study Companion
GEMINI_API_KEY="your-gemini-api-key-here"

# MONGODB_URI: MongoDB connection string
MONGODB_URI="mongodb://127.0.0.1:27017/focusflow"

# JWT_SECRET: Secret key for signing authentication tokens
JWT_SECRET="focusflow-production-jwt-secret-replace-in-production"

# PORT: Server port
PORT=3000
```

---

## 4. MongoDB Setup Instructions

1. **Option A: Local MongoDB Community Edition**
   - Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community).
   - Start the service:
     ```powershell
     net start MongoDB
     ```
   - Set `MONGODB_URI="mongodb://127.0.0.1:27017/focusflow"` in your `.env`.

2. **Option B: MongoDB Atlas (Cloud)**
   - Create a free cluster on [cloud.mongodb.com](https://cloud.mongodb.com).
   - Get the connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/focusflow?retryWrites=true&w=majority`.
   - Paste it into `MONGODB_URI` in `.env`.

3. **Option C: Zero-Config Embedded Fallback**
   - If MongoDB is unreachable, FocusFlow's dual-mode data layer detects it and runs on an embedded in-memory JSON data store.
   - All CRUD actions, session logs, tasks, and analytics persist throughout the runtime session with zero crashes.

---

## 5. Gemini AI Setup Instructions

1. Obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/).
2. In AI Studio Build, this key is automatically injected into `process.env.GEMINI_API_KEY`.
3. For standalone deployment, add `GEMINI_API_KEY="AIzaSy..."` to your `.env` file.
4. If no key is provided, FocusFlow automatically activates its built-in cognitive academic heuristics engine, allowing all prompt actions ("Plan my day", "Break down my assignment", "Generate a quiz") to continue functioning smoothly.

---

## 6. Authentication & Demo Mode

FocusFlow supports two seamless modes:
1. **Authenticated Accounts**: Register with email and securely hashed password (`bcrypt`). Private database operations are strictly scoped by JWT `userId`.
2. **Instant Demo Mode**: Click **"Explore Demo Student Account"** on the Sign In modal to instantly launch pre-seeded university coursework (Machine Learning, Distributed Systems, Linear Algebra, Neuroscience), with 7 days of historical study velocity, active tasks, and pre-computed streaks.

---

## 7. Features Implemented

1. **Midnight Aurora Visual Identity**: Sophisticated almost-black canvas (`#08090F`), electric violet and neon lavender accents, glassmorphic cards, and tabular figures.
2. **Overview Dashboard**:
   - Personalized student greeting & daily inspirational quote.
   - Today's Focus circular progress ring.
   - Daily Tasks counter & inline completion toggle.
   - Focus Streak with 7-day consistency bar.
   - Vertical timeline of today's study sessions and planned tasks.
   - Recharts Weekly Focus velocity chart with week-over-week comparison insight.
   - Upcoming deadlines with urgency countdowns.
   - Quick action shortcuts.
3. **Signature Feature: Focus Universe**:
   - Atmospheric celestial canvas where subjects orbit a central "Focus Core".
   - Planetary mass scales with completed study hours.
   - Configurable orbital rotation speed (Slow, Normal, Fast, Frozen).
   - Hover tooltips and click-to-launch detail modal.
4. **My Subjects**:
   - Course CRUD with color halo picker, weekly targets, and priority weighting.
   - Attention warning system if exams approach (<14 days) and targets are unmet.
   - Search & priority filters.
5. **Smart Study Planner**:
   - Dual view: Task List and 7-day Column Calendar view.
   - Task filtering by subject, status (pending/completed), and priority.
   - Quick "Start Focus Timer on this Task" integration.
6. **Pomodoro Focus Room**:
   - Timestamp-driven drift-free timer (25m Deep Work, 5m Short Break, 15m Long Break).
   - Web Audio API synthesizer: Alpha Wave binaural beats (10Hz focus frequency), rain generator, brown noise, and audio chimes.
   - Browser notification permissions.
   - Auto-logging of completed sessions into database and subject hours.
7. **AI Study Companion**:
   - Powered by `gemini-3.8-flash` on server proxy.
   - Prompt chips: "Plan my day", "What should I study next?", "Break down my assignment", "Help me revise", "Generate a quiz".
   - Context injection with user's actual registered courses and pending assignments.
   - Lecture notes synthesis tool.
8. **Progress Analytics**:
   - Total study hours, streak history, goal completion percentage.
   - Recharts daily area chart and course distribution pie chart.
9. **Workspace Settings & Diagnostics**:
   - Focus duration customization.
   - Live database status indicator (`MongoDB Active` vs `Embedded Mode`).
   - One-click demo data reset.
