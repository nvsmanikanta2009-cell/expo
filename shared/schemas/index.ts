import { z } from 'zod';

export const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Please enter a valid email address' })
    .max(255, { message: 'Email cannot exceed 255 characters' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(128, { message: 'Password cannot exceed 128 characters' }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' }),
});

export const accessibilityProfileSchema = z.object({
  visualAssistance: z.boolean().default(false),
  hearingAssistance: z.boolean().default(false),
  cognitiveAssistance: z.boolean().default(false),
  readingAssistance: z.boolean().default(false),
  languageAssistance: z.boolean().default(false),
  screenReaderMode: z.boolean().default(false),
  preferredLanguage: z.string().trim().min(1).default('English'),
});

export const taskEnum = z.enum([
  'simplify',
  'summarize',
  'explain',
  'screen_reader',
  'image_description',
  'accessibility_analysis',
  'translate',
]);

export const accessibilityNeedEnum = z.enum([
  'visual',
  'hearing',
  'cognitive',
  'reading',
  'language',
  'motor',
  'general',
]);

export const transformationRequestSchema = z.object({
  content: z
    .string()
    .min(1, { message: 'Content cannot be empty' })
    .max(25000, { message: 'Content exceeds maximum length of 25,000 characters' }),
  task: taskEnum,
  accessibilityNeed: accessibilityNeedEnum,
  language: z.string().trim().min(1).default('English'),
  additionalInstructions: z.string().max(1000).optional().default(''),
  imageBase64: z.string().optional(),
});

// AI Output validation schemas
export const simplifyResponseSchema = z.object({
  task: z.literal('simplify'),
  result: z.string().min(1),
  explanation: z.string().min(1),
  accessibilityScore: z.number().int().min(0).max(100),
  suggestions: z.array(z.string()).default([]),
});

export const summarizeResponseSchema = z.object({
  task: z.literal('summarize'),
  result: z.string().min(1),
  keyPoints: z.array(z.string()).default([]),
  explanation: z.string().min(1),
  accessibilityScore: z.number().int().min(0).max(100),
  suggestions: z.array(z.string()).default([]),
});

export const explainResponseSchema = z.object({
  task: z.literal('explain'),
  result: z.string().min(1),
  importantTerms: z.array(
    z.object({
      term: z.string(),
      meaning: z.string(),
    })
  ).default([]),
  accessibilityScore: z.number().int().min(0).max(100),
  suggestions: z.array(z.string()).default([]),
});

export const screenReaderResponseSchema = z.object({
  task: z.literal('screen_reader'),
  result: z.string().min(1),
  structure: z.array(
    z.object({
      heading: z.string(),
      content: z.string(),
    })
  ).default([]),
  accessibilityScore: z.number().int().min(0).max(100),
  suggestions: z.array(z.string()).default([]),
});

export const imageDescriptionResponseSchema = z.object({
  task: z.literal('image_description'),
  altText: z.string().min(1),
  detailedDescription: z.string().min(1),
  accessibilityScore: z.number().int().min(0).max(100),
  suggestions: z.array(z.string()).default([]),
});

export const accessibilityAnalysisResponseSchema = z.object({
  task: z.literal('accessibility_analysis'),
  accessibilityScore: z.number().int().min(0).max(100),
  strengths: z.array(z.string()).default([]),
  issues: z.array(
    z.object({
      issue: z.string(),
      severity: z.enum(['low', 'medium', 'high']),
      recommendation: z.string(),
    })
  ).default([]),
  suggestions: z.array(z.string()).default([]),
});

export const translateResponseSchema = z.object({
  task: z.literal('translate'),
  sourceLanguage: z.string().default('English'),
  targetLanguage: z.string(),
  result: z.string().min(1),
  accessibilityScore: z.number().int().min(0).max(100),
  suggestions: z.array(z.string()).default([]),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AccessibilityProfileInput = z.infer<typeof accessibilityProfileSchema>;
export type TransformationRequestInput = z.infer<typeof transformationRequestSchema>;
