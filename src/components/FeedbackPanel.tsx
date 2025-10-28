import React, { useState, useEffect, useRef } from 'react';
import type { Thumb, Difficulty } from '../data/feedback';
import { createFeedbackItem } from '../data/feedback';
import { addFeedbackItem } from '../lib/storage';
import { useAnalytics } from '../hooks/useAnalytics';
import { FeedbackControls } from './FeedbackControls';

interface FeedbackPanelProps {
  isOpen: boolean;
  onClose: () => void;
  framework: string;
  wordId: string;
  stepId: string;
  stepLabel: string;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  isOpen,
  onClose,
  framework,
  wordId,
  stepId,
  stepLabel,
}) => {
  const { log } = useAnalytics();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Form state
  const [thumb, setThumb] = useState<Thumb>(null);
  const [include, setInclude] = useState<boolean | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(null);
  const [comment, setComment] = useState('');

  // Log panel open/close events
  useEffect(() => {
    if (isOpen) {
      log({
        framework,
        wordId,
        event: 'feedback_open',
        meta: { stepId, stepLabel },
      });
    } else {
      log({
        framework,
        wordId,
        event: 'feedback_close',
        meta: { stepId, stepLabel },
      });
    }
  }, [isOpen, framework, wordId, stepId, stepLabel, log]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const panel = panelRef.current;
    if (!panel) return;

    const focusableElements = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);

    // Focus close button on open
    closeButtonRef.current?.focus();

    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  const handleSave = () => {
    const feedbackItem = createFeedbackItem({
      framework,
      wordId,
      stepId,
      stepLabel,
      thumb,
      include,
      difficulty,
      comment,
    });

    addFeedbackItem(feedbackItem);

    log({
      framework,
      wordId,
      event: 'feedback_submit',
      meta: {
        stepId,
        stepLabel,
        thumb,
        include,
        difficulty,
        hasComment: comment.length > 0,
      },
    });

    handleClear();
    onClose();
  };

  const handleClear = () => {
    setThumb(null);
    setInclude(null);
    setDifficulty(null);
    setComment('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Dark overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-panel-header"
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2
            id="feedback-panel-header"
            className="text-lg font-semibold text-gray-900"
          >
            {framework} • {wordId} • {stepLabel}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close feedback panel"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form content */}
        <div className="flex-1 overflow-y-auto p-4">
          <FeedbackControls
            thumb={thumb}
            setThumb={setThumb}
            include={include}
            setInclude={setInclude}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            comment={comment}
            setComment={setComment}
          />
        </div>

        {/* Footer buttons */}
        <div className="p-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleClear}
            className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
