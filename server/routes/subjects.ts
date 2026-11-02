import { Router, type Response } from 'express';
import { authenticate, type AuthRequest } from '../middleware/auth.ts';
import { dataStore } from '../store.ts';

const router = Router();

// GET /api/subjects
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const subjects = await dataStore.getSubjects(userId);
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// POST /api/subjects
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name, description, color, priority, weeklyTarget, examDate } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Subject name is required' });
      return;
    }

    const subject = await dataStore.createSubject(userId, {
      name: name.trim(),
      description: description ? description.trim() : '',
      color: color || '#A78BFA',
      priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
      weeklyTarget: Math.max(1, Number(weeklyTarget) || 5),
      examDate: examDate || undefined,
    });

    res.status(201).json(subject);
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// PUT /api/subjects/:id
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const updated = await dataStore.updateSubject(userId, id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Subject not found or unauthorized' });
      return;
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

// DELETE /api/subjects/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const success = await dataStore.deleteSubject(userId, id);
    if (!success) {
      res.status(404).json({ error: 'Subject not found or unauthorized' });
      return;
    }
    res.json({ message: 'Subject and associated tasks deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

export default router;
