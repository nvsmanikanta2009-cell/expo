import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import {
  TaskType,
  AccessibilityNeed,
  AITransformationResult,
} from '../../shared/types/index.js';
import {
  simplifyResponseSchema,
  summarizeResponseSchema,
  explainResponseSchema,
  screenReaderResponseSchema,
  imageDescriptionResponseSchema,
  accessibilityAnalysisResponseSchema,
  translateResponseSchema,
} from '../../shared/schemas/index.js';

dotenv.config();

const SYSTEM_PROMPT = `You are an AI Accessibility and Inclusion Assistant.

Your purpose is to make digital information easier to access, understand, navigate, and use.

You must prioritize:
1. Clarity
2. Accuracy
3. Inclusiveness
4. Accessibility
5. Plain language
6. Respectful terminology
7. Preservation of important meaning

Never make assumptions about a person's disability.
Never use insulting, discriminatory, or stereotypical language.
Do not describe accessibility as something that makes a person "less capable."
Focus on removing barriers from information and technology.
When simplifying content, preserve important facts.
Do not invent information that does not exist in the source.
When information is unclear, explicitly identify uncertainty.
When generating image descriptions, describe only information that can reasonably be inferred from the image.
Do not claim that content is officially WCAG compliant.
Accessibility scores must be described as AI-generated estimates rather than official certifications.
Use respectful, person-centered or identity-respecting language depending on the context.
Prefer short sentences, clear headings, lists, and logical structure.
Make the output suitable for screen readers when screen-reader optimization is requested.
Always return valid JSON without extra markdown wrapping unless enclosed in a single JSON block.`;

export class AIService {
  private client: GoogleGenAI | null = null;
  private apiKey: string;
  // Models in priority order
  private models = ['gemini-3.8-flash', 'gemini-flash-lite-latest', 'gemini-3.5-flash'];

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (this.apiKey) {
      try {
        this.client = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (err) {
        console.error('Failed to initialize GoogleGenAI client:', err);
      }
    } else {
      console.warn('GEMINI_API_KEY is not defined in environment variables');
    }
  }

  private buildPrompt(params: {
    task: TaskType;
    accessibilityNeed: AccessibilityNeed;
    language: string;
    content: string;
    additionalInstructions?: string;
  }): string {
    const { task, accessibilityNeed, language, content, additionalInstructions } = params;

    const baseContext = `Target Accessibility Need: ${accessibilityNeed.toUpperCase()}
Preferred Language: ${language}
${additionalInstructions ? `User Additional Instructions: ${additionalInstructions}\n` : ''}
Original Content:
"""
${content}
"""`;

    switch (task) {
      case 'simplify':
        return `${baseContext}

TASK: SIMPLIFY
Rewrite the original content into clear, plain language while preserving all critical meaning, context, and facts. Shorten long sentences, unpack jargon, and structure the content with easy-to-read paragraphs.
Calculate an AI-estimated accessibility score between 0 and 100 based on clarity, readability, and cognitive accessibility.

Return ONLY a JSON object with this exact structure:
{
  "task": "simplify",
  "result": "<simplified accessible text>",
  "explanation": "<short explanation of key changes made and accessibility benefit>",
  "accessibilityScore": <integer 0-100>,
  "suggestions": [
    "<actionable accessibility improvement suggestion 1>",
    "<actionable accessibility improvement suggestion 2>"
  ]
}`;

      case 'summarize':
        return `${baseContext}

TASK: ACCESSIBLE SUMMARY
Generate a concise, accessible summary of the original content. Extract key points as clear bullet points.
Calculate an AI-estimated accessibility score between 0 and 100 based on information density, hierarchy, and clarity.

Return ONLY a JSON object with this exact structure:
{
  "task": "summarize",
  "result": "<cohesive accessible summary paragraph>",
  "keyPoints": [
    "<key takeaway 1>",
    "<key takeaway 2>",
    "<key takeaway 3>"
  ],
  "explanation": "<explanation of how this summary aids cognitive accessibility and quick navigation>",
  "accessibilityScore": <integer 0-100>,
  "suggestions": [
    "<suggestion 1>",
    "<suggestion 2>"
  ]
}`;

      case 'explain':
        return `${baseContext}

TASK: EXPLAIN DIFFICULT CONTENT
Explain the source content in straightforward, relatable language. Identify technical terms, acronyms, or complex vocabulary, and create a mini-glossary of important terms with clear explanations.
Calculate an AI-estimated accessibility score between 0 and 100.

Return ONLY a JSON object with this exact structure:
{
  "task": "explain",
  "result": "<plain language explanation>",
  "importantTerms": [
    { "term": "<difficult term 1>", "meaning": "<plain meaning>" },
    { "term": "<difficult term 2>", "meaning": "<plain meaning>" }
  ],
  "accessibilityScore": <integer 0-100>,
  "suggestions": [
    "<suggestion 1>",
    "<suggestion 2>"
  ]
}`;

      case 'screen_reader':
        return `${baseContext}

TASK: SCREEN READER OPTIMIZATION
Restructure the content so it can be navigated cleanly by screen reader users. Use descriptive headings, logical hierarchy, short structured sections, descriptive lists, and clear linear reading order.
Calculate an AI-estimated accessibility score between 0 and 100 based on structural clarity, semantic hierarchy, and screen reader friendliness.

Return ONLY a JSON object with this exact structure:
{
  "task": "screen_reader",
  "result": "<screen reader formatted text with headings and lists>",
  "structure": [
    { "heading": "<Section 1 Heading>", "content": "<Section 1 content>" },
    { "heading": "<Section 2 Heading>", "content": "<Section 2 content>" }
  ],
  "accessibilityScore": <integer 0-100>,
  "suggestions": [
    "<screen reader navigation suggestion 1>",
    "<screen reader navigation suggestion 2>"
  ]
}`;

      case 'image_description':
        return `${baseContext}

TASK: IMAGE DESCRIPTION & ALT TEXT
Generate both a concise alternative text (alt text suitable for HTML \`alt\` attributes, max 125 chars) and an in-depth detailed description explaining all meaningful visual elements, context, readable text, and layout without speculating.
Calculate an AI-estimated accessibility score between 0 and 100 based on descriptive precision and alt text quality.

Return ONLY a JSON object with this exact structure:
{
  "task": "image_description",
  "altText": "<concise alt text suitable for alt tag>",
  "detailedDescription": "<thorough, objective description of visual elements, text, and scene>",
  "accessibilityScore": <integer 0-100>,
  "suggestions": [
    "<suggestion 1>",
    "<suggestion 2>"
  ]
}`;

      case 'accessibility_analysis':
        return `${baseContext}

TASK: ACCESSIBILITY ANALYSIS & AUDIT
Analyze the digital content for accessibility barriers according to WCAG-inspired principles (Perceivable, Operable, Understandable, Robust).
Evaluate readability, structure, clarity, language complexity, heading organization, and inclusiveness.
Identify strengths and concrete issues with severity ('low', 'medium', or 'high') and actionable recommendations.
Calculate an AI-estimated accessibility score between 0 and 100 (label clearly as an estimate, not a certification).

Return ONLY a JSON object with this exact structure:
{
  "task": "accessibility_analysis",
  "accessibilityScore": <integer 0-100>,
  "strengths": [
    "<accessibility strength 1>",
    "<accessibility strength 2>"
  ],
  "issues": [
    {
      "issue": "<barrier or problem identified>",
      "severity": "<low | medium | high>",
      "recommendation": "<how to fix or improve this>"
    }
  ],
  "suggestions": [
    "<strategic suggestion 1>",
    "<strategic suggestion 2>"
  ]
}`;

      case 'translate':
        return `${baseContext}

TASK: ACCESSIBLE TRANSLATION
Translate the original content accurately into ${language}. Ensure the translated version adheres to plain-language accessibility standards in ${language}, maintaining easy readability, cultural respectfulness, and natural flow.
Calculate an AI-estimated accessibility score between 0 and 100.

Return ONLY a JSON object with this exact structure:
{
  "task": "translate",
  "sourceLanguage": "<detected source language>",
  "targetLanguage": "${language}",
  "result": "<accessible translation in target language>",
  "accessibilityScore": <integer 0-100>,
  "suggestions": [
    "<translation accessibility suggestion 1>",
    "<translation accessibility suggestion 2>"
  ]
}`;

      default:
        throw new Error(`Unsupported task: ${task}`);
    }
  }

  private cleanJsonString(raw: string): string {
    let clean = raw.trim();
    // Remove markdown code fences if present
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return clean.trim();
  }

  private validateOutput(task: TaskType, parsed: any): AITransformationResult {
    switch (task) {
      case 'simplify':
        return simplifyResponseSchema.parse(parsed) as AITransformationResult;
      case 'summarize':
        return summarizeResponseSchema.parse(parsed) as AITransformationResult;
      case 'explain':
        return explainResponseSchema.parse(parsed) as AITransformationResult;
      case 'screen_reader':
        return screenReaderResponseSchema.parse(parsed) as AITransformationResult;
      case 'image_description':
        return imageDescriptionResponseSchema.parse(parsed) as AITransformationResult;
      case 'accessibility_analysis':
        return accessibilityAnalysisResponseSchema.parse(parsed) as AITransformationResult;
      case 'translate':
        return translateResponseSchema.parse(parsed) as AITransformationResult;
      default:
        throw new Error(`Unknown task for validation: ${task}`);
    }
  }

  async transformContent(params: {
    task: TaskType;
    accessibilityNeed: AccessibilityNeed;
    language: string;
    content: string;
    additionalInstructions?: string;
    imageBase64?: string;
  }): Promise<AITransformationResult> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the server. Please add GEMINI_API_KEY to .env');
    }

    const promptText = this.buildPrompt(params);

    let lastError: Error | null = null;

    // Try candidate models with graceful fallback
    for (const model of this.models) {
      try {
        const contentsPayload: any[] = [];

        // If multimodal image data is present
        if (params.imageBase64 && params.task === 'image_description') {
          // Extract mime type and base64 data
          const matches = params.imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
          if (matches) {
            const mimeType = matches[1];
            const data = matches[2];
            contentsPayload.push({
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data,
                  },
                },
                { text: `${SYSTEM_PROMPT}\n\n${promptText}` },
              ],
            });
          } else {
            contentsPayload.push({
              role: 'user',
              parts: [{ text: `${SYSTEM_PROMPT}\n\n${promptText}` }],
            });
          }
        } else {
          contentsPayload.push({
            role: 'user',
            parts: [{ text: `${SYSTEM_PROMPT}\n\n${promptText}` }],
          });
        }

        // Call Gemini API via fetch with timeout to prevent hanging
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: contentsPayload,
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errBody = await response.text();
          console.warn(`Model ${model} returned HTTP ${response.status}:`, errBody.slice(0, 200));
          // If 404 (model deprecated) or 503 (demand spike) or 429 (rate limit), continue to next model
          if (response.status === 404 || response.status === 503 || response.status === 429) {
            continue;
          }
          throw new Error(`Gemini API error (${response.status}): ${errBody.slice(0, 150)}`);
        }

        const data: any = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
          throw new Error('Empty response received from Gemini model');
        }

        const cleaned = this.cleanJsonString(rawText);
        const parsed = JSON.parse(cleaned);

        // Ensure task property is aligned
        if (!parsed.task) {
          parsed.task = params.task;
        }

        // Validate strictly using Zod
        const validated = this.validateOutput(params.task, parsed);
        return validated;
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt with model ${model} failed:`, err.message);
        // Continue to fallback model
      }
    }

    throw new Error(
      `All Gemini AI models were unable to process the request. ${lastError ? lastError.message : 'Please check network and API quotas.'}`
    );
  }
}

export const aiService = new AIService();
