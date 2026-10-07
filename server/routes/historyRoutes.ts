import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { requireAuth, AuthenticatedRequest } from '../auth/index.js';

const router = Router();

// GET /api/history
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 50, 1), 100);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

    const history = await db.getTransformationsByUser(userId, limit, offset);
    res.status(200).json({ history });
  } catch (err: any) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Failed to fetch transformation history' });
  }
});

// GET /api/history/stats
router.get('/stats', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const stats = await db.getStatsByUser(userId);
    res.status(200).json({ stats });
  } catch (err: any) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to calculate user statistics' });
  }
});

// GET /api/history/:id
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id;

    // Strict ownership check
    const record = await db.getTransformationByIdAndUser(id, userId);
    if (!record) {
      res.status(404).json({ error: 'Transformation record not found' });
      return;
    }

    res.status(200).json({ transformation: record });
  } catch (err: any) {
    console.error('Error fetching history record:', err);
    res.status(500).json({ error: 'Failed to fetch transformation record' });
  }
});

// DELETE /api/history/:id
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id;

    // Strict ownership deletion
    const deleted = await db.deleteTransformationByIdAndUser(id, userId);
    if (!deleted) {
      res.status(404).json({ error: 'Transformation record not found or unauthorized' });
      return;
    }

    res.status(200).json({ success: true, message: 'Record deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting history record:', err);
    res.status(500).json({ error: 'Failed to delete transformation record' });
  }
});

export default router;
