import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Copy,
  Check,
  Trash2,
  Share2,
  FileText,
  Printer,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Modal } from '../components/ui/Modal.js';
import { LoadingSpinner } from '../components/ui/LoadingSpinner.js';
import { AccessibilityScore } from '../components/ui/AccessibilityScore.js';
import { AudioPlayer } from '../components/ui/AudioPlayer.js';
import { TransformationRecord } from '../../../shared/types/index.js';
import { useAccessibility } from '../context/AccessibilityContext.js';

export const HistoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { announce } = useAccessibility();

  const [transformation, setTransformation] = useState<TransformationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await fetch(`/api/history/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTransformation(data.transformation);
        } else {
          navigate('/history', { replace: true });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchRecord();
  }, [id, navigate]);

  const handleCopy = () => {
    if (!transformation?.transformedContent) return;
    navigator.clipboard.writeText(transformation.transformedContent);
    setCopied(true);
    announce('Accessible output copied to clipboard.');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        announce('Transformation deleted.');
        navigate('/history');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <PageContainer title="Transformation Details">
        <div className="py-24">
          <LoadingSpinner label="Loading transformation details..." size="lg" />
        </div>
      </PageContainer>
    );
  }

  if (!transformation) {
    return (
      <PageContainer title="Not Found">
        <div className="max-w-md mx-auto py-20 text-center space-y-4">
          <h2 className="text-xl font-bold">Record Not Found</h2>
          <Link to="/history">
            <Button size="md">Return to History</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Transformation Details">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 focus:ring-2 focus:ring-brand-500 rounded p-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to History
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
              Print / Save PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
              onClick={() => setShowDeleteModal(true)}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Overview Bar */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200">
                {transformation.task.replace('_', ' ')}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 capitalize">
                Need: {transformation.accessibilityNeed}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                Language: {transformation.language}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 pt-1">
              <Calendar className="w-3.5 h-3.5" /> Created on{' '}
              {new Date(transformation.createdAt).toLocaleString()}
            </p>
          </div>

          {transformation.accessibilityScore !== null && (
            <div className="w-full sm:w-64">
              <AccessibilityScore score={transformation.accessibilityScore} showDetails={false} />
            </div>
          )}
        </div>

        {/* Audio Speech Player */}
        {transformation.transformedContent && (
          <AudioPlayer
            text={transformation.transformedContent}
            label="Listen to Accessible Content"
          />
        )}

        {/* Side by Side Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Original Content Card */}
          <Card>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200 dark:border-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" aria-hidden="true" />
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Original Input Content
              </h2>
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {transformation.originalContent}
            </div>
          </Card>

          {/* Transformed Output Card */}
          <Card elevated className="border-brand-300 dark:border-brand-700">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                <h2 className="font-bold text-slate-900 dark:text-white text-base">
                  Accessible Version
                </h2>
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition focus:ring-2 focus:ring-brand-500"
                aria-label="Copy accessible version"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap p-4 rounded-xl bg-brand-50/30 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900">
              {transformation.transformedContent}
            </div>

            {transformation.explanation && (
              <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <strong className="block text-slate-800 dark:text-slate-200 mb-1">
                  Accessibility Explanation:
                </strong>
                {transformation.explanation}
              </div>
            )}
          </Card>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Transformation?"
          description="Are you sure you want to delete this historical record? This action cannot be reversed."
        >
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>
              Confirm Delete
            </Button>
          </div>
        </Modal>
      </div>
    </PageContainer>
  );
};
