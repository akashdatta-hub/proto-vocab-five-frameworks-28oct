import React, { useState } from 'react';
import { WritePad } from '../../../components/WritePad';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { triggerConfetti, playSuccessSound, playErrorSound } from '../../../lib/confetti';
import { marzanoContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface RestateScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const RestateScreen: React.FC<RestateScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  const content = marzanoContent[word.id as keyof typeof marzanoContent].restate;

  const validateAnswer = (text: string): { valid: boolean; reason?: string } => {
    const normalized = text.trim().toLowerCase();

    if (normalized.length === 0) {
      return { valid: false, reason: 'Please write your explanation.' };
    }

    const words = normalized.split(/\s+/);
    if (words.length < 3) {
      return { valid: false, reason: 'Please write at least 3 words.' };
    }

    const hasKeyWords = content.keyWords.some((kw) => normalized.includes(kw.toLowerCase()));
    if (!hasKeyWords) {
      return {
        valid: true,
        reason: `Good! Try using words like: ${content.keyWords.join(', ')}`,
      };
    }

    return { valid: true };
  };

  const handleSubmit = () => {
    if (!answer.trim() || completed) return;

    const validation = validateAnswer(answer);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    log({
      framework: 'marzano',
      wordId: word.id,
      event: 'answer_submit',
      meta: { stepId: 'restate', length: answer.trim().length, attempt: newAttempts },
    });

    log({
      framework: 'marzano',
      wordId: word.id,
      event: 'answer_result',
      meta: { stepId: 'restate', correct: validation.valid, attempts: newAttempts },
    });

    if (validation.valid) {
      setCompleted(true);
      setFeedbackMessage(validation.reason || 'Excellent! You restated the meaning well! 🎉');
      setFeedbackType('success');
      setShowFeedback(true);

      triggerConfetti();
      playSuccessSound();

      setTimeout(() => {
        onComplete({
          stepId: 'restate',
          correct: true,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 2000);
    } else if (newAttempts >= 3) {
      setCompleted(true);
      setFeedbackMessage(validation.reason || 'Good effort! Keep practicing.');
      setFeedbackType('info');
      setShowFeedback(true);

      setTimeout(() => {
        onComplete({
          stepId: 'restate',
          correct: false,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 3000);
    } else {
      setFeedbackMessage(`${validation.reason} ${3 - newAttempts} ${3 - newAttempts === 1 ? 'try' : 'tries'} left.`);
      setFeedbackType('error');
      setShowFeedback(true);
      playErrorSound();
    }
  };

  const handleSkip = () => {
    log({
      framework: 'marzano',
      wordId: word.id,
      event: 'step_skip',
      meta: { stepId: 'restate' },
    });

    onComplete({
      stepId: 'restate',
      correct: false,
      skipped: true,
      attempts,
      timeSpent: Date.now() - startTime,
    });
  };

  return (
    <div className="card animate-fade-in step-restate text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">✍️</span>
          Step 2: Restate
        </h2>
        <p className="text-gray-700 mb-6">{content.prompt}</p>

        <div className="mb-6 animate-bounce-in">
          <WritePad
            value={answer}
            onChange={setAnswer}
            placeholder="Explain in your own words..."
            disabled={completed}
            label="Your explanation"
            maxLength={200}
            rows={4}
          />
        </div>

        <div className="mb-4 text-sm text-gray-600">
          <p>💡 Try using these words: {content.keyWords.join(', ')}</p>
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
