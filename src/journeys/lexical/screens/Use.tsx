import React, { useState } from 'react';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { triggerConfetti, playSuccessSound, playErrorSound } from '../../../lib/confetti';
import { lexicalContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface UseScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const UseScreen: React.FC<UseScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime] = useState(Date.now());
  const [completed, setCompleted] = useState(false);

  const content = lexicalContent[word.id as keyof typeof lexicalContent].use;
  const correctIds = new Set(content.sentences.filter(s => s.isCorrect).map(s => s.id));

  const handleToggle = (id: string) => {
    if (completed) return;

    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    if (selectedIds.size === 0 || completed) return;

    // Check if all correct sentences are selected and no incorrect ones
    const allCorrectSelected = Array.from(correctIds).every(id => selectedIds.has(id));
    const noIncorrectSelected = Array.from(selectedIds).every(id => correctIds.has(id));
    const correct = allCorrectSelected && noIncorrectSelected;

    const newAttempts = attempts + 1;

    setAttempts(newAttempts);
    setIsCorrect(correct);
    setShowFeedback(true);

    log({
      framework: 'lexical',
      wordId: word.id,
      event: 'answer_submit',
      meta: {
        stepId: 'use',
        correct,
        attempts: newAttempts,
        selectedIds: Array.from(selectedIds),
        correctIds: Array.from(correctIds),
      },
    });

    if (correct) {
      playSuccessSound();
      triggerConfetti();
      setCompleted(true);

      setTimeout(() => {
        onComplete({
          stepId: 'use',
          correct: true,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 2000);
    } else {
      playErrorSound();

      if (newAttempts >= 3) {
        setTimeout(() => {
          setCompleted(true);
          setTimeout(() => {
            onComplete({
              stepId: 'use',
              correct: false,
              skipped: false,
              attempts: newAttempts,
              timeSpent: Date.now() - startTime,
            });
          }, 2000);
        }, 1500);
      } else {
        setTimeout(() => {
          setShowFeedback(false);
        }, 1500);
      }
    }
  };

  const handleSkip = () => {
    log({
      framework: 'lexical',
      wordId: word.id,
      event: 'step_skip',
      meta: { stepId: 'use' },
    });

    onComplete({
      stepId: 'use',
      correct: false,
      skipped: true,
      attempts: 0,
      timeSpent: Date.now() - startTime,
    });
  };

  return (
    <div className="card animate-fade-in step-use text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">💬</span>
          Use: Identify Correct Usage Contexts
        </h2>
        <p className="text-gray-700 mb-6">
          Select <strong>ALL</strong> sentences that use <strong className="text-orange-600">{word.english}</strong> correctly.
        </p>

        <div className="mb-6 space-y-3">
          {content.sentences.map((sentence) => {
            const isSelected = selectedIds.has(sentence.id);
            const showAsCorrect = showFeedback && isCorrect && isSelected;
            const showAsIncorrect = showFeedback && !isCorrect && attempts >= 3;

            return (
              <button
                key={sentence.id}
                onClick={() => handleToggle(sentence.id)}
                disabled={completed}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  showAsCorrect
                    ? 'bg-green-50 border-green-500'
                    : showAsIncorrect && correctIds.has(sentence.id)
                    ? 'bg-green-50 border-green-500'
                    : showAsIncorrect && isSelected && !correctIds.has(sentence.id)
                    ? 'bg-red-50 border-red-500'
                    : isSelected
                    ? 'bg-orange-50 border-orange-600'
                    : 'bg-gray-50 border-gray-300 hover:border-orange-400'
                } ${completed ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-orange-600 border-orange-600'
                        : 'border-gray-400 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                        sentence.context === 'Formal'
                          ? 'bg-blue-100 text-blue-800'
                          : sentence.context === 'Informal'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sentence.context}
                    </span>
                    <p className="text-gray-900">{sentence.text}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <FeedbackToast
            type={isCorrect ? 'success' : 'error'}
            message={
              isCorrect
                ? 'Perfect! You identified all correct usages.'
                : attempts >= 3
                ? `The correct sentences were: ${Array.from(correctIds).join(', ')}`
                : 'Not quite. Make sure to select ALL correct sentences and NO incorrect ones.'
            }
          />
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Attempts: {attempts}/3 | Selected: {selectedIds.size}
          </div>
          <div className="flex gap-3">
            <button onClick={handleSkip} className="btn-secondary" disabled={completed}>
              Skip
            </button>
            <button
              onClick={handleSubmit}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedIds.size > 0 && !completed
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={selectedIds.size === 0 || completed}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
