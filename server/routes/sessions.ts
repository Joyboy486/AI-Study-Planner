import { Router, type Response } from 'express';
import { authenticate, type AuthRequest } from '../middleware/auth.ts';
import { dataStore } from '../store.ts';

const router = Router();

// GET /api/sessions
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const sessions = await dataStore.getSessions(userId);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch study sessions' });
  }
});

// POST /api/sessions
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { subjectId, taskId, duration, sessionType, notes, completionStatus, startTime, endTime } = req.body;

    if (!subjectId) {
      res.status(400).json({ error: 'Subject is required for study session' });
      return;
    }

    const session = await dataStore.createSession(userId, {
      subjectId,
      taskId: taskId || undefined,
      duration: Math.max(1, Number(duration) || 25),
      sessionType: ['focus', 'short_break', 'long_break'].includes(sessionType) ? sessionType : 'focus',
      completionStatus: completionStatus === 'abandoned' ? 'abandoned' : 'completed',
      notes: notes ? notes.trim() : '',
      startTime,
      endTime,
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating study session:', error);
    res.status(500).json({ error: 'Failed to record study session' });
  }
});

export default router;
