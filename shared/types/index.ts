export type TaskType = 
  | 'simplify'
  | 'summarize'
  | 'explain'
  | 'screen_reader'
  | 'image_description'
  | 'accessibility_analysis'
  | 'translate';

export type AccessibilityNeed = 
  | 'visual'
  | 'hearing'
  | 'cognitive'
  | 'reading'
  | 'language'
  | 'motor'
  | 'general';

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccessibilityProfile {
  id: string;
  userId: string;
  visualAssistance: boolean;
  hearingAssistance: boolean;
  cognitiveAssistance: boolean;
  readingAssistance: boolean;
  languageAssistance: boolean;
  screenReaderMode: boolean;
  preferredLanguage: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportantTerm {
  term: string;
  meaning: string;
}

export interface ScreenReaderSection {
  heading: string;
  content: string;
}

export interface AccessibilityIssue {
  issue: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface AIResultBase {
  task: TaskType;
  accessibilityScore: number;
  suggestions: string[];
}

export interface SimplifyResult extends AIResultBase {
  task: 'simplify';
  result: string;
  explanation: string;
}

export interface SummarizeResult extends AIResultBase {
  task: 'summarize';
  result: string;
  keyPoints: string[];
  explanation: string;
}

export interface ExplainResult extends AIResultBase {
  task: 'explain';
  result: string;
  importantTerms: ImportantTerm[];
  accessibilityScore: number;
  suggestions: string[];
}

export interface ScreenReaderResult extends AIResultBase {
  task: 'screen_reader';
  result: string;
  structure: ScreenReaderSection[];
}

export interface ImageDescriptionResult extends AIResultBase {
  task: 'image_description';
  altText: string;
  detailedDescription: string;
}

export interface AccessibilityAnalysisResult extends AIResultBase {
  task: 'accessibility_analysis';
  strengths: string[];
  issues: AccessibilityIssue[];
}

export interface TranslateResult extends AIResultBase {
  task: 'translate';
  sourceLanguage: string;
  targetLanguage: string;
  result: string;
}

export type AITransformationResult =
  | SimplifyResult
  | SummarizeResult
  | ExplainResult
  | ScreenReaderResult
  | ImageDescriptionResult
  | AccessibilityAnalysisResult
  | TranslateResult;

export interface TransformationRecord {
  id: string;
  userId: string;
  task: TaskType;
  accessibilityNeed: AccessibilityNeed;
  language: string;
  originalContent: string;
  transformedContent: string | null;
  explanation: string | null;
  accessibilityScore: number | null;
  aiSuggestions: any;
  createdAt: string;
}

export interface TransformationStats {
  totalTransformations: number;
  averageScore: number;
  mostFrequentTask: string | null;
  tasksBreakdown: Record<string, number>;
}
