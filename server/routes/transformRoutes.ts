import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { optionalAuth, AuthenticatedRequest } from '../auth/index.js';
import { aiService } from '../ai/index.js';
import { fetchWebpageContent } from '../services/urlFetcher.js';
import { transformationRequestSchema } from '../../shared/schemas/index.js';
import { z } from 'zod';

const router = Router();

// POST /api/transform
router.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = transformationRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Invalid transformation parameters',
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const {
      content,
      task,
      accessibilityNeed,
      language,
      additionalInstructions,
      imageBase64,
    } = parseResult.data;

    // Call Gemini AI
    const aiResult = await aiService.transformContent({
      task,
      accessibilityNeed,
      language,
      content,
      additionalInstructions,
      imageBase64,
    });

    // If user is authenticated and autoSave is requested (or default true)
    let savedRecord = null;
    const shouldSave = req.body.save !== false;
    if (req.user && shouldSave) {
      let transformedContentText = '';
      if ('result' in aiResult && typeof aiResult.result === 'string') {
        transformedContentText = aiResult.result;
      } else if ('altText' in aiResult) {
        transformedContentText = `Alt Text: ${aiResult.altText}\n\nDescription: ${aiResult.detailedDescription}`;
      } else if (task === 'accessibility_analysis') {
        transformedContentText = `Score: ${aiResult.accessibilityScore}/100\nStrengths: ${(aiResult as any).strengths?.join(', ')}`;
      }

      let explanationText = (aiResult as any).explanation || '';

      savedRecord = await db.createTransformation({
        userId: req.user.id,
        task,
        accessibilityNeed,
        language,
        originalContent: content,
        transformedContent: transformedContentText,
        explanation: explanationText,
        accessibilityScore: aiResult.accessibilityScore,
        aiSuggestions: aiResult,
      });
    }

    res.status(200).json({
      success: true,
      data: aiResult,
      savedRecord,
      message: 'Content transformed successfully',
    });
  } catch (err: any) {
    console.error('Transformation error:', err);
    res.status(500).json({
      error: 'Transformation failed',
      message: err.message || 'An unexpected error occurred while processing content',
    });
  }
});

// POST /api/transform/save - Explicitly save a transformation result for authenticated user
router.post('/save', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Please log in to save transformations to your history.' });
      return;
    }

    const saveSchema = z.object({
      task: z.string(),
      accessibilityNeed: z.string(),
      language: z.string().default('English'),
      originalContent: z.string(),
      transformedContent: z.string().nullable().optional(),
      explanation: z.string().nullable().optional(),
      accessibilityScore: z.number().nullable().optional(),
      aiSuggestions: z.any().optional(),
    });

    const parsed = saveSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid save payload', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const saved = await db.createTransformation({
      userId: req.user.id,
      task: parsed.data.task as any,
      accessibilityNeed: parsed.data.accessibilityNeed as any,
      language: parsed.data.language,
      originalContent: parsed.data.originalContent,
      transformedContent: parsed.data.transformedContent || null,
      explanation: parsed.data.explanation || null,
      accessibilityScore: parsed.data.accessibilityScore ?? null,
      aiSuggestions: parsed.data.aiSuggestions || null,
    });

    res.status(201).json({ success: true, record: saved });
  } catch (err: any) {
    console.error('Error saving transformation:', err);
    res.status(500).json({ error: 'Failed to save transformation record' });
  }
});

// POST /api/fetch-url - Extract readable content from a URL
router.post('/fetch-url', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'Valid URL is required' });
      return;
    }

    const extracted = await fetchWebpageContent(url);
    res.status(200).json(extracted);
  } catch (err: any) {
    console.error('URL fetch error:', err);
    res.status(400).json({ error: err.message || 'Failed to extract content from URL' });
  }
});

export default router;
