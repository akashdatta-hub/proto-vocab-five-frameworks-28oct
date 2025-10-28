import React, { useState } from 'react';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { triggerConfetti, playSuccessSound, playErrorSound } from '../../../lib/confetti';
import { bloomsContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface AnalyzeScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const AnalyzeScreen: React.FC<AnalyzeScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  const content = bloomsContent[word.id as keyof typeof bloomsContent].analyze;

  const toggleWord = (w: string) => {
    if (completed) return;
    setSelectedWords((prev) =>
      prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]
    );
  };

  const handleSubmit = () => {
    if (selectedWords.length === 0 || completed) return;

    const correctSelections = selectedWords.filter((w) => content.synonyms.includes(w));
    const isCorrect = correctSelections.length >= content.synonyms.length;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    log({
      framework: 'blooms',
      wordId: word.id,
      event: 'answer_submit',
      meta: { stepId: 'analyze', selected: selectedWords, attempt: newAttempts },
    });

    log({
      framework: 'blooms',
      wordId: word.id,
      event: 'answer_result',
      meta: { stepId: 'analyze', correct: isCorrect, attempts: newAttempts },
    });

    if (isCorrect) {
      setCompleted(true);
      setFeedbackMessage('Excellent analysis! You identified the related words correctly! 🎉');
      setFeedbackType('success');
      setShowFeedback(true);

      // Celebration effects
      triggerConfetti();
      playSuccessSound();

      setTimeout(() => {
        onComplete({
          stepId: 'analyze',
          correct: true,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 2000);
    } else if (newAttempts >= 3) {
      setCompleted(true);
      setFeedbackMessage(
        `The related words are: ${content.synonyms.join(', ')}. Good thinking!`
      );
      setFeedbackType('info');
      setShowFeedback(true);

      setTimeout(() => {
        onComplete({
          stepId: 'analyze',
          correct: false,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 3000);
    } else {
      setFeedbackMessage(
        `Not all correct. Think about which words are similar to "${word.english}"! ${3 - newAttempts} ${3 - newAttempts === 1 ? 'try' : 'tries'} left.`
      );
      setFeedbackType('error');
      setShowFeedback(true);
      setSelectedWords([]);

      // Error feedback
      playErrorSound();
    }
  };

  const handleSkip = () => {
    log({
      framework: 'blooms',
      wordId: word.id,
      event: 'step_skip',
      meta: { stepId: 'analyze' },
    });

    onComplete({
      stepId: 'analyze',
      correct: false,
      skipped: true,
      attempts,
      timeSpent: Date.now() - startTime,
    });
  };

  return (
    <div className="card animate-fade-in step-analyze text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">🔍</span>
          Step 4: Analyze
        </h2>
        <p className="text-gray-700 mb-6">
          Select words that are related or similar to "{word.english}".
        </p>

        <div className="mb-6 grid grid-cols-2 gap-3 animate-bounce-in">
        {content.allWords.map((w) => {
          const isSelected = selectedWords.includes(w);
          return (
            <button
              key={w}
              onClick={() => toggleWord(w)}
              disabled={completed}
              className={`p-4 rounded-lg border-2 transition-all text-center ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white border-gray-300 hover:border-blue-400'
              } disabled:opacity-50`}
            >
              {w}
            </button>
          );
        })}
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={handleSkip} className="btn-secondary" disabled={completed}>
            Skip
          </button>
          <button
            onClick={handleSubmit}
            className={`btn-primary ${selectedWords.length === 0 || completed ? '' : 'animate-pulse-gentle'}`}
            disabled={selectedWords.length === 0 || completed}
          >
            Submit
          </button>
        </div>
      </div>

      {showFeedback && (
        <FeedbackToast
          message={feedbackMessage}
          type={feedbackType}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
};
