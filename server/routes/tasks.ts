import { Router, type Response } from 'express';
import { authenticate, type AuthRequest } from '../middleware/auth.ts';
import { dataStore } from '../store.ts';

const router = Router();

// GET /api/tasks
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const tasks = await dataStore.getTasks(userId);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { title, subjectId, description, priority, dueDate, estimatedDuration, status } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Task title is required' });
      return;
    }

    if (!subjectId) {
      res.status(400).json({ error: 'Subject is required' });
      return;
    }

    const task = await dataStore.createTask(userId, {
      title: title.trim(),
      subjectId,
      description: description ? description.trim() : '',
      priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      estimatedDuration: Math.max(5, Number(estimatedDuration) || 30),
      status: ['pending', 'in_progress', 'completed'].includes(status) ? status : 'pending',
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const updated = await dataStore.updateTask(userId, id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Task not found or unauthorized' });
      return;
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const success = await dataStore.deleteTask(userId, id);
    if (!success) {
      res.status(404).json({ error: 'Task not found or unauthorized' });
      return;
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
