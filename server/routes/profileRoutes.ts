import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { requireAuth, AuthenticatedRequest } from '../auth/index.js';
import { accessibilityProfileSchema } from '../../shared/schemas/index.js';

const router = Router();

// GET /api/profile
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    let profile = await db.getProfile(userId);

    if (!profile) {
      // Create default if not found
      profile = await db.upsertProfile(userId, {
        visualAssistance: false,
        hearingAssistance: false,
        cognitiveAssistance: false,
        readingAssistance: false,
        languageAssistance: false,
        screenReaderMode: false,
        preferredLanguage: 'English',
      });
    }

    res.status(200).json({ profile });
  } catch (err: any) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to fetch accessibility profile' });
  }
});

// PUT /api/profile
router.put('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = accessibilityProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const userId = req.user!.id;
    const updated = await db.upsertProfile(userId, parseResult.data);

    res.status(200).json({
      profile: updated,
      message: 'Accessibility profile preferences saved successfully',
    });
  } catch (err: any) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update accessibility profile' });
  }
});

export default router;
