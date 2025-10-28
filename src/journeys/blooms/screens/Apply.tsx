import React, { useState } from 'react';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { triggerConfetti, playSuccessSound, playErrorSound } from '../../../lib/confetti';
import { bloomsContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface ApplyScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const ApplyScreen: React.FC<ApplyScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  const content = bloomsContent[word.id as keyof typeof bloomsContent].apply;

  const handleSubmit = () => {
    if (!answer.trim() || completed) return;

    const normalizedAnswer = answer.trim().toLowerCase();
    const isCorrect = normalizedAnswer === content.correctAnswer.toLowerCase();
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    log({
      framework: 'blooms',
      wordId: word.id,
      event: 'answer_submit',
      meta: { stepId: 'apply', answer: normalizedAnswer, attempt: newAttempts },
    });

    log({
      framework: 'blooms',
      wordId: word.id,
      event: 'answer_result',
      meta: { stepId: 'apply', correct: isCorrect, attempts: newAttempts },
    });

    if (isCorrect) {
      setCompleted(true);
      setFeedbackMessage('Perfect! You applied the word correctly in context! 🎉');
      setFeedbackType('success');
      setShowFeedback(true);

      // Celebration effects
      triggerConfetti();
      playSuccessSound();

      setTimeout(() => {
        onComplete({
          stepId: 'apply',
          correct: true,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 2000);
    } else if (newAttempts >= 3) {
      setCompleted(true);
      setFeedbackMessage(`The correct answer is "${content.correctAnswer}". Great effort!`);
      setFeedbackType('info');
      setShowFeedback(true);

      setTimeout(() => {
        onComplete({
          stepId: 'apply',
          correct: false,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 3000);
    } else {
      setFeedbackMessage(`Not quite. Try selecting from the word bank! ${3 - newAttempts} ${3 - newAttempts === 1 ? 'try' : 'tries'} left.`);
      setFeedbackType('error');
      setShowFeedback(true);
      setAnswer('');

      // Error feedback
      playErrorSound();
    }
  };

  const handleSkip = () => {
    log({
      framework: 'blooms',
      wordId: word.id,
      event: 'step_skip',
      meta: { stepId: 'apply' },
    });

    onComplete({
      stepId: 'apply',
      correct: false,
      skipped: true,
      attempts,
      timeSpent: Date.now() - startTime,
    });
  };

  return (
    <div className="card animate-fade-in step-apply text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">🎯</span>
          Step 3: Apply
        </h2>
        <p className="text-gray-700 mb-6">Fill in the blank with the correct word from the word bank.</p>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200 animate-bounce-in">
          <p className="text-lg">{content.sentence.replace('_____', '______')}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Word Bank:</label>
          <div className="flex gap-2 flex-wrap">
            {content.wordBank.map((w) => (
              <button
                key={w}
                onClick={() => setAnswer(w)}
                disabled={completed}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  answer === w
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white border-gray-300 hover:border-blue-400'
                } disabled:opacity-50`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={completed}
            placeholder="Type or select a word..."
            className="input-field"
            aria-label="Your answer"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={handleSkip} className="btn-secondary" disabled={completed}>
            Skip
          </button>
          <button
            onClick={handleSubmit}
            className={`btn-primary ${!answer.trim() || completed ? '' : 'animate-pulse-gentle'}`}
            disabled={!answer.trim() || completed}
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
