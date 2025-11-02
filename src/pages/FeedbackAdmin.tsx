import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { FeedbackItem } from '../data/feedback';
import {
  loadFeedback,
  exportFeedback,
  importFeedback,
  clearFeedback,
  startFeedbackSync,
  stopFeedbackSync,
} from '../lib/storage';
import { BarChart, StackedBarChart } from '../components/Charts';
import { useAnalytics } from '../hooks/useAnalytics';

interface Filters {
  framework: string | null;
  wordId: string | null;
  stepId: string | null;
  thumb: string | null;
  difficulty: string | null;
}

export const FeedbackAdmin: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [filters, setFilters] = useState<Filters>({
    framework: null,
    wordId: null,
    stepId: null,
    thumb: null,
    difficulty: null,
  });
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importMessage, setImportMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const { log } = useAnalytics();

  // Load feedback on mount and start sync
  useEffect(() => {
    const loadData = async () => {
      const items = await loadFeedback();
      setFeedback(items);
    };

    loadData();
    startFeedbackSync();

    return () => {
      stopFeedbackSync();
    };
  }, []);

  // Extract unique values for dropdowns
  const uniqueFrameworks = Array.from(
    new Set(feedback.map((f) => f.framework))
  ).sort();
  const uniqueWords = Array.from(new Set(feedback.map((f) => f.wordId))).sort();
  const uniqueSteps = Array.from(new Set(feedback.map((f) => f.stepId))).sort();

  // Filter feedback
  const filteredFeedback = feedback.filter((item) => {
    if (filters.framework && item.framework !== filters.framework) return false;
    if (filters.wordId && item.wordId !== filters.wordId) return false;
    if (filters.stepId && item.stepId !== filters.stepId) return false;
    if (filters.thumb && item.thumb !== filters.thumb) return false;
    if (filters.difficulty && item.difficulty !== filters.difficulty)
      return false;
    return true;
  });

  // Calculate stats
  const totalResponses = filteredFeedback.length;
  const thumbsUp = filteredFeedback.filter((f) => f.thumb === 'up').length;
  const thumbsDown = filteredFeedback.filter((f) => f.thumb === 'down').length;
  const thumbsUpPercent =
    totalResponses > 0 ? Math.round((thumbsUp / totalResponses) * 100) : 0;
  const thumbsDownPercent =
    totalResponses > 0 ? Math.round((thumbsDown / totalResponses) * 100) : 0;

  const includeYes = filteredFeedback.filter((f) => f.include === true).length;
  const includeNo = filteredFeedback.filter((f) => f.include === false).length;

  const difficultyScores = filteredFeedback
    .filter((f) => f.difficulty !== null)
    .map((f): number => {
      if (f.difficulty === 'easy') return 1;
      if (f.difficulty === 'medium') return 2;
      if (f.difficulty === 'difficult') return 3;
      return 0;
    });

  const avgDifficulty =
    difficultyScores.length > 0
      ? (
          difficultyScores.reduce((sum: number, val: number) => sum + val, 0) /
          difficultyScores.length
        ).toFixed(2)
      : null;

  // Export handler
  const handleExport = async () => {
    const jsonData = await exportFeedback();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `feedback-export-${timestamp}.json`;

    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    log({
      event: 'feedback_export',
      framework: 'admin',
      wordId: 'admin',
      meta: { count: feedback.length },
    });
  };

  // Import handler
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const result = await importFeedback(content);

      if (result.success) {
        setImportMessage({
          type: 'success',
          text: `Successfully imported ${result.count} feedback items`,
        });
        const items = await loadFeedback();
        setFeedback(items);

        log({
          event: 'feedback_import',
          framework: 'admin',
          wordId: 'admin',
          meta: { count: result.count },
        });
      } else {
        setImportMessage({
          type: 'error',
          text: `Import failed: ${result.error}`,
        });
      }

      setTimeout(() => setImportMessage(null), 5000);
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  // Reset handler
  const handleReset = async () => {
    if (
      window.confirm(
        'Are you sure you want to clear all feedback? This cannot be undone.'
      )
    ) {
      await clearFeedback();
      setFeedback([]);

      log({
        event: 'feedback_reset',
        framework: 'admin',
        wordId: 'admin',
        meta: { count: feedback.length },
      });
    }
  };

  // Clear filters handler
  const handleClearFilters = () => {
    setFilters({
      framework: null,
      wordId: null,
      stepId: null,
      thumb: null,
      difficulty: null,
    });
  };

  // Chart data
  const frameworkChartData = uniqueFrameworks.map((fw) => ({
    label: fw,
    value: filteredFeedback.filter((f) => f.framework === fw).length,
    total: totalResponses,
    color:
      fw === 'blooms'
        ? '#3b82f6'
        : fw === 'cefr'
        ? '#10b981'
        : fw === 'marzano'
        ? '#f59e0b'
        : fw === 'nation'
        ? '#ef4444'
        : '#8b5cf6',
  }));

  const thumbChartData = [
    {
      label: 'Thumbs Up',
      value: thumbsUp,
      total: totalResponses,
      color: '#10b981',
    },
    {
      label: 'Thumbs Down',
      value: thumbsDown,
      total: totalResponses,
      color: '#ef4444',
    },
  ];

  const difficultyChartData = [
    {
      label: 'Easy',
      value: filteredFeedback.filter((f) => f.difficulty === 'easy').length,
      total: totalResponses,
      color: '#10b981',
    },
    {
      label: 'Medium',
      value: filteredFeedback.filter((f) => f.difficulty === 'medium').length,
      total: totalResponses,
      color: '#f59e0b',
    },
    {
      label: 'Difficult',
      value: filteredFeedback.filter((f) => f.difficulty === 'difficult')
        .length,
      total: totalResponses,
      color: '#ef4444',
    },
  ];

  const includeByFrameworkData = uniqueFrameworks.map((fw) => {
    const frameworkItems = filteredFeedback.filter(
      (f) => f.framework === fw
    );
    return {
      label: fw,
      segments: [
        {
          label: 'Yes',
          value: frameworkItems.filter((f) => f.include === true).length,
          color: '#10b981',
        },
        {
          label: 'No',
          value: frameworkItems.filter((f) => f.include === false).length,
          color: '#ef4444',
        },
        {
          label: 'N/A',
          value: frameworkItems.filter((f) => f.include === null).length,
          color: '#9ca3af',
        },
      ],
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Feedback Dashboard
          </h1>
        </div>

        {/* Actions Row */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Export JSON
            </button>

            <button
              onClick={() => setShowImportDialog(!showImportDialog)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Import JSON
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reset All
            </button>
          </div>

          {/* Import Dialog */}
          {showImportDialog && (
            <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <label
                htmlFor="import-file"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select JSON file to import:
              </label>
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImport}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
              />
            </div>
          )}

          {/* Import Message */}
          {importMessage && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                importMessage.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {importMessage.text}
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label
                htmlFor="filter-framework"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Framework
              </label>
              <select
                id="filter-framework"
                value={filters.framework || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    framework: e.target.value || null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                {uniqueFrameworks.map((fw) => (
                  <option key={fw} value={fw}>
                    {fw}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="filter-word"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Word
              </label>
              <select
                id="filter-word"
                value={filters.wordId || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    wordId: e.target.value || null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                {uniqueWords.map((word) => (
                  <option key={word} value={word}>
                    {word}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="filter-step"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Step
              </label>
              <select
                id="filter-step"
                value={filters.stepId || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    stepId: e.target.value || null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                {uniqueSteps.map((step) => (
                  <option key={step} value={step}>
                    {step}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="filter-thumb"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Thumb
              </label>
              <select
                id="filter-thumb"
                value={filters.thumb || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    thumb: e.target.value || null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="up">Up</option>
                <option value="down">Down</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="filter-difficulty"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Difficulty
              </label>
              <select
                id="filter-difficulty"
                value={filters.difficulty || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    difficulty: e.target.value || null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="difficult">Difficult</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleClearFilters}
            className="mt-4 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Total Responses
            </h3>
            <p className="text-3xl font-bold text-gray-900">{totalResponses}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Thumbs Up
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {thumbsUp}{' '}
              <span className="text-lg text-gray-500">({thumbsUpPercent}%)</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Thumbs Down
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {thumbsDown}{' '}
              <span className="text-lg text-gray-500">
                ({thumbsDownPercent}%)
              </span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Average Difficulty
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {avgDifficulty || 'N/A'}
            </p>
            {avgDifficulty && (
              <p className="text-sm text-gray-500 mt-1">
                {difficultyScores.length} responses
              </p>
            )}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Include Yes
            </h3>
            <p className="text-3xl font-bold text-green-600">{includeYes}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Include No
            </h3>
            <p className="text-3xl font-bold text-red-600">{includeNo}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <BarChart
              data={frameworkChartData}
              title="Responses by Framework"
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <BarChart data={thumbChartData} title="Thumbs Up vs Down" />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <BarChart
              data={difficultyChartData}
              title="Difficulty Distribution"
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <StackedBarChart
              data={includeByFrameworkData}
              title="Include Yes/No by Framework"
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              All Feedback ({filteredFeedback.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Framework
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Word
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Step
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thumb
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Include
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFeedback.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No feedback data available
                    </td>
                  </tr>
                ) : (
                  filteredFeedback.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.ts).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.framework}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.wordId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.stepLabel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.thumb === 'up'
                          ? '👍'
                          : item.thumb === 'down'
                          ? '👎'
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.include === true
                          ? '✓'
                          : item.include === false
                          ? '✗'
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.difficulty || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {item.comment
                          ? item.comment.length > 50
                            ? `${item.comment.substring(0, 50)}...`
                            : item.comment
                          : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
