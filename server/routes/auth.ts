import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dataStore, DEMO_USER_ID, seedDemoData } from '../store.ts';
import { generateToken, authenticate, type AuthRequest } from '../middleware/auth.ts';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    const existing = await dataStore.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await dataStore.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      preferences: {
        weeklyHourGoal: 20,
        focusDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        availableStudyHours: ['morning', 'evening'],
        soundEnabled: false,
        onboardingCompleted: false,
      },
    });

    const token = generateToken(user.id, user.email);
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await dataStore.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user.id, user.email);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// POST /api/auth/demo
router.post('/demo', async (_req: Request, res: Response): Promise<void> => {
  try {
    seedDemoData();
    const demoUser = await dataStore.findUserById(DEMO_USER_ID);
    if (!demoUser) {
      res.status(500).json({ error: 'Demo user initialization failed' });
      return;
    }

    const token = generateToken(demoUser.id, demoUser.email);
    res.json({
      token,
      isDemo: true,
      user: {
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        preferences: demoUser.preferences,
        createdAt: demoUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: 'Internal server error during demo setup' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const user = await dataStore.findUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      preferences: user.preferences,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
});

// PATCH /api/auth/preferences
router.patch('/preferences', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const updated = await dataStore.updateUserPreferences(userId, req.body);
    if (!updated) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      preferences: updated.preferences,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update user preferences' });
  }
});

export default router;
