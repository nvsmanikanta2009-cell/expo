import React, { useState, useRef } from 'react';
import {
  Sparkles,
  BookOpen,
  Volume2,
  FileText,
  Eye,
  Languages,
  ShieldCheck,
  Globe,
  Upload,
  Mic,
  MicOff,
  Copy,
  Check,
  Save,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  FileUp,
  Image as ImageIcon,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Textarea } from '../components/ui/Textarea.js';
import { Input } from '../components/ui/Input.js';
import { Select } from '../components/ui/Select.js';
import { Alert } from '../components/ui/Alert.js';
import { AccessibilityScore } from '../components/ui/AccessibilityScore.js';
import { AudioPlayer } from '../components/ui/AudioPlayer.js';
import { useAuth } from '../context/AuthContext.js';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { TaskType, AccessibilityNeed, AITransformationResult } from '../../../shared/types/index.js';

type InputMode = 'text' | 'url' | 'document' | 'image';

export const WorkspacePage: React.FC = () => {
  const { user } = useAuth();
  const { profile, announce } = useAccessibility();

  // Input states
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [content, setContent] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);

  // Form configurations
  const [task, setTask] = useState<TaskType>('simplify');
  const [accessibilityNeed, setAccessibilityNeed] = useState<AccessibilityNeed>(
    profile?.screenReaderMode
      ? 'visual'
      : profile?.readingAssistance
      ? 'reading'
      : profile?.cognitiveAssistance
      ? 'cognitive'
      : 'general'
  );
  const [language, setLanguage] = useState<string>(profile?.preferredLanguage || 'English');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // Voice dictation state
  const [isListening, setIsListening] = useState(false);

  // Processing & Result states
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AITransformationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Task definitions
  const tasks: Array<{ id: TaskType; label: string; icon: React.ReactNode; desc: string }> = [
    {
      id: 'simplify',
      label: 'Simplify Text',
      icon: <BookOpen className="w-4 h-4" />,
      desc: 'Plain language, shorter sentences, easy to read',
    },
    {
      id: 'summarize',
      label: 'Accessible Summary',
      icon: <FileText className="w-4 h-4" />,
      desc: 'Key takeaways and bulleted points',
    },
    {
      id: 'explain',
      label: 'Explain Difficult Terms',
      icon: <HelpCircle className="w-4 h-4" />,
      desc: 'Plain explanations & glossary of difficult words',
    },
    {
      id: 'screen_reader',
      label: 'Screen Reader Structure',
      icon: <Volume2 className="w-4 h-4" />,
      desc: 'Hierarchical headings and clean reading flow',
    },
    {
      id: 'image_description',
      label: 'Image Description',
      icon: <Eye className="w-4 h-4" />,
      desc: 'Objective alt-text and detailed visual description',
    },
    {
      id: 'accessibility_analysis',
      label: 'Accessibility Audit',
      icon: <ShieldCheck className="w-4 h-4" />,
      desc: 'Score, strengths, and prioritized barriers',
    },
    {
      id: 'translate',
      label: 'Accessible Translation',
      icon: <Languages className="w-4 h-4" />,
      desc: 'Culturally respectful, plain language translation',
    },
  ];

  const accessibilityNeeds: Array<{ id: AccessibilityNeed; label: string }> = [
    { id: 'general', label: 'General Accessibility' },
    { id: 'cognitive', label: 'Cognitive & Neurodivergent' },
    { id: 'reading', label: 'Reading & Dyslexia Assistance' },
    { id: 'visual', label: 'Visual & Screen-Reader Focus' },
    { id: 'hearing', label: 'Hearing & Plain Transcripts' },
    { id: 'language', label: 'Language & ESL Learners' },
    { id: 'motor', label: 'Motor & Easy Navigation' },
  ];

  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Telugu', label: 'Telugu (తెలుగు)' },
    { value: 'Hindi', label: 'Hindi (हिन्दी)' },
    { value: 'Spanish', label: 'Spanish (Español)' },
    { value: 'French', label: 'French (Français)' },
    { value: 'German', label: 'German (Deutsch)' },
    { value: 'Japanese', label: 'Japanese (日本語)' },
    { value: 'Arabic', label: 'Arabic (العربية)' },
  ];

  // Voice speech-to-text dictation
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      announce('Speech recognition is not supported in this browser.');
      alert('Speech recognition is not supported by your current browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      announce('Voice dictation stopped');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'Telugu' ? 'te-IN' : language === 'Hindi' ? 'hi-IN' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        announce('Listening. Please speak clearly into your microphone.');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
        announce(`Dictated: ${transcript}`);
      };

      recognition.onerror = () => {
        setIsListening(false);
        announce('Voice dictation error occurred.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  // URL content fetcher
  const handleFetchUrl = async () => {
    if (!urlInput.trim()) return;
    setIsFetchingUrl(true);
    setError(null);
    announce('Fetching and extracting content from URL...');

    try {
      const res = await fetch('/api/transform/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract content from URL');
      }
      setContent(data.content);
      setInputMode('text');
      announce(`Content extracted from ${data.title}`);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch webpage.');
      announce(`Error fetching URL: ${err.message}`);
    } finally {
      setIsFetchingUrl(false);
    }
  };

  // Document upload handler
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
      setInputMode('text');
      announce(`Loaded text document: ${file.name}`);
    };
    reader.readAsText(file);
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImageBase64(base64);
      setSelectedImageName(file.name);
      setTask('image_description');
      setContent(`Image file: ${file.name}. Please describe the content and generate accessibility alt-text.`);
      announce(`Image uploaded: ${file.name}. Set task to Image Description.`);
    };
    reader.readAsDataURL(file);
  };

  // Submit transformation
  const handleTransform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedImageBase64) {
      setError('Please provide content or an image to transform.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);
    setIsSaved(false);
    announce('Processing accessibility transformation. Please wait...');

    try {
      const res = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim() || 'Describing uploaded image',
          task,
          accessibilityNeed,
          language,
          additionalInstructions: additionalInstructions.trim() || undefined,
          imageBase64: selectedImageBase64 || undefined,
          save: !!user,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Transformation failed.');
      }

      setResult(data.data);
      if (data.savedRecord) {
        setIsSaved(true);
      }
      announce('Accessibility transformation completed successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to process request. Please check connection and try again.');
      announce(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getResultTextForCopyOrSpeech = (): string => {
    if (!result) return '';
    if ('result' in result && typeof result.result === 'string') return result.result;
    if ('altText' in result) {
      return `Alt Text: ${result.altText}\n\nDetailed Description: ${result.detailedDescription}`;
    }
    if (result.task === 'accessibility_analysis') {
      const analysis = result as any;
      return `Accessibility Score: ${analysis.accessibilityScore}/100\n\nStrengths:\n${analysis.strengths?.join('\n')}\n\nIssues Identified:\n${analysis.issues?.map((i: any) => `[${i.severity.toUpperCase()}] ${i.issue} -> ${i.recommendation}`).join('\n')}`;
    }
    return '';
  };

  const handleCopy = () => {
    const text = getResultTextForCopyOrSpeech();
    navigator.clipboard.writeText(text);
    setCopied(true);
    announce('Accessible result copied to clipboard.');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleManualSave = async () => {
    if (!user || !result) return;
    try {
      await fetch('/api/transform/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task,
          accessibilityNeed,
          language,
          originalContent: content,
          transformedContent: getResultTextForCopyOrSpeech(),
          explanation: (result as any).explanation || '',
          accessibilityScore: result.accessibilityScore,
          aiSuggestions: result,
        }),
      });
      setIsSaved(true);
      announce('Saved to your transformation history.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageContainer title="Accessibility Workspace">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Transformation Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Accessibility Transformation Workspace
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl">
            Input digital content to produce simplified, screen-reader friendly, or visual-assistive versions with evaluated accessibility estimates.
          </p>
        </div>

        {error && (
          <Alert type="error" title="Notice">
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form Column (Inputs & Controls) */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <form onSubmit={handleTransform} className="space-y-6">
                {/* Content Input Mode Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    1. Choose Input Source
                  </label>
                  <div
                    className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"
                    role="tablist"
                    aria-label="Input content format tabs"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={inputMode === 'text'}
                      onClick={() => setInputMode('text')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                        inputMode === 'text'
                          ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Text Input
                    </button>

                    <button
                      type="button"
                      role="tab"
                      aria-selected={inputMode === 'url'}
                      onClick={() => setInputMode('url')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                        inputMode === 'url'
                          ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Webpage URL
                    </button>

                    <button
                      type="button"
                      role="tab"
                      aria-selected={inputMode === 'document'}
                      onClick={() => setInputMode('document')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                        inputMode === 'document'
                          ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <FileUp className="w-3.5 h-3.5" />
                      Upload File
                    </button>

                    <button
                      type="button"
                      role="tab"
                      aria-selected={inputMode === 'image'}
                      onClick={() => setInputMode('image')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                        inputMode === 'image'
                          ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Image / Alt
                    </button>
                  </div>
                </div>

                {/* Mode: URL input */}
                {inputMode === 'url' && (
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                    <Input
                      label="Webpage URL to make accessible"
                      placeholder="https://example.com/article"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      leftIcon={<Globe className="w-4 h-4" />}
                      helperText="Fetches the webpage, cleans scripts and ads, and extracts readable content."
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      isLoading={isFetchingUrl}
                      onClick={handleFetchUrl}
                      disabled={!urlInput.trim()}
                    >
                      Fetch & Extract Article Text
                    </Button>
                  </div>
                )}

                {/* Mode: Document input */}
                {inputMode === 'document' && (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Upload text document (.txt, .md)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.md,.json,.csv"
                      onChange={handleDocumentUpload}
                      className="hidden"
                      id="document-file-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                )}

                {/* Mode: Image input */}
                {inputMode === 'image' && (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
                    {selectedImageBase64 ? (
                      <div className="space-y-3">
                        <img
                          src={selectedImageBase64}
                          alt="Selected for accessibility analysis"
                          className="max-h-48 mx-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                        />
                        <p className="text-xs text-slate-500 font-medium">{selectedImageName}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedImageBase64(null);
                            setSelectedImageName(null);
                          }}
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Upload image for multimodal vision & alternative text
                        </p>
                        <p className="text-xs text-slate-500">Supports PNG, JPG, WebP</p>
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-file-input"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => imageInputRef.current?.click()}
                        >
                          Select Image File
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {/* Main Text Content Input Area with Voice Dictation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="content-textarea"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    >
                      2. Content to Transform
                    </label>
                    <button
                      type="button"
                      onClick={toggleSpeechRecognition}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                        isListening
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                      aria-label={isListening ? 'Stop speech dictation' : 'Start speech dictation'}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-3.5 h-3.5" /> Stop Dictation
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-brand-600" /> Voice Dictation
                        </>
                      )}
                    </button>
                  </div>

                  <Textarea
                    id="content-textarea"
                    required
                    rows={6}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste or type difficult text, articles, policies, textbook paragraphs, or notices here..."
                    showCharCount
                    maxChars={25000}
                  />
                </div>

                {/* Task Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    3. What do you need help with?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup">
                    {tasks.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        role="radio"
                        aria-checked={task === t.id}
                        onClick={() => {
                          setTask(t.id);
                          announce(`Selected task: ${t.label}`);
                        }}
                        className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                          task === t.id
                            ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 text-brand-950 dark:text-brand-100 ring-2 ring-brand-400'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                            task === t.id
                              ? 'bg-brand-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {t.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs sm:text-sm">{t.label}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                            {t.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accessibility Need & Language Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Primary Accessibility Need"
                    value={accessibilityNeed}
                    onChange={(e) => setAccessibilityNeed(e.target.value as AccessibilityNeed)}
                    options={accessibilityNeeds.map((n) => ({ value: n.id, label: n.label }))}
                  />

                  <Select
                    label="Output Language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    options={languageOptions}
                  />
                </div>

                {/* Additional Instructions */}
                <div>
                  <Input
                    label="Additional Instructions (Optional)"
                    placeholder="e.g., Focus on step-by-step numbers, highlight key dates..."
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    isLoading={isLoading}
                    disabled={!content.trim() && !selectedImageBase64}
                    className="w-full shadow-md"
                    leftIcon={<Sparkles className="w-5 h-5" />}
                  >
                    Generate Accessible Alternative
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Right Results Column */}
          <div className="lg:col-span-5 space-y-6">
            {isLoading ? (
              <Card className="text-center py-20">
                <div className="space-y-4 max-w-xs mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600 mx-auto animate-bounce">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                    Transforming Content...
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Analyzing barriers, evaluating cognitive readability, and creating an inclusive accessible alternative.
                  </p>
                </div>
              </Card>
            ) : result ? (
              <div className="space-y-6">
                {/* Score Card */}
                <AccessibilityScore score={result.accessibilityScore} />

                {/* Main Accessible Result Card */}
                <Card elevated className="border-brand-300 dark:border-brand-700">
                  <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                      <h2 className="font-bold text-slate-900 dark:text-white text-base">
                        Accessible Result
                      </h2>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-2 focus:ring-brand-500"
                        title="Copy accessible text"
                        aria-label="Copy accessible result to clipboard"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      {user && (
                        <button
                          onClick={handleManualSave}
                          disabled={isSaved}
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-2 focus:ring-brand-500 disabled:opacity-40"
                          title={isSaved ? 'Saved to History' : 'Save to History'}
                          aria-label={isSaved ? 'Transformation saved' : 'Save to transformation history'}
                        >
                          <Save className={`w-4 h-4 ${isSaved ? 'text-brand-600' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Audio Speech Player for the Result */}
                  <div className="mb-4">
                    <AudioPlayer
                      text={getResultTextForCopyOrSpeech()}
                      label="Listen to Accessible Output"
                    />
                  </div>

                  {/* Render based on task type */}
                  {result.task === 'simplify' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap font-medium">
                        {(result as any).result}
                      </div>
                      <div className="p-3 rounded-xl bg-brand-50/60 dark:bg-brand-950/40 text-xs text-brand-900 dark:text-brand-200">
                        <strong>Explanation:</strong> {(result as any).explanation}
                      </div>
                    </div>
                  )}

                  {result.task === 'summarize' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
                        {(result as any).result}
                      </div>
                      {(result as any).keyPoints?.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                            Key Takeaways
                          </h3>
                          <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-700 dark:text-slate-300">
                            {(result as any).keyPoints.map((point: string, i: number) => (
                              <li key={i} className="leading-relaxed">
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {result.task === 'explain' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
                        {(result as any).result}
                      </div>
                      {(result as any).importantTerms?.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                            Glossary of Terms Explained
                          </h3>
                          <div className="space-y-2">
                            {(result as any).importantTerms.map((item: any, i: number) => (
                              <div
                                key={i}
                                className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs"
                              >
                                <span className="font-bold text-brand-600 dark:text-brand-400">
                                  {item.term}:{' '}
                                </span>
                                <span className="text-slate-700 dark:text-slate-300">
                                  {item.meaning}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {result.task === 'screen_reader' && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {(result as any).structure?.map((section: any, i: number) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                          >
                            <h3 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
                              {section.heading}
                            </h3>
                            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                              {section.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.task === 'image_description' && (
                    <div className="space-y-4">
                      <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-xs space-y-1">
                        <strong className="text-brand-800 dark:text-brand-300 block">
                          HTML Alt Text (Suitable for alt attribute):
                        </strong>
                        <code className="block bg-white dark:bg-slate-900 p-2 rounded border border-brand-100 dark:border-brand-900 text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                          alt="{(result as any).altText}"
                        </code>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
                        <strong className="block text-xs uppercase tracking-wider text-slate-500 mb-1">
                          Detailed Visual Context:
                        </strong>
                        {(result as any).detailedDescription}
                      </div>
                    </div>
                  )}

                  {result.task === 'accessibility_analysis' && (
                    <div className="space-y-4">
                      {(result as any).strengths?.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                            Accessibility Strengths
                          </h3>
                          <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                            {(result as any).strengths.map((str: string, i: number) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {(result as any).issues?.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">
                            Barriers Identified
                          </h3>
                          <div className="space-y-2">
                            {(result as any).issues.map((iss: any, i: number) => (
                              <div
                                key={i}
                                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {iss.issue}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      iss.severity === 'high'
                                        ? 'bg-red-100 text-red-800'
                                        : iss.severity === 'medium'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}
                                  >
                                    {iss.severity}
                                  </span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400">
                                  <strong>Recommendation:</strong> {iss.recommendation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {result.task === 'translate' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap font-medium">
                        {(result as any).result}
                      </div>
                      <p className="text-xs text-slate-500">
                        Translated from {(result as any).sourceLanguage} to {(result as any).targetLanguage}.
                      </p>
                    </div>
                  )}

                  {/* Suggestions list */}
                  {result.suggestions?.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        Actionable Suggestions
                      </h3>
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                        {result.suggestions.map((sug, i) => (
                          <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                            <span className="text-brand-500 font-bold">•</span>
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              </div>
            ) : (
              <Card className="text-center py-20 border-dashed">
                <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">
                  Ready to Transform
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
                  Fill in your content on the left, pick an accessibility goal, and click Generate.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
