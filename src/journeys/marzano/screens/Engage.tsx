import React, { useState } from 'react';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { triggerConfetti, playSuccessSound, playErrorSound } from '../../../lib/confetti';
import { marzanoContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface EngageScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const EngageScreen: React.FC<EngageScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [selectedExamples, setSelectedExamples] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  const content = marzanoContent[word.id as keyof typeof marzanoContent].engage;

  const toggleExample = (exampleId: string) => {
    if (completed) return;
    setSelectedExamples((prev) =>
      prev.includes(exampleId) ? prev.filter((x) => x !== exampleId) : [...prev, exampleId]
    );
  };

  const handleSubmit = () => {
    if (selectedExamples.length === 0 || completed) return;

    const correctExamples = content.examples.filter((ex) => ex.isCorrect);
    const correctIds = correctExamples.map((ex) => ex.id);
    const allCorrectSelected = correctIds.every((id) => selectedExamples.includes(id));
    const noIncorrectSelected = selectedExamples.every((id) => correctIds.includes(id));
    const isCorrect = allCorrectSelected && noIncorrectSelected;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    log({
      framework: 'marzano',
      wordId: word.id,
      event: 'answer_submit',
      meta: { stepId: 'engage', selected: selectedExamples, attempt: newAttempts },
    });

    log({
      framework: 'marzano',
      wordId: word.id,
      event: 'answer_result',
      meta: { stepId: 'engage', correct: isCorrect, attempts: newAttempts },
    });

    if (isCorrect) {
      setCompleted(true);
      setFeedbackMessage('Perfect! You identified all the correct examples!');
      setFeedbackType('success');
      setShowFeedback(true);

      triggerConfetti();
      playSuccessSound();

      setTimeout(() => {
        onComplete({
          stepId: 'engage',
          correct: true,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 2000);
    } else if (newAttempts >= 3) {
      setCompleted(true);
      const correctTexts = correctExamples.map((ex) => `"${ex.text}"`).join(', ');
      setFeedbackMessage(
        `The correct examples are: ${correctTexts}. Good effort!`
      );
      setFeedbackType('info');
      setShowFeedback(true);

      setTimeout(() => {
        onComplete({
          stepId: 'engage',
          correct: false,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 3000);
    } else {
      setFeedbackMessage(
        `Not quite. Think about which examples use "${word.english}" correctly! ${3 - newAttempts} ${3 - newAttempts === 1 ? 'try' : 'tries'} left.`
      );
      setFeedbackType('error');
      setShowFeedback(true);
      setSelectedExamples([]);

      playErrorSound();
    }
  };

  const handleSkip = () => {
    log({
      framework: 'marzano',
      wordId: word.id,
      event: 'step_skip',
      meta: { stepId: 'engage' },
    });

    onComplete({
      stepId: 'engage',
      correct: false,
      skipped: true,
      attempts,
      timeSpent: Date.now() - startTime,
    });
  };

  return (
    <div className="card animate-fade-in step-engage text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">🎯</span>
          Step 4: Engage
        </h2>
        <p className="text-gray-700 mb-6">
          Select all the sentences that use "{word.english}" correctly.
        </p>

        <div className="mb-6 space-y-3 animate-bounce-in">
          {content.examples.map((example) => {
            const isSelected = selectedExamples.includes(example.id);
            return (
              <button
                key={example.id}
                onClick={() => toggleExample(example.id)}
                disabled={completed}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-green-50 border-green-200 hover:border-green-400'
                } disabled:opacity-50`}
              >
                {example.text}
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
            className={`btn-primary ${selectedExamples.length === 0 || completed ? '' : 'animate-pulse-gentle'}`}
            disabled={selectedExamples.length === 0 || completed}
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
