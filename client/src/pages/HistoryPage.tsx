import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Trash2,
  Calendar,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Input } from '../components/ui/Input.js';
import { Select } from '../components/ui/Select.js';
import { Modal } from '../components/ui/Modal.js';
import { LoadingSpinner } from '../components/ui/LoadingSpinner.js';
import { TransformationRecord } from '../../../shared/types/index.js';
import { useAccessibility } from '../context/AccessibilityContext.js';

export const HistoryPage: React.FC = () => {
  const { announce } = useAccessibility();
  const [history, setHistory] = useState<TransformationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTask, setFilterTask] = useState('all');

  // Deletion modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/history/${deleteTargetId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== deleteTargetId));
        announce('Transformation record deleted successfully.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.originalContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.transformedContent || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTask = filterTask === 'all' || item.task === filterTask;
    return matchesSearch && matchesTask;
  });

  return (
    <PageContainer title="Transformation History">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <HistoryIcon className="w-7 h-7 text-brand-600" />
              Transformation History
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Review and manage your saved accessible transformations.
            </p>
          </div>

          <Link to="/accessibility">
            <Button size="md" leftIcon={<Sparkles className="w-4 h-4" />}>
              New Transformation
            </Button>
          </Link>
        </div>

        {/* Filter and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search history by keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div>
            <Select
              value={filterTask}
              onChange={(e) => setFilterTask(e.target.value)}
              options={[
                { value: 'all', label: 'All Tasks' },
                { value: 'simplify', label: 'Simplify Text' },
                { value: 'summarize', label: 'Accessible Summary' },
                { value: 'explain', label: 'Explain Terms' },
                { value: 'screen_reader', label: 'Screen Reader' },
                { value: 'image_description', label: 'Image Description' },
                { value: 'accessibility_analysis', label: 'Accessibility Audit' },
                { value: 'translate', label: 'Translation' },
              ]}
            />
          </div>
        </div>

        {/* History List */}
        {isLoading ? (
          <div className="py-20">
            <LoadingSpinner label="Loading transformation history..." size="lg" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <Card className="text-center py-16">
            <HistoryIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
              {history.length === 0 ? 'No history records found' : 'No matching results'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              {history.length === 0
                ? 'Transformations you run in the workspace will appear here for future reference.'
                : 'Try adjusting your search query or filter selection.'}
            </p>
            {history.length === 0 && (
              <Link to="/accessibility">
                <Button size="md">Start a Transformation</Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <Card
                key={item.id}
                className="hover:border-slate-300 dark:hover:border-slate-600 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200">
                      {item.task.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                      Need: {item.accessibilityNeed}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                    {item.originalContent}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-between md:justify-end">
                  {item.accessibilityScore !== null && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      Score: {item.accessibilityScore}/100
                    </span>
                  )}

                  <Link to={`/history/${item.id}`}>
                    <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Details
                    </Button>
                  </Link>

                  <button
                    onClick={() => setDeleteTargetId(item.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition focus:ring-2 focus:ring-red-500"
                    title="Delete record"
                    aria-label={`Delete transformation from ${new Date(item.createdAt).toLocaleDateString()}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteTargetId}
          onClose={() => setDeleteTargetId(null)}
          title="Delete Transformation Record?"
          description="This action cannot be undone. The record will be permanently deleted from your private history."
        >
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setDeleteTargetId(null)}>
              Cancel
            </Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>
              Delete Record
            </Button>
          </div>
        </Modal>
      </div>
    </PageContainer>
  );
};
